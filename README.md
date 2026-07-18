# FelineTrace

Evidence-first audit prototypes for the Cortea challenge. Every reported claim links to a specific file and row, cell, section, or page, while the final audit memo remains editable in PlateJS.

## Current prototypes

| Folder | Method | Interface | Port |
| --- | --- | --- | --- |
| `solution-2` | Cited baseline | Inline citations and Sources page | `42832` |
| `solution-2-2` | Deterministic test library | Audit Test Lab and coverage matrix | `42922` |
| `solution-2-3` | Evidence graph | Entity and transaction paths | `42933` |
| `solution-2-4` | Detector + skeptic | Evidence-for / counterevidence review | `42944` |
| `solution-2-5` | Four-method ensemble | Consensus and benchmark studio | `42955` |
| `solution-2-6` | Public corroboration | Tavily-ready official-source checks | `42966` |
| `solution-2-7` | Evidence memory | Cognee graph/vector recall with provenance repair | `42977` |
| `solution-2-8` | Local reviewer | Human-gated Codex sidecar | `42988` |
| `solution-2-9` | Adaptive router | Cost-aware staged escalation | `42999` |
| `solution-2-9-2` | Adaptive router | Finding drawer | `43192` |
| `solution-2-9-3` | Adaptive router | Route form | `43193` |
| `solution-2-9-4` | Adaptive router | Stage accordion | `43194` |
| `solution-2-9-5` | Adaptive router | Focus navigator | `43195` |
| `solution-2-10` | Claim Compiler | Executable evidence proofs | `43010` |
| `solution-2-10-2` | Claim Compiler | Claim form | `43202` |
| `solution-2-10-3` | Claim Compiler | Claim accordion | `43203` |
| `solution-2-10-4` | Claim Compiler | Proof checklist | `43204` |
| `solution-2-10-5` | Claim Compiler | Review wizard | `43205` |
| `solution-2-11` | Investigation Planner | Next-best-test orchestration | `43021` |

Earlier explorations remain available in `solution-1 (deprecated)`,
`solution-3 (deprecated)`, and `solution-4 (deprecated)`.

## Shared product foundation

- Editable PlateJS report
- Atomic `[1] [2]` source citations
- Compact Sources page
- Exact source windows for CSV, TXT, XLSX, DOCX, and PDF evidence
- Draggable evidence comparison
- Comments and formatting controls
- Manual case creation with document linking in the `2-x` experiments

## Local data

Challenge data and ground truth are intentionally excluded from Git. Place local files under:

- `source-docs/data/`
- `source-docs/data-ground-truth/`

The current prototypes embed the sample findings and evidence metadata in `src/caseData.ts`. Dynamic ingestion and execution against a new dossier are the next implementation layer.

See [UX-VARIANTS.md](./UX-VARIANTS.md) for this interface comparison, [METHODS.md](./METHODS.md) for the detection approaches, [RANKING.md](./RANKING.md) for the winning-chance assessment, [SETUP.md](./SETUP.md) for onboarding, and [RESEARCH.md](./RESEARCH.md) for the Cognee, Tavily, public-source, and Codex guidance.
