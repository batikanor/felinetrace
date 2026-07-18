#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
import json
import urllib.request

with urllib.request.urlopen('http://127.0.0.1:4010/health', timeout=5) as response:
    payload = json.load(response)

assert payload['service'] == 'codex'
assert payload['ok'] is True
assert payload['auth'] == 'chatgpt'
assert payload['sandbox'] == 'read-only'
assert payload['ephemeral'] is True
print(f"{payload['version']} ready: ChatGPT auth, ephemeral read-only reviews")
PY

if [[ "${CODEX_FULL_SMOKE:-0}" == "1" ]]; then
  response="$(curl -fsS --max-time 240 -X POST http://127.0.0.1:4010/review \
    -H 'Content-Type: application/json' \
    -d '{"text":"The control definitely failed and management committed fraud [1].","focus":"unsupported certainty"}')"
  python3 -c 'import json,sys; p=json.load(sys.stdin); assert p["ok"] is True; assert p["review"]["verdict"] in ("ready", "revise"); print("Structured review passed")' <<<"$response"
fi
