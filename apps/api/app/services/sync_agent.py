"""@SYNC Agent — Plaid transaction sync with deduplication and embedding."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.account import Account
from app.models.sync_log import SyncLog
from app.models.transaction import Transaction
from app.services.embedding_service import embed_texts, format_transaction_for_embedding
from app.services.plaid_service import sync_transactions


async def run_sync(
    db: AsyncSession,
    user_id: str,
    access_token: str,
    item_id: str,
) -> dict:
    """Run a full transaction sync for a Plaid item.

    Cursor-based incremental sync with deduplication (ERR-PLAID-003).
    """
    # Get the latest cursor for this item
    result = await db.execute(
        select(SyncLog)
        .where(SyncLog.user_id == user_id, SyncLog.type == f"plaid_sync:{item_id}")
        .order_by(SyncLog.created_at.desc())
        .limit(1)
    )
    last_sync = result.scalar_one_or_none()
    cursor = last_sync.cursor if last_sync else None

    # Create sync log entry
    sync_log = SyncLog(
        id=uuid.uuid4(),
        user_id=user_id,
        type=f"plaid_sync:{item_id}",
        status="in_progress",
        cursor=cursor,
    )
    db.add(sync_log)
    await db.flush()

    try:
        # Fetch from Plaid
        sync_result = await sync_transactions(access_token, cursor)

        # Get accounts for this item
        accounts_result = await db.execute(
            select(Account).where(
                Account.user_id == user_id, Account.plaid_item_id == item_id
            )
        )
        accounts = {a.plaid_account_id: a for a in accounts_result.scalars().all()}

        added_count = 0
        modified_count = 0
        removed_count = 0

        # Process added transactions (with dedup on plaid_transaction_id — ERR-PLAID-003)
        for txn in sync_result["added"]:
            plaid_account_id = txn.account_id
            account = accounts.get(plaid_account_id)
            if not account:
                continue

            # Check for duplicate
            existing = await db.execute(
                select(Transaction).where(
                    Transaction.plaid_transaction_id == txn.transaction_id
                )
            )
            if existing.scalar_one_or_none():
                continue

            new_txn = Transaction(
                id=uuid.uuid4(),
                account_id=account.id,
                user_id=user_id,
                plaid_transaction_id=txn.transaction_id,
                amount=txn.amount,
                date=txn.date,
                merchant_name=getattr(txn, "merchant_name", None),
                merchant_logo=getattr(txn, "logo_url", None),
                category=txn.personal_finance_category.primary if hasattr(txn, "personal_finance_category") and txn.personal_finance_category else None,
                subcategory=txn.personal_finance_category.detailed if hasattr(txn, "personal_finance_category") and txn.personal_finance_category else None,
                pending=txn.pending,
            )
            db.add(new_txn)
            added_count += 1

        # Process modified transactions
        for txn in sync_result["modified"]:
            result = await db.execute(
                select(Transaction).where(
                    Transaction.plaid_transaction_id == txn.transaction_id
                )
            )
            existing_txn = result.scalar_one_or_none()
            if existing_txn:
                existing_txn.amount = txn.amount
                existing_txn.date = txn.date
                existing_txn.merchant_name = getattr(txn, "merchant_name", None)
                existing_txn.pending = txn.pending
                if hasattr(txn, "personal_finance_category") and txn.personal_finance_category:
                    existing_txn.category = txn.personal_finance_category.primary
                    existing_txn.subcategory = txn.personal_finance_category.detailed
                modified_count += 1

        # Process removed transactions
        for txn in sync_result["removed"]:
            result = await db.execute(
                select(Transaction).where(
                    Transaction.plaid_transaction_id == txn.transaction_id
                )
            )
            existing_txn = result.scalar_one_or_none()
            if existing_txn:
                await db.delete(existing_txn)
                removed_count += 1

        # Update sync log
        sync_log.status = "completed"
        sync_log.cursor = sync_result["cursor"]
        sync_log.transactions_added = added_count
        sync_log.transactions_modified = modified_count
        sync_log.transactions_removed = removed_count
        sync_log.completed_at = datetime.now(timezone.utc)

        await db.commit()

        # Generate embeddings for new transactions (async, non-blocking)
        if added_count > 0:
            await _embed_new_transactions(db, user_id)

        return {
            "status": "completed",
            "added": added_count,
            "modified": modified_count,
            "removed": removed_count,
            "cursor": sync_result["cursor"],
        }

    except Exception as e:
        sync_log.status = "error"
        sync_log.error_message = str(e)
        sync_log.completed_at = datetime.now(timezone.utc)
        await db.commit()
        raise


async def _embed_new_transactions(db: AsyncSession, user_id: str) -> None:
    """Generate embeddings for transactions missing them."""
    result = await db.execute(
        text(
            "SELECT id, merchant_name, amount, category, subcategory, date "
            "FROM transactions WHERE user_id = :user_id AND embedding IS NULL"
        ).bindparams(user_id=user_id)
    )
    rows = result.fetchall()
    if not rows:
        return

    texts = []
    ids = []
    for row in rows:
        parts = []
        if row.merchant_name:
            parts.append(f"merchant: {row.merchant_name}")
        parts.append(f"amount: ${abs(float(row.amount)):.2f}")
        if row.category:
            parts.append(f"category: {row.category}")
        parts.append(f"date: {row.date}")
        texts.append(" | ".join(parts))
        ids.append(row.id)

    try:
        embeddings = await embed_texts(texts)
        for txn_id, embedding in zip(ids, embeddings):
            await db.execute(
                text(
                    "UPDATE transactions SET embedding = :embedding WHERE id = :id"
                ).bindparams(embedding=str(embedding), id=txn_id)
            )
        await db.commit()
    except Exception:
        # Embedding failures are non-fatal — transactions are still synced
        pass
