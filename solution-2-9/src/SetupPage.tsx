import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BrainCircuit,
  CheckCircle2,
  CircleX,
  Clock3,
  Globe2,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  TerminalSquare,
} from 'lucide-react'
import { dossierDocuments, findings, reportValue } from './caseData'
import './setup.css'

type Phase = 'pending' | 'checking' | 'pass' | 'fail'
type IntegrationId = 'cognee' | 'tavily' | 'codex'

type CheckResult = {
  phase: Phase
  detail: string
}

type EndpointMap = Record<IntegrationId, string>

type LocalStatusPayload = {
  service: 'adaptive-router-dev-status'
  ok: true
  core: {
    demo: true
    router: true
  }
  environment: {
    codex: {
      installed: boolean
      authenticated: boolean
      auth?: 'chatgpt' | 'api-key' | 'unknown'
      version?: string
    }
    credentials: {
      tavily: boolean
    }
  }
  security: {
    secretsExposed: false
    codexExecAllowed: false
  }
}

type IntegrationSpec = {
  id: IntegrationId
  name: string
  role: string
  icon: typeof BrainCircuit
  contract: string
  steps: string[]
  validate: (payload: unknown) => { ok: boolean; detail: string }
}

const STORAGE_KEY = 'trace:adaptive-router:endpoints:v2'

const defaultEndpoints: EndpointMap = {
  cognee: 'http://127.0.0.1:43110/health',
  tavily: 'http://127.0.0.1:8787/health/tavily',
  codex: 'http://127.0.0.1:4010/health',
}

const pendingChecks: Record<IntegrationId, CheckResult> = {
  cognee: { phase: 'pending', detail: 'Not tested' },
  tavily: { phase: 'pending', detail: 'Not tested' },
  codex: { phase: 'pending', detail: 'Not tested' },
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

const integrations: IntegrationSpec[] = [
  {
    id: 'cognee',
    name: 'Local Cognee',
    role: 'Self-hosted memory',
    icon: BrainCircuit,
    contract: '{ service: "cognee", ok: true, mode: "local", selfHosted: true, apiVersion: "v1" }',
    steps: [
      'Start services/cognee-local on this machine.',
      'Ollama supplies both the LLM and embeddings.',
      'Local only; no Cognee account or key.',
    ],
    validate: (payload) => {
      if (!isObject(payload)) return { ok: false, detail: 'Expected a JSON object' }
      const valid = payload.service === 'cognee'
        && payload.ok === true
        && payload.mode === 'local'
        && payload.selfHosted === true
        && payload.apiVersion === 'v1'
      return valid ? { ok: true, detail: `Self-hosted · ${String(payload.build ?? 'local')}` } : { ok: false, detail: 'Local Cognee or required models are unavailable' }
    },
  },
  {
    id: 'tavily',
    name: 'Tavily proxy',
    role: 'Public corroboration',
    icon: Globe2,
    contract: '{ service: "tavily-proxy", ok: true, keyConfigured: true, usageCheck: true }',
    steps: [
      'Create a Tavily account and API key; free credits are sufficient for the demo path.',
      'Set TAVILY_API_KEY on the proxy server, never in a browser variable.',
      'Have the proxy validate /usage server-side and return only this sanitized contract.',
    ],
    validate: (payload) => {
      if (!isObject(payload)) return { ok: false, detail: 'Expected a JSON object' }
      const valid = payload.service === 'tavily-proxy'
        && payload.ok === true
        && payload.keyConfigured === true
        && payload.usageCheck === true
      return valid ? { ok: true, detail: 'Proxy key + usage check ready' } : { ok: false, detail: 'JSON contract failed: proxy or usage check' }
    },
  },
  {
    id: 'codex',
    name: 'Codex reviewer sidecar',
    role: 'Wording challenge',
    icon: TerminalSquare,
    contract: '{ service: "codex", ok: true, auth: "chatgpt", sandbox: "read-only" }',
    steps: [
      'Install Codex locally and sign in with ChatGPT on the machine running the sidecar.',
      'Run a loopback-only sidecar with workspace writes disabled and a fixed review schema.',
      'CLI authentication and sidecar readiness are separate checks; this page never runs codex exec.',
    ],
    validate: (payload) => {
      if (!isObject(payload)) return { ok: false, detail: 'Expected a JSON object' }
      const valid = payload.service === 'codex'
        && payload.ok === true
        && payload.auth === 'chatgpt'
        && payload.sandbox === 'read-only'
      return valid ? { ok: true, detail: 'Authenticated sidecar · workspace writes disabled' } : { ok: false, detail: 'JSON contract failed: auth or sandbox' }
    },
  },
]

function readStoredEndpoints(): EndpointMap {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<EndpointMap>
    return {
      cognee: typeof parsed.cognee === 'string' ? parsed.cognee : defaultEndpoints.cognee,
      tavily: typeof parsed.tavily === 'string' ? parsed.tavily : defaultEndpoints.tavily,
      codex: typeof parsed.codex === 'string' ? parsed.codex : defaultEndpoints.codex,
    }
  } catch {
    return defaultEndpoints
  }
}

