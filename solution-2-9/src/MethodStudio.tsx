import { useState } from 'react'
import {
  Activity,
  Check,
  ChevronRight,
  Database,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Globe2,
  Link2,
  ListChecks,
  Plus,
  Route,
  Scale,
  X,
} from 'lucide-react'
import { findings } from './caseData'
import type { Source } from './caseData'

export type ManualCase = {
  id: number
  title: string
  category: string
  amount: string
  notes: string
  sourceIds: string[]
}

type CaseDraft = Omit<ManualCase, 'id'>

type MethodStudioProps = {
  sources: Source[]
  cases: ManualCase[]
  onAdd: (draft: CaseDraft) => void
  onSource: (source: Source) => void
}

type Profile = 'precision' | 'balanced' | 'recall'

const lanes = [
  { id: 'rules', label: 'Ledger tests', detail: 'joins · totals · controls', icon: ListChecks, gate: 'always' },
  { id: 'stats', label: 'Peer baseline', detail: 'MAD · timing · groups', icon: Activity, gate: 'always' },
  { id: 'memory', label: 'Evidence memory', detail: 'aliases · paths · gaps', icon: Database, gate: 'linked' },
  { id: 'web', label: 'Public checks', detail: 'official sources first', icon: Globe2, gate: 'entity' },
  { id: 'skeptic', label: 'Local reviewer', detail: 'challenge ambiguity', icon: Scale, gate: 'gated' },
] as const

const routedFindings: Record<string, { lanes: string[], decision: 'Report' | 'Hold', note: string }> = {
  'F-01': {
    lanes: ['rules', 'stats', 'memory', 'web', 'skeptic'],
    decision: 'Report',
    note: 'Control path + payment sequence. Public lookup can corroborate the vendor, never prove the payment claim.',
  },
  'F-02': {
    lanes: ['rules', 'stats', 'memory', 'skeptic'],
    decision: 'Report',
    note: 'Description-to-account mismatch survives the fixed-asset and financial-statement cross-check.',
  },
  'F-03': {
    lanes: ['rules', 'stats', 'memory', 'skeptic'],
    decision: 'Report',
    note: 'Receipt and invoice chain resolves to €192,000. The unrelated accrual cannot offset it.',
  },
  'F-04': {
    lanes: ['rules', 'stats', 'memory'],
    decision: 'Report',
    note: 'Same-day grouping crosses the approval threshold; no web or model call is needed.',
  },
}

const profiles: Record<Profile, { label: string, stop: string }> = {
  precision: { label: 'Precision', stop: '2 internal signals' },
  balanced: { label: 'Balanced', stop: 'route ambiguity' },
  recall: { label: 'Recall', stop: 'challenge every lead' },
}

const categories = ['Fraud risk', 'Classification', 'Cut-off', 'Control', 'Other']

function shortName(name: string) {
  return name.replace(/\.(csv|txt|xlsx|pdf|docx)$/i, '')
}

