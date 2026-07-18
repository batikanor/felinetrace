import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRight,
  Banknote,
  BookOpenCheck,
  Box,
  BrainCircuit,
  Check,
  CircleAlert,
  Database,
  FileSearch,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Network,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  Unlink2,
  UserRound,
  X,
} from 'lucide-react'
import { findings, sources } from './caseData'
import type { Finding, Source } from './caseData'
import './memory.css'

type NodeKind = 'Vendor' | 'User' | 'Document' | 'Invoice' | 'Receipt' | 'Payment' | 'Account' | 'Control' | 'Claim'

type MemoryNode = {
  kind: NodeKind
  label: string
  detail: string
  sourceId?: string
  missing?: boolean
}

type MemoryCase = {
  id: string
  category: Finding['category']
  title: string
  amount: string
  notes: string
  sources: Source[]
  nodes: MemoryNode[]
  query: string
  recall: string
  chunkId: string
  alias: string
  gap: string
  added?: boolean
}

type CaseDraft = {
  title: string
  category: Finding['category']
  amount: string
  notes: string
  sourceIds: string[]
}

type Feedback = 'helpful' | 'review' | null
type RecallState = 'ready' | 'running' | 'done'
type ImproveState = 'idle' | 'staged'

const sourceById = new Map(Object.values(sources).map((source) => [source.id, source]))
const sourceOptions = Array.from(sourceById.values())
  .sort((a, b) => `${a.name}${a.location}`.localeCompare(`${b.name}${b.location}`))

const citationSources = Array.from(
  new Map(findings.flatMap((finding) => finding.sources).map((source) => [source.id, source])).values(),
)
const citationNumberById = Object.fromEntries(citationSources.map((source, index) => [source.id, index + 1])) as Record<string, number>

const baseCases: MemoryCase[] = [
  {
    id: 'F-01',
    category: 'FRAUD RISK',
    title: findings[0].title,
    amount: findings[0].amount,
    notes: findings[0].explanation,
    sources: findings[0].sources,
    query: 'Which payments lack expected service evidence?',
    recall: 'MV-U05 created and approved vendor 209101, posted five invoices and paid €295,120. No receipt or service record joins to that vendor.',
    chunkId: 'chunk:we-209101-null',
    alias: 'Ratio Consulting GmbH ⇄ creditor 209101',
    gap: 'Vendor → Receipt edge missing',
    nodes: [
      { kind: 'User', label: 'MV-U05', detail: '3 conflicting rights', sourceId: 'permissions-u05' },
      { kind: 'Vendor', label: 'Ratio Consulting', detail: 'creditor 209101', sourceId: 'master-data' },
      { kind: 'Invoice', label: 'ER901416–420', detail: '€248,000 + VAT', sourceId: 'ratio-ledger' },
      { kind: 'Payment', label: '€295,120', detail: 'paid in 2 days', sourceId: 'ratio-ledger' },
      { kind: 'Receipt', label: 'No linked receipt', detail: '0 matches', sourceId: 'ratio-receipt-search', missing: true },
      { kind: 'Claim', label: 'Payment chain', detail: 'F-01' },
    ],
  },
  {
    id: 'F-02',
    category: 'CLASSIFICATION',
    title: findings[1].title,
    amount: findings[1].amount,
    notes: findings[1].explanation,
    sources: findings[1].sources,
    query: 'Which asset additions carry repair wording?',
    recall: 'Six repair, overhaul or replacement descriptions join to acquisition postings totaling €150,800 and flow into fixed assets.',
    chunkId: 'chunk:anlagen-191-196',
    alias: 'Asset labels ⇄ ER901421–ER901426',
    gap: 'Repair description contradicts acquisition class',
    nodes: [
      { kind: 'Document', label: 'Asset register', detail: 'rows 191–196', sourceId: 'asset-register' },
      { kind: 'Invoice', label: '6 repair items', detail: '€150,800', sourceId: 'asset-bookings' },
      { kind: 'Account', label: 'Fixed assets', detail: '€19.73M draft', sourceId: 'annual-statement' },
      { kind: 'Control', label: 'Recognition test', detail: 'support needed', missing: true },
      { kind: 'Claim', label: 'Classification', detail: 'F-02' },
    ],
  },
  {
    id: 'F-03',
    category: 'CUT-OFF',
    title: findings[2].title,
    amount: findings[2].amount,
    notes: findings[2].explanation,
    sources: findings[2].sources,
    query: 'Which December receipts have no 2025 ledger posting?',
    recall: 'Eight December receipts match eight January invoices by vendor, service date and amount. Their invoice references do not occur in the 2025 ledger.',
    chunkId: 'chunk:we400840-400847',
    alias: 'WE400840–847 ⇄ ER901427–434',
    gap: 'Invoice → 2025 Account edge missing',
    nodes: [
      { kind: 'Receipt', label: '8 Dec receipts', detail: '€192,000', sourceId: 'open-receipts' },
      { kind: 'Invoice', label: '8 Jan invoices', detail: 'exact joins', sourceId: 'january-invoices' },
      { kind: 'Account', label: '2025 ledger', detail: '0 matching refs', sourceId: 'cutoff-ledger-search', missing: true },
      { kind: 'Document', label: 'Separate accrual', detail: '€86,500', sourceId: 'december-accrual' },
      { kind: 'Claim', label: 'Cut-off gap', detail: 'F-03' },
    ],
  },
  {
    id: 'F-04',
    category: 'CONTROL',
    title: findings[3].title,
    amount: findings[3].amount,
    notes: findings[3].explanation,
    sources: findings[3].sources,
    query: 'Which payment groups bypass the second-approval rule?',
    recall: 'Four same-day Castor Papier payments share SAMMEL-200007. Each is below €10,000; together they total €39,040.',
    chunkId: 'chunk:gl-20207-20214',
    alias: 'SAMMEL-200007 ⇄ four payment documents',
    gap: 'Payment group → second approver edge missing',
    nodes: [
      { kind: 'User', label: 'MV-U11', detail: 'book + payment', sourceId: 'permissions-u11' },
      { kind: 'Vendor', label: 'Castor Papier', detail: 'creditor 200007', sourceId: 'split-payments' },
      { kind: 'Payment', label: '4 payments', detail: '€39,040', sourceId: 'split-payments' },
      { kind: 'Control', label: '€10K approval', detail: 'second approver', sourceId: 'audit-plan' },
      { kind: 'Control', label: 'Grouped approval', detail: 'not present', missing: true },
      { kind: 'Claim', label: 'Threshold split', detail: 'F-04' },
    ],
  },
]

