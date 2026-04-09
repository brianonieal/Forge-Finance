from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.models.account import Account
from app.models.transaction import Transaction

router = APIRouter(prefix="/api/net-worth", tags=["net-worth"])

# Account types classified as assets vs liabilities
ASSET_TYPES = {"depository", "investment", "brokerage", "401k", "ira", "savings", "checking"}
LIABILITY_TYPES = {"credit", "loan", "mortgage"}


@router.get("/summary")
async def get_summary(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get net worth summary: assets, liabilities, net worth, and account breakdown."""
    result = await db.execute(
        select(Account).where(Account.user_id == user_id)
    )
    accounts = result.scalars().all()

    assets = []
    liabilities = []
    total_assets = 0.0
    total_liabilities = 0.0

    for a in accounts:
        balance = float(a.balance_current or 0)
        account_data = {
            "id": str(a.id),
            "name": a.name,
            "type": a.type,
            "subtype": a.subtype,
            "institution_name": a.institution_name,
            "balance": abs(balance),
        }

        acct_type = (a.type or "").lower()
        if acct_type in LIABILITY_TYPES:
            liabilities.append(account_data)
            total_liabilities += abs(balance)
        else:
            assets.append(account_data)
            total_assets += balance

    net_worth = total_assets - total_liabilities

    return {
        "net_worth": round(net_worth, 2),
        "total_assets": round(total_assets, 2),
        "total_liabilities": round(total_liabilities, 2),
        "assets": sorted(assets, key=lambda x: -x["balance"]),
        "liabilities": sorted(liabilities, key=lambda x: -x["balance"]),
    }


@router.get("/trend")
async def get_trend(
    months: int = Query(6, le=12),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get net worth trend over time from transaction history."""
    result = await db.execute(
        select(Account).where(Account.user_id == user_id)
    )
    accounts = result.scalars().all()

    current_total = sum(float(a.balance_current or 0) for a in accounts)
    account_ids = [str(a.id) for a in accounts]

    if not account_ids:
        return {"data": [], "current": 0}

    # Get daily transaction totals
    txn_result = await db.execute(
        select(
            Transaction.date,
            func.sum(Transaction.amount).label("daily_net"),
        ).where(
            Transaction.user_id == user_id,
        ).group_by(Transaction.date).order_by(Transaction.date)
    )
    rows = txn_result.all()

    # Build cumulative net worth trend
    cumulative = 0.0
    data = []
    for r in rows:
        cumulative += float(r.daily_net or 0)
        data.append({
            "date": str(r.date),
            "net_worth": round(cumulative, 2),
        })

    return {
        "data": data,
        "current": round(current_total, 2),
    }
