import { useState } from 'react'
import type {
  FormEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import type { Value } from 'platejs'
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react'
import { Plate, PlateContent, usePlateEditor } from 'platejs/react'
import {
  ArrowLeft,
  ArrowRight,
  Bold,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Italic,
  Link2,
  MessageSquarePlus,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  Underline,
  Users,
  X,
} from 'lucide-react'
import {
  clearedChecks,
  findings,
  reportValue,
  sources,
} from './caseData'
import type { Finding, Source } from './caseData'
import { CitationPlugin } from './CitationElement'
import type { CitationNode } from './CitationElement'
import { SourceWindow } from './SourceWindow'
import type { OpenSourceWindow } from './SourceWindow'

type Comment = {
  id: number
  author: string
  initials: string
  text: string
  quote?: string
  time: string
}

type ParagraphNode = {
  children: unknown[]
  [key: string]: unknown
}

type SkepticStatus = 'Countercheck pending' | 'Needs evidence' | 'Needs counterevidence' | 'Ready for review'

type ManualCase = {
  id: string
  title: string
  category: Finding['category']
  amount: string
  notes: string
  sourceIds: string[]
  skepticStatus: SkepticStatus
}

type ManualCaseDraft = Omit<ManualCase, 'id' | 'skepticStatus'>

type SkepticReview = {
  claim: string
  forSources: Source[]
  againstSources: Source[]
  counterResult: string
  verdict: string
}

const citationSources = Array.from(
  new Map(findings.flatMap((finding) => finding.sources).map((source) => [source.id, source])).values(),
)

const citationNumberById = Object.fromEntries(
  citationSources.map((source, index) => [source.id, index + 1]),
) as Record<string, number>

const reportCitations: Record<number, string[]> = {
  8: ['master-data', 'permissions-u05', 'ratio-ledger', 'ratio-receipt-search'],
  12: ['asset-register', 'asset-bookings', 'annual-statement'],
  16: ['open-receipts', 'january-invoices', 'cutoff-ledger-search', 'december-accrual'],
  20: ['split-payments', 'audit-plan', 'permissions-u11'],
}

const reportDocumentValue = reportValue.map((node, paragraphIndex) => {
  const citationIds = reportCitations[paragraphIndex]
  if (!citationIds) return node

  const paragraph = node as unknown as ParagraphNode
  const citationNodes = citationIds.flatMap((sourceId) => {
    const citation: CitationNode = {
      type: 'citation',
      number: citationNumberById[sourceId],
      sourceId,
      children: [{ text: '' }],
    }
    return [{ text: ' ' }, citation]
  })

  return {
    ...paragraph,
    children: [...paragraph.children, ...citationNodes],
  }
}) as unknown as Value

const sourceById = new Map(Object.values(sources).map((source) => [source.id, source]))
const citedFileCount = new Set(citationSources.map((source) => source.name)).size

const caseSourceOptions = Array.from(new Map([
  ...citationSources,
  ...clearedChecks.map((check) => check.source),
  sources.cleanCapex,
].map((source) => [source.id, source])).values())

const skepticReviews: Record<string, SkepticReview> = {
  'F-01': {
    claim: 'One user controlled a €295,120 vendor-to-payment chain.',
    forSources: [sources.masterData, sources.permissionsU05, sources.ratioLedger],
    againstSources: [sources.ratioReceiptSearch],
    counterResult: 'No receipt, contract or service record supports the five invoices.',
    verdict: 'Escalate the full payment chain',
  },
  'F-02': {
    claim: 'Six repair-type bills were recorded as €150,800 of assets.',
    forSources: [sources.assetRegister, sources.assetBookings, sources.annualStatement],
    againstSources: [sources.cleanCapex],
    counterResult: 'A clean €480K asset links to IA-2025-04; the six repairs do not.',
    verdict: 'Keep €150,800 in review',
  },
  'F-03': {
    claim: 'Eight December receipts have no 2025 posting.',
    forSources: [sources.openReceipts, sources.januaryInvoices, sources.cutoffLedgerSearch],
    againstSources: [sources.decemberAccrual],
    counterResult: 'The €86,500 accrual matches none of the receipt or invoice references.',
    verdict: 'Reject offset · €192,000 remains',
  },
  'F-04': {
    claim: 'Four same-day payments split a €39,040 total below €10K.',
    forSources: [sources.splitPayments, sources.auditPlan, sources.permissionsU11],
    againstSources: [],
    counterResult: 'No second approval tied to SAMMEL-200007 appears in the dossier.',
    verdict: 'Escalate the control breach',
  },
}

const emptyCaseDraft: ManualCaseDraft = {
  title: '',
  category: 'FRAUD RISK',
  amount: '',
  notes: '',
  sourceIds: [],
}

const startingComments: Comment[] = [
  {
    id: 1,
    author: 'Anna Hoffmann',
    initials: 'AH',
    text: 'Do not net the €86.5K accrual without a receipt-level link.',
    quote: 'The separate €86,500 accrual carries none of their receipt or invoice references.',
    time: '2 min ago',
  },
  {
    id: 2,
    author: 'Jonas Weber',
    initials: 'JW',
    text: 'Obtain the Ratio framework agreement and bank-owner confirmation.',
    time: '8 min ago',
  },
]

function App() {
  const editor = usePlateEditor({
    plugins: [BoldPlugin, ItalicPlugin, UnderlinePlugin, CitationPlugin],
    value: reportDocumentValue,
  })
  const [rightTab, setRightTab] = useState<'cases' | 'comments'>('cases')
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth > 800)
  const [expandedFinding, setExpandedFinding] = useState('F-01')
  const [activeBundle, setActiveBundle] = useState('F-01')
  const [sourceWindows, setSourceWindows] = useState<OpenSourceWindow[]>([])
  const [comments, setComments] = useState(startingComments)
  const [commentQuote, setCommentQuote] = useState('')
  const [commentDraft, setCommentDraft] = useState('')
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [manualCases, setManualCases] = useState<ManualCase[]>([])
  const [expandedManualCase, setExpandedManualCase] = useState('')
  const [showCaseForm, setShowCaseForm] = useState(false)
  const [caseDraft, setCaseDraft] = useState<ManualCaseDraft>(emptyCaseDraft)
  const [caseError, setCaseError] = useState('')
  const [toast, setToast] = useState('')

  const activeFinding = findings.find((finding) => finding.id === activeBundle) ?? findings[0]
  const caseCount = findings.length + manualCases.length

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const runToolbarAction = (event: ReactMouseEvent<HTMLButtonElement>, action: () => void) => {
    event.preventDefault()
    action()
  }

  const startComment = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const selection = window.getSelection()?.toString().trim() ?? ''
    setCommentQuote(selection)
    setShowCommentBox(true)
    setRightTab('comments')
    setPanelOpen(true)
  }

  const addComment = () => {
    if (!commentDraft.trim()) return
    setComments((items) => [...items, {
      id: Date.now(),
      author: 'Anna Hoffmann',
      initials: 'AH',
      text: commentDraft.trim(),
      quote: commentQuote || undefined,
      time: 'Just now',
    }])
    setCommentDraft('')
    setCommentQuote('')
    setShowCommentBox(false)
    notify('Comment added')
  }

  const openSourceWindow = (source: Source) => {
    setSourceWindows((windows) => {
      const topZ = Math.max(50, ...windows.map((item) => item.z)) + 1
      const existing = windows.find((item) => item.source.id === source.id)
      if (existing) {
        return windows.map((item) => item.source.id === source.id ? { ...item, z: topZ } : item)
      }
      const offset = (windows.length % 5) * 24
      return [...windows, {
        source,
        x: Math.max(10, window.innerWidth - 500 - offset),
        y: 122 + offset,
        z: topZ,
      }]
    })
  }

  const focusSourceWindow = (id: string) => {
    setSourceWindows((windows) => {
      const topZ = Math.max(50, ...windows.map((item) => item.z)) + 1
      return windows.map((item) => item.source.id === id ? { ...item, z: topZ } : item)
    })
  }

  const moveSourceWindow = (id: string, x: number, y: number) => {
    setSourceWindows((windows) => windows.map((item) => item.source.id === id ? { ...item, x, y } : item))
  }

  const handleCitationClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const citation = (event.target as HTMLElement).closest<HTMLElement>('[data-citation-source]')
    if (!citation) return
    const source = sourceById.get(citation.dataset.citationSource ?? '')
    if (source) openSourceWindow(source)
  }

  const openCaseForm = () => {
    setCaseDraft(emptyCaseDraft)
    setCaseError('')
    setShowCaseForm(true)
  }

  const toggleCaseSource = (sourceId: string) => {
    setCaseDraft((draft) => ({
      ...draft,
      sourceIds: draft.sourceIds.includes(sourceId)
        ? draft.sourceIds.filter((id) => id !== sourceId)
        : [...draft.sourceIds, sourceId],
    }))
    setCaseError('')
  }

  const saveManualCase = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!caseDraft.title.trim() || !caseDraft.amount.trim()) {
      setCaseError('Add a title and amount.')
      return
    }
    if (caseDraft.sourceIds.length === 0) {
      setCaseError('Select at least one passage.')
      return
    }

    const nextCase: ManualCase = {
      id: `M-${String(manualCases.length + 1).padStart(2, '0')}`,
      title: caseDraft.title.trim(),
      category: caseDraft.category,
      amount: caseDraft.amount.trim(),
      notes: caseDraft.notes.trim(),
      sourceIds: caseDraft.sourceIds,
      skepticStatus: 'Countercheck pending',
    }
    setManualCases((items) => [...items, nextCase])
    setExpandedManualCase(nextCase.id)
    setRightTab('cases')
    setPanelOpen(true)
    setShowCaseForm(false)
    setCaseDraft(emptyCaseDraft)
    notify(`${nextCase.id} added`)
  }

  const updateManualCaseStatus = (caseId: string, skepticStatus: SkepticStatus) => {
    setManualCases((items) => items.map((item) => item.id === caseId ? { ...item, skepticStatus } : item))
  }

  const selectFinding = (findingId: string) => {
    setActiveBundle(findingId)
    setExpandedFinding((current) => current === findingId ? '' : findingId)
  }

  return (
    <div className="simple-app">
      <header className="simple-header">
        <div className="simple-brand"><span className="simple-logo">t</span><strong>trace</strong></div>
        <div className="document-title">
          <strong>Muster Verpackungen · Detector + Skeptic</strong>
          <span>Saved</span>
        </div>
        <div className="header-actions">
          <div className="collaborators"><span>AH</span><span>JW</span></div>
          <button type="button" className="quiet-button" onClick={() => notify('Share link copied')}><Users size={15} /> Share</button>
          <button
            type="button"
            className="analyze-button"
            onClick={() => {
              setPanelOpen(true)
              setRightTab('cases')
              notify(`${caseCount} cases refreshed`)
            }}
          >
            <RefreshCw size={14} /> Run checks
          </button>
        </div>
      </header>

      <div className="editor-toolbar">
        <button type="button" title="Back"><ArrowLeft size={16} /></button>
        <span className="toolbar-rule" />
        <button type="button" onMouseDown={(event) => runToolbarAction(event, () => editor.tf.bold.toggle())} title="Bold"><Bold size={16} /></button>
        <button type="button" onMouseDown={(event) => runToolbarAction(event, () => editor.tf.italic.toggle())} title="Italic"><Italic size={16} /></button>
        <button type="button" onMouseDown={(event) => runToolbarAction(event, () => editor.tf.underline.toggle())} title="Underline"><Underline size={16} /></button>
        <span className="toolbar-rule" />
        <button type="button" onMouseDown={startComment} className="comment-toolbar-button"><MessageSquarePlus size={16} /> Add comment</button>
        <button type="button" className="mobile-findings-button" onClick={() => { setPanelOpen(true); setRightTab('cases') }}><ShieldCheck size={15} /> {caseCount} cases</button>
        <span className="toolbar-spacer" />
        <button type="button" title="Search" onClick={() => notify('Search ready')}><Search size={16} /></button>
        <button type="button" title="More" onClick={() => notify('Document options')}><MoreHorizontal size={17} /></button>
      </div>

      <main className="workspace">
        <section className="document-workspace">
          <div className="document-status-bar">
            <span><FileCheck2 size={14} /> 35 files</span>
            <span>27,190 records</span>
            <span>{caseCount} cases</span>
            <button type="button" onClick={() => notify('14 cited passages traced')}><Link2 size={13} /> 14 citations</button>
          </div>

          <SkepticMethodWidget
            activeFinding={activeFinding}
            activeBundle={activeBundle}
            onBundle={setActiveBundle}
            onSource={openSourceWindow}
          />

          <EvidenceDock
            activeFinding={activeFinding}
            openWindows={sourceWindows}
            onSource={openSourceWindow}
          />

          <div className="paper-wrap citation-paper-wrap">
            <div className="paper-stack">
              <article className="paper citation-report-paper">
                <div className="document-mode"><span><Check size={12} /> Working paper</span><small>Saved</small></div>
                <div onClick={handleCitationClick}>
                  <Plate editor={editor}>
                    <PlateContent className="report-editor citation-report-editor" placeholder="Start writing your audit report…" />
                  </Plate>
                </div>
                <div className="paper-footer"><span>MUSTER VERPACKUNGEN · FY 2025</span><span>1</span></div>
              </article>

              <article className="paper sources-paper">
                <div className="sources-kicker">MUSTER VERPACKUNGEN GMBH · FY 2025</div>
                <div className="sources-heading">
                  <h1>Sources</h1>
                  <span>{citationSources.length} passages · {citedFileCount} files</span>
                </div>
                <div className="sources-rule" />
                <div className="sources-grid">
                  {citationSources.map((source, index) => (
                    <button type="button" className="reference-entry" key={source.id} onClick={() => openSourceWindow(source)}>
                      <span className="reference-number">[{index + 1}]</span>
                      <span className="reference-copy">
                        <strong>{source.name}</strong>
                        <small>{source.location}</small>
                        <span>{source.passage}</span>
                      </span>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
                <div className="paper-footer"><span>SOURCES · {citationSources.length} PASSAGES</span><span>2</span></div>
              </article>
            </div>
          </div>
        </section>

        <aside className={`review-panel ${panelOpen ? 'panel-open' : ''}`}>
          <div className="panel-tabs">
            <button type="button" className={rightTab === 'cases' ? 'active' : ''} onClick={() => setRightTab('cases')}>Cases <span>{caseCount}</span></button>
            <button type="button" className={rightTab === 'comments' ? 'active' : ''} onClick={() => setRightTab('comments')}>Comments <span>{comments.length}</span></button>
            <button type="button" className="close-panel" onClick={() => setPanelOpen(false)} aria-label="Close panel"><X size={16} /></button>
          </div>

          {rightTab === 'cases' ? (
            <FindingsPanel
              activeFindingId={activeBundle}
              expandedFinding={expandedFinding}
              manualCases={manualCases}
              expandedManualCase={expandedManualCase}
              onFinding={selectFinding}
              onManualExpanded={setExpandedManualCase}
              onManualStatus={updateManualCaseStatus}
              onSource={openSourceWindow}
              onAddCase={openCaseForm}
              onReview={() => notify('Case marked for review')}
            />
          ) : (
            <div className="comments-panel">
              {showCommentBox && (
                <div className="comment-composer">
                  {commentQuote && <blockquote>{commentQuote}</blockquote>}
                  <textarea autoFocus value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Add your comment…" />
                  <div><button type="button" onClick={() => setShowCommentBox(false)}>Cancel</button><button type="button" onClick={addComment}>Comment</button></div>
                </div>
              )}
              {comments.map((comment) => (
                <article className="comment" key={comment.id}>
                  <span className="comment-avatar">{comment.initials}</span>
                  <div>
                    <div><strong>{comment.author}</strong><small>{comment.time}</small></div>
                    {comment.quote && <blockquote>{comment.quote}</blockquote>}
                    <p>{comment.text}</p>
                    <button type="button">Reply</button>
                  </div>
                </article>
              ))}
              {!showCommentBox && <button type="button" className="new-comment" onClick={() => setShowCommentBox(true)}><MessageSquarePlus size={15} /> New comment</button>}
            </div>
          )}
        </aside>
      </main>

      {sourceWindows.map((item) => (
        <SourceWindow
          key={item.source.id}
          item={item}
          onClose={() => setSourceWindows((windows) => windows.filter((windowItem) => windowItem.source.id !== item.source.id))}
          onFocus={() => focusSourceWindow(item.source.id)}
          onMove={(x, y) => moveSourceWindow(item.source.id, x, y)}
          onCopied={() => notify('Citation copied')}
        />
      ))}

      {showCaseForm && (
        <CaseForm
          draft={caseDraft}
          error={caseError}
          onChange={setCaseDraft}
          onToggleSource={toggleCaseSource}
          onCancel={() => setShowCaseForm(false)}
          onSubmit={saveManualCase}
        />
      )}

      {toast && <div className="toast"><Check size={15} /> {toast}</div>}
    </div>
  )
}

type SkepticMethodWidgetProps = {
  activeFinding: Finding
  activeBundle: string
  onBundle: (findingId: string) => void
  onSource: (source: Source) => void
}

function SkepticMethodWidget({ activeFinding, activeBundle, onBundle, onSource }: SkepticMethodWidgetProps) {
  const review = skepticReviews[activeFinding.id]

  return (
    <section className="method-widget" aria-label="Detector and skeptic method">
      <header className="method-header">
        <div>
          <span className="method-kicker"><Scale size={13} /> Detector + Skeptic</span>
          <strong>{review.claim}</strong>
        </div>
        <b>{activeFinding.amount}</b>
      </header>

      <div className="method-case-tabs" role="tablist" aria-label="Ground-truth cases">
        {findings.map((finding) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeBundle === finding.id}
            className={activeBundle === finding.id ? 'active' : ''}
            key={finding.id}
            onClick={() => onBundle(finding.id)}
          >
            <span>{finding.id}</span><strong>{finding.category}</strong><small>{finding.amount}</small>
          </button>
        ))}
      </div>

      <div className="method-route" aria-label="Claim to verdict method">
        {['Claim', 'Evidence for', 'Counterevidence search', 'Verdict'].map((step, index) => (
          <div className="method-route-part" key={step}>
            <span><b>{index + 1}</b>{step}</span>
            {index < 3 && <ArrowRight size={13} />}
          </div>
        ))}
      </div>

      <div className="skeptic-columns">
        <section className="skeptic-column evidence-for">
          <header><span>Evidence for</span><b>{review.forSources.length}</b></header>
          <div>
            {review.forSources.map((source) => (
              <button type="button" key={source.id} onClick={() => onSource(source)}>
                <span>{citationNumberById[source.id] ? `[${citationNumberById[source.id]}]` : '+'}</span>
                <span><strong>{source.value}</strong><small>{source.name} · {source.location}</small></span>
                <ChevronRight size={12} />
              </button>
            ))}
          </div>
        </section>

        <section className="skeptic-column counter-search">
          <header><span>Counterevidence search</span><Search size={12} /></header>
          <div>
            {review.againstSources.map((source) => (
              <button type="button" key={source.id} onClick={() => onSource(source)}>
                <span>{citationNumberById[source.id] ? `[${citationNumberById[source.id]}]` : '+'}</span>
                <span><strong>{source.value}</strong><small>{source.name} · {source.location}</small></span>
                <ChevronRight size={12} />
              </button>
            ))}
            {review.againstSources.length === 0 && <div className="no-counter-source">No linked approval</div>}
          </div>
          <p>{review.counterResult}</p>
        </section>
      </div>

      <footer className="verdict-strip">
        <span>Verdict</span>
        <strong>{review.verdict}</strong>
        <small><ShieldCheck size={12} /> Offsets require a direct match: reference + counterparty + amount.</small>
      </footer>
    </section>
  )
}

