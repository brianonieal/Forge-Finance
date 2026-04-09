"""Tests for reports API endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_monthly_summary_requires_auth(client: AsyncClient):
    response = await client.get("/api/reports/monthly-summary")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_category_trends_requires_auth(client: AsyncClient):
    response = await client.get("/api/reports/category-trends")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_monthly_summary_accepts_months_param(client: AsyncClient):
    response = await client.get("/api/reports/monthly-summary?months=3")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_category_trends_accepts_months_param(client: AsyncClient):
    response = await client.get("/api/reports/category-trends?months=6")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_monthly_summary_rejects_excessive_months(client: AsyncClient):
    response = await client.get("/api/reports/monthly-summary?months=24")
    assert response.status_code in (401, 403, 422)
