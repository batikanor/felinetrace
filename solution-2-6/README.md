# Trace — Public checks replay

Editable PlateJS audit memo with dossier citations and a public-corroboration layer.

The public results in this demo are labeled replay fixtures. They are not live checks and never replace dossier evidence.

## Demo

- Four corrected dossier findings and three cleared checks
- Fourteen inline citations, Sources page, and draggable evidence windows
- Company register, VIES, EU sanctions, official filing, and open-web routing
- Entity, status, authority-tier, and router filters
- Replay control and external-source provenance drawer
- Add cases with multiple dossier passages

## Run

```bash
cd /Users/batikanor2/Documents/development/personal-git/2026-july-almedia/solution-2-6
npm install
npm run dev -- --host 127.0.0.1 --port 42966
```

## Server-side Tavily adapter

1. Put `TAVILY_API_KEY` on the server only. The browser calls an internal `/api/public-checks` route; it never receives the key.
2. Route one focused subquery per check. Use short `include_domains` lists for registers, VIES, sanctions, filings, and verified company domains.
3. Default to `search_depth: "basic"`. Escalate selected low-recall checks to `advanced` only when the extra latency and cost are justified.
4. Keep results only above a configured score threshold (for example `0.72`). Record rejected-result counts without promoting their claims.
5. Store the query, authority tier, score, canonical URL, and `retrievedAt` timestamp with every retained passage.
6. Cache by normalized entity, query, domain list, and depth. Use a short TTL for status checks and a longer TTL for historical filings.
7. Disable external calls during ground-truth benchmark scoring unless the benchmark rules explicitly allow them.

## Verify

```bash
npm run lint
npm run build
```
