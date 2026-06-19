#!/usr/bin/env bash
# Simple smoke test for the prototype
set -euo pipefail
BASE_URL=${1:-http://localhost:8080}
echo "Waiting for service at $BASE_URL"
for i in {1..10}; do
  if curl --silent --fail "$BASE_URL/health" >/dev/null 2>&1; then
    echo "Service healthy"
    break
  fi
  echo "Retrying... ($i)"
  sleep 1
done
echo "Listing cars"
curl -s "$BASE_URL/cars" | jq || true
