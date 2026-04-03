"""Billing service: budget deduction and partner balance management."""
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.offer import Offer
from app.models.partner import Partner
from app.models.billing import BillingTransaction


async def deduct_from_budget(
    session: AsyncSession,
    offer: Offer,
    total_deduction: Decimal,
) -> bool:
    """
    Deduct cashback + commission from offer budget and partner balance.
    Returns False if insufficient budget/balance.
    """
    if offer.budget_spent + total_deduction > offer.budget:
        return False

    partner = await session.get(Partner, offer.partner_id)
    if not partner or partner.balance < total_deduction:
        return False

    offer.budget_spent += total_deduction
    partner.balance -= total_deduction

    billing_tx = BillingTransaction(
        partner_id=partner.id,
        type="cashback",
        amount=-total_deduction,
        balance_after=partner.balance,
        reference_id=str(offer.id),
    )
    session.add(billing_tx)

    return True


async def topup_balance(
    session: AsyncSession,
    partner_id,
    amount: Decimal,
) -> Decimal:
    """Top up partner balance. Returns new balance."""
    partner = await session.get(Partner, partner_id)
    if not partner:
        raise ValueError("Partner not found")

    partner.balance += amount

    billing_tx = BillingTransaction(
        partner_id=partner.id,
        type="topup",
        amount=amount,
        balance_after=partner.balance,
    )
    session.add(billing_tx)
    await session.flush()

    return partner.balance
