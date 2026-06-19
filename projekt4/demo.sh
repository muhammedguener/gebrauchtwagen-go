#!/usr/bin/env bash
set -euo pipefail
# Demo script for graders: start DB (if not running), run smoke test and collect logs
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR/hono/proto-go"

echo "Starting docker compose (detached)"
docker compose up -d --build || true

echo "Running db smoke test"
bash ./db_smoke_test.sh || true

echo "Collecting logs to projekt4/logs/"
mkdir -p "$ROOT_DIR/projekt4/logs"
docker ps --format '{{.Names}}' | grep -E 'gebrauchtwagen-db|proto-go-app' || true
docker logs gebrauchtwagen-db --tail 500 > "$ROOT_DIR/projekt4/logs/gebrauchtwagen-db.log" 2>/dev/null || true
docker logs proto-go-app-1 --tail 500 > "$ROOT_DIR/projekt4/logs/proto-go-app.log" 2>/dev/null || true

echo "Demo finished. See projekt4/logs for outputs."
