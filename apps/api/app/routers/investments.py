from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.models.account import Account
from app.models.transaction import Transaction

router = APIRouter(prefix="/api/investments", tags=["investments"])


@router.get("/holdings")
async def get_holdings(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get investment holdings derived from investment-type accounts."""
    result = await db.execute(
        select(Account).where(
            Account.user_id == user_id,
            Account.type.in_(["investment", "brokerage", "401k", "ira"]),
        )
    )
    accounts = result.scalars().all()

    holdings = []
    total_value = 0.0

    for a in accounts:
        balance = float(a.balance_current or 0)
        total_value += balance
        holdings.append({
            "id": str(a.id),
            "name": a.name,
            "official_name": a.official_name,
            "type": a.type,
            "subtype": a.subtype,
            "institution_name": a.institution_name,
            "balance": balance,
            "currency": a.currency,
        })

    # Allocation by account type
    allocation = {}
    for h in holdings:
        key = h["subtype"] or h["type"] or "Other"
        allocation[key] = allocation.get(key, 0) + h["balance"]

    return {
        "holdings": holdings,
        "total_value": total_value,
        "allocation": [
            {"type": k, "value": v, "percent": round(v / total_value * 100, 1) if total_value > 0 else 0}
            for k, v in sorted(allocation.items(), key=lambda x: -x[1])
        ],
    }


@router.get("/performance")
async def get_performance(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get portfolio performance over time from transaction history."""
    result = await db.execute(
        select(Account).where(
            Account.user_id == user_id,
            Account.type.in_(["investment", "brokerage", "401k", "ira"]),
        )
    )
    accounts = result.scalars().all()
    account_ids = [str(a.id) for a in accounts]

    if not account_ids:
        return {"data": [], "total_value": 0, "total_gain": 0}

    # Get transactions for investment accounts grouped by date
    txn_result = await db.execute(
        select(
            Transaction.date,
            func.sum(Transaction.amount).label("daily_total"),
        ).where(
            Transaction.account_id.in_(account_ids),
            Transaction.user_id == user_id,
        ).group_by(Transaction.date).order_by(Transaction.date)
    )
    rows = txn_result.all()

    # Build cumulative balance over time
    cumulative = 0.0
    data = []
    for r in rows:
        cumulative += float(r.daily_total or 0)
        data.append({
            "date": str(r.date),
            "value": round(cumulative, 2),
        })

    total_value = sum(float(a.balance_current or 0) for a in accounts)
    total_gain = total_value - (data[0]["value"] if data else 0)

    return {
        "data": data,
        "total_value": total_value,
        "total_gain": round(total_gain, 2),
    }
