"""Tests for @ORACLE agent logic."""

import pytest

from app.services.oracle_agent import _generate_response


@pytest.mark.asyncio
async def test_generate_response_no_transactions():
    """Empty transactions returns intro message."""
    response = await _generate_response("hello", "", [])
    assert "@ORACLE" in response or "AI financial assistant" in response


@pytest.mark.asyncio
async def test_generate_response_spending_query():
    """Spending query with data returns amount info."""
    txns = [
        {"merchant": "Starbucks", "amount": -4.50, "category": "Food", "date": "2026-04-09"},
        {"merchant": "Uber", "amount": -12.00, "category": "Transport", "date": "2026-04-08"},
    ]
    response = await _generate_response("how much did I spend?", "", txns)
    assert "Total spending" in response or "spending" in response.lower()


@pytest.mark.asyncio
async def test_generate_response_unusual_query():
    """Unusual transaction query returns scan result."""
    txns = [
        {"merchant": "Amazon", "amount": -250.00, "category": "Shopping", "date": "2026-04-09"},
    ]
    response = await _generate_response("any unusual transactions?", "", txns)
    assert "scanned" in response.lower() or "transaction" in response.lower()


@pytest.mark.asyncio
async def test_generate_response_savings_no_data():
    """Savings query without data returns guidance."""
    response = await _generate_response("how are my savings?", "", [])
    assert "savings" in response.lower() or "goal" in response.lower()


@pytest.mark.asyncio
async def test_generate_response_generic_with_data():
    """Generic query with data returns summary."""
    txns = [
        {"merchant": "Target", "amount": -85.00, "category": "Shopping", "date": "2026-04-09"},
    ]
    response = await _generate_response("tell me about my finances", "", txns)
    assert "Transactions found" in response or "summary" in response.lower()
