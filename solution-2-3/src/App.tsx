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
  Banknote,
  Bold,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Italic,
  Layers3,
  Link2,
  MessageSquarePlus,
  MoreHorizontal,
  Network,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Underline,
  Unlink2,
  UserRound,
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
  text: string
  quote?: string
}

type ParagraphNode = {
  children: unknown[]
  [key: string]: unknown
}

type ReviewTab = 'review' | 'checks' | 'comments'

type ReviewCase = Finding & {
  added?: boolean
}

type CaseDraft = {
  title: string
  category: Finding['category']
  amount: string
  notes: string
  sourceIds: string[]
}

type GraphNodeKind = 'user' | 'vendor' | 'document' | 'payment' | 'policy' | 'missing' | 'finding' | 'entity'

type GraphNode = {
  id: string
  kind: GraphNodeKind
  label: string
  detail: string
  x: number
  y: number
  sourceId?: string
}

type GraphLink = {
  from: string
  to: string
  label?: string
  missing?: boolean
}

type GraphDefinition = {
  summary: string
  signal: string
  nodes: GraphNode[]
  links: GraphLink[]
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
const caseSourceOptions = Array.from(new Map(Object.values(sources).map((source) => [source.id, source])).values())
  .sort((a, b) => `${a.name}${a.location}`.localeCompare(`${b.name}${b.location}`))

const graphDefinitions: Record<string, GraphDefinition> = {
  'F-01': {
    summary: 'One user spans vendor setup, invoice posting and payment.',
    signal: 'The expected service evidence is absent.',
    nodes: [
      { id: 'u05', kind: 'user', label: 'MV-U05', detail: 'User', x: 80, y: 92, sourceId: 'permissions-u05' },
      { id: 'ratio', kind: 'vendor', label: 'Ratio Consulting', detail: 'Vendor 209101', x: 270, y: 92, sourceId: 'master-data' },
      { id: 'invoices', kind: 'document', label: '5 invoices', detail: '€248,000 + VAT', x: 470, y: 92, sourceId: 'ratio-ledger' },
      { id: 'cash', kind: 'payment', label: '€295,120 paid', detail: 'Within 2 days', x: 670, y: 92, sourceId: 'ratio-ledger' },
      { id: 'gap', kind: 'missing', label: 'Service evidence', detail: '0 receipts', x: 470, y: 190, sourceId: 'ratio-receipt-search' },
      { id: 'finding', kind: 'finding', label: 'Payment chain', detail: 'F-01', x: 900, y: 126 },
    ],
    links: [
      { from: 'u05', to: 'ratio', label: 'created + approved' },
      { from: 'ratio', to: 'invoices', label: 'billed' },
      { from: 'invoices', to: 'cash', label: 'paid' },
      { from: 'cash', to: 'finding' },
      { from: 'ratio', to: 'gap', missing: true, label: 'expected' },
      { from: 'gap', to: 'finding', missing: true },
    ],
  },
  'F-02': {
    summary: 'Repair wording flows into asset acquisitions and the year-end balance.',
    signal: 'Recognition support must bridge repair descriptions to capitalization.',
    nodes: [
      { id: 'descriptions', kind: 'document', label: '6 repair items', detail: 'Register rows 191–196', x: 105, y: 92, sourceId: 'asset-register' },
      { id: 'bookings', kind: 'document', label: '6 acquisitions', detail: '€150,800', x: 345, y: 92, sourceId: 'asset-bookings' },
      { id: 'assets', kind: 'entity', label: 'Fixed assets', detail: '€19.73M draft', x: 590, y: 92, sourceId: 'annual-statement' },
      { id: 'support', kind: 'missing', label: 'Recognition support', detail: 'Test invoice by invoice', x: 455, y: 190 },
      { id: 'finding', kind: 'finding', label: 'Classification', detail: 'F-02 · €150,800', x: 885, y: 126 },
    ],
    links: [
      { from: 'descriptions', to: 'bookings', label: 'recorded as' },
      { from: 'bookings', to: 'assets', label: 'increases' },
      { from: 'assets', to: 'finding' },
      { from: 'descriptions', to: 'support', missing: true, label: 'needs' },
      { from: 'support', to: 'finding', missing: true },
    ],
  },
  'F-03': {
    summary: 'December receipts join to January invoices, but not to a 2025 posting.',
    signal: 'Eight invoice references have no 2025 ledger edge.',
    nodes: [
      { id: 'receipts', kind: 'document', label: '8 Dec receipts', detail: '€192,000', x: 90, y: 92, sourceId: 'open-receipts' },
      { id: 'invoices', kind: 'document', label: '8 Jan invoices', detail: 'Same vendors + amounts', x: 320, y: 92, sourceId: 'january-invoices' },
      { id: 'posting', kind: 'missing', label: '2025 posting', detail: '0 matching refs', x: 555, y: 92, sourceId: 'cutoff-ledger-search' },
      { id: 'accrual', kind: 'payment', label: 'Separate accrual', detail: '€86,500 · no refs', x: 430, y: 190, sourceId: 'december-accrual' },
      { id: 'finding', kind: 'finding', label: 'Cut-off gap', detail: 'F-03 · €192,000', x: 875, y: 126 },
    ],
    links: [
      { from: 'receipts', to: 'invoices', label: 'exact match' },
      { from: 'invoices', to: 'posting', missing: true, label: 'no join' },
      { from: 'posting', to: 'finding', missing: true },
      { from: 'accrual', to: 'finding', missing: true, label: 'different refs' },
    ],
  },
  'F-04': {
    summary: 'One user posts four same-day payments under the approval threshold.',
    signal: 'The grouped payment has no second-approval edge.',
    nodes: [
      { id: 'u11', kind: 'user', label: 'MV-U11', detail: 'Book + payment rights', x: 85, y: 92, sourceId: 'permissions-u11' },
      { id: 'vendor', kind: 'vendor', label: 'Castor Papier', detail: 'Vendor 200007', x: 280, y: 92, sourceId: 'split-payments' },
      { id: 'payments', kind: 'payment', label: '4 payments', detail: 'Each below €10K', x: 485, y: 92, sourceId: 'split-payments' },
      { id: 'policy', kind: 'policy', label: '€10K policy', detail: 'Second approval', x: 485, y: 190, sourceId: 'audit-plan' },
      { id: 'approval', kind: 'missing', label: 'Second approver', detail: 'No grouped control', x: 690, y: 190 },
      { id: 'finding', kind: 'finding', label: 'Split payments', detail: 'F-04 · €39,040', x: 900, y: 126 },
    ],
    links: [
      { from: 'u11', to: 'vendor', label: 'posted' },
      { from: 'vendor', to: 'payments', label: 'same day' },
      { from: 'payments', to: 'finding' },
      { from: 'policy', to: 'approval', missing: true, label: 'requires' },
      { from: 'approval', to: 'finding', missing: true },
    ],
  },
}

function customGraphDefinition(reviewCase: ReviewCase): GraphDefinition {
  const visibleSources = reviewCase.sources.slice(0, 3)
  const sourceNodes = visibleSources.map((source, index): GraphNode => ({
    id: `source-${index}`,
    kind: 'document',
    label: source.name,
    detail: source.location,
    x: 315 + index * 205,
    y: index === 1 ? 180 : 82,
    sourceId: source.id,
  }))

  return {
    summary: reviewCase.explanation,
    signal: `${reviewCase.sources.length} linked passage${reviewCase.sources.length === 1 ? '' : 's'}.`,
    nodes: [
      { id: 'case', kind: 'entity', label: reviewCase.category, detail: 'Added case', x: 90, y: 126 },
      ...sourceNodes,
      { id: 'finding', kind: 'finding', label: reviewCase.title, detail: `${reviewCase.id} · ${reviewCase.amount}`, x: 910, y: 126 },
    ],
    links: sourceNodes.flatMap((node) => [
      { from: 'case', to: node.id },
      { from: node.id, to: 'finding' },
    ]),
  }
}

function App() {
  const editor = usePlateEditor({
    plugins: [BoldPlugin, ItalicPlugin, UnderlinePlugin, CitationPlugin],
    value: reportDocumentValue,
  })
  const [rightTab, setRightTab] = useState<ReviewTab>('review')
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth > 800)
  const [expandedCase, setExpandedCase] = useState('F-01')
  const [activeCaseId, setActiveCaseId] = useState('F-01')
  const [customCases, setCustomCases] = useState<ReviewCase[]>([])
  const [sourceWindows, setSourceWindows] = useState<OpenSourceWindow[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [commentQuote, setCommentQuote] = useState('')
  const [commentDraft, setCommentDraft] = useState('')
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [addCaseOpen, setAddCaseOpen] = useState(false)
  const [toast, setToast] = useState('')

  const reviewCases: ReviewCase[] = [...findings, ...customCases]
  const activeCase = reviewCases.find((item) => item.id === activeCaseId) ?? reviewCases[0]

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
      text: commentDraft.trim(),
      quote: commentQuote || undefined,
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

  const openCaseSources = (reviewCase: ReviewCase) => {
    reviewCase.sources.forEach((source) => openSourceWindow(source))
    notify(`${reviewCase.sources.length} linked passage${reviewCase.sources.length === 1 ? '' : 's'} opened`)
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

  const selectCase = (caseId: string) => {
    setActiveCaseId(caseId)
    setExpandedCase(caseId)
  }

  const saveCase = (draft: CaseDraft) => {
    const selectedSources = draft.sourceIds
      .map((sourceId) => sourceById.get(sourceId))
      .filter((source): source is Source => Boolean(source))
    const amount = /^[€$£]/.test(draft.amount.trim()) ? draft.amount.trim() : `€${draft.amount.trim()}`
    const id = `C-${String(customCases.length + 1).padStart(2, '0')}`
    const addedCase: ReviewCase = {
      id,
      category: draft.category,
      severity: 'High',
      title: draft.title.trim(),
      amount,
      explanation: draft.notes.trim(),
      calculation: `${selectedSources.length} linked passage${selectedSources.length === 1 ? '' : 's'}`,
      sources: selectedSources,
      added: true,
    }

    setCustomCases((items) => [...items, addedCase])
    setActiveCaseId(id)
    setExpandedCase(id)
    setRightTab('review')
    setPanelOpen(true)
    setAddCaseOpen(false)
    notify(`${id} added to review`)
  }

  return (
    <div className="simple-app graph-app">
      <header className="simple-header">
        <div className="simple-brand"><span className="simple-logo">t</span><strong>trace</strong></div>
        <div className="document-title">
          <strong>Muster Verpackungen · Evidence graph</strong>
          <span>Saved</span>
        </div>
        <div className="header-actions">
          <button type="button" className="quiet-button" onClick={() => notify('Share link copied')}><Users size={15} /> Share</button>
          <button
            type="button"
            className="analyze-button"
            onClick={() => {
              setPanelOpen(true)
              setRightTab('review')
              notify('Checks current')
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
        <button type="button" className="mobile-findings-button" onClick={() => { setPanelOpen(true); setRightTab('review') }}><ShieldCheck size={15} /> Review</button>
        <span className="toolbar-spacer" />
        <button type="button" title="Search" onClick={() => notify('Search ready')}><Search size={16} /></button>
        <button type="button" title="More" onClick={() => notify('Document options')}><MoreHorizontal size={17} /></button>
      </div>

      <main className="workspace">
        <section className="document-workspace">
          <div className="document-status-bar">
            <span><FileCheck2 size={14} /> 35 files</span>
            <span>27,190 records</span>
            <span>{reviewCases.length} review cases</span>
            <button type="button" onClick={() => notify('14 report citations traced')}><Link2 size={13} /> 14 citations</button>
            <button type="button" onClick={() => { setPanelOpen(true); setRightTab('checks') }}><CheckCircle2 size={13} /> 3 checks cleared</button>
          </div>

          <EvidenceGraph
            activeCase={activeCase}
            reviewCases={reviewCases}
            onAddCase={() => setAddCaseOpen(true)}
            onOpenAll={() => openCaseSources(activeCase)}
            onSelect={selectCase}
            onSource={openSourceWindow}
          />

          <EvidenceDock
            activeCase={activeCase}
            openWindows={sourceWindows}
            onSource={openSourceWindow}
          />

          <div className="paper-wrap citation-paper-wrap">
            <div className="paper-stack">
              <article className="paper citation-report-paper">
                <div className="document-mode"><span><Check size={12} /> Editable working paper</span><small>Saved</small></div>
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
            <button type="button" className={rightTab === 'review' ? 'active' : ''} onClick={() => setRightTab('review')}>Review <span>{reviewCases.length}</span></button>
            <button type="button" className={rightTab === 'checks' ? 'active' : ''} onClick={() => setRightTab('checks')}>Cleared <span>3</span></button>
            <button type="button" className={rightTab === 'comments' ? 'active' : ''} onClick={() => setRightTab('comments')}>Comments <span>{comments.length}</span></button>
            <button type="button" className="close-panel" onClick={() => setPanelOpen(false)} aria-label="Close panel"><X size={16} /></button>
          </div>

          {rightTab === 'review' && (
            <ReviewQueue
              activeCaseId={activeCaseId}
              expandedCase={expandedCase}
              reviewCases={reviewCases}
              onAddCase={() => setAddCaseOpen(true)}
              onExpanded={setExpandedCase}
              onOpenAll={openCaseSources}
              onSelect={selectCase}
              onSource={openSourceWindow}
            />
          )}

          {rightTab === 'checks' && <ClearedChecks onSource={openSourceWindow} />}

          {rightTab === 'comments' && (
            <div className="comments-panel">
              {showCommentBox && (
                <div className="comment-composer">
                  {commentQuote && <blockquote>{commentQuote}</blockquote>}
                  <textarea autoFocus value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Add your comment…" />
                  <div><button type="button" onClick={() => setShowCommentBox(false)}>Cancel</button><button type="button" onClick={addComment}>Comment</button></div>
                </div>
              )}
              {comments.length === 0 && !showCommentBox && (
                <div className="empty-comments"><MessageSquarePlus size={18} /><strong>No comments yet</strong><span>Select report text, then add a comment.</span></div>
              )}
              {comments.map((comment) => (
                <article className="comment" key={comment.id}>
                  <span className="comment-avatar">You</span>
                  <div>
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

      {addCaseOpen && <AddCaseDialog onClose={() => setAddCaseOpen(false)} onSave={saveCase} sourceOptions={caseSourceOptions} />}
      {toast && <div className="toast"><Check size={15} /> {toast}</div>}
    </div>
  )
}

type EvidenceGraphProps = {
  activeCase: ReviewCase
  reviewCases: ReviewCase[]
  onAddCase: () => void
  onOpenAll: () => void
  onSelect: (caseId: string) => void
  onSource: (source: Source) => void
}

function EvidenceGraph({ activeCase, reviewCases, onAddCase, onOpenAll, onSelect, onSource }: EvidenceGraphProps) {
  const definition = graphDefinitions[activeCase.id] ?? customGraphDefinition(activeCase)
  const nodeById = new Map(definition.nodes.map((node) => [node.id, node]))

  return (
    <section className="method-widget" aria-label="Evidence graph method">
      <div className="method-header">
        <div>
          <span className="method-kicker"><Network size={13} /> METHOD</span>
          <h2>Evidence graph</h2>
          <p>Follow connected records. Test the edges that should exist.</p>
        </div>
        <div className="method-actions">
          <button type="button" className="open-linked-button" onClick={onOpenAll}><Layers3 size={14} /> Open linked</button>
          <button type="button" className="add-case-button" onClick={onAddCase}><Plus size={14} /> Add case</button>
        </div>
      </div>

      <div className="method-steps" aria-label="Graph method steps">
        <span><b>1</b> Resolve entities</span><i />
        <span><b>2</b> Join records</span><i />
        <span><b>3</b> Test missing edges</span><i />
        <span><b>4</b> Review finding</span>
      </div>

      <div className="path-tabs" role="tablist" aria-label="Finding paths">
        {reviewCases.map((reviewCase) => (
          <button
            type="button"
            role="tab"
            aria-selected={reviewCase.id === activeCase.id}
            className={reviewCase.id === activeCase.id ? 'active' : ''}
            key={reviewCase.id}
            onClick={() => onSelect(reviewCase.id)}
          >
            <span className={`bundle-dot ${reviewCase.severity.toLowerCase()}`} />
            <span><small>{reviewCase.added ? 'ADDED' : reviewCase.category}</small><strong>{reviewCase.id}</strong></span>
            <b>{reviewCase.amount}</b>
          </button>
        ))}
      </div>

      <div className="graph-stage">
        <svg className="graph-links" viewBox="0 0 1000 250" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <marker id="graph-arrow" markerHeight="7" markerWidth="7" orient="auto" refX="6" refY="3.5">
              <path d="M0,0 L7,3.5 L0,7 Z" />
            </marker>
            <marker id="graph-arrow-missing" markerHeight="7" markerWidth="7" orient="auto" refX="6" refY="3.5">
              <path d="M0,0 L7,3.5 L0,7 Z" />
            </marker>
          </defs>
          {definition.links.map((link, index) => {
            const from = nodeById.get(link.from)
            const to = nodeById.get(link.to)
            if (!from || !to) return null
            const midX = (from.x + to.x) / 2
            const midY = (from.y + to.y) / 2 - 7
            return (
              <g className={link.missing ? 'missing-link' : ''} key={`${link.from}-${link.to}-${index}`}>
                <line x1={from.x} x2={to.x} y1={from.y} y2={to.y} markerEnd={link.missing ? 'url(#graph-arrow-missing)' : 'url(#graph-arrow)'} />
                {link.label && <text x={midX} y={midY}>{link.label}</text>}
              </g>
            )
          })}
        </svg>

        {definition.nodes.map((node) => {
          const source = node.sourceId ? sourceById.get(node.sourceId) : undefined
          return (
            <button
              type="button"
              className={`graph-node node-${node.kind} ${source ? 'clickable' : ''}`}
              style={{ left: `${node.x / 10}%`, top: `${node.y}px` }}
              key={node.id}
              onClick={() => source && onSource(source)}
              aria-label={source ? `${node.label}: open ${source.name}` : node.label}
            >
              <span className="node-icon"><GraphNodeIcon kind={node.kind} /></span>
              <span><strong>{node.label}</strong><small>{node.detail}</small></span>
            </button>
          )
        })}
      </div>

      <div className="graph-caption">
        <span><GitBranch size={13} /><strong>{activeCase.id}</strong> {definition.summary}</span>
        <span className="missing-caption"><Unlink2 size={13} /> {definition.signal}</span>
      </div>
    </section>
  )
}

function GraphNodeIcon({ kind }: { kind: GraphNodeKind }) {
  if (kind === 'user') return <UserRound size={15} />
  if (kind === 'vendor') return <Building2 size={15} />
  if (kind === 'document') return <FileText size={15} />
  if (kind === 'payment') return <Banknote size={15} />
  if (kind === 'policy') return <ShieldCheck size={15} />
  if (kind === 'missing') return <Unlink2 size={15} />
  if (kind === 'finding') return <ShieldAlert size={15} />
  return <Layers3 size={15} />
}

type EvidenceDockProps = {
  activeCase: ReviewCase
  openWindows: OpenSourceWindow[]
  onSource: (source: Source) => void
}

function EvidenceDock({ activeCase, openWindows, onSource }: EvidenceDockProps) {
  return (
    <section className="evidence-dock linked-evidence-dock">
      <div className="dock-heading">
        <span><Link2 size={13} /> Linked passages · {activeCase.id}</span>
        <small>click a passage · drag windows to compare</small>
      </div>
      <div className="bundle-sources">
        {activeCase.sources.map((source) => {
          const number = citationNumberById[source.id]
          return (
            <button
              type="button"
              key={source.id}
              className={openWindows.some((item) => item.source.id === source.id) ? 'open' : ''}
              onClick={() => onSource(source)}
            >
              <span className="dock-file-icon">{source.type === 'pdf' ? <FileText size={14} /> : <FileSpreadsheet size={14} />}</span>
              <span><strong>{number ? `[${number}] ` : ''}{source.name}</strong><small>{source.location} · {source.value}</small></span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

type ReviewQueueProps = {
  activeCaseId: string
  expandedCase: string
  reviewCases: ReviewCase[]
  onAddCase: () => void
  onExpanded: (caseId: string) => void
  onOpenAll: (reviewCase: ReviewCase) => void
  onSelect: (caseId: string) => void
  onSource: (source: Source) => void
}

function ReviewQueue({ activeCaseId, expandedCase, reviewCases, onAddCase, onExpanded, onOpenAll, onSelect, onSource }: ReviewQueueProps) {
  return (
    <div className="findings-panel">
      <div className="panel-intro graph-panel-intro">
        <Network size={16} />
        <div><strong>{reviewCases.length} review cases</strong><span>Paths backed by linked passages</span></div>
        <button type="button" onClick={onAddCase}><Plus size={13} /> Add</button>
      </div>
      {reviewCases.map((reviewCase) => {
        const expanded = reviewCase.id === expandedCase
        return (
          <article className={`finding-card ${expanded ? 'expanded' : ''} ${activeCaseId === reviewCase.id ? 'selected' : ''}`} key={reviewCase.id}>
            <button
              type="button"
              className="finding-summary"
              onClick={() => {
                onExpanded(expanded ? '' : reviewCase.id)
                onSelect(reviewCase.id)
              }}
            >
              <span className={`risk-dot ${reviewCase.severity.toLowerCase()}`} />
              <span className="finding-summary-copy"><small>{reviewCase.added ? 'ADDED CASE' : reviewCase.category} · {reviewCase.id}</small><strong>{reviewCase.title}</strong></span>
              <strong className="finding-amount">{reviewCase.amount}</strong>
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expanded && (
              <div className="finding-body">
                <p>{reviewCase.explanation}</p>
                <div className="case-actions">
                  <span><Link2 size={12} /> {reviewCase.sources.length} passages</span>
                  <button type="button" onClick={() => onOpenAll(reviewCase)}><Layers3 size={13} /> Open linked</button>
                </div>
                <div className="calculation"><small>{reviewCase.added ? 'LINKS' : 'CALCULATION'}</small><strong>{reviewCase.calculation}</strong></div>
                <div className="source-label">SOURCES</div>
                <div className="source-list">
                  {reviewCase.sources.map((source) => {
                    const number = citationNumberById[source.id]
                    return (
                      <button type="button" key={source.id} onClick={() => onSource(source)}>
                        <span className="source-number">{number ? `[${number}]` : <FileText size={13} />}</span>
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
    </div>
  )
}

function ClearedChecks({ onSource }: { onSource: (source: Source) => void }) {
  return (
    <div className="cleared-panel">
      <div className="panel-intro cleared-intro">
        <CheckCircle2 size={16} />
        <div><strong>3 checks cleared</strong><span>No exception in these joins</span></div>
      </div>
      {clearedChecks.map((check) => (
        <button type="button" className="cleared-card" key={check.label} onClick={() => onSource(check.source)}>
          <CheckCircle2 size={18} />
          <span><strong>{check.label}</strong><small>{check.source.name} · {check.source.location}</small></span>
          <b>{check.detail}</b>
          <ChevronRight size={14} />
        </button>
      ))}
    </div>
  )
}

type AddCaseDialogProps = {
  onClose: () => void
  onSave: (draft: CaseDraft) => void
  sourceOptions: Source[]
}

function AddCaseDialog({ onClose, onSave, sourceOptions }: AddCaseDialogProps) {
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
      setError('Select at least one source passage.')
      return
    }
    onSave({ title, category, amount, notes, sourceIds: selectedSourceIds })
  }

  return (
    <div className="case-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="case-dialog" role="dialog" aria-modal="true" aria-labelledby="add-case-title">
        <header>
          <div><span><GitBranch size={14} /> NEW PATH</span><h2 id="add-case-title">Add case</h2></div>
          <button type="button" onClick={onClose} aria-label="Close add case"><X size={18} /></button>
        </header>
        <form onSubmit={submit}>
          <div className="case-fields">
            <label>
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs review?" autoFocus />
            </label>
            <label>
              <span>Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value as Finding['category'])}>
                <option value="FRAUD RISK">Fraud risk</option>
                <option value="CUT-OFF">Cut-off</option>
                <option value="CLASSIFICATION">Classification</option>
                <option value="CONTROL">Control</option>
              </select>
            </label>
            <label>
              <span>Amount</span>
              <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="125,000" inputMode="decimal" />
            </label>
            <label className="notes-field">
              <span>Notes</span>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="State the connection or missing edge." />
            </label>
          </div>

          <fieldset className="passage-picker">
            <legend>Source passages <span>{selectedSourceIds.length} selected</span></legend>
            <div className="source-search"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search files or passages" /></div>
            <div className="passage-options">
              {filteredSources.map((source) => (
                <label className={selectedSourceIds.includes(source.id) ? 'selected' : ''} key={source.id}>
                  <input type="checkbox" checked={selectedSourceIds.includes(source.id)} onChange={() => toggleSource(source.id)} />
                  <span className="passage-check"><Check size={12} /></span>
                  <span><strong>{source.name}</strong><small>{source.location}</small><em>{source.passage}</em></span>
                </label>
              ))}
              {filteredSources.length === 0 && <div className="no-source-results">No matching passage.</div>}
            </div>
          </fieldset>

          {error && <div className="case-error"><ShieldAlert size={13} /> {error}</div>}
          <footer>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit"><Plus size={14} /> Add to graph</button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default App
