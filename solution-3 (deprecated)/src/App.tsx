import { useMemo, useState } from 'react'
import type { CSSProperties, MouseEvent, PointerEvent as ReactPointerEvent } from 'react'
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
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Files,
  Italic,
  Link2,
  MessageSquarePlus,
  Move,
  Play,
  Share2,
  Underline,
  X,
} from 'lucide-react'
import {
  clearedChecks,
  findings,
  reportValue,
  type Finding,
  type Source,
} from './caseData'

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
    text: 'Please obtain the Ratio contract and confirm the bank-account owner.',
    quote: 'No contract or service record is in the dossier.',
    time: '2 min ago',
  },
]

const reportParagraph: Record<string, number> = {
  'F-01': 8,
  'F-02': 12,
  'F-03': 16,
  'F-04': 20,
}

function categoryKey(category: Finding['category']) {
  return category.toLowerCase().replace(/[^a-z]+/g, '-')
}

function shortName(name: string) {
  return name.replace(/\.(csv|txt|xlsx|pdf|docx)$/i, '')
}

function fileKind(source: Source) {
  return source.name.split('.').pop()?.toLowerCase() ?? 'file'
}

function SourceIcon({ source, size = 15 }: { source: Source; size?: number }) {
  const kind = fileKind(source)
  return kind === 'pdf' || kind === 'docx'
    ? <FileText size={size} />
    : <FileSpreadsheet size={size} />
}