type EvidenceDockProps = {
  activeFinding: Finding
  openWindows: OpenSourceWindow[]
  onSource: (source: Source) => void
}

function EvidenceDock({ activeFinding, openWindows, onSource }: EvidenceDockProps) {
  return (
    <section className="evidence-dock passage-dock">
      <div className="dock-heading">
        <span><Link2 size={13} /> Linked passages</span>
        <small>{activeFinding.id} · click a source · drag to compare</small>
      </div>
      <div className="bundle-sources">
        {activeFinding.sources.map((source) => (
          <button
            type="button"
            key={source.id}
            className={openWindows.some((item) => item.source.id === source.id) ? 'open' : ''}
            onClick={() => onSource(source)}
          >
            <span className="dock-file-icon">{source.type === 'pdf' ? <FileText size={14} /> : <FileSpreadsheet size={14} />}</span>
            <span><strong>[{citationNumberById[source.id]}] {source.name}</strong><small>{source.location} · {source.value}</small></span>
          </button>
        ))}
      </div>
    </section>
  )
}

type FindingsPanelProps = {
  activeFindingId: string
  expandedFinding: string
  manualCases: ManualCase[]
  expandedManualCase: string
  onFinding: (findingId: string) => void
  onManualExpanded: (caseId: string) => void
  onManualStatus: (caseId: string, status: SkepticStatus) => void
  onSource: (source: Source) => void
  onAddCase: () => void
  onReview: () => void
}

function FindingsPanel({
  activeFindingId,
  expandedFinding,
  manualCases,
  expandedManualCase,
  onFinding,
  onManualExpanded,
  onManualStatus,
  onSource,
  onAddCase,
  onReview,
}: FindingsPanelProps) {
  return (
    <div className="findings-panel">
      <div className="panel-intro case-queue-intro">
        <ShieldCheck size={16} />
        <div><strong>Case queue</strong><span>{findings.length} detected · {manualCases.length} manual</span></div>
        <button type="button" onClick={onAddCase}><Plus size={13} /> Add case</button>
      </div>

      {manualCases.length > 0 && (
        <section className="manual-cases">
          <div className="queue-section-label">Manual</div>
          {manualCases.map((manualCase) => {
            const expanded = manualCase.id === expandedManualCase
            return (
              <article className={`manual-case-card ${expanded ? 'expanded' : ''}`} key={manualCase.id}>
                <button type="button" className="manual-case-summary" onClick={() => onManualExpanded(expanded ? '' : manualCase.id)}>
                  <span className="manual-dot" />
                  <span><small>{manualCase.id} · {manualCase.category}</small><strong>{manualCase.title}</strong></span>
                  <b>{manualCase.amount}</b>
                  {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>
                {expanded && (
                  <div className="manual-case-body">
                    {manualCase.notes && <p>{manualCase.notes}</p>}
                    <div className="manual-status-row">
                      <label htmlFor={`status-${manualCase.id}`}>Skeptic status</label>
                      <select
                        id={`status-${manualCase.id}`}
                        value={manualCase.skepticStatus}
                        onChange={(event) => onManualStatus(manualCase.id, event.target.value as SkepticStatus)}
                      >
                        <option>Countercheck pending</option>
                        <option>Needs evidence</option>
                        <option>Needs counterevidence</option>
                        <option>Ready for review</option>
                      </select>
                    </div>
                    <div className="source-label">SOURCE PASSAGES</div>
                    <div className="source-list manual-source-list">
                      {manualCase.sourceIds.map((sourceId) => {
                        const source = sourceById.get(sourceId)
                        if (!source) return null
                        return (
                          <button type="button" key={source.id} onClick={() => onSource(source)}>
                            <span className="source-number">{citationNumberById[source.id] ? `[${citationNumberById[source.id]}]` : '+'}</span>
                            <span><strong>{source.value}</strong><small>{source.name} · {source.location}</small></span>
                            <ChevronRight size={14} />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </section>
      )}

      <div className="queue-section-label">Detected</div>
      {findings.map((finding) => {
        const expanded = finding.id === expandedFinding
        return (
          <article className={`finding-card ${expanded ? 'expanded' : ''} ${activeFindingId === finding.id ? 'active-case' : ''}`} key={finding.id}>
            <button type="button" className="finding-summary" onClick={() => onFinding(finding.id)}>
              <span className={`risk-dot ${finding.severity.toLowerCase()}`} />
              <span className="finding-summary-copy"><small>{finding.id} · {finding.category}</small><strong>{finding.title}</strong></span>
              <strong className="finding-amount">{finding.amount}</strong>
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expanded && (
              <div className="finding-body">
                <p>{finding.explanation}</p>
                <div className="evidence-count-row"><span><ShieldCheck size={12} /> {finding.sources.length} passages</span><button type="button" onClick={onReview}><Check size={13} /> Review</button></div>
                <div className="calculation"><small>CALCULATION</small><strong>{finding.calculation}</strong></div>
                <div className="source-label">SOURCES</div>
                <div className="source-list">
                  {finding.sources.map((source) => (
                    <button type="button" key={source.id} onClick={() => onSource(source)}>
                      <span className="source-number">[{citationNumberById[source.id]}]</span>
                      <span><strong>{source.value}</strong><small>{source.name} · {source.location}</small></span>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </article>
        )
      })}

      <section className="cleared-block">
        <h3><CheckCircle2 size={14} /> Cleared</h3>
        {clearedChecks.map((check) => (
          <button type="button" key={check.label} onClick={() => onSource(check.source)}>
            <span><strong>{check.label}</strong><small>{check.detail}</small></span>
            <ChevronRight size={14} />
          </button>
        ))}
      </section>
    </div>
  )
}

type CaseFormProps = {
  draft: ManualCaseDraft
  error: string
  onChange: (draft: ManualCaseDraft) => void
  onToggleSource: (sourceId: string) => void
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function CaseForm({ draft, error, onChange, onToggleSource, onCancel, onSubmit }: CaseFormProps) {
  return (
    <div className="case-modal-backdrop" role="presentation">
      <form className="case-form" onSubmit={onSubmit} aria-label="Add case">
        <header>
          <div><span>Manual case</span><h2>Add case</h2></div>
          <button type="button" onClick={onCancel} aria-label="Close add case"><X size={17} /></button>
        </header>

        <label className="case-field">
          <span>Title</span>
          <input
            autoFocus
            value={draft.title}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
            placeholder="What needs review?"
          />
        </label>

        <div className="case-form-row">
          <label className="case-field">
            <span>Category</span>
            <select value={draft.category} onChange={(event) => onChange({ ...draft, category: event.target.value as Finding['category'] })}>
              <option>FRAUD RISK</option>
              <option>CUT-OFF</option>
              <option>CLASSIFICATION</option>
              <option>CONTROL</option>
            </select>
          </label>
          <label className="case-field">
            <span>Amount</span>
            <input value={draft.amount} onChange={(event) => onChange({ ...draft, amount: event.target.value })} placeholder="€0" />
          </label>
        </div>

        <label className="case-field">
          <span>Notes</span>
          <textarea value={draft.notes} onChange={(event) => onChange({ ...draft, notes: event.target.value })} placeholder="Short claim or next step" />
        </label>

        <fieldset className="source-picker">
          <legend>Source passages <span>{draft.sourceIds.length} selected</span></legend>
          <div>
            {caseSourceOptions.map((source) => (
              <label className={draft.sourceIds.includes(source.id) ? 'selected' : ''} key={source.id}>
                <input
                  type="checkbox"
                  checked={draft.sourceIds.includes(source.id)}
                  onChange={() => onToggleSource(source.id)}
                />
                <span className="picker-number">{citationNumberById[source.id] ? `[${citationNumberById[source.id]}]` : '+'}</span>
                <span><strong>{source.value}</strong><small>{source.name} · {source.location}</small></span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p className="case-error">{error}</p>}

        <footer>
          <span>Skeptic status: Countercheck pending</span>
          <div><button type="button" onClick={onCancel}>Cancel</button><button type="submit"><Plus size={13} /> Save case</button></div>
        </footer>
      </form>
    </div>
  )
}

export default App
