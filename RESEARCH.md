# Retrieval and verification research

Research date: 18 July 2026.

## Recommendation

Keep deterministic dossier tests as the scoring core. Add memory, public search and a model reviewer as gated specialists—not as parallel sources of truth.

```text
rows + documents
      ↓
deterministic joins + peer/sequence tests
      ↓
evidence graph / memory
      ↓ only for named-entity corroboration
official public sources + Tavily discovery
      ↓ only for unresolved contradictions
local Codex reviewer
      ↓
exact dossier citations → editable PlateJS report
```

## Cognee

Useful for cross-document memory, alias resolution, relationship paths and reviewer feedback.

- Run Cognee only on loopback through `services/cognee-local`; Cognee Cloud is intentionally unsupported.
- Follow the v1.4 lifecycle and REST surface: `remember`, `recall`, `improve`, `forget` under `/api/v1`.
- Configure both local providers so neither silently falls back to OpenAI: Ollama `llama3.1:8b` for generation and `nomic-embed-text` for 768-dimensional embeddings.
- Use one isolated dataset per dossier.
- Define an audit-specific `DataPoint` graph model instead of accepting unconstrained entity extraction.
- Feed structured tables through Cognee's dlt integration so foreign keys and rows create deterministic graph edges.
- Keep an explicit provenance resolver. Cognee chunk/summary search returns IDs, but source file paths live on `Document` nodes; a retrieved answer is not yet an audit citation.
- Reviewer feedback may tune retrieval, but benchmark ground truth must never enter `improve()`.

Sources: [Cognee repository](https://github.com/topoteretes/cognee), [local setup](https://docs.cognee.ai/guides/local-setup), [REST deployment](https://docs.cognee.ai/guides/deploy-rest-api-server), [search provenance](https://docs.cognee.ai/guides/search-basics), and [dataset isolation](https://docs.cognee.ai/core-concepts/multi-user-mode/permissions-system/datasets).

## Tavily and public checks

Useful for corroborating a vendor's existence, VAT registration, sanctions exposure, filings, address and domain—not for proving an internal payment or accounting claim.

- Keep the API key in a server-side adapter; never ship it in the Vite client.
- Split a company check into focused queries under 400 characters.
- Query authoritative domains directly first; keep domain allowlists short.
- Default to `basic`; use `advanced` only when targeted snippets justify the extra credit.
- Search first, then extract only selected pages. Store URL, authority, result score, query, retrieval time and content hash.
- Cache and replay external results in regression tests.
- An absent search result is a lead, not proof. This is especially important for this fictional sample dossier, whose entities are not expected to have real public records.

Authoritative German/EU sources:

- [Company Register](https://www.unternehmensregister.de/en) for company and register information
- [VIES](https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/vat-identification-numbers_en) for VAT-number validation
- [EU consolidated sanctions data](https://data.europa.eu/data/datasets/financialsanctions?locale=en)
- [Bundesanzeiger](https://www.bundesanzeiger.de/pub/en/search) for official and legally relevant publications

Tavily sources: [search best practices](https://docs.tavily.com/documentation/best-practices/best-practices-search), [Search API](https://docs.tavily.com/documentation/api-reference/endpoint/search).

## Codex as local support

This can avoid a separate OpenAI API key, but it is not a free-credit workaround.

- Codex CLI supports ChatGPT sign-in for subscription access and API-key sign-in for usage-based access.
- `codex exec` reuses the CLI's saved authentication by default. On this development machine, `codex login status` reports **Logged in using ChatGPT**.
- A local sidecar can therefore run read-only, structured review tasks using the user's existing Codex session and ChatGPT allowance.
- Do not let a browser silently reuse or receive Codex credentials. Keep the SDK, app-server or `codex exec` process on localhost/server-side.
- Default to an allowlisted dossier directory, read-only sandbox, `--ephemeral`, JSONL or JSON-schema output, and a human accept/reject step.
- Do not expose a local Codex runner to untrusted or public users. ChatGPT plan limits and credits still apply.
- Codex is best used here as a skeptic or report-diff reviewer; deterministic code should continue to calculate amounts and joins.

Sources: [Codex authentication](https://learn.chatgpt.com/docs/auth), [Codex SDK](https://learn.chatgpt.com/docs/codex-sdk), [Codex app-server](https://learn.chatgpt.com/docs/app-server), [non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode).

## Benchmark policy

1. Freeze rules and prompts before opening the held-out dossier.
2. Keep ground truth in a separate evaluation process.
3. Score scheme recall, finding precision, amount accuracy, citation validity and decoy false positives separately.
4. Record which method introduced, confirmed, rejected or merely corroborated each claim.
5. Require exact dossier evidence even when memory, web search or a model agrees.
6. Run ablations: rules only; rules + statistics; + memory; + web; + reviewer.
