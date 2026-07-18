import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Globe2,
  Link2,
  LoaderCircle,
  Play,
  Plus,
  Search,
  ShieldCheck,
  TerminalSquare,
  X,
} from 'lucide-react'
import type { Finding, ProofGate, Source, SpecialistResult } from './analysis'
import './compiler.css'
import './compilerVariants.css'

type ManualClaim = {
  id: string
  title: string
  category: Finding['category']
  amount: string
  notes: string
  sourceIds: string[]
}

type ManualClaimDraft = Omit<ManualClaim, 'id'>

const gateMeta: Record<ProofGate['id'], { step: string; label: string }> = {
  facts: { step: '01', label: 'Facts' },
  joins: { step: '02', label: 'Join' },
  counter: { step: '03', label: 'Exclude' },
  resolver: { step: '04', label: 'Resolve' },
  certificate: { step: '05', label: 'Certificate' },
}

const methodMeta = {
  deterministic: { label: 'Tests', icon: Activity },
  join: { label: 'Joins', icon: ShieldCheck },
  memory: { label: 'Cognee', icon: BrainCircuit },
  public: { label: 'Tavily', icon: Globe2 },
  review: { label: 'Codex', icon: TerminalSquare },
}

type ClaimCompilerProps = {
  findings: Finding[]
  holds: Finding[]
  sources: Source[]
  specialists: Record<'cognee' | 'tavily' | 'codex', SpecialistResult>
  busy: boolean
  onSource: (source: Source) => void
  onRerun: () => Promise<void>
  onNotify?: (message: string) => void
}

