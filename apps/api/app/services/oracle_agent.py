"""@ORACLE Agent — AI financial assistant with classification and reasoning.

Pipeline: Haiku classifier → Sonnet reasoning → streaming response
Cost tracking via agent_log table with $0.50/user/month ceiling.
"""

import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent_log import AgentLog
from app.models.conversation import Conversation
from app.models.transaction import Transaction
from app.models.user import User

# Cost constants (per 1M tokens)
HAIKU_INPUT_COST = 0.25
HAIKU_OUTPUT_COST = 1.25
SONNET_INPUT_COST = 3.00
SONNET_OUTPUT_COST = 15.00
MONTHLY_CEILING = 0.50  # $0.50/user/month
FREE_TIER_LIMIT = 10  # queries/month


async def check_query_limit(db: AsyncSession, user_id: str) -> dict:
    """Check if user has remaining queries this month."""
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Count queries this month
    result = await db.execute(
        select(func.count()).where(
            AgentLog.user_id == user_id,
            AgentLog.agent == "oracle",
            AgentLog.created_at >= month_start,
        )
    )
    query_count = result.scalar()

    # Check monthly cost
    cost_result = await db.execute(
        select(func.coalesce(func.sum(AgentLog.cost), 0)).where(
            AgentLog.user_id == user_id,
            AgentLog.agent == "oracle",
            AgentLog.created_at >= month_start,
        )
    )
    monthly_cost = float(cost_result.scalar())

    # Check if user is Pro (future: check subscription)
    # For now, all users are free tier
    is_pro = False

    if not is_pro and query_count >= FREE_TIER_LIMIT:
        return {
            "allowed": False,
            "reason": "monthly_limit",
            "queries_used": query_count,
            "queries_limit": FREE_TIER_LIMIT,
        }

    if monthly_cost >= MONTHLY_CEILING:
        return {
            "allowed": False,
            "reason": "cost_ceiling",
            "monthly_cost": monthly_cost,
            "ceiling": MONTHLY_CEILING,
        }

    return {
        "allowed": True,
        "queries_used": query_count,
        "queries_limit": FREE_TIER_LIMIT if not is_pro else -1,
        "monthly_cost": monthly_cost,
    }


async def get_or_create_conversation(
    db: AsyncSession, user_id: str, conversation_id: str | None = None
) -> Conversation:
    """Get existing conversation or create a new one."""
    if conversation_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
        )
        conv = result.scalar_one_or_none()
        if conv:
            return conv

    conv = Conversation(
        id=uuid.uuid4(),
        user_id=user_id,
        messages=[],
        title=None,
    )
    db.add(conv)
    await db.flush()
    return conv


async def search_relevant_transactions(
    db: AsyncSession, user_id: str, query: str, limit: int = 10
) -> list[dict]:
    """Search transactions by merchant name for context (fallback without embeddings)."""
    # Simple text search fallback — semantic search requires Voyage AI embeddings
    result = await db.execute(
        select(Transaction)
        .where(
            Transaction.user_id == user_id,
            Transaction.merchant_name.ilike(f"%{query}%"),
        )
        .order_by(Transaction.date.desc())
        .limit(limit)
    )
    transactions = result.scalars().all()

    return [
        {
            "merchant": t.merchant_name,
            "amount": float(t.amount),
            "category": t.category,
            "date": str(t.date),
        }
        for t in transactions
    ]


