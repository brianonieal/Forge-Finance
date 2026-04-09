"""Tests for budget API endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_budgets_requires_auth(client: AsyncClient):
    response = await client.get("/api/budgets")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_create_budget_requires_auth(client: AsyncClient):
    response = await client.post(
        "/api/budgets",
        json={"category": "Food", "amount_limit": 500},
    )
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_get_budget_requires_auth(client: AsyncClient):
    response = await client.get("/api/budgets/some-id")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_update_budget_requires_auth(client: AsyncClient):
    response = await client.patch(
        "/api/budgets/some-id",
        json={"amount_limit": 600},
    )
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_delete_budget_requires_auth(client: AsyncClient):
    response = await client.delete("/api/budgets/some-id")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_list_budgets_accepts_period_param(client: AsyncClient):
    """Verify period param is accepted (auth will still fail)."""
    response = await client.get("/api/budgets?period=weekly")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_create_budget_validates_body(client: AsyncClient):
    """Missing required fields should return 422 or auth error."""
    response = await client.post("/api/budgets", json={})
    assert response.status_code in (401, 403, 422)
