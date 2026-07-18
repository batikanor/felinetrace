import { useState } from 'react'
import './compilerVariants.css'
import type { FormEvent } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  GitMerge,
  Link2,
  LoaderCircle,
  Play,
  Plus,
  Search,
  ShieldAlert,
  Sigma,
  X,
} from 'lucide-react'
import { findings, sources } from './caseData'
import type { Finding, Source } from './caseData'
import './compiler.css'

type GateId = 'facts' | 'joins' | 'counter' | 'resolver' | 'certificate'
type GateStatus = 'pass' | 'hold'
type AtomStatus = 'proved' | 'excluded' | 'held'

type ProofAtom = {
  id: string
  type: string
  label: string
  value: string
  status: AtomStatus
  sourceId?: string
}

type ProofGate = {
  id: GateId
  step: string
  label: string
  signature: string
  summary: string
  status: GateStatus
  atoms: ProofAtom[]
}

type ProofClaim = {
  id: string
  category: string
  title: string
  amount: string
  decision: 'REPORT' | 'HOLD'
  certificate: string
  certificateNote: string
  sourceIds: string[]
  gates: ProofGate[]
}

export type ManualClaim = {
  id: string
  title: string
  category: string
  amount: string
  notes: string
  sourceIds: string[]
}

type ManualClaimDraft = Omit<ManualClaim, 'id'>

const sourceById = new Map(Object.values(sources).map((source) => [source.id, source]))
const allSources = Array.from(sourceById.values()).sort((a, b) => `${a.name}${a.location}`.localeCompare(`${b.name}${b.location}`))
const citedSources = Array.from(new Map(findings.flatMap((finding) => finding.sources).map((source) => [source.id, source])).values())
const citationNumberById = Object.fromEntries(citedSources.map((source, index) => [source.id, index + 1])) as Record<string, number>

const gateMeta: Record<GateId, { icon: typeof Sigma; label: string }> = {
  facts: { icon: Sigma, label: 'Deterministic facts' },
  joins: { icon: GitMerge, label: 'Evidence joins' },
  counter: { icon: ShieldAlert, label: 'Exclusions' },
  resolver: { icon: Fingerprint, label: 'Provenance' },
  certificate: { icon: BadgeCheck, label: 'Certificate' },
}

function sourceAtoms(sourceIds: string[]): ProofAtom[] {
  return sourceIds.map((sourceId) => {
    const source = sourceById.get(sourceId)
    return {
      id: `anchor:${sourceId}`,
      type: 'SourceAnchor',
      label: source?.name ?? sourceId,
      value: source?.location ?? 'Missing location',
      status: source ? 'proved' : 'held',
      sourceId,
    }
  })
}

