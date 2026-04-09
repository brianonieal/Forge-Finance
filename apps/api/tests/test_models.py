"""Test that all 9 SQLAlchemy models are correctly defined.

These tests verify model structure, relationships, and table metadata
without requiring a live database connection.
"""

from app.models import (
    Account,
    AgentLog,
    Base,
    Budget,
    Category,
    Conversation,
    Goal,
    SyncLog,
    Transaction,
    User,
)

ALL_MODELS = [
    User,
    Account,
    Transaction,
    Category,
    Budget,
    Goal,
    SyncLog,
    AgentLog,
    Conversation,
]


class TestUserModel:
    def test_tablename(self):
        assert User.__tablename__ == "users"

    def test_required_columns(self):
        columns = {c.name for c in User.__table__.columns}
        assert {
            "id",
            "email",
            "plan",
            "query_count",
            "created_at",
            "updated_at",
        }.issubset(columns)

    def test_email_unique(self):
        email_col = User.__table__.c.email
        assert email_col.unique is True


class TestAccountModel:
    def test_tablename(self):
        assert Account.__tablename__ == "accounts"

    def test_required_columns(self):
        columns = {c.name for c in Account.__table__.columns}
        assert {"id", "user_id", "name", "type", "currency"}.issubset(columns)

    def test_user_fk(self):
        fks = {fk.target_fullname for fk in Account.__table__.foreign_keys}
        assert "users.id" in fks


class TestTransactionModel:
    def test_tablename(self):
        assert Transaction.__tablename__ == "transactions"

    def test_required_columns(self):
        columns = {c.name for c in Transaction.__table__.columns}
        assert {"id", "account_id", "user_id", "amount", "date"}.issubset(columns)

    def test_dual_fk(self):
        fks = {fk.target_fullname for fk in Transaction.__table__.foreign_keys}
        assert "users.id" in fks
        assert "accounts.id" in fks


class TestCategoryModel:
    def test_tablename(self):
        assert Category.__tablename__ == "categories"

    def test_has_color_default(self):
        color_col = Category.__table__.c.color
        assert color_col.server_default is not None


class TestBudgetModel:
    def test_tablename(self):
        assert Budget.__tablename__ == "budgets"

    def test_required_columns(self):
        columns = {c.name for c in Budget.__table__.columns}
        assert {"id", "user_id", "category", "amount_limit", "period"}.issubset(columns)


class TestGoalModel:
    def test_tablename(self):
        assert Goal.__tablename__ == "goals"

    def test_optional_deadline(self):
        deadline_col = Goal.__table__.c.deadline
        assert deadline_col.nullable is True


class TestSyncLogModel:
    def test_tablename(self):
        assert SyncLog.__tablename__ == "sync_log"

    def test_tracking_columns(self):
        columns = {c.name for c in SyncLog.__table__.columns}
        assert {
            "transactions_added",
            "transactions_modified",
            "transactions_removed",
        }.issubset(columns)


class TestAgentLogModel:
    def test_tablename(self):
        assert AgentLog.__tablename__ == "agent_log"

    def test_cost_tracking(self):
        columns = {c.name for c in AgentLog.__table__.columns}
        assert {
            "agent",
            "model",
            "input_tokens",
            "output_tokens",
            "cost",
            "duration_ms",
        }.issubset(columns)


class TestConversationModel:
    def test_tablename(self):
        assert Conversation.__tablename__ == "conversations"

    def test_messages_jsonb(self):
        from sqlalchemy.dialects.postgresql import JSONB

        msg_col = Conversation.__table__.c.messages
        assert isinstance(msg_col.type, JSONB)


class TestAllModels:
    def test_nine_tables_registered(self):
        table_names = {t.name for t in Base.metadata.sorted_tables}
        expected = {
            "users",
            "accounts",
            "transactions",
            "categories",
            "budgets",
            "goals",
            "sync_log",
            "agent_log",
            "conversations",
        }
        assert expected == table_names

    def test_all_have_timestamps(self):
        for model in ALL_MODELS:
            columns = {c.name for c in model.__table__.columns}
            assert "created_at" in columns, f"{model.__tablename__} missing created_at"
            assert "updated_at" in columns, f"{model.__tablename__} missing updated_at"
