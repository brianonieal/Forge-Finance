from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.models.account import Account
from app.models.budget import Budget
from app.models.transaction import Transaction

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

PERIOD_DAYS = {
    "1D": 1,
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 365,
    "ALL": 3650,
}


def _period_start(period: str) -> date:
    days = PERIOD_DAYS.get(period, 30)
    return date.today() - timedelta(days=days)


@router.get("/metrics")
async def get_dashboard_metrics(
    period: str = Query("1M"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Dashboard metric cards: net worth, daily P&L, budget health, top spend."""
    start = _period_start(period)

    # Net worth: sum of all account balances
    net_worth_result = await db.execute(
        select(func.coalesce(func.sum(Account.balance_current), 0)).where(
            Account.user_id == user_id
        )
    )
    net_worth = float(net_worth_result.scalar())

    # Daily P&L: today's transactions sum
    today = date.today()
    daily_pnl_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.date == today,
        )
    )
    daily_pnl = float(daily_pnl_result.scalar())

    # Budget health: % of budgets under limit
    budgets_result = await db.execute(
        select(Budget).where(Budget.user_id == user_id)
    )
    budgets = budgets_result.scalars().all()
    budgets_on_track = 0
    total_budgets = len(budgets)
    for budget in budgets:
        spent_result = await db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.user_id == user_id,
                Transaction.category == budget.category,
                Transaction.date >= start,
            )
        )
        spent = abs(float(spent_result.scalar()))
        if spent <= float(budget.amount_limit):
            budgets_on_track += 1

    budget_health = (
        round(budgets_on_track / total_budgets * 100) if total_budgets > 0 else 100
    )

    # Top spending category this period
    top_spend_result = await db.execute(
        select(Transaction.category, func.sum(func.abs(Transaction.amount)).label("total"))
        .where(
            Transaction.user_id == user_id,
            Transaction.date >= start,
            Transaction.amount < 0,
        )
        .group_by(Transaction.category)
        .order_by(func.sum(func.abs(Transaction.amount)).desc())
        .limit(1)
    )
    top_spend_row = top_spend_result.first()
    top_spend_category = top_spend_row[0] if top_spend_row else None
    top_spend_amount = float(top_spend_row[1]) if top_spend_row else 0

    return {
        "net_worth": net_worth,
        "daily_pnl": daily_pnl,
        "budget_health": budget_health,
        "top_spend": {
            "category": top_spend_category or "None",
            "amount": top_spend_amount,
        },
        "period": period,
    }


@router.get("/spending-trend")
async def get_spending_trend(
    period: str = Query("1M"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Daily spending aggregates for trend chart."""
    start = _period_start(period)

    result = await db.execute(
        select(
            Transaction.date,
            func.sum(func.abs(Transaction.amount)).label("total"),
        )
        .where(
            Transaction.user_id == user_id,
            Transaction.date >= start,
            Transaction.amount < 0,
        )
        .group_by(Transaction.date)
        .order_by(Transaction.date)
    )

    return {
        "data": [
            {"date": str(row.date), "amount": float(row.total)}
            for row in result.all()
        ],
        "period": period,
    }


@router.get("/category-breakdown")
async def get_category_breakdown(
    period: str = Query("1M"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Spending by category for pie chart."""
    start = _period_start(period)

    result = await db.execute(
        select(
            Transaction.category,
            func.sum(func.abs(Transaction.amount)).label("total"),
        )
        .where(
            Transaction.user_id == user_id,
            Transaction.date >= start,
            Transaction.amount < 0,
        )
        .group_by(Transaction.category)
        .order_by(func.sum(func.abs(Transaction.amount)).desc())
    )

    return {
        "data": [
            {"category": row.category or "Uncategorized", "amount": float(row.total)}
            for row in result.all()
        ],
        "period": period,
    }
