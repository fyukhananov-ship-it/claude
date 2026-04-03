"""
Matching (attribution) engine.

For each transaction from the NSPK registry:
1. Find active offers where terminal_id OR mcc matches, amount >= min_check,
   timestamp within offer period, budget not exhausted.
2. Check if client (phone_hash) has activated any of the matching offers.
3. If match found and multiple offers qualify, pick the one with highest cashback.
4. Run anti-fraud checks.
"""
from datetime import date
from decimal import Decimal

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.offer import Offer, OfferTerminal
from app.models.client import Client, ClientActivation
from app.models.transaction import Transaction
from app.models.match import Match
from app.services.reward import calculate_reward
from app.services.antifraud import check_antifraud
from app.services.billing import deduct_from_budget


async def match_transaction(
    session: AsyncSession,
    tx: Transaction,
) -> Match | None:
    """Attempt to match a single transaction to an active offer."""
    today = date.today()

    # Step 1: Find terminals matching this transaction
    terminal_offers_q = (
        select(OfferTerminal.offer_id)
        .where(OfferTerminal.terminal_id == tx.terminal_id)
    )
    terminal_offer_ids = (await session.execute(terminal_offers_q)).scalars().all()

    # Step 2: Find active offers matching by terminal OR MCC
    offer_q = select(Offer).where(
        and_(
            Offer.status == "active",
            Offer.start_date <= today,
            Offer.end_date >= today,
            Offer.min_check <= tx.amount,
            Offer.budget_spent < Offer.budget,
        )
    )

    if terminal_offer_ids:
        # Also match by MCC via offer_terminals table
        mcc_offers_q = (
            select(OfferTerminal.offer_id)
            .where(OfferTerminal.mcc == tx.mcc)
        )
        mcc_offer_ids = (await session.execute(mcc_offers_q)).scalars().all()

        all_offer_ids = list(set(terminal_offer_ids) | set(mcc_offer_ids))
        offer_q = offer_q.where(Offer.id.in_(all_offer_ids))
    else:
        # Try MCC-only matching
        mcc_offers_q = (
            select(OfferTerminal.offer_id)
            .where(OfferTerminal.mcc == tx.mcc)
        )
        mcc_offer_ids = (await session.execute(mcc_offers_q)).scalars().all()
        if not mcc_offer_ids:
            return None
        offer_q = offer_q.where(Offer.id.in_(mcc_offer_ids))

    offers = (await session.execute(offer_q)).scalars().all()
    if not offers:
        return None

    # Step 3: Find client
    client_q = select(Client).where(Client.phone_hash == tx.phone_hash)
    client = (await session.execute(client_q)).scalar_one_or_none()
    if not client:
        return None

    # Step 4: Check which offers this client has activated
    activation_q = select(ClientActivation).where(
        and_(
            ClientActivation.client_id == client.id,
            ClientActivation.offer_id.in_([o.id for o in offers]),
            ClientActivation.status == "active",
        )
    )
    activations = (await session.execute(activation_q)).scalars().all()
    activated_offer_ids = {a.offer_id for a in activations}

    # Filter to only activated offers
    matched_offers = [o for o in offers if o.id in activated_offer_ids]
    if not matched_offers:
        return None

    # Step 5: Pick best offer (highest effective cashback)
    def effective_cashback(offer: Offer) -> Decimal:
        if offer.cashback_type == "percent":
            cb = tx.amount * offer.cashback_rate
        else:
            cb = offer.cashback_rate
        return min(cb, offer.max_cashback_per_tx)

    best_offer = max(matched_offers, key=effective_cashback)

    # Step 6: Anti-fraud checks
    fraud_ok = await check_antifraud(session, client, best_offer, tx)
    if not fraud_ok:
        return None

    # Step 7: Calculate reward
    reward = calculate_reward(tx.amount, best_offer)

    # Step 8: Deduct from budget
    budget_ok = await deduct_from_budget(
        session, best_offer, reward["cashback"] + reward["commission"]
    )
    if not budget_ok:
        return None

    # Step 9: Create match record
    match = Match(
        transaction_id=tx.id,
        offer_id=best_offer.id,
        client_id=client.id,
        cashback_amount=reward["cashback"],
        commission_platform=reward["commission"],
        revshare_traffic_holder=reward["revshare_th"],
        revshare_nspk=reward["revshare_nspk"],
        revshare_beeline=reward["revshare_beeline"],
        net_platform=reward["net"],
        status="pending",
    )
    session.add(match)

    # Update client total cashback
    client.cashback_total += reward["cashback"]

    return match
