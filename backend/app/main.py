from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .routers import auth, zones, records
from .seed import seed_db

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AWS Route53 Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(zones.router)
app.include_router(records.router)

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
