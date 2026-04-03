"""Reward calculation for matched transactions."""
from decimal import Decimal, ROUND_HALF_UP

from app.config import settings
from app.models.offer import Offer

TWO_PLACES = Decimal("0.01")


def calculate_reward(amount: Decimal, offer: Offer) -> dict:
    """
    Calculate all financial components for a match.

    Returns dict with keys:
        cashback, commission, revshare_th, revshare_nspk,
        revshare_beeline, net
    """
    # Cashback
    if offer.cashback_type == "percent":
        cashback = (amount * offer.cashback_rate).quantize(TWO_PLACES, ROUND_HALF_UP)
    else:
        cashback = offer.cashback_rate

    cashback = min(cashback, offer.max_cashback_per_tx)

    # Platform commission = 3.6% of GMV
    commission = (amount * Decimal(str(settings.PLATFORM_COMMISSION_RATE))).quantize(
        TWO_PLACES, ROUND_HALF_UP
    )

    # Rev shares from commission
    revshare_th = (commission * Decimal(str(settings.REVSHARE_TRAFFIC_HOLDER))).quantize(
        TWO_PLACES, ROUND_HALF_UP
    )
    revshare_nspk = (commission * Decimal(str(settings.REVSHARE_NSPK))).quantize(
        TWO_PLACES, ROUND_HALF_UP
    )
    revshare_beeline = (commission * Decimal(str(settings.REVSHARE_BEELINE))).quantize(
        TWO_PLACES, ROUND_HALF_UP
    )

    net = commission - revshare_th - revshare_nspk - revshare_beeline

    return {
        "cashback": cashback,
        "commission": commission,
        "revshare_th": revshare_th,
        "revshare_nspk": revshare_nspk,
        "revshare_beeline": revshare_beeline,
        "net": net,
    }
