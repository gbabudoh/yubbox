#!/bin/bash
# Hourly cron script — recomputes visibility scores and regenerates insights.
# Add to crontab: 0 * * * * /path/to/yubbox/scripts/cron-rerank.sh >> /var/log/yubbox-cron.log 2>&1

set -euo pipefail

APP_URL="${APP_URL:-http://localhost:3000}"
CRON_SECRET="${CRON_SECRET:?CRON_SECRET env var is required}"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Running rerank..."

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X GET "${APP_URL}/api/cron/rerank" \
  -H "Authorization: Bearer ${CRON_SECRET}")

HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] OK — $HTTP_BODY"
else
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] FAILED (HTTP $HTTP_CODE) — $HTTP_BODY"
  exit 1
fi