function App() {
  const editor = usePlateEditor({
    plugins: [BoldPlugin, ItalicPlugin, UnderlinePlugin],
    value: reportValue,
  })
  const [activeFindingId, setActiveFindingId] = useState('F-01')
  const [rightTab, setRightTab] = useState<'items' | 'comments'>('items')
  const [panelOpen, setPanelOpen] = useState(() => window.innerWidth > 800)
  const [sourceWindows, setSourceWindows] = useState<OpenSourceWindow[]>([])
  const [comments, setComments] = useState(startingComments)
  const [commentQuote, setCommentQuote] = useState('')
  const [commentDraft, setCommentDraft] = useState('')
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [toast, setToast] = useState('')

  const activeFinding = useMemo(
    () => findings.find((finding) => finding.id === activeFindingId) ?? findings[0],
    [activeFindingId],
  )
  const activeIndex = findings.findIndex((finding) => finding.id === activeFinding.id)

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2100)
  }

  const runToolbarAction = (event: MouseEvent<HTMLButtonElement>, action: () => void) => {
    event.preventDefault()
    action()
  }

  const startComment = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setCommentQuote(window.getSelection()?.toString().trim() ?? '')
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

  const selectFinding = (id: string, scrollToReport = false) => {
    setActiveFindingId(id)
    if (!scrollToReport) return
    window.requestAnimationFrame(() => {
      const paragraph = reportParagraph[id]
      document.querySelector(`.report-editor p:nth-child(${paragraph})`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
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
        x: Math.max(10, window.innerWidth - 470 - offset),
        y: 126 + offset,
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
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span>t</span><strong>trace</strong></div>
        <div className="file-title">
          <strong>Muster Verpackungen · 2025 review</strong>
          <small><i /> Saved</small>
        </div>
        <div className="top-actions">
          <div className="avatars"><span>AH</span><span>JW</span></div>
          <button className="share-button"><Share2 size={14} /> Share</button>
          <button
            className="run-button"
            onClick={() => {
              setPanelOpen(true)
              setRightTab('items')
              notify('Tests complete · 4 items')
            }}
          ><Play size={13} fill="currentColor" /> Run tests</button>
        </div>
      </header>

      <div className="formatbar">
        <button title="Back"><ArrowLeft size={16} /></button>
        <span className="format-divider" />
        <button onMouseDown={(event) => runToolbarAction(event, () => editor.tf.bold.toggle())} title="Bold"><Bold size={16} /></button>
        <button onMouseDown={(event) => runToolbarAction(event, () => editor.tf.italic.toggle())} title="Italic"><Italic size={16} /></button>
        <button onMouseDown={(event) => runToolbarAction(event, () => editor.tf.underline.toggle())} title="Underline"><Underline size={16} /></button>
        <span className="format-divider" />
        <button onMouseDown={startComment} className="comment-action"><MessageSquarePlus size={16} /> Comment</button>
        <button className="mobile-items" onClick={() => { setPanelOpen(true); setRightTab('items') }}>4 items</button>
        <span className="format-spacer" />
        <span className="editing-status"><Check size={12} /> Editing</span>
      </div>

      <main className="workspace">
        <section className="document-area">
          <div className="dossier-stats">
            <span><Files size={14} /> 35 files</span>
            <i />
            <span>20,258 journal lines</span>
            <i />
            <button onClick={() => { setPanelOpen(true); setRightTab('items') }}>4 items</button>
            <i />
            <span className="passed"><CheckCircle2 size={14} /> 3 checks passed</span>
          </div>

          <section className={`trace-card category-${categoryKey(activeFinding.category)}`}>
            <div className="trace-tabs" role="tablist" aria-label="Review items">
              {findings.map((finding) => (
                <button
                  key={finding.id}
                  className={`category-${categoryKey(finding.category)} ${finding.id === activeFinding.id ? 'active' : ''}`}
                  onClick={() => selectFinding(finding.id)}
                  role="tab"
                  aria-selected={finding.id === activeFinding.id}
                >
                  <span>{finding.id}</span>
                  <strong>{finding.category}</strong>
                  <b>{finding.amount}</b>
                </button>
              ))}
            </div>

            <div className="trace-heading">
              <div><span className="trace-dot" /><strong>{activeFinding.title}</strong></div>
              <small>{activeFinding.calculation}</small>
            </div>

            <div className="trace-flow">
              <div
                className={`trace-sources source-count-${activeFinding.sources.length}`}
                style={{ '--source-count': activeFinding.sources.length } as CSSProperties}
              >
                {activeFinding.sources.map((source, index) => (
                  <button key={source.id} className="trace-source" onClick={() => openSourceWindow(source)}>
                    <span className="source-number">{index + 1}</span>
                    <span className="source-file-icon"><SourceIcon source={source} /></span>
                    <span className="source-copy">
                      <strong>{shortName(source.name)}</strong>
                      <small>{source.location}</small>
                      <b>{source.value}</b>
                    </span>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
              <div className="flow-arrow"><span /><ChevronRight size={16} /></div>
              <div className="trace-result">
                <small>{activeFinding.category}</small>
                <strong>{activeFinding.amount}</strong>
                <span>{activeFinding.title}</span>
              </div>
              <div className="flow-arrow report-arrow"><span /><ChevronRight size={16} /></div>
              <button className="report-target" onClick={() => selectFinding(activeFinding.id, true)}>
                <FileText size={17} />
                <span><small>REPORT</small><strong>Section {activeIndex + 1}</strong></span>
              </button>
            </div>
          </section>

          <div className="paper-wrap">
            <div className={`paper focus-${activeFinding.id.toLowerCase().replace('-', '')}`}>
              <Plate editor={editor}>
                <PlateContent className="report-editor" placeholder="Start writing…" />
              </Plate>
              <div className="paper-footer"><span>FY 2025 · Working paper</span><span>1</span></div>
            </div>
          </div>
        </section>

        <aside className={`side-panel ${panelOpen ? 'open' : ''}`}>
          <div className="panel-tabs">
            <button className={rightTab === 'items' ? 'active' : ''} onClick={() => setRightTab('items')}>Items <span>4</span></button>
            <button className={rightTab === 'comments' ? 'active' : ''} onClick={() => setRightTab('comments')}>Comments <span>{comments.length}</span></button>
            <button className="panel-close" onClick={() => setPanelOpen(false)}><X size={16} /></button>
          </div>

          {rightTab === 'items' ? (
            <div className="items-panel">
              <div className="item-list">
                {findings.map((finding, index) => (
                  <button
                    key={finding.id}
                    className={`item-row category-${categoryKey(finding.category)} ${finding.id === activeFinding.id ? 'active' : ''}`}
                    onClick={() => selectFinding(finding.id)}
                  >
                    <span className="item-line" />
                    <span>
                      <small>{finding.category} · {finding.id}</small>
                      <strong>{finding.title}</strong>
                      <b>{finding.amount}</b>
                    </span>
                    <span className="section-link" onClick={(event) => { event.stopPropagation(); selectFinding(finding.id, true) }}>§{index + 1}</span>
                  </button>
                ))}
              </div>

              <div className="checks-heading"><span>Checks passed</span><strong>3</strong></div>
              <div className="check-list">
                {clearedChecks.map((check) => (
                  <button key={check.label} onClick={() => openSourceWindow(check.source)}>
                    <CheckCircle2 size={15} />
                    <span><strong>{check.label}</strong><small>{check.source.location}</small></span>
                    <b>{check.detail}</b>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="comments-panel">
              {showCommentBox && (
                <div className="comment-composer">
                  {commentQuote && <blockquote>“{commentQuote}”</blockquote>}
                  <textarea autoFocus value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Add a comment…" />
                  <div><button onClick={() => setShowCommentBox(false)}>Cancel</button><button onClick={addComment}>Comment</button></div>
                </div>
              )}
              {comments.map((comment) => (
                <article className="comment" key={comment.id}>
                  <span className="comment-avatar">{comment.initials}</span>
                  <div>
                    <header><strong>{comment.author}</strong><small>{comment.time}</small></header>
                    {comment.quote && <blockquote>“{comment.quote}”</blockquote>}
                    <p>{comment.text}</p>
                    <button>Reply</button>
                  </div>
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
          onCopy={() => {
            void navigator.clipboard?.writeText(`${item.source.name} · ${item.source.location}`)
            notify('Record link copied')
          }}
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
    const maxX = Math.max(4, window.innerWidth - (windowRect?.width ?? 450) - 4)
    const maxY = Math.max(58, window.innerHeight - (windowRect?.height ?? 420) - 4)

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
    <div className="source-window" style={{ left: item.x, top: item.y, zIndex: item.z }} onMouseDown={onFocus}>
      <header onPointerDown={startDrag}>
        <Move size={14} className="drag-handle" />
        <span className="window-file-icon"><SourceIcon source={source} size={17} /></span>
        <div><strong>{source.name}</strong><small>{source.location}</small></div>
        <button onClick={onClose}><X size={17} /></button>
      </header>
      <SourcePreview source={source} />
      <footer>
        <span>{fileKind(source).toUpperCase()}</span>
        <button onClick={onCopy}><Link2 size={14} /> Copy record link</button>
      </footer>
    </div>
  )
}

function SourcePreview({ source }: { source: Source }) {
  const kind = fileKind(source)
  const cells = source.passage.split(' · ').map((cell) => cell.trim())
  const isDocument = kind === 'pdf' || kind === 'docx'

  if (isDocument) {
    return (
      <div className="source-preview document-preview">
        <div className="document-page">
          <div className="document-page-header"><span>{source.name}</span><b>{source.location}</b></div>
          <div className="document-rule" />
          <p className="document-highlight">{source.passage}</p>
          <div className="document-value">{source.value}</div>
          <span className="document-page-number">{source.location}</span>
        </div>
      </div>
    )
  }

  const rowNumber = source.location.match(/\d+/)?.[0] ?? '•'
  return (
    <div className="source-preview grid-preview">
      <div className="sheet-location"><span>{source.location}</span><strong>{source.value}</strong></div>
      <div className="sheet-scroll">
        <div className="sheet-grid" style={{ '--cell-count': cells.length } as CSSProperties}>
          <span className="corner-cell" />
          {cells.map((_, index) => <span className="column-cell" key={`col-${index}`}>{String.fromCharCode(65 + index)}</span>)}
          <span className="row-cell">{rowNumber}</span>
          {cells.map((cell, index) => <span className="data-cell" key={`${cell}-${index}`}>{cell}</span>)}
        </div>
      </div>
    </div>
  )
}

export default App
