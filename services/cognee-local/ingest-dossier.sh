#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

base_url="${COGNEE_LOCAL_URL:-http://127.0.0.1:8000}"
dataset="${COGNEE_DATASET:-audit-muster-2025}"
mapfile_cmd=(find source-docs/data -type f)
files=()
while IFS= read -r file; do files+=("$file"); done < <("${mapfile_cmd[@]}" | sort)

if [[ ${#files[@]} -eq 0 ]]; then
  echo "No dossier files found under source-docs/data." >&2
  exit 1
fi

if [[ "${COGNEE_DRY_RUN:-0}" == "1" ]]; then
  echo "Would remember ${#files[@]} dossier files in ${dataset}."
  exit 0
fi

args=(-fsS -X POST "${base_url}/api/v1/remember" -F "datasetName=${dataset}" -F "run_in_background=false")
for file in "${files[@]}"; do args+=(-F "data=@${file}"); done
curl "${args[@]}"
echo
