# Local Codex reviewer

The sidecar reuses the Codex CLI's saved ChatGPT sign-in. It binds only to `127.0.0.1`, exposes no credentials, and runs reviews with `codex exec --ephemeral --sandbox read-only` plus a fixed JSON schema.

- Health: `http://127.0.0.1:4010/health`
- Review: `POST http://127.0.0.1:4010/review`
- Workspace writes: disabled
- Browser origins: loopback only
- Concurrent reviews: one

## Start

```bash
cd /Users/batikanor2/Documents/development/personal-git/2026-july-almedia/services/codex-reviewer
./start.sh
```

The request body is `{ "text": "...", "focus": "..." }`. The report text is treated as untrusted content and output is validated against `review-schema.json`.

References: [Codex authentication](https://learn.chatgpt.com/docs/auth), [non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode), and [sandboxing](https://learn.chatgpt.com/docs/sandboxing).
