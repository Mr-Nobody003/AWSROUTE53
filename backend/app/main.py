import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
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

@app.get("/", response_class=HTMLResponse)
def read_root():
    html_content = """
    <!DOCTYPE html>
    <html>
        <head>
            <title>AWS Route53 API</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    background: #f4f4f9; 
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .container { 
                    background: white; 
                    padding: 30px; 
                    border-radius: 8px; 
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
                    text-align: center;
                }
                p { color: #232f3e; font-size: 18px; margin: 0; }
                .status { color: #2ecc71; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <p>AWS Route53 API Status : <span class="status">LIVE</span> </p>
            </div>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)

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
