import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  CircleX,
  Clock3,
  Code2,
  Database,
  Globe2,
  KeyRound,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react'
import { runCompilerSelfTest } from './ClaimCompiler'
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
  service: 'claim-compiler-dev-status'
  ok: true
  core: {
    demo: true
    compiler: true
  }
  environment: {
    codex: {
      installed: boolean
      authenticated: boolean
      auth?: 'chatgpt' | 'api-key' | 'unknown'
      version?: string
    }
    credentials: {
      cognee: boolean
      tavily: boolean
    }
    cogneeBase: {
      configured: boolean
      reachable: boolean | null
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

const STORAGE_KEY = 'trace:claim-compiler:endpoints:v1'

const defaultEndpoints: EndpointMap = {
  cognee: 'http://127.0.0.1:8010/health/claim-compiler',
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
    name: 'Cognee adapter',
    role: 'Relationship candidates',
    icon: BrainCircuit,
    contract: '{ service: "cognee", ok: true, mode: "local|cloud", provenanceResolver: true }',
    steps: [
      'Local: install Cognee and configure LLM + embedding providers; Ollama + Fastembed can keep the stack local.',
      'Cloud: sign in with Google or GitHub, then place COGNEE_API_KEY on the adapter server.',
      'Expose this sanitized contract only after the chunk-to-document provenance resolver passes.',
    ],
    validate: (payload) => {
      if (!isObject(payload)) return { ok: false, detail: 'Expected a JSON object' }
      const valid = payload.service === 'cognee'
        && payload.ok === true
        && (payload.mode === 'local' || payload.mode === 'cloud')
        && payload.provenanceResolver === true
      return valid ? { ok: true, detail: `${String(payload.mode)} adapter · provenance resolver ready` } : { ok: false, detail: 'JSON contract failed: service, mode, or resolver' }
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
  if (!isObject(payload) || payload.service !== 'claim-compiler-dev-status' || payload.ok !== true) return false
  if (!isObject(payload.core) || payload.core.demo !== true || payload.core.compiler !== true) return false
  if (!isObject(payload.environment) || !isObject(payload.environment.codex) || !isObject(payload.environment.credentials) || !isObject(payload.environment.cogneeBase)) return false
  if (!isObject(payload.security) || payload.security.secretsExposed !== false || payload.security.codexExecAllowed !== false) return false
  return typeof payload.environment.codex.installed === 'boolean'
    && typeof payload.environment.codex.authenticated === 'boolean'
    && typeof payload.environment.credentials.cognee === 'boolean'
    && typeof payload.environment.credentials.tavily === 'boolean'
}

function normalizeHealthUrl(value: string) {
  const url = new URL(value.trim(), window.location.href)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Use an http(s) health URL')
  if (url.username || url.password || url.search || url.hash) throw new Error('Remove credentials, query strings, and fragments')
  const loopback = url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '::1' || url.hostname === '[::1]'
  if (url.protocol === 'http:' && !loopback) throw new Error('HTTP is allowed only on loopback; use HTTPS elsewhere')
  return url.toString()
}

function StatusMark({ phase }: { phase: Phase }) {
  if (phase === 'pass') return <span className="status-mark pass" aria-label="Passed"><CheckCircle2 size={15} /></span>
  if (phase === 'fail') return <span className="status-mark fail" aria-label="Failed"><CircleX size={15} /></span>
  if (phase === 'checking') return <span className="status-mark checking" aria-label="Checking"><LoaderCircle size={15} /></span>
  return <span className="status-mark pending" aria-label="Pending"><Clock3 size={15} /></span>
}

type SetupPageProps = {
  onBack: () => void
}

export function SetupPage({ onBack }: SetupPageProps) {
  const compilerCheck = useMemo(() => runCompilerSelfTest(), [])
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
      const url = normalizeHealthUrl(endpoints[spec.id])
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
  const machinePhase = (value: boolean | undefined): Phase => localCheck.phase === 'checking' || !localStatus ? 'pending' : value ? 'pass' : 'fail'
  const cogneeBasePhase: Phase = localCheck.phase === 'checking' || !localStatus
    ? 'pending'
    : !localStatus.environment.cogneeBase.configured
      ? 'fail'
      : localStatus.environment.cogneeBase.reachable === null
        ? 'pending'
        : localStatus.environment.cogneeBase.reachable ? 'pass' : 'fail'

  return (
    <main className="setup-page">
      <section className="setup-hero">
        <div className="setup-hero-copy">
          <span><ShieldCheck size={14} /> CLAIM COMPILER SETUP</span>
          <h1>Core works now. Specialists plug in safely.</h1>
          <p>Compile dossier facts into proof certificates, then use optional tools only behind typed gates.</p>
          <button type="button" className="back-to-report" onClick={onBack}><BookOpenCheck size={14} /> Open report</button>
        </div>
        <div className="setup-actions">
          <button type="button" onClick={reset}><RotateCcw size={13} /> Reset</button>
          <button type="button" onClick={() => void testAll()}><RefreshCw size={13} /> Test all</button>
        </div>
        <div className="setup-readiness" aria-label="Core readiness">
          <StatusSummary phase={compilerCheck.ok ? 'pass' : 'fail'} label="Proof fixtures" detail={`${compilerCheck.reports} report · ${compilerCheck.holds} hold`} />
          <StatusSummary phase={sourceCheck ? 'pass' : 'fail'} label="Citation registry" detail="14 exact anchors" />
          <StatusSummary phase={reportCheck && dossierCheck ? 'pass' : 'fail'} label="Local demo" detail={`PlateJS · ${dossierDocuments.length} source previews`} />
          <StatusSummary phase={localPhase} label="Status bridge" detail={localCheck.detail} />
        </div>
      </section>

      <section className="setup-onboarding" aria-labelledby="setup-how-title">
        <header><span>01</span><div><h2 id="setup-how-title">Two-minute workflow</h2><p>No integration is required for the dossier demo.</p></div></header>
        <ol>
          <li><span>1</span><div><strong>Select a claim</strong><small>Start with F-01–F-04 or inspect held X-05.</small></div></li>
          <li><span>2</span><div><strong>Replay gates</strong><small>Facts → joins → exclusions → provenance.</small></div><ArrowRight size={13} /></li>
          <li><span>3</span><div><strong>Open atoms</strong><small>Click any anchored atom to inspect its row or page.</small></div><ArrowRight size={13} /></li>
          <li><span>4</span><div><strong>Edit the report</strong><small>Only a passing certificate supports report wording.</small></div><ArrowRight size={13} /></li>
        </ol>
      </section>

      <div className="setup-middle-grid">
        <section className="runtime-card" aria-labelledby="runtime-title">
          <header><span><Server size={14} /></span><div><h2 id="runtime-title">This machine</h2><p>Live checks; not marketing badges.</p></div><button type="button" onClick={() => void testLocalRuntime()}><RefreshCw size={12} /> Retest</button></header>
          <div className="runtime-list">
            <RuntimeRow phase={localPhase} label="Local status bridge" detail={localCheck.detail} />
            <RuntimeRow phase={machinePhase(localStatus?.environment.codex.installed)} label="Codex CLI installed" detail={localStatus?.environment.codex.version ?? 'Waiting for local bridge'} />
            <RuntimeRow phase={machinePhase(localStatus?.environment.codex.authenticated)} label="Codex CLI authenticated" detail={localStatus?.environment.codex.authenticated ? `${localStatus.environment.codex.auth ?? 'unknown'} auth detected` : 'Not detected'} />
            <RuntimeRow phase={machinePhase(localStatus?.environment.credentials.cognee)} label="Cognee credential configured" detail={localStatus?.environment.credentials.cognee ? 'Present on server' : 'Optional · absent'} />
            <RuntimeRow phase={machinePhase(localStatus?.environment.credentials.tavily)} label="Tavily credential configured" detail={localStatus?.environment.credentials.tavily ? 'Present on server' : 'Optional · absent'} />
            <RuntimeRow phase={cogneeBasePhase} label="Cognee base reachable" detail={!localStatus?.environment.cogneeBase.configured ? 'Optional base URL not configured' : localStatus.environment.cogneeBase.reachable === null ? 'Configured · connectivity probe disabled' : 'Connectivity only; adapter tested separately'} />
          </div>
        </section>

        <section className="security-card" aria-labelledby="security-title">
          <header><span><KeyRound size={14} /></span><div><h2 id="security-title">Security boundary</h2><p>Keys stop at the server.</p></div></header>
          <div className="boundary-diagram" aria-label="Integration security flow">
            <span><Globe2 size={14} /><b>Browser</b><small>endpoint URLs</small></span>
            <ArrowRight size={14} />
            <span><Server size={14} /><b>Your adapter</b><small>keys + vendor calls</small></span>
            <ArrowRight size={14} />
            <span><Code2 size={14} /><b>JSON contract</b><small>sanitized status</small></span>
          </div>
          <ul>
            <li><CheckCircle2 size={13} /><span><strong>Stored locally</strong>Only the three health endpoint URLs.</span></li>
            <li><CheckCircle2 size={13} /><span><strong>Sent by browser</strong>Credential-free GET with cookies omitted.</span></li>
            <li><CircleX size={13} /><span><strong>Never requested</strong>API keys, tokens, or vendor credentials.</span></li>
            <li><ShieldCheck size={13} /><span><strong>Not enough</strong>An HTTP 200 fails unless its JSON contract matches.</span></li>
          </ul>
        </section>
      </div>

      <section className="integration-section" aria-labelledby="integration-title">
        <header>
          <div><span>02</span><div><h2 id="integration-title">Optional specialists</h2><p>Useful proposals; never sources of truth.</p></div></div>
          <small>URLs persist in this browser · results do not</small>
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
                  <StatusMark phase={check.phase} />
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
                <code>{integration.contract}</code>
                <details>
                  <summary>Account + server setup</summary>
                  <ol>{integration.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                </details>
              </article>
            )
          })}
        </div>
      </section>

      <footer className="setup-footer">
        <span><Database size={13} /><strong>Out of box</strong>Deterministic compiler · PlateJS report · exact dossier anchors</span>
        <span><BrainCircuit size={13} /><strong>Optional</strong>Cognee recall · Tavily corroboration · Codex challenge</span>
      </footer>
    </main>
  )
}

function StatusSummary({ phase, label, detail }: { phase: Phase; label: string; detail: string }) {
  return <article><StatusMark phase={phase} /><span><strong>{label}</strong><small>{detail}</small></span></article>
}

function RuntimeRow({ phase, label, detail }: { phase: Phase; label: string; detail: string }) {
  return <div className="runtime-row"><StatusMark phase={phase} /><span><strong>{label}</strong><small>{detail}</small></span></div>
}
