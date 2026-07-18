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
  Upload,
  Users,
  X,
} from 'lucide-react'
import { clearedChecks, dossierDocuments, findings, reportValue, sourceDocuments } from './caseData'
import type { Source } from './caseData'

type Comment = {
  id: number
  author: string
  initials: string
  text: string
  quote?: string
  time: string
}

type OpenSourceWindow = {
  source: Source
  x: number
  y: number
  z: number
}


const startingComments: Comment[] = [
  {
    id: 1,
    author: 'Anna Hoffmann',
    initials: 'AH',
    text: 'Confirm the bank account owner before we escalate.',
    quote: 'verify bank ownership',
    time: '2 min ago',
  },
]

function App() {
  const editor = usePlateEditor({
    plugins: [BoldPlugin, ItalicPlugin, UnderlinePlugin],
    value: reportValue,
  })
  const [rightTab, setRightTab] = useState<'findings' | 'comments'>('findings')
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth > 800)
  const [expandedFinding, setExpandedFinding] = useState('F-01')
  const [sourceWindows, setSourceWindows] = useState<OpenSourceWindow[]>([])
  const [comments, setComments] = useState(startingComments)
  const [commentQuote, setCommentQuote] = useState('')
  const [commentDraft, setCommentDraft] = useState('')
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [toast, setToast] = useState('')

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const runToolbarAction = (event: MouseEvent<HTMLButtonElement>, action: () => void) => {
    event.preventDefault()
    action()
  }

  const startComment = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const selection = window.getSelection()?.toString().trim() ?? ''
    setCommentQuote(selection)
    setShowCommentBox(true)
    setRightTab('comments')
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
      const offset = (windows.length % 4) * 24
      return [...windows, {
        source,
        x: Math.max(12, window.innerWidth - 410 - offset),
        y: 135 + offset,
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

  return (
    <div className="simple-app">
      <header className="simple-header">
        <div className="simple-brand"><span className="simple-logo">t</span><strong>trace</strong></div>
        <div className="document-title">
          <strong>Muster Verpackungen · FY 2025</strong>
          <span>Saved</span>
        </div>
        <div className="header-actions">
          <div className="collaborators"><span>AH</span><span>JW</span></div>
          <button className="quiet-button"><Users size={15} /> Share</button>
          <button className="analyze-button" onClick={() => { setPanelOpen(true); setRightTab('findings'); notify('4 items · 3 checks cleared') }}><Search size={15} /> Scan dossier</button>
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
        <button className="mobile-findings-button" onClick={() => { setPanelOpen(true); setRightTab('findings') }}><Link2 size={15} /> 4 items</button>
        <span className="toolbar-spacer" />
        <button><Search size={16} /></button>
        <button><MoreHorizontal size={17} /></button>
      </div>

      <main className="workspace">
        <section className="document-workspace">
          <div className="document-status-bar">
            <span><CheckCircle2 size={14} /> 35 files · 27,190 records</span>
            <span>•</span>
            <span>4 items</span>
            <button onClick={() => notify('14 passages linked')}><ShieldCheck size={14} /> 8 / 8 hashes</button>
          </div>
          <div className="evidence-dock">
            <div className="dock-heading">
              <span><Link2 size={13} /> 27 source files</span>
              <small>Open · drag · compare</small>
            </div>
            <div className="dock-documents">
              {dossierDocuments.map((source) => (
                <button key={source.id} onClick={() => openSourceWindow(source)} className={`${sourceDocuments.some((item) => item.name === source.name) ? 'cited' : ''} ${sourceWindows.some((item) => item.source.id === source.id) ? 'open' : ''}`}>
                  <span className="dock-file-icon">{source.type === 'pdf' ? <FileText size={14} /> : <FileSpreadsheet size={14} />}</span>
                  <span><strong>{source.name.replace(/\.(pdf|xlsx|csv|txt|docx)$/i, '')}</strong><small>{source.location} · {source.value}</small></span>
                </button>
              ))}
            </div>
          </div>
          <div className="paper-wrap">
            <div className="paper">
              <Plate editor={editor}>
                <PlateContent className="report-editor" placeholder="Start writing your audit report…" />
              </Plate>
              <div className="paper-footer"><span>TRACE WORKING PAPER</span><span>1</span></div>
            </div>
          </div>
        </section>

        <aside className={`review-panel ${panelOpen ? 'panel-open' : ''}`}>
          <div className="panel-tabs">
            <button className={rightTab === 'findings' ? 'active' : ''} onClick={() => setRightTab('findings')}>Findings <span>4</span></button>
            <button className={rightTab === 'comments' ? 'active' : ''} onClick={() => setRightTab('comments')}>Comments <span>{comments.length}</span></button>
            <button className="close-panel" onClick={() => setPanelOpen(false)}><X size={16} /></button>
          </div>

          {rightTab === 'findings' ? (
            <div className="findings-panel">
              <div className="panel-intro">
                <Link2 size={16} />
                <p><strong>4 items to review</strong><br />Open any amount to trace it.</p>
              </div>
              {findings.map((finding) => {
                const expanded = finding.id === expandedFinding
                return (
                  <article className={`finding-card ${expanded ? 'expanded' : ''}`} key={finding.id}>
                    <button className="finding-summary" onClick={() => setExpandedFinding(expanded ? '' : finding.id)}>
                      <span className={`risk-dot ${finding.severity.toLowerCase()}`} />
                      <span className="finding-summary-copy"><small>{finding.category} · {finding.id}</small><strong>{finding.title}</strong></span>
                      <strong className="finding-amount">{finding.amount}</strong>
                      {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {expanded && (
                      <div className="finding-body">
                        <p>{finding.explanation}</p>
                        <div className="confidence-row"><span><Link2 size={12} /> {finding.sources.length} passages</span><button onClick={() => notify('Marked for review')}><Check size={13} /> Review</button></div>
                        <div className="calculation"><small>RECALCULATION</small><strong>{finding.calculation}</strong></div>
                        <div className="source-label">SOURCE PASSAGES</div>
                        <div className="source-list">
                          {finding.sources.map((source) => (
                            <button key={source.id} onClick={() => openSourceWindow(source)}>
                              <span className="source-icon">{source.type === 'pdf' ? <FileText size={15} /> : <FileSpreadsheet size={15} />}</span>
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
              <div className="cleared-block">
                <div className="cleared-heading"><CheckCircle2 size={14} /> Cleared</div>
                {clearedChecks.map((check) => (
                  <button key={check.label} onClick={() => openSourceWindow(check.source)}>
                    <span><strong>{check.label}</strong><small>{check.source.location}</small></span>
                    <em>{check.detail}</em>
                  </button>
                ))}
              </div>
              <button className="upload-more"><Upload size={15} /> Add evidence</button>
            </div>
          ) : (
            <div className="comments-panel">
              {showCommentBox && (
                <div className="comment-composer">
                  {commentQuote && <blockquote>“{commentQuote}”</blockquote>}
                  <textarea autoFocus value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Add your comment…" />
                  <div><button onClick={() => setShowCommentBox(false)}>Cancel</button><button onClick={addComment}>Comment</button></div>
                </div>
              )}
              {comments.map((comment) => (
                <article className="comment" key={comment.id}>
                  <span className="comment-avatar">{comment.initials}</span>
                  <div><div><strong>{comment.author}</strong><small>{comment.time}</small></div>{comment.quote && <blockquote>“{comment.quote}”</blockquote>}<p>{comment.text}</p><button>Reply</button></div>
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
        />
      ))}
      {toast && <div className="toast"><Check size={15} /> {toast}</div>}
    </div>
  )
}

function DraggableSourceWindow({
  item,
  onClose,
  onFocus,
  onMove,
}: {
  item: OpenSourceWindow
  onClose: () => void
  onFocus: () => void
  onMove: (x: number, y: number) => void
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
    const maxX = Math.max(4, window.innerWidth - (windowRect?.width ?? 380) - 4)
    const maxY = Math.max(58, window.innerHeight - (windowRect?.height ?? 530) - 4)

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

  return (
    <div
      className="source-window"
      style={{ left: item.x, top: item.y, zIndex: item.z }}
      onMouseDown={onFocus}
    >
        <header onPointerDown={startDrag}>
          <Move size={14} className="drag-handle" />
          <span className="source-modal-icon">{source.type === 'pdf' ? <FileText size={17} /> : <FileSpreadsheet size={17} />}</span>
          <div><strong>{source.name}</strong><small>{source.location}</small></div>
          <button onClick={onClose}><X size={17} /></button>
        </header>
        <div className="source-preview">
          <div className="source-page">
            <div className="raw-file-heading">
              <strong>{source.name}</strong>
              <span>{source.location}</span>
            </div>
            <div className="raw-grid">
              <div className="raw-grid-header"><span>Location</span><span>Record</span></div>
              <div className="raw-grid-muted"><span>…</span><span>…</span></div>
              <div className="raw-grid-highlight"><strong>{source.location}</strong><span>{source.passage}</span></div>
              <div className="raw-grid-muted"><span>…</span><span>…</span></div>
            </div>
            <div className="raw-value"><span>Value</span><strong>{source.value}</strong></div>
          </div>
        </div>
        <footer>
          <button><Link2 size={14} /> Copy link to passage</button>
        </footer>
    </div>
  )
}

export default App
