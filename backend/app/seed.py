from sqlalchemy.orm import Session
from . import models, schemas, auth

def seed_db(db: Session):
    # Check if admin user exists
    user = db.query(models.User).filter(models.User.username == "admin").first()
    if not user:
        hashed_password = auth.get_password_hash("Admin@123")
        admin_user = models.User(username="admin", password_hash=hashed_password)
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        # Create a sample hosted zone
        sample_zone = models.HostedZone(name="example.com", type="Public", comment="Sample zone")
        db.add(sample_zone)
        db.commit()
        db.refresh(sample_zone)

        # Create default NS and SOA records for the sample zone
        ns_record = models.Record(
            zone_id=sample_zone.id,
            name="example.com",
            type="NS",
            ttl=172800,
            value="ns1.cloudroute.net\nns2.cloudroute.net\nns3.cloudroute.net\nns4.cloudroute.net",
            is_default=True
        )
        soa_record = models.Record(
            zone_id=sample_zone.id,
            name="example.com",
            type="SOA",
            ttl=900,
            value="ns1.cloudroute.net. hostmaster.cloudroute.net. 1 7200 900 1209600 86400",
            is_default=True
        )
        
        # Add a sample A record
        a_record = models.Record(
            zone_id=sample_zone.id,
            name="www.example.com",
            type="A",
            ttl=300,
            value="192.0.2.1",
            is_default=False
        )

        db.add_all([ns_record, soa_record, a_record])
        db.commit()