export function MethodStudio({ sources, cases, onAdd, onSource }: MethodStudioProps) {
  const [profile, setProfile] = useState<Profile>('balanced')
  const [selectedFinding, setSelectedFinding] = useState('F-01')
  const [runNumber, setRunNumber] = useState(1)
  const [composerOpen, setComposerOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([])

  const selectedRoute = routedFindings[selectedFinding]
  const selectedCase = findings.find((finding) => finding.id === selectedFinding) ?? findings[0]

  const toggleSource = (sourceId: string) => {
    setSelectedSourceIds((selected) => selected.includes(sourceId)
      ? selected.filter((id) => id !== sourceId)
      : [...selected, sourceId])
  }

  const resetComposer = () => {
    setTitle('')
    setCategory(categories[0])
    setAmount('')
    setNotes('')
    setSelectedSourceIds([])
    setComposerOpen(false)
  }

  const saveCase = () => {
    if (!title.trim() || selectedSourceIds.length === 0) return
    onAdd({
      title: title.trim(),
      category,
      amount: amount.trim(),
      notes: notes.trim(),
      sourceIds: selectedSourceIds,
    })
    resetComposer()
  }

  return (
    <section className="method-studio router-studio" aria-label="Adaptive audit router">
      <div className="method-studio-heading router-heading">
        <div>
          <span><Route size={10} /> Adaptive router</span>
          <strong>Cheap tests first. Escalate ambiguity.</strong>
        </div>
        <div className="benchmark-strip router-guardrails" aria-label="Routing guardrails">
          <span><b>Blind</b> no labels</span>
          <span><b>Exact</b> sources</span>
          <span><b>Gated</b> external</span>
        </div>
        <button type="button" className="add-case-button" onClick={() => setComposerOpen(true)}>
          <Plus size={14} /> Add case
        </button>
      </div>

      <div className="router-controls">
        <div className="profile-switch" aria-label="Routing profile">
          {(Object.keys(profiles) as Profile[]).map((key) => (
            <button type="button" className={profile === key ? 'active' : ''} key={key} onClick={() => setProfile(key)}>
              {profiles[key].label}
            </button>
          ))}
        </div>
        <span>Stop: <strong>{profiles[profile].stop}</strong></span>
        <button type="button" className="replay-route" onClick={() => setRunNumber((value) => value + 1)}>
          <GitBranch size={12} /> Replay · {runNumber.toString().padStart(2, '0')}
        </button>
      </div>

      <div className="router-lanes">
        {lanes.map((lane, index) => {
          const Icon = lane.icon
          return (
            <article key={lane.id} className={selectedRoute.lanes.includes(lane.id) ? 'used' : ''}>
              <div className="lane-index">{index + 1}</div>
              <span><Icon size={14} /></span>
              <div><strong>{lane.label}</strong><small>{lane.detail}</small></div>
              <em>{lane.gate}</em>
            </article>
          )
        })}
      </div>

      <div className="routing-board">
        <div className="routing-list" aria-label="Finding routes">
          {findings.map((finding) => {
            const route = routedFindings[finding.id]
            return (
              <button type="button" className={selectedFinding === finding.id ? 'active' : ''} key={finding.id} onClick={() => setSelectedFinding(finding.id)}>
                <span><small>{finding.id}</small><strong>{finding.title}</strong></span>
                <span className="route-dots">
                  {lanes.map((lane) => <i className={route.lanes.includes(lane.id) ? 'hit' : ''} key={lane.id} />)}
                </span>
                <b>{route.decision}</b>
              </button>
            )
          })}
          <div className="held-lead">
            <span><small>D-05</small><strong>Freight variance</strong></span>
            <span className="route-dots">{lanes.map((lane) => <i className={lane.id === 'stats' ? 'hit' : ''} key={lane.id} />)}</span>
            <b>Hold</b>
          </div>
        </div>

        <article className="route-trace">
          <div><small>{selectedCase.id} · ROUTE</small><strong>{selectedCase.title}</strong></div>
          <p>{selectedRoute.note}</p>
          <div className="trace-steps">
            {selectedRoute.lanes.map((laneId, index) => {
              const lane = lanes.find((item) => item.id === laneId)
              return lane ? <span key={lane.id}>{lane.label}{index < selectedRoute.lanes.length - 1 && <ChevronRight size={10} />}</span> : null
            })}
          </div>
          <footer><Check size={11} /> {selectedCase.sources.length} dossier passages resolved</footer>
        </article>
      </div>

      {cases.length > 0 && (
        <div className="manual-case-list">
          <div className="manual-case-label">Manual cases</div>
          {cases.map((manualCase) => (
            <article key={manualCase.id}>
              <span className="manual-case-index">M{manualCase.id.toString().slice(-2)}</span>
              <div className="manual-case-copy">
                <small>{manualCase.category}</small>
                <strong>{manualCase.title}</strong>
                {manualCase.notes && <p>{manualCase.notes}</p>}
                <div>
                  {manualCase.sourceIds.map((sourceId) => {
                    const source = sources.find((item) => item.id === sourceId)
                    if (!source) return null
                    return <button type="button" key={sourceId} onClick={() => onSource(source)}><Link2 size={10} /> {shortName(source.name)}</button>
                  })}
                </div>
              </div>
              {manualCase.amount && <b>{manualCase.amount}</b>}
            </article>
          ))}
        </div>
      )}

      {composerOpen && (
        <div className="case-composer" role="dialog" aria-modal="true" aria-labelledby="case-composer-title">
          <div className="case-composer-heading">
            <div><small>Manual review</small><strong id="case-composer-title">Add a case</strong></div>
            <button type="button" onClick={resetComposer} aria-label="Close case composer"><X size={16} /></button>
          </div>
          <div className="case-fields">
            <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What looks wrong?" autoFocus /></label>
            <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Amount<input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="€0" /></label>
            <label className="case-notes">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Why should this be reviewed?" /></label>
          </div>
          <fieldset className="source-picker">
            <legend>Link evidence <span>{selectedSourceIds.length} selected</span></legend>
            <div>
              {sources.map((source, index) => {
                const selected = selectedSourceIds.includes(source.id)
                return (
                  <button type="button" className={selected ? 'selected' : ''} key={source.id} onClick={() => toggleSource(source.id)}>
                    <span>{source.type === 'pdf' ? <FileText size={13} /> : <FileSpreadsheet size={13} />}</span>
                    <span><strong>[{index + 1}] {shortName(source.name)}</strong><small>{source.location}</small></span>
                    {selected && <Check size={13} />}
                  </button>
                )
              })}
            </div>
          </fieldset>
          <div className="case-composer-actions">
            <button type="button" onClick={resetComposer}>Cancel</button>
            <button type="button" disabled={!title.trim() || selectedSourceIds.length === 0} onClick={saveCase}>Add linked case</button>
          </div>
        </div>
      )}
    </section>
  )
}
