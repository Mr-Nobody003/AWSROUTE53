from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

def build_database_url() -> str:
    if settings.turso_database_url and settings.turso_auth_token:
        host = settings.turso_database_url.replace("libsql://", "")
        return f"sqlite+libsql://{host}?authToken={settings.turso_auth_token}&secure=true"
    return f"sqlite:///{settings.local_db_path}"

SQLALCHEMY_DATABASE_URL = build_database_url()

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite:///") else {}
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
