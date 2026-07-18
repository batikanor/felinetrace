# Trace — Cognee evidence memory

An editable PlateJS audit memo backed by an explorable evidence-memory prototype.

## Demo flow

1. Switch among four dossier-grounded cases.
2. Follow entity links, aliases, contradictions, and missing edges.
3. Run a dossier-scoped recall query.
4. Resolve `chunk → Document → exact source → [n]` before citing.
5. Give reviewer feedback and stage an improve cycle.
6. Add a case by linking exact dossier passages.
7. Open and drag source windows; edit the final memo in place.

The report retains 14 inline citations and a compact Sources page. The memory result is context, never citation evidence by itself.

## Run

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 42977
```

## Verify

```bash
npm run lint
npm run build
```

Backend integration details are in [COGNEE.md](./COGNEE.md).

Cognee runs locally through `../services/cognee-local`; Cognee Cloud is not supported.
