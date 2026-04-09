import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.models.agent_log import AgentLog
from app.models.conversation import Conversation
from app.services.oracle_agent import check_query_limit, process_query

router = APIRouter(prefix="/api/oracle", tags=["oracle"])


class QueryRequest(BaseModel):
    query: str
    conversation_id: str | None = None


@router.post("/query")
async def oracle_query(
    body: QueryRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Process a query through @ORACLE with SSE streaming response."""
    # Check query limits
    limit_check = await check_query_limit(db, user_id)
    if not limit_check["allowed"]:
        if limit_check["reason"] == "monthly_limit":
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "message": "You've reached your monthly AI query limit.",
                    "queries_used": limit_check["queries_used"],
                    "queries_limit": limit_check["queries_limit"],
                    "upgrade_prompt": "Upgrade to Pro for unlimited queries.",
                },
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "message": "Monthly cost ceiling reached.",
                    "monthly_cost": limit_check["monthly_cost"],
                },
            )

    return StreamingResponse(
        process_query(db, user_id, body.query, body.conversation_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Conversation-Id": str(body.conversation_id or "new"),
        },
    )


@router.get("/history")
async def get_conversation_history(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get all conversations for the current user."""
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    )
    conversations = result.scalars().all()

    return {
        "conversations": [
            {
                "id": str(c.id),
                "title": c.title,
                "messages": c.messages,
                "created_at": str(c.created_at),
                "updated_at": str(c.updated_at),
            }
            for c in conversations
        ]
    }


@router.get("/usage")
async def get_oracle_usage(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Get current month's @ORACLE usage stats."""
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    count_result = await db.execute(
        select(func.count()).where(
            AgentLog.user_id == user_id,
            AgentLog.agent == "oracle",
            AgentLog.created_at >= month_start,
        )
    )
    query_count = count_result.scalar()

    cost_result = await db.execute(
        select(func.coalesce(func.sum(AgentLog.cost), 0)).where(
            AgentLog.user_id == user_id,
            AgentLog.agent == "oracle",
            AgentLog.created_at >= month_start,
        )
    )
    monthly_cost = float(cost_result.scalar())

    return {
        "queries_used": query_count,
        "queries_limit": 10,
        "monthly_cost": round(monthly_cost, 6),
        "cost_ceiling": 0.50,
        "is_pro": False,
    }
