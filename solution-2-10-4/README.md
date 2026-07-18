# Trace — Claim Compiler

An editable PlateJS audit report with evidence proofs instead of opaque findings.

## Demo

- Switch among four reportable claims and one dossier-grounded rejected hypothesis.
- Replay five typed gates: facts, joins, exclusions, provenance, certificate.
- Inspect proof atoms and open their exact source windows.
- Keep Cognee, Tavily, and Codex behind explicit specialist gates.
- Add a manual case by linking dossier passages; it stays a draft until compiled.
- Edit the final report, click 14 inline citations, and review the Sources page.

The Setup tab separates working local features from optional integrations. It runs real checks, validates JSON health contracts, and never requests API keys in the browser.

## Run

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 43204
```

Open [http://127.0.0.1:43204/](http://127.0.0.1:43204/).

## Verify

```bash
npm run lint
npm run build
```

See [CLAIM-COMPILER.md](./CLAIM-COMPILER.md) for proof semantics, integration contracts, and deployment boundaries.
