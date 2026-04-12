"""add is_featured to offers

Revision ID: 002
Revises: 001
Create Date: 2026-04-12
"""
from alembic import op
import sqlalchemy as sa

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("offers", sa.Column("is_featured", sa.Boolean(), server_default="false", nullable=False))


def downgrade() -> None:
    op.drop_column("offers", "is_featured")
