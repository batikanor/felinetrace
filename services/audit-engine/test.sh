#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON="/Users/batikanor2/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
if [[ ! -x "$PYTHON" ]]; then
  PYTHON="python3"
fi

cd "$SCRIPT_DIR"
"$PYTHON" -m py_compile server.py test_engine.py
"$PYTHON" -m unittest -v test_engine.py