const proofClaims: ProofClaim[] = [
  {
    id: 'F-01',
    category: findings[0].category,
    title: findings[0].title,
    amount: findings[0].amount,
    decision: 'REPORT',
    certificate: 'proof:F01:v1',
    certificateNote: 'Four anchors resolve the payment-chain claim.',
    sourceIds: ['master-data', 'permissions-u05', 'ratio-ledger', 'ratio-receipt-search'],
    gates: [
      {
        id: 'facts', step: '01', label: 'Facts', signature: 'LedgerRow[] → Decimal', status: 'pass',
        summary: 'Five invoice/payment rows sum without inference.',
        atoms: [
          { id: 'f01-sum', type: 'Decimal', label: 'Gross payment', value: '€248,000 + €47,120 = €295,120', status: 'proved', sourceId: 'ratio-ledger' },
          { id: 'f01-user', type: 'UserId', label: 'Posting user', value: 'MV-U05 on all five rows', status: 'proved', sourceId: 'ratio-ledger' },
        ],
      },
      {
        id: 'joins', step: '02', label: 'Join', signature: 'User ↔ Vendor ↔ Payment', status: 'pass',
        summary: 'Stable IDs connect vendor creation, rights and payment rows.',
        atoms: [
          { id: 'f01-vendor', type: 'ForeignKey', label: 'Vendor identity', value: '209101 ↔ Ratio Consulting GmbH', status: 'proved', sourceId: 'master-data' },
          { id: 'f01-rights', type: 'RoleSet', label: 'Conflicting rights', value: 'create vendor · book · pay', status: 'proved', sourceId: 'permissions-u05' },
        ],
      },
      {
        id: 'counter', step: '03', label: 'Exclude', signature: 'Predicate[] → ClaimScope', status: 'pass',
        summary: 'The negative evidence is limited to the tested receipt population.',
        atoms: [
          { id: 'f01-zero', type: 'ZeroResult', label: 'Receipt/delivery lookup', value: 'vendor 209101 · 858-row population · 0 matches', status: 'excluded', sourceId: 'ratio-receipt-search' },
          { id: 'f01-scope', type: 'ScopeRule', label: 'Wording guard', value: 'Does not treat memory or public lookup as payment evidence', status: 'excluded' },
        ],
      },
      {
        id: 'resolver', step: '04', label: 'Resolve', signature: 'ProofAtom[] → Citation[]', status: 'pass',
        summary: 'Every evidence atom maps to a filename and exact location.',
        atoms: sourceAtoms(['master-data', 'permissions-u05', 'ratio-ledger', 'ratio-receipt-search']),
      },
      {
        id: 'certificate', step: '05', label: 'Report', signature: 'Proof → ReportClaim', status: 'pass',
        summary: 'All typed gates pass.',
        atoms: [{ id: 'f01-cert', type: 'ProofCertificate', label: 'Report certificate', value: '4 anchors · calculation fixed · scope bounded', status: 'proved' }],
      },
    ],
  },
  {
    id: 'F-02',
    category: findings[1].category,
    title: findings[1].title,
    amount: findings[1].amount,
    decision: 'REPORT',
    certificate: 'proof:F02:v1',
    certificateNote: 'Descriptions, acquisition rows and balance-sheet exposure resolve.',
    sourceIds: ['asset-register', 'asset-bookings', 'annual-statement'],
    gates: [
      {
        id: 'facts', step: '01', label: 'Facts', signature: 'AssetRow[] → Decimal', status: 'pass',
        summary: 'Six acquisition postings total €150,800.',
        atoms: [{ id: 'f02-sum', type: 'Decimal', label: 'Capitalized amount', value: '28,000 + 34,000 + 15,500 + 41,000 + 12,800 + 19,500', status: 'proved', sourceId: 'asset-bookings' }],
      },
      {
        id: 'joins', step: '02', label: 'Join', signature: 'Description ↔ AssetAddition', status: 'pass',
        summary: 'Rows 191–196 map repair-like labels to the six acquisition entries.',
        atoms: [
          { id: 'f02-labels', type: 'RowSet', label: 'Repair-like descriptions', value: 'repair · overhaul · replacement', status: 'proved', sourceId: 'asset-register' },
          { id: 'f02-postings', type: 'RowSet', label: 'Acquisition postings', value: 'six matching additions', status: 'proved', sourceId: 'asset-bookings' },
        ],
      },
      {
        id: 'counter', step: '03', label: 'Exclude', signature: 'ScopeRule[] → BoundedClaim', status: 'pass',
        summary: 'The claim asks for recognition support; it does not pre-judge every invoice.',
        atoms: [
          { id: 'f02-balance', type: 'Exposure', label: 'Fixed-asset balance', value: '€19,729,014.76 draft', status: 'proved', sourceId: 'annual-statement' },
          { id: 'f02-scope', type: 'ScopeRule', label: 'Recognition test retained', value: 'Invoice review remains the next step', status: 'excluded' },
        ],
      },
      {
        id: 'resolver', step: '04', label: 'Resolve', signature: 'ProofAtom[] → Citation[]', status: 'pass',
        summary: 'Three exact dossier anchors resolve.',
        atoms: sourceAtoms(['asset-register', 'asset-bookings', 'annual-statement']),
      },
      {
        id: 'certificate', step: '05', label: 'Report', signature: 'Proof → ReportClaim', status: 'pass',
        summary: 'All typed gates pass.',
        atoms: [{ id: 'f02-cert', type: 'ProofCertificate', label: 'Report certificate', value: '3 anchors · 6-row calculation · bounded conclusion', status: 'proved' }],
      },
    ],
  },
  {
    id: 'F-03',
    category: findings[2].category,
    title: findings[2].title,
    amount: findings[2].amount,
    decision: 'REPORT',
    certificate: 'proof:F03:v1',
    certificateNote: 'Receipt/invoice joins survive the ledger and accrual challenge.',
    sourceIds: ['open-receipts', 'january-invoices', 'cutoff-ledger-search', 'december-accrual'],
    gates: [
      {
        id: 'facts', step: '01', label: 'Facts', signature: 'Receipt[] × Invoice[] → Decimal', status: 'pass',
        summary: 'Both eight-row populations total €192,000.',
        atoms: [
          { id: 'f03-receipts', type: 'RowSet', label: 'December receipts', value: '8 rows · €192,000', status: 'proved', sourceId: 'open-receipts' },
          { id: 'f03-invoices', type: 'RowSet', label: 'January invoices', value: '8 rows · €192,000', status: 'proved', sourceId: 'january-invoices' },
        ],
      },
      {
        id: 'joins', step: '02', label: 'Join', signature: 'Receipt ↔ Invoice', status: 'pass',
        summary: 'Vendor, service date, amount and document references form the chain.',
        atoms: [
          { id: 'f03-join', type: 'CompositeKey', label: 'Eight exact pairs', value: 'WE400840–847 ↔ ER901427–434', status: 'proved', sourceId: 'january-invoices' },
        ],
      },
      {
        id: 'counter', step: '03', label: 'Exclude', signature: 'LedgerQuery × Accrual → ClaimScope', status: 'pass',
        summary: 'The ledger search is empty and the €86,500 accrual carries different references.',
        atoms: [
          { id: 'f03-ledger-zero', type: 'ZeroResult', label: '2025 ledger lookup', value: 'ER901427–434 · 0 matching postings', status: 'excluded', sourceId: 'cutoff-ledger-search' },
          { id: 'f03-accrual', type: 'ExcludedRecord', label: 'Separate accrual', value: '€86,500 · none of the eight receipt/invoice refs', status: 'excluded', sourceId: 'december-accrual' },
        ],
      },
      {
        id: 'resolver', step: '04', label: 'Resolve', signature: 'ProofAtom[] → Citation[]', status: 'pass',
        summary: 'Four exact dossier anchors resolve.',
        atoms: sourceAtoms(['open-receipts', 'january-invoices', 'cutoff-ledger-search', 'december-accrual']),
      },
      {
        id: 'certificate', step: '05', label: 'Report', signature: 'Proof → ReportClaim', status: 'pass',
        summary: 'All typed gates pass.',
        atoms: [{ id: 'f03-cert', type: 'ProofCertificate', label: 'Report certificate', value: '4 anchors · 8 joins · offset rejected', status: 'proved' }],
      },
    ],
  },
  {
    id: 'F-04',
    category: findings[3].category,
    title: findings[3].title,
    amount: findings[3].amount,
    decision: 'REPORT',
    certificate: 'proof:F04:v1',
    certificateNote: 'The same-day group and threshold rule resolve without an external lookup.',
    sourceIds: ['split-payments', 'audit-plan', 'permissions-u11'],
    gates: [
      {
        id: 'facts', step: '01', label: 'Facts', signature: 'Payment[] → Decimal', status: 'pass',
        summary: 'Four individual payments total €39,040.',
        atoms: [{ id: 'f04-sum', type: 'Decimal', label: 'Grouped total', value: '9,780 + 9,820 + 9,750 + 9,690 = €39,040', status: 'proved', sourceId: 'split-payments' }],
      },
      {
        id: 'joins', step: '02', label: 'Join', signature: 'Payment[] → SameDayGroup', status: 'pass',
        summary: 'Date, vendor and SAMMEL key place all four payments in one group.',
        atoms: [{ id: 'f04-group', type: 'CompositeKey', label: 'Payment group', value: '14.10.2025 · vendor 200007 · SAMMEL-200007', status: 'proved', sourceId: 'split-payments' }],
      },
      {
        id: 'counter', step: '03', label: 'Exclude', signature: 'ControlRule × ClaimScope', status: 'pass',
        summary: 'The proof compares the group with the rule and makes no claim about intent.',
        atoms: [
          { id: 'f04-rule', type: 'ControlRule', label: 'Second-approval threshold', value: '€10,000 or more', status: 'proved', sourceId: 'audit-plan' },
          { id: 'f04-user', type: 'RoleSet', label: 'Posting/payment rights', value: 'MV-U11 · book + payment run', status: 'proved', sourceId: 'permissions-u11' },
          { id: 'f04-scope', type: 'ScopeRule', label: 'Intent excluded', value: 'Reports the control pattern, not motive', status: 'excluded' },
        ],
      },
      {
        id: 'resolver', step: '04', label: 'Resolve', signature: 'ProofAtom[] → Citation[]', status: 'pass',
        summary: 'Three exact dossier anchors resolve.',
        atoms: sourceAtoms(['split-payments', 'audit-plan', 'permissions-u11']),
      },
      {
        id: 'certificate', step: '05', label: 'Report', signature: 'Proof → ReportClaim', status: 'pass',
        summary: 'All typed gates pass.',
        atoms: [{ id: 'f04-cert', type: 'ProofCertificate', label: 'Report certificate', value: '3 anchors · grouped sum · intent excluded', status: 'proved' }],
      },
    ],
  },
  {
    id: 'X-05',
    category: 'REJECTED',
    title: '€86,500 accrual offsets the December invoices',
    amount: '€86,500',
    decision: 'HOLD',
    certificate: 'hold:X05:v1',
    certificateNote: 'Rejected: the accrual shares none of the eight receipt or invoice references.',
    sourceIds: ['cutoff-ledger-search', 'december-accrual'],
    gates: [
      {
        id: 'facts', step: '01', label: 'Facts', signature: 'AccrualRow → Decimal', status: 'pass',
        summary: 'A separate €86,500 accrual exists.',
        atoms: [{ id: 'x05-accrual', type: 'Accrual', label: 'Candidate offset', value: 'GJ6602864 · €86,500', status: 'proved', sourceId: 'december-accrual' }],
      },
      {
        id: 'joins', step: '02', label: 'Join', signature: 'Accrual ↔ Receipt/Invoice', status: 'hold',
        summary: 'The required reference join returns zero.',
        atoms: [{ id: 'x05-zero-join', type: 'MissingEdge', label: 'Shared references', value: '0 of ER901427–434 / WE400840–847', status: 'held', sourceId: 'december-accrual' }],
      },
      {
        id: 'counter', step: '03', label: 'Exclude', signature: 'Counterevidence → RejectHypothesis', status: 'pass',
        summary: 'The accrual is explicitly for other unbilled December work.',
        atoms: [
          { id: 'x05-other-work', type: 'Contradiction', label: 'Accrual description', value: 'other unbilled December work', status: 'excluded', sourceId: 'december-accrual' },
          { id: 'x05-ledger', type: 'ZeroResult', label: 'Invoice-reference lookup', value: '0 matching 2025 postings', status: 'excluded', sourceId: 'cutoff-ledger-search' },
        ],
      },
      {
        id: 'resolver', step: '04', label: 'Resolve', signature: 'ProofAtom[] → Citation[]', status: 'pass',
        summary: 'The rejection resolves to exact sources [10–11].',
        atoms: sourceAtoms(['cutoff-ledger-search', 'december-accrual']),
      },
      {
        id: 'certificate', step: '05', label: 'Hold', signature: 'Proof → HoldCertificate', status: 'hold',
        summary: 'The offset hypothesis cannot enter the report as support.',
        atoms: [{ id: 'x05-cert', type: 'HoldCertificate', label: 'Rejected hypothesis', value: 'Missing join · contradictory description', status: 'held' }],
      },
    ],
  },
]

