import { useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { Value } from 'platejs'
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react'
import { Plate, PlateContent, usePlateEditor } from 'platejs/react'
import {
  ArrowLeft,
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
  RefreshCw,
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
  const [rightTab, setRightTab] = useState<'findings' | 'comments'>('findings')
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth > 800)
  const [expandedFinding, setExpandedFinding] = useState('F-01')
  const [activeBundle, setActiveBundle] = useState('F-01')
  const [sourceWindows, setSourceWindows] = useState<OpenSourceWindow[]>([])
  const [comments, setComments] = useState(startingComments)
  const [commentQuote, setCommentQuote] = useState('')
  const [commentDraft, setCommentDraft] = useState('')
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [toast, setToast] = useState('')

  const activeFinding = findings.find((finding) => finding.id === activeBundle) ?? findings[0]

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

  return (
    <div className="simple-app">
      <header className="simple-header">
        <div className="simple-brand"><span className="simple-logo">t</span><strong>trace</strong></div>
        <div className="document-title">
          <strong>Muster Verpackungen · Audit memo</strong>
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
              setRightTab('findings')
              notify('4 findings refreshed')
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
        <button type="button" className="mobile-findings-button" onClick={() => { setPanelOpen(true); setRightTab('findings') }}><ShieldCheck size={15} /> 4 findings</button>
        <span className="toolbar-spacer" />
        <button type="button" title="Search" onClick={() => notify('Search ready')}><Search size={16} /></button>
        <button type="button" title="More" onClick={() => notify('Document options')}><MoreHorizontal size={17} /></button>
      </div>

      <main className="workspace">
        <section className="document-workspace">
          <div className="document-status-bar">
            <span><FileCheck2 size={14} /> 35 files</span>
            <span>27,190 records</span>
            <span>4 findings</span>
            <button type="button" onClick={() => notify('14 cited passages traced')}><Link2 size={13} /> 14 citations</button>
          </div>

          <EvidenceDock
            activeFinding={activeFinding}
            activeBundle={activeBundle}
            openWindows={sourceWindows}
            onBundle={setActiveBundle}
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
            <button type="button" className={rightTab === 'findings' ? 'active' : ''} onClick={() => setRightTab('findings')}>Findings <span>4</span></button>
            <button type="button" className={rightTab === 'comments' ? 'active' : ''} onClick={() => setRightTab('comments')}>Comments <span>{comments.length}</span></button>
            <button type="button" className="close-panel" onClick={() => setPanelOpen(false)} aria-label="Close panel"><X size={16} /></button>
          </div>

          {rightTab === 'findings' ? (
            <FindingsPanel
              expandedFinding={expandedFinding}
              onExpanded={setExpandedFinding}
              onSource={openSourceWindow}
              onReview={() => notify('Finding marked for review')}
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
      {toast && <div className="toast"><Check size={15} /> {toast}</div>}
    </div>
  )
}

type EvidenceDockProps = {
  activeFinding: Finding
  activeBundle: string
  openWindows: OpenSourceWindow[]
  onBundle: (findingId: string) => void
  onSource: (source: Source) => void
}

function EvidenceDock({ activeFinding, activeBundle, openWindows, onBundle, onSource }: EvidenceDockProps) {
  return (
    <section className="evidence-dock">
      <div className="dock-heading">
        <span><Link2 size={13} /> Evidence</span>
        <small>35 files · click a source · drag to compare</small>
      </div>
      <div className="evidence-bundles">
        {findings.map((finding) => {
          const numbers = finding.sources.map((source) => citationNumberById[source.id])
          return (
            <button
              type="button"
              key={finding.id}
              className={activeBundle === finding.id ? 'active' : ''}
              onClick={() => onBundle(finding.id)}
            >
              <span className={`bundle-dot ${finding.severity.toLowerCase()}`} />
              <span><small>[{numbers[0]}–{numbers[numbers.length - 1]}] · {finding.category}</small><strong>{finding.title}</strong></span>
              <b>{finding.amount}</b>
            </button>
          )
        })}
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
  expandedFinding: string
  onExpanded: (findingId: string) => void
  onSource: (source: Source) => void
  onReview: () => void
}

function FindingsPanel({ expandedFinding, onExpanded, onSource, onReview }: FindingsPanelProps) {
  return (
    <div className="findings-panel">
      <div className="panel-intro">
        <ShieldCheck size={16} />
        <div><strong>4 findings</strong><span>14 passages across 35 files</span></div>
      </div>
      {findings.map((finding) => {
        const expanded = finding.id === expandedFinding
        return (
          <article className={`finding-card ${expanded ? 'expanded' : ''}`} key={finding.id}>
            <button type="button" className="finding-summary" onClick={() => onExpanded(expanded ? '' : finding.id)}>
              <span className={`risk-dot ${finding.severity.toLowerCase()}`} />
              <span className="finding-summary-copy"><small>{finding.id} · {finding.category}</small><strong>{finding.title}</strong></span>
              <strong className="finding-amount">{finding.amount}</strong>
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {expanded && (
              <div className="finding-body">
                <p>{finding.explanation}</p>
                <div className="confidence-row"><span><ShieldCheck size={12} /> {finding.sources.length} passages</span><button type="button" onClick={onReview}><Check size={13} /> Review</button></div>
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

export default App
