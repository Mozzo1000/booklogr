"""Add optional task failure diagnostics.

Revision ID: d73e9b821a04
Revises: 0246901434a1
"""
from alembic import op
import sqlalchemy as sa

revision = 'd73e9b821a04'
down_revision = '0246901434a1'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('tasks') as batch_op:
        batch_op.add_column(sa.Column('error_message', sa.String(255), nullable=True))


def downgrade():
    with op.batch_alter_table('tasks') as batch_op:
        batch_op.drop_column('error_message')
