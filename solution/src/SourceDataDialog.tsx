import { useRef, useState } from 'react'
import {
  BrainCircuit,
  Check,
  FileUp,
  FolderOpen,
  Globe2,
  LoaderCircle,
  TerminalSquare,
  X,
} from 'lucide-react'
import type { Analysis } from './analysis'
import { analyzeFiles, runSpecialists } from './analysis'

type ServiceId = 'cognee' | 'tavily' | 'codex'

export function SourceDataDialog({ currentName, onClose, onAnalysis }: { currentName: string; onClose: () => void; onAnalysis: (analysis: Analysis) => void }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const folderInput = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [name, setName] = useState(currentName)
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState('')
  const [error, setError] = useState('')
  const [enabled, setEnabled] = useState<Record<ServiceId, boolean>>({ cognee: true, tavily: true, codex: true })
  const bytes = files.reduce((total, file) => total + file.size, 0)

  const receiveFiles = (list: FileList | null) => {
    if (!list) return
    const supported = new Set(['csv', 'txt', 'xlsx', 'docx', 'pdf', 'xml', 'dtd', 'json', 'md'])
    const selected = Array.from(list).filter((file) => supported.has(file.name.split('.').pop()?.toLowerCase() ?? ''))
    setFiles(selected)
    setError(selected.length ? '' : 'No supported source files found.')
  }

  const run = async () => {
    if (!files.length) { setError('Choose a source folder or files.'); return }
    setBusy(true)
    setError('')
    try {
      setPhase(`Parsing ${files.length} files`)
      let analysis = await analyzeFiles(files, name.trim() || 'Uploaded dossier')
      if (Object.values(enabled).some(Boolean)) {
        setPhase('Running selected specialists')
        analysis = await runSpecialists(enabled)
      }
      onAnalysis(analysis)
      onClose()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Analysis failed')
    } finally {
      setBusy(false)
      setPhase('')
    }
  }

  const services: Array<{ id: ServiceId; label: string; detail: string; icon: typeof BrainCircuit }> = [
    { id: 'cognee', label: 'Cognee', detail: 'Ingest + relationship recall', icon: BrainCircuit },
    { id: 'tavily', label: 'Tavily', detail: 'Public entity corroboration', icon: Globe2 },
    { id: 'codex', label: 'Codex', detail: 'Claim wording challenge', icon: TerminalSquare },
  ]

  return <div className="source-dialog-backdrop" role="presentation">
    <section className="source-dialog" role="dialog" aria-modal="true" aria-labelledby="source-dialog-title">
      <header><div><small>SOURCE DATA</small><h2 id="source-dialog-title">Analyze another dossier</h2></div><button type="button" onClick={onClose} disabled={busy} aria-label="Close source data"><X size={20} /></button></header>

      <label className="dataset-name"><span>Dataset name</span><input value={name} onChange={(event) => setName(event.target.value)} disabled={busy} /></label>

      <div className="source-pickers">
        <button type="button" onClick={() => folderInput.current?.click()} disabled={busy}><FolderOpen size={22} /><span><strong>Choose folder</strong><small>Documents, tables, exports</small></span></button>
        <button type="button" onClick={() => fileInput.current?.click()} disabled={busy}><FileUp size={22} /><span><strong>Choose files</strong><small>Select multiple source documents</small></span></button>
        <input ref={folderInput} type="file" multiple onChange={(event) => receiveFiles(event.target.files)} {...({ webkitdirectory: '', directory: '' })} />
        <input ref={fileInput} type="file" multiple accept=".csv,.txt,.xlsx,.docx,.pdf,.xml,.dtd,.json,.md" onChange={(event) => receiveFiles(event.target.files)} />
      </div>

      <div className={`file-selection ${files.length ? 'ready' : ''}`}>
        {files.length ? <><Check size={17} /><span><strong>{files.length} files selected</strong><small>{(bytes / 1024 / 1024).toFixed(1)} MB · local upload</small></span></> : <span>No files selected</span>}
      </div>

      <fieldset className="specialist-options"><legend>Run specialists</legend>
        {services.map((service) => { const Icon = service.icon; return <label key={service.id}><input type="checkbox" checked={enabled[service.id]} onChange={(event) => setEnabled((items) => ({ ...items, [service.id]: event.target.checked }))} disabled={busy} /><span><Icon size={17} /><span><strong>{service.label}</strong><small>{service.detail}</small></span></span></label> })}
      </fieldset>

      {error && <div className="source-error">{error}</div>}
      {busy && <div className="source-progress"><LoaderCircle size={18} />{phase}</div>}

      <footer><span /><button type="button" onClick={onClose} disabled={busy}>Cancel</button><button type="button" className="primary" onClick={() => void run()} disabled={busy || !files.length}>{busy ? <LoaderCircle size={15} /> : <FileUp size={15} />} Analyze</button></footer>
    </section>
  </div>
}
