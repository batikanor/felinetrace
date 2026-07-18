import { useState } from 'react'
import type { MouseEvent, PointerEvent as ReactPointerEvent } from 'react'
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
  CircleCheck,
  FileSpreadsheet,
  FileText,
  Highlighter,
  Italic,
  Link2,
  MessageSquarePlus,
  MoreHorizontal,
  Move,
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
} from './caseData'
import type { Finding, Source } from './caseData'

type Comment = {
  id: number
  text: string
  quote?: string
}

type OpenSourceWindow = {
  source: Source
  x: number
  y: number
  z: number
}

type ReviewTab = 'open' | 'passed' | 'comments'

const findingPositions: Record<string, number> = {
  'F-01': 286,
  'F-02': 514,
  'F-03': 742,
  'F-04': 970,
}

function App() {
  const editor = usePlateEditor({
    plugins: [BoldPlugin, ItalicPlugin, UnderlinePlugin],
    value: reportValue,
  })
  const [reviewTab, setReviewTab] = useState<ReviewTab>('open')
  const [activeFinding, setActiveFinding] = useState<string>('F-01')
  const [expandedFinding, setExpandedFinding] = useState('F-01')
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth > 800)
  const [sourceWindows, setSourceWindows] = useState<OpenSourceWindow[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [commentQuote, setCommentQuote] = useState('')
  const [commentDraft, setCommentDraft] = useState('')
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [toast, setToast] = useState('')

  const selectedFinding = findings.find((finding) => finding.id === activeFinding)

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const runToolbarAction = (event: MouseEvent<HTMLButtonElement>, action: () => void) => {
    event.preventDefault()
    action()
  }

  const focusFinding = (findingId: string) => {
    setActiveFinding(findingId)
    setExpandedFinding(findingId)
    setReviewTab('open')
  }

  const startComment = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const selection = window.getSelection()?.toString().trim() ?? ''
    setCommentQuote(selection)
    setShowCommentBox(true)
    setReviewTab('comments')
    setPanelOpen(true)
  }

  const addComment = () => {
    if (!commentDraft.trim()) return
    setComments((items) => [
      ...items,
      {
        id: Date.now(),
        text: commentDraft.trim(),
        quote: commentQuote || undefined,
      },
    ])
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
        return windows.map((item) =>
          item.source.id === source.id ? { ...item, z: topZ } : item,
        )
      }

      const offset = (windows.length % 4) * 24
      return [
        ...windows,
        {
          source,
          x: Math.max(12, window.innerWidth - 430 - offset),
          y: 126 + offset,
          z: topZ,
        },
      ]
    })
  }

  const focusSourceWindow = (id: string) => {
    setSourceWindows((windows) => {
      const topZ = Math.max(50, ...windows.map((item) => item.z)) + 1
      return windows.map((item) =>
        item.source.id === id ? { ...item, z: topZ } : item,
      )
    })
  }

  const moveSourceWindow = (id: string, x: number, y: number) => {
    setSourceWindows((windows) =>
      windows.map((item) =>
        item.source.id === id ? { ...item, x, y } : item,
      ),
    )
  }

  return (
    <div className="review-app">
      <header className="app-header">
        <div className="brand"><span className="brand-mark">t</span><strong>trace</strong></div>
        <div className="document-title">
          <strong>Muster Verpackungen · FY 2025</strong>
          <span>Saved</span>
        </div>
        <div className="header-actions">
          <button className="quiet-button" onClick={() => notify('Share link copied')}><Users size={15} /> Share</button>
          <button className="review-button" onClick={() => { setPanelOpen(true); setReviewTab('open') }}><ShieldCheck size={15} /> Review findings</button>
        </div>
      </header>

      <div className="editor-toolbar">
        <button title="Back"><ArrowLeft size={16} /></button>
        <span className="toolbar-rule" />
        <button onMouseDown={(event) => runToolbarAction(event, () => editor.tf.bold.toggle())} title="Bold"><Bold size={16} /></button>
        <button onMouseDown={(event) => runToolbarAction(event, () => editor.tf.italic.toggle())} title="Italic"><Italic size={16} /></button>
        <button onMouseDown={(event) => runToolbarAction(event, () => editor.tf.underline.toggle())} title="Underline"><Underline size={16} /></button>
        <button title="Highlight"><Highlighter size={16} /></button>
        <span className="toolbar-rule" />
        <button onMouseDown={startComment} className="comment-toolbar-button"><MessageSquarePlus size={16} /> Add comment</button>
        <button className="mobile-review-button" onClick={() => { setPanelOpen(true); setReviewTab('open') }}><ShieldCheck size={15} /> Open 4</button>
        <span className="toolbar-spacer" />
        <button title="Search"><Search size={16} /></button>
        <button title="More"><MoreHorizontal size={17} /></button>
      </div>

      <main className="workspace">
        <section className="document-workspace">
          <div className="document-status-bar">
            <span><CheckCircle2 size={14} /> 35 files reviewed</span>
            <span className="status-divider">·</span>
            <strong>Open 4</strong>
            <span className="status-divider">·</span>
            <span>Checks passed 3</span>
            <button onClick={() => notify('Every report finding links to exact source rows')}><Link2 size={13} /> Evidence linked</button>
          </div>

          <div className="focus-bar">
            <span><Link2 size={13} /> Finding focus</span>
            <div>
              <button className={activeFinding === 'all' ? 'active' : ''} onClick={() => setActiveFinding('all')}>All</button>
              {findings.map((finding) => (
                <button
                  key={finding.id}
                  className={`${activeFinding === finding.id ? 'active' : ''} ${finding.severity.toLowerCase()}`}
                  onClick={() => focusFinding(finding.id)}
                >
                  <i /> {finding.id} <b>{finding.amount}</b>
                </button>
              ))}
            </div>
          </div>

          <div className="paper-wrap">
            <div className={`paper evidence-paper focus-${activeFinding.toLowerCase()}`}>
              <div className="editable-column">
                <div className="editable-label"><Check size={11} /> Editable report</div>
                <Plate editor={editor}>
                  <PlateContent className="report-editor" placeholder="Start writing your audit report…" />
                </Plate>
                {findings.map((finding) => (
                  <button
                    key={finding.id}
                    className={`paragraph-anchor ${activeFinding === finding.id ? 'active' : ''}`}
                    style={{ top: findingPositions[finding.id] }}
                    onClick={() => focusFinding(finding.id)}
                    aria-label={`Show evidence for ${finding.id}`}
                  >
                    {finding.id.replace('F-', '')}
                  </button>
                ))}
              </div>

              <aside className="evidence-margin">
                <div className="margin-heading">
                  <ShieldCheck size={14} />
                  <span><strong>Source evidence</strong><small>Click to inspect</small></span>
                </div>

                {activeFinding === 'all' ? (
                  <div className="margin-overview">
                    {findings.map((finding) => (
                      <button
                        key={finding.id}
                        style={{ top: findingPositions[finding.id] - 52 }}
                        onClick={() => focusFinding(finding.id)}
                      >
                        <span className={`overview-dot ${finding.severity.toLowerCase()}`} />
                        <span><small>{finding.id} · {finding.sources.length} sources</small><strong>{finding.title}</strong></span>
                        <b>{finding.amount}</b>
                      </button>
                    ))}
                  </div>
                ) : selectedFinding ? (
                  <EvidenceStack finding={selectedFinding} onOpen={openSourceWindow} />
                ) : null}
              </aside>

              <svg className="trace-lines" viewBox="0 0 880 1230" preserveAspectRatio="none" aria-hidden="true">
                {findings.map((finding) => {
                  const y = findingPositions[finding.id] + 83
                  const visible = activeFinding === 'all' || activeFinding === finding.id
                  return <path key={finding.id} className={visible ? 'visible' : ''} d={`M 570 ${y} C 595 ${y}, 592 ${y - 24}, 622 ${y - 24}`} />
                })}
              </svg>
              <div className="paper-footer"><span>FY 2025 · REVIEW WORKING PAPER</span><span>1</span></div>
            </div>
          </div>
        </section>

        <aside className={`review-panel ${panelOpen ? 'panel-open' : ''}`}>
          <div className="panel-tabs">
            <button className={reviewTab === 'open' ? 'active' : ''} onClick={() => setReviewTab('open')}>Open <span>4</span></button>
            <button className={reviewTab === 'passed' ? 'active' : ''} onClick={() => setReviewTab('passed')}>Checks passed <span>3</span></button>
            <button className={reviewTab === 'comments' ? 'active' : ''} onClick={() => setReviewTab('comments')}>Comments <span>{comments.length}</span></button>
            <button className="close-panel" onClick={() => setPanelOpen(false)}><X size={16} /></button>
          </div>

          {reviewTab === 'open' && (
            <div className="findings-panel">
              <div className="panel-heading"><strong>Review queue</strong><small>Select a finding to trace it in the report.</small></div>
              {findings.map((finding) => {
                const expanded = finding.id === expandedFinding
                return (
                  <article className={`finding-card ${expanded ? 'expanded' : ''} ${activeFinding === finding.id ? 'selected' : ''}`} key={finding.id}>
                    <button className="finding-summary" onClick={() => { setExpandedFinding(expanded ? '' : finding.id); setActiveFinding(finding.id) }}>
                      <span className={`risk-dot ${finding.severity.toLowerCase()}`} />
                      <span className="finding-summary-copy"><small>{finding.category} · {finding.id}</small><strong>{finding.title}</strong></span>
                      <strong className="finding-amount">{finding.amount}</strong>
                      {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </button>
                    {expanded && (
                      <div className="finding-body">
                        <p>{finding.explanation}</p>
                        <div className="calculation"><small>CALCULATION</small><strong>{finding.calculation}</strong></div>
                        <div className="source-label">{finding.sources.length} SOURCE{finding.sources.length === 1 ? '' : 'S'}</div>
                        <div className="source-list">
                          {finding.sources.map((source) => (
                            <SourceListButton key={source.id} source={source} onOpen={openSourceWindow} />
                          ))}
                        </div>
                        <button className="show-in-report" onClick={() => focusFinding(finding.id)}><Link2 size={13} /> Show in report</button>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}

          {reviewTab === 'passed' && (
            <div className="passed-panel">
              <div className="panel-heading"><strong>Checks passed</strong><small>Reconciliations with no exception.</small></div>
              {clearedChecks.map((check) => (
                <button key={check.label} className="passed-check" onClick={() => openSourceWindow(check.source)}>
                  <CircleCheck size={17} />
                  <span><strong>{check.label}</strong><small>{check.source.name} · {check.source.location}</small></span>
                  <b>{check.detail}</b>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          )}

          {reviewTab === 'comments' && (
            <div className="comments-panel">
              {showCommentBox && (
                <div className="comment-composer">
                  {commentQuote && <blockquote>“{commentQuote}”</blockquote>}
                  <textarea autoFocus value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Add a comment…" />
                  <div><button onClick={() => setShowCommentBox(false)}>Cancel</button><button onClick={addComment}>Comment</button></div>
                </div>
              )}
              {comments.length === 0 && !showCommentBox && <div className="empty-comments"><MessageSquarePlus size={18} /><strong>No comments yet</strong><span>Select text in the report, then add a comment.</span></div>}
              {comments.map((comment) => (
                <article className="comment" key={comment.id}>
                  <span className="comment-avatar">You</span>
                  <div>{comment.quote && <blockquote>“{comment.quote}”</blockquote>}<p>{comment.text}</p><button>Reply</button></div>
                </article>
              ))}
              {!showCommentBox && <button className="new-comment" onClick={() => setShowCommentBox(true)}><MessageSquarePlus size={15} /> New comment</button>}
            </div>
          )}
        </aside>
      </main>

      {sourceWindows.map((item) => (
        <DraggableSourceWindow
          key={item.source.id}
          item={item}
          onClose={() => setSourceWindows((windows) => windows.filter((windowItem) => windowItem.source.id !== item.source.id))}
          onFocus={() => focusSourceWindow(item.source.id)}
          onMove={(x, y) => moveSourceWindow(item.source.id, x, y)}
          onCopy={() => notify('Source reference copied')}
        />
      ))}
      {toast && <div className="toast"><Check size={15} /> {toast}</div>}
    </div>
  )
}

function EvidenceStack({ finding, onOpen }: { finding: Finding; onOpen: (source: Source) => void }) {
  return (
    <div className="evidence-stack" style={{ top: findingPositions[finding.id] - 52 }}>
      <div className="evidence-stack-title">
        <span className={`overview-dot ${finding.severity.toLowerCase()}`} />
        <span><small>{finding.id} · {finding.category}</small><strong>{finding.title}</strong></span>
        <b>{finding.amount}</b>
      </div>
      {finding.sources.map((source, index) => (
        <button key={source.id} className="margin-source" onClick={() => onOpen(source)}>
          <span className="margin-number">[{index + 1}]</span>
          <span><strong>{source.value}</strong><small>{source.name}<br />{source.location}</small></span>
          <ChevronRight size={13} />
        </button>
      ))}
    </div>
  )
}

function SourceListButton({ source, onOpen }: { source: Source; onOpen: (source: Source) => void }) {
  return (
    <button onClick={() => onOpen(source)}>
      <span className="source-icon">{source.type === 'pdf' ? <FileText size={14} /> : <FileSpreadsheet size={14} />}</span>
      <span><strong>{source.value}</strong><small>{source.name} · {source.location}</small></span>
      <ChevronRight size={13} />
    </button>
  )
}

function DraggableSourceWindow({
  item,
  onClose,
  onFocus,
  onMove,
  onCopy,
}: {
  item: OpenSourceWindow
  onClose: () => void
  onFocus: () => void
  onMove: (x: number, y: number) => void
  onCopy: () => void
}) {
  const { source } = item

  const startDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    event.preventDefault()
    onFocus()
    const startPointerX = event.clientX
    const startPointerY = event.clientY
    const startWindowX = item.x
    const startWindowY = item.y
    const windowRect = (event.currentTarget.closest('.source-window') as HTMLElement | null)?.getBoundingClientRect()
    const maxX = Math.max(4, window.innerWidth - (windowRect?.width ?? 400) - 4)
    const maxY = Math.max(58, window.innerHeight - (windowRect?.height ?? 480) - 4)

    const handleMove = (moveEvent: PointerEvent) => {
      const nextX = Math.max(4, Math.min(maxX, startWindowX + moveEvent.clientX - startPointerX))
      const nextY = Math.max(58, Math.min(maxY, startWindowY + moveEvent.clientY - startPointerY))
      onMove(nextX, nextY)
    }
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  const copyReference = () => {
    void navigator.clipboard?.writeText(`${source.name} · ${source.location}`)
    onCopy()
  }

  return (
    <div className="source-window" style={{ left: item.x, top: item.y, zIndex: item.z }} onMouseDown={onFocus}>
      <header onPointerDown={startDrag}>
        <Move size={14} className="drag-handle" />
        <span className="source-modal-icon">{source.type === 'pdf' ? <FileText size={17} /> : <FileSpreadsheet size={17} />}</span>
        <div><strong>{source.name}</strong><small>{source.location}</small></div>
        <button onClick={onClose}><X size={17} /></button>
      </header>
      <div className="source-preview">
        <div className={`source-record ${source.type}`}>
          <div className="record-topline"><span>{source.type === 'pdf' ? 'DOCUMENT' : 'DATA RECORD'}</span><strong>{source.location}</strong></div>
          <h2>{source.name}</h2>
          <div className="record-value"><small>RELEVANT VALUE</small><strong>{source.value}</strong></div>
          <div className="record-passage"><small>EXACT PASSAGE</small><p>{source.passage}</p></div>
        </div>
      </div>
      <footer>
        <span><CheckCircle2 size={14} /> Exact source location</span>
        <button onClick={copyReference}><Link2 size={14} /> Copy reference</button>
      </footer>
    </div>
  )
}

export default App
