# Trace — Local Codex reviewer

Editable PlateJS working paper with 14 evidence citations, draggable source windows, and an approval-first local review queue.

## Demo

- Four dossier-grounded review tasks
- Run/replay, trace inspection, and accept/reject controls
- Schema-valid result preview and audit log
- Least-privilege toggle
- New cases linked to dossier sources
- Editable report plus compact Sources page

The browser demo replays saved structured results. A production run uses a server-side loopback sidecar; see [`CODEX.md`](./CODEX.md).

## Run

```bash
cd /Users/batikanor2/Documents/development/personal-git/2026-july-almedia/solution-2-8
npm install
npm run dev -- --host 127.0.0.1 --port 42988
```

## Verify

```bash
cd /Users/batikanor2/Documents/development/personal-git/2026-july-almedia/solution-2-8
npm run lint
npm run build
```
