"""Tests for 2FA and beta access endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_2fa_status_requires_auth(client: AsyncClient):
    response = await client.get("/api/settings/2fa/status")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_2fa_setup_requires_auth(client: AsyncClient):
    response = await client.post("/api/settings/2fa/setup")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_2fa_verify_requires_auth(client: AsyncClient):
    response = await client.post(
        "/api/settings/2fa/verify",
        json={"code": "123456"},
    )
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_2fa_disable_requires_auth(client: AsyncClient):
    response = await client.delete("/api/settings/2fa")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_2fa_status_rejects_invalid_token(client: AsyncClient):
    response = await client.get(
        "/api/settings/2fa/status",
        headers={"Authorization": "Bearer bad-token"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_beta_access_invalid_code(client: AsyncClient):
    response = await client.post(
        "/api/settings/beta-access",
        json={"code": "WRONGCODE"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_beta_access_valid_code(client: AsyncClient):
    response = await client.post(
        "/api/settings/beta-access",
        json={"code": "FORGE2026"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True


@pytest.mark.asyncio
async def test_beta_access_case_insensitive(client: AsyncClient):
    response = await client.post(
        "/api/settings/beta-access",
        json={"code": "forge2026"},
    )
    # The endpoint uppercases the code
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_beta_access_requires_body(client: AsyncClient):
    response = await client.post("/api/settings/beta-access")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_2fa_verify_requires_body(client: AsyncClient):
    response = await client.post(
        "/api/settings/2fa/verify",
        headers={"Authorization": "Bearer bad-token"},
    )
    assert response.status_code in (401, 422)
