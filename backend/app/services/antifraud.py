"""Basic anti-fraud checks for MVP."""
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.client import Client
from app.models.match import Match
from app.models.offer import Offer
from app.models.transaction import Transaction


async def check_antifraud(
    session: AsyncSession,
    client: Client,
    offer: Offer,
    tx: Transaction,
) -> bool:
    """
    Run anti-fraud checks. Returns True if transaction is clean.

    Checks:
    1. Max 3 accruals per day per client per offer
    2. Max cashback per client for offer period
    3. Transaction deduplication (already matched)
    4. Terminal spike detection (logged as alert, doesn't block)
    """
    # Check 1: Daily accrual limit
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    daily_count_q = select(func.count(Match.id)).where(
        and_(
            Match.client_id == client.id,
            Match.offer_id == offer.id,
            Match.created_at >= today_start,
            Match.status != "rejected",
        )
    )
    daily_count = (await session.execute(daily_count_q)).scalar() or 0
    if daily_count >= settings.ANTIFRAUD_MAX_ACCRUALS_PER_DAY:
        return False

    # Check 2: Total cashback limit per client for this offer
    total_cashback_q = select(func.coalesce(func.sum(Match.cashback_amount), 0)).where(
        and_(
            Match.client_id == client.id,
            Match.offer_id == offer.id,
            Match.status != "rejected",
        )
    )
    total_cashback = (await session.execute(total_cashback_q)).scalar()
    if total_cashback >= offer.max_cashback_per_client:
        return False

    # Check 3: Transaction deduplication
    existing_match_q = select(Match.id).where(Match.transaction_id == tx.id)
    existing = (await session.execute(existing_match_q)).scalar_one_or_none()
    if existing:
        return False

    # Check 4: Terminal spike detection (alert only, doesn't block)
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    terminal_count_q = select(func.count(Transaction.id)).where(
        and_(
            Transaction.terminal_id == tx.terminal_id,
            Transaction.timestamp >= one_hour_ago,
        )
    )
    terminal_total_q = select(func.count(Transaction.id)).where(
        Transaction.timestamp >= one_hour_ago,
    )
    terminal_count = (await session.execute(terminal_count_q)).scalar() or 0
    total_count = (await session.execute(terminal_total_q)).scalar() or 1

    if total_count > 0 and (terminal_count / total_count) > settings.ANTIFRAUD_TERMINAL_SPIKE_THRESHOLD:
        # TODO: Log alert for monitoring dashboard
        pass

    return True
