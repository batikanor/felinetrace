import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react'
import { Plate, PlateContent, usePlateEditor } from 'platejs/react'
import {
  ArrowLeft,
  Bold,
  BookOpenCheck,
  Check,
  ChevronDown,
  ChevronRight,
  DatabaseZap,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Italic,
  Link2,
  LoaderCircle,
  MessageSquarePlus,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Underline,
  X,
} from 'lucide-react'
import type { Analysis, Finding, Source } from './analysis'
import { buildReportValue, loadAnalysis, rerunAnalysis, runSpecialists, selectPreset } from './analysis'
import { CitationPlugin } from './CitationElement'
import { ClaimCompiler } from './ClaimCompiler'
import { SetupPage } from './SetupPage'
import { SourceDataDialog } from './SourceDataDialog'
import { SourceWindow } from './SourceWindow'
import type { OpenSourceWindow } from './SourceWindow'

type Comment = { id: number; author: string; initials: string; text: string; quote?: string; time: string }

export default function App() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void loadAnalysis().then(async (initial) => {
      setAnalysis(initial)
      setLoading(false)
      if (Object.values(initial.specialists).every((status) => status.phase === 'idle')) {
        try { setAnalysis(await runSpecialists({ cognee: true, tavily: true, codex: true })) } catch { /* setup exposes unavailable specialists */ }
      }
    }).catch((reason) => { setError(reason instanceof Error ? reason.message : 'Audit engine unavailable'); setLoading(false) })
  }, [])

  if (loading) return <div className="engine-state"><LoaderCircle size={28} /><strong>Loading audit engine</strong></div>
  if (!analysis) return <div className="engine-state error"><DatabaseZap size={28} /><strong>Audit engine unavailable</strong><span>{error}</span><button type="button" onClick={() => window.location.reload()}>Retry</button></div>
  return <AuditWorkspace key={analysis.dataset.id} initialAnalysis={analysis} onAnalysis={setAnalysis} />
}

