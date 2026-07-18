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

See [METHODS.md](./METHODS.md) for the detection approaches and evaluation strategy.