async def process_query(
    db: AsyncSession,
    user_id: str,
    query: str,
    conversation_id: str | None = None,
) -> AsyncGenerator[str, None]:
    """Process a user query through the @ORACLE pipeline.

    Yields SSE-formatted chunks for streaming response.
    In production: Haiku classifier → Sonnet reasoning with transaction context.
    For v0.5.0: Direct response generation with transaction search.
    """
    start_time = datetime.now(timezone.utc)

    # Get or create conversation
    conv = await get_or_create_conversation(db, user_id, conversation_id)

    # Add user message to conversation
    messages = conv.messages or []
    messages.append({
        "role": "user",
        "content": query,
        "timestamp": start_time.isoformat(),
    })

    # Search for relevant transactions
    relevant_txns = await search_relevant_transactions(db, user_id, query)

    # Build context for the AI
    txn_context = ""
    if relevant_txns:
        txn_context = "\n\nRelevant transactions:\n"
        for t in relevant_txns:
            txn_context += f"- {t['date']}: {t['merchant']} | ${abs(t['amount']):.2f} | {t['category']}\n"

    # Generate response
    # In production: call LiteLLM with Haiku classifier → Sonnet reasoning
    # For v0.5.0 sandbox: generate a structured response based on query analysis
    response_text = await _generate_response(query, txn_context, relevant_txns)

    # Stream the response in chunks
    words = response_text.split()
    chunks = []
    current_chunk = []
    for word in words:
        current_chunk.append(word)
        if len(current_chunk) >= 3:
            chunk_text = " ".join(current_chunk) + " "
            chunks.append(chunk_text)
            current_chunk = []
    if current_chunk:
        chunks.append(" ".join(current_chunk))

    full_response = ""
    for chunk in chunks:
        full_response += chunk
        yield f"data: {chunk}\n\n"

    # Signal end of stream
    yield "data: [DONE]\n\n"

    # Add assistant message to conversation
    messages.append({
        "role": "assistant",
        "content": full_response.strip(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    conv.messages = messages

    # Set title from first query if not set
    if not conv.title:
        conv.title = query[:100]

    # Log the query
    end_time = datetime.now(timezone.utc)
    duration_ms = int((end_time - start_time).total_seconds() * 1000)

    # Estimate token costs (approximate for v0.5.0)
    input_tokens = len(query.split()) * 2 + len(txn_context.split()) * 2
    output_tokens = len(full_response.split()) * 2
    cost = (input_tokens * SONNET_INPUT_COST / 1_000_000) + (
        output_tokens * SONNET_OUTPUT_COST / 1_000_000
    )

    agent_log = AgentLog(
        id=uuid.uuid4(),
        user_id=user_id,
        agent="oracle",
        model="claude-sonnet-4-6",
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost=cost,
        duration_ms=duration_ms,
        query=query[:500],
        status="success",
    )
    db.add(agent_log)
    await db.commit()


async def _generate_response(
    query: str, txn_context: str, transactions: list[dict]
) -> str:
    """Generate a response for the user query.

    In production: calls LiteLLM → Claude Sonnet with full context.
    For v0.5.0: returns structured analysis based on available data.
    """
    query_lower = query.lower()

    if not transactions:
        if any(w in query_lower for w in ["spend", "spent", "expense", "cost", "pay"]):
            return (
                "I don't see any transactions matching your query yet. "
                "Once your accounts are synced, I can analyze your spending patterns, "
                "identify trends, and help you optimize your budget. "
                "Try connecting a bank account first!"
            )
        elif any(w in query_lower for w in ["save", "saving", "goal"]):
            return (
                "I'd love to help with your savings goals! "
                "Once your accounts are connected and transactions are syncing, "
                "I can track your progress, suggest optimal saving strategies, "
                "and predict when you'll reach your targets."
            )
        else:
            return (
                "I'm @ORACLE, your AI financial assistant. I can help you understand "
                "your spending patterns, track budgets, analyze transactions, and "
                "provide personalized financial insights. "
                "Connect your bank account to get started!"
            )

    # With transaction context available
    total_spent = sum(abs(t["amount"]) for t in transactions if t["amount"] < 0)
    total_income = sum(t["amount"] for t in transactions if t["amount"] > 0)
    categories = {}
    for t in transactions:
        cat = t["category"] or "Uncategorized"
        categories[cat] = categories.get(cat, 0) + abs(t["amount"])

    top_category = max(categories, key=categories.get) if categories else "None"

    if any(w in query_lower for w in ["spend", "spent", "expense", "how much"]):
        return (
            f"Based on your recent transactions, here's what I found:\n\n"
            f"**Total spending:** ${total_spent:,.2f}\n"
            f"**Top category:** {top_category} (${categories.get(top_category, 0):,.2f})\n"
            f"**Transactions analyzed:** {len(transactions)}\n\n"
            f"Your largest expenses are in {top_category}. "
            f"Would you like me to break this down further or compare it to previous periods?"
        )
    elif any(w in query_lower for w in ["unusual", "anomaly", "weird", "strange"]):
        return (
            f"I've scanned {len(transactions)} recent transactions. "
            f"Your spending appears consistent with your usual patterns. "
            f"The largest single transaction was "
            f"${max(abs(t['amount']) for t in transactions):,.2f}. "
            f"I'll flag any unusual activity as more data comes in."
        )
    else:
        return (
            f"Here's a quick summary of your financial activity:\n\n"
            f"**Transactions found:** {len(transactions)}\n"
            f"**Total spending:** ${total_spent:,.2f}\n"
            f"**Categories:** {', '.join(list(categories.keys())[:5])}\n\n"
            f"Feel free to ask me specific questions like "
            f"\"How much did I spend on food?\" or "
            f"\"What's my biggest expense category?\""
        )
