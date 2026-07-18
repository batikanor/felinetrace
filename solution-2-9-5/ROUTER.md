# Adaptive routing blueprint

## Runtime sequence

| Stage | Trigger | Output | Citation status |
| --- | --- | --- | --- |
| Ledger tests | Always | Deterministic candidates and reconciliations | Exact row IDs |
| Peer baseline | Always | Median/MAD, timing and grouping outliers | Exact row IDs |
| Evidence memory | Multi-document candidate | Entity paths, aliases and missing edges | Resolve graph IDs back to document rows |
| Public checks | Named entity with permission | Registry, VAT, sanctions and filing corroboration | External URL, authority and retrieval time |
| Local reviewer | Contradiction or material ambiguity | Structured challenge and proposed wording | Never a citation by itself |

## Stop rules

- **Report:** at least two independent internal signals, an exact dossier source for every claim, and no unresolved material contradiction.
- **Hold:** one weak signal, unmatched external result, or a model-only inference.
- **Escalate:** amount disagreement, possible offset, entity alias collision, or missing source anchor.

## Benchmark discipline

- Keep ground truth outside the runtime environment.
- Freeze test configuration before evaluating a held-out dossier.
- Record scheme recall, finding precision, amount accuracy, citation validity, decoy false positives, latency and external calls.
- Cache public responses with query, URL, authority tier, result hash and retrieval timestamp.
- Replay external and model calls during regression tests.

## Security

- Process dossier files locally unless the auditor explicitly enables a connector.
- Keep Tavily and model credentials server-side.
- Scope Cognee memory to one dossier dataset and resolve every retrieved chunk back to its document node.
- Run Codex locally, read-only and ephemeral; inspect structured output before changing the report.
