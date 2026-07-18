# Setup and onboarding

Both top variants run as complete replay demos without an account, API key, or external service. Their in-app **Setup** pages distinguish demo readiness, credentials, adapter connectivity, and end-to-end readiness.

## Current development machine

| Capability | Current state | What it means |
| --- | --- | --- |
| PlateJS report and sample dossier | Ready | Editing, citations, sources, findings, and replayed method controls work locally. |
| Codex CLI | Installed | `codex-cli 0.145.0-alpha.18` is available. |
| Codex reviewer | Local | ChatGPT sign-in and the loopback read-only reviewer sidecar are ready. |
| Tavily | Local ready | The ignored local proxy configuration is loaded automatically. |
| Cognee | Local | Docker-hosted Cognee uses local Ollama models and local SQLite/LanceDB/Kuzu stores. |
| OpenAI Platform API | Not configured | Not required for the current Codex login path. |

## Recommended optional setup

### Tavily

Store `TAVILY_API_KEY` only in `services/tavily-proxy/.env.local`. The browser calls our loopback proxy and never receives the key.

Run `services/tavily-proxy/start.sh`. It validates the key through Tavily's server-side `/usage` endpoint and returns only a sanitized readiness response to the Setup page.

Sources: [Tavily quickstart](https://docs.tavily.com/documentation/quickstart), [API authentication](https://docs.tavily.com/documentation/api-reference/introduction), [key management](https://docs.tavily.com/documentation/best-practices/api-key-management).

### Cognee

Run `services/cognee-local/start.sh`. The stack uses the official Cognee image on loopback, Ollama for both generation and embeddings, and local SQLite/LanceDB/Kuzu stores. It does not use Cognee Cloud, a Cognee account, or a Cognee API key.

The FelineTrace adapter must expose a JSON health contract that confirms dataset isolation and provenance resolution. Cognee's own `/health` may be an empty successful response, so the browser should not call or interpret it directly.

Sources: [Cognee local setup](https://docs.cognee.ai/guides/local-setup), [REST deployment](https://docs.cognee.ai/guides/deploy-rest-api-server), and [Cognee repository](https://github.com/topoteretes/cognee).

### Codex

No additional login is needed on this development machine. Run `services/codex-reviewer/start.sh`; the browser receives only a sanitized health contract and structured review output.

The sidecar uses `codex exec --ephemeral --sandbox read-only`, a fixed output schema, a loopback-only origin policy, and a single-review concurrency limit. ChatGPT sign-in avoids a separate Platform API key but consumes the user's Codex/ChatGPT plan allowance. Other users must install Codex and sign in with ChatGPT, or deliberately choose API-key billing.

Sources: [Codex authentication](https://learn.chatgpt.com/docs/auth), [Codex SDK](https://learn.chatgpt.com/docs/codex-sdk), [non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode), [app-server](https://learn.chatgpt.com/docs/app-server).

## User onboarding

1. Open the Setup page and confirm all **Core** checks are green.
2. Choose a dossier and review its file inventory and immutable source anchors.
3. Run the deterministic audit pass.
4. Inspect held leads before enabling optional specialists.
5. Start local Cognee; configure Tavily or the Codex sidecar only if the engagement permits them.
6. Re-run Setup checks; a credential present and an adapter reachable are separate checks.
7. Review every proposed claim and open its exact sources.
8. Accept, edit, or reject the wording in the PlateJS report.
9. Export the report together with its evidence and run trace.

Never place challenge ground truth, API keys, Codex tokens, or raw vendor responses in browser storage.
