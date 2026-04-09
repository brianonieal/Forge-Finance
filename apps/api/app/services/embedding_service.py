import asyncio
from typing import Any

import httpx

from app.core.config import settings

VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings"
VOYAGE_MODEL = "voyage-finance-2"
EXPECTED_DIMENSION = 1024
BATCH_SIZE = 50
BATCH_DELAY_MS = 100


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a list of texts using Voyage AI.

    Batches in groups of 50 with 100ms delay between batches (ERR-VOYAGE-002).
    Validates embedding dimensions (ERR-VOYAGE-001).
    """
    if not settings.voyage_api_key:
        return []

    all_embeddings: list[list[float]] = []

    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]

        if i > 0:
            await asyncio.sleep(BATCH_DELAY_MS / 1000)

        embeddings = await _embed_batch(batch)
        all_embeddings.extend(embeddings)

    return all_embeddings


async def _embed_batch(texts: list[str]) -> list[list[float]]:
    """Embed a single batch with retry and backoff (ERR-PLAID-005 pattern)."""
    max_retries = 5

    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    VOYAGE_API_URL,
                    json={"input": texts, "model": VOYAGE_MODEL},
                    headers={
                        "Authorization": f"Bearer {settings.voyage_api_key}",
                        "Content-Type": "application/json",
                    },
                )

                if response.status_code == 429:
                    wait = (2**attempt) + (hash(str(attempt)) % 1000) / 1000
                    await asyncio.sleep(wait)
                    continue

                response.raise_for_status()
                data = response.json()

                embeddings = [item["embedding"] for item in data["data"]]

                # ERR-VOYAGE-001: Validate dimensions
                for emb in embeddings:
                    if len(emb) != EXPECTED_DIMENSION:
                        raise ValueError(
                            f"Embedding dimension mismatch: expected {EXPECTED_DIMENSION}, got {len(emb)}"
                        )

                return embeddings

        except httpx.HTTPStatusError:
            if attempt == max_retries - 1:
                raise
            wait = (2**attempt) + (hash(str(attempt)) % 1000) / 1000
            await asyncio.sleep(wait)

    return []


def format_transaction_for_embedding(txn: Any) -> str:
    """Format a transaction into text suitable for embedding."""
    parts = []
    if hasattr(txn, "merchant_name") and txn.merchant_name:
        parts.append(f"merchant: {txn.merchant_name}")
    if hasattr(txn, "amount"):
        parts.append(f"amount: ${abs(float(txn.amount)):.2f}")
    if hasattr(txn, "category") and txn.category:
        parts.append(f"category: {txn.category}")
    if hasattr(txn, "date"):
        parts.append(f"date: {txn.date}")
    if hasattr(txn, "subcategory") and txn.subcategory:
        parts.append(f"subcategory: {txn.subcategory}")
    return " | ".join(parts) if parts else "unknown transaction"
