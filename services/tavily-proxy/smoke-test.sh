#!/usr/bin/env bash
set -euo pipefail

base_url="${TAVILY_PROXY_URL:-http://127.0.0.1:8787}"

health="$(curl --fail --silent --show-error "$base_url/health")"
legacy_health="$(curl --fail --silent --show-error "$base_url/health/tavily")"

node -e '
  const health = JSON.parse(process.argv[1])
  const legacy = JSON.parse(process.argv[2])
  if (health.service !== "tavily" || health.ok !== true || health.usageChecked !== true) process.exit(1)
  if (legacy.service !== "tavily-proxy" || legacy.ok !== true || legacy.usageCheck !== true) process.exit(1)
' "$health" "$legacy_health"

echo "Tavily proxy ready: key authenticated through /usage"

if [[ "${TAVILY_FULL_SMOKE:-0}" == "1" ]]; then
  result="$(curl --fail --silent --show-error \
    -H 'Content-Type: application/json' \
    -d '{"query":"Tavily API documentation","includeDomains":["docs.tavily.com"],"maxResults":1}' \
    "$base_url/search")"
  node -e '
    const result = JSON.parse(process.argv[1])
    if (result.service !== "tavily" || result.ok !== true || !Array.isArray(result.results) || result.results.length < 1) process.exit(1)
  ' "$result"
  echo "Tavily search passed"
fi
