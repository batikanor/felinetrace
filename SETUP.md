# Setup and onboarding

Both top variants run as complete replay demos without an account, API key, or external service. Their in-app **Setup** pages distinguish demo readiness, credentials, adapter connectivity, and end-to-end readiness.

## Current development machine

| Capability | Current state | What it means |
| --- | --- | --- |
| PlateJS report and sample dossier | Ready | Editing, citations, sources, findings, and replayed method controls work locally. |
| Codex CLI | Installed | `codex-cli 0.145.0-alpha.18` is available. |
| Codex authentication | Ready | `codex login status` reports ChatGPT sign-in. This does not by itself mean the reviewer sidecar is wired. |
| Tavily | Not configured | No `TAVILY_API_KEY` is present. The replay demo still works. |
| Cognee | Not configured | No Cloud key or local Cognee URL is present. The replay demo still works. |
| OpenAI Platform API | Not configured | Not required for the current Codex login path. |

## Recommended optional setup

### Tavily

Create a free Tavily account and API key. Tavily currently documents 1,000 free monthly credits without requiring a card. Store `TAVILY_API_KEY` only in the local server environment. The browser must call our adapter, never Tavily directly.

The adapter should validate the key with Tavily's server-side `/usage` endpoint and return only a sanitized readiness response to the Setup page.

Sources: [Tavily quickstart](https://docs.tavily.com/documentation/quickstart), [API authentication](https://docs.tavily.com/documentation/api-reference/introduction), [key management](https://docs.tavily.com/documentation/best-practices/api-key-management).

### Cognee

Choose one path:

- **Cognee Cloud:** sign in with Google or GitHub, create an API key, and store `COGNEE_API_KEY` plus the tenant URL on the server.
- **Local Cognee:** install the open-source package or Docker service. The default local stores are SQLite, LanceDB, and Kuzu. Configure both an LLM and embeddings; Ollama plus Fastembed is a local-key-free option.

The FelineTrace adapter must expose a JSON health contract that confirms dataset isolation and provenance resolution. Cognee's own `/health` may be an empty successful response, so the browser should not call or interpret it directly.

Sources: [Cognee installation](https://docs.cognee.ai/getting-started/installation), [Cloud signup](https://docs.cognee.ai/cognee-cloud/sign-up), [API keys](https://docs.cognee.ai/cognee-cloud/ui/api-keys), [API deployment](https://docs.cognee.ai/api-reference/introduction).

### Codex

No additional login is needed on this development machine. The safe integration is a loopback server-side adapter using the Codex SDK or stable `codex exec`; the browser never receives cached credentials.

Use read-only and ephemeral runs, an allowlisted evidence packet, structured output validation, and explicit accept/reject. ChatGPT sign-in avoids a separate Platform API key but consumes the user's Codex/ChatGPT plan allowance. Other users must install Codex and sign in with ChatGPT, or deliberately choose API-key billing.

Sources: [Codex authentication](https://learn.chatgpt.com/docs/auth), [Codex SDK](https://learn.chatgpt.com/docs/codex-sdk), [non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode), [app-server](https://learn.chatgpt.com/docs/app-server).

## User onboarding

1. Open the Setup page and confirm all **Core** checks are green.
2. Choose a dossier and review its file inventory and immutable source anchors.
3. Run the deterministic audit pass.
4. Inspect held leads before enabling optional specialists.
5. Configure Cognee, Tavily, or the Codex sidecar only if the engagement permits them.
6. Re-run Setup checks; a credential present and an adapter reachable are separate checks.
7. Review every proposed claim and open its exact sources.
8. Accept, edit, or reject the wording in the PlateJS report.
9. Export the report together with its evidence and run trace.

Never place challenge ground truth, API keys, Codex tokens, or raw vendor responses in browser storage.
