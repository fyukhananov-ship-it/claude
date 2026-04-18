"""create banners table

Revision ID: 006
Revises: 005
Create Date: 2026-04-13
"""
from alembic import op
import sqlalchemy as sa

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "banners",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("subtitle", sa.String(500), server_default=""),
        sa.Column("partner_name", sa.String(255), server_default=""),
        sa.Column("image_url", sa.String(512), nullable=True),
        sa.Column("cta_text", sa.String(100), server_default="Перейти"),
        sa.Column("offer_id", sa.Uuid(), sa.ForeignKey("offers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("enabled", sa.Boolean(), server_default="true"),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("banners")