const nodeKinds: NodeKind[] = ['Vendor', 'User', 'Document', 'Invoice', 'Receipt', 'Payment', 'Account', 'Control', 'Claim']

const pipelineStages = [
  { id: 'dataset', step: '01', title: 'Dossier dataset', detail: 'audit-muster-2025', icon: Database },
  { id: 'rows', step: '02', title: 'Deterministic rows', detail: 'dlt · schema → graph', icon: FileSpreadsheet },
  { id: 'memory', step: '03', title: 'Cognee memory', detail: 'graph + vectors', icon: BrainCircuit },
  { id: 'recall', step: '04', title: 'Recall', detail: 'dataset-scoped', icon: Search },
  { id: 'resolver', step: '05', title: 'Provenance resolver', detail: 'chunk → doc → row', icon: FileSearch },
  { id: 'report', step: '06', title: 'Cited report', detail: 'reviewed evidence', icon: BookOpenCheck },
]

const stageDetails: Record<string, string> = {
  dataset: 'One Cognee dataset per audit dossier. Reads and writes stay inside audit-muster-2025.',
  rows: 'CSV and database rows enter through dlt; keys and relationships are built from schema, not extracted by a model.',
  memory: 'Custom DataPoints keep audit entities and edges explicit while graph and vector stores support retrieval.',
  recall: 'Recall is scoped to this dossier and returns memory context plus a retrieval trace.',
  resolver: 'A chunk ID is resolved through its Document node to the stored filename and exact row, cell, section or page.',
  report: 'Only the resolved source anchor can become a report citation. Memory output alone cannot.',
}

type EvidenceMemoryProps = {
  onOpenSource: (source: Source) => void
}

