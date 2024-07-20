#!/bin/sh

echo "Running database migration.."
python -m flask db upgrade
echo "Starting gunicorn.."
exec gunicorn -w 4 -b :5000 api.app:app