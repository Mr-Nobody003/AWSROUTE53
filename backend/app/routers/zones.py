from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from .. import models, schemas, deps
from typing import Optional

router = APIRouter(
    prefix="/api/v1/zones",
    tags=["zones"],
    dependencies=[Depends(deps.get_current_user)]
)

@router.get("", response_model=schemas.PaginatedHostedZones)
def get_zones(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(deps.get_db)
):
    query = db.query(models.HostedZone)
    if search:
        query = query.filter(models.HostedZone.name.ilike(f"%{search}%"))
    
    total = query.count()
    items = query.order_by(models.HostedZone.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.post("", response_model=schemas.HostedZone)
def create_zone(zone_in: schemas.HostedZoneCreate, db: Session = Depends(deps.get_db)):
    if db.query(models.HostedZone).filter(models.HostedZone.name == zone_in.name).first():
        raise HTTPException(status_code=400, detail="Zone with this name already exists")
    
    db_zone = models.HostedZone(name=zone_in.name, type=zone_in.type, comment=zone_in.comment)
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)

    # Auto-create NS and SOA records
    ns_record = models.Record(
        zone_id=db_zone.id,
        name=db_zone.name,
        type="NS",
        ttl=172800,
        value="ns-1536.awsdns-64.org\nns-0.awsdns-00.com\nns-1024.awsdns-00.co.uk\nns-512.awsdns-00.net",
        is_default=True
    )
    soa_record = models.Record(
        zone_id=db_zone.id,
        name=db_zone.name,
        type="SOA",
        ttl=900,
        value="ns-1536.awsdns-64.org. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
        is_default=True
    )
    db.add_all([ns_record, soa_record])
    db.commit()

    return db_zone

@router.get("/{zone_id}", response_model=schemas.HostedZone)
def get_zone(zone_id: str, db: Session = Depends(deps.get_db)):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted Zone not found")
    return zone

@router.put("/{zone_id}", response_model=schemas.HostedZone)
def update_zone(zone_id: str, zone_in: schemas.HostedZoneUpdate, db: Session = Depends(deps.get_db)):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted Zone not found")
    
    if zone_in.type is not None:
        zone.type = zone_in.type
    if zone_in.comment is not None:
        zone.comment = zone_in.comment
        
    db.commit()
    db.refresh(zone)
    return zone

@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_zone(zone_id: str, force: bool = False, db: Session = Depends(deps.get_db)):
    zone = db.query(models.HostedZone).filter(models.HostedZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Hosted Zone not found")
    
    if not force:
        non_default_records = db.query(models.Record).filter(
            models.Record.zone_id == zone_id,
            models.Record.is_default == False
        ).count()
        if non_default_records > 0:
            raise HTTPException(
                status_code=409, 
                detail="Before you can delete a hosted zone, you must first delete all resource record sets that were created for the hosted zone, except for the default NS and SOA records."
            )
    
    db.delete(zone)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
