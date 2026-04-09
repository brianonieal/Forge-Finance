from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

engine = (
    create_async_engine(
        settings.database_url,
        echo=settings.debug,
    )
    if settings.database_url
    else None
)

async_session = (
    sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    if engine
    else None
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    if async_session is None:
        raise RuntimeError("Database not configured")
    async with async_session() as session:
        yield session
