import { createServer } from 'node:http'

const port = Number(process.env.PORT || 43110)
const cogneeUrl = process.env.COGNEE_LOCAL_URL || 'http://127.0.0.1:8000'
const ollamaUrl = process.env.OLLAMA_LOCAL_URL || 'http://127.0.0.1:11434'
const llmModel = process.env.COGNEE_LLM_MODEL || 'llama3.1:8b'
const embeddingModel = process.env.COGNEE_EMBEDDING_MODEL || 'nomic-embed-text:latest'
const build = process.env.COGNEE_BUILD || 'local'

async function fetchWithTimeout(url, asJson = false) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2500)
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: asJson ? 'application/json' : '*/*' } })
    if (!response.ok) return { ok: false, value: null }
    return { ok: true, value: asJson ? await response.json() : await response.text() }
  } catch {
    return { ok: false, value: null }
  } finally {
    clearTimeout(timeout)
  }
}

async function status() {
  const [health, openapi, ollama] = await Promise.all([
    fetchWithTimeout(`${cogneeUrl}/health`),
    fetchWithTimeout(`${cogneeUrl}/openapi.json`, true),
    fetchWithTimeout(`${ollamaUrl}/api/tags`, true),
  ])

  const paths = openapi.value && typeof openapi.value === 'object' && openapi.value.paths
    ? Object.keys(openapi.value.paths)
    : []
  const apiReady = paths.includes('/api/v1/remember') && paths.includes('/api/v1/recall')
  const modelNames = Array.isArray(ollama.value?.models)
    ? ollama.value.models.map((model) => model?.name).filter(Boolean)
    : []
  const llmReady = modelNames.includes(llmModel)
  const embeddingReady = modelNames.includes(embeddingModel)

  return {
    service: 'cognee',
    ok: health.ok && openapi.ok && apiReady && ollama.ok && llmReady && embeddingReady,
    mode: 'local',
    selfHosted: true,
    apiVersion: 'v1',
    build,
    authentication: 'disabled-loopback',
    stores: ['sqlite', 'lancedb', 'kuzu'],
    operations: apiReady ? ['remember', 'recall', 'improve', 'forget'] : [],
    models: {
      llm: { name: llmModel, ready: llmReady },
      embedding: { name: embeddingModel, ready: embeddingReady },
    },
    checks: {
      cognee: health.ok,
      openapi: openapi.ok && apiReady,
      ollama: ollama.ok,
    },
  }
}

async function readJson(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 16_384) throw new Error('Request too large')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function recallText(payload) {
  const values = Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : [payload]
  return values
    .map((value) => typeof value === 'string'
      ? value
      : typeof value?.text === 'string' ? value.text
        : typeof value?.content === 'string' ? value.content
          : typeof value?.answer === 'string' ? value.answer : '')
    .filter(Boolean)
    .join('\n\n')
}

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('X-Content-Type-Options', 'nosniff')

  if (request.method === 'OPTIONS') {
    response.statusCode = 204
    response.end()
    return
  }

  const path = new URL(request.url || '/', 'http://localhost').pathname
  if (request.method === 'POST' && path === '/recall') {
    try {
      const body = await readJson(request)
      const query = typeof body.query === 'string' ? body.query.trim() : ''
      if (!query || query.length > 1_000) throw new Error('Query must be 1–1000 characters')
      const cogneeResponse = await fetch(`${cogneeUrl}/api/v1/recall`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, datasets: ['audit-muster-2025'], search_type: 'GRAPH_COMPLETION', top_k: 8 }),
      })
      const payload = await cogneeResponse.json()
      if (!cogneeResponse.ok) throw new Error(`Cognee recall failed (${cogneeResponse.status})`)
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.end(JSON.stringify({ service: 'cognee', ok: true, mode: 'local', dataset: 'audit-muster-2025', answer: recallText(payload), results: payload }))
    } catch (error) {
      response.statusCode = 502
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.end(JSON.stringify({ service: 'cognee', ok: false, error: error instanceof Error ? error.message : 'Recall failed' }))
    }
    return
  }

  if (request.method !== 'GET' || !['/health', '/health/adaptive-router', '/health/claim-compiler', '/health/investigation-planner'].includes(path)) {
    response.statusCode = 404
    response.end('Not found')
    return
  }

  const payload = await status()
  response.statusCode = payload.ok ? 200 : 503
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Local Cognee health adapter listening on ${port}`)
})
