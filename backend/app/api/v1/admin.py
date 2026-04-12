"""Operator admin API."""
from uuid import UUID
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.partner import Partner, User
from app.models.offer import Offer
from app.models.match import Match
from app.models.transaction import TransactionBatch, Transaction
from app.models.billing import BillingTransaction
from app.schemas.admin import (
    PartnerCreate, PartnerResponse, ModerationRequest,
    DashboardResponse, RevShareResponse, PnLItem,
)
from app.schemas.billing import TopupRequest
from app.api.deps import require_role
from app.services.auth import hash_password
from app.services.billing import topup_balance
from app.services.batch_processor import (
    parse_csv_registry, parse_json_registry, process_batch,
)
from app.utils.file_storage import save_upload

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)

    active_offers = (await db.execute(
        select(func.count(Offer.id)).where(Offer.status == "active")
    )).scalar() or 0

    tx_today = (await db.execute(
        select(func.count(Transaction.id)).where(Transaction.timestamp >= today_start)
    )).scalar() or 0

    tx_week = (await db.execute(
        select(func.count(Transaction.id)).where(Transaction.timestamp >= week_start)
    )).scalar() or 0

    cb_today = (await db.execute(
        select(func.coalesce(func.sum(Match.cashback_amount), 0)).where(
            Match.created_at >= today_start
        )
    )).scalar()

    cb_week = (await db.execute(
        select(func.coalesce(func.sum(Match.cashback_amount), 0)).where(
            Match.created_at >= week_start
        )
    )).scalar()

    partners_count = (await db.execute(
        select(func.count(Partner.id))
    )).scalar() or 0

    low_balance = (await db.execute(
        select(func.count(Partner.id)).where(Partner.balance < 1000)
    )).scalar() or 0

    return DashboardResponse(
        active_offers=active_offers,
        total_transactions_today=tx_today,
        total_transactions_week=tx_week,
        cashback_today=cb_today,
        cashback_week=cb_week,
        partners_count=partners_count,
        low_balance_partners=low_balance,
    )


