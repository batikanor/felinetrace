import {
  ArrowLeft,
  BrainCircuit,
  Check,
  CircleDotDashed,
  Database,
  Globe2,
  KeyRound,
  LockKeyhole,
  Network,
  RefreshCw,
  RotateCcw,
  Server,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react'
import type {
  CheckPhase,
  ServiceId,
  SetupHealthController,
} from './useSetupHealth'

type SetupPageProps = {
  controller: SetupHealthController
  onBack: () => void
  onNotice: (message: string) => void
}

type StatusMarkProps = {
  phase: CheckPhase
}

function StatusMark({ phase }: StatusMarkProps) {
  if (phase === 'pending') return <span className="status-mark pending" aria-label="Pending"><CircleDotDashed size={13} /></span>
  if (phase === 'ok') return <span className="status-mark ok" aria-label="Passed"><Check size={13} /></span>
  if (phase === 'error') return <span className="status-mark error" aria-label="Unavailable"><X size={13} /></span>
  return <span className="status-mark idle" aria-label="Not tested">–</span>
}

function serviceIcon(service: ServiceId) {
  if (service === 'cognee') return <BrainCircuit size={16} />
  if (service === 'tavily') return <Globe2 size={16} />
  return <Terminal size={16} />
}

const serviceCopy = {
  cognee: {
    name: 'Local Cognee memory',
    tags: 'Self-hosted · IDs/relationships',
    contract: `{ "service":"cognee", "ok":true, "mode":"local", "selfHosted":true, "apiVersion":"v1" }`,
  },
  tavily: {
    name: 'Tavily official-record proxy',
    tags: 'Optional · entity names · 1 search',
    contract: `{ "service":"tavily", "ok":true, "mode":"proxy", "usageChecked":true }`,
  },
  codex: {
    name: 'Codex reviewer sidecar',
    tags: 'Optional · local excerpts · 1 review run',
    contract: `{ "service":"codex", "ok":true, "auth":"chatgpt", "sandbox":"read-only" }`,
  },
}

export function SetupPage({ controller, onBack, onNotice }: SetupPageProps) {
  const {
    endpoints,
    adapterChecks,
    runtimePhase,
    runtimeStatus,
    runtimeMessage,
    setEndpoint,
    testEndpoint,
    testAll,
    resetSetup,
  } = controller

  const runtimeCheckPhase = (condition: boolean | undefined): CheckPhase => {
    if (runtimePhase === 'pending') return 'pending'
    if (runtimePhase === 'error' || condition !== true) return 'error'
    return 'ok'
  }

  const testEverything = async () => {
    await testAll()
    onNotice('Setup checks complete')
  }

  const reset = () => {
    resetSetup()
    onNotice('Setup reset')
  }

  return (
    <main className="setup-page">
      <section className="setup-hero">
        <button type="button" className="setup-back" onClick={onBack}><ArrowLeft size={14} /> Investigation</button>
        <div>
          <span>ONBOARDING + RUNTIME</span>
          <h1>Setup</h1>
          <p>Core dossier tests work locally. Optional services stay behind sanitized server adapters.</p>
        </div>
        <div className="setup-hero-actions">
          <button type="button" onClick={reset}><RotateCcw size={13} /> Reset</button>
          <button type="button" className="test-all-button" onClick={() => void testEverything()}><RefreshCw size={13} /> Test all</button>
        </div>
      </section>

      <section className="setup-method-card">
        <header><span><Network size={14} /> Complete method</span><small>Deterministic first</small></header>
        <div className="setup-method-steps">
          <div><b>1</b><span><strong>Load</strong><small>35-file dossier · exact rows</small></span></div>
          <div><b>2</b><span><strong>Hypothesize</strong><small>Claims ↔ cited evidence</small></span></div>
          <div><b>3</b><span><strong>Choose</strong><small>VOI within time + requests</small></span></div>
          <div><b>4</b><span><strong>Decide</strong><small>Test · report · stop · hold</small></span></div>
        </div>
        <p>The configurable demo heuristic ranks tests by expected gap closure, contradiction value, time, and requests. Its 85% / 15% report threshold is a presentation rule—not evaluation truth or model confidence. X-05 shows a rejected alternative with exact-reference provenance.</p>
      </section>

      <div className="setup-top-grid">
        <section className="runtime-card">
          <header><span><Database size={14} /> Runtime checks</span><small>{runtimeMessage}</small></header>
          <div className="runtime-list" aria-live="polite">
            <div><StatusMark phase={runtimeCheckPhase(runtimeStatus?.core.ok)} /><span><strong>Zero-config demo</strong><small>Local deterministic path</small></span></div>
            <div><StatusMark phase={runtimeCheckPhase(runtimeStatus?.core.findings === 4)} /><span><strong>Four corrected findings</strong><small>Demo finding registry</small></span></div>
            <div><StatusMark phase={runtimeCheckPhase(runtimeStatus?.core.citations === 14)} /><span><strong>Fourteen citations</strong><small>Exact source anchors</small></span></div>
            <div><StatusMark phase={runtimeCheckPhase(runtimeStatus?.codexCli.installed)} /><span><strong>Codex CLI installed</strong><small>{runtimeStatus?.codexCli.version ?? 'Not detected'}</small></span></div>
            <div><StatusMark phase={runtimeCheckPhase(runtimeStatus?.codexCli.authenticated)} /><span><strong>Codex CLI authenticated</strong><small>{runtimeStatus?.codexCli.auth === 'chatgpt' ? 'ChatGPT login' : 'Not detected'}</small></span></div>
          </div>
        </section>

        <section className="zero-config-card">
          <header><span><ShieldCheck size={14} /> Zero-config path</span><small>Ready now</small></header>
          <ul>
            <li><Check size={12} /> Plate report, editing, comments</li>
            <li><Check size={12} /> 14 exact dossier citations</li>
            <li><Check size={12} /> Deterministic checks + demo VOI planner</li>
            <li><Check size={12} /> X-05 false-positive hold</li>
            <li><Check size={12} /> Manual cases + source windows</li>
          </ul>
          <div className="setup-architecture">
            <span>Browser</span><b>→</b><span>Local dossier</span><b>→</b><span>Report</span>
          </div>
          <p>Cognee, Tavily, and Codex can suggest recall, corroboration, or critique. None can overwrite the cited dossier conclusion.</p>
        </section>
      </div>

      <section className="adapter-section">
        <header>
          <div><span>OPTIONAL SERVICES</span><h2>Health adapters</h2></div>
          <p>Enter non-secret health URLs only. The browser never accepts API keys.</p>
        </header>
        <div className="adapter-grid">
          {(['cognee', 'tavily', 'codex'] as const).map((service) => {
            const copy = serviceCopy[service]
            const check = adapterChecks[service]
            return (
              <article className="adapter-card" key={service}>
                <header><span className="adapter-icon">{serviceIcon(service)}</span><div><h3>{copy.name}</h3><small>{copy.tags}</small></div></header>
                <label>
                  <span>Server health endpoint</span>
                  <div><input value={endpoints[service]} onChange={(event) => setEndpoint(service, event.target.value)} spellCheck={false} /><button type="button" onClick={() => void testEndpoint(service)}>Test</button></div>
                </label>
                <div className={`adapter-message ${check.phase}`} aria-live="polite">{check.message}</div>
                <code>{copy.contract}</code>
              </article>
            )
          })}
        </div>
      </section>

      <div className="setup-bottom-grid">
        <section className="setup-instructions">
          <header><KeyRound size={14} /> Accounts, keys, servers</header>
          <details open>
            <summary>Cognee · self-hosted</summary>
            <p>Run <code>services/cognee-local/start.sh</code>. Cognee, Ollama, SQLite, LanceDB, and Kuzu remain on this machine. No Cognee account or Cognee API key is used.</p>
          </details>
          <details>
            <summary>Tavily · official-record proxy</summary>
            <p>Run <code>services/tavily-proxy/start.sh</code>. The local proxy loads its ignored key file and returns sanitized health; focused official-domain searches remain corroboration only.</p>
          </details>
          <details>
            <summary>Codex · CLI vs reviewer sidecar</summary>
            <p>Run <code>services/codex-reviewer/start.sh</code>. It reuses the local ChatGPT sign-in and runs schema-validated reviews in an ephemeral read-only sandbox.</p>
          </details>
        </section>

        <section className="security-card">
          <header><LockKeyhole size={14} /> Security boundaries</header>
          <ul>
            <li><Check size={12} /> Browser stores endpoint URLs only</li>
            <li><Check size={12} /> No API-key inputs or vendor calls</li>
            <li><Check size={12} /> HTTP only on loopback; HTTPS elsewhere</li>
            <li><Check size={12} /> Health responses are contract-validated</li>
            <li><Check size={12} /> Status route returns no token text</li>
            <li><Check size={12} /> External actions off in benchmark scoring unless allowed</li>
          </ul>
          <div className="server-boundary"><Server size={15} /><span><strong>Server boundary</strong><small>Keys · vendor SDKs · caching · audit log</small></span></div>
          <p>The setup-status plugin is development-only and the demo server binds to loopback.</p>
        </section>
      </div>
    </main>
  )
}
