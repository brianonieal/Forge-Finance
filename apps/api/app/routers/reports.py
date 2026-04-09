from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.models.transaction import Transaction

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/monthly-summary")
async def monthly_summary(
    months: int = Query(6, le=12),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Monthly income vs expenses summary."""
    result = await db.execute(
        select(
            extract("year", Transaction.date).label("year"),
            extract("month", Transaction.date).label("month"),
            func.sum(
                func.case(
                    (Transaction.amount > 0, Transaction.amount),
                    else_=0,
                )
            ).label("income"),
            func.sum(
                func.case(
                    (Transaction.amount < 0, func.abs(Transaction.amount)),
                    else_=0,
                )
            ).label("expenses"),
        ).where(
            Transaction.user_id == user_id,
        ).group_by("year", "month").order_by("year", "month").limit(months)
    )
    rows = result.all()

    return {
        "months": [
            {
                "year": int(r.year),
                "month": int(r.month),
                "income": float(r.income or 0),
                "expenses": float(r.expenses or 0),
                "net": float((r.income or 0) - (r.expenses or 0)),
            }
            for r in rows
        ],
    }


@router.get("/category-trends")
async def category_trends(
    months: int = Query(3, le=12),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Spending by category over time."""
    result = await db.execute(
        select(
            Transaction.category,
            func.sum(func.abs(Transaction.amount)).label("total"),
            func.count().label("count"),
        ).where(
            Transaction.user_id == user_id,
            Transaction.amount < 0,
            Transaction.category.isnot(None),
        ).group_by(Transaction.category).order_by(func.sum(func.abs(Transaction.amount)).desc()).limit(10)
    )
    rows = result.all()

    return {
        "categories": [
            {
                "category": r.category,
                "total": float(r.total or 0),
                "count": int(r.count),
            }
            for r in rows
        ],
    }
