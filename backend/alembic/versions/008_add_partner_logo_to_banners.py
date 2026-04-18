"""add partner_logo_url to banners

Revision ID: 008
Revises: 007
Create Date: 2026-04-13
"""
from alembic import op
import sqlalchemy as sa

revision = "008"
down_revision = "007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("banners", sa.Column("partner_logo_url", sa.String(512), nullable=True))


def downgrade() -> None:
    op.drop_column("banners", "partner_logo_url")
