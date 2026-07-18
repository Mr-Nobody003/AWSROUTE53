import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import get_engine, Base, SessionLocal
from .routers import auth, zones, records
from .seed import seed_db

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed data
    try:
        Base.metadata.create_all(bind=get_engine())
        db = SessionLocal()
        try:
            seed_db(db)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Startup error (DB may not be configured): {e}")
    yield


from .config import settings

app = FastAPI(title="AWS Route53 Clone API", lifespan=lifespan)

origins = [
    settings.frontend_url
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

from .routers import auth, zones, records, import_export
app.include_router(auth.router)
app.include_router(zones.router)
app.include_router(records.router)
app.include_router(import_export.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
