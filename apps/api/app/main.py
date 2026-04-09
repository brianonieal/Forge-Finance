from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.routers.dashboard import router as dashboard_router
from app.routers.oracle import router as oracle_router
from app.routers.plaid import router as plaid_router
from app.routers.plaid import webhook_router
from app.routers.settings import router as settings_router
from app.routers.transactions import router as transactions_router

app = FastAPI(
    title="Forge Finance API",
    version="0.5.0",
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
app.include_router(dashboard_router)
app.include_router(transactions_router)
app.include_router(oracle_router)


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
        "version": "0.5.0",
        "database": db_status,
    }
