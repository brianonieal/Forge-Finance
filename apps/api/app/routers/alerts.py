import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.models.budget import Budget
from app.models.goal import Goal
from app.models.transaction import Transaction

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

# In-memory alert state (per-user read/dismissed tracking for MVP)
_read_alerts: dict[str, set[str]] = {}
_dismissed_alerts: dict[str, set[str]] = {}


def _get_user_read(user_id: str) -> set:
    return _read_alerts.setdefault(user_id, set())


def _get_user_dismissed(user_id: str) -> set:
    return _dismissed_alerts.setdefault(user_id, set())


@router.get("")
async def list_alerts(
    filter_type: str = Query("all"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Generate alerts from current budget/goal state."""
    alerts = []
    read_set = _get_user_read(user_id)
    dismissed_set = _get_user_dismissed(user_id)

    # Budget alerts
    budgets_result = await db.execute(
        select(Budget).where(Budget.user_id == user_id)
    )
    budgets = budgets_result.scalars().all()

    for b in budgets:
        spend_result = await db.execute(
            select(func.coalesce(func.sum(func.abs(Transaction.amount)), 0)).where(
                Transaction.user_id == user_id,
                Transaction.category == b.category,
                Transaction.amount < 0,
            )
        )
        spent = float(spend_result.scalar() or 0)
        limit_val = float(b.amount_limit)
        pct = (spent / limit_val * 100) if limit_val > 0 else 0

        alert_id = f"budget-{b.id}"
        if alert_id in dismissed_set:
            continue

        if pct >= 100:
            alerts.append({
                "id": alert_id,
                "type": "budget",
                "severity": "critical",
                "title": f"{b.category} budget exceeded",
                "description": f"You've spent ${spent:.2f} of your ${limit_val:.2f} budget ({pct:.0f}%)",
                "is_read": alert_id in read_set,
                "timestamp": datetime.utcnow().isoformat(),
                "link": f"/budgets/{b.id}",
            })
        elif pct >= 90:
            alerts.append({
                "id": alert_id,
                "type": "budget",
                "severity": "warning",
                "title": f"{b.category} budget at {pct:.0f}%",
                "description": f"You've spent ${spent:.2f} of your ${limit_val:.2f} budget",
                "is_read": alert_id in read_set,
                "timestamp": datetime.utcnow().isoformat(),
                "link": f"/budgets/{b.id}",
            })
        elif pct >= 70:
            alerts.append({
                "id": alert_id,
                "type": "budget",
                "severity": "info",
                "title": f"{b.category} budget at {pct:.0f}%",
                "description": f"You've spent ${spent:.2f} of your ${limit_val:.2f} budget",
                "is_read": alert_id in read_set,
                "timestamp": datetime.utcnow().isoformat(),
                "link": f"/budgets/{b.id}",
            })

    # Goal alerts
    goals_result = await db.execute(
        select(Goal).where(Goal.user_id == user_id, Goal.status == "active")
    )
    goals = goals_result.scalars().all()

    for g in goals:
        current = float(g.current_amount)
        target = float(g.target_amount)
        pct = (current / target * 100) if target > 0 else 0

        for milestone in [25, 50, 75, 100]:
            if pct >= milestone:
                alert_id = f"goal-{g.id}-{milestone}"
                if alert_id in dismissed_set:
                    continue
                alerts.append({
                    "id": alert_id,
                    "type": "goal",
                    "severity": "success" if milestone == 100 else "info",
                    "title": f"{'🎉 ' if milestone == 100 else ''}{g.name}: {milestone}% reached!",
                    "description": f"${current:.2f} of ${target:.2f} saved",
                    "is_read": alert_id in read_set,
                    "timestamp": datetime.utcnow().isoformat(),
                    "link": f"/goals/{g.id}",
                })

    # Filter by type
    if filter_type != "all":
        alerts = [a for a in alerts if a["type"] == filter_type]

    unread = sum(1 for a in alerts if not a["is_read"])

    return {
        "alerts": alerts,
        "total": len(alerts),
        "unread": unread,
    }


@router.patch("/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Mark a single alert as read."""
    _get_user_read(user_id).add(alert_id)
    return {"status": "read", "id": alert_id}


@router.post("/{alert_id}/dismiss")
async def dismiss_alert(
    alert_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Dismiss an alert (hide it permanently)."""
    _get_user_dismissed(user_id).add(alert_id)
    return {"status": "dismissed", "id": alert_id}


@router.post("/mark-all-read")
async def mark_all_read(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Mark all alerts as read."""
    # Get all current alert IDs
    alerts_response = await list_alerts(filter_type="all", user_id=user_id, db=db)
    read_set = _get_user_read(user_id)
    for a in alerts_response["alerts"]:
        read_set.add(a["id"])
    return {"status": "all_read"}