// Shared with Setup's local runtime check; component state remains below.
// eslint-disable-next-line react-refresh/only-export-components
export function runCompilerSelfTest() {
  const knownSourceIds = new Set(Object.values(sources).map((source) => source.id))
  const reports = proofClaims.filter((claim) => claim.decision === 'REPORT')
  const holds = proofClaims.filter((claim) => claim.decision === 'HOLD')
  const sourcesResolve = proofClaims.every((claim) => claim.sourceIds.every((sourceId) => knownSourceIds.has(sourceId)))
  const reportGatesPass = reports.every((claim) => claim.gates.every((gate) => gate.status === 'pass'))
  const heldJoinExists = holds.every((claim) => claim.gates.some((gate) => gate.id === 'joins' && gate.status === 'hold'))
  const atoms = proofClaims.flatMap((claim) => claim.gates.flatMap((gate) => gate.atoms))
  return {
    ok: reports.length === 4 && holds.length === 1 && sourcesResolve && reportGatesPass && heldJoinExists,
    reports: reports.length,
    holds: holds.length,
    atoms: atoms.length,
  }
}

type ClaimCompilerProps = {
  onSource: (source: Source) => void
  onNotify?: (message: string) => void
}

export function ClaimCompiler({ onSource, onNotify }: ClaimCompilerProps) {
  const [selectedClaimId, setSelectedClaimId] = useState('F-01')
  const [activeGateId, setActiveGateId] = useState<GateId>('facts')
  const [compileState, setCompileState] = useState<'compiled' | 'running'>('compiled')
  const [runNumber, setRunNumber] = useState(1)
  const [manualClaims, setManualClaims] = useState<ManualClaim[]>([])
  const [composerOpen, setComposerOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(true)

  const selectedClaim = proofClaims.find((claim) => claim.id === selectedClaimId) ?? proofClaims[0]
  const activeGate = selectedClaim.gates.find((gate) => gate.id === activeGateId) ?? selectedClaim.gates[0]

  const selectClaim = (claim: ProofClaim) => {
    setSelectedClaimId(claim.id)
    setActiveGateId(claim.decision === 'HOLD' ? 'joins' : 'facts')
    setCompileState('compiled')
  }

  const replay = () => {
    if (compileState === 'running') return
    setCompileState('running')
    window.setTimeout(() => {
      setCompileState('compiled')
      setRunNumber((value) => value + 1)
      onNotify?.(`${selectedClaim.id} compiled · ${selectedClaim.decision.toLowerCase()}`)
    }, 640)
  }

  const addManualClaim = (draft: ManualClaimDraft) => {
    const id = `M-${String(manualClaims.length + 1).padStart(2, '0')}`
    setManualClaims((items) => [...items, { ...draft, id }])
    setComposerOpen(false)
    onNotify?.(`${id} linked as draft`)
  }

  return (
    <section className="claim-compiler compiler-layout-checklist" aria-label="Claim compiler">
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
        {proofClaims.map((claim) => (
          <button
            type="button"
            role="tab"
            aria-selected={selectedClaim.id === claim.id}
            className={`${selectedClaim.id === claim.id ? 'active' : ''} ${claim.decision === 'HOLD' ? 'held' : ''}`}
            key={claim.id}
            onClick={() => selectClaim(claim)}
          >
            <span><small>{claim.category}</small><strong>{claim.id}</strong></span>
            <b>{claim.amount}</b>
            <i>{claim.decision === 'REPORT' ? <Check size={10} /> : <CircleAlert size={10} />}{claim.decision}</i>
          </button>
        ))}
      </div>

      <div className="compiler-toolbar">
        <div>
          <strong>{selectedClaim.title}</strong>
        </div>
        <span className={`compile-state ${compileState}`}>
          {compileState === 'running' ? <LoaderCircle size={12} className="compiler-spin" /> : <Check size={12} />}
          {compileState === 'running' ? 'Checking' : `Checked · ${String(runNumber).padStart(2, '0')}`}
        </span>
        <button type="button" onClick={replay} disabled={compileState === 'running'}>
          {compileState === 'running' ? <LoaderCircle size={13} className="compiler-spin" /> : <Play size={13} />}
          {compileState === 'running' ? 'Checking' : 'Run checks'}
        </button>
      </div>

      {detailsOpen && <>
      <div className={`gate-pipeline ${compileState === 'running' ? 'running' : ''}`} aria-label="Typed proof gates">
        {selectedClaim.gates.map((gate, index) => {
          const Icon = gateMeta[gate.id].icon
          return (
            <div className="gate-wrap" key={gate.id}>
              <button
                type="button"
                className={`proof-gate ${activeGate.id === gate.id ? 'active' : ''} ${gate.status}`}
                aria-pressed={activeGate.id === gate.id}
                onClick={() => setActiveGateId(gate.id)}
              >
                <span className="gate-icon"><Icon size={14} /></span>
                <span><small>{gate.step} · {gateMeta[gate.id].label}</small><strong>{gate.label}</strong></span>
                <i>{gate.status === 'pass' ? <Check size={11} /> : <CircleAlert size={11} />}{gate.status === 'pass' ? 'PASS' : 'HOLD'}</i>
              </button>
              {index < selectedClaim.gates.length - 1 && <ArrowRight size={13} className="gate-arrow" />}
            </div>
          )
        })}
      </div>

      <div className="compiler-inspector">
        <div className="atom-panel">
          <div className="inspector-heading">
            <span><FileSearch size={13} /><strong>{activeGate.label} atoms</strong></span>
          </div>
          <div className="proof-atoms">
            {activeGate.atoms.map((atom) => {
              const source = atom.sourceId ? sourceById.get(atom.sourceId) : undefined
              const citationNumber = atom.sourceId ? citationNumberById[atom.sourceId] : undefined
              return (
                <button
                  type="button"
                  className={`proof-atom ${atom.status}`}
                  key={atom.id}
                  disabled={!source}
                  onClick={() => source && onSource(source)}
                  aria-label={source ? `Open ${source.name} ${source.location}` : `${atom.label}: ${atom.value}`}
                >
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
          <div className="certificate-copy">
            <small>{selectedClaim.decision === 'REPORT' ? 'REPORT CERTIFICATE' : 'HOLD CERTIFICATE'}</small>
            <strong>{selectedClaim.decision === 'REPORT' ? 'Proof compiled' : 'Hypothesis rejected'}</strong>
            <p>{selectedClaim.certificateNote}</p>
          </div>
          <div className="certificate-metrics">
            <span><small>GATES</small><b>{selectedClaim.gates.filter((gate) => gate.status === 'pass').length}/5 pass</b></span>
            <span><small>ANCHORS</small><b>{selectedClaim.sourceIds.length} resolved</b></span>
          </div>
        </aside>
      </div>
      </>}

      {manualClaims.length > 0 && (
        <section className="manual-claims" aria-label="Manual claim drafts">
          <header><span>MANUAL DRAFTS</span><small>Linked sources are not a certificate.</small></header>
          {manualClaims.map((claim) => (
            <article key={claim.id}>
              <span className="manual-claim-id">{claim.id}</span>
              <div><small>{claim.category} · DRAFT</small><strong>{claim.title}</strong>{claim.notes && <p>{claim.notes}</p>}</div>
              <div className="manual-source-links">
                {claim.sourceIds.map((sourceId) => {
                  const source = sourceById.get(sourceId)
                  if (!source) return null
                  return <button type="button" key={sourceId} onClick={() => onSource(source)}><Link2 size={10} />{source.name}<small>{source.location}</small></button>
                })}
              </div>
              {claim.amount && <b>{claim.amount}</b>}
            </article>
          ))}
        </section>
      )}

      {composerOpen && <ManualClaimDialog onClose={() => setComposerOpen(false)} onSave={addManualClaim} />}
    </section>
  )
}

type ManualClaimDialogProps = {
  onClose: () => void
  onSave: (draft: ManualClaimDraft) => void
}

function ManualClaimDialog({ onClose, onSave }: ManualClaimDialogProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Finding['category']>('FRAUD RISK')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const normalizedSearch = search.trim().toLowerCase()
  const visibleSources = allSources.filter((source) => !normalizedSearch || `${source.name} ${source.location} ${source.passage}`.toLowerCase().includes(normalizedSearch))

  const toggleSource = (sourceId: string) => {
    setSelectedSourceIds((items) => items.includes(sourceId) ? items.filter((id) => id !== sourceId) : [...items, sourceId])
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim()) {
      setError('Add a claim title.')
      return
    }
    if (selectedSourceIds.length === 0) {
      setError('Link at least one dossier passage.')
      return
    }
    onSave({ title: title.trim(), category, amount: amount.trim(), notes: notes.trim(), sourceIds: selectedSourceIds })
  }

  return (
    <div className="claim-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="claim-dialog" role="dialog" aria-modal="true" aria-labelledby="manual-claim-title">
        <header>
          <div><span><Plus size={12} /> MANUAL CASE</span><h2 id="manual-claim-title">Link a draft claim</h2></div>
          <button type="button" onClick={onClose} aria-label="Close add case"><X size={17} /></button>
        </header>
        <form onSubmit={submit}>
          <div className="claim-fields">
            <label><span>Claim</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs review?" autoFocus /></label>
            <label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value as Finding['category'])}><option value="FRAUD RISK">Fraud risk</option><option value="CUT-OFF">Cut-off</option><option value="CLASSIFICATION">Classification</option><option value="CONTROL">Control</option></select></label>
            <label><span>Amount <em>optional</em></span><input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="€0" /></label>
            <label className="claim-notes-field"><span>Notes <em>optional</em></span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="State the suspected join, exclusion, or missing proof." /></label>
          </div>
          <fieldset className="claim-source-picker">
            <legend>Source anchors <span>{selectedSourceIds.length} selected</span></legend>
            <div className="claim-source-search"><Search size={13} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search files, rows, pages or passages" aria-label="Search source anchors" /></div>
            <div className="claim-source-options">
              {visibleSources.map((source) => {
                const selected = selectedSourceIds.includes(source.id)
                const citationNumber = citationNumberById[source.id]
                return (
                  <button type="button" className={selected ? 'selected' : ''} key={source.id} onClick={() => toggleSource(source.id)} aria-pressed={selected}>
                    <span className="claim-source-icon">{source.type === 'pdf' ? <FileText size={13} /> : <FileSpreadsheet size={13} />}</span>
                    <span><strong>{citationNumber ? `[${citationNumber}] ` : ''}{source.name}</strong><small>{source.location}</small><em>{source.passage}</em></span>
                    <span className="claim-source-check"><Check size={11} /></span>
                  </button>
                )
              })}
              {visibleSources.length === 0 && <div className="claim-no-results">No matching source anchor.</div>}
            </div>
          </fieldset>
          {error && <div className="claim-error"><CircleAlert size={12} />{error}</div>}
          <footer><button type="button" onClick={onClose}>Cancel</button><button type="submit"><Plus size={13} /> Add draft</button></footer>
        </form>
      </section>
    </div>
  )
}
