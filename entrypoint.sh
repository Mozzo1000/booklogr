#!/bin/sh

echo "Running database migration.."
python -m flask db upgrade

if [ -n "${AUTH_DEFAULT_USER+1}" ]; then
  echo "\$AUTH_DEFAULT_USER is set"
  python -m flask user create "$AUTH_DEFAULT_USER" "$AUTH_DEFAULT_USER" user --password "$AUTH_DEFAULT_PASSWORD" 
fi

echo "Starting gunicorn.."
exec gunicorn -w 4 -b :5000 api.app:app