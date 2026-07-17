from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from .. import models, schemas, deps
from typing import Optional

router = APIRouter(
    prefix="/api/zones/{zone_id}/records",
    tags=["records"],
    dependencies=[Depends(deps.get_current_user)]
)

@router.get("", response_model=schemas.PaginatedRecords)
def get_records(
    zone_id: str,
    search: Optional[str] = None,
    type: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(deps.get_db)
):
    # Verify zone exists
    if not db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first():
        raise HTTPException(status_code=404, detail="Hosted Zone not found")

    query = db.query(models.Record).filter(models.Record.zone_id == zone_id)
    if search:
        query = query.filter(models.Record.name.ilike(f"%{search}%"))
    if type:
        query = query.filter(models.Record.type == type.upper())
    
    total = query.count()
    items = query.order_by(models.Record.type.asc(), models.Record.name.asc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.post("", response_model=schemas.Record)
def create_record(zone_id: str, record_in: schemas.RecordCreate, db: Session = Depends(deps.get_db)):
    if not db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first():
        raise HTTPException(status_code=404, detail="Hosted Zone not found")
        
    # Check if record with same name and type already exists (except for multi-value which is handled in frontend by newline separated, but Route53 technically allows multiple for some or combines them. For simplicity, we just check exact name/type conflict if it's CNAME or if we just assume uniqueness per name+type)
    existing = db.query(models.Record).filter(
        models.Record.zone_id == zone_id,
        models.Record.name == record_in.name,
        models.Record.type == record_in.type
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"A {record_in.type} record for {record_in.name} already exists.")
        
    if record_in.type == "CNAME":
        # CNAME cannot coexist with any other record types for the same name
        other_types = db.query(models.Record).filter(
            models.Record.zone_id == zone_id,
            models.Record.name == record_in.name
        ).first()
        if other_types:
            raise HTTPException(status_code=400, detail="CNAME records cannot coexist with other records for the same name.")

    db_record = models.Record(
        zone_id=zone_id,
        name=record_in.name,
        type=record_in.type,
        ttl=record_in.ttl,
        value=record_in.value,
        routing_policy=record_in.routing_policy,
        is_default=False
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.put("/{record_id}", response_model=schemas.Record)
def update_record(zone_id: str, record_id: int, record_in: schemas.RecordUpdate, db: Session = Depends(deps.get_db)):
    record = db.query(models.Record).filter(
        models.Record.id == record_id,
        models.Record.zone_id == zone_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    if record.is_default:
        raise HTTPException(status_code=403, detail="Cannot modify default NS or SOA records directly.")
        
    if record_in.name is not None:
        record.name = record_in.name
    if record_in.type is not None:
        record.type = record_in.type
    if record_in.ttl is not None:
        record.ttl = record_in.ttl
    if record_in.value is not None:
        record.value = record_in.value
    if record_in.routing_policy is not None:
        record.routing_policy = record_in.routing_policy
        
    # Technically, we should re-validate if type/value changed, but Pydantic schemas handle the initial parse. 
    # Since we are setting directly on ORM, we rely on the schema validation during request parsing.
    
    db.commit()
    db.refresh(record)
    return record

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(zone_id: str, record_id: int, db: Session = Depends(deps.get_db)):
    record = db.query(models.Record).filter(
        models.Record.id == record_id,
        models.Record.zone_id == zone_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    if record.is_default:
        raise HTTPException(status_code=403, detail="Cannot delete default NS or SOA records.")
        
    db.delete(record)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
