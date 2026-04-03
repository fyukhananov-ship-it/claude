"""Batch processing service for NSPK transaction registries."""
import csv
import io
import json
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session
from app.models.transaction import TransactionBatch, Transaction
from app.services.matching import match_transaction


async def process_batch(batch_id: str) -> dict:
    """
    Process a transaction batch: validate, deduplicate, and match.
    Called by arq worker or directly.
    """
    async with async_session() as session:
        batch = await session.get(TransactionBatch, batch_id)
        if not batch:
            return {"error": "Batch not found"}

        batch.status = "processing"
        await session.commit()

        matched = 0
        errors = 0
        antifraud_blocked = 0

        # Get all unprocessed transactions in this batch
        tx_q = select(Transaction).where(
            Transaction.batch_id == batch.id,
            Transaction.processed == False,  # noqa: E712
        )
        transactions = (await session.execute(tx_q)).scalars().all()

        for tx in transactions:
            try:
                result = await match_transaction(session, tx)
                tx.processed = True
                if result:
                    matched += 1
                # If result is None, it means no match (including antifraud)
            except Exception:
                errors += 1

        batch.records_matched = matched
        batch.records_errors = errors
        batch.records_antifraud = antifraud_blocked
        batch.status = "completed"
        batch.completed_at = datetime.now(timezone.utc)
        await session.commit()

        return {
            "batch_id": str(batch.id),
            "total": batch.records_total,
            "matched": matched,
            "errors": errors,
        }


def parse_csv_registry(content: str) -> list[dict]:
    """Parse CSV registry from NSPK into list of transaction dicts."""
    reader = csv.DictReader(io.StringIO(content))
    records = []
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)

    for row in reader:
        try:
            ts = datetime.fromisoformat(row["timestamp"])
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            if ts < cutoff:
                continue  # Skip transactions older than 30 days
            records.append({
                "transaction_id": row["transaction_id"],
                "phone_hash": row["phone_hash"],
                "terminal_id": row["terminal_id"],
                "mcc": row["mcc"],
                "amount": row["amount"],
                "timestamp": ts,
            })
        except (KeyError, ValueError):
            continue

    return records


def parse_json_registry(content: str) -> list[dict]:
    """Parse JSON registry from NSPK."""
    data = json.loads(content)
    if isinstance(data, dict):
        data = data.get("transactions", [])

    records = []
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)

    for row in data:
        try:
            ts = datetime.fromisoformat(row["timestamp"])
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            if ts < cutoff:
                continue
            records.append({
                "transaction_id": row["transaction_id"],
                "phone_hash": row["phone_hash"],
                "terminal_id": row["terminal_id"],
                "mcc": row["mcc"],
                "amount": row["amount"],
                "timestamp": ts,
            })
        except (KeyError, ValueError):
            continue

    return records
