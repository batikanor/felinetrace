import { useState } from 'react'
import { FilePlus2, Link2, X } from 'lucide-react'
import type { Source } from './caseData'

export type NewCaseInput = {
  title: string
  amountEur: number
  note: string
  sources: Source[]
}

type AddCaseModalProps = {
  sources: Source[]
  onClose: () => void
  onCreate: (input: NewCaseInput) => void
}

export function AddCaseModal({ sources, onClose, onCreate }: AddCaseModalProps) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSource = (sourceId: string) => {
    setSelectedIds((ids) => ids.includes(sourceId) ? ids.filter((id) => id !== sourceId) : [...ids, sourceId])
  }

  const submit = () => {
    if (!title.trim() || selectedIds.length === 0) return
    onCreate({
      title: title.trim(),
      amountEur: Number(amount.replaceAll('.', '').replace(',', '.')) || 0,
      note: note.trim(),
      sources: sources.filter((source) => selectedIds.includes(source.id)),
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="add-case-modal" role="dialog" aria-modal="true" aria-labelledby="add-case-title">
        <header>
          <div className="case-modal-icon"><FilePlus2 size={16} /></div>
          <div><small>REVIEW QUEUE</small><h2 id="add-case-title">Add case</h2></div>
          <button type="button" onClick={onClose} aria-label="Close add case"><X size={16} /></button>
        </header>
        <div className="case-form">
          <label>
            <span>Task</span>
            <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Test vendor bank change" />
          </label>
          <div className="case-form-row">
            <label>
              <span>Amount (EUR)</span>
              <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" />
            </label>
            <label>
              <span>Instruction</span>
              <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="What should be challenged?" />
            </label>
          </div>
          <fieldset>
            <legend><Link2 size={12} /> Link dossier sources <small>{selectedIds.length} selected</small></legend>
            <div className="case-source-picker">
              {sources.map((source, index) => (
                <label key={source.id} className={selectedIds.includes(source.id) ? 'selected' : ''}>
                  <input type="checkbox" checked={selectedIds.includes(source.id)} onChange={() => toggleSource(source.id)} />
                  <span className="case-source-number">[{index + 1}]</span>
                  <span><strong>{source.name}</strong><small>{source.location}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <footer>
          <span>Case starts queued. No run starts automatically.</span>
          <div><button type="button" onClick={onClose}>Cancel</button><button type="button" disabled={!title.trim() || selectedIds.length === 0} onClick={submit}>Create case</button></div>
        </footer>
      </section>
    </div>
  )
}
