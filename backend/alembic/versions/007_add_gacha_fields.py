"""add gacha pity fields to clients

Revision ID: 007
Revises: 006
Create Date: 2026-04-13
"""
from alembic import op
import sqlalchemy as sa

revision = "007"
down_revision = "006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("clients", sa.Column("gacha_pity", sa.Integer(), server_default="0", nullable=False))
    op.add_column("clients", sa.Column("gacha_total_pulls", sa.Integer(), server_default="0", nullable=False))


def downgrade() -> None:
    op.drop_column("clients", "gacha_pity")
    op.drop_column("clients", "gacha_total_pulls")
