# Local Codex boundary

```text
Browser UI → 127.0.0.1 sidecar → Codex SDK / app-server / codex exec
```

Keep Codex server-side. The browser receives sanitized events and schema-valid results; it never receives login state, tokens, or API keys.

## Run contract

1. Validate origin, session, CSRF token, task, and source IDs.
2. Resolve source IDs against a server-owned workspace allowlist.
3. Copy only those files into a fresh evidence packet.
4. Run read-only and ephemeral by default.
5. Stream sanitized JSONL; validate the final result with [`review-result.schema.json`](./review-result.schema.json).
6. Stage the patch. Write to the report only after an explicit accept action.

```bash
APP_ROOT="$(pwd)"
PACKET_DIR="/absolute/path/to/allowlisted/packet"
printf '%s\n' 'Review manifest.json. Cite source_ids. Return only the requested schema.' \
  | codex exec \
      -C "$PACKET_DIR" \
      --sandbox read-only \
      --ephemeral \
      --output-schema "$APP_ROOT/review-result.schema.json" \
      --json \
      -
```

Spawn the process with an argument array, not a shell-built string. For deeper streamed threads and approvals, use the server-side Codex SDK. `codex app-server` also exposes streamed events and approvals, but remains an experimental interface.

## Auth and deployment

`codex exec` reuses saved CLI authentication by default. With a ChatGPT-managed login, usage follows that account's Codex plan/credits rather than OpenAI Platform API billing, and consumes its Codex/ChatGPT allowance. API-key authentication uses API billing.

Bind the sidecar to loopback, require a workspace allowlist, and keep it single-user. Do not expose Codex execution to public or untrusted users. Use isolated runners and separate credentials for any trusted automation beyond the local machine.
