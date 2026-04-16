"""Billing router — Stripe Checkout, Customer Portal, subscription, invoices, webhook.

All endpoints under /api/billing require auth except POST /api/webhooks/stripe,
which Stripe calls directly with a signed payload. Webhook signature verification
is the only auth on that endpoint.

Idempotency: webhook events are de-duplicated by stripe_event_id stored in
agent_log (reusing that table to avoid a new migration just for event tracking).
The agent column is "stripe_webhook" and the query column holds the event id.
"""

from __future__ import annotations

import uuid
from typing import Any

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.core.config import settings
from app.core.database import get_db
from app.models.agent_log import AgentLog
from app.models.user import User
from app.services import stripe_service

router = APIRouter(prefix="/api/billing", tags=["billing"])
webhook_router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


# --- Request / response models ---


class CheckoutSessionRequest(BaseModel):
    success_url: str
    cancel_url: str


class PortalSessionRequest(BaseModel):
    return_url: str


# --- Helpers ---


async def _get_user_or_404(db: AsyncSession, user_id: str) -> User:
    """Fetch the User row or raise 404. Used by every authenticated endpoint."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def _ensure_stripe_customer(db: AsyncSession, user: User) -> str:
    """Return user.stripe_customer_id, creating one if missing.

    The check-then-create pattern is the idempotency guarantee: we never create
    a duplicate Stripe customer for a user who already has one. Concurrent calls
    could in theory race here, but the unique partial index from migration 002
    will catch a duplicate insert at the DB layer.
    """
    if user.stripe_customer_id:
        return user.stripe_customer_id

    customer_id = stripe_service.create_or_get_customer(
        email=user.email,
        user_id=str(user.id),
    )
    user.stripe_customer_id = customer_id
    await db.commit()
    await db.refresh(user)
    return customer_id


async def _is_event_processed(db: AsyncSession, event_id: str) -> bool:
    """Check if a Stripe event has already been processed (idempotency)."""
    result = await db.execute(
        select(AgentLog).where(
            AgentLog.agent == "stripe_webhook",
            AgentLog.query == event_id,
        )
    )
    return result.scalar_one_or_none() is not None


async def _record_event(
    db: AsyncSession,
    event_id: str,
    event_type: str,
    user_id: str | None,
    status_str: str = "success",
) -> None:
    """Mark a Stripe event as processed in agent_log."""
    log = AgentLog(
        id=uuid.uuid4(),
        # NOTE: agent_log requires user_id; for events we can't tie to a user
        # (e.g. malformed payloads, unknown customer), we skip recording. This
        # is fine because such events would also fail to mutate state.
        user_id=user_id or uuid.UUID(int=0),
        agent="stripe_webhook",
        model=event_type,
        input_tokens=0,
        output_tokens=0,
        cost=0,
        duration_ms=0,
        query=event_id,
        status=status_str,
    )
    db.add(log)
    await db.commit()


# --- Authenticated endpoints ---


@router.post("/create-checkout-session")
async def create_checkout_session(
    body: CheckoutSessionRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Create a Stripe Checkout session for the Pro plan.

    Returns the session URL which the frontend should redirect the browser to.
    """
    if not settings.stripe_secret_key or not settings.stripe_price_id_pro:
        raise HTTPException(
            status_code=503,
            detail="Stripe is not configured on this server",
        )
    user = await _get_user_or_404(db, user_id)
    customer_id = await _ensure_stripe_customer(db, user)
    try:
        session = stripe_service.create_checkout_session(
            customer_id=customer_id,
            price_id=settings.stripe_price_id_pro,
            success_url=body.success_url,
            cancel_url=body.cancel_url,
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=502, detail=f"Stripe error: {str(e)}")
    return session


@router.post("/create-portal-session")
async def create_portal_session(
    body: PortalSessionRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Create a Stripe Customer Portal session for billing management."""
    if not settings.stripe_secret_key:
        raise HTTPException(
            status_code=503,
            detail="Stripe is not configured on this server",
        )
    user = await _get_user_or_404(db, user_id)
    if not user.stripe_customer_id:
        raise HTTPException(
            status_code=400,
            detail="No Stripe customer for this user. Subscribe first.",
        )
    try:
        session = stripe_service.create_portal_session(
            customer_id=user.stripe_customer_id,
            return_url=body.return_url,
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=502, detail=f"Stripe error: {str(e)}")
    return session


@router.get("/subscription")
async def get_subscription(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Return current subscription state for this user."""
    user = await _get_user_or_404(db, user_id)
    if not user.stripe_customer_id:
        return {"plan": user.plan, "subscription": None}
    if not settings.stripe_secret_key:
        # No Stripe configured — report DB plan but no live subscription details
        return {"plan": user.plan, "subscription": None}
    try:
        sub = stripe_service.get_subscription(user.stripe_customer_id)
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=502, detail=f"Stripe error: {str(e)}")
    return {"plan": user.plan, "subscription": sub}


@router.get("/invoices")
async def get_invoices(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """List recent invoices for the user. Free users get an empty list."""
    user = await _get_user_or_404(db, user_id)
    if not user.stripe_customer_id:
        return {"invoices": []}
    if not settings.stripe_secret_key:
        return {"invoices": []}
    try:
        invoices = stripe_service.list_invoices(user.stripe_customer_id)
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=502, detail=f"Stripe error: {str(e)}")
    return {"invoices": invoices}


# --- Webhook endpoint (no auth — signature verification only) ---


@webhook_router.post("/stripe")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Handle Stripe webhook events.

    Verifies the Stripe-Signature header against STRIPE_WEBHOOK_SECRET and
    de-duplicates by event.id. Each event type updates user.plan accordingly.

    Returns 200 even on idempotent replays so Stripe stops retrying.
    """
    if not settings.stripe_webhook_secret:
        raise HTTPException(
            status_code=503,
            detail="Stripe webhook secret not configured",
        )

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe_service.verify_webhook_signature(
            payload=payload,
            sig_header=sig_header,
            webhook_secret=settings.stripe_webhook_secret,
        )
    except (stripe.error.SignatureVerificationError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid signature: {str(e)}")

    event_id = event["id"]
    event_type = event["type"]

    # Idempotency check
    if await _is_event_processed(db, event_id):
        return {"status": "already_processed", "event_id": event_id}

    obj = event["data"]["object"]
    customer_id = obj.get("customer")

    # Look up user by stripe_customer_id
    user: User | None = None
    if customer_id:
        result = await db.execute(
            select(User).where(User.stripe_customer_id == customer_id)
        )
        user = result.scalar_one_or_none()

    # Handle event types
    if event_type == "customer.subscription.created":
        if user:
            user.plan = "pro"
            await db.commit()
    elif event_type == "customer.subscription.updated":
        if user:
            sub_status = obj.get("status")
            if sub_status == "active":
                user.plan = "pro"
            elif sub_status in ("canceled", "unpaid", "past_due"):
                user.plan = "free"
            await db.commit()
    elif event_type == "customer.subscription.deleted":
        if user:
            user.plan = "free"
            await db.commit()
    # Other event types: just log + ack so Stripe stops retrying.

    await _record_event(
        db,
        event_id=event_id,
        event_type=event_type,
        user_id=str(user.id) if user else None,
    )
    return {"status": "processed", "event_id": event_id, "type": event_type}