export function ClaimCompiler({ findings, holds, sources, specialists, busy, onSource, onRerun, onNotify }: ClaimCompilerProps) {
  const claims = useMemo(() => [...findings, ...holds], [findings, holds])
  const sourceById = useMemo(() => new Map(sources.map((source) => [source.id, source])), [sources])
  const citationNumberById = useMemo(() => Object.fromEntries(sources.map((source, index) => [source.id, index + 1])) as Record<string, number>, [sources])
  const [selectedClaimId, setSelectedClaimId] = useState(claims[0]?.id ?? '')
  const [activeGateId, setActiveGateId] = useState<ProofGate['id']>('facts')
  const [manualClaims, setManualClaims] = useState<ManualClaim[]>([])
  const [composerOpen, setComposerOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(true)

  useEffect(() => {
    if (!claims.some((claim) => claim.id === selectedClaimId)) setSelectedClaimId(claims[0]?.id ?? '')
  }, [claims, selectedClaimId])

  const selectedClaim = claims.find((claim) => claim.id === selectedClaimId) ?? claims[0]
  const activeGate = selectedClaim?.gates.find((gate) => gate.id === activeGateId) ?? selectedClaim?.gates[0]

  if (!selectedClaim || !activeGate) {
    return <section className="claim-compiler compiler-empty"><CircleAlert size={18} /><strong>No reportable claims</strong><span>The uploaded files parsed successfully, but no current rule produced a claim.</span></section>
  }

  const selectClaim = (claim: Finding) => {
    setSelectedClaimId(claim.id)
    setActiveGateId(claim.decision === 'HOLD' ? 'joins' : 'facts')
  }

  const addManualClaim = (draft: ManualClaimDraft) => {
    const id = `M-${String(manualClaims.length + 1).padStart(2, '0')}`
    setManualClaims((items) => [...items, { ...draft, id }])
    setComposerOpen(false)
    onNotify?.(`${id} linked as draft`)
  }

  return (
    <section className="claim-compiler compiler-layout-wizard" aria-label="Claim compiler">
      <header className="compiler-header">
        <strong>Claims</strong>
        <div className="compiler-header-actions">
          <button type="button" className="compiler-toggle" onClick={() => setDetailsOpen((value) => !value)}>
            {detailsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />} {detailsOpen ? 'Hide details' : 'Show details'}
          </button>
          <button type="button" className="compiler-add" onClick={() => setComposerOpen(true)}><Plus size={14} /> Add case</button>
        </div>
      </header>

      <div className="claim-switcher" role="tablist" aria-label="Compiled claims">
        {claims.map((claim) => (
          <button type="button" role="tab" aria-selected={selectedClaim.id === claim.id} className={`${selectedClaim.id === claim.id ? 'active' : ''} ${claim.decision === 'HOLD' ? 'held' : ''}`} key={claim.id} onClick={() => selectClaim(claim)}>
            <span><small>{claim.category}</small><strong>{claim.id}</strong></span>
            <b>{claim.amount}</b>
            <i>{claim.decision === 'REPORT' ? <Check size={10} /> : <CircleAlert size={10} />}{claim.decision}</i>
          </button>
        ))}
      </div>

      <div className="compiler-toolbar">
        <div><strong>{selectedClaim.title}</strong></div>
        <span className={`compile-state ${busy ? 'running' : 'compiled'}`}>
          {busy ? <LoaderCircle size={12} className="compiler-spin" /> : <Check size={12} />}
          {busy ? 'Analyzing' : 'Computed'}
        </span>
        <button type="button" onClick={() => void onRerun()} disabled={busy}>
          {busy ? <LoaderCircle size={13} className="compiler-spin" /> : <Play size={13} />}
          {busy ? 'Analyzing' : 'Rerun'}
        </button>
      </div>

      <div className="method-strip" aria-label="Methods used">
        <small>METHODS USED</small>
        {Object.entries(methodMeta).map(([method, copy]) => {
          const Icon = copy.icon
          const specialist = method === 'memory' ? specialists.cognee : method === 'public' ? specialists.tavily : method === 'review' ? specialists.codex : undefined
          const phase = specialist?.phase ?? (selectedClaim.methods.includes(method) ? 'pass' : 'idle')
          return <span className={phase} key={method} title={specialist?.detail}><Icon size={11} />{copy.label}{phase === 'pass' ? ' ✓' : phase === 'fail' ? ' ×' : phase === 'running' ? ' …' : ''}</span>
        })}
      </div>

      {Object.values(specialists).some((status) => status.phase !== 'idle') && <details className="specialist-output">
        <summary>Specialist results</summary>
        <div>
          {(['cognee', 'tavily', 'codex'] as const).map((service) => {
            const result = specialists[service]
            return <article className={result.phase} key={service}><strong>{service === 'cognee' ? 'Cognee' : service === 'tavily' ? 'Tavily' : 'Codex'}</strong><span>{result.detail || result.phase}</span>{service === 'tavily' && result.results?.slice(0, 3).map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer">{item.title}</a>)}</article>
          })}
        </div>
      </details>}

      {detailsOpen && <>
        <div className="gate-pipeline" aria-label="Typed proof gates">
          {selectedClaim.gates.map((gate, index) => (
            <div className="gate-wrap" key={gate.id}>
              <button type="button" className={`proof-gate ${activeGate.id === gate.id ? 'active' : ''} ${gate.status}`} aria-pressed={activeGate.id === gate.id} onClick={() => setActiveGateId(gate.id)}>
                <span><small>{gateMeta[gate.id].step} · {gateMeta[gate.id].label}</small><strong>{gate.label}</strong></span>
                <i>{gate.status === 'pass' ? <Check size={11} /> : <CircleAlert size={11} />}{gate.status === 'pass' ? 'PASS' : 'HOLD'}</i>
              </button>
              {index < selectedClaim.gates.length - 1 && <ArrowRight size={13} className="gate-arrow" />}
            </div>
          ))}
        </div>

        <div className="compiler-inspector">
          <div className="atom-panel">
            <div className="inspector-heading"><span><FileSearch size={13} /><strong>{activeGate.label} atoms</strong></span><small>{activeGate.summary}</small></div>
            <div className="proof-atoms">
              {activeGate.atoms.map((atom, index) => {
                const source = atom.sourceId ? sourceById.get(atom.sourceId) : undefined
                const citationNumber = atom.sourceId ? citationNumberById[atom.sourceId] : undefined
                return (
                  <button type="button" className={`proof-atom ${atom.status}`} key={`${atom.type}-${atom.label}-${index}`} disabled={!source} onClick={() => source && onSource(source)}>
                    <span className="atom-status">{atom.status === 'proved' ? <Check size={11} /> : atom.status === 'excluded' ? <X size={11} /> : <CircleAlert size={11} />}</span>
                    <span><small>{atom.type}</small><strong>{atom.label}</strong><em>{atom.value}</em></span>
                    {source && <b>{citationNumber ? `[${citationNumber}]` : 'anchor'}<Link2 size={10} /></b>}
                  </button>
                )
              })}
            </div>
          </div>

          <aside className={`proof-certificate ${selectedClaim.decision === 'HOLD' ? 'held' : ''}`} aria-label={`${selectedClaim.decision} proof certificate`}>
            <div className="certificate-seal">{selectedClaim.decision === 'REPORT' ? <BadgeCheck size={20} /> : <CircleAlert size={20} />}</div>
            <div className="certificate-copy"><small>{selectedClaim.decision} CERTIFICATE</small><strong>{selectedClaim.decision === 'REPORT' ? 'Proof compiled' : 'Hypothesis held'}</strong><p>{selectedClaim.certificate}</p></div>
            <div className="certificate-metrics"><span><small>GATES</small><b>{selectedClaim.gates.filter((gate) => gate.status === 'pass').length}/5 pass</b></span><span><small>ANCHORS</small><b>{selectedClaim.sourceIds.length} resolved</b></span></div>
          </aside>
        </div>
      </>}

      {manualClaims.length > 0 && <section className="manual-claims" aria-label="Manual claim drafts">
        <header><span>MANUAL DRAFTS</span><small>Linked sources are not a certificate.</small></header>
        {manualClaims.map((claim) => <article key={claim.id}>
          <span className="manual-claim-id">{claim.id}</span>
          <div><small>{claim.category} · DRAFT</small><strong>{claim.title}</strong>{claim.notes && <p>{claim.notes}</p>}</div>
          <div className="manual-source-links">{claim.sourceIds.map((sourceId) => { const source = sourceById.get(sourceId); return source ? <button type="button" key={sourceId} onClick={() => onSource(source)}><Link2 size={10} />{source.name}<small>{source.location}</small></button> : null })}</div>
          {claim.amount && <b>{claim.amount}</b>}
        </article>)}
      </section>}

      {composerOpen && <ManualClaimDialog sources={sources} citationNumberById={citationNumberById} onClose={() => setComposerOpen(false)} onSave={addManualClaim} />}
    </section>
  )
}

function ManualClaimDialog({ sources, citationNumberById, onClose, onSave }: { sources: Source[]; citationNumberById: Record<string, number>; onClose: () => void; onSave: (draft: ManualClaimDraft) => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Finding['category']>('FRAUD RISK')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const normalizedSearch = search.trim().toLowerCase()
  const visibleSources = sources.filter((source) => !normalizedSearch || `${source.name} ${source.location} ${source.passage}`.toLowerCase().includes(normalizedSearch))
  const toggleSource = (sourceId: string) => setSelectedSourceIds((items) => items.includes(sourceId) ? items.filter((id) => id !== sourceId) : [...items, sourceId])
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim() || selectedSourceIds.length === 0) { setError(!title.trim() ? 'Add a claim title.' : 'Link at least one source.'); return }
    onSave({ title: title.trim(), category, amount: amount.trim(), notes: notes.trim(), sourceIds: selectedSourceIds })
  }
  return <div className="claim-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="claim-dialog" role="dialog" aria-modal="true" aria-labelledby="manual-claim-title">
      <header><div><span><Plus size={12} /> MANUAL CASE</span><h2 id="manual-claim-title">Link a draft claim</h2></div><button type="button" onClick={onClose} aria-label="Close add case"><X size={17} /></button></header>
      <form onSubmit={submit}>
        <div className="claim-fields">
          <label><span>Claim</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs review?" autoFocus /></label>
          <label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value as Finding['category'])}><option>FRAUD RISK</option><option>CUT-OFF</option><option>CLASSIFICATION</option><option>CONTROL</option></select></label>
          <label><span>Amount <em>optional</em></span><input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="€0" /></label>
          <label className="claim-notes-field"><span>Notes <em>optional</em></span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        </div>
        <fieldset className="claim-source-picker"><legend>Source anchors <span>{selectedSourceIds.length} selected</span></legend>
          <div className="claim-source-search"><Search size={13} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search uploaded sources" /></div>
          <div className="claim-source-options">{visibleSources.map((source) => { const selected = selectedSourceIds.includes(source.id); return <button type="button" className={selected ? 'selected' : ''} key={source.id} onClick={() => toggleSource(source.id)} aria-pressed={selected}><span className="claim-source-icon">{source.type === 'pdf' ? <FileText size={13} /> : <FileSpreadsheet size={13} />}</span><span><strong>[{citationNumberById[source.id]}] {source.name}</strong><small>{source.location}</small><em>{source.passage}</em></span><span className="claim-source-check"><Check size={11} /></span></button> })}</div>
        </fieldset>
        {error && <div className="claim-error"><CircleAlert size={12} />{error}</div>}
        <footer><button type="button" onClick={onClose}>Cancel</button><button type="submit"><Plus size={13} /> Add draft</button></footer>
      </form>
    </section>
  </div>
}
