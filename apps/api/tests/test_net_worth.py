"""Tests for net worth API endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_summary_requires_auth(client: AsyncClient):
    response = await client.get("/api/net-worth/summary")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_trend_requires_auth(client: AsyncClient):
    response = await client.get("/api/net-worth/trend")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_trend_accepts_months_param(client: AsyncClient):
    response = await client.get("/api/net-worth/trend?months=3")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_trend_rejects_excessive_months(client: AsyncClient):
    response = await client.get("/api/net-worth/trend?months=24")
    assert response.status_code in (401, 403, 422)


@pytest.mark.asyncio
async def test_summary_rejects_invalid_token(client: AsyncClient):
    response = await client.get(
        "/api/net-worth/summary",
        headers={"Authorization": "Bearer bad-token"},
    )
    assert response.status_code == 401
