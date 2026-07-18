import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  Building2,
  FileSearch,
  Globe2,
  Landmark,
  Plus,
  RotateCw,
  SearchCheck,
  ShieldCheck,
} from 'lucide-react'
import {
  publicCheckResults,
  publicEntities,
  publicRouters,
  publicStatusLabels,
} from './publicCheckData'
import type {
  AuthorityTier,
  PublicCheckResult,
  PublicCheckStatus,
  PublicRouterKey,
} from './publicCheckData'

type PublicChecksProps = {
  onAddCase: () => void
  onOpenResult: (result: PublicCheckResult) => void
  onReplayComplete: () => void
}

type SelectFilter<T extends string> = 'all' | T

function RouterIcon({ router }: { router: PublicRouterKey }) {
  if (router === 'register') return <Building2 size={13} />
  if (router === 'vies') return <BadgeCheck size={13} />
  if (router === 'sanctions') return <ShieldCheck size={13} />
  if (router === 'filings') return <Landmark size={13} />
  return <Globe2 size={13} />
}

export function PublicChecks({ onAddCase, onOpenResult, onReplayComplete }: PublicChecksProps) {
  const [entityFilter, setEntityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<SelectFilter<PublicCheckStatus>>('all')
  const [tierFilter, setTierFilter] = useState<SelectFilter<AuthorityTier>>('all')
  const [routerFilter, setRouterFilter] = useState<SelectFilter<PublicRouterKey>>('all')
  const [running, setRunning] = useState(false)
  const [replayCount, setReplayCount] = useState(0)

  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => {
      setRunning(false)
      setReplayCount((count) => count + 1)
      onReplayComplete()
    }, 720)
    return () => window.clearTimeout(timer)
  }, [running, onReplayComplete])

  const filteredResults = publicCheckResults.filter((result) => (
    (entityFilter === 'all' || result.entityId === entityFilter)
    && (statusFilter === 'all' || result.status === statusFilter)
    && (tierFilter === 'all' || result.tier === tierFilter)
    && (routerFilter === 'all' || result.router === routerFilter)
  ))

  return (
    <section className="public-checks" aria-labelledby="public-checks-title">
      <header className="public-checks-header">
        <div className="public-checks-title">
          <span className="replay-badge"><RotateCw size={10} /> REPLAY SAMPLE · NO LIVE KEY</span>
          <h2 id="public-checks-title">Public checks</h2>
        </div>
        <div className="public-check-actions">
          <button type="button" className="public-add-case" onClick={onAddCase}><Plus size={13} /> Add case</button>
          <button type="button" className="replay-checks" disabled={running} onClick={() => setRunning(true)}>
            <RotateCw size={13} className={running ? 'spinning' : ''} /> {running ? 'Replaying' : 'Replay checks'}
          </button>
        </div>
      </header>

      <div className="public-check-policy">
        <span><SearchCheck size={12} /> Corroboration only · dossier citations remain primary</span>
        <span className="authority-legend"><b>T1</b> authority <b>T2</b> primary publisher <b>T3</b> open web</span>
      </div>

      <div className="query-router" aria-label="Query router">
        {publicRouters.map((router) => {
          const resultCount = publicCheckResults.filter((result) => result.router === router.key).length
          const active = routerFilter === router.key
          return (
            <button
              type="button"
              className={active ? 'active' : ''}
              key={router.key}
              onClick={() => setRouterFilter(active ? 'all' : router.key)}
            >
              <span className="router-icon"><RouterIcon router={router.key} /></span>
              <span><strong>{router.label}</strong><small>{router.detail}</small></span>
              <b>{router.tier}</b>
              <em>{resultCount}</em>
            </button>
          )
        })}
      </div>

      <div className="public-check-controls">
        <label>
          <span>Focus entity</span>
          <select value={entityFilter} onChange={(event) => setEntityFilter(event.target.value)}>
            <option value="all">All entities</option>
            {publicEntities.map((entity) => <option value={entity.id} key={entity.id}>{entity.label}</option>)}
          </select>
        </label>
        <label>
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as SelectFilter<PublicCheckStatus>)}>
            <option value="all">All statuses</option>
            <option value="corroborates">Corroborates</option>
            <option value="review">Review</option>
            <option value="no-sample-hit">No sample hit</option>
          </select>
        </label>
        <label>
          <span>Authority</span>
          <select value={tierFilter} onChange={(event) => setTierFilter(event.target.value as SelectFilter<AuthorityTier>)}>
            <option value="all">All tiers</option>
            <option value="T1">T1 · authority</option>
            <option value="T2">T2 · publisher</option>
            <option value="T3">T3 · open web</option>
          </select>
        </label>
        <span className="public-result-count"><FileSearch size={12} /> {filteredResults.length} results · replay {replayCount + 1}</span>
      </div>

      <div className="public-results">
        {filteredResults.map((result) => (
          <button type="button" className="public-result" key={result.id} onClick={() => onOpenResult(result)}>
            <span className={`public-status ${result.status}`} />
            <span className="public-result-copy">
              <small>{result.id} · {result.entity}</small>
              <strong>{result.title}</strong>
              <span>{result.authority}</span>
            </span>
            <span className="public-result-meta">
              <b>{result.tier}</b>
              <small>{publicStatusLabels[result.status]}</small>
            </span>
          </button>
        ))}
        {filteredResults.length === 0 && <div className="public-empty">No replay fixtures match.</div>}
      </div>
    </section>
  )
}
