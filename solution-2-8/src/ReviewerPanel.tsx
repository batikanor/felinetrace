import {
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  FilePlus2,
  GitPullRequestArrow,
  ListChecks,
  LoaderCircle,
  Play,
  RotateCcw,
  SearchCode,
  ShieldCheck,
  X,
} from 'lucide-react'
import type { Source } from './caseData'
import type { ReviewStatus, ReviewTask } from './reviewData'

export type AuditEvent = {
  id: number
  time: string
  text: string
}

type ReviewerPanelProps = {
  tasks: ReviewTask[]
  selectedTask: ReviewTask
  auditLog: AuditEvent[]
  citationNumberById: Record<string, number>
  onSelect: (taskId: string) => void
  onRun: (taskId: string) => void
  onTrace: (taskId: string) => void
  onAccept: (taskId: string) => void
  onReject: (taskId: string) => void
  onAddCase: () => void
  onSource: (source: Source) => void
}

const statusLabel: Record<ReviewStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  complete: 'Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

export function ReviewerPanel({
  tasks,
  selectedTask,
  auditLog,
  citationNumberById,
  onSelect,
  onRun,
  onTrace,
  onAccept,
  onReject,
  onAddCase,
  onSource,
}: ReviewerPanelProps) {
  const resultVisible = ['complete', 'accepted', 'rejected'].includes(selectedTask.status)

  return (
    <div className="reviewer-panel-content">
      <div className="reviewer-panel-intro">
        <div className="reviewer-intro-icon"><ListChecks size={15} /></div>
        <div><strong>Local review queue</strong><span>Sample outputs · explicit patch approval</span></div>
        <button type="button" onClick={onAddCase}><FilePlus2 size={13} /> Add case</button>
      </div>

      <div className="task-queue" aria-label="Review task queue">
        {tasks.map((task) => {
          const active = task.id === selectedTask.id
          return (
            <article className={`task-row ${active ? 'active' : ''}`} key={task.id}>
              <button type="button" className="task-select" onClick={() => onSelect(task.id)}>
                <span className={`task-state ${task.status}`}>
                  {task.status === 'running' ? <LoaderCircle size={12} /> : task.status === 'accepted' ? <Check size={12} /> : task.status === 'rejected' ? <X size={12} /> : <CircleDot size={11} />}
                </span>
                <span className="task-copy"><small>{task.id} · {task.scope}</small><strong>{task.title}</strong></span>
                <span className={`task-status ${task.status}`}>{statusLabel[task.status]}</span>
                <ChevronRight size={13} />
              </button>
              {active && (
                <button
                  type="button"
                  className="task-run"
                  disabled={task.status === 'running'}
                  onClick={() => onRun(task.id)}
                >
                  {task.status === 'queued' ? <Play size={11} /> : <RotateCcw size={11} />}
                  {task.status === 'queued' ? 'Run task' : task.status === 'running' ? 'Running…' : 'Replay'}
                </button>
              )}
            </article>
          )
        })}
      </div>

      <section className="task-inspector">
        <header>
          <div><small>SELECTED RESULT</small><strong>{selectedTask.title}</strong></div>
          <button type="button" onClick={() => onTrace(selectedTask.id)}><SearchCode size={12} /> Inspect trace</button>
        </header>

        {selectedTask.status === 'queued' && (
          <div className="task-empty-state"><Play size={16} /><span>Run against the linked evidence packet.</span></div>
        )}
        {selectedTask.status === 'running' && (
          <div className="task-running-state"><LoaderCircle size={17} /><span>Replaying structured sample…</span></div>
        )}
        {resultVisible && (
          <>
            <div className="result-verdict">
              <span><ShieldCheck size={13} /> {selectedTask.result.verdict.replaceAll('_', ' ')}</span>
              <strong>{selectedTask.result.amountEur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</strong>
            </div>
            <p className="result-summary">{selectedTask.result.summary}</p>
            <div className="result-sources">
              {selectedTask.sources.map((source) => (
                <button type="button" key={source.id} onClick={() => onSource(source)}>
                  <span>[{citationNumberById[source.id] ?? '•'}]</span>
                  <span><strong>{source.name}</strong><small>{source.location}</small></span>
                </button>
              ))}
            </div>
            <div className="patch-preview">
              <small><GitPullRequestArrow size={11} /> PATCH · {selectedTask.result.target}</small>
              <p>{selectedTask.result.patchText}</p>
            </div>
            {selectedTask.status === 'complete' ? (
              <div className="approval-actions">
                <span><ShieldCheck size={12} /> Approval required</span>
                <div>
                  <button type="button" className="reject-patch" onClick={() => onReject(selectedTask.id)}><X size={12} /> Reject</button>
                  <button type="button" className="accept-patch" onClick={() => onAccept(selectedTask.id)}><Check size={12} /> Accept patch</button>
                </div>
              </div>
            ) : (
              <div className={`decision-stamp ${selectedTask.status}`}>
                {selectedTask.status === 'accepted' ? <Check size={13} /> : <X size={13} />}
                {selectedTask.status === 'accepted' ? 'Inserted into report' : 'Patch rejected'}
              </div>
            )}
          </>
        )}
      </section>

      <section className="audit-log">
        <header><span><Clock3 size={12} /> Audit log</span><small>{auditLog.length} events</small></header>
        {auditLog.slice(0, 6).map((event) => (
          <div key={event.id}><time>{event.time}</time><span>{event.text}</span></div>
        ))}
      </section>
    </div>
  )
}
