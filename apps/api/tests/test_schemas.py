"""Test Pydantic v2 schemas validate correctly."""

import uuid
from datetime import date, datetime
from decimal import Decimal

from app.schemas import (
    BudgetCreate,
    GoalCreate,
    UserRead,
)


class TestUserSchema:
    def test_user_read(self):
        user = UserRead(
            id=uuid.uuid4(),
            email="test@example.com",
            full_name="Test User",
            plan="free",
            query_count=0,
            created_at=datetime.now(),
        )
        assert user.plan == "free"
        assert user.query_count == 0


class TestBudgetSchema:
    def test_budget_create_defaults(self):
        budget = BudgetCreate(category="Food", amount_limit=Decimal("500.00"))
        assert budget.period == "monthly"
        assert budget.alert_threshold == 70

    def test_budget_create_custom(self):
        budget = BudgetCreate(
            category="Transport",
            amount_limit=Decimal("200.00"),
            period="weekly",
            alert_threshold=80,
        )
        assert budget.period == "weekly"


class TestGoalSchema:
    def test_goal_create_minimal(self):
        goal = GoalCreate(name="Emergency Fund", target_amount=Decimal("10000"))
        assert goal.deadline is None
        assert goal.linked_account_id is None

    def test_goal_create_full(self):
        goal = GoalCreate(
            name="Vacation",
            target_amount=Decimal("5000"),
            deadline=date(2026, 12, 31),
            linked_account_id=uuid.uuid4(),
        )
        assert goal.deadline == date(2026, 12, 31)
