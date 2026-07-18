# Local Cognee

FelineTrace runs Cognee on this machine. It does not connect to Cognee Cloud and does not require a Cognee account or Cognee API key.

## Runtime

- Cognee API: `http://127.0.0.1:8000`
- Cognee OpenAPI: `http://127.0.0.1:8000/docs`
- FelineTrace health adapter: `http://127.0.0.1:43110/health`
- LLM: Ollama `llama3.1:8b`
- Embeddings: Ollama `nomic-embed-text:latest`
- Stores: SQLite, LanceDB, Kuzu
- API lifecycle: `remember`, `recall`, `improve`, `forget`

The Cognee image is pinned to the current official ARM64 `main` image digest. That is the prebuilt-image flow documented by Cognee; the API contract follows Cognee 1.4 and uses `/api/v1`.

## Start

```bash
cd /Users/batikanor2/Documents/development/personal-git/2026-july-almedia/services/cognee-local
./start.sh
```

## Optional direct ingestion

The audit engine normally sends a compact resolved evidence set from the active first, final, or custom dossier. To ingest the first dossier directly for adapter development:

```bash
cd /Users/batikanor2/Documents/development/personal-git/2026-july-almedia/services/cognee-local
./ingest-dossier.sh
```

Every FelineTrace run uses a dossier-scoped dataset and calls Cognee's local `/api/v1/remember` and `/api/v1/recall` endpoints. Ground truth is never ingested.
