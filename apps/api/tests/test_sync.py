"""Tests for @SYNC agent and embedding service."""

import pytest

from app.services.embedding_service import (
    EXPECTED_DIMENSION,
    format_transaction_for_embedding,
)


class MockTransaction:
    def __init__(self, merchant_name="Starbucks", amount=4.50, category="Food", date="2026-04-09", subcategory="Coffee"):
        self.merchant_name = merchant_name
        self.amount = amount
        self.category = category
        self.date = date
        self.subcategory = subcategory


def test_format_transaction_for_embedding_full():
    """Full transaction formats all fields."""
    txn = MockTransaction()
    text = format_transaction_for_embedding(txn)
    assert "merchant: Starbucks" in text
    assert "amount: $4.50" in text
    assert "category: Food" in text
    assert "date: 2026-04-09" in text
    assert "subcategory: Coffee" in text


def test_format_transaction_for_embedding_minimal():
    """Transaction with only amount still formats."""
    txn = MockTransaction(merchant_name=None, category=None, subcategory=None)
    text = format_transaction_for_embedding(txn)
    assert "amount: $4.50" in text
    assert "merchant" not in text
    assert "category" not in text


def test_format_transaction_negative_amount():
    """Negative amounts show as positive in embedding text."""
    txn = MockTransaction(amount=-125.00)
    text = format_transaction_for_embedding(txn)
    assert "amount: $125.00" in text


def test_expected_embedding_dimension():
    """Embedding dimension constant matches CONTRACT.md (1024)."""
    assert EXPECTED_DIMENSION == 1024


def test_format_transaction_no_attributes():
    """Object with no known attributes returns fallback."""
    text = format_transaction_for_embedding(object())
    assert text == "unknown transaction"
