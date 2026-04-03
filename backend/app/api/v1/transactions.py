"""Transaction batch processing API."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.partner import User
from app.models.transaction import TransactionBatch, Transaction
from app.models.match import Match
from app.schemas.transaction import (
    BatchUploadResponse, BatchStatusResponse, TransactionRecord, MatchResultResponse,
)
from app.api.deps import require_role
from app.services.batch_processor import (
    parse_csv_registry, parse_json_registry, process_batch,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/batch", response_model=BatchUploadResponse)
async def upload_batch(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    content = (await file.read()).decode("utf-8")
    filename = file.filename or "upload"

    if filename.endswith(".csv"):
        records = parse_csv_registry(content)
    elif filename.endswith(".json"):
        records = parse_json_registry(content)
    else:
        raise HTTPException(400, "Unsupported file format. Use CSV or JSON.")

    if not records:
        raise HTTPException(400, "No valid records found")

    batch = TransactionBatch(
        filename=filename,
        records_total=len(records),
    )
    db.add(batch)
    await db.flush()

    # Insert transactions, skip duplicates
    inserted = 0
    for rec in records:
        existing = (await db.execute(
            select(Transaction.id).where(
                Transaction.transaction_id_external == rec["transaction_id"]
            )
        )).scalar_one_or_none()
        if existing:
            continue

        tx = Transaction(
            batch_id=batch.id,
            transaction_id_external=rec["transaction_id"],
            phone_hash=rec["phone_hash"],
            terminal_id=rec["terminal_id"],
            mcc=rec["mcc"],
            amount=rec["amount"],
            timestamp=rec["timestamp"],
        )
        db.add(tx)
        inserted += 1

    batch.records_total = inserted
    await db.commit()

    # Process synchronously for MVP (could be async via arq)
    await process_batch(str(batch.id))

    await db.refresh(batch)
    return BatchUploadResponse(
        batch_id=str(batch.id),
        records_total=batch.records_total,
        status=batch.status,
    )


@router.get("/batch/{batch_id}/status", response_model=BatchStatusResponse)
async def get_batch_status(
    batch_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    batch = await db.get(TransactionBatch, batch_id)
    if not batch:
        raise HTTPException(404, "Batch not found")

    return BatchStatusResponse(
        batch_id=str(batch.id),
        filename=batch.filename,
        records_total=batch.records_total,
        records_matched=batch.records_matched,
        records_errors=batch.records_errors,
        records_antifraud=batch.records_antifraud,
        status=batch.status,
        uploaded_at=batch.uploaded_at,
        completed_at=batch.completed_at,
    )


@router.get("/batch/{batch_id}/results", response_model=list[MatchResultResponse])
async def get_batch_results(
    batch_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    from app.models.offer import Offer

    matches_q = (
        select(Match, Transaction, Offer)
        .join(Transaction, Match.transaction_id == Transaction.id)
        .join(Offer, Match.offer_id == Offer.id)
        .where(Transaction.batch_id == batch_id)
    )
    results = (await db.execute(matches_q)).all()

    return [
        MatchResultResponse(
            transaction_id=str(tx.transaction_id_external),
            offer_id=str(offer.id),
            offer_name=offer.name,
            client_phone_hash=tx.phone_hash,
            amount=tx.amount,
            cashback_amount=match.cashback_amount,
            status=match.status,
        )
        for match, tx, offer in results
    ]