function validateLocalPayload(payload: unknown): payload is LocalStatusPayload {
  if (!isObject(payload) || payload.service !== 'adaptive-router-dev-status' || payload.ok !== true) return false
  if (!isObject(payload.core) || payload.core.demo !== true || payload.core.router !== true) return false
  if (!isObject(payload.environment) || !isObject(payload.environment.codex) || !isObject(payload.environment.credentials)) return false
  if (!isObject(payload.security) || payload.security.secretsExposed !== false || payload.security.codexExecAllowed !== false) return false
  return typeof payload.environment.codex.installed === 'boolean'
    && typeof payload.environment.codex.authenticated === 'boolean'
    && typeof payload.environment.credentials.tavily === 'boolean'
}

function normalizeHealthUrl(value: string, localOnly = false) {
  const url = new URL(value.trim(), window.location.href)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Use an http(s) health URL')
  if (url.username || url.password || url.search || url.hash) throw new Error('Remove credentials, query strings, and fragments')
  const loopback = url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '::1' || url.hostname === '[::1]'
  if (localOnly && !loopback) throw new Error('Cognee must run on loopback')
  if (url.protocol === 'http:' && !loopback) throw new Error('HTTP is allowed only on loopback; use HTTPS elsewhere')
  return url.toString()
}

function StatusMark({ phase }: { phase: Phase }) {
  if (phase === 'pass') return <span className="status-mark pass" aria-label="Passed"><CheckCircle2 size={15} /></span>
  if (phase === 'fail') return <span className="status-mark fail" aria-label="Failed"><CircleX size={15} /></span>
  if (phase === 'checking') return <span className="status-mark checking" aria-label="Checking"><LoaderCircle size={15} /></span>
  return <span className="status-mark pending" aria-label="Pending"><Clock3 size={15} /></span>
}

