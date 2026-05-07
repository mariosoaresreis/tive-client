#!/bin/sh
set -eu

: "${TIVE_QUERY_BASE_URL:=http://localhost:8081}"
: "${TIVE_QUERY_API_KEY:=REPLACE_WITH_TIVE_QUERY_API_KEY}"
: "${GOOGLE_MAPS_API_KEY:=REPLACE_WITH_GOOGLE_MAPS_API_KEY}"

find /usr/share/nginx/html -type f \( -name '*.js' -o -name '*.html' \) -print0 |
  xargs -0 sed -i \
    -e "s|__TIVE_QUERY_BASE_URL__|${TIVE_QUERY_BASE_URL}|g" \
    -e "s|__TIVE_QUERY_API_KEY__|${TIVE_QUERY_API_KEY}|g" \
    -e "s|__GOOGLE_MAPS_API_KEY__|${GOOGLE_MAPS_API_KEY}|g"

exec nginx -g 'daemon off;'

