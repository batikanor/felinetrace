import { useState } from 'react'
import {
  BrainCircuit,
  Check,
  CirclePause,
  Clock3,
  Coins,
  FileCheck2,
  Gauge,
  Globe2,
  Link2,
  LockKeyhole,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import { sources } from './caseData'
import type { Source } from './caseData'
import {
  actionKindLabels,
  investigationHypotheses,
} from './investigationData'
import type {
  ActionKind,
  InvestigationAction,
} from './investigationData'

type InvestigationPlannerProps = {
  citationNumberById: Record<string, number>
  serviceReady: Record<'cognee' | 'tavily' | 'codex', boolean>
  onOpenSource: (source: Source) => void
  onOpenSetup: () => void
  onAddCase: () => void
  onNotice: (message: string) => void
}

type Decision = 'test' | 'report' | 'hold' | 'stop'

function SponsorIcon({ kind }: { kind: Exclude<ActionKind, 'core'> }) {
  if (kind === 'cognee') return <BrainCircuit size={13} />
  if (kind === 'tavily') return <Globe2 size={13} />
  return <Terminal size={13} />
}

export function InvestigationPlanner({
  citationNumberById,
  serviceReady,
  onOpenSource,
  onOpenSetup,
  onAddCase,
  onNotice,
}: InvestigationPlannerProps) {
  const [selectedId, setSelectedId] = useState('F-01')
  const [timeBudget, setTimeBudget] = useState(10)
  const [costBudget, setCostBudget] = useState(0)
  const [completedActions, setCompletedActions] = useState<Record<string, string[]>>({})

  const hypothesis = investigationHypotheses.find((item) => item.id === selectedId) ?? investigationHypotheses[0]
  const completed = completedActions[hypothesis.id] ?? []
  const completedCoreTests = hypothesis.actions.filter((action) => action.kind === 'core' && completed.includes(action.id))
  const coverage = Math.min(100, hypothesis.baseCoverage + completedCoreTests.reduce((total, action) => total + action.coverageGain, 0))
  const uncertainty = Math.max(0, hypothesis.baseUncertainty - completedCoreTests.reduce((total, action) => total + action.uncertaintyDrop, 0))

  const feasibleCoreActions = hypothesis.actions
    .filter((action) => action.kind === 'core')
    .filter((action) => !completed.includes(action.id))
    .filter((action) => action.minutes <= timeBudget && action.cost <= costBudget)
    .sort((left, right) => right.voi - left.voi)

  let decision: Decision = 'test'
  if (hypothesis.holdReason) decision = 'hold'
  else if (coverage >= 85 && uncertainty <= 15) decision = 'report'
  else if (feasibleCoreActions.length === 0) decision = 'stop'

  const recommended = decision === 'test' ? feasibleCoreActions[0] : undefined

  const openSource = (sourceId: string) => {
    const source = Object.values(sources).find((item) => item.id === sourceId)
    if (source) onOpenSource(source)
  }

  const runRecommended = () => {
    if (!recommended) return
    setCompletedActions((current) => ({
      ...current,
      [hypothesis.id]: [...(current[hypothesis.id] ?? []), recommended.id],
    }))
    onNotice(`${recommended.label} complete`)
  }

  const resetPlanner = () => {
    setCompletedActions({})
    setSelectedId('F-01')
    setTimeBudget(10)
    setCostBudget(0)
    onNotice('Planner reset')
  }

  const actionGate = (action: InvestigationAction) => {
    if (completed.includes(action.id)) return 'done'
    if (action.kind !== 'core' && !serviceReady[action.kind]) return 'setup'
    if (action.minutes > timeBudget || action.cost > costBudget) return 'budget'
    if (action.kind === 'core' && decision === 'report') return 'optional'
    return action.kind === 'core' ? 'ready' : 'run'
  }

  const runAction = (action: InvestigationAction) => {
    const gate = actionGate(action)
    if (gate === 'setup') {
      onOpenSetup()
      return
    }
    if (gate === 'budget') {
      onNotice('Increase the time or request budget')
      return
    }
    if (gate === 'done') {
      onNotice('Route already complete')
      return
    }
    if (gate === 'optional') {
      onNotice('Already above the configured demo report threshold')
      return
    }
    if (action.kind === 'core') {
      if (recommended?.id === action.id) runRecommended()
      else onNotice('Finish the recommended dossier test first')
      return
    }
    setCompletedActions((current) => ({
      ...current,
      [hypothesis.id]: [...(current[hypothesis.id] ?? []), action.id],
    }))
    onNotice(`${action.label} saved as non-citing context`)
  }

  const decisionCopy = decision === 'hold'
    ? hypothesis.holdReason
    : decision === 'report'
      ? `Report. Demo coverage ${coverage}% and uncertainty ${uncertainty}% meet the configured 85 / 15 threshold.`
      : decision === 'stop'
        ? `Stop. No unfinished dossier test fits ${timeBudget} min / ${costBudget} external requests.`
        : `Test. ${recommended?.label} has the highest feasible VOI (${recommended?.voi}).`

  return (
    <section className="investigation-planner" aria-labelledby="planner-title">
      <header className="planner-header">
        <div>
          <span className="planner-kicker">ACTIVE INVESTIGATION</span>
          <h2 id="planner-title">Next best test</h2>
        </div>
        <div className="planner-controls">
          <button type="button" className="planner-add-case" onClick={onAddCase}><Plus size={12} /> Add case</button>
          <label><span>Time</span><select value={timeBudget} onChange={(event) => setTimeBudget(Number(event.target.value))}><option value={5}>5 min</option><option value={10}>10 min</option><option value={20}>20 min</option></select></label>
          <label><span>Requests</span><select value={costBudget} onChange={(event) => setCostBudget(Number(event.target.value))}><option value={0}>0 external</option><option value={1}>1 external</option><option value={2}>2 external</option></select></label>
          <button type="button" className="planner-reset" onClick={resetPlanner} aria-label="Reset investigation planner"><RotateCcw size={13} /></button>
        </div>
      </header>

      <div className="planner-heuristic-note"><Gauge size={11} /> Configurable demo heuristic: decision impact × expected gap closure ÷ time + requests. Ranking aid only—not evaluation truth, probability, or confidence.</div>

      <div className="hypothesis-strip" aria-label="Hypotheses">
        {investigationHypotheses.map((item) => {
          const done = completedActions[item.id]?.length
          return (
            <button type="button" className={item.id === selectedId ? 'active' : ''} key={item.id} onClick={() => setSelectedId(item.id)}>
              <span className={item.id === 'X-05' ? 'hypothesis-dot hold' : 'hypothesis-dot'} />
              <span><small>{item.id} · {item.category}</small><strong>{item.title}</strong></span>
              <b>{done ? <Check size={11} /> : item.amount}</b>
            </button>
          )
        })}
      </div>

      <div className="planner-body">
        <div className="coverage-pane">
          <div className="coverage-summary">
            <div><span>Demo coverage</span><strong>{coverage}%</strong><i><b style={{ width: `${coverage}%` }} /></i></div>
            <div><span>Demo uncertainty</span><strong>{uncertainty}%</strong><i className="uncertainty-bar"><b style={{ width: `${uncertainty}%` }} /></i></div>
          </div>
          <div className="planner-matrix" role="table" aria-label={`${hypothesis.id} evidence coverage`}>
            <div className="planner-matrix-row matrix-head" role="row"><span role="columnheader">Claim</span><span role="columnheader">Evidence</span><span role="columnheader">State</span><span role="columnheader">Trace</span></div>
            {hypothesis.evidenceRows.map((row) => (
              <div className="planner-matrix-row" role="row" key={row.claim}>
                <strong role="cell">{row.claim}</strong>
                <span role="cell">{row.evidence}</span>
                <span role="cell" className={`coverage-state ${row.state}`}>{row.state}</span>
                <span role="cell" className="matrix-sources">
                  {row.sourceIds.map((sourceId) => (
                    <button type="button" key={sourceId} onClick={() => openSource(sourceId)}>
                      [{citationNumberById[sourceId] ?? 'D'}]
                    </button>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`next-test-card decision-${decision}`}>
          <div className="decision-heading">
            <span>{decision === 'report' ? <FileCheck2 size={15} /> : decision === 'hold' ? <CirclePause size={15} /> : decision === 'stop' ? <LockKeyhole size={15} /> : <Gauge size={15} />}</span>
            <div><small>DECISION</small><strong>{decision.toUpperCase()}</strong></div>
            {recommended && <b>VOI {recommended.voi}</b>}
          </div>
          <p>{decisionCopy}</p>
          {recommended && (
            <>
              <h3>{recommended.label}</h3>
              <div className="next-test-metrics">
                <span><Clock3 size={11} /> {recommended.minutes} min</span>
                <span><Coins size={11} /> {recommended.costLabel}</span>
                <span><ShieldCheck size={11} /> {recommended.privacy}</span>
              </div>
              <small className="next-test-why">{recommended.why}</small>
              <div className="next-test-sources">
                {recommended.sourceIds.map((sourceId) => <button type="button" key={sourceId} onClick={() => openSource(sourceId)}><Link2 size={10} /> [{citationNumberById[sourceId] ?? 'D'}]</button>)}
              </div>
              <button type="button" className="run-next-test" onClick={runRecommended}><Play size={13} /> Run next test</button>
            </>
          )}
        </div>
      </div>

      <div className="action-lanes-header"><strong>Test routes</strong><span>Cognee, official-record, and skeptic routes add review context only. They cannot change report coverage or mint citations.</span></div>
      <div className="action-lanes">
        {hypothesis.actions.map((action) => {
          const gate = actionGate(action)
          return (
            <button type="button" className={`action-lane gate-${gate}`} key={action.id} onClick={() => runAction(action)}>
              <span className="action-kind-icon">{action.kind === 'core' ? <FileCheck2 size={13} /> : <SponsorIcon kind={action.kind} />}</span>
              <span><small>{actionKindLabels[action.kind]} · VOI {action.voi}</small><strong>{action.label}</strong></span>
              <span className="action-cost"><b>{action.minutes}m · {action.costLabel}</b><small>{action.privacy}</small></span>
              <em>{gate === 'setup' ? 'Setup' : gate === 'budget' ? 'Budget' : gate === 'done' ? 'Done' : gate === 'optional' ? 'Optional' : gate === 'run' ? 'Run' : 'Ready'}</em>
            </button>
          )
        })}
        {hypothesis.actions.length === 0 && <div className="hold-provenance"><CirclePause size={13} /> Exact-reference mismatch closes this route. Open [10–11] above.</div>}
      </div>

      <footer className="sponsor-gates">
        {(['cognee', 'tavily', 'codex'] as const).map((service) => (
          <button type="button" key={service} onClick={onOpenSetup}>
            <SponsorIcon kind={service} />
            <span><strong>{service === 'cognee' ? 'Cognee recall' : service === 'tavily' ? 'Official records' : 'Codex skeptic'}</strong><small>{service === 'cognee' ? 'IDs · 1 recall' : service === 'tavily' ? 'Entity name · 1 search' : 'Local excerpts · 1 review run'}</small></span>
            <b className={serviceReady[service] ? 'ready' : ''}>{serviceReady[service] ? 'Ready' : 'Setup'}</b>
          </button>
        ))}
      </footer>
    </section>
  )
}
