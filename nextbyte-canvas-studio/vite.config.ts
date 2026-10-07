import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'node:child_process'
import { runwareProxy } from './src/sections/canvas/runware-proxy'
import { agentProxy } from './src/sections/canvas/agent-proxy'

/** Wersja widoczna w Canvas: hash commita w chwili startu serwera (poza repozytorium: „eksport”). */
function hashCommita(): string {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: __dirname, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return 'eksport'
  }
}

export default defineConfig({
  define: {
    __CANVAS_WERSJA__: JSON.stringify(hashCommita()),
    __SERWER_START__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    // Serwer pośredniczący do Runware (generacja obrazu) i Gemini (reżyser, rozpoznawanie, kontrola) — klucze tylko z .env.local, nigdy w bundlu.
    runwareProxy(),
    agentProxy(),
    {
      // Aktualny commit NA DYSKU — Canvas porównuje go z wersją załadowaną przy starcie serwera (różnica = restart).
      name: 'nb-wersja',
      configureServer(server) {
        server.middlewares.use('/api/canvas/wersja', (_req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-store')
          res.end(JSON.stringify({ dysk: hashCommita() }))
        })
      },
    },
  ],
  server: {
    port: 5190,
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
