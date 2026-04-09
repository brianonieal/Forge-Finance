import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionRead, TransactionUpdate

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("")
async def list_transactions(
    account_id: str | None = Query(None),
    category: str | None = Query(None),
    start: str | None = Query(None),
    end: str | None = Query(None),
    search: str | None = Query(None),
    sort_by: str = Query("date"),
    sort_order: str = Query("desc"),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List transactions with filtering, sorting, and pagination."""
    query = select(Transaction).where(Transaction.user_id == user_id)

    if account_id:
        query = query.where(Transaction.account_id == account_id)
    if category:
        query = query.where(Transaction.category == category)
    if start:
        query = query.where(Transaction.date >= start)
    if end:
        query = query.where(Transaction.date <= end)
    if search:
        query = query.where(
            Transaction.merchant_name.ilike(f"%{search}%")
        )

    # Sorting
    sort_col = getattr(Transaction, sort_by, Transaction.date)
    if sort_order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Paginate
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    transactions = result.scalars().all()

    return {
        "transactions": [
            {
                "id": str(t.id),
                "account_id": str(t.account_id),
                "amount": float(t.amount),
                "date": str(t.date),
                "merchant_name": t.merchant_name,
                "merchant_logo": t.merchant_logo,
                "category": t.category,
                "subcategory": t.subcategory,
                "pending": t.pending,
                "notes": t.notes,
            }
            for t in transactions
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/{transaction_id}")
async def get_transaction(
    transaction_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get a single transaction by ID."""
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == user_id,
        )
    )
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return {
        "id": str(txn.id),
        "account_id": str(txn.account_id),
        "amount": float(txn.amount),
        "date": str(txn.date),
        "merchant_name": txn.merchant_name,
        "merchant_logo": txn.merchant_logo,
        "category": txn.category,
        "subcategory": txn.subcategory,
        "pending": txn.pending,
        "notes": txn.notes,
    }


@router.patch("/{transaction_id}/category")
async def recategorize_transaction(
    transaction_id: str,
    body: TransactionUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update transaction category or notes."""
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == user_id,
        )
    )
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if body.category is not None:
        txn.category = body.category
    if body.notes is not None:
        txn.notes = body.notes

    await db.commit()
    return {"status": "updated", "id": str(txn.id)}
