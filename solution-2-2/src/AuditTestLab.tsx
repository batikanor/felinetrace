import {
  Database,
  GitCompareArrows,
  Link2,
  ListChecks,
  Plus,
  SearchCheck,
} from 'lucide-react'

type AuditTestLabProps = {
  onAddCase: () => void
}

const methodSteps = [
  { label: 'Ingest', detail: '35 files', icon: Database },
  { label: 'Reconcile', detail: '3 controls', icon: GitCompareArrows },
  { label: 'Run tests', detail: '4 rules', icon: ListChecks },
  { label: 'Seek counterevidence', detail: '2 searches', icon: SearchCheck },
  { label: 'Cite', detail: '14 passages', icon: Link2 },
]

const coverageRows = [
  {
    name: 'Vendor chain',
    inputs: 'Master · access · GL',
    test: 'Owner + payment timing',
    challenge: 'Receipt search: 0',
    citations: '[1–4]',
  },
  {
    name: 'Capex classification',
    inputs: 'Assets · postings · FS',
    test: 'Repair terms → assets',
    challenge: 'Recognition support',
    citations: '[5–7]',
  },
  {
    name: 'Cut-off',
    inputs: 'Receipts · Jan AP · GL',
    test: '€192K − 2025 match',
    challenge: 'Separate €86.5K accrual',
    citations: '[8–11]',
  },
  {
    name: 'Payment splitting',
    inputs: 'GL · JET plan · access',
    test: 'Same day/ref · <€10K',
    challenge: 'Second approval absent',
    citations: '[12–14]',
  },
]

export function AuditTestLab({ onAddCase }: AuditTestLabProps) {
  return (
    <section className="audit-test-lab" aria-labelledby="audit-lab-title">
      <header className="audit-lab-header">
        <div>
          <span className="audit-lab-kicker">TEST METHOD</span>
          <h2 id="audit-lab-title">Audit test lab</h2>
        </div>
        <button type="button" className="add-case-button" onClick={onAddCase}>
          <Plus size={14} /> Add case
        </button>
      </header>

      <div className="method-strip" aria-label="Audit test method">
        {methodSteps.map((step, index) => {
          const Icon = step.icon
          return (
            <div className="method-step" key={step.label}>
              <span className="method-icon"><Icon size={13} /></span>
              <span><strong>{step.label}</strong><small>{step.detail}</small></span>
              {index < methodSteps.length - 1 && <span className="method-arrow">→</span>}
            </div>
          )
        })}
      </div>

      <div className="coverage-matrix" role="table" aria-label="Test coverage">
        <div className="coverage-row coverage-head" role="row">
          <span role="columnheader">Test</span>
          <span role="columnheader">Inputs</span>
          <span role="columnheader">Rule</span>
          <span role="columnheader">Countercheck</span>
          <span role="columnheader">Trace</span>
        </div>
        {coverageRows.map((row) => (
          <div className="coverage-row" role="row" key={row.name}>
            <strong role="cell">{row.name}</strong>
            <span role="cell">{row.inputs}</span>
            <span role="cell">{row.test}</span>
            <span role="cell">{row.challenge}</span>
            <b role="cell">{row.citations}</b>
          </div>
        ))}
      </div>
    </section>
  )
}
