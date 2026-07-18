import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

type CommandResult = {
  ok: boolean
  output: string
}

async function runCommand(command: string, args: string[]): Promise<CommandResult> {
  // @ts-expect-error Node runtime import; browser bundle never receives this module.
  const { execFile } = await import('node:child_process')
  return new Promise((resolve) => {
    execFile(command, args, { timeout: 2500 }, (error: unknown, stdout: string, stderr: string) => {
      resolve({ ok: !error, output: `${stdout}${stderr}`.trim() })
    })
  })
}

async function probeSanitizedAdapter(url: string | undefined, service: string) {
  if (!url) return false
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1500)
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
    clearTimeout(timeout)
    if (!response.ok) return false
    const body = await response.json() as { service?: unknown; ok?: unknown }
    return body.service === service && body.ok === true
  } catch {
    return false
  }
}

function setupStatusPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'local-setup-status',
    configureServer(server) {
      server.middlewares.use('/api/setup/status', async (_request, response) => {
        const [version, login, cogneeReady, tavilyReady, codexSidecarReady] = await Promise.all([
          runCommand(env.CODEX_CLI_PATH || 'codex', ['--version']),
          runCommand(env.CODEX_CLI_PATH || 'codex', ['login', 'status']),
          probeSanitizedAdapter(env.COGNEE_ADAPTER_URL || 'http://127.0.0.1:43110/health', 'cognee'),
          probeSanitizedAdapter(env.TAVILY_PROXY_URL || 'http://127.0.0.1:8787/health', 'tavily'),
          probeSanitizedAdapter(env.CODEX_ADAPTER_URL || 'http://127.0.0.1:4010/health', 'codex'),
        ])

        const payload = {
          core: {
            ok: true,
            mode: 'zero-config-demo',
            findings: 4,
            citations: 14,
          },
          codexCli: {
            installed: version.ok,
            version: version.ok ? version.output.split('\n')[0].slice(0, 80) : null,
            authenticated: login.ok && /logged in/i.test(login.output),
            auth: login.ok && /chatgpt/i.test(login.output) ? 'chatgpt' : null,
          },
          credentials: {
            tavilyConfigured: tavilyReady,
          },
          adapters: {
            cogneeReady,
            tavilyReady,
            codexSidecarReady,
          },
          checkedAt: new Date().toISOString(),
        }

        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader('Cache-Control', 'no-store')
        response.end(JSON.stringify(payload))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [react(), setupStatusPlugin(env)],
  }
})
