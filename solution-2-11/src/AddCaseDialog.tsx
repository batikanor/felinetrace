import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { FileSpreadsheet, FileText, Link2, X } from 'lucide-react'
import type { Source } from './caseData'

export type ManualCaseInput = {
  title: string
  category: string
  amount: string
  notes: string
  sourceIds: string[]
}

type AddCaseDialogProps = {
  sources: Source[]
  citationNumberById: Record<string, number>
  onClose: () => void
  onSave: (input: ManualCaseInput) => void
}

const categories = ['FRAUD RISK', 'CLASSIFICATION', 'CUT-OFF', 'CONTROL', 'OTHER']

export function AddCaseDialog({ sources, citationNumberById, onClose, onSave }: AddCaseDialogProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const toggleSource = (sourceId: string) => {
    setSelectedSourceIds((current) => current.includes(sourceId)
      ? current.filter((id) => id !== sourceId)
      : [...current, sourceId])
    setError('')
  }

  const submitCase = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim() || selectedSourceIds.length === 0) {
      setError('Add a title and at least one source.')
      return
    }
    onSave({
      title: title.trim(),
      category,
      amount: amount.trim() || '—',
      notes: notes.trim(),
      sourceIds: selectedSourceIds,
    })
  }

  return (
    <div className="case-dialog-backdrop">
      <section className="case-dialog" role="dialog" aria-modal="true" aria-labelledby="case-dialog-title">
        <header>
          <div><small>REVIEW QUEUE</small><h2 id="case-dialog-title">Add case</h2></div>
          <button type="button" onClick={onClose} aria-label="Close add case"><X size={17} /></button>
        </header>

        <form onSubmit={submitCase}>
          <div className="case-fields">
            <label className="case-title-field">
              <span>Title</span>
              <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs review?" />
            </label>
            <label>
              <span>Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span>Amount</span>
              <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="€0" />
            </label>
            <label className="case-notes-field">
              <span>Notes</span>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Test result or follow-up" />
            </label>
          </div>

          <div className="case-source-heading">
            <span><Link2 size={13} /> Sources</span>
            <small>{selectedSourceIds.length} selected</small>
          </div>
          <div className="case-source-picker">
            {sources.map((source) => {
              const checked = selectedSourceIds.includes(source.id)
              const citationNumber = citationNumberById[source.id]
              return (
                <label className={`case-source-option ${checked ? 'selected' : ''}`} key={source.id}>
                  <input type="checkbox" checked={checked} onChange={() => toggleSource(source.id)} />
                  <span className="case-source-file">
                    {source.type === 'pdf' ? <FileText size={14} /> : <FileSpreadsheet size={14} />}
                  </span>
                  <span className="case-source-copy">
                    <strong>[{citationNumber}] {source.name}</strong>
                    <small>{source.location}</small>
                    <span>{source.passage}</span>
                  </span>
                </label>
              )
            })}
          </div>

          <footer>
            <span className="case-error" aria-live="polite">{error}</span>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="save-case-button">Save case</button>
          </footer>
        </form>
      </section>
    </div>
  )
}
