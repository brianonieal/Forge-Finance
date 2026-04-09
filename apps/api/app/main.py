from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine

app = FastAPI(
    title="Forge Finance API",
    version="0.2.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    db_status = "not_configured"
    if engine:
        try:
            async with engine.connect() as conn:
                await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
            db_status = "connected"
        except Exception:
            db_status = "error"

    return {
        "status": "healthy",
        "version": "0.2.0",
        "database": db_status,
    }
