"""Tests for dashboard API endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_dashboard_metrics_requires_auth(client: AsyncClient):
    response = await client.get("/api/dashboard/metrics")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_spending_trend_requires_auth(client: AsyncClient):
    response = await client.get("/api/dashboard/spending-trend")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_category_breakdown_requires_auth(client: AsyncClient):
    response = await client.get("/api/dashboard/category-breakdown")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_dashboard_accepts_period_param(client: AsyncClient):
    """Verify period query param is accepted (even without auth)."""
    response = await client.get("/api/dashboard/metrics?period=1W")
    # Should fail on auth, not on invalid param
    assert response.status_code in (401, 403)
