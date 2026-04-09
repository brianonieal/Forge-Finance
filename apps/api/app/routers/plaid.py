import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.models.account import Account
from app.services.plaid_service import (
    create_link_token,
    exchange_public_token,
    verify_webhook_signature,
)
from app.services.sync_agent import run_sync

router = APIRouter(prefix="/api/plaid", tags=["plaid"])


class ExchangeTokenRequest(BaseModel):
    public_token: str
    institution_id: str | None = None
    institution_name: str | None = None


class WebhookPayload(BaseModel):
    webhook_type: str
    webhook_code: str
    item_id: str
    error: dict | None = None


# --- Plaid item storage (access tokens keyed by item_id) ---
# In production this would be encrypted in the database.
# For v0.4.0 sandbox, store in-memory for simplicity.
_plaid_items: dict[str, dict] = {}


@router.post("/create-link-token")
async def create_link_token_endpoint(
    user_id: str = Depends(get_current_user_id),
):
    """Create a Plaid Link token for the frontend."""
    try:
        result = await create_link_token(user_id)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to create link token: {str(e)}",
        )


@router.post("/exchange-public-token")
async def exchange_public_token_endpoint(
    body: ExchangeTokenRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Exchange a public token for an access token and create accounts."""
    try:
        result = await exchange_public_token(body.public_token)
        access_token = result["access_token"]
        item_id = result["item_id"]

        # Store the access token (in production: encrypt and persist to DB)
        _plaid_items[item_id] = {
            "access_token": access_token,
            "user_id": user_id,
        }

        # Fetch accounts from Plaid and create in DB
        from plaid.model.accounts_get_request import AccountsGetRequest

        from app.services.plaid_service import get_plaid_client

        client = get_plaid_client()
        accounts_response = client.accounts_get(
            AccountsGetRequest(access_token=access_token)
        )

        created_accounts = []
        for acct in accounts_response.accounts:
            new_account = Account(
                id=uuid.uuid4(),
                user_id=user_id,
                plaid_account_id=acct.account_id,
                plaid_item_id=item_id,
                name=acct.name,
                official_name=acct.official_name,
                type=acct.type.value if acct.type else "unknown",
                subtype=acct.subtype.value if acct.subtype else None,
                mask=acct.mask,
                institution_name=body.institution_name,
                balance_current=float(acct.balances.current) if acct.balances.current else None,
                balance_available=float(acct.balances.available) if acct.balances.available else None,
                currency=acct.balances.iso_currency_code or "USD",
            )
            db.add(new_account)
            created_accounts.append(new_account)

        await db.commit()

        # Trigger initial sync
        try:
            sync_result = await run_sync(db, user_id, access_token, item_id)
        except Exception:
            # Initial sync failure is non-fatal — cron will pick it up
            sync_result = {"status": "pending", "added": 0}

        return {
            "item_id": item_id,
            "accounts_created": len(created_accounts),
            "initial_sync": sync_result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to exchange token: {str(e)}",
        )


@router.get("/accounts")
async def get_accounts(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get all accounts for the current user."""
    result = await db.execute(
        select(Account)
        .where(Account.user_id == user_id)
        .order_by(Account.created_at.desc())
    )
    accounts = result.scalars().all()
    return {
        "accounts": [
            {
                "id": str(a.id),
                "name": a.name,
                "official_name": a.official_name,
                "type": a.type,
                "subtype": a.subtype,
                "mask": a.mask,
                "institution_name": a.institution_name,
                "institution_logo": a.institution_logo,
                "balance_current": float(a.balance_current) if a.balance_current else None,
                "balance_available": float(a.balance_available) if a.balance_available else None,
                "currency": a.currency,
                "plaid_item_id": a.plaid_item_id,
                "last_synced": str(a.updated_at) if a.updated_at else None,
            }
            for a in accounts
        ]
    }


# Webhook endpoint — no auth (Plaid calls this directly)
webhook_router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


@webhook_router.post("/plaid")
async def plaid_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Handle Plaid webhooks (TRANSACTIONS_SYNC, ITEM updates)."""
    body = await request.body()

    # Verify webhook signature
    if not verify_webhook_signature(body, dict(request.headers)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature",
        )

    payload = await request.json()
    webhook_type = payload.get("webhook_type", "")
    webhook_code = payload.get("webhook_code", "")
    item_id = payload.get("item_id", "")

    if webhook_type == "TRANSACTIONS":
        if webhook_code in ("INITIAL_UPDATE", "HISTORICAL_UPDATE", "DEFAULT_UPDATE", "SYNC_UPDATES_AVAILABLE"):
            item_data = _plaid_items.get(item_id)
            if item_data:
                try:
                    await run_sync(
                        db,
                        item_data["user_id"],
                        item_data["access_token"],
                        item_id,
                    )
                except Exception:
                    pass  # Logged in sync_log table

    elif webhook_type == "ITEM":
        if webhook_code == "LOGIN_REQUIRED":
            # ERR-PLAID-004: Mark accounts as needing re-auth
            result = await db.execute(
                select(Account).where(Account.plaid_item_id == item_id)
            )
            for account in result.scalars().all():
                account.institution_logo = "LOGIN_REQUIRED"  # Signal to frontend
            await db.commit()

    return {"status": "ok"}