function AuditWorkspace({ initialAnalysis, onAnalysis }: { initialAnalysis: Analysis; onAnalysis: (analysis: Analysis) => void }) {
  const [analysis, setLocalAnalysis] = useState(initialAnalysis)
  const [rightTab, setRightTab] = useState<'findings' | 'comments'>('findings')
  const [view, setView] = useState<'report' | 'setup'>('report')
  const [panelOpen, setPanelOpen] = useState(false)
  const [expandedFinding, setExpandedFinding] = useState(analysis.findings[0]?.id ?? '')
  const [activeBundle, setActiveBundle] = useState(analysis.findings[0]?.id ?? '')
  const [sourceWindows, setSourceWindows] = useState<OpenSourceWindow[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [commentQuote, setCommentQuote] = useState('')
  const [commentDraft, setCommentDraft] = useState('')
  const [showCommentBox, setShowCommentBox] = useState(false)
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const sourceById = useMemo(() => new Map(analysis.sources.map((source) => [source.id, source])), [analysis.sources])
  const citationNumberById = useMemo(() => Object.fromEntries(analysis.sources.map((source, index) => [source.id, index + 1])) as Record<string, number>, [analysis.sources])
  const citedFileCount = new Set(analysis.sources.map((source) => source.path)).size
  const activeFinding = analysis.findings.find((finding) => finding.id === activeBundle) ?? analysis.findings[0]
  const editor = usePlateEditor({ plugins: [BoldPlugin, ItalicPlugin, UnderlinePlugin, CitationPlugin], value: buildReportValue(analysis) })

  useEffect(() => { setLocalAnalysis(initialAnalysis) }, [initialAnalysis])

  const updateAnalysis = (next: Analysis) => {
    setLocalAnalysis(next)
    onAnalysis(next)
    setSourceWindows([])
    setActiveBundle(next.findings[0]?.id ?? '')
    setExpandedFinding(next.findings[0]?.id ?? '')
  }

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  const rerunEverything = async () => {
    if (busy) return
    setBusy(true)
    try {
      notify('Parsing and running deterministic checks')
      let next = await rerunAnalysis()
      updateAnalysis(next)
      notify('Running Cognee, Tavily and Codex')
      next = await runSpecialists({ cognee: true, tavily: true, codex: true })
      updateAnalysis(next)
      notify(`${next.summary.report} report · ${next.summary.hold} hold`)
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Analysis failed')
    } finally {
      setBusy(false)
    }
  }

  const switchDataset = async (kind: 'first' | 'final' | 'custom') => {
    if (kind === 'custom') { setSourceDialogOpen(true); return }
    if (busy || analysis.dataset.kind === kind) return
    setBusy(true)
    try {
      notify(kind === 'first' ? 'Loading first dataset' : 'Analyzing final dataset')
      const next = await selectPreset(kind)
      updateAnalysis(next)
      notify(`${next.summary.report} report · ${next.summary.hold} hold`)
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : 'Dataset switch failed')
    } finally {
      setBusy(false)
    }
  }

  const openSourceWindow = (source: Source) => {
    setSourceWindows((windows) => {
      const topZ = Math.max(50, ...windows.map((item) => item.z)) + 1
      const existing = windows.find((item) => item.source.id === source.id)
      if (existing) return windows.map((item) => item.source.id === source.id ? { ...item, z: topZ } : item)
      const offset = (windows.length % 5) * 24
      return [...windows, { source, x: Math.max(10, window.innerWidth - 500 - offset), y: 122 + offset, z: topZ }]
    })
  }

  const handleCitationClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const citation = (event.target as HTMLElement).closest<HTMLElement>('[data-citation-source]')
    const source = sourceById.get(citation?.dataset.citationSource ?? '')
    if (source) openSourceWindow(source)
  }

  const addComment = () => {
    if (!commentDraft.trim()) return
    setComments((items) => [...items, { id: Date.now(), author: 'You', initials: 'YO', text: commentDraft.trim(), quote: commentQuote || undefined, time: 'Now' }])
    setCommentDraft(''); setCommentQuote(''); setShowCommentBox(false); notify('Comment added')
  }

  const startComment = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setCommentQuote(window.getSelection()?.toString().trim() ?? '')
    setShowCommentBox(true); setRightTab('comments'); setPanelOpen(true)
  }

  const specialistCopy = Object.entries(analysis.specialists).map(([id, status]) => `${id} ${status.phase}`).join(' · ')

  return <div className="simple-app">
    <header className="simple-header">
      <div className="simple-brand">
        <span className="simple-logo" role="img" aria-label="Trace cat monogram">
          <span aria-hidden="true">tr</span><i aria-hidden="true" />
        </span>
        <strong>trace</strong>
      </div>
      <div className="header-center">
        <div className="document-title"><strong>{analysis.dataset.company} · Claim Compiler</strong><span>{view === 'report' ? 'Saved' : 'Setup'}</span></div>
        <nav className="primary-tabs" role="tablist" aria-label="Primary pages">
          <button type="button" role="tab" aria-selected={view === 'report'} className={view === 'report' ? 'active' : ''} onClick={() => setView('report')}><BookOpenCheck size={13} /> Report</button>
          <button type="button" role="tab" aria-selected={view === 'setup'} className={view === 'setup' ? 'active' : ''} onClick={() => { setView('setup'); setSourceWindows([]) }}><Settings2 size={13} /> Setup</button>
        </nav>
      </div>
      <div className="header-actions">
        {view === 'report' && <button type="button" className="analyze-button" disabled={busy} onClick={() => void rerunEverything()}>{busy ? <LoaderCircle size={14} /> : <RefreshCw size={14} />} {busy ? 'Analyzing' : 'Rerun analysis'}</button>}
      </div>
    </header>

    {view === 'report' ? <>
      <div className="editor-toolbar">
        <button type="button" title="Back"><ArrowLeft size={16} /></button><span className="toolbar-rule" />
        <button type="button" onMouseDown={(event) => { event.preventDefault(); editor.tf.bold.toggle() }} title="Bold"><Bold size={16} /></button>
        <button type="button" onMouseDown={(event) => { event.preventDefault(); editor.tf.italic.toggle() }} title="Italic"><Italic size={16} /></button>
        <button type="button" onMouseDown={(event) => { event.preventDefault(); editor.tf.underline.toggle() }} title="Underline"><Underline size={16} /></button>
        <span className="toolbar-rule" /><button type="button" onMouseDown={startComment}><MessageSquarePlus size={16} /> Add comment</button>
        <span className="toolbar-spacer" /><button type="button" title="Search"><Search size={16} /></button><button type="button" title="More"><MoreHorizontal size={17} /></button>
      </div>

      <main className={`workspace ${panelOpen ? 'panel-open' : ''}`}>
        <section className="document-workspace">
          <div className="document-status-bar">
            <div className="dataset-switch" role="group" aria-label="Source dataset">
              <button type="button" className={analysis.dataset.kind === 'first' ? 'active' : ''} aria-pressed={analysis.dataset.kind === 'first'} disabled={busy} onClick={() => void switchDataset('first')}>First dataset</button>
              <button type="button" className={analysis.dataset.kind === 'final' ? 'active' : ''} aria-pressed={analysis.dataset.kind === 'final'} disabled={busy} onClick={() => void switchDataset('final')}>Final dataset</button>
              <button type="button" className={analysis.dataset.kind === 'custom' ? 'active' : ''} aria-pressed={analysis.dataset.kind === 'custom'} disabled={busy} onClick={() => void switchDataset('custom')}>Custom</button>
            </div>
            <span><FileCheck2 size={14} /> {analysis.dataset.files} files</span><span>{analysis.dataset.rows.toLocaleString()} rows</span><span>{analysis.summary.report} report · {analysis.summary.hold} hold</span>
            <button type="button" onClick={() => notify(specialistCopy)}><Link2 size={13} /> {analysis.summary.citations} citations</button>
          </div>

          <ClaimCompiler findings={analysis.findings} holds={analysis.holds} sources={analysis.sources} specialists={analysis.specialists} busy={busy} onSource={openSourceWindow} onRerun={rerunEverything} onNotify={notify} />

          {activeFinding && <EvidenceDock findings={analysis.findings} sourceById={sourceById} activeFinding={activeFinding} activeBundle={activeBundle} citationNumberById={citationNumberById} openWindows={sourceWindows} onBundle={setActiveBundle} onSource={openSourceWindow} />}

          <div className="paper-wrap citation-paper-wrap"><div className="paper-stack">
            <article className="paper citation-report-paper">
              <div className="document-mode"><span><Check size={12} /> Working paper</span><small>Editable</small></div>
              <div onClick={handleCitationClick}><Plate editor={editor}><PlateContent className="report-editor citation-report-editor" placeholder="Start writing your audit report…" /></Plate></div>
              <div className="paper-footer"><span>{analysis.dataset.company.toUpperCase()}</span><span>1</span></div>
            </article>
            <article className="paper sources-paper">
              <div className="sources-kicker">{analysis.dataset.name.toUpperCase()}</div>
              <div className="sources-heading"><h1>Sources</h1><span>{analysis.sources.length} passages · {citedFileCount} files</span></div><div className="sources-rule" />
              <div className="sources-grid">{analysis.sources.map((source, index) => <button type="button" className="reference-entry" key={source.id} onClick={() => openSourceWindow(source)}><span className="reference-number">[{index + 1}]</span><span className="reference-copy"><strong>{source.name}</strong><small>{source.location}</small><span>{source.passage}</span></span><ChevronRight size={14} /></button>)}</div>
              <div className="paper-footer"><span>SOURCES · {analysis.sources.length} PASSAGES</span><span>2</span></div>
            </article>
          </div></div>
        </section>

        <aside className={`review-panel ${panelOpen ? 'panel-open' : ''}`}>
          <div className="panel-tabs"><button type="button" className={rightTab === 'findings' ? 'active' : ''} onClick={() => setRightTab('findings')}>Findings <span>{analysis.findings.length}</span></button><button type="button" className={rightTab === 'comments' ? 'active' : ''} onClick={() => setRightTab('comments')}>Comments <span>{comments.length}</span></button><button type="button" className="close-panel" onClick={() => setPanelOpen(false)}><X size={16} /></button></div>
          {rightTab === 'findings' ? <FindingsPanel findings={analysis.findings} sources={sourceById} citationNumberById={citationNumberById} expandedFinding={expandedFinding} onExpanded={setExpandedFinding} onSource={openSourceWindow} /> : <div className="comments-panel">
            {showCommentBox && <div className="comment-composer">{commentQuote && <blockquote>{commentQuote}</blockquote>}<textarea autoFocus value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} /><div><button type="button" onClick={() => setShowCommentBox(false)}>Cancel</button><button type="button" onClick={addComment}>Comment</button></div></div>}
            {comments.map((comment) => <article className="comment" key={comment.id}><span className="comment-avatar">{comment.initials}</span><div><div><strong>{comment.author}</strong><small>{comment.time}</small></div>{comment.quote && <blockquote>{comment.quote}</blockquote>}<p>{comment.text}</p></div></article>)}
            {!showCommentBox && <button type="button" className="new-comment" onClick={() => setShowCommentBox(true)}><MessageSquarePlus size={15} /> New comment</button>}
          </div>}
        </aside>
      </main>

      {sourceWindows.map((item) => <SourceWindow key={item.source.id} item={item} onClose={() => setSourceWindows((windows) => windows.filter((entry) => entry.source.id !== item.source.id))} onFocus={() => setSourceWindows((windows) => windows.map((entry) => entry.source.id === item.source.id ? { ...entry, z: Math.max(...windows.map((windowItem) => windowItem.z)) + 1 } : entry))} onMove={(x, y) => setSourceWindows((windows) => windows.map((entry) => entry.source.id === item.source.id ? { ...entry, x, y } : entry))} onCopied={() => notify('Citation copied')} />)}
    </> : <SetupPage analysis={analysis} />}

    {sourceDialogOpen && <SourceDataDialog currentName={analysis.dataset.name} onClose={() => setSourceDialogOpen(false)} onAnalysis={updateAnalysis} />}
    {toast && <div className="toast"><Check size={15} /> {toast}</div>}
  </div>
}

