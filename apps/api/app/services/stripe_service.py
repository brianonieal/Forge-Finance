"""Stripe service layer — wraps the SDK so routers and tests can swap it out.

All Stripe calls go through these functions. Tests monkeypatch the module-level
helpers below, never the stripe library directly. This keeps tests fast (no
network, no SDK) and gives us a single seam for retry/error handling later.

Stripe SDK initialization is deferred until first call so importing this module
during test collection doesn't require STRIPE_SECRET_KEY to be set.
"""

from __future__ import annotations

from typing import Any

import stripe

from app.core.config import settings


def _ensure_configured() -> None:
    """Set the SDK API key from settings if not already set.

    Called at the top of every public function. The SDK uses a module-level
    api_key, so we just keep it in sync with settings on each call. Cheap.
    """
    if settings.stripe_secret_key:
        stripe.api_key = settings.stripe_secret_key


def create_or_get_customer(email: str, user_id: str) -> str:
    """Create a Stripe customer for this user, or return the existing customer ID.

    Idempotency: callers should check user.stripe_customer_id BEFORE calling
    this. This function does NOT check the DB — it always creates. The router
    enforces the DB check.
    """
    _ensure_configured()
    customer = stripe.Customer.create(
        email=email,
        metadata={"forge_user_id": user_id},
    )
    return customer.id


def create_checkout_session(
    customer_id: str,
    price_id: str,
    success_url: str,
    cancel_url: str,
) -> dict[str, Any]:
    """Create a Stripe Checkout session for the Pro subscription."""
    _ensure_configured()
    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
    )
    return {"id": session.id, "url": session.url}


def create_portal_session(customer_id: str, return_url: str) -> dict[str, Any]:
    """Create a Stripe Customer Portal session for billing self-service."""
    _ensure_configured()
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=return_url,
    )
    return {"url": session.url}


def list_invoices(customer_id: str, limit: int = 24) -> list[dict[str, Any]]:
    """List recent invoices for the customer."""
    _ensure_configured()
    invoices = stripe.Invoice.list(customer=customer_id, limit=limit)
    return [
        {
            "id": inv.id,
            "amount_paid": inv.amount_paid,
            "currency": inv.currency,
            "status": inv.status,
            "created": inv.created,
            "hosted_invoice_url": inv.hosted_invoice_url,
            "invoice_pdf": inv.invoice_pdf,
            "period_start": inv.period_start,
            "period_end": inv.period_end,
        }
        for inv in invoices.data
    ]


def get_subscription(customer_id: str) -> dict[str, Any] | None:
    """Return the active subscription for this customer, or None."""
    _ensure_configured()
    subs = stripe.Subscription.list(customer=customer_id, status="active", limit=1)
    if not subs.data:
        return None
    sub = subs.data[0]
    return {
        "id": sub.id,
        "status": sub.status,
        "current_period_end": sub.current_period_end,
        "cancel_at_period_end": sub.cancel_at_period_end,
    }


def verify_webhook_signature(
    payload: bytes,
    sig_header: str,
    webhook_secret: str,
) -> dict[str, Any]:
    """Verify the Stripe-Signature header and return the parsed event.

    Raises stripe.error.SignatureVerificationError on bad signature.
    Raises ValueError on malformed payload.

    The webhook_secret arg is passed in (not read from settings) so tests can
    inject a known secret. Production callers pass settings.stripe_webhook_secret.
    """
    event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    return event
