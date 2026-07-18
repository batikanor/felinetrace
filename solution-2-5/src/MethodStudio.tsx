import { useState } from 'react'
import {
  Check,
  ChevronRight,
  Clock3,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Link2,
  ListChecks,
  Plus,
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

const detectors = [
  { id: 'rules', label: 'Rules', detail: 'Joins, policies, thresholds', icon: ListChecks },
  { id: 'graph', label: 'Graph', detail: 'Control paths, missing edges', icon: GitBranch },
  { id: 'sequence', label: 'Sequence', detail: 'Timing, grouping, cut-off', icon: Clock3 },
  { id: 'skeptic', label: 'Skeptic', detail: 'Counterevidence and matches', icon: Scale },
] as const

const detectorHits: Record<string, string[]> = {
  'F-01': ['rules', 'graph', 'sequence', 'skeptic'],
  'F-02': ['rules', 'graph', 'skeptic'],
  'F-03': ['rules', 'sequence', 'skeptic'],
  'F-04': ['rules', 'graph', 'sequence'],
}

const categories = ['Fraud risk', 'Classification', 'Cut-off', 'Control', 'Other']

function shortName(name: string) {
  return name.replace(/\.(csv|txt|xlsx|pdf|docx)$/i, '')
}

export function MethodStudio({ sources, cases, onAdd, onSource }: MethodStudioProps) {
  const [composerOpen, setComposerOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([])

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
    <section className="method-studio">
      <div className="method-studio-heading">
        <div>
          <span>Method studio</span>
          <strong>Four detectors, one sourced verdict</strong>
        </div>
        <div className="benchmark-strip" aria-label="Sample benchmark">
          <span><b>4 / 4</b> schemes</span>
          <span><b>0 / 7</b> decoys flagged</span>
          <span><b>4 / 4</b> amounts</span>
        </div>
        <button type="button" className="add-case-button" onClick={() => setComposerOpen(true)}>
          <Plus size={14} /> Add case
        </button>
      </div>

      <div className="method-pipeline" aria-label="Analysis pipeline">
        <span>Parse once</span><ChevronRight size={13} />
        <span>Run in parallel</span><ChevronRight size={13} />
        <span>Require sources</span><ChevronRight size={13} />
        <strong>Write report</strong>
      </div>

      <div className="detector-grid">
        {detectors.map((detector) => {
          const Icon = detector.icon
          return (
            <article key={detector.id}>
              <span><Icon size={14} /></span>
              <div><strong>{detector.label}</strong><small>{detector.detail}</small></div>
              <b>{findings.filter((finding) => detectorHits[finding.id]?.includes(detector.id)).length}</b>
            </article>
          )
        })}
      </div>

      <div className="consensus-matrix">
        <div className="matrix-header"><span>Consensus</span>{detectors.map((detector) => <b key={detector.id}>{detector.label}</b>)}</div>
        {findings.map((finding) => (
          <div className="matrix-row" key={finding.id}>
            <span><small>{finding.id}</small><strong>{finding.title}</strong></span>
            {detectors.map((detector) => (
              <i className={detectorHits[finding.id]?.includes(detector.id) ? 'hit' : ''} key={detector.id}>
                {detectorHits[finding.id]?.includes(detector.id) ? <Check size={11} /> : '—'}
              </i>
            ))}
          </div>
        ))}
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
