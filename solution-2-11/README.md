# Trace — Active Investigation Planner

A cited PlateJS audit memo with one extra question: **what should the reviewer test next?**

## Two-minute demo

1. Select F-01–F-04 to see claim-level coverage and exact source traces.
2. Run the recommended dossier test; the demo heuristic moves from **TEST** to **REPORT**.
3. Open X-05 to show the €86.5K accrual decoy rejected by references [10–11].
4. Click any citation to open a draggable source window, then edit or comment in the report.
5. Open **Setup** to show zero-config readiness and optional, server-gated specialist routes.

The report retains four corrected sample findings, 14 stable citations, a compact Sources page, and manual **Add case**.

## Run

Working directory: `/Users/batikanor2/Documents/development/personal-git/2026-july-almedia/solution-2-11`

```bash
cd /Users/batikanor2/Documents/development/personal-git/2026-july-almedia/solution-2-11 && npm run dev -- --host 127.0.0.1 --port 43021
```

Open [http://127.0.0.1:43021/](http://127.0.0.1:43021/).

## Verify

```bash
cd /Users/batikanor2/Documents/development/personal-git/2026-july-almedia/solution-2-11 && npm run lint && npm run build
```

## Design boundaries

- Dossier checks are deterministic and citation-bearing.
- Percentages and the 85/15 threshold are configurable demo heuristics, not evaluation truth, probability, or model confidence.
- Cognee, Tavily, and Codex routes add non-citing corroboration/review context only.
- Browser storage contains health endpoint URLs only; API keys remain server-side.
- The development status route checks `codex --version` and `codex login status`, never `codex exec`.

See [INVESTIGATION-PLANNER.md](./INVESTIGATION-PLANNER.md) for architecture and adapter contracts.
