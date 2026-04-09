from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.routers.plaid import router as plaid_router
from app.routers.plaid import webhook_router
from app.routers.settings import router as settings_router

app = FastAPI(
    title="Forge Finance API",
    version="0.4.0",
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


app.include_router(settings_router)
app.include_router(plaid_router)
app.include_router(webhook_router)


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
        "version": "0.4.0",
        "database": db_status,
    }
