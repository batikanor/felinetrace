# FelineTrace — final prototype

Solution 2-10-5 is the data-driven final prototype. Its PlateJS report, findings, proof gates, citations, source previews, totals, and literature page are built from the active dossier.

## Workflow

- Switch between **First dataset**, **Final dataset**, and **Custom** above the report.
- Selecting **Custom** opens the folder/file upload.
- Analyze CSV, TXT/GDPdU, XLSX, DOCX, PDF, XML, DTD, JSON, or Markdown.
- Inspect deterministic findings, proof gates, source rows/passages, and held hypotheses.
- Optionally run local Cognee, Tavily, and Codex specialists.
- Edit the generated report in PlateJS or add a source-linked manual case.
- Use **Rerun analysis** after replacing or changing the dossier.

The final dossier currently reconciles to three reportable issues and one cleared false-positive candidate: a 10-line completeness discrepancy, self-approved related-party-clearing journals, an unapproved €3 million year-end loan journal, and a supported bill-and-hold sale that remains held rather than reported.

The Setup tab automatically checks the audit engine and all three local integration endpoints. Keys remain server-side.

## Run

```bash
cd services/audit-engine && ./start.sh
# In another terminal:
cd solution-2-10-5 && npm install && npm run dev -- --host 127.0.0.1 --port 43205
```

Open [http://127.0.0.1:43205/](http://127.0.0.1:43205/).

## Verify

```bash
cd services/audit-engine && ./test.sh
cd ../../solution-2-10-5 && npm run lint -- --quiet && npm run build
```

See [CLAIM-COMPILER.md](./CLAIM-COMPILER.md) for proof semantics, integration contracts, and deployment boundaries.
