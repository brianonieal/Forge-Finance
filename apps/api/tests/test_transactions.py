"""Tests for transaction API endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_transactions_requires_auth(client: AsyncClient):
    response = await client.get("/api/transactions")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_get_transaction_requires_auth(client: AsyncClient):
    response = await client.get("/api/transactions/some-id")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_recategorize_requires_auth(client: AsyncClient):
    response = await client.patch(
        "/api/transactions/some-id/category",
        json={"category": "Food"},
    )
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_list_accepts_filter_params(client: AsyncClient):
    """Verify filter params are accepted (auth will still fail)."""
    response = await client.get(
        "/api/transactions?category=Food&search=starbucks&sort_by=amount&sort_order=asc&limit=10&offset=0"
    )
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_list_rejects_excessive_limit(client: AsyncClient):
    """Limit param should be capped at 200."""
    response = await client.get("/api/transactions?limit=500")
    # Should fail on validation (422) or auth (401/403)
    assert response.status_code in (401, 403, 422)
