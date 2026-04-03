"""Payout registry generation service."""
import csv
import io
import json
from datetime import date
from decimal import Decimal

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.match import Match
from app.models.offer import Offer
from app.models.partner import Partner
from app.models.payout import Payout


async def generate_client_payout(
    session: AsyncSession,
    period_start: date,
    period_end: date,
) -> Payout:
    """Generate client cashback payout registry."""
    matches_q = select(Match).where(
        and_(
            Match.status == "pending",
            Match.created_at >= period_start,
            Match.created_at <= period_end,
        )
    )
    matches = (await session.execute(matches_q)).scalars().all()

    rows = []
    total = Decimal("0.00")
    for m in matches:
        rows.append({
            "phone_hash": "",  # Populated from client
            "cashback_amount": str(m.cashback_amount),
            "offer_id": str(m.offer_id),
            "transaction_id": str(m.transaction_id),
            "timestamp": str(m.created_at),
        })
        total += m.cashback_amount
        m.status = "approved"

    # Generate CSV content
    output = io.StringIO()
    if rows:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    payout = Payout(
        type="client",
        period_start=period_start,
        period_end=period_end,
        total_amount=total,
        records_count=len(rows),
        status="generated",
    )
    session.add(payout)
    await session.flush()

    return payout


async def generate_revshare_payout(
    session: AsyncSession,
    period_start: date,
    period_end: date,
    payout_type: str,
) -> Payout:
    """Generate rev-share payout (nspk, beeline_th, beeline_invest)."""
    field_map = {
        "nspk": Match.revshare_nspk,
        "beeline_th": Match.revshare_traffic_holder,
        "beeline_invest": Match.revshare_beeline,
    }
    field = field_map.get(payout_type)
    if not field:
        raise ValueError(f"Invalid payout type: {payout_type}")

    total_q = select(
        func.coalesce(func.sum(field), 0),
        func.count(Match.id),
    ).where(
        and_(
            Match.status.in_(["pending", "approved"]),
            Match.created_at >= period_start,
            Match.created_at <= period_end,
        )
    )
    result = (await session.execute(total_q)).one()
    total_amount, records_count = result

    payout = Payout(
        type=payout_type,
        period_start=period_start,
        period_end=period_end,
        total_amount=total_amount,
        records_count=records_count,
        status="generated",
    )
    session.add(payout)
    await session.flush()

    return payout
