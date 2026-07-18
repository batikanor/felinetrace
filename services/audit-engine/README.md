# Local audit engine

The engine behind Solution 2-10-5 analyzes the currently loaded dossier. It does not replay fixture results or read `source-docs/data-ground-truth`.

It accepts CSV, TXT/GDPdU, XLSX, DOCX, PDF, XML, DTD, JSON, and Markdown; performs deterministic cross-document tests; resolves exact source anchors; and emits typed claim gates. A content hash identifies each dossier.

Endpoints:

- `GET /health`
- `GET /api/analysis`
- `POST /api/analyze` with base64-encoded local files
- `POST /api/rerun` for the active dossier
- `POST /api/load-sample`
- `POST /api/specialists` for live local Cognee, Tavily and Codex calls

The initial sample is loaded only from `source-docs/data`. An uploaded dossier replaces it in memory. Cognee is self-hosted and receives a compact, resolved evidence set; Tavily is called through the local secret-holding proxy; Codex is called through the local read-only reviewer sidecar. Specialist output never creates a citation or bypasses a deterministic gate.

Run `./test.sh` to verify the sample and a generated second dossier with different identifiers, amounts, and policy threshold.
