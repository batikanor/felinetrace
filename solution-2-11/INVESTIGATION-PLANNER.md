# Active Investigation Planner

## Product decision

The editable PlateJS memo remains the system of record. The planner sits above it and exposes a short, auditable loop:

`hypothesis → evidence gap → feasible test → report / stop / hold`

The experience is designed for a two-minute presentation. It does not add a separate investigation product, chat surface, or generated narrative.

## Corrected sample registry

| ID | Finding | Amount | Sources |
| --- | --- | ---: | --- |
| F-01 | Ratio payment chain | €295,120 | [1–4] |
| F-02 | Repair-like capex | €150,800 | [5–7] |
| F-03 | December costs in January | €192,000 | [8–11] |
| F-04 | Approval threshold split | €39,040 | [12–14] |

X-05 is the dossier’s rejected alternative: the €86,500 generic accrual contains none of invoice references ER901427–ER901434 or receipt references WE400840–WE400847. The planner therefore holds/rejects the offset route with exact provenance [10–11].

## Recommendation model

The replay score is a configurable UI heuristic:

`decision impact × expected gap closure ÷ time + request units`

Only unfinished, locally deterministic dossier actions are eligible to become the recommended decision test. Time is measured in minutes; external cost is measured in request units, never invented currency.

For the demo, a report transition occurs at 85% coverage and 15% uncertainty. Those values and percentages illustrate planner behavior. They are not evaluation truth, fraud probability, or model confidence.

Specialist actions are intentionally separated:

- **Cognee:** prior relationship recall.
- **Tavily:** focused official-record corroboration through a server proxy.
- **Codex:** read-only skeptic review through a loopback sidecar.

Completing a specialist route can save review context, but it cannot change report coverage or mint a report citation. The cited dossier remains the only decision evidence in this prototype.

## Runtime architecture

```text
Browser
  ├─ PlateJS memo, comments, manual cases
  ├─ deterministic dossier planner
  ├─ draggable exact-source windows
  └─ URL-only health configuration
          │
          ├─ GET /api/setup/status (Vite development plugin)
          ├─ Cognee adapter health
          ├─ Tavily proxy health
          └─ Codex reviewer-sidecar health
```

The Vite status plugin returns only booleans and sanitized version/auth fields. It never returns secrets, token text, or command output beyond the first short CLI version line.

## Zero-config path

No account or key is needed for:

- four corrected sample findings and 14 exact citations;
- PlateJS editing, formatting, and comments;
- the deterministic planner and X-05 hold;
- draggable source windows and Sources page;
- manual case creation.

Optional services stay off unless a matching adapter passes its JSON health contract.

## Health contracts

Health endpoints are non-secret URLs. HTTP is accepted only for loopback; non-loopback endpoints must use HTTPS.

```json
{ "service": "cognee", "ok": true, "mode": "local", "selfHosted": true, "apiVersion": "v1" }
```

Cognee is self-hosted on loopback; cloud mode is intentionally unsupported.

```json
{ "service": "tavily", "ok": true, "mode": "proxy", "usageChecked": true }
```

```json
{ "service": "codex", "ok": true, "auth": "chatgpt", "sandbox": "read-only" }
```

Codex CLI installation/authentication and reviewer-sidecar readiness are distinct checks. CLI login alone never marks the sidecar ready.

## Server configuration

Copy `.env.example` to `.env.local` only when configuring optional services. Keep `TAVILY_API_KEY` on the server; local Cognee needs no Cognee credential, and there are no browser key inputs or `VITE_` secret variables.

- **Cognee local:** run `services/cognee-local/start.sh`; Ollama supplies the LLM and embeddings while SQLite, LanceDB, and Kuzu persist locally.
- **Tavily:** place the key on the proxy server. The proxy may check usage server-side and return only `usageChecked`.
- **Codex:** run `services/codex-reviewer/start.sh`; it reuses the CLI's ChatGPT sign-in and enforces ephemeral read-only structured reviews.

The development status route invokes only `codex --version` and `codex login status` with short timeouts. Reviews go through the separate loopback sidecar.

## Persistence and reset

`localStorage` key `trace.investigation.endpoint-urls.v3` stores only the three endpoint URLs. Planner runs, manual cases, source windows, and report edits are session-only. **Reset** restores and retests the default loopback URLs.
