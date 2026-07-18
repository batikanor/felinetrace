#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

if [[ -z "${TAVILY_API_KEY:-}" ]]; then
  echo "TAVILY_API_KEY is missing from services/tavily-proxy/.env.local" >&2
  exit 1
fi

exec node server.mjs
