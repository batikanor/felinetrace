import { createServer } from 'node:http'

const HOST = '127.0.0.1'
const PORT = Number.parseInt(process.env.TAVILY_PROXY_PORT ?? '8787', 10)
const API_BASE = 'https://api.tavily.com'
const MAX_BODY_BYTES = 32 * 1024
const HEALTH_CACHE_MS = 5 * 60 * 1000

let healthCache

function isLoopbackOrigin(origin) {
  if (!origin) return true
  try {
    const hostname = new URL(origin).hostname
    return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1' || hostname === '[::1]'
  } catch {
    return false
  }
}

function sendJson(response, status, payload, origin) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  if (origin && isLoopbackOrigin(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin)
    response.setHeader('Vary', 'Origin')
  }
  response.end(JSON.stringify(payload))
}

async function readJson(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new Error('request_too_large')
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new Error('invalid_json')
  }
}

async function tavilyRequest(path, options = {}) {
  const key = process.env.TAVILY_API_KEY?.trim()
  if (!key) throw new Error('key_not_configured')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${key}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      signal: controller.signal,
    })
    if (!response.ok) {
      if (response.status === 401) throw new Error('authentication_failed')
      if (response.status === 429) throw new Error('rate_limited')
      throw new Error(`tavily_${response.status}`)
    }
    return response.json()
  } finally {
    clearTimeout(timeout)
  }
}

async function checkHealth() {
  if (healthCache && Date.now() - healthCache.checkedAt < HEALTH_CACHE_MS) return healthCache
  try {
    const usage = await tavilyRequest('/usage')
    const limit = Number(usage?.key?.limit)
    const used = Number(usage?.key?.usage)
    healthCache = {
      ok: true,
      checkedAt: Date.now(),
      ...(Number.isFinite(limit) ? { limit } : {}),
      ...(Number.isFinite(used) ? { used } : {}),
    }
  } catch (error) {
    healthCache = {
      ok: false,
      checkedAt: Date.now(),
      error: error instanceof Error ? error.message : 'unavailable',
    }
  }
  return healthCache
}

function normalizeDomains(value) {
  if (!Array.isArray(value)) return undefined
  const domains = value
    .filter((domain) => typeof domain === 'string')
    .map((domain) => domain.trim().toLowerCase())
    .filter((domain) => /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(domain))
    .slice(0, 20)
  return domains.length ? domains : undefined
}

async function handleSearch(request, response, origin) {
  const body = await readJson(request)
  const query = typeof body?.query === 'string' ? body.query.trim() : ''
  if (query.length < 2 || query.length > 500) {
    sendJson(response, 400, { service: 'tavily', ok: false, error: 'invalid_query' }, origin)
    return
  }

  const includeDomains = normalizeDomains(body.includeDomains)
  const maxResults = Math.min(Math.max(Number.parseInt(String(body.maxResults ?? 5), 10) || 5, 1), 5)
  const result = await tavilyRequest('/search', {
    method: 'POST',
    body: JSON.stringify({
      query,
      search_depth: 'basic',
      max_results: maxResults,
      include_answer: false,
      include_raw_content: false,
      ...(includeDomains ? { include_domains: includeDomains } : {}),
    }),
  })

  sendJson(response, 200, {
    service: 'tavily',
    ok: true,
    query,
    results: Array.isArray(result?.results)
      ? result.results.slice(0, maxResults).map((item) => ({
          title: String(item?.title ?? ''),
          url: String(item?.url ?? ''),
          content: String(item?.content ?? ''),
          score: Number(item?.score ?? 0),
        }))
      : [],
    requestId: typeof result?.request_id === 'string' ? result.request_id : undefined,
  }, origin)
}

const server = createServer(async (request, response) => {
  const origin = request.headers.origin
  if (!isLoopbackOrigin(origin)) {
    sendJson(response, 403, { service: 'tavily', ok: false, error: 'loopback_only' })
    return
  }

  if (request.method === 'OPTIONS') {
    response.statusCode = 204
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (origin) response.setHeader('Access-Control-Allow-Origin', origin)
    response.end()
    return
  }

  const pathname = new URL(request.url ?? '/', `http://${HOST}:${PORT}`).pathname
  try {
    if (request.method === 'GET' && (pathname === '/health' || pathname === '/health/tavily')) {
      const health = await checkHealth()
      const legacy = pathname === '/health/tavily'
      sendJson(response, health.ok ? 200 : 503, legacy
        ? {
            service: 'tavily-proxy',
            ok: health.ok,
            keyConfigured: Boolean(process.env.TAVILY_API_KEY?.trim()),
            usageCheck: health.ok,
            mode: 'local-proxy',
          }
        : {
            service: 'tavily',
            ok: health.ok,
            mode: 'proxy',
            usageChecked: health.ok,
            keyConfigured: Boolean(process.env.TAVILY_API_KEY?.trim()),
            ...(health.ok ? {} : { error: health.error }),
          }, origin)
      return
    }

    if (request.method === 'POST' && pathname === '/search') {
      await handleSearch(request, response, origin)
      return
    }

    sendJson(response, 404, { service: 'tavily', ok: false, error: 'not_found' }, origin)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unavailable'
    const status = message === 'invalid_json' || message === 'request_too_large' ? 400 : message === 'authentication_failed' ? 401 : message === 'rate_limited' ? 429 : 502
    sendJson(response, status, { service: 'tavily', ok: false, error: message }, origin)
  }
})

server.listen(PORT, HOST, () => {
  console.log(`Tavily proxy listening on http://${HOST}:${PORT}`)
})
