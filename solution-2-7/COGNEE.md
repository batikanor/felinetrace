# Cognee evidence-memory plan

The current build is an interactive front-end prototype. This plan maps it to Cognee v1.0 without weakening the audit trail.

## 1. Dossier boundary

Use one dataset for each immutable dossier version:

```text
dataset_name = audit:{engagement_id}:{dossier_hash}
```

All `remember`, `recall`, `improve`, and `forget` calls carry that dataset. Enforce access with Cognee dataset permissions and supported dataset handlers; a naming convention alone is not tenant isolation. Never recall across dossier datasets in a review session.

## 2. Ingestion

Two paths meet in the same dataset:

- **Structured exports:** load GDPdU CSV/TXT and database tables through [Cognee's dlt integration](https://docs.cognee.ai/integrations/dlt-integration). Primary keys, foreign keys, column types, and write disposition define repeatable row identities. Structured rows bypass LLM extraction.
- **Documents:** send PDF/DOCX material through [`remember`](https://docs.cognee.ai/core-concepts/main-operations/remember), retaining the original bytes, content hash, filename, and page/section map in an immutable source registry.

Run structured loads before document enrichment so known IDs can anchor mentions found in narrative files.

## 3. Audit graph

Define [custom `DataPoint` models](https://docs.cognee.ai/guides/custom-data-models) for:

```text
Vendor · User · Document · Invoice · Receipt
Payment · Account · Control · Claim
```

Each evidence-bearing node includes:

```text
external_id
source_document_id
source_row | source_cell | source_page | source_section
source_hash
```

Relationships include `CREATED_BY`, `APPROVED_BY`, `POSTED_TO`, `PAID_BY`, `RECEIVED_AS`, `GOVERNED_BY`, `SUPPORTS`, `CONTRADICTS`, and `CITED_BY`. Missing expected relationships are review signals, not synthetic facts.

Pass a `PipelineContext(user, dataset, data_item)` when adding standalone DataPoints, or add them inside a custom pipeline. Otherwise they are global and dataset deletion will not remove them. Apply a small ontology to constrain node/edge names and keep aliases such as `Ratio Consulting GmbH ⇄ creditor 209101` explicit.

## 4. Recall and provenance

Scope [`recall`](https://docs.cognee.ai/core-concepts/main-operations/recall) to exactly one dataset. Request context and retrieval detail for the reviewer UI:

```python
result = await cognee.recall(
    query_text=query,
    datasets=[dataset_name],
    only_context=True,
    verbose=True,
)
```

Recall output is not evidence. A source tag such as `graph`, a generated answer, or a nearby filename cannot become a citation.

The citation gate accepts a retrieved `chunk_id` and performs this server-side resolution:

```text
chunk_id
  → dataset-scoped Chunk/Document relationship
  → Document.source_document_id
  → source registry
  → {file, location, passage, hash}
  → report citation
```

Reject the citation when the chunk is absent, belongs to another dataset, resolves to multiple documents, lacks an exact location, or fails its content hash. The UI may show memory context before resolution, but the report editor only receives the resolver payload.

## 5. Feedback cycle

Store reviewer feedback separately from immutable source anchors. Attach `helpful`, `needs_review`, and corrected entity/edge suggestions to the recall session and retrieval trace. Then run [`improve`](https://docs.cognee.ai/core-concepts/main-operations/improve) only for the same dataset and reviewed sessions:

```python
await cognee.improve(dataset=dataset_name, session_ids=reviewed_session_ids)
```

Reviewer corrections can adjust retrieval and propose graph changes; they cannot rewrite source passages or their hashes.

## 6. Lifecycle sketch

```python
import cognee
import dlt

dataset_name = f"audit:{engagement_id}:{dossier_hash}"

# Deterministic tables/rows, then narrative documents.
await cognee.remember(dlt_resource, dataset_name=dataset_name)
await cognee.remember(document_paths, dataset_name=dataset_name)

# Custom DataPoints are added with PipelineContext bound to dataset_name.
await add_audit_points(points, dataset=dataset_name, ontology=audit_ontology)

hits = await cognee.recall(
    query_text=query,
    datasets=[dataset_name],
    only_context=True,
    verbose=True,
)
citations = [provenance_resolver(hit, dataset_name) for hit in hits]

await cognee.improve(dataset=dataset_name, session_ids=reviewed_session_ids)

# Engagement retention workflow.
await cognee.forget(dataset=dataset_name)
```

The production adapter should be pinned to a tested Cognee v1.0 release and covered by migration tests.

## 7. Acceptance checks

- A dossier cannot recall, resolve, improve, or delete another dossier's data.
- Every citation round-trips from report `[n]` to file, location, passage, and matching hash.
- Missing or ambiguous chunk-to-document resolution is denied.
- Structured row identity remains stable across repeat loads.
- Feedback retains its session and retrieval trace.
- `forget(dataset=...)` removes that dataset from relational, graph, and vector stores.

References: [`remember`](https://docs.cognee.ai/core-concepts/main-operations/remember), [`recall`](https://docs.cognee.ai/core-concepts/main-operations/recall), [`improve`](https://docs.cognee.ai/core-concepts/main-operations/improve), [`forget`](https://docs.cognee.ai/core-concepts/main-operations/forget), [dataset permissions](https://docs.cognee.ai/core-concepts/multi-user-mode/permissions-system/datasets), and [multi-user mode](https://docs.cognee.ai/core-concepts/multi-user-mode/multi-user-mode-overview).
