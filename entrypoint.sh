#!/bin/sh

echo "Running database migration.."
python -m flask db upgrade

if [ "$(echo "$SINGLE_USER_MODE" | tr '[:upper:]' '[:lower:]')" = "true" ]; then
    if [ -n "$AUTH_DEFAULT_USER" ]; then
        echo "WARNING: Both SINGLE_USER_MODE and AUTH_DEFAULT_USER are set."
        echo "Defaulting to Single User Mode..."
    fi
    echo "Single User Mode enabled. Bootstrapping local environment..."
    python -m flask user bootstrap-single-user

elif [ -n "${AUTH_DEFAULT_USER+1}" ]; then
  echo "\$AUTH_DEFAULT_USER is set"
  python -m flask user create "$AUTH_DEFAULT_USER" "$AUTH_DEFAULT_USER" user --password "$AUTH_DEFAULT_PASSWORD" 
fi

echo "Starting gunicorn.."
exec gunicorn -w 4 -b :5000 api.app:app