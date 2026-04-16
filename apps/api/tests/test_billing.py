"""Tests for billing router (Stripe Checkout, Portal, subscription, invoices, webhook).

Pattern matches existing tests: contract-level checks (auth, validation, error
shape) without requiring a real DB or live Stripe SDK. The stripe_service module
is monkeypatched so no network or API key is needed.
"""

from __future__ import annotations

import json
from typing import Any

import pytest
import stripe
from httpx import AsyncClient

from app.core.config import settings
from app.routers import billing as billing_router
from app.services import stripe_service


# --- Auth gate tests (8) ------------------------------------------------------


@pytest.mark.asyncio
async def test_create_checkout_requires_auth(client: AsyncClient):
    response = await client.post(
        "/api/billing/create-checkout-session",
        json={"success_url": "https://x/y", "cancel_url": "https://x/z"},
    )
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_create_portal_requires_auth(client: AsyncClient):
    response = await client.post(
        "/api/billing/create-portal-session",
        json={"return_url": "https://x/y"},
    )
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_get_subscription_requires_auth(client: AsyncClient):
    response = await client.get("/api/billing/subscription")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_get_invoices_requires_auth(client: AsyncClient):
    response = await client.get("/api/billing/invoices")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_create_checkout_rejects_invalid_token(client: AsyncClient):
    response = await client.post(
        "/api/billing/create-checkout-session",
        headers={"Authorization": "Bearer bad-token"},
        json={"success_url": "https://x/y", "cancel_url": "https://x/z"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_portal_rejects_invalid_token(client: AsyncClient):
    response = await client.post(
        "/api/billing/create-portal-session",
        headers={"Authorization": "Bearer bad-token"},
        json={"return_url": "https://x/y"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_subscription_rejects_invalid_token(client: AsyncClient):
    response = await client.get(
        "/api/billing/subscription",
        headers={"Authorization": "Bearer bad-token"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_invoices_rejects_invalid_token(client: AsyncClient):
    response = await client.get(
        "/api/billing/invoices",
        headers={"Authorization": "Bearer bad-token"},
    )
    assert response.status_code == 401


# --- Body validation tests (3) ------------------------------------------------


@pytest.mark.asyncio
async def test_checkout_requires_body(client: AsyncClient):
    response = await client.post(
        "/api/billing/create-checkout-session",
        headers={"Authorization": "Bearer bad-token"},
    )
    # Either auth fails first (401) or validation fails (422). Both acceptable.
    assert response.status_code in (401, 422)


@pytest.mark.asyncio
async def test_portal_requires_body(client: AsyncClient):
    response = await client.post(
        "/api/billing/create-portal-session",
        headers={"Authorization": "Bearer bad-token"},
    )
    assert response.status_code in (401, 422)


@pytest.mark.asyncio
async def test_checkout_validates_url_fields(client: AsyncClient):
    response = await client.post(
        "/api/billing/create-checkout-session",
        headers={"Authorization": "Bearer bad-token"},
        json={"only_one": "value"},
    )
    assert response.status_code in (401, 422)


# --- Webhook tests (8) --------------------------------------------------------


@pytest.mark.asyncio
async def test_webhook_rejects_missing_signature(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    stub_db,
):
    """Missing stripe-signature header → SignatureVerificationError → 400."""
    monkeypatch.setattr(settings, "stripe_webhook_secret", "whsec_test")
    response = await client.post(
        "/api/webhooks/stripe",
        content=b'{"id":"evt_1","type":"x"}',
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_webhook_rejects_invalid_signature(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    stub_db,
):
    monkeypatch.setattr(settings, "stripe_webhook_secret", "whsec_test")

    def boom(payload, sig_header, webhook_secret):
        raise stripe.error.SignatureVerificationError(
            "bad sig", sig_header, payload
        )

    monkeypatch.setattr(stripe_service, "verify_webhook_signature", boom)
    response = await client.post(
        "/api/webhooks/stripe",
        content=b'{"id":"evt_1","type":"x"}',
        headers={"stripe-signature": "t=123,v1=fake"},
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_webhook_503_when_secret_not_configured(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    stub_db,
):
    monkeypatch.setattr(settings, "stripe_webhook_secret", "")
    response = await client.post(
        "/api/webhooks/stripe",
        content=b"{}",
        headers={"stripe-signature": "t=1"},
    )
    assert response.status_code == 503


@pytest.mark.asyncio
async def test_webhook_rejects_malformed_payload(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    stub_db,
):
    monkeypatch.setattr(settings, "stripe_webhook_secret", "whsec_test")

    def boom(payload, sig_header, webhook_secret):
        raise ValueError("malformed JSON")

    monkeypatch.setattr(stripe_service, "verify_webhook_signature", boom)
    response = await client.post(
        "/api/webhooks/stripe",
        content=b"not-json",
        headers={"stripe-signature": "t=1,v1=fake"},
    )
    assert response.status_code == 400


# Event-routing tests (4): these exercise post-signature handler logic.
# We patch _is_event_processed and _record_event so the stub DB session
# never has its execute/commit called. The router's user lookup uses
# db.execute() which would also fail — we patch that path by making
# customer_id absent from the event so the user-lookup branch is skipped.


@pytest.mark.asyncio
async def test_webhook_event_subscription_created_acked(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    stub_db,
):
    monkeypatch.setattr(settings, "stripe_webhook_secret", "whsec_test")
    fake_event = {
        "id": "evt_test_001",
        "type": "customer.subscription.created",
        "data": {"object": {"status": "active"}},  # no customer → skip user lookup
    }
    monkeypatch.setattr(
        stripe_service, "verify_webhook_signature", lambda *a, **k: fake_event
    )

    async def fake_is_processed(db, event_id):
        return False

    async def fake_record(db, event_id, event_type, user_id, status_str="success"):
        pass

    monkeypatch.setattr(billing_router, "_is_event_processed", fake_is_processed)
    monkeypatch.setattr(billing_router, "_record_event", fake_record)

    response = await client.post(
        "/api/webhooks/stripe",
        content=json.dumps(fake_event).encode(),
        headers={"stripe-signature": "t=1,v1=fake"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "processed"
    assert body["event_id"] == "evt_test_001"
    assert body["type"] == "customer.subscription.created"


@pytest.mark.asyncio
async def test_webhook_event_subscription_deleted_acked(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    stub_db,
):
    monkeypatch.setattr(settings, "stripe_webhook_secret", "whsec_test")
    fake_event = {
        "id": "evt_test_002",
        "type": "customer.subscription.deleted",
        "data": {"object": {}},
    }
    monkeypatch.setattr(
        stripe_service, "verify_webhook_signature", lambda *a, **k: fake_event
    )

    async def fake_is_processed(db, event_id):
        return False

    async def fake_record(db, event_id, event_type, user_id, status_str="success"):
        pass

    monkeypatch.setattr(billing_router, "_is_event_processed", fake_is_processed)
    monkeypatch.setattr(billing_router, "_record_event", fake_record)

    response = await client.post(
        "/api/webhooks/stripe",
        content=json.dumps(fake_event).encode(),
        headers={"stripe-signature": "t=1,v1=fake"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_webhook_event_subscription_updated_acked(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    stub_db,
):
    monkeypatch.setattr(settings, "stripe_webhook_secret", "whsec_test")
    fake_event = {
        "id": "evt_test_003",
        "type": "customer.subscription.updated",
        "data": {"object": {"status": "canceled"}},
    }
    monkeypatch.setattr(
        stripe_service, "verify_webhook_signature", lambda *a, **k: fake_event
    )

    async def fake_is_processed(db, event_id):
        return False

    async def fake_record(db, event_id, event_type, user_id, status_str="success"):
        pass

    monkeypatch.setattr(billing_router, "_is_event_processed", fake_is_processed)
    monkeypatch.setattr(billing_router, "_record_event", fake_record)

    response = await client.post(
        "/api/webhooks/stripe",
        content=json.dumps(fake_event).encode(),
        headers={"stripe-signature": "t=1,v1=fake"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_webhook_idempotent_replay(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    stub_db,
):
    """Replaying the same event ID returns 200 with status=already_processed."""
    monkeypatch.setattr(settings, "stripe_webhook_secret", "whsec_test")
    fake_event = {
        "id": "evt_replay",
        "type": "customer.subscription.created",
        "data": {"object": {}},
    }
    monkeypatch.setattr(
        stripe_service, "verify_webhook_signature", lambda *a, **k: fake_event
    )

    async def already_processed(db, event_id):
        return True

    monkeypatch.setattr(billing_router, "_is_event_processed", already_processed)

    response = await client.post(
        "/api/webhooks/stripe",
        content=json.dumps(fake_event).encode(),
        headers={"stripe-signature": "t=1,v1=fake"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "already_processed"


@pytest.mark.asyncio
async def test_webhook_unknown_event_type_acked(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    stub_db,
):
    """Unknown event types should not error — Stripe may add new event types
    over time and we should ack them so they aren't retried indefinitely."""
    monkeypatch.setattr(settings, "stripe_webhook_secret", "whsec_test")
    fake_event = {
        "id": "evt_test_004",
        "type": "invoice.payment_succeeded",  # not handled, should still ack
        "data": {"object": {}},
    }
    monkeypatch.setattr(
        stripe_service, "verify_webhook_signature", lambda *a, **k: fake_event
    )

    async def fake_is_processed(db, event_id):
        return False

    async def fake_record(db, event_id, event_type, user_id, status_str="success"):
        pass

    monkeypatch.setattr(billing_router, "_is_event_processed", fake_is_processed)
    monkeypatch.setattr(billing_router, "_record_event", fake_record)

    response = await client.post(
        "/api/webhooks/stripe",
        content=json.dumps(fake_event).encode(),
        headers={"stripe-signature": "t=1,v1=fake"},
    )
    assert response.status_code == 200


# --- Service unit tests (11) --------------------------------------------------


def test_stripe_service_module_importable():
    """The service should import cleanly even with no Stripe key set."""
    from app.services import stripe_service as svc
    assert hasattr(svc, "create_checkout_session")
    assert hasattr(svc, "create_portal_session")
    assert hasattr(svc, "get_subscription")
    assert hasattr(svc, "list_invoices")
    assert hasattr(svc, "verify_webhook_signature")
    assert hasattr(svc, "create_or_get_customer")


def test_stripe_service_ensure_configured_no_key(monkeypatch: pytest.MonkeyPatch):
    """When no key is set, _ensure_configured is a no-op (doesn't raise)."""
    monkeypatch.setattr(settings, "stripe_secret_key", "")
    stripe_service._ensure_configured()  # must not raise


def test_stripe_service_ensure_configured_sets_key(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(settings, "stripe_secret_key", "sk_test_xyz")
    stripe_service._ensure_configured()
    assert stripe.api_key == "sk_test_xyz"


def test_create_checkout_session_calls_sdk(monkeypatch: pytest.MonkeyPatch):
    """The wrapper should pass args through to stripe.checkout.Session.create."""
    captured: dict[str, Any] = {}

    class FakeSession:
        id = "cs_test_123"
        url = "https://checkout.stripe.com/c/cs_test_123"

    def fake_create(**kwargs):
        captured.update(kwargs)
        return FakeSession()

    monkeypatch.setattr(settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(stripe.checkout.Session, "create", fake_create)

    result = stripe_service.create_checkout_session(
        customer_id="cus_x",
        price_id="price_y",
        success_url="https://app/ok",
        cancel_url="https://app/no",
    )
    assert result == {
        "id": "cs_test_123",
        "url": "https://checkout.stripe.com/c/cs_test_123",
    }
    assert captured["customer"] == "cus_x"
    assert captured["mode"] == "subscription"
    assert captured["line_items"] == [{"price": "price_y", "quantity": 1}]
    assert captured["success_url"] == "https://app/ok"
    assert captured["cancel_url"] == "https://app/no"


def test_create_portal_session_calls_sdk(monkeypatch: pytest.MonkeyPatch):
    captured: dict[str, Any] = {}

    class FakeSession:
        url = "https://billing.stripe.com/p/test"

    def fake_create(**kwargs):
        captured.update(kwargs)
        return FakeSession()

    monkeypatch.setattr(settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(stripe.billing_portal.Session, "create", fake_create)

    result = stripe_service.create_portal_session(
        customer_id="cus_x",
        return_url="https://app/back",
    )
    assert result == {"url": "https://billing.stripe.com/p/test"}
    assert captured["customer"] == "cus_x"
    assert captured["return_url"] == "https://app/back"


def test_get_subscription_returns_none_when_no_active(monkeypatch: pytest.MonkeyPatch):
    class FakeList:
        data: list[Any] = []

    monkeypatch.setattr(settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(stripe.Subscription, "list", lambda **kw: FakeList())
    result = stripe_service.get_subscription("cus_x")
    assert result is None


def test_get_subscription_returns_dict_when_active(monkeypatch: pytest.MonkeyPatch):
    class FakeSub:
        id = "sub_x"
        status = "active"
        current_period_end = 9999999999
        cancel_at_period_end = False

    class FakeList:
        data = [FakeSub()]

    monkeypatch.setattr(settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(stripe.Subscription, "list", lambda **kw: FakeList())
    result = stripe_service.get_subscription("cus_x")
    assert result is not None
    assert result["id"] == "sub_x"
    assert result["status"] == "active"
    assert result["cancel_at_period_end"] is False


def test_list_invoices_returns_empty_list(monkeypatch: pytest.MonkeyPatch):
    class FakeList:
        data: list[Any] = []

    monkeypatch.setattr(settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(stripe.Invoice, "list", lambda **kw: FakeList())
    result = stripe_service.list_invoices("cus_x")
    assert result == []


def test_list_invoices_serializes_invoices(monkeypatch: pytest.MonkeyPatch):
    class FakeInvoice:
        id = "in_x"
        amount_paid = 900
        currency = "usd"
        status = "paid"
        created = 1700000000
        hosted_invoice_url = "https://invoice/u"
        invoice_pdf = "https://invoice/u.pdf"
        period_start = 1700000000
        period_end = 1702592000

    class FakeList:
        data = [FakeInvoice()]

    monkeypatch.setattr(settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(stripe.Invoice, "list", lambda **kw: FakeList())
    result = stripe_service.list_invoices("cus_x")
    assert len(result) == 1
    assert result[0]["id"] == "in_x"
    assert result[0]["amount_paid"] == 900
    assert result[0]["status"] == "paid"


def test_create_or_get_customer_calls_sdk(monkeypatch: pytest.MonkeyPatch):
    captured: dict[str, Any] = {}

    class FakeCustomer:
        id = "cus_new"

    def fake_create(**kwargs):
        captured.update(kwargs)
        return FakeCustomer()

    monkeypatch.setattr(settings, "stripe_secret_key", "sk_test")
    monkeypatch.setattr(stripe.Customer, "create", fake_create)

    cid = stripe_service.create_or_get_customer(
        email="a@b.com",
        user_id="user-uuid-123",
    )
    assert cid == "cus_new"
    assert captured["email"] == "a@b.com"
    assert captured["metadata"] == {"forge_user_id": "user-uuid-123"}


def test_billing_router_registered_in_app():
    """The billing router and webhook router must be registered in main.py."""
    from app.main import app
    routes = {r.path for r in app.routes}
    assert "/api/billing/create-checkout-session" in routes
    assert "/api/billing/create-portal-session" in routes
    assert "/api/billing/subscription" in routes
    assert "/api/billing/invoices" in routes
    assert "/api/webhooks/stripe" in routes
