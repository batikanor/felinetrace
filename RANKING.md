# Hackathon ranking

This is a directional winning-chance score, not a measured probability. The held-out dossier remains the real test.

## Rubric

| Dimension | Weight |
| --- | ---: |
| Held-out accuracy and generalization | 30 |
| False-positive control | 20 |
| Exact evidence and auditor trust | 20 |
| Two-minute demo clarity | 15 |
| Differentiation and sponsor relevance | 10 |
| Setup and operational realism | 5 |

Sponsor integrations help only when they strengthen the audit method. They do not compensate for an unsupported finding or a missed scheme.

## Ranking

| Rank | Variant | Score | Why it can win | Main risk |
| ---: | --- | ---: | --- | --- |
| 1 | `solution-2-10` · Claim Compiler | **93** | Turns every report claim into a small, inspectable proof with exact sources, calculations, exclusions, and a report/hold gate. Cognee, Tavily, and Codex are useful specialists without becoming evidence. | The compiler must be backed by real parsers and tests for the held-out dossier. |
| 2 | `solution-2-11` · Active Investigation Planner | **91** | Chooses the next best test by expected information value, so the method is both clever and visibly cost-aware. Optional sponsor tools have clear jobs. | More concepts to explain in a two-minute pitch. |
| 3 | `solution-2-9` · Adaptive Router | **87** | Strong staged architecture: cheap deterministic tests first, specialists only for ambiguity, and single-signal decoys held. | Routing is shown more strongly than the underlying detectors are executed. |
| 4 | `solution-2-7` · Cognee Evidence Memory | **83** | Excellent cross-document relationship discovery and strong Cognee relevance, with an explicit provenance repair step. | Retrieval quality and graph extraction can vary; memory output cannot be trusted as a citation. |
| 5 | `solution-2-4` · Detector + Skeptic | **82** | Directly targets the challenge's false-positive penalty and makes counterevidence visible. | Less sponsor differentiation and narrower discovery story. |
| 6 | `solution-2-2` · Audit Test Lab | **80** | Deterministic, explainable, repeatable, and likely to score well on known audit patterns. | A fixed test library may miss a novel hidden scheme. |
| 7 | `solution-2-5` · Benchmark Ensemble | **77** | Combines complementary detectors and exposes agreement. | Parallel signals can look busy and can amplify false positives without a strong stop rule. |
| 8 | `solution-2-6` · Public Checks | **75** | Strong Tavily and official-source story with clear provenance and authority tiers. | Public data can only corroborate fictional dossier entities; it rarely proves the internal accounting claim. |
| 9 | `solution-2-3` · Evidence Graph | **71** | Intuitive relationship paths and missing-edge discovery. | Static graph presentation is weaker than an executed, benchmarkable pipeline. |
| 10 | `solution-2-8` · Local Codex Reviewer | **69** | Strong human approval, structured output, and local-account story. | A reviewer is support, not the core fraud detector; live runs consume user allowance. |
| 11 | `solution-2` · Cited Report | **60** | Clearest evidence UX and a strong common foundation. | It demonstrates the output better than the detection method. |

## Recommended competition build

Lead with `solution-2-10`. Borrow the next-best-test panel from `solution-2-11` only if it remains explainable in one sentence.

The production pipeline should combine:

1. deterministic reconciliation and joins;
2. evidence-graph paths and missing-edge tests;
3. explicit counterevidence search;
4. Cognee for dossier-scoped relationship recall;
5. Tavily and official sources for entity corroboration only;
6. Codex as a read-only skeptic and report-diff proposer;
7. an exact-source gate before anything reaches the editable PlateJS report.
