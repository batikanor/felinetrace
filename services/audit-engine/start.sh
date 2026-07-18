#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

workspace_python="/Users/batikanor2/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
if [[ -x "$workspace_python" ]]; then
  python="$workspace_python"
else
  python="${PYTHON:-python3}"
  if ! "$python" -c 'import openpyxl, docx, pypdf' >/dev/null 2>&1; then
    if [[ ! -x .venv/bin/python ]]; then
      "$python" -m venv .venv
      .venv/bin/pip install --disable-pip-version-check -r requirements.txt
    fi
    python=.venv/bin/python
  fi
fi

exec "$python" server.py
