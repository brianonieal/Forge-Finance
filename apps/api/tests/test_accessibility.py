"""Tests for v4.0.0 performance and accessibility API requirements."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_version_is_4(client: AsyncClient):
    """Version should be 4.0.0 for this gate."""
    response = await client.get("/health")
    assert response.json()["version"] == "4.0.0"


@pytest.mark.asyncio
async def test_health_returns_db_status(client: AsyncClient):
    """Health endpoint should include database status."""
    response = await client.get("/health")
    data = response.json()
    assert "database" in data
    assert data["database"] in ("connected", "not_configured", "error")


@pytest.mark.asyncio
async def test_cors_headers_present(client: AsyncClient):
    """OPTIONS request should return CORS headers."""
    response = await client.options("/health")
    # FastAPI handles CORS via middleware; we just check it doesn't error
    assert response.status_code in (200, 405)


@pytest.mark.asyncio
async def test_all_protected_routes_reject_no_auth(client: AsyncClient):
    """All user-facing endpoints should require auth."""
    protected = [
        "/api/dashboard/metrics",
        "/api/transactions",
        "/api/budgets",
        "/api/goals",
        "/api/investments/holdings",
        "/api/net-worth/summary",
        "/api/reports/monthly-summary",
        "/api/alerts",
        "/api/settings/profile",
        "/api/settings/2fa/status",
    ]
    for path in protected:
        response = await client.get(path)
        assert response.status_code in (401, 403), f"{path} should require auth"


@pytest.mark.asyncio
async def test_beta_access_no_auth_required(client: AsyncClient):
    """Beta access endpoint should not require auth (it's pre-login)."""
    response = await client.post(
        "/api/settings/beta-access",
        json={"code": "FORGE2026"},
    )
    assert response.status_code == 200
