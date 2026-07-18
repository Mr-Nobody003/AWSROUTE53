import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

def generate_zone_id():
    # Generate a standard zone identifier starting with Z followed by 12 random alphanumeric chars
    return "Z" + uuid.uuid4().hex[:12].upper()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class HostedZone(Base):
    __tablename__ = "hosted_zones"
    id = Column(String, primary_key=True, default=generate_zone_id)
    name = Column(String, unique=True, index=True, nullable=False)
    type = Column(String, nullable=False) # "Public" or "Private"
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def record_count(self) -> int:
        return len(self.records) if self.records else 0

    records = relationship("Record", back_populates="zone", cascade="all, delete-orphan")

class Record(Base):
    __tablename__ = "records"
    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String, ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False) # A, AAAA, CNAME, etc.
    ttl = Column(Integer, nullable=False, default=300)
    value = Column(Text, nullable=False) # Newline separated
    routing_policy = Column(String, nullable=False, default="simple")
    is_default = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    zone = relationship("HostedZone", back_populates="records")
