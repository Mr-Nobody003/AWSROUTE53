import re
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import Response
from sqlalchemy.orm import Session
from .. import models, schemas, deps
from typing import Optional
import json

router = APIRouter(
    prefix="/api/v1/zones/{zone_id}",
    tags=["import_export"],
    dependencies=[Depends(deps.get_current_user)]
)

@router.get("/export", response_class=Response)
def export_zone(zone_id: str, format: str = "json", db: Session = Depends(deps.get_db)):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted Zone not found")
        
    records = db.query(models.Record).filter(models.Record.zone_id == zone_id).all()
    
    if format.lower() == "json":
        data = {
            "zone": schemas.HostedZone.from_orm(zone).dict(),
            "records": [schemas.Record.from_orm(r).dict() for r in records]
        }
        # JSON serialize with datetime handling
        json_data = json.dumps(data, default=str, indent=2)
        return Response(content=json_data, media_type="application/json", headers={
            "Content-Disposition": f"attachment; filename={zone.name}.json"
        })
        
    elif format.lower() == "bind":
        lines = [f"; BIND export for {zone.name}", f"$ORIGIN {zone.name}.", ""]
        for r in records:
            name = r.name if r.name != zone.name else "@"
            if name.endswith(f".{zone.name}"):
                name = name[:-(len(zone.name)+1)]
            for val_line in r.value.split('\n'):
                lines.append(f"{name}\t{r.ttl}\tIN\t{r.type}\t{val_line}")
        
        bind_data = "\n".join(lines)
        return Response(content=bind_data, media_type="text/plain", headers={
            "Content-Disposition": f"attachment; filename={zone.name}.zone"
        })
    
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use 'json' or 'bind'.")

@router.post("/import", status_code=status.HTTP_201_CREATED)
async def import_zone(zone_id: str, file: UploadFile = File(...), db: Session = Depends(deps.get_db)):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted Zone not found")
        
    content = await file.read()
    text = content.decode('utf-8')
    
    records_to_add = []
    
    # Very basic BIND parser
    # Format: NAME TTL CLASS TYPE VALUE
    # Ignores multi-line SOA and complex BIND directives for simplicity in this clone
    
    origin = f"{zone.name}."
    ttl_default = 300
    
    for line in text.split('\n'):
        line = line.split(';')[0].strip() # strip comments
        if not line:
            continue
            
        if line.startswith('$ORIGIN'):
            parts = line.split()
            if len(parts) > 1:
                origin = parts[1]
            continue
        if line.startswith('$TTL'):
            parts = line.split()
            if len(parts) > 1 and parts[1].isdigit():
                ttl_default = int(parts[1])
            continue
            
        parts = line.split()
        if len(parts) < 4:
            continue
            
        name = parts[0]
        if name == "@":
            name = origin.rstrip('.')
        elif not name.endswith('.'):
            name = f"{name}.{origin}".rstrip('.')
        else:
            name = name.rstrip('.')
            
        # Optional TTL and CLASS (IN) handling
        ttl = ttl_default
        record_class = "IN"
        type_idx = 1
        
        if parts[1].isdigit():
            ttl = int(parts[1])
            type_idx = 2
            if len(parts) > 2 and parts[2].upper() == "IN":
                type_idx = 3
        elif parts[1].upper() == "IN":
            type_idx = 2
            if len(parts) > 2 and parts[2].isdigit():
                ttl = int(parts[2])
                type_idx = 3
                
        if type_idx >= len(parts):
            continue
            
        record_type = parts[type_idx].upper()
        value = " ".join(parts[type_idx+1:])
        
        if record_type not in ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "PTR", "CAA"]:
            continue
            
        # Simple duplicate check - in reality, we'd combine multi-values or fail
        existing = db.query(models.Record).filter(
            models.Record.zone_id == zone_id,
            models.Record.name == name,
            models.Record.type == record_type
        ).first()
        
        if existing:
            # For this clone, append to value if multi-value is supported by frontend newline
            if record_type != "CNAME":
                if value not in existing.value.split('\n'):
                    existing.value += f"\n{value}"
        else:
            # We don't want to create NS/SOA defaults this way
            if record_type not in ["NS", "SOA"]:
                new_record = models.Record(
                    zone_id=zone_id,
                    name=name,
                    type=record_type,
                    ttl=ttl,
                    value=value,
                    routing_policy="simple",
                    is_default=False
                )
                db.add(new_record)
                
    db.commit()
    return {"message": "Zone imported successfully"}