export function SetupPage() {
  const routerCheck = findings.length === 4
  const citedSources = useMemo(() => Array.from(new Map(findings.flatMap((finding) => finding.sources).map((source) => [source.id, source])).values()), [])
  const sourceCheck = citedSources.length === 14
    && new Set(citedSources.map((source) => source.id)).size === 14
    && citedSources.every((source) => source.name && source.location && source.passage)
  const reportCheck = Array.isArray(reportValue) && reportValue.length >= 20
  const dossierCheck = dossierDocuments.length >= 20

  const [endpoints, setEndpoints] = useState<EndpointMap>(readStoredEndpoints)
  const [integrationChecks, setIntegrationChecks] = useState<Record<IntegrationId, CheckResult>>(pendingChecks)
  const [localCheck, setLocalCheck] = useState<CheckResult>({ phase: 'pending', detail: 'Waiting for local status bridge' })
  const [localStatus, setLocalStatus] = useState<LocalStatusPayload | null>(null)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(endpoints))
  }, [endpoints])

  const testLocalRuntime = useCallback(async () => {
    setLocalCheck({ phase: 'checking', detail: 'Validating sanitized local JSON' })
    try {
      const response = await fetch('/api/setup/status', { headers: { Accept: 'application/json' }, credentials: 'omit', cache: 'no-store' })
      const text = await response.text()
      let payload: unknown
      try {
        payload = JSON.parse(text)
      } catch {
        throw new Error('Local bridge returned non-JSON content')
      }
      if (!response.ok || !validateLocalPayload(payload)) throw new Error('Local JSON contract failed')
      setLocalStatus(payload)
      setLocalCheck({ phase: 'pass', detail: 'Dev bridge verified · no secrets returned' })
    } catch (error) {
      setLocalStatus(null)
      setLocalCheck({ phase: 'fail', detail: error instanceof Error ? error.message : 'Local bridge unavailable' })
    }
  }, [])

  useEffect(() => {
    void testLocalRuntime()
  }, [testLocalRuntime])

  const testIntegration = async (spec: IntegrationSpec) => {
    setIntegrationChecks((checks) => ({ ...checks, [spec.id]: { phase: 'checking', detail: 'Fetching and validating JSON' } }))
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 3600)
    try {
      const url = normalizeHealthUrl(endpoints[spec.id], spec.id === 'cognee')
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'omit',
        cache: 'no-store',
        signal: controller.signal,
      })
      const text = await response.text()
      let payload: unknown
      try {
        payload = JSON.parse(text)
      } catch {
        throw new Error(`HTTP ${response.status} returned non-JSON content`)
      }
      if (!response.ok) throw new Error(`Health request failed · HTTP ${response.status}`)
      const contract = spec.validate(payload)
      if (!contract.ok) throw new Error(contract.detail)
      setIntegrationChecks((checks) => ({ ...checks, [spec.id]: { phase: 'pass', detail: contract.detail } }))
    } catch (error) {
      const detail = error instanceof DOMException && error.name === 'AbortError'
        ? 'Timed out after 3.6s'
        : error instanceof Error ? error.message : 'Health check failed'
      setIntegrationChecks((checks) => ({ ...checks, [spec.id]: { phase: 'fail', detail } }))
    } finally {
      window.clearTimeout(timeoutId)
    }
  }

  const testAll = async () => {
    await Promise.all([testLocalRuntime(), ...integrations.map((integration) => testIntegration(integration))])
  }

  const reset = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setEndpoints(defaultEndpoints)
    setIntegrationChecks(pendingChecks)
  }

  const localPhase: Phase = localCheck.phase === 'checking' ? 'checking' : localStatus ? 'pass' : localCheck.phase
  return (
    <main className="setup-page">
      <section className="setup-hero">
        <div className="setup-hero-copy">
          <h1>Setup</h1>
        </div>
        <div className="setup-actions">
          <button type="button" onClick={reset}><RotateCcw size={13} /> Reset</button>
          <button type="button" onClick={() => void testAll()}><RefreshCw size={13} /> Test all</button>
        </div>
        <div className="setup-readiness" aria-label="Core readiness">
          <StatusSummary phase={routerCheck ? 'pass' : 'fail'} label="Finding routes" detail="4 routes" />
          <StatusSummary phase={sourceCheck ? 'pass' : 'fail'} label="Citation registry" detail="14 exact anchors" />
          <StatusSummary phase={reportCheck && dossierCheck ? 'pass' : 'fail'} label="Local demo" detail={`PlateJS · ${dossierDocuments.length} source previews`} />
          <StatusSummary phase={localPhase} label="Status bridge" detail={localCheck.detail} />
        </div>
      </section>

      <section className="integration-section" aria-labelledby="integration-title">
        <header>
          <div><div><h2 id="integration-title">Integrations</h2></div></div>
        </header>
        <div className="integration-grid">
          {integrations.map((integration) => {
            const Icon = integration.icon
            const check = integrationChecks[integration.id]
            return (
              <article className={`integration-card ${check.phase}`} key={integration.id}>
                <header>
                  <span><Icon size={16} /></span>
                  <div><h3>{integration.name}</h3><p>{integration.role}</p></div>
                </header>
                <label htmlFor={`endpoint-${integration.id}`}>Server health endpoint</label>
                <div className="endpoint-control">
                  <input
                    id={`endpoint-${integration.id}`}
                    type="url"
                    value={endpoints[integration.id]}
                    onChange={(event) => setEndpoints((items) => ({ ...items, [integration.id]: event.target.value }))}
                    autoComplete="url"
                    spellCheck={false}
                  />
                  <button type="button" onClick={() => void testIntegration(integration)} disabled={check.phase === 'checking'}>
                    {check.phase === 'checking' ? <LoaderCircle size={12} /> : <RefreshCw size={12} />} Test
                  </button>
                </div>
                <div className="integration-result"><StatusMark phase={check.phase} /><span><strong>{check.phase === 'pending' ? 'Pending' : check.phase === 'checking' ? 'Checking' : check.phase === 'pass' ? 'Passed' : 'Failed'}</strong><small>{check.detail}</small></span></div>
                <details>
                  <summary>Setup</summary>
                  <ol>{integration.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                  <code>{integration.contract}</code>
                </details>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function StatusSummary({ phase, label, detail }: { phase: Phase; label: string; detail: string }) {
  return <article><StatusMark phase={phase} /><span><strong>{label}</strong><small>{detail}</small></span></article>
}
