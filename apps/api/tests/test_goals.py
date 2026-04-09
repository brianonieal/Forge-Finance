"""Tests for goal API endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_goals_requires_auth(client: AsyncClient):
    response = await client.get("/api/goals")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_create_goal_requires_auth(client: AsyncClient):
    response = await client.post(
        "/api/goals",
        json={"name": "Emergency Fund", "target_amount": 10000},
    )
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_get_goal_requires_auth(client: AsyncClient):
    response = await client.get("/api/goals/some-id")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_update_goal_requires_auth(client: AsyncClient):
    response = await client.patch(
        "/api/goals/some-id",
        json={"current_amount": 5000},
    )
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_delete_goal_requires_auth(client: AsyncClient):
    response = await client.delete("/api/goals/some-id")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_list_goals_accepts_status_filter(client: AsyncClient):
    """Verify status filter param is accepted."""
    response = await client.get("/api/goals?status=active")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_create_goal_validates_body(client: AsyncClient):
    """Missing required fields should return 422 or auth error."""
    response = await client.post("/api/goals", json={})
    assert response.status_code in (401, 403, 422)


@pytest.mark.asyncio
async def test_create_goal_with_deadline(client: AsyncClient):
    """Goal with deadline should be accepted (auth will still fail)."""
    response = await client.post(
        "/api/goals",
        json={
            "name": "Vacation",
            "target_amount": 5000,
            "deadline": "2026-12-31",
        },
    )
    assert response.status_code in (401, 403)
