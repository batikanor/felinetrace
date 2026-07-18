import { useState } from 'react'
import {
  CheckCircle2,
  ChevronRight,
  FileJson2,
  FileSearch2,
  LockKeyhole,
  SquareTerminal,
  X,
} from 'lucide-react'
import type { Source } from './caseData'
import { outputSchema, resultPayload } from './reviewData'
import type { ReviewTask } from './reviewData'

type TraceDrawerProps = {
  task: ReviewTask
  citationNumberById: Record<string, number>
  onClose: () => void
  onSource: (source: Source) => void
}

export function TraceDrawer({ task, citationNumberById, onClose, onSource }: TraceDrawerProps) {
  const [jsonTab, setJsonTab] = useState<'output' | 'schema'>('output')

  return (
    <aside className="trace-drawer" role="dialog" aria-modal="true" aria-label={`Trace for ${task.title}`}>
      <header className="trace-header">
        <div className="trace-title-icon"><FileSearch2 size={16} /></div>
        <div><small>{task.id} · RECORDED SAMPLE</small><strong>{task.title}</strong></div>
        <button type="button" onClick={onClose} aria-label="Close trace"><X size={16} /></button>
      </header>

      <div className="trace-body">
        <div className="trace-safety">
          <LockKeyhole size={14} />
          <div><strong>Local boundary</strong><span>Browser receives events and schema-valid output—not credentials.</span></div>
        </div>

        <section className="trace-section">
          <header><span>Run</span><small>read-only · ephemeral</small></header>
          <div className="trace-timeline">
            {task.result.trace.map((item, index) => (
              <div key={item}><span>{index + 1}</span><strong>{item}</strong><CheckCircle2 size={13} /></div>
            ))}
          </div>
        </section>

        <section className="trace-section">
          <header><span>Evidence packet</span><small>{task.sources.length} allowlisted sources</small></header>
          <div className="trace-sources">
            {task.sources.map((source) => (
              <button type="button" key={source.id} onClick={() => onSource(source)}>
                <span>[{citationNumberById[source.id] ?? '•'}]</span>
                <span><strong>{source.name}</strong><small>{source.location}</small></span>
                <ChevronRight size={13} />
              </button>
            ))}
          </div>
        </section>

        <section className="trace-section">
          <header><span>Commands</span><small>visible before approval</small></header>
          <div className="trace-commands">
            {task.result.commands.map((command) => (
              <code key={command}><SquareTerminal size={12} /> {command}</code>
            ))}
          </div>
        </section>

        <section className="trace-section trace-json-section">
          <header>
            <span><FileJson2 size={12} /> Structured result</span>
            <div className="json-tabs">
              <button type="button" className={jsonTab === 'output' ? 'active' : ''} onClick={() => setJsonTab('output')}>Output</button>
              <button type="button" className={jsonTab === 'schema' ? 'active' : ''} onClick={() => setJsonTab('schema')}>Schema</button>
            </div>
          </header>
          <pre>{JSON.stringify(jsonTab === 'output' ? resultPayload(task) : outputSchema, null, 2)}</pre>
        </section>
      </div>
    </aside>
  )
}
