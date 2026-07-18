#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
import json
import urllib.request

def get(url):
    with urllib.request.urlopen(url, timeout=5) as response:
        return response.status, response.read()

status, _ = get('http://127.0.0.1:8000/health')
assert status == 200
status, openapi_raw = get('http://127.0.0.1:8000/openapi.json')
openapi = json.loads(openapi_raw)
paths = openapi.get('paths', {})
assert '/api/v1/remember' in paths
assert '/api/v1/recall' in paths
status, adapter_raw = get('http://127.0.0.1:43110/health')
adapter = json.loads(adapter_raw)
assert status == 200
assert adapter.get('ok') is True
assert adapter.get('mode') == 'local'
assert adapter.get('selfHosted') is True
assert adapter.get('apiVersion') == 'v1'
assert adapter.get('models', {}).get('llm', {}).get('ready') is True
assert adapter.get('models', {}).get('embedding', {}).get('ready') is True
print(f"Cognee {adapter.get('build')} ready: remember + recall, local Ollama, local stores")
PY
