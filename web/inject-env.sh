#!/bin/sh

# Default env variables, if not set use it will use these defaults.
export BL_ALLOW_MANUAL_LOGIN="${BL_ALLOW_MANUAL_LOGIN:-true}"
export BL_ALLOW_REGISTRATION="${BL_ALLOW_REGISTRATION:-true}"
export BL_GOOGLE_ID="${BL_GOOGLE_ID:-""}"
export BL_OIDC_CLIENT_ID="${BL_OIDC_CLIENT_ID:-""}"

for i in $(env | grep BL_)
do
    key=$(echo $i | cut -d '=' -f 1)
    value=$(echo $i | cut -d '=' -f 2-)
    echo $key=$value
    # sed All files
    # find /usr/share/nginx/html -type f -exec sed -i "s|${key}|${value}|g" '{}' +

    # sed JS and CSS only
    find /usr/share/nginx/html -type f \( -name '*.js' -o -name '*.css' \) -exec sed -i "s|${key}|${value}|g" '{}' +
done