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

The four corrected dossier findings compile to `REPORT`. `X-05` tests the proposed claim that the €86,500 accrual offsets the eight December receipts/invoices. It is held because the accrual contains none of `ER901427–434` or `WE400840–847` and is described as other unbilled work. This is a false-positive control grounded in sources `[10–11]`.

Certificate strings such as `proof:F01:v1` are stable demo IDs, not cryptographic hashes. A production certificate would hash canonicalized atoms, rule versions, source content hashes, and resolver output.

## Truth hierarchy

1. Immutable dossier source + exact location.
2. Deterministic row selection, calculation, and join.
3. Reviewer-approved claim scope.
4. Optional specialist proposal.

Cognee may propose relationship candidates, Tavily may corroborate public identity, and local Codex may challenge wording. None can create a proof atom that enters a certificate without a deterministic check and a resolved dossier anchor.

The resolver always uses the atom's explicit `sourceId`; it never selects the first source or treats a model response as provenance.

## Setup page

The Setup tab has three distinct layers:

- **Core demo:** compiler self-test, 14-anchor registry, 35-file dossier fixture, PlateJS report.
- **This machine:** sanitized dev-server detection for the Codex CLI and presence-only environment checks.
- **Adapters:** user-configurable server health endpoints for Cognee, Tavily, and Codex.

The browser persists only the three endpoint URLs under `trace:claim-compiler:endpoints:v1`. It does not persist health responses. URLs cannot contain credentials, query strings, or fragments. Plain HTTP is accepted only for `localhost`, `127.0.0.1`, or `::1`; every other host requires HTTPS. Fetches omit cookies.

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

Create the account/key outside this app, set `TAVILY_API_KEY` on the proxy server, and validate it server-side with a low-cost usage check. Return no key, token fragment, account email, or raw vendor response.

### Codex reviewer sidecar

```json
{
  "service": "codex",
  "ok": true,
  "auth": "chatgpt",
  "sandbox": "read-only"
}
```

CLI authentication and reviewer-sidecar readiness are deliberately separate. The sidecar should bind loopback, disable workspace writes, accept a fixed review schema, and return suggestions only.

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

## Production acceptance checks

- Four known claims compile; X-05 stays held.
- Every citation round-trips to file, location, passage, and source hash.
- Missing or ambiguous resolution blocks certification.
- Negative-evidence atoms retain query, filters, population identity, and zero-result proof.
- Specialist output cannot bypass deterministic gates.
- Cross-dossier IDs cannot resolve.
- Health endpoints reject malformed JSON even when HTTP status is 200.
- Browser storage contains endpoint URLs only.
