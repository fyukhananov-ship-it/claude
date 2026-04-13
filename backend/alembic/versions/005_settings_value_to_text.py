"""change app_settings value to text

Revision ID: 005
Revises: 004
Create Date: 2026-04-13
"""
from alembic import op
import sqlalchemy as sa

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("app_settings", "value", type_=sa.Text(), existing_type=sa.String(1000))


def downgrade() -> None:
    op.alter_column("app_settings", "value", type_=sa.String(1000), existing_type=sa.Text())
