"""Seed script to populate demo data for MVP testing."""
import asyncio
import uuid
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import select

from app.database import engine, async_session, Base
from app.models import *  # noqa: F403
from app.services.auth import hash_password


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # Check if already seeded
        existing = (await session.execute(select(Partner))).scalar_one_or_none()
        if existing:
            print("Database already seeded. Skipping.")
            return

        # Create operator user
        operator = User(
            id=uuid.uuid4(),
            email="admin@beeline.ru",
            hashed_password=hash_password("admin123"),
            role="operator",
        )
        session.add(operator)

        # Create partners
        pyaterochka = Partner(
            id=uuid.uuid4(),
            name="Пятёрочка",
            contact_email="partner@pyaterochka.ru",
            contact_phone="+7 (495) 123-45-67",
            balance=Decimal("1000000.00"),
            status="active",
        )
        session.add(pyaterochka)

        magnit = Partner(
            id=uuid.uuid4(),
            name="Магнит",
            contact_email="partner@magnit.ru",
            contact_phone="+7 (495) 987-65-43",
            balance=Decimal("500000.00"),
            status="active",
        )
        session.add(magnit)

        # Create partner admin users
        p5_admin = User(
            id=uuid.uuid4(),
            email="partner@pyaterochka.ru",
            hashed_password=hash_password("partner123"),
            role="partner_admin",
            partner_id=pyaterochka.id,
        )
        session.add(p5_admin)

        magnit_admin = User(
            id=uuid.uuid4(),
            email="partner@magnit.ru",
            hashed_password=hash_password("partner123"),
            role="partner_admin",
            partner_id=magnit.id,
        )
        session.add(magnit_admin)

        # Create offers
        today = date.today()
        offer1 = Offer(
            id=uuid.uuid4(),
            partner_id=pyaterochka.id,
            name="Кэшбэк 10% в Пятёрочке",
            description="Оплачивайте покупки в Пятёрочке через СБП и получайте 10% кэшбэк на счёт Билайн. Акция действует во всех магазинах сети.",
            cashback_type="percent",
            cashback_rate=Decimal("0.1000"),
            min_check=Decimal("500.00"),
            max_cashback_per_tx=Decimal("1000.00"),
            max_cashback_per_client=Decimal("5000.00"),
            budget=Decimal("500000.00"),
            budget_spent=Decimal("123400.00"),
            start_date=today,
            end_date=today + timedelta(days=90),
            status="active",
            segment="all",
            category="Купить продукты",
        )
        session.add(offer1)

        offer2 = Offer(
            id=uuid.uuid4(),
            partner_id=magnit.id,
            name="300₽ за первую покупку в Магните",
            description="Совершите первую покупку в Магните на сумму от 1000₽ через СБП и получите 300₽ кэшбэк.",
            cashback_type="fixed",
            cashback_rate=Decimal("300.0000"),
            min_check=Decimal("1000.00"),
            max_cashback_per_tx=Decimal("300.00"),
            max_cashback_per_client=Decimal("300.00"),
            budget=Decimal("100000.00"),
            budget_spent=Decimal("0.00"),
            start_date=today,
            end_date=today + timedelta(days=60),
            status="active",
            segment="new",
            category="Купить продукты",
        )
        session.add(offer2)

        offer3 = Offer(
            id=uuid.uuid4(),
            partner_id=pyaterochka.id,
            name="Летняя акция: до 15% кэшбэк",
            description="Специальное летнее предложение! Получите повышенный кэшбэк 15% на все покупки в Пятёрочке.",
            cashback_type="percent",
            cashback_rate=Decimal("0.1500"),
            min_check=Decimal("300.00"),
            max_cashback_per_tx=Decimal("500.00"),
            max_cashback_per_client=Decimal("3000.00"),
            budget=Decimal("200000.00"),
            start_date=today + timedelta(days=30),
            end_date=today + timedelta(days=120),
            status="draft",
            segment="all",
            category="Купить продукты",
        )
        session.add(offer3)

        # Add terminals
        for terminal_id in ["T001", "T002", "T003", "T004", "T005"]:
            session.add(OfferTerminal(
                offer_id=offer1.id,
                terminal_id=terminal_id,
                mcc="5411",
            ))

        for terminal_id in ["M001", "M002", "M003"]:
            session.add(OfferTerminal(
                offer_id=offer2.id,
                terminal_id=terminal_id,
                mcc="5411",
            ))

        # Add placements
        session.add(OfferPlacement(
            offer_id=offer1.id,
            placement_type="catalog",
            impressions=15000,
            clicks=2100,
        ))
        session.add(OfferPlacement(
            offer_id=offer1.id,
            placement_type="push",
            cpm_rate=Decimal("50.00"),
            budget=Decimal("10000.00"),
            budget_spent=Decimal("3500.00"),
            impressions=70000,
            clicks=1400,
        ))

        # Create test client
        client = Client(
            id=uuid.uuid4(),
            phone_hash="a1b2c3d4e5f6789012345678901234567890123456789012345678901234",
            cashback_total=Decimal("1500.00"),
        )
        session.add(client)

        # Activate offer for test client
        session.add(ClientActivation(
            client_id=client.id,
            offer_id=offer1.id,
            status="active",
        ))

        # Flush to ensure all parent records exist before inserting FK-dependent rows
        await session.flush()

        # Add billing transactions
        session.add(BillingTransaction(
            partner_id=pyaterochka.id,
            type="topup",
            amount=Decimal("1000000.00"),
            balance_after=Decimal("1000000.00"),
        ))
        session.add(BillingTransaction(
            partner_id=pyaterochka.id,
            type="cashback",
            amount=Decimal("-123400.00"),
            balance_after=Decimal("876600.00"),
            reference_id=str(offer1.id),
        ))

        await session.commit()
        print("Database seeded successfully!")
        print(f"\nDemo accounts:")
        print(f"  Operator: admin@beeline.ru / admin123")
        print(f"  Пятёрочка: partner@pyaterochka.ru / partner123")
        print(f"  Магнит: partner@magnit.ru / partner123")
        print(f"\nTest client phone_hash: a1b2c3d4e5f6789012345678901234567890123456789012345678901234")


if __name__ == "__main__":
    asyncio.run(seed())
