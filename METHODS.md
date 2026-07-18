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

## Benchmark dimensions

- Scheme-level recall
- Finding precision
- Amount accuracy
- Citation validity
- Decoy false-positive rate
- Evidence completeness
- Performance on unseen dossier structures

Ground truth must remain evaluation-only. It should never be available to the detection pipeline during a benchmark run.
