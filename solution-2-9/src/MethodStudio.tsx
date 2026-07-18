import { useState } from 'react'
import {
  Activity,
  Check,
  ChevronRight,
  Database,
  FileSpreadsheet,
  FileText,
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

const lanes = [
  { id: 'rules', label: 'Tests', icon: ListChecks },
  { id: 'stats', label: 'Baseline', icon: Activity },
  { id: 'memory', label: 'Memory', icon: Database },
  { id: 'web', label: 'Public', icon: Globe2 },
  { id: 'skeptic', label: 'Review', icon: Scale },
] as const

const routedFindings: Record<string, { lanes: string[], decision: 'Report' | 'Hold' }> = {
  'F-01': {
    lanes: ['rules', 'stats', 'memory', 'web', 'skeptic'],
    decision: 'Report',
  },
  'F-02': {
    lanes: ['rules', 'stats', 'memory', 'skeptic'],
    decision: 'Report',
  },
  'F-03': {
    lanes: ['rules', 'stats', 'memory', 'skeptic'],
    decision: 'Report',
  },
  'F-04': {
    lanes: ['rules', 'stats', 'memory'],
    decision: 'Report',
  },
}

const categories = ['Fraud risk', 'Classification', 'Cut-off', 'Control', 'Other']

function shortName(name: string) {
  return name.replace(/\.(csv|txt|xlsx|pdf|docx)$/i, '')
}

export function MethodStudio({ sources, cases, onAdd, onSource }: MethodStudioProps) {
  const [selectedFinding, setSelectedFinding] = useState('F-01')
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
          <span><Route size={10} /> Routes</span>
        </div>
        <button type="button" className="add-case-button" onClick={() => setComposerOpen(true)}>
          <Plus size={14} /> Add case
        </button>
      </div>

      <div className="router-lanes">
        {lanes.map((lane, index) => {
          const Icon = lane.icon
          return (
            <article key={lane.id} className={selectedRoute.lanes.includes(lane.id) ? 'used' : ''}>
              <div className="lane-index">{index + 1}</div>
              <span><Icon size={14} /></span>
              <div><strong>{lane.label}</strong></div>
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
        </div>

        <article className="route-trace">
          <div><small>{selectedCase.id} · ROUTE</small><strong>{selectedCase.title}</strong></div>
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
