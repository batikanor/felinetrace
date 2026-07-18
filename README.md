# FelineTrace

**Follow the money. Find the fraud. Prove it.**

FelineTrace is an evidence-first audit workspace for the Cortea challenge. It analyzes a company dossier, tests cross-document accounting relationships, and compiles only supported claims into an editable PlateJS report. Every amount and conclusion links back to an exact source row, cell, section, or page.

The repository now contains one product implementation: [`solution`](./solution).

## What the auditor gets

- A focused, Google Docs-style PlateJS report that remains editable.
- Inline numbered citations with exact source previews.
- Deterministic findings separated from held or cleared hypotheses.
- A compact proof view for facts, joins, counterevidence, provenance, and the final decision.
- Source cards and draggable source windows for side-by-side review.
- A manual source-linked case flow.
- A main-page dataset switch for **First dataset**, **Final dataset**, and **Custom** uploads.
- A Setup page that automatically tests every local service on load.

## How analysis works

```text
source files
    ↓
format-aware parsing and streaming
    ↓
deterministic reconciliations, joins, control tests, and counterevidence
    ↓
exact source-anchor resolution
    ↓
optional real specialists: local Cognee → Tavily → local Codex
    ↓
REPORT or HOLD proof → editable PlateJS report
```

The deterministic engine is authoritative. Specialists can discover relationships, corroborate public identity, or challenge wording, but they cannot create a citation, change a calculation, or bypass a proof gate.

### Supported evidence

CSV, TXT/GDPdU, XLSX, DOCX, PDF, XML, DTD, JSON, and Markdown are supported. The final dossier includes a 292 MB general-ledger export; the engine streams its relevant rows instead of loading the file into memory.

### Dataset modes

| Mode | Source | Behavior |
| --- | --- | --- |
| First dataset | `source-docs/data/` | Loads and analyzes the original sample dossier. |
| Final dataset | `source-docs/final-data/Daten BSP/` | Streams and reconciles the released final dossier. |
| Custom | Browser folder or file upload | Parses a new dossier and reruns the same generalized pipeline. |

The preset folders and uploaded data are local only. `source-docs/data-ground-truth/` is never read by the application or tests.

## Final-dataset verification

The current deterministic run reads 44 files and 1,957,468 source rows. It compiles three reportable control or completeness findings and holds one supported alternative:

1. A 10-line ledger completeness discrepancy, equal to €5,197,000 per side.
2. Four self-approved journals totaling €2,197,000 through a related-party clearing account.
3. A €3,000,000 year-end journal described as `Darlehen lt. GF`, posted without approval.
4. A bill-and-hold sale is held rather than reported because the signed agreement provides the required counterevidence.

These results are produced from the dossier at runtime; they are not frontend fixtures.

## Real specialist integrations

| Service | Purpose | Trust boundary | Local endpoint |
| --- | --- | --- | --- |
| Cognee | Dossier-scoped relationship memory and graph recall | Self-hosted; compact resolved evidence only | `127.0.0.1:43110` adapter, `127.0.0.1:8000` API |
| Tavily | Focused public corroboration for named entities | Key stays in the server-side proxy; search cannot prove an internal posting | `127.0.0.1:8787` |
| Codex | Challenges wording, overstatement, counterevidence, and citation scope | Existing local ChatGPT login; ephemeral read-only execution | `127.0.0.1:4010` |

Cognee uses local Ollama generation and embeddings with local SQLite, LanceDB, and Kuzu stores. No Cognee Cloud account or key is used.

## Prerequisites

- Node.js 20 or newer
- Python 3.11 or newer
- Docker Desktop
- [Ollama](https://ollama.com/) for local Cognee models
- Codex CLI signed in with ChatGPT for the reviewer
- A Tavily API key stored locally in `services/tavily-proxy/.env.local`

Copy the Tavily example once and add the key without committing it:

```bash
cd /path/to/felinetrace/services/tavily-proxy
cp .env.example .env.local
```

## Run locally

Start these processes in separate terminals. All services bind to loopback.

### 1. Local Cognee

```bash
cd /path/to/felinetrace/services/cognee-local
./start.sh
```

The script verifies Docker and Ollama, pulls `llama3.1:8b` and `nomic-embed-text:latest` when needed, and starts the pinned local Cognee stack.

### 2. Tavily proxy

```bash
cd /path/to/felinetrace/services/tavily-proxy
./start.sh
```

### 3. Codex reviewer

```bash
cd /path/to/felinetrace/services/codex-reviewer
./start.sh
```

### 4. Audit engine

```bash
cd /path/to/felinetrace/services/audit-engine
./start.sh
```

### 5. Web app

```bash
cd /path/to/felinetrace/solution
npm install
npm run dev -- --host 127.0.0.1 --port 43205
```

Open [http://127.0.0.1:43205/](http://127.0.0.1:43205/). Use the dataset control above the report to switch dossiers. The Setup page performs integration checks automatically and also provides manual retest controls.

## Verification

The engine suite proves the first preset, the released final preset, and an independently generated custom dossier with different IDs, amounts, vendor names, and approval thresholds.

```bash
cd /path/to/felinetrace
./services/audit-engine/test.sh
cd solution
npm run lint -- --quiet
npm run build
```

Individual specialist smoke tests are also available as `services/*/smoke-test.sh`.

## Repository layout

```text
solution/                 React + PlateJS auditor workspace
services/audit-engine/    Parsers, deterministic tests, proof compiler, API
services/cognee-local/    Self-hosted Cognee + Ollama adapter
services/tavily-proxy/    Secret-holding Tavily proxy
services/codex-reviewer/  Read-only Codex review sidecar
source-docs/challenge.md  Challenge brief
```

Additional method and deployment details are in [`METHODS.md`](./METHODS.md), [`RESEARCH.md`](./RESEARCH.md), [`SETUP.md`](./SETUP.md), and [`solution/CLAIM-COMPILER.md`](./solution/CLAIM-COMPILER.md).

## Data and security

- `source-docs/data/`, `source-docs/final-data/`, and `source-docs/data-ground-truth/` are gitignored.
- `.env.local`, runtime stores, caches, virtual environments, and generated build output are gitignored.
- The Tavily key never enters browser code or sanitized health responses.
- The Codex sidecar disables workspace writes and validates structured output.
- All local service CORS rules and listeners are restricted to the FelineTrace loopback app.
