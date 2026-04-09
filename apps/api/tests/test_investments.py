"""Tests for investments API endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_holdings_requires_auth(client: AsyncClient):
    response = await client.get("/api/investments/holdings")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_performance_requires_auth(client: AsyncClient):
    response = await client.get("/api/investments/performance")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_holdings_rejects_invalid_token(client: AsyncClient):
    response = await client.get(
        "/api/investments/holdings",
        headers={"Authorization": "Bearer bad-token"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_performance_rejects_invalid_token(client: AsyncClient):
    response = await client.get(
        "/api/investments/performance",
        headers={"Authorization": "Bearer bad-token"},
    )
    assert response.status_code == 401
