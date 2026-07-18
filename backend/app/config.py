import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    environment: str = os.getenv("ENVIRONMENT", "local")
    local_db_path: str = os.getenv("LOCAL_DB_PATH", "./dev.db")
    turso_database_url: str | None = os.getenv("TURSO_DATABASE_URL")
    turso_auth_token: str | None = os.getenv("TURSO_AUTH_TOKEN")
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
    jwt_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

settings = Settings()
