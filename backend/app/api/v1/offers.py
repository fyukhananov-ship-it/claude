"""Partner offer management API."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.partner import User
from app.models.offer import Offer, OfferTerminal, OfferPlacement
from app.models.match import Match
from app.models.event import UIEvent
from app.models.client import ClientActivation
from app.schemas.offer import (
    OfferCreate, OfferUpdate, OfferStatusUpdate, OfferResponse,
    PlacementCreate, PlacementResponse, OfferStatsResponse, OfferDailyStats,
)
from app.api.deps import require_role
from app.utils.csv_parser import parse_terminals_csv
from app.utils.file_storage import save_upload

router = APIRouter(prefix="/offers", tags=["offers"])


@router.post("", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(
    body: OfferCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("partner_admin", "partner_manager")),
):
    offer = Offer(
        partner_id=user.partner_id,
        **body.model_dump(),
    )
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    return _offer_to_response(offer)


@router.get("", response_model=list[OfferResponse])
async def list_offers(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("partner_admin", "partner_manager")),
):
    q = (
        select(Offer)
        .where(Offer.partner_id == user.partner_id)
        .options(selectinload(Offer.placements))
        .order_by(Offer.created_at.desc())
    )
    offers = (await db.execute(q)).scalars().all()
    result = []
    for o in offers:
        terminals_count = (await db.execute(
            select(func.count(OfferTerminal.id)).where(OfferTerminal.offer_id == o.id)
        )).scalar() or 0
        resp = _offer_to_response(o)
        resp.terminals_count = terminals_count
        result.append(resp)
    return result


@router.get("/{offer_id}", response_model=OfferResponse)
async def get_offer(
    offer_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("partner_admin", "partner_manager")),
):
    offer = await _get_partner_offer(db, offer_id, user.partner_id)
    return _offer_to_response(offer)


@router.put("/{offer_id}", response_model=OfferResponse)
async def update_offer(
    offer_id: UUID,
    body: OfferUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("partner_admin", "partner_manager")),
):
    offer = await _get_partner_offer(db, offer_id, user.partner_id)
    if offer.status not in ("draft", "paused"):
        raise HTTPException(400, "Can only edit draft or paused offers")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(offer, field, value)

    await db.commit()
    await db.refresh(offer)
    return _offer_to_response(offer)


@router.put("/{offer_id}/status", response_model=OfferResponse)
async def update_status(
    offer_id: UUID,
    body: OfferStatusUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("partner_admin", "partner_manager")),
):
    offer = await _get_partner_offer(db, offer_id, user.partner_id)

    valid_transitions = {
        "draft": ["moderation"],
        "moderation": ["draft"],
        "active": ["paused"],
        "paused": ["active", "finished"],
    }
    allowed = valid_transitions.get(offer.status, [])
    if body.status not in allowed:
        raise HTTPException(400, f"Cannot transition from {offer.status} to {body.status}")

    offer.status = body.status
    await db.commit()
    await db.refresh(offer)
    return _offer_to_response(offer)


@router.post("/{offer_id}/terminals")
async def upload_terminals(
    offer_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("partner_admin", "partner_manager")),
):
    offer = await _get_partner_offer(db, offer_id, user.partner_id)
    content = (await file.read()).decode("utf-8")
    terminals = parse_terminals_csv(content)

    if not terminals:
        raise HTTPException(400, "No valid terminals found in CSV")

    # Remove existing terminals
    existing = (await db.execute(
        select(OfferTerminal).where(OfferTerminal.offer_id == offer.id)
    )).scalars().all()
    for t in existing:
        await db.delete(t)

    for t in terminals:
        db.add(OfferTerminal(offer_id=offer.id, **t))

    await db.commit()
    return {"uploaded": len(terminals)}


@router.post("/{offer_id}/image")
async def upload_image(
    offer_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("partner_admin", "partner_manager")),
):
    offer = await _get_partner_offer(db, offer_id, user.partner_id)

    if file.content_type not in ("image/png", "image/jpeg"):
        raise HTTPException(400, "Only PNG and JPG images are allowed")

    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(400, "Image must be under 2MB")

    path = await save_upload(content, file.filename or "image.jpg", subdir="offers")
    offer.image_url = path
    await db.commit()
    return {"image_url": path}


@router.post("/{offer_id}/placements", response_model=list[PlacementResponse])
async def set_placements(
    offer_id: UUID,
    body: list[PlacementCreate],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("partner_admin", "partner_manager")),
):
    offer = await _get_partner_offer(db, offer_id, user.partner_id)

    # Remove existing placements
    existing = (await db.execute(
        select(OfferPlacement).where(OfferPlacement.offer_id == offer.id)
    )).scalars().all()
    for p in existing:
        await db.delete(p)

    placements = []
    for p in body:
        placement = OfferPlacement(offer_id=offer.id, **p.model_dump())
        db.add(placement)
        placements.append(placement)

    await db.commit()
    for p in placements:
        await db.refresh(p)
    return [PlacementResponse.model_validate(p) for p in placements]


@router.get("/{offer_id}/stats", response_model=OfferStatsResponse)
async def get_offer_stats(
    offer_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("partner_admin", "partner_manager")),
):
    offer = await _get_partner_offer(db, offer_id, user.partner_id)

    impressions = (await db.execute(
        select(func.count(UIEvent.id)).where(
            UIEvent.offer_id == offer.id, UIEvent.event_type == "impression"
        )
    )).scalar() or 0

    clicks = (await db.execute(
        select(func.count(UIEvent.id)).where(
            UIEvent.offer_id == offer.id, UIEvent.event_type == "click"
        )
    )).scalar() or 0

    activations = (await db.execute(
        select(func.count(ClientActivation.id)).where(
            ClientActivation.offer_id == offer.id
        )
    )).scalar() or 0

    match_stats = (await db.execute(
        select(
            func.count(Match.id),
            func.coalesce(func.sum(Match.cashback_amount), 0),
        ).where(
            Match.offer_id == offer.id,
            Match.status != "rejected",
        )
    )).one()

    purchases = match_stats[0]
    cashback_total = match_stats[1]

    # GMV from matched transactions
    from app.models.transaction import Transaction
    gmv_result = (await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .join(Match, Match.transaction_id == Transaction.id)
        .where(Match.offer_id == offer.id, Match.status != "rejected")
    )).scalar()

    return OfferStatsResponse(
        offer_id=str(offer.id),
        impressions=impressions,
        clicks=clicks,
        ctr=round(clicks / impressions * 100, 2) if impressions > 0 else 0,
        activations=activations,
        purchases=purchases,
        gmv=gmv_result,
        cashback_total=cashback_total,
        budget_remaining=offer.budget - offer.budget_spent,
    )


@router.get("/{offer_id}/stats/daily", response_model=list[OfferDailyStats])
async def get_daily_stats(
    offer_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("partner_admin", "partner_manager")),
):
    offer = await _get_partner_offer(db, offer_id, user.partner_id)

    daily_matches = (await db.execute(
        select(
            func.date(Match.created_at).label("day"),
            func.count(Match.id),
            func.coalesce(func.sum(Match.cashback_amount), 0),
        )
        .where(Match.offer_id == offer.id, Match.status != "rejected")
        .group_by(func.date(Match.created_at))
        .order_by(func.date(Match.created_at))
    )).all()

    return [
        OfferDailyStats(
            date=row[0],
            purchases=row[1],
            cashback=row[2],
        )
        for row in daily_matches
    ]


async def _get_partner_offer(db: AsyncSession, offer_id: UUID, partner_id: UUID) -> Offer:
    offer = await db.get(Offer, offer_id)
    if not offer or offer.partner_id != partner_id:
        raise HTTPException(404, "Offer not found")
    return offer


def _offer_to_response(offer: Offer) -> OfferResponse:
    return OfferResponse(
        id=str(offer.id),
        partner_id=str(offer.partner_id),
        name=offer.name,
        description=offer.description,
        image_url=offer.image_url,
        cashback_type=offer.cashback_type,
        cashback_rate=offer.cashback_rate,
        min_check=offer.min_check,
        max_cashback_per_tx=offer.max_cashback_per_tx,
        max_cashback_per_client=offer.max_cashback_per_client,
        budget=offer.budget,
        budget_spent=offer.budget_spent,
        start_date=offer.start_date,
        end_date=offer.end_date,
        status=offer.status,
        segment=offer.segment,
        geo=offer.geo,
        created_at=offer.created_at,
        placements=[PlacementResponse.model_validate(p) for p in offer.placements]
        if hasattr(offer, "placements") and offer.placements else [],
    )
