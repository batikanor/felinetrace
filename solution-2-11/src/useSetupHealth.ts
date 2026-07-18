import { useCallback, useEffect, useState } from 'react'

export type ServiceId = 'cognee' | 'tavily' | 'codex'
export type CheckPhase = 'idle' | 'pending' | 'ok' | 'error'

export type AdapterCheck = {
  phase: CheckPhase
  message: string
}

export type EndpointUrls = Record<ServiceId, string>

export type RuntimeStatus = {
  core: {
    ok: boolean
    mode: string
    findings: number
    citations: number
  }
  codexCli: {
    installed: boolean
    version: string | null
    authenticated: boolean
    auth: string | null
  }
  credentials: {
    tavilyConfigured: boolean
  }
  adapters: {
    cogneeReady: boolean
    tavilyReady: boolean
    codexSidecarReady: boolean
  }
  checkedAt: string
}

const endpointStorageKey = 'trace.investigation.endpoint-urls.v2'

export const defaultEndpointUrls: EndpointUrls = {
  cognee: 'http://127.0.0.1:43110/health',
  tavily: 'http://127.0.0.1:43102/health',
  codex: 'http://127.0.0.1:43103/health',
}

const idleChecks: Record<ServiceId, AdapterCheck> = {
  cognee: { phase: 'idle', message: 'Not tested' },
  tavily: { phase: 'idle', message: 'Not tested' },
  codex: { phase: 'idle', message: 'Not tested' },
}

function loadEndpointUrls(): EndpointUrls {
  try {
    const saved = window.localStorage.getItem(endpointStorageKey)
    if (!saved) return defaultEndpointUrls
    const parsed = JSON.parse(saved) as Partial<EndpointUrls>
    return {
      cognee: typeof parsed.cognee === 'string' ? parsed.cognee : defaultEndpointUrls.cognee,
      tavily: typeof parsed.tavily === 'string' ? parsed.tavily : defaultEndpointUrls.tavily,
      codex: typeof parsed.codex === 'string' ? parsed.codex : defaultEndpointUrls.codex,
    }
  } catch {
    return defaultEndpointUrls
  }
}

function validateEndpoint(endpoint: string) {
  try {
    const url = new URL(endpoint)
    if (!['http:', 'https:'].includes(url.protocol)) return 'Use an HTTP(S) health URL.'
    const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
    if (url.protocol === 'http:' && !loopback) return 'Use HTTPS outside loopback.'
    return ''
  } catch {
    return 'Enter a valid health URL.'
  }
}

function validateHealthContract(service: ServiceId, body: Record<string, unknown>) {
  if (body.service !== service || body.ok !== true) return ''
  if (service === 'cognee') {
    return body.mode === 'local' && body.selfHosted === true && body.apiVersion === 'v1'
      ? `Ready · self-hosted · ${String(body.build ?? 'local')}`
      : ''
  }
  if (service === 'tavily') {
    return body.mode === 'proxy' && body.usageChecked === true ? 'Ready · server proxy' : ''
  }
  return body.auth === 'chatgpt' && body.sandbox === 'read-only' ? 'Ready · ChatGPT · read-only' : ''
}

export function useSetupHealth() {
  const [endpoints, setEndpoints] = useState<EndpointUrls>(loadEndpointUrls)
  const [adapterChecks, setAdapterChecks] = useState<Record<ServiceId, AdapterCheck>>(idleChecks)
  const [runtimePhase, setRuntimePhase] = useState<CheckPhase>('pending')
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null)
  const [runtimeMessage, setRuntimeMessage] = useState('Checking local runtime')

  useEffect(() => {
    window.localStorage.setItem(endpointStorageKey, JSON.stringify(endpoints))
  }, [endpoints])

  const refreshRuntime = useCallback(async () => {
    setRuntimePhase('pending')
    setRuntimeMessage('Checking local runtime')
    try {
      const response = await fetch('/api/setup/status', { headers: { Accept: 'application/json' } })
      if (!response.ok) throw new Error('status route unavailable')
      const body = await response.json() as RuntimeStatus
      if (body.core?.ok !== true || typeof body.codexCli?.installed !== 'boolean') throw new Error('invalid status contract')
      setRuntimeStatus(body)
      setRuntimePhase('ok')
      setRuntimeMessage('Local runtime checked')
    } catch {
      setRuntimeStatus(null)
      setRuntimePhase('error')
      setRuntimeMessage('Dev status route unavailable')
    }
  }, [])

  useEffect(() => {
    void refreshRuntime()
  }, [refreshRuntime])

  const setEndpoint = useCallback((service: ServiceId, value: string) => {
    setEndpoints((current) => ({ ...current, [service]: value }))
    setAdapterChecks((current) => ({ ...current, [service]: { phase: 'idle', message: 'Not tested' } }))
  }, [])

  const testEndpoint = useCallback(async (service: ServiceId) => {
    const endpoint = endpoints[service].trim()
    const validationError = validateEndpoint(endpoint)
      || (service === 'cognee' && !['127.0.0.1', 'localhost', '[::1]'].includes(new URL(endpoint).hostname) ? 'Cognee must run on loopback.' : '')
    if (validationError) {
      setAdapterChecks((current) => ({ ...current, [service]: { phase: 'error', message: validationError } }))
      return false
    }

    setAdapterChecks((current) => ({ ...current, [service]: { phase: 'pending', message: 'Testing JSON contract' } }))
    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 3500)
      const response = await fetch(endpoint, { signal: controller.signal, headers: { Accept: 'application/json' } })
      window.clearTimeout(timeout)
      if (!response.ok) throw new Error('health request failed')
      const body = await response.json() as Record<string, unknown>
      const message = validateHealthContract(service, body)
      if (!message) throw new Error('invalid contract')
      setAdapterChecks((current) => ({ ...current, [service]: { phase: 'ok', message } }))
      return true
    } catch {
      setAdapterChecks((current) => ({ ...current, [service]: { phase: 'error', message: 'Unavailable or invalid JSON' } }))
      return false
    }
  }, [endpoints])

  const testAll = useCallback(async () => {
    await Promise.all([
      refreshRuntime(),
      testEndpoint('cognee'),
      testEndpoint('tavily'),
      testEndpoint('codex'),
    ])
  }, [refreshRuntime, testEndpoint])

  const resetSetup = useCallback(() => {
    window.localStorage.removeItem(endpointStorageKey)
    setEndpoints(defaultEndpointUrls)
    setAdapterChecks(idleChecks)
    void refreshRuntime()
  }, [refreshRuntime])

  return {
    endpoints,
    adapterChecks,
    runtimePhase,
    runtimeStatus,
    runtimeMessage,
    setEndpoint,
    testEndpoint,
    testAll,
    resetSetup,
    refreshRuntime,
  }
}

export type SetupHealthController = ReturnType<typeof useSetupHealth>
