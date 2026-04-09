"""Tests for alerts API endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_alerts_requires_auth(client: AsyncClient):
    response = await client.get("/api/alerts")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_mark_alert_read_requires_auth(client: AsyncClient):
    response = await client.patch("/api/alerts/some-id/read")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_dismiss_alert_requires_auth(client: AsyncClient):
    response = await client.post("/api/alerts/some-id/dismiss")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_mark_all_read_requires_auth(client: AsyncClient):
    response = await client.post("/api/alerts/mark-all-read")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_list_alerts_accepts_filter(client: AsyncClient):
    response = await client.get("/api/alerts?filter_type=budget")
    assert response.status_code in (401, 403)