export function EvidenceMemory({ onOpenSource }: EvidenceMemoryProps) {
  const [customCases, setCustomCases] = useState<MemoryCase[]>([])
  const [activeCaseId, setActiveCaseId] = useState('F-01')
  const [activeStage, setActiveStage] = useState('resolver')
  const [query, setQuery] = useState(baseCases[0].query)
  const [recallState, setRecallState] = useState<RecallState>('done')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [improveState, setImproveState] = useState<ImproveState>('idle')
  const [addCaseOpen, setAddCaseOpen] = useState(false)

  const cases = [...baseCases, ...customCases]
  const activeCase = cases.find((item) => item.id === activeCaseId) ?? baseCases[0]
  const resolvedSource = activeCase.sources[0]
  const citationNumber = resolvedSource ? citationNumberById[resolvedSource.id] : undefined

  const selectCase = (nextCase: MemoryCase) => {
    setActiveCaseId(nextCase.id)
    setQuery(nextCase.query)
    setRecallState('done')
    setFeedback(null)
    setImproveState('idle')
  }

  const runRecall = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!query.trim()) return
    setRecallState('running')
    setFeedback(null)
    setImproveState('idle')
    window.setTimeout(() => setRecallState('done'), 520)
  }

  const captureFeedback = (value: Exclude<Feedback, null>) => {
    setFeedback(value)
    setImproveState('idle')
  }

  const saveCase = (draft: CaseDraft) => {
    const selectedSources = draft.sourceIds
      .map((sourceId) => sourceById.get(sourceId))
      .filter((source): source is Source => Boolean(source))
    const id = `C-${String(customCases.length + 1).padStart(2, '0')}`
    const amount = /^[€$£]/.test(draft.amount.trim()) ? draft.amount.trim() : `€${draft.amount.trim()}`
    const addedCase: MemoryCase = {
      id,
      category: draft.category,
      title: draft.title.trim(),
      amount,
      notes: draft.notes.trim(),
      sources: selectedSources,
      query: `What connects the evidence for ${draft.title.trim()}?`,
      recall: `${draft.title.trim()} links ${selectedSources.length} dossier passage${selectedSources.length === 1 ? '' : 's'}. Resolve each recalled chunk before citing it.`,
      chunkId: `chunk:review-${id.toLowerCase()}`,
      alias: `${selectedSources.length} selected passages ⇄ ${id}`,
      gap: 'Reviewer-defined connection',
      nodes: [
        ...selectedSources.slice(0, 4).map((source): MemoryNode => ({
          kind: 'Document',
          label: source.name,
          detail: source.location,
          sourceId: source.id,
        })),
        { kind: 'Claim', label: draft.title.trim(), detail: id },
      ],
      added: true,
    }

    setCustomCases((items) => [...items, addedCase])
    setAddCaseOpen(false)
    selectCase(addedCase)
  }

  return (
    <section className="memory-widget" aria-label="Cognee evidence memory">
      <header className="memory-header">
        <div>
          <span className="memory-kicker"><BrainCircuit size={13} /> COGNEE · EVIDENCE MEMORY</span>
          <h2>Recall connections. Resolve provenance.</h2>
          <p>Memory finds the path; the resolver earns the citation.</p>
        </div>
        <div className="memory-header-actions">
          <span className="dataset-badge"><Database size={13} /><b>audit-muster-2025</b><small>isolated dataset</small></span>
          <button type="button" onClick={() => activeCase.sources.forEach(onOpenSource)}><Box size={14} /> Open linked</button>
          <button type="button" className="memory-add-case" onClick={() => setAddCaseOpen(true)}><Plus size={14} /> Add case</button>
        </div>
      </header>

      <div className="operation-strip">
        <span>v1.0</span><b>remember</b><i /><b>recall</b><i /><b>improve</b><i /><b>forget</b>
        <em>1 dossier = 1 dataset</em>
      </div>

      <div className="memory-pipeline" aria-label="Evidence memory pipeline">
        {pipelineStages.map((stage, index) => {
          const Icon = stage.icon
          return (
            <div className="pipeline-stage-wrap" key={stage.id}>
              <button type="button" className={`pipeline-stage ${activeStage === stage.id ? 'active' : ''}`} onClick={() => setActiveStage(stage.id)}>
                <span><Icon size={15} /></span>
                <span><small>{stage.step}</small><strong>{stage.title}</strong><em>{stage.detail}</em></span>
              </button>
              {index < pipelineStages.length - 1 && <ArrowRight size={14} className="pipeline-arrow" />}
            </div>
          )
        })}
      </div>
      <div className="stage-detail"><ShieldCheck size={13} /><strong>{pipelineStages.find((stage) => stage.id === activeStage)?.title}</strong><span>{stageDetails[activeStage]}</span></div>

      <div className="memory-schema">
        <span>DataPoint schema</span>
        {nodeKinds.map((kind) => <i className={`schema-${kind.toLowerCase()}`} key={kind}>{kind}</i>)}
      </div>

      <div className="memory-case-tabs" role="tablist" aria-label="Evidence memory cases">
        {cases.map((memoryCase) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeCase.id === memoryCase.id}
            className={activeCase.id === memoryCase.id ? 'active' : ''}
            key={memoryCase.id}
            onClick={() => selectCase(memoryCase)}
          >
            <span><small>{memoryCase.added ? 'ADDED' : memoryCase.category}</small><strong>{memoryCase.id}</strong></span>
            <b>{memoryCase.amount}</b>
          </button>
        ))}
      </div>

      <div className="memory-body">
        <div className="memory-graph-panel">
          <div className="memory-section-title">
            <span><Network size={14} /><strong>Graph path</strong></span>
            <small>{activeCase.sources.length} linked passages</small>
          </div>
          <div className="memory-node-path">
            {activeCase.nodes.map((node, index) => {
              const source = node.sourceId ? sourceById.get(node.sourceId) : undefined
              return (
                <div className="memory-node-wrap" key={`${node.kind}-${node.label}-${index}`}>
                  <button
                    type="button"
                    className={`memory-node memory-${node.kind.toLowerCase()} ${node.missing ? 'missing' : ''}`}
                    onClick={() => source && onOpenSource(source)}
                    aria-label={source ? `${node.kind} ${node.label}: open ${source.name}` : `${node.kind} ${node.label}`}
                  >
                    <NodeIcon kind={node.kind} />
                    <span><small>{node.kind}</small><strong>{node.label}</strong><em>{node.detail}</em></span>
                  </button>
                  {index < activeCase.nodes.length - 1 && <span className={`memory-edge ${activeCase.nodes[index + 1].missing ? 'missing' : ''}`}><ArrowRight size={13} /></span>}
                </div>
              )
            })}
          </div>
          <div className="resolution-signals">
            <span><RefreshCw size={13} /><small>ALIAS RESOLUTION</small><strong>{activeCase.alias}</strong></span>
            <span className="gap-signal"><Unlink2 size={13} /><small>CONTRADICTION / MISSING EDGE</small><strong>{activeCase.gap}</strong></span>
          </div>
          <div className="memory-notes"><strong>{activeCase.title}</strong><span>{activeCase.notes}</span></div>
        </div>

        <div className="recall-panel">
          <div className="memory-section-title">
            <span><Search size={14} /><strong>Recall trace</strong></span>
            <small>dataset scoped</small>
          </div>
          <form className="recall-form" onSubmit={runRecall}>
            <Search size={14} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Recall query" />
            <button type="submit" disabled={recallState === 'running'}>{recallState === 'running' ? <RefreshCw size={14} className="spin" /> : <Search size={14} />}{recallState === 'running' ? 'Recalling' : 'Recall'}</button>
          </form>

          <div className={`recall-result ${recallState === 'running' ? 'loading' : ''}`}>
            <div className="memory-result-label"><span>MEMORY RESULT</span><em>source: graph</em></div>
            {recallState === 'running' ? (
              <div className="recall-skeleton"><i /><i /><i /></div>
            ) : (
              <p>{activeCase.recall}</p>
            )}
            <div className="memory-not-citation"><CircleAlert size={13} /><strong>Memory hit ≠ citation</strong><span>Resolve the provenance chain first.</span></div>
          </div>

          <div className="resolver-chain" aria-label="Provenance resolution chain">
            <div><small>RECALL HIT</small><strong>{activeCase.chunkId}</strong></div>
            <ArrowRight size={13} />
            <div><small>DOCUMENT NODE</small><strong>{resolvedSource ? `doc:${resolvedSource.id}` : 'document pending'}</strong></div>
            <ArrowRight size={13} />
            <button type="button" onClick={() => resolvedSource && onOpenSource(resolvedSource)}>
              <small>EXACT SOURCE</small><strong>{resolvedSource?.name ?? 'Select a source'}</strong><em>{resolvedSource?.location ?? ''}</em>
            </button>
            <ArrowRight size={13} />
            <div className="citation-output"><small>REPORT</small><strong>{citationNumber ? `[${citationNumber}]` : 'linked source'}</strong></div>
          </div>

          <div className="feedback-cycle">
            <div>
              <small>REVIEWER FEEDBACK</small>
              <button type="button" className={feedback === 'helpful' ? 'active' : ''} onClick={() => captureFeedback('helpful')}><ThumbsUp size={13} /> Helpful</button>
              <button type="button" className={feedback === 'review' ? 'active' : ''} onClick={() => captureFeedback('review')}><ThumbsDown size={13} /> Needs review</button>
            </div>
            <ArrowRight size={13} />
            <button type="button" className={`improve-button ${improveState === 'staged' ? 'staged' : ''}`} disabled={!feedback} onClick={() => setImproveState('staged')}>
              <BrainCircuit size={14} />
              <span><small>IMPROVE</small><strong>{improveState === 'staged' ? 'Feedback staged' : 'Stage feedback'}</strong></span>
            </button>
          </div>
        </div>
      </div>

      {addCaseOpen && <MemoryCaseDialog onClose={() => setAddCaseOpen(false)} onSave={saveCase} />}
    </section>
  )
}

