import { execFile } from 'node:child_process'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'

type ServerEnv = Record<string, string>

function runCodex(args: string[]) {
  return new Promise<{ ok: boolean; output: string }>((resolve) => {
    execFile('codex', args, { encoding: 'utf8', timeout: 1800, windowsHide: true }, (error, stdout, stderr) => {
      resolve({ ok: !error, output: `${stdout}\n${stderr}`.trim() })
    })
  })
}

function setupStatusPlugin(env: ServerEnv): Plugin {
  return {
    name: 'claim-compiler-setup-status',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const requestMeta = request as unknown as { url?: string; method?: string }
        if (requestMeta.url?.split('?')[0] !== '/api/setup/status') {
          next()
          return
        }

        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader('Cache-Control', 'no-store')
        response.setHeader('X-Content-Type-Options', 'nosniff')

        if (requestMeta.method !== 'GET') {
          response.statusCode = 405
          response.end(JSON.stringify({ service: 'claim-compiler-dev-status', ok: false, error: 'method_not_allowed' }))
          return
        }

        const [versionResult, loginResult] = await Promise.all([
          runCodex(['--version']),
          runCodex(['login', 'status']),
        ])
        const version = versionResult.output.match(/codex(?:-cli)?\s+[0-9A-Za-z.-]+/i)?.[0]
        const authenticated = loginResult.ok && /logged in/i.test(loginResult.output)
        const auth = /using chatgpt/i.test(loginResult.output)
          ? 'chatgpt'
          : /api.?key/i.test(loginResult.output) ? 'api-key' : authenticated ? 'unknown' : undefined

        response.statusCode = 200
        response.end(JSON.stringify({
          service: 'claim-compiler-dev-status',
          ok: true,
          core: {
            demo: true,
            compiler: true,
          },
          environment: {
            codex: {
              installed: versionResult.ok,
              authenticated,
              ...(version ? { version } : {}),
              ...(auth ? { auth } : {}),
            },
            credentials: {
              cognee: Boolean(env.COGNEE_API_KEY?.trim()),
              tavily: Boolean(env.TAVILY_API_KEY?.trim()),
            },
            cogneeBase: {
              configured: Boolean(env.COGNEE_BASE_URL?.trim()),
              reachable: null,
            },
          },
          security: {
            secretsExposed: false,
            codexExecAllowed: false,
          },
        }))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const serverEnv = loadEnv(mode, '.', '')
  return {
    plugins: [react(), setupStatusPlugin(serverEnv)],
  }
})
