# Claim Compiler architecture

## Proof rule

Every proposed report claim passes five typed gates:

```text
deterministic facts
  → evidence joins
  → counterevidence / exclusions
  → provenance resolution
  → REPORT or HOLD certificate
```

The active dossier determines how many findings compile to `REPORT` or `HOLD`. The bundled sample currently produces four reportable patterns and one held alternative; uploaded dossiers produce their own result set.

Certificate strings include the active dossier's content hash, rule name, and finding index. They identify the current analysis but are not digital signatures.

## Truth hierarchy

1. Immutable dossier source + exact location.
2. Deterministic row selection, calculation, and join.
3. Reviewer-approved claim scope.
4. Optional specialist proposal.

Cognee may propose relationship candidates, Tavily may corroborate public identity, and local Codex may challenge wording. None can create a proof atom that enters a certificate without a deterministic check and a resolved dossier anchor.

The resolver always uses the atom's explicit `sourceId`; it never selects the first source or treats a model response as provenance.

## Runtime

`services/audit-engine` is the authoritative analysis process. The browser submits local files, receives typed findings and exact source anchors, and builds the PlateJS report from that response. **Rerun analysis** reparses the active in-memory dossier before invoking the selected specialists.

The first dossier is only the initial selection. The final dossier is streamed from its local folder, and Custom accepts a new upload. Ground truth is never loaded. `test_engine.py` verifies both presets and creates an independent dossier with different identifiers, amounts, vendor names, and approval threshold.

## Setup page

The Setup tab automatically tests the audit engine plus the Cognee, Tavily, and Codex loopback endpoints. It does not request or store credentials in the browser.

The browser persists only the three endpoint URLs under `trace:claim-compiler:endpoints:v2`. It does not persist health responses. URLs cannot contain credentials, query strings, or fragments. Plain HTTP is accepted only for `localhost`, `127.0.0.1`, or `::1`; every other host requires HTTPS. Fetches omit cookies.

An HTTP 200 does not pass by itself. The response must parse as JSON and match the service contract.

## Health contracts

### Cognee adapter

```json
{
  "service": "cognee",
  "ok": true,
  "mode": "local",
  "provenanceResolver": true
}
```

Cognee runs only on loopback through `services/cognee-local`. Ollama supplies both `llama3.1:8b` and `nomic-embed-text`; SQLite, LanceDB, and Kuzu persist in a Docker volume. There is no Cognee Cloud account or Cognee API key. Retrieved graph candidates still pass through the exact source resolver before becoming evidence.

### Tavily proxy

```json
{
  "service": "tavily-proxy",
  "ok": true,
  "keyConfigured": true,
  "usageCheck": true
}
```

Run `services/tavily-proxy/start.sh`. It loads the ignored local key, validates it with the server-side `/usage` check, and returns no key, token fragment, account email, or raw vendor response.

### Codex reviewer sidecar

```json
{
  "service": "codex",
  "ok": true,
  "auth": "chatgpt",
  "sandbox": "read-only"
}
```

Run `services/codex-reviewer/start.sh`. The loopback sidecar reuses the CLI's ChatGPT sign-in, disables workspace writes, runs ephemerally, validates a fixed review schema, and returns suggestions only.

## Local dev status bridge

The Vite dev plugin exposes safe `GET /api/setup/status` while running `vite`:

- `codex --version`
- `codex login status`
- boolean presence of `TAVILY_API_KEY`
- local Cognee and Ollama reachability

It never runs `codex exec`, reads source files, or returns credential values. Output is reduced to booleans, a sanitized version, and the detected auth kind. The route is dev-only; a deployed static build must supply an equivalent server route or show the bridge as unavailable.

Start the demo with `--host 127.0.0.1`. Do not expose this development route on a public interface.

## Environment

Copy `.env.example` to `.env` only when optional services are configured. `.env.example` contains blank placeholders and non-secret loopback URLs. Vite loads these values server-side with `loadEnv`; none is added to `define` or exposed through `import.meta.env`.

## Acceptance checks

- The bundled sample and a generated independent dossier both pass engine tests.
- Every citation round-trips to file, location, passage, and source hash.
- Missing or ambiguous resolution blocks certification.
- Negative-evidence atoms retain query, filters, population identity, and zero-result proof.
- Specialist output cannot bypass deterministic gates.
- Cross-dossier IDs cannot resolve.
- Health endpoints reject malformed JSON even when HTTP status is 200.
- Replacing the dossier changes findings, identifiers, amounts, citations, and report text.
