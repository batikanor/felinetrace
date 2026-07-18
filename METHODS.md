# Detection experiments

All current variants share the same cited-report foundation. The `solution-2-x` folders test different ways to generate and challenge findings before they enter that report.

## Baseline: reconciliation-first audit tests

1. Parse structured exports and companion documents.
2. Reconcile hashes, ledgers, subledgers, invoices, deliveries, and subsequent cash.
3. Run anomaly tests across documents.
4. Search for counterevidence and clean comparators.
5. Require exact sources for every number and claim.
6. Draft the editable report.

## Solution 2-2: deterministic test library

Configurable tests implement vendor-chain, capitalization, cut-off, and threshold-splitting checks. This approach is explainable, repeatable, and straightforward to benchmark.

## Solution 2-3: evidence graph

Users, vendors, permissions, invoices, receipts, payments, and accounts become graph nodes. Suspicious connected paths and missing expected edges produce candidate cases.

## Solution 2-4: detector + skeptic

The detector proposes a sourced claim. A skeptic searches for contradictory documents and requires direct record-level links before allowing offsets or explanations to reduce the finding.

## Solution 2-5: ensemble

Rules, graph analysis, sequence tests, and a skeptic run in parallel. The interface exposes their agreement instead of hiding the method behind a single score.

## Solution 2-6: public corroboration

Internal candidates trigger focused checks against official registries, VAT and sanctions data, filings, and optionally Tavily-discovered web pages. External results can corroborate an entity but cannot prove a dossier claim.

## Solution 2-7: evidence memory

Cognee-style graph and vector memory connects aliases, documents, users, vendors, transactions, controls, and claims. Every recall result must resolve through its graph ID to an exact document passage before it can enter the report.

## Solution 2-8: local reviewer

A locally authenticated Codex sidecar challenges amounts, searches for counterevidence, and proposes sourced report edits. Runs are read-only and structured; users inspect and accept or reject every result.

## Solution 2-9: adaptive router

Deterministic tests and robust peer baselines run first. Memory, public checks, and a local reviewer are invoked only when a candidate needs them. Single-signal anomalies are held rather than reported.

## Benchmark dimensions

- Scheme-level recall
- Finding precision
- Amount accuracy
- Citation validity
- Decoy false-positive rate
- Evidence completeness
- Performance on unseen dossier structures

Ground truth must remain evaluation-only. It should never be available to the detection pipeline during a benchmark run.