function EvidenceDock({ findings, sourceById, activeFinding, activeBundle, citationNumberById, openWindows, onBundle, onSource }: { findings: Finding[]; sourceById: Map<string, Source>; activeFinding: Finding; activeBundle: string; citationNumberById: Record<string, number>; openWindows: OpenSourceWindow[]; onBundle: (id: string) => void; onSource: (source: Source) => void }) {
  return <section className="evidence-dock"><div className="dock-heading"><span><Link2 size={13} /> Evidence</span><small>Computed anchors · click to inspect</small></div>
    <div className="evidence-bundles">{findings.map((finding) => <button type="button" key={finding.id} className={activeBundle === finding.id ? 'active' : ''} onClick={() => onBundle(finding.id)}><span className={`bundle-dot ${finding.severity.toLowerCase()}`} /><span><small>{finding.sourceIds.map((id) => `[${citationNumberById[id]}]`).join(' ')} · {finding.category}</small><strong>{finding.title}</strong></span><b>{finding.amount}</b></button>)}</div>
    <div className="bundle-sources">{activeFinding.sourceIds.map((sourceId) => { const source = sourceById.get(sourceId); return source ? <button type="button" key={sourceId} className={openWindows.some((item) => item.source.id === sourceId) ? 'open' : ''} onClick={() => onSource(source)}><span className="dock-file-icon">{source.type === 'pdf' ? <FileText size={14} /> : <FileSpreadsheet size={14} />}</span><span><strong>[{citationNumberById[sourceId]}] {source.name}</strong><small>{source.location} · {source.value}</small></span></button> : null })}</div>
  </section>
}

