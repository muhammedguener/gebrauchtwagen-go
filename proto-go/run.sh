#!/usr/bin/env bash
# Simple runner for the Go prototype (uses Docker if Go unavailable)
set -euo pipefail
if command -v go >/dev/null 2>&1; then
  echo "Running with local go"
  (cd proto-go && go run .)
else
  echo "Go not found — running with Docker"
  docker run --rm -v "$(pwd)/proto-go":/app -w /app golang:1.20 bash -c "go run ."
fi
