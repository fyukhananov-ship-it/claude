"""Client-facing API for web-view in Мой Билайн."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.client import Client, ClientActivation
from app.models.offer import Offer
from app.models.partner import Partner
from app.models.match import Match
from app.models.event import UIEvent
from app.models.article import Article
from app.models.settings import AppSettings
from app.models.transaction import Transaction
from app.schemas.client import (
    ClientOfferResponse, ActivationResponse,
    CashbackHistoryItem, CashbackTotalResponse,
)

router = APIRouter(prefix="/client", tags=["client"])


@router.get("/{phone_hash}/offers", response_model=list[ClientOfferResponse])
async def get_client_offers(
    phone_hash: str,
    category: str | None = None,
    sort: str = "cashback",  # cashback, new, popular
    db: AsyncSession = Depends(get_db),
):
    client = await _get_or_create_client(db, phone_hash)

    q = (
        select(Offer, Partner)
        .join(Partner, Offer.partner_id == Partner.id)
        .where(Offer.status == "active")
    )

    offers_data = (await db.execute(q)).all()

    # Get client's activations
    activation_q = select(ClientActivation.offer_id, ClientActivation.status).where(
        ClientActivation.client_id == client.id
    )
    activations = {row[0]: row[1] for row in (await db.execute(activation_q)).all()}

    # Get offers with cashback received
    cashback_offers_q = select(Match.offer_id).where(
        and_(Match.client_id == client.id, Match.status.in_(["approved", "paid"]))
    )
    cashback_offers = set((await db.execute(cashback_offers_q)).scalars().all())

    result = []
    for offer, partner in offers_data:
        if offer.id in cashback_offers:
            offer_status = "cashback_received"
        elif offer.id in activations:
            offer_status = "activated"
        else:
            offer_status = "new"

        result.append(ClientOfferResponse(
            id=str(offer.id),
            partner_name=partner.name,
            partner_logo=partner.logo_url,
            name=offer.name,
            description=offer.description,
            image_url=offer.image_url,
            cashback_type=offer.cashback_type,
            cashback_rate=offer.cashback_rate,
            min_check=offer.min_check,
            max_cashback_per_tx=offer.max_cashback_per_tx,
            start_date=offer.start_date,
            end_date=offer.end_date,
            status=offer_status,
            category=offer.category,
            is_featured=offer.is_featured,
        ))

    # Sort
    if sort == "cashback":
        result.sort(key=lambda x: x.cashback_rate, reverse=True)
    elif sort == "new":
        result.sort(key=lambda x: x.start_date, reverse=True)

    # Track impressions
    for item in result:
        db.add(UIEvent(
            client_id=client.id,
            offer_id=item.id,
            event_type="impression",
            placement_type="catalog",
        ))
    await db.commit()

    return result


@router.get("/{phone_hash}/offers/{offer_id}", response_model=ClientOfferResponse)
async def get_client_offer_detail(
    phone_hash: str,
    offer_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    client = await _get_or_create_client(db, phone_hash)

    q = select(Offer, Partner).join(Partner, Offer.partner_id == Partner.id).where(
        Offer.id == offer_id, Offer.status == "active"
    )
    row = (await db.execute(q)).one_or_none()
    if not row:
        raise HTTPException(404, "Offer not found")

    offer, partner = row

    # Track click
    db.add(UIEvent(
        client_id=client.id,
        offer_id=offer.id,
        event_type="click",
        placement_type="catalog",
    ))
    await db.commit()

    activation = (await db.execute(
        select(ClientActivation.status).where(
            ClientActivation.client_id == client.id,
            ClientActivation.offer_id == offer.id,
        )
    )).scalar_one_or_none()

    return ClientOfferResponse(
        id=str(offer.id),
        partner_name=partner.name,
        partner_logo=partner.logo_url,
        name=offer.name,
        description=offer.description,
        image_url=offer.image_url,
        cashback_type=offer.cashback_type,
        cashback_rate=offer.cashback_rate,
        min_check=offer.min_check,
        max_cashback_per_tx=offer.max_cashback_per_tx,
        start_date=offer.start_date,
        end_date=offer.end_date,
        status="activated" if activation else "new",
        category=offer.category,
    )


@router.post("/{phone_hash}/activate/{offer_id}", response_model=ActivationResponse)
async def activate_offer(
    phone_hash: str,
    offer_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    client = await _get_or_create_client(db, phone_hash)

    offer = await db.get(Offer, offer_id)
    if not offer or offer.status != "active":
        raise HTTPException(404, "Offer not found or not active")

    # Check if already activated
    existing = (await db.execute(
        select(ClientActivation).where(
            ClientActivation.client_id == client.id,
            ClientActivation.offer_id == offer_id,
        )
    )).scalar_one_or_none()

    if existing:
        return ActivationResponse(
            offer_id=str(offer_id),
            activated_at=existing.activated_at,
            status=existing.status,
        )

    activation = ClientActivation(
        client_id=client.id,
        offer_id=offer_id,
    )
    db.add(activation)

    # Track activation event
    db.add(UIEvent(
        client_id=client.id,
        offer_id=offer_id,
        event_type="activation",
        placement_type="catalog",
    ))
    await db.commit()
    await db.refresh(activation)

    return ActivationResponse(
        offer_id=str(offer_id),
        activated_at=activation.activated_at,
        status=activation.status,
    )


@router.get("/{phone_hash}/cashback", response_model=list[CashbackHistoryItem])
async def get_cashback_history(
    phone_hash: str,
    db: AsyncSession = Depends(get_db),
):
    client = await _get_or_create_client(db, phone_hash)

    q = (
        select(Match, Transaction, Offer, Partner)
        .join(Transaction, Match.transaction_id == Transaction.id)
        .join(Offer, Match.offer_id == Offer.id)
        .join(Partner, Offer.partner_id == Partner.id)
        .where(Match.client_id == client.id)
        .order_by(Match.created_at.desc())
    )
    rows = (await db.execute(q)).all()

    return [
        CashbackHistoryItem(
            date=match.created_at,
            partner_name=partner.name,
            purchase_amount=tx.amount,
            cashback_amount=match.cashback_amount,
            status=match.status,
        )
        for match, tx, offer, partner in rows
    ]


@router.get("/{phone_hash}/cashback/total", response_model=CashbackTotalResponse)
async def get_cashback_total(
    phone_hash: str,
    db: AsyncSession = Depends(get_db),
):
    client = await _get_or_create_client(db, phone_hash)
    return CashbackTotalResponse(total=client.cashback_total)


async def _get_or_create_client(db: AsyncSession, phone_hash: str) -> Client:
    client = (await db.execute(
        select(Client).where(Client.phone_hash == phone_hash)
    )).scalar_one_or_none()

    if not client:
        client = Client(phone_hash=phone_hash)
        db.add(client)
        await db.flush()

    return client


@router.get("/brand")
async def get_brand(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(AppSettings))).scalars().all()
    settings = {r.key: r.value for r in rows}
    return {
        "name": settings.get("brand_name", "Med"),
        "logo_url": settings.get("brand_logo"),
    }


@router.get("/articles")
async def get_published_articles(db: AsyncSession = Depends(get_db)):
    articles = (await db.execute(
        select(Article)
        .where(Article.published == True)  # noqa: E712
        .order_by(Article.sort_order, Article.created_at.desc())
    )).scalars().all()
    return [
        {
            "id": str(a.id),
            "title": a.title,
            "subtitle": a.subtitle,
            "content": a.content,
            "image_url": a.image_url,
            "read_time": a.read_time,
        }
        for a in articles
    ]
