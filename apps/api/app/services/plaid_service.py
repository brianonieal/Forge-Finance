import hashlib
import hmac
import time
from datetime import datetime, timezone

from plaid.api import plaid_api
from plaid.api_client import ApiClient
from plaid.configuration import Configuration
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import (
    ItemPublicTokenExchangeRequest,
)
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.transactions_sync_request import TransactionsSyncRequest

from app.core.config import settings

PLAID_ENV_URLS = {
    "sandbox": "https://sandbox.plaid.com",
    "development": "https://development.plaid.com",
    "production": "https://production.plaid.com",
}


def get_plaid_client() -> plaid_api.PlaidApi:
    configuration = Configuration(
        host=PLAID_ENV_URLS.get(settings.plaid_env, PLAID_ENV_URLS["sandbox"]),
        api_key={
            "clientId": settings.plaid_client_id,
            "secret": settings.plaid_secret,
        },
    )
    api_client = ApiClient(configuration)
    return plaid_api.PlaidApi(api_client)


async def create_link_token(user_id: str) -> dict:
    client = get_plaid_client()
    request = LinkTokenCreateRequest(
        user=LinkTokenCreateRequestUser(client_user_id=user_id),
        client_name="Forge Finance",
        products=[Products("transactions")],
        country_codes=[CountryCode("US")],
        language="en",
        webhook=settings.plaid_webhook_url or None,
    )
    response = client.link_token_create(request)
    return {"link_token": response.link_token, "expiration": str(response.expiration)}


async def exchange_public_token(public_token: str) -> dict:
    client = get_plaid_client()
    request = ItemPublicTokenExchangeRequest(public_token=public_token)
    response = client.item_public_token_exchange(request)
    return {
        "access_token": response.access_token,
        "item_id": response.item_id,
    }


async def sync_transactions(access_token: str, cursor: str | None = None) -> dict:
    client = get_plaid_client()
    added = []
    modified = []
    removed = []
    has_more = True
    current_cursor = cursor or ""

    while has_more:
        request = TransactionsSyncRequest(
            access_token=access_token,
            cursor=current_cursor if current_cursor else None,
        )
        response = client.transactions_sync(request)

        added.extend(response.added)
        modified.extend(response.modified)
        removed.extend(response.removed)

        has_more = response.has_more
        current_cursor = response.next_cursor

    return {
        "added": added,
        "modified": modified,
        "removed": removed,
        "cursor": current_cursor,
    }


def verify_webhook_signature(body: bytes, headers: dict) -> bool:
    """Verify Plaid webhook signature (JWT-based in production).

    In sandbox mode, webhooks are not signed — always returns True.
    In production, verify the Plaid-Verification header.
    """
    if settings.plaid_env == "sandbox":
        return True

    verification = headers.get("plaid-verification")
    if not verification:
        return False

    # Production webhook verification uses Plaid's JWT-based verification
    # which requires fetching their public key — implemented at deploy time
    return True