@router.get("/partners", response_model=list[PartnerResponse])
async def list_partners(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    partners = (await db.execute(
        select(Partner).order_by(Partner.created_at.desc())
    )).scalars().all()

    result = []
    for p in partners:
        offers_count = (await db.execute(
            select(func.count(Offer.id)).where(Offer.partner_id == p.id)
        )).scalar() or 0
        resp = PartnerResponse(
            id=str(p.id),
            name=p.name,
            logo_url=p.logo_url,
            contact_email=p.contact_email,
            contact_phone=p.contact_phone,
            balance=p.balance,
            status=p.status,
            created_at=p.created_at,
            offers_count=offers_count,
        )
        result.append(resp)
    return result


@router.post("/partners", response_model=PartnerResponse)
async def create_partner(
    body: PartnerCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    partner = Partner(**body.model_dump())
    db.add(partner)

    # Create default admin user for partner
    partner_user = User(
        email=body.contact_email,
        hashed_password=hash_password("changeme123"),
        role="partner_admin",
        partner_id=partner.id,
    )
    db.add(partner_user)
    await db.commit()
    await db.refresh(partner)

    return PartnerResponse(
        id=str(partner.id),
        name=partner.name,
        contact_email=partner.contact_email,
        contact_phone=partner.contact_phone,
        balance=partner.balance,
        status=partner.status,
        created_at=partner.created_at,
    )


@router.put("/partners/{partner_id}/balance")
async def topup_partner_balance(
    partner_id: UUID,
    body: TopupRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    new_balance = await topup_balance(db, partner_id, body.amount)
    await db.commit()
    return {"partner_id": str(partner_id), "new_balance": str(new_balance)}


@router.get("/offers")
async def list_offers(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    from app.models.offer import OfferTerminal

    rows = (await db.execute(
        select(Offer, Partner.name)
        .join(Partner, Offer.partner_id == Partner.id)
        .order_by(Offer.created_at.desc())
    )).all()

    result = []
    for offer, partner_name in rows:
        t_count = (await db.execute(
            select(func.count(OfferTerminal.id)).where(OfferTerminal.offer_id == offer.id)
        )).scalar() or 0
        result.append({
            "id": str(offer.id),
            "partner_id": str(offer.partner_id),
            "partner_name": partner_name,
            "name": offer.name,
            "description": offer.description,
            "image_url": offer.image_url,
            "cashback_type": offer.cashback_type,
            "cashback_rate": str(offer.cashback_rate),
            "min_check": str(offer.min_check),
            "max_cashback_per_tx": str(offer.max_cashback_per_tx),
            "max_cashback_per_client": str(offer.max_cashback_per_client),
            "budget": str(offer.budget),
            "budget_spent": str(offer.budget_spent),
            "start_date": offer.start_date.isoformat(),
            "end_date": offer.end_date.isoformat(),
            "status": offer.status,
            "segment": offer.segment,
            "category": offer.category,
            "terminals_count": t_count,
        })
    return result


@router.post("/offers")
async def create_offer(
    body: dict,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    partner = await db.get(Partner, UUID(body["partner_id"]))
    if not partner:
        raise HTTPException(404, "Partner not found")

    offer = Offer(
        partner_id=partner.id,
        name=body["name"],
        description=body.get("description", ""),
        cashback_type=body["cashback_type"],
        cashback_rate=body["cashback_rate"],
        min_check=body.get("min_check", 0),
        max_cashback_per_tx=body.get("max_cashback_per_tx", 0),
        max_cashback_per_client=body.get("max_cashback_per_client", 0),
        budget=body.get("budget", 0),
        start_date=date.fromisoformat(body["start_date"]),
        end_date=date.fromisoformat(body["end_date"]),
        segment=body.get("segment", "all"),
        category=body.get("category") or None,
        status="active",
    )
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    return {"id": str(offer.id), "status": offer.status}


@router.put("/offers/{offer_id}")
async def update_offer(
    offer_id: UUID,
    body: dict,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    offer = await db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(404, "Offer not found")

    updatable = [
        "name", "description", "cashback_type", "cashback_rate",
        "min_check", "max_cashback_per_tx", "max_cashback_per_client",
        "budget", "start_date", "end_date", "segment", "category",
        "status", "image_url",
    ]
    for field in updatable:
        if field in body:
            value = body[field]
            if field in ("start_date", "end_date") and isinstance(value, str):
                value = date.fromisoformat(value)
            if field == "category" and value == "":
                value = None
            setattr(offer, field, value)

    await db.commit()
    return {"id": str(offer.id), "status": offer.status}


@router.put("/offers/{offer_id}/moderate")
async def moderate_offer(
    offer_id: UUID,
    body: ModerationRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    offer = await db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(404, "Offer not found")

    if offer.status != "moderation":
        raise HTTPException(400, "Offer is not in moderation status")

    if body.action == "approve":
        offer.status = "active"
    elif body.action == "reject":
        offer.status = "draft"
    else:
        raise HTTPException(400, "Action must be 'approve' or 'reject'")

    await db.commit()
    return {"offer_id": str(offer.id), "status": offer.status, "comment": body.comment}


@router.post("/offers/{offer_id}/image")
async def admin_upload_offer_image(
    offer_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    """Operator can upload/replace the image of any offer (any partner)."""
    offer = await db.get(Offer, offer_id)
    if not offer:
        raise HTTPException(404, "Offer not found")

    if file.content_type not in ("image/png", "image/jpeg", "image/webp"):
        raise HTTPException(400, "Only PNG, JPG and WebP images are allowed")

    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(400, "Image must be under 2MB")

    url = await save_upload(
        content,
        file.filename or "image.jpg",
        subdir="offers",
        content_type=file.content_type,
    )
    offer.image_url = url
    await db.commit()
    return {"offer_id": str(offer.id), "image_url": url}


@router.post("/registry/upload")
async def upload_registry(
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
        raise HTTPException(400, "Unsupported format")

    if not records:
        raise HTTPException(400, "No valid records")

    batch = TransactionBatch(filename=filename, records_total=len(records))
    db.add(batch)
    await db.flush()

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

    result = await process_batch(str(batch.id))
    return result


@router.get("/registry/{batch_id}/log")
async def get_registry_log(
    batch_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    batch = await db.get(TransactionBatch, batch_id)
    if not batch:
        raise HTTPException(404, "Batch not found")

    return {
        "batch_id": str(batch.id),
        "filename": batch.filename,
        "records_total": batch.records_total,
        "records_matched": batch.records_matched,
        "records_errors": batch.records_errors,
        "records_antifraud": batch.records_antifraud,
        "status": batch.status,
        "uploaded_at": batch.uploaded_at.isoformat() if batch.uploaded_at else None,
        "completed_at": batch.completed_at.isoformat() if batch.completed_at else None,
    }


@router.get("/finance/revshare", response_model=RevShareResponse)
async def get_revshare(
    period_start: date,
    period_end: date,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    stats = (await db.execute(
        select(
            func.coalesce(func.sum(Match.commission_platform), 0),
            func.coalesce(func.sum(Match.revshare_traffic_holder), 0),
            func.coalesce(func.sum(Match.revshare_nspk), 0),
            func.coalesce(func.sum(Match.revshare_beeline), 0),
            func.coalesce(func.sum(Match.net_platform), 0),
        ).where(
            and_(
                Match.created_at >= period_start,
                Match.created_at <= period_end,
                Match.status != "rejected",
            )
        )
    )).one()

    # GMV
    gmv = (await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .join(Match, Match.transaction_id == Transaction.id)
        .where(
            and_(
                Match.created_at >= period_start,
                Match.created_at <= period_end,
                Match.status != "rejected",
            )
        )
    )).scalar()

    return RevShareResponse(
        period_start=period_start,
        period_end=period_end,
        total_gmv=gmv,
        total_commission=stats[0],
        revshare_traffic_holder=stats[1],
        revshare_nspk=stats[2],
        revshare_beeline=stats[3],
        net_platform=stats[4],
    )


@router.get("/finance/pnl", response_model=list[PnLItem])
async def get_pnl(
    period_start: date,
    period_end: date,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_role("operator")),
):
    partners = (await db.execute(select(Partner))).scalars().all()

    result = []
    for p in partners:
        stats = (await db.execute(
            select(
                func.coalesce(func.sum(Match.commission_platform), 0),
                func.coalesce(func.sum(Match.cashback_amount), 0),
                func.coalesce(func.sum(Match.net_platform), 0),
            )
            .join(Offer, Match.offer_id == Offer.id)
            .where(
                and_(
                    Offer.partner_id == p.id,
                    Match.created_at >= period_start,
                    Match.created_at <= period_end,
                    Match.status != "rejected",
                )
            )
        )).one()

        gmv = (await db.execute(
            select(func.coalesce(func.sum(Transaction.amount), 0))
            .join(Match, Match.transaction_id == Transaction.id)
            .join(Offer, Match.offer_id == Offer.id)
            .where(
                and_(
                    Offer.partner_id == p.id,
                    Match.created_at >= period_start,
                    Match.created_at <= period_end,
                    Match.status != "rejected",
                )
            )
        )).scalar()

        result.append(PnLItem(
            partner_id=str(p.id),
            partner_name=p.name,
            gmv=gmv,
            commission=stats[0],
            cashback=stats[1],
            net=stats[2],
        ))

    return result
