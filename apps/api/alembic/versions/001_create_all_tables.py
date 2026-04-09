"""Create all 9 tables

Revision ID: 001
Revises: None
Create Date: 2026-04-09
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # 1. users
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("full_name", sa.String(255)),
        sa.Column("avatar_url", sa.String(500)),
        sa.Column("stripe_customer_id", sa.String(255)),
        sa.Column("plan", sa.String(20), server_default="free", nullable=False),
        sa.Column("query_count", sa.Integer, server_default="0", nullable=False),
        sa.Column("query_reset_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 2. accounts
    op.create_table(
        "accounts",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("plaid_account_id", sa.String(255), unique=True),
        sa.Column("plaid_item_id", sa.String(255)),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("official_name", sa.String(255)),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("subtype", sa.String(50)),
        sa.Column("mask", sa.String(10)),
        sa.Column("institution_name", sa.String(255)),
        sa.Column("institution_logo", sa.String(500)),
        sa.Column("balance_current", sa.Numeric(12, 2)),
        sa.Column("balance_available", sa.Numeric(12, 2)),
        sa.Column("currency", sa.String(3), server_default="USD", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_accounts_user_id", "accounts", ["user_id"])

    # 3. transactions
    op.create_table(
        "transactions",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("account_id", UUID(as_uuid=True), sa.ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("plaid_transaction_id", sa.String(255), unique=True),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("merchant_name", sa.String(255)),
        sa.Column("merchant_logo", sa.String(500)),
        sa.Column("category", sa.String(255)),
        sa.Column("subcategory", sa.String(255)),
        sa.Column("pending", sa.Boolean, server_default="false", nullable=False),
        sa.Column("notes", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    # Add vector column for embeddings via raw SQL (SQLAlchemy doesn't natively support vector type)
    op.execute("ALTER TABLE transactions ADD COLUMN embedding vector(1024)")
    op.create_index("ix_transactions_user_id", "transactions", ["user_id"])
    op.create_index("ix_transactions_account_id", "transactions", ["account_id"])
    op.create_index("ix_transactions_date", "transactions", ["date"])

    # 4. categories
    op.create_table(
        "categories",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("color", sa.String(7), server_default="#8B96A8", nullable=False),
        sa.Column("icon", sa.String(50)),
        sa.Column("is_default", sa.Boolean, server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_categories_user_id", "categories", ["user_id"])

    # 5. budgets
    op.create_table(
        "budgets",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("amount_limit", sa.Numeric(12, 2), nullable=False),
        sa.Column("period", sa.String(20), server_default="monthly", nullable=False),
        sa.Column("alert_threshold", sa.Integer, server_default="70", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_budgets_user_id", "budgets", ["user_id"])

    # 6. goals
    op.create_table(
        "goals",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("target_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("current_amount", sa.Numeric(12, 2), server_default="0", nullable=False),
        sa.Column("deadline", sa.Date),
        sa.Column("linked_account_id", UUID(as_uuid=True), sa.ForeignKey("accounts.id", ondelete="SET NULL")),
        sa.Column("status", sa.String(20), server_default="active", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_goals_user_id", "goals", ["user_id"])

    # 7. sync_log
    op.create_table(
        "sync_log",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("cursor", sa.Text),
        sa.Column("error_message", sa.Text),
        sa.Column("transactions_added", sa.Integer, server_default="0", nullable=False),
        sa.Column("transactions_modified", sa.Integer, server_default="0", nullable=False),
        sa.Column("transactions_removed", sa.Integer, server_default="0", nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_sync_log_user_id", "sync_log", ["user_id"])

    # 8. agent_log
    op.create_table(
        "agent_log",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("agent", sa.String(50), nullable=False),
        sa.Column("model", sa.String(100), nullable=False),
        sa.Column("input_tokens", sa.Integer, server_default="0", nullable=False),
        sa.Column("output_tokens", sa.Integer, server_default="0", nullable=False),
        sa.Column("cost", sa.Numeric(8, 6), server_default="0", nullable=False),
        sa.Column("duration_ms", sa.Integer, server_default="0", nullable=False),
        sa.Column("query", sa.String(500)),
        sa.Column("status", sa.String(20), server_default="success", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_agent_log_user_id", "agent_log", ["user_id"])

    # 9. conversations
    op.create_table(
        "conversations",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("messages", JSONB, server_default="[]", nullable=False),
        sa.Column("title", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_conversations_user_id", "conversations", ["user_id"])

    # Enable RLS on all user-specific tables
    for table in ["users", "accounts", "transactions", "categories", "budgets", "goals", "sync_log", "agent_log", "conversations"]:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")

    # RLS policies — users can only access their own rows
    # Users table: match on id = auth.uid()
    op.execute("""
        CREATE POLICY users_own_data ON users
        FOR ALL USING (id = auth.uid())
        WITH CHECK (id = auth.uid())
    """)

    # All other tables: match on user_id = auth.uid()
    for table in ["accounts", "transactions", "categories", "budgets", "goals", "sync_log", "agent_log", "conversations"]:
        op.execute(f"""
            CREATE POLICY {table}_own_data ON {table}
            FOR ALL USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid())
        """)


def downgrade() -> None:
    for table in ["conversations", "agent_log", "sync_log", "goals", "budgets", "categories", "transactions", "accounts", "users"]:
        op.drop_table(table)
    op.execute("DROP EXTENSION IF EXISTS vector")
