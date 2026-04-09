import uuid
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalRead, GoalUpdate

router = APIRouter(prefix="/api/goals", tags=["goals"])


def _compute_pace(goal) -> dict:
    """Compute pace indicator for a goal."""
    current = float(goal.current_amount)
    target = float(goal.target_amount)

    if target <= 0 or current >= target:
        return {"status": "on_track", "projected_date": None}

    if not goal.deadline:
        return {"status": "on_track", "projected_date": None}

    days_elapsed = (date.today() - goal.created_at.date()).days if goal.created_at else 1
    if days_elapsed <= 0:
        days_elapsed = 1

    daily_rate = current / days_elapsed
    if daily_rate <= 0:
        return {"status": "behind", "projected_date": None}

    remaining = target - current
    days_needed = int(remaining / daily_rate)
    projected = date.today() + timedelta(days=days_needed)

    diff = (projected - goal.deadline).days
    if diff <= 0:
        status = "on_track"
    elif diff <= 30:
        status = "slightly_behind"
    else:
        status = "behind"

    return {"status": status, "projected_date": projected.isoformat()}


def _goal_to_dict(g) -> dict:
    current = float(g.current_amount)
    target = float(g.target_amount)
    pct = round((current / target * 100), 1) if target > 0 else 0
    pace = _compute_pace(g)

    return {
        "id": str(g.id),
        "name": g.name,
        "target_amount": target,
        "current_amount": current,
        "percent": pct,
        "deadline": g.deadline.isoformat() if g.deadline else None,
        "linked_account_id": str(g.linked_account_id) if g.linked_account_id else None,
        "status": g.status,
        "pace": pace,
        "created_at": g.created_at.isoformat() if g.created_at else None,
    }


@router.get("")
async def list_goals(
    status: str = Query("all"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """List all goals with progress and pace indicators."""
    query = select(Goal).where(Goal.user_id == user_id)
    if status != "all":
        query = query.where(Goal.status == status)

    result = await db.execute(query.order_by(Goal.created_at.desc()))
    goals = result.scalars().all()

    active = [_goal_to_dict(g) for g in goals if g.status == "active"]
    completed = [_goal_to_dict(g) for g in goals if g.status == "completed"]
    paused = [_goal_to_dict(g) for g in goals if g.status == "paused"]

    return {
        "active": active,
        "completed": completed,
        "paused": paused,
        "total": len(goals),
    }


@router.post("", status_code=201)
async def create_goal(
    body: GoalCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a new savings goal."""
    goal = Goal(
        id=uuid.uuid4(),
        user_id=user_id,
        name=body.name,
        target_amount=body.target_amount,
        current_amount=0,
        deadline=body.deadline,
        linked_account_id=body.linked_account_id,
        status="active",
    )
    db.add(goal)
    await db.commit()
    await db.refresh(goal)

    return _goal_to_dict(goal)


@router.get("/{goal_id}")
async def get_goal(
    goal_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get goal detail with progress and pace."""
    result = await db.execute(
        select(Goal).where(
            Goal.id == goal_id,
            Goal.user_id == user_id,
        )
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    return _goal_to_dict(goal)


@router.patch("/{goal_id}")
async def update_goal(
    goal_id: str,
    body: GoalUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Update a goal (name, target, current_amount, deadline, status)."""
    result = await db.execute(
        select(Goal).where(
            Goal.id == goal_id,
            Goal.user_id == user_id,
        )
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    milestone_triggered = None

    if body.name is not None:
        goal.name = body.name
    if body.target_amount is not None:
        goal.target_amount = body.target_amount
    if body.deadline is not None:
        goal.deadline = body.deadline
    if body.status is not None:
        goal.status = body.status
    if body.current_amount is not None:
        old_pct = float(goal.current_amount) / float(goal.target_amount) * 100 if float(goal.target_amount) > 0 else 0
        goal.current_amount = body.current_amount
        new_pct = float(body.current_amount) / float(goal.target_amount) * 100 if float(goal.target_amount) > 0 else 0

        # Check milestone crossings
        for milestone in [25, 50, 75, 100]:
            if old_pct < milestone <= new_pct:
                milestone_triggered = milestone
                break

        # Auto-complete on 100%
        if new_pct >= 100:
            goal.status = "completed"

    await db.commit()

    response = {"status": "updated", "id": str(goal.id)}
    if milestone_triggered:
        response["milestone"] = milestone_triggered
    return response


@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a goal."""
    result = await db.execute(
        select(Goal).where(
            Goal.id == goal_id,
            Goal.user_id == user_id,
        )
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    await db.delete(goal)
    await db.commit()
    return {"status": "deleted", "id": goal_id}
