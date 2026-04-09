"""Test auth middleware and settings endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_no_auth_required(client: AsyncClient):
    """Health endpoint should not require auth."""
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["version"] == "0.5.0"


@pytest.mark.asyncio
async def test_settings_profile_requires_auth(client: AsyncClient):
    """Settings endpoints should require auth."""
    response = await client.get("/api/settings/profile")
    assert response.status_code in (401, 403)  # No auth header


@pytest.mark.asyncio
async def test_settings_preferences_requires_auth(client: AsyncClient):
    response = await client.get("/api/settings/preferences")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_settings_notifications_requires_auth(client: AsyncClient):
    response = await client.get("/api/settings/notifications")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_settings_sessions_requires_auth(client: AsyncClient):
    response = await client.get("/api/settings/sessions")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_settings_connected_apps_requires_auth(client: AsyncClient):
    response = await client.get("/api/settings/connected-apps")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_settings_profile_invalid_token(client: AsyncClient):
    """Invalid JWT should return 401."""
    response = await client.get(
        "/api/settings/profile",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401
