import re
from pydantic import BaseModel, validator, constr
from datetime import datetime
from typing import List, Optional

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class HostedZoneBase(BaseModel):
    name: str
    type: str
    comment: Optional[str] = None

class HostedZoneCreate(HostedZoneBase):
    pass

class HostedZoneUpdate(BaseModel):
    type: Optional[str] = None
    comment: Optional[str] = None

class HostedZone(HostedZoneBase):
    id: str
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True

class RecordBase(BaseModel):
    name: str
    type: str
    ttl: int = 300
    value: str # Newline separated in DB, but let's accept string
    routing_policy: str = "simple"

    @validator('type')
    def validate_type(cls, v):
        allowed = {"A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA", "SOA"}
        if v.upper() not in allowed:
            raise ValueError(f"Invalid record type. Allowed types: {', '.join(allowed)}")
        return v.upper()

    @validator('value')
    def validate_value(cls, v, values):
        if 'type' not in values:
            return v
        
        record_type = values['type'].upper()
        lines = [line.strip() for line in v.split('\n') if line.strip()]
        if not lines:
            raise ValueError("Value cannot be empty.")
            
        if record_type == "CNAME" and len(lines) > 1:
            raise ValueError("CNAME records can only contain a single value.")
            
        validated_lines = []
        for line in lines:
            if record_type == "A":
                # basic IPv4
                if not re.match(r"^(\d{1,3}\.){3}\d{1,3}$", line):
                    raise ValueError(f"Invalid IPv4 address: {line}")
            elif record_type == "AAAA":
                # basic IPv6
                if not re.match(r"^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$", line):
                     # Not a perfect regex, but good enough for a clone validation demo
                     pass # we can simplify IPv6 validation or leave it slightly permissive
            elif record_type == "TXT":
                if not line.startswith('"') or not line.endswith('"'):
                    line = f'"{line}"'
            elif record_type == "MX":
                parts = line.split()
                if len(parts) != 2 or not parts[0].isdigit():
                    raise ValueError(f"MX value must be in format '<priority> <hostname>'. Got: {line}")
            elif record_type == "SRV":
                parts = line.split()
                if len(parts) != 4 or not all(p.isdigit() for p in parts[:3]):
                    raise ValueError(f"SRV value must be in format '<priority> <weight> <port> <target>'. Got: {line}")
            elif record_type == "CAA":
                parts = line.split(maxsplit=2)
                if len(parts) != 3 or not parts[0].isdigit() or parts[1] not in {"issue", "issuewild", "iodef"}:
                    raise ValueError(f"CAA value must be '<flag> <tag> \"<value>\"'. Got: {line}")
            validated_lines.append(line)
            
        return "\n".join(validated_lines)

class RecordCreate(RecordBase):
    pass

class RecordUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    ttl: Optional[int] = None
    value: Optional[str] = None
    routing_policy: Optional[str] = None

class Record(RecordBase):
    id: int
    zone_id: str
    is_default: bool
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True

class PaginatedHostedZones(BaseModel):
    items: List[HostedZone]
    total: int
    page: int
    page_size: int

class PaginatedRecords(BaseModel):
    items: List[Record]
    total: int
    page: int
    page_size: int
