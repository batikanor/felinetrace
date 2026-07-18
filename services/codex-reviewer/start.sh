#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v codex >/dev/null 2>&1; then
  echo "Codex CLI is not installed." >&2
  exit 1
fi
if ! codex login status 2>&1 | grep -qi 'Logged in using ChatGPT'; then
  echo "Codex CLI is not signed in with ChatGPT." >&2
  exit 1
fi

exec node server.mjs
