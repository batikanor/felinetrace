#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if ! docker info >/dev/null 2>&1; then
  echo "Docker Desktop is not running." >&2
  exit 1
fi
if ! curl -fsS http://127.0.0.1:11434/api/tags >/dev/null; then
  echo "Ollama is not running." >&2
  exit 1
fi

for model in llama3.1:8b nomic-embed-text:latest; do
  if ! ollama list | awk 'NR>1 {print $1}' | grep -Fxq "$model"; then
    ollama pull "$model"
  fi
done

if [[ ! -f .env.local ]]; then
  cp .env.example .env.local
fi

docker compose up -d

for _ in {1..90}; do
  if curl -fsS http://127.0.0.1:43110/health >/dev/null 2>&1; then
    curl -fsS http://127.0.0.1:43110/health
    echo
    exit 0
  fi
  sleep 2
done

docker compose ps
echo "Local Cognee did not become ready." >&2
exit 1
