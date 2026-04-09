import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetRead, BudgetUpdate

router = APIRouter(prefix="/api/budgets", tags=["budgets"])


@router.get("")
async def list_budgets(
    period: str = Query("monthly"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List all budgets with current spending for the period."""
    result = await db.execute(
        select(Budget).where(
            Budget.user_id == user_id,
            Budget.period == period,
        )
    )
    budgets = result.scalars().all()

    budget_list = []
    for b in budgets:
        # Calculate current spending for this category
        spend_result = await db.execute(
            select(func.coalesce(func.sum(func.abs(Transaction.amount)), 0)).where(
                Transaction.user_id == user_id,
                Transaction.category == b.category,
                Transaction.amount < 0,
            )
        )
        spent = float(spend_result.scalar() or 0)
        limit_val = float(b.amount_limit)
        pct = round((spent / limit_val * 100), 1) if limit_val > 0 else 0

        if pct >= 90:
            status = "over_budget"
        elif pct >= 70:
            status = "warning"
        else:
            status = "on_track"

        budget_list.append({
            "id": str(b.id),
            "category": b.category,
            "amount_limit": limit_val,
            "spent": spent,
            "remaining": max(limit_val - spent, 0),
            "percent": pct,
            "status": status,
            "period": b.period,
            "alert_threshold": b.alert_threshold,
            "created_at": b.created_at.isoformat() if b.created_at else None,
        })

    # Overall health: percentage of budgets on track
    total = len(budget_list)
    on_track = sum(1 for b in budget_list if b["status"] == "on_track")
    health = round((on_track / total * 100), 1) if total > 0 else 100

    return {
        "budgets": budget_list,
        "health": health,
        "total": total,
        "on_track": on_track,
    }


@router.post("", status_code=201)
async def create_budget(
    body: BudgetCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a new budget."""
    budget = Budget(
        id=uuid.uuid4(),
        user_id=user_id,
        category=body.category,
        amount_limit=body.amount_limit,
        period=body.period,
        alert_threshold=body.alert_threshold,
    )
    db.add(budget)
    await db.commit()
    await db.refresh(budget)

    return {
        "id": str(budget.id),
        "category": budget.category,
        "amount_limit": float(budget.amount_limit),
        "period": budget.period,
        "alert_threshold": budget.alert_threshold,
    }


@router.get("/{budget_id}")
async def get_budget(
    budget_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get budget detail with spending breakdown."""
    result = await db.execute(
        select(Budget).where(
            Budget.id == budget_id,
            Budget.user_id == user_id,
        )
    )
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    # Get spending for this category
    spend_result = await db.execute(
        select(func.coalesce(func.sum(func.abs(Transaction.amount)), 0)).where(
            Transaction.user_id == user_id,
            Transaction.category == budget.category,
            Transaction.amount < 0,
        )
    )
    spent = float(spend_result.scalar() or 0)
    limit_val = float(budget.amount_limit)

    # Get transactions for this category
    txn_result = await db.execute(
        select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.category == budget.category,
        ).order_by(Transaction.date.desc()).limit(50)
    )
    transactions = txn_result.scalars().all()

    return {
        "id": str(budget.id),
        "category": budget.category,
        "amount_limit": limit_val,
        "spent": spent,
        "remaining": max(limit_val - spent, 0),
        "percent": round((spent / limit_val * 100), 1) if limit_val > 0 else 0,
        "period": budget.period,
        "alert_threshold": budget.alert_threshold,
        "transactions": [
            {
                "id": str(t.id),
                "amount": float(t.amount),
                "date": str(t.date),
                "merchant_name": t.merchant_name,
                "category": t.category,
                "pending": t.pending,
            }
            for t in transactions
        ],
    }


@router.patch("/{budget_id}")
async def update_budget(
    budget_id: str,
    body: BudgetUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update a budget."""
    result = await db.execute(
        select(Budget).where(
            Budget.id == budget_id,
            Budget.user_id == user_id,
        )
    )
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    if body.category is not None:
        budget.category = body.category
    if body.amount_limit is not None:
        budget.amount_limit = body.amount_limit
    if body.period is not None:
        budget.period = body.period
    if body.alert_threshold is not None:
        budget.alert_threshold = body.alert_threshold

    await db.commit()
    return {"status": "updated", "id": str(budget.id)}


@router.delete("/{budget_id}")
async def delete_budget(
    budget_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a budget."""
    result = await db.execute(
        select(Budget).where(
            Budget.id == budget_id,
            Budget.user_id == user_id,
        )
    )
    budget = result.scalar_one_or_none()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    await db.delete(budget)
    await db.commit()
    return {"status": "deleted", "id": budget_id}