function FindingsPanel({ findings, sources, citationNumberById, expandedFinding, onExpanded, onSource }: { findings: Finding[]; sources: Map<string, Source>; citationNumberById: Record<string, number>; expandedFinding: string; onExpanded: (id: string) => void; onSource: (source: Source) => void }) {
  return <div className="findings-panel"><div className="panel-intro"><ShieldCheck size={16} /><div><strong>{findings.length} findings</strong><span>Computed from uploaded data</span></div></div>
    {findings.map((finding) => { const expanded = finding.id === expandedFinding; return <article className={`finding-card ${expanded ? 'expanded' : ''}`} key={finding.id}><button type="button" className="finding-summary" onClick={() => onExpanded(expanded ? '' : finding.id)}><span className={`risk-dot ${finding.severity.toLowerCase()}`} /><span className="finding-summary-copy"><small>{finding.id} · {finding.category}</small><strong>{finding.title}</strong></span><strong className="finding-amount">{finding.amount}</strong>{expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>
      {expanded && <div className="finding-body"><p>{finding.explanation}</p><div className="calculation"><small>CALCULATION</small><strong>{finding.calculation}</strong></div><div className="source-label">SOURCES</div><div className="source-list">{finding.sourceIds.map((sourceId) => { const source = sources.get(sourceId); return source ? <button type="button" key={sourceId} onClick={() => onSource(source)}><span className="source-number">[{citationNumberById[sourceId]}]</span><span><strong>{source.value}</strong><small>{source.name} · {source.location}</small></span><ChevronRight size={14} /></button> : null })}</div></div>}
    </article> })}
  </div>
}