function NodeIcon({ kind }: { kind: NodeKind }) {
  if (kind === 'User') return <UserRound size={15} />
  if (kind === 'Vendor') return <Box size={15} />
  if (kind === 'Payment') return <Banknote size={15} />
  if (kind === 'Control') return <ShieldCheck size={15} />
  if (kind === 'Claim') return <GitBranch size={15} />
  if (kind === 'Account') return <Database size={15} />
  return <FileText size={15} />
}

type MemoryCaseDialogProps = {
  onClose: () => void
  onSave: (draft: CaseDraft) => void
}

function MemoryCaseDialog({ onClose, onSave }: MemoryCaseDialogProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Finding['category']>('FRAUD RISK')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const normalizedSearch = search.trim().toLowerCase()
  const filteredSources = sourceOptions.filter((source) => (
    !normalizedSearch || `${source.name} ${source.location} ${source.passage}`.toLowerCase().includes(normalizedSearch)
  ))

  const toggleSource = (sourceId: string) => {
    setSelectedSourceIds((items) => items.includes(sourceId) ? items.filter((id) => id !== sourceId) : [...items, sourceId])
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim() || !amount.trim() || !notes.trim()) {
      setError('Complete the title, amount and notes.')
      return
    }
    if (selectedSourceIds.length === 0) {
      setError('Select at least one dossier passage.')
      return
    }
    onSave({ title, category, amount, notes, sourceIds: selectedSourceIds })
  }

  return (
    <div className="memory-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="memory-dialog" role="dialog" aria-modal="true" aria-labelledby="memory-case-title">
        <header>
          <div><span><BrainCircuit size={14} /> DOSSIER MEMORY</span><h2 id="memory-case-title">Add case</h2><p>Link the claim to source passages now; recall can never create the citation later.</p></div>
          <button type="button" onClick={onClose} aria-label="Close add case"><X size={18} /></button>
        </header>
        <form onSubmit={submit}>
          <div className="memory-case-fields">
            <label><span>Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs review?" autoFocus /></label>
            <label>
              <span>Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value as Finding['category'])}>
                <option value="FRAUD RISK">Fraud risk</option>
                <option value="CUT-OFF">Cut-off</option>
                <option value="CLASSIFICATION">Classification</option>
                <option value="CONTROL">Control</option>
              </select>
            </label>
            <label><span>Amount</span><input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="125,000" inputMode="decimal" /></label>
            <label className="memory-notes-field"><span>Notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="State the connection, contradiction or missing edge." /></label>
          </div>

          <fieldset className="memory-passage-picker">
            <legend>Dossier passages <span>{selectedSourceIds.length} selected</span></legend>
            <div className="memory-source-search"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search exact files, rows or passages" /></div>
            <div className="memory-passage-options">
              {filteredSources.map((source) => (
                <label className={selectedSourceIds.includes(source.id) ? 'selected' : ''} key={source.id}>
                  <input type="checkbox" checked={selectedSourceIds.includes(source.id)} onChange={() => toggleSource(source.id)} />
                  <span className="memory-passage-check"><Check size={12} /></span>
                  <span><strong>{source.name}</strong><small>{source.location}</small><em>{source.passage}</em></span>
                </label>
              ))}
              {filteredSources.length === 0 && <div className="memory-no-results">No matching passage.</div>}
            </div>
          </fieldset>

          {error && <div className="memory-case-error"><CircleAlert size={13} /> {error}</div>}
          <footer>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit"><Plus size={14} /> Add to memory</button>
          </footer>
        </form>
      </section>
    </div>
  )
}
