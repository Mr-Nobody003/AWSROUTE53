from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from functools import lru_cache
from .config import settings

Base = declarative_base()


def _build_database_url() -> str:
    if settings.turso_database_url and settings.turso_auth_token:
        host = settings.turso_database_url.replace("libsql://", "")
        return f"sqlite+libsql://{host}?authToken={settings.turso_auth_token}&secure=true"
    return f"sqlite:///{settings.local_db_path}"


@lru_cache(maxsize=1)
def _get_engine():
    """Build the SQLAlchemy engine once and cache it.
    Using lru_cache instead of module-level code ensures env vars are
    read at first request time, not at cold-start import time on Vercel."""
    url = _build_database_url()
    connect_args = {"check_same_thread": False} if url.startswith("sqlite:///") else {}
    return create_engine(url, connect_args=connect_args)


@lru_cache(maxsize=1)
def _get_session_factory():
    return sessionmaker(autocommit=False, autoflush=False, bind=_get_engine())


# Public interface — same API as before so all existing imports work unchanged
def get_engine():
    return _get_engine()


def SessionLocal() -> Session:
    """Return a new database session. Call .close() when done."""
    return _get_session_factory()()


# Alias used in main.py lifespan
engine = property(lambda _: _get_engine())
