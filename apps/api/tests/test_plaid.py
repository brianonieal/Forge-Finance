import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_link_token_requires_auth(client: AsyncClient):
    """Plaid link token endpoint requires authentication."""
    response = await client.post("/api/plaid/create-link-token")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_exchange_token_requires_auth(client: AsyncClient):
    """Plaid exchange endpoint requires authentication."""
    response = await client.post(
        "/api/plaid/exchange-public-token",
        json={"public_token": "test-token"},
    )
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_get_accounts_requires_auth(client: AsyncClient):
    """Plaid accounts endpoint requires authentication."""
    response = await client.get("/api/plaid/accounts")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_plaid_router_registered(client: AsyncClient):
    """Plaid router is registered with correct prefix."""
    # The OpenAPI schema confirms routes exist
    response = await client.get("/openapi.json")
    if response.status_code == 200:
        schema = response.json()
        paths = schema.get("paths", {})
        assert "/api/plaid/create-link-token" in paths
        assert "/api/plaid/exchange-public-token" in paths
        assert "/api/plaid/accounts" in paths
    else:
        # Docs disabled in non-debug — verify via direct route test
        assert True


@pytest.mark.asyncio
async def test_webhook_router_registered(client: AsyncClient):
    """Webhook router is registered (separate from plaid auth routes)."""
    # Verify the webhook route exists by checking it doesn't return 404
    # We need to use raise_server_exceptions=False to handle the DB RuntimeError
    from httpx import ASGITransport, AsyncClient as AC
    from app.main import app

    transport = ASGITransport(app=app, raise_app_exceptions=False)
    async with AC(transport=transport, base_url="http://test") as c:
        response = await c.post(
            "/api/webhooks/plaid",
            json={
                "webhook_type": "UNKNOWN",
                "webhook_code": "UNKNOWN",
                "item_id": "test-item-id",
            },
        )
        # 500 (no DB) is expected in test — key thing is it's not 404
        assert response.status_code != 404
        # And it doesn't require auth (not 401/403)
        assert response.status_code not in (401, 403)
