"""Add unique index on users.stripe_customer_id for fast webhook lookups

Revision ID: 002
Revises: 001
Create Date: 2026-04-16

The stripe_customer_id column was created in migration 001 alongside the users
table. This migration adds a unique partial index on it so Stripe webhook
handlers can find the corresponding user in O(log n) instead of scanning the
table. The index is partial (WHERE stripe_customer_id IS NOT NULL) because most
users on the free tier never get a Stripe customer record.
"""
from typing import Sequence, Union

from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "CREATE UNIQUE INDEX ix_users_stripe_customer_id "
        "ON users (stripe_customer_id) "
        "WHERE stripe_customer_id IS NOT NULL"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_users_stripe_customer_id")
