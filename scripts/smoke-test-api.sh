#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4173}"
API_KEY="${GEMINI_API_KEY:-}"

if [[ -z "$API_KEY" ]]; then
  echo "GEMINI_API_KEY is required"
  exit 1
fi

NODE_ENV=production PORT="$PORT" GEMINI_API_KEY="$API_KEY" npx tsx server.ts >/tmp/neuromind-server.log 2>&1 &
PID=$!
trap 'kill $PID >/dev/null 2>&1 || true' EXIT

for _ in {1..30}; do
  if curl -s "http://127.0.0.1:$PORT/api/status" >/tmp/neuromind-status.json; then
    break
  fi
  sleep 1
done

cat /tmp/neuromind-status.json

grep -q '"aiAvailable":true' /tmp/neuromind-status.json

echo "Smoke test passed: API key is wired and server responds."
