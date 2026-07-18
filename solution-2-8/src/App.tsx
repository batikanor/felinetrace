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
  ArrowRight,
  Bold,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  FileCheck2,
  FileJson2,
  FileSpreadsheet,
  FileText,
  Italic,
  Link2,
  LockKeyhole,
  MessageSquarePlus,
  Monitor,
  MoreHorizontal,
  Play,
  Search,
  Server,
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
import { AddCaseModal } from './AddCaseModal'
import type { NewCaseInput } from './AddCaseModal'
import { ReviewerPanel } from './ReviewerPanel'
import type { AuditEvent } from './ReviewerPanel'
import { TraceDrawer } from './TraceDrawer'
import { initialReviewTasks } from './reviewData'
import type { ReviewTask } from './reviewData'

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

const initialAuditLog: AuditEvent[] = [
  { id: 2, time: 'Now', text: 'T-01 output validated against review-result.schema.json' },
  { id: 1, time: 'Now', text: 'Evidence packet prepared · 14 cited passages' },
]

function App() {
  const editor = usePlateEditor({
    plugins: [BoldPlugin, ItalicPlugin, UnderlinePlugin, CitationPlugin],
    value: reportDocumentValue,
  })
  const [rightTab, setRightTab] = useState<'review' | 'findings' | 'comments'>('review')
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth > 800)
  const [expandedFinding, setExpandedFinding] = useState('F-01')
  const [activeBundle, setActiveBundle] = useState('F-01')
  const [sourceWindows, setSourceWindows] = useState<OpenSourceWindow[]>([])
  const [comments, setComments] = useState(startingComments)
  const [commentQuote, setCommentQuote] = useState('')
  const [commentDraft, setCommentDraft] = useState('')
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [reviewTasks, setReviewTasks] = useState(initialReviewTasks)
  const [selectedTaskId, setSelectedTaskId] = useState('T-01')
  const [traceTaskId, setTraceTaskId] = useState<string | null>(null)
  const [leastPrivilege, setLeastPrivilege] = useState(true)
  const [auditLog, setAuditLog] = useState(initialAuditLog)
  const [addCaseOpen, setAddCaseOpen] = useState(false)
  const [toast, setToast] = useState('')

  const activeFinding = findings.find((finding) => finding.id === activeBundle) ?? findings[0]
  const selectedTask = reviewTasks.find((task) => task.id === selectedTaskId) ?? reviewTasks[0]
  const traceTask = traceTaskId ? reviewTasks.find((task) => task.id === traceTaskId) : undefined

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const addAuditEvent = (text: string) => {
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    setAuditLog((items) => [{ id: Date.now() + Math.random(), time, text }, ...items])
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
      const topZ = Math.max(90, ...windows.map((item) => item.z)) + 1
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
      const topZ = Math.max(90, ...windows.map((item) => item.z)) + 1
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

  const selectReviewTask = (taskId: string) => {
    setSelectedTaskId(taskId)
    setRightTab('review')
    setPanelOpen(true)
  }

  const runReviewTask = (taskId: string) => {
    const task = reviewTasks.find((item) => item.id === taskId)
    if (!task || task.status === 'running') return
    setSelectedTaskId(taskId)
    setRightTab('review')
    setPanelOpen(true)
    setReviewTasks((items) => items.map((item) => item.id === taskId ? { ...item, status: 'running' } : item))
    addAuditEvent(`${taskId} sample replay started · ${leastPrivilege ? 'read-only' : 'workspace-write'}`)
    window.setTimeout(() => {
      setReviewTasks((items) => items.map((item) => item.id === taskId ? { ...item, status: 'complete' } : item))
      addAuditEvent(`${taskId} output validated · approval pending`)
      notify(`${taskId} ready for review`)
    }, 850)
  }

  const acceptReviewPatch = (taskId: string) => {
    const task = reviewTasks.find((item) => item.id === taskId)
    if (!task || task.status !== 'complete') return

    const citedChildren = task.sources.flatMap((source) => {
      const number = citationNumberById[source.id]
      if (!number) return []
      const citation: CitationNode = {
        type: 'citation',
        number,
        sourceId: source.id,
        children: [{ text: '' }],
      }
      return [{ text: ' ' }, citation]
    })
    const patchNodes = [
      { type: 'p', children: [{ text: `Reviewer patch · ${task.title}`, bold: true }] },
      { type: 'p', children: [{ text: task.result.patchText }, ...citedChildren] },
    ] as unknown as Value

    editor.tf.insertNodes(patchNodes, { at: [editor.children.length] })
    setReviewTasks((items) => items.map((item) => item.id === taskId ? { ...item, status: 'accepted' } : item))
    addAuditEvent(`${taskId} patch accepted · inserted into report`)
    notify('Patch inserted into report')
  }

  const rejectReviewPatch = (taskId: string) => {
    const task = reviewTasks.find((item) => item.id === taskId)
    if (!task || task.status !== 'complete') return
    setReviewTasks((items) => items.map((item) => item.id === taskId ? { ...item, status: 'rejected' } : item))
    addAuditEvent(`${taskId} patch rejected`)
    notify('Patch rejected')
  }

  const inspectTrace = (taskId: string) => {
    setTraceTaskId(taskId)
    addAuditEvent(`${taskId} trace inspected`)
  }

  const createCase = (input: NewCaseInput) => {
    const sequence = reviewTasks.filter((task) => task.id.startsWith('C-')).length + 1
    const taskId = `C-${String(sequence).padStart(2, '0')}`
    const amountLabel = input.amountEur ? input.amountEur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) : 'No amount'
    const task: ReviewTask = {
      id: taskId,
      title: input.title,
      scope: `Manual case · ${amountLabel}`,
      status: 'queued',
      sources: input.sources,
      result: {
        verdict: 'draft_ready',
        amountEur: input.amountEur,
        summary: input.note || `${input.sources.length} linked dossier sources are ready for review.`,
        patchText: `${input.title}. ${input.note || 'Review the linked evidence and document the conclusion.'}`,
        target: 'report.appendix',
        commands: [`rg -n "${input.sources[0].id}" evidence/manifest.json`],
        trace: ['Evidence manifest sealed', 'Read-only sandbox started', `${input.sources.length} linked sources inspected`, 'Output schema validated'],
      },
    }
    setReviewTasks((items) => [...items, task])
    setSelectedTaskId(taskId)
    setRightTab('review')
    setPanelOpen(true)
    setAddCaseOpen(false)
    addAuditEvent(`${taskId} added · ${input.sources.length} linked sources`)
    notify('Case added to review queue')
  }

  return (
    <div className="simple-app">
      <header className="simple-header">
        <div className="simple-brand"><span className="simple-logo">t</span><strong>trace</strong></div>
        <div className="document-title">
          <strong>Muster Verpackungen · Local Codex reviewer</strong>
          <span>Saved</span>
        </div>
        <div className="header-actions">
          <div className="collaborators"><span>AH</span><span>JW</span></div>
          <button type="button" className="quiet-button" onClick={() => notify('Share link copied')}><Users size={15} /> Share</button>
          <button type="button" className="analyze-button" onClick={() => runReviewTask(selectedTask.id)} disabled={selectedTask.status === 'running'}>
            <Play size={13} /> {selectedTask.status === 'running' ? 'Running…' : 'Run selected'}
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
        <button type="button" className="mobile-findings-button" onClick={() => { setPanelOpen(true); setRightTab('review') }}><ShieldCheck size={15} /> {reviewTasks.length} tasks</button>
        <span className="toolbar-spacer" />
        <button type="button" title="Search" onClick={() => notify('Search ready')}><Search size={16} /></button>
        <button type="button" title="More" onClick={() => notify('Document options')}><MoreHorizontal size={17} /></button>
      </div>

      <main className="workspace codex-workspace">
        <section className="document-workspace">
          <div className="document-status-bar">
            <span><FileCheck2 size={14} /> 35 files</span>
            <span>27,190 records</span>
            <span>4 findings</span>
            <button type="button" onClick={() => notify('14 cited passages traced')}><Link2 size={13} /> 14 citations</button>
          </div>

          <section className="codex-method" aria-label="Local Codex review method">
            <header className="method-header">
              <div>
                <span className="method-badge"><Code2 size={12} /> Local Codex reviewer</span>
                <strong>Evidence in. Cited patch out.</strong>
              </div>
              <span className="prototype-note">Prototype controls replay saved runs</span>
            </header>
            <div className="method-steps">
              {[
                ['01', 'Prepare evidence packet', 'Allowlisted sources'],
                ['02', 'Structured read-only run', 'Ephemeral sandbox'],
                ['03', 'Inspect sources + commands', 'Full trace'],
                ['04', 'Accept / reject patch', 'Into the report'],
              ].map(([number, title, detail], index) => (
                <div className="method-step" key={number}>
                  <span>{number}</span>
                  <div><strong>{title}</strong><small>{detail}</small></div>
                  {index < 3 && <ArrowRight size={13} />}
                </div>
              ))}
            </div>
            <div className="runtime-strip">
              <div className="runtime-path">
                <span><Monitor size={12} /> Browser UI</span><ArrowRight size={12} />
                <span><Server size={12} /> localhost sidecar</span><ArrowRight size={12} />
                <span><Code2 size={12} /> SDK · app-server · codex exec</span>
              </div>
              <div className="runtime-copy">
                <span><LockKeyhole size={11} /> Credentials stay in the local runtime. Browser gets events + validated JSON.</span>
                <span><FileJson2 size={11} /> Saved ChatGPT login uses its Codex plan/credits, not API billing—and consumes that allowance.</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={leastPrivilege}
                className={`privilege-toggle ${leastPrivilege ? 'on' : ''}`}
                onClick={() => {
                  const next = !leastPrivilege
                  setLeastPrivilege(next)
                  addAuditEvent(`Least privilege ${next ? 'enabled' : 'disabled'} · ${next ? 'read-only' : 'workspace-write'}`)
                }}
              >
                <span className="toggle-track"><span /></span>
                <span><strong>Least privilege</strong><small>{leastPrivilege ? 'read-only · ephemeral · allowlist' : 'workspace-write · approval gate'}</small></span>
              </button>
            </div>
          </section>

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
                <div className="document-mode"><span><Check size={12} /> Working paper</span><small>Editable · Saved</small></div>
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

        <aside className={`review-panel codex-review-panel ${panelOpen ? 'panel-open' : ''}`}>
          <div className="panel-tabs codex-panel-tabs">
            <button type="button" className={rightTab === 'review' ? 'active' : ''} onClick={() => setRightTab('review')}>Review <span>{reviewTasks.length}</span></button>
            <button type="button" className={rightTab === 'findings' ? 'active' : ''} onClick={() => setRightTab('findings')}>Findings <span>4</span></button>
            <button type="button" className={rightTab === 'comments' ? 'active' : ''} onClick={() => setRightTab('comments')}>Comments <span>{comments.length}</span></button>
            <button type="button" className="close-panel" onClick={() => setPanelOpen(false)} aria-label="Close panel"><X size={16} /></button>
          </div>

          {rightTab === 'review' ? (
            <ReviewerPanel
              tasks={reviewTasks}
              selectedTask={selectedTask}
              auditLog={auditLog}
              citationNumberById={citationNumberById}
              onSelect={selectReviewTask}
              onRun={runReviewTask}
              onTrace={inspectTrace}
              onAccept={acceptReviewPatch}
              onReject={rejectReviewPatch}
              onAddCase={() => setAddCaseOpen(true)}
              onSource={openSourceWindow}
            />
          ) : rightTab === 'findings' ? (
            <FindingsPanel
              expandedFinding={expandedFinding}
              onExpanded={setExpandedFinding}
              onSource={openSourceWindow}
              onReview={() => { setRightTab('review'); notify('Finding ready for review') }}
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
      {traceTask && <TraceDrawer task={traceTask} citationNumberById={citationNumberById} onClose={() => setTraceTaskId(null)} onSource={openSourceWindow} />}
      {addCaseOpen && <AddCaseModal sources={citationSources} onClose={() => setAddCaseOpen(false)} onCreate={createCase} />}
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
