"""Add Open Library edition identifiers.

Revision ID: b6e901a74c20
Revises: 0246901434a1
"""
from alembic import op
import sqlalchemy as sa

revision = 'b6e901a74c20'
down_revision = '0246901434a1'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('books', sa.Column('openlibrary_id', sa.String(), nullable=True))


def downgrade():
    with op.batch_alter_table('books') as batch_op:
        batch_op.drop_column('openlibrary_id')
