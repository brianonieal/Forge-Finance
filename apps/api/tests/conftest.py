import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import get_db
from app.main import app


class _StubSession:
    """Minimal AsyncSession stub for tests that need get_db to resolve but
    don't actually exercise DB operations. Any attempt to call execute/commit
    raises so tests fail loudly if they accidentally hit the DB."""

    async def execute(self, *args, **kwargs):
        raise RuntimeError("Test attempted real DB call — use a real DB fixture")

    async def commit(self):
        raise RuntimeError("Test attempted real DB call — use a real DB fixture")

    async def refresh(self, *args, **kwargs):
        raise RuntimeError("Test attempted real DB call — use a real DB fixture")

    def add(self, *args, **kwargs):
        raise RuntimeError("Test attempted real DB call — use a real DB fixture")


async def _override_get_db():
    yield _StubSession()


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def stub_db():
    """Override get_db with a stub that lets the dependency resolve. Use this
    for tests that exercise pre-DB logic (signature verification, validation)
    on endpoints that declare a db: AsyncSession = Depends(get_db) parameter."""
    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.pop(get_db, None)
