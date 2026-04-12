"""add category to offers

Revision ID: 001
Revises:
Create Date: 2026-04-12
"""
from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("offers", sa.Column("category", sa.String(100), nullable=True))


def downgrade() -> None:
    op.drop_column("offers", "category")
