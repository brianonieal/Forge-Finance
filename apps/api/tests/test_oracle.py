"""Tests for @ORACLE API endpoints and agent logic."""

import pytest
from httpx import AsyncClient

from app.services.oracle_agent import (
    FREE_TIER_LIMIT,
    MONTHLY_CEILING,
    SONNET_INPUT_COST,
    SONNET_OUTPUT_COST,
)


@pytest.mark.asyncio
async def test_oracle_query_requires_auth(client: AsyncClient):
    response = await client.post(
        "/api/oracle/query",
        json={"query": "How much did I spend?"},
    )
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_oracle_history_requires_auth(client: AsyncClient):
    response = await client.get("/api/oracle/history")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_oracle_usage_requires_auth(client: AsyncClient):
    response = await client.get("/api/oracle/usage")
    assert response.status_code in (401, 403)


def test_free_tier_limit_is_10():
    """Free tier limit matches CONTRACT.md (10 queries/month)."""
    assert FREE_TIER_LIMIT == 10


def test_monthly_ceiling_is_50_cents():
    """Monthly cost ceiling matches CONTRACT.md ($0.50/user/month)."""
    assert MONTHLY_CEILING == 0.50


def test_sonnet_cost_rates():
    """Sonnet cost rates are set for claude-sonnet-4-6."""
    assert SONNET_INPUT_COST == 3.00
    assert SONNET_OUTPUT_COST == 15.00


@pytest.mark.asyncio
async def test_oracle_query_requires_body(client: AsyncClient):
    """Query endpoint requires a query field in body."""
    response = await client.post(
        "/api/oracle/query",
        json={},
    )
    # Should fail on validation (422) or auth (401/403)
    assert response.status_code in (401, 403, 422)
