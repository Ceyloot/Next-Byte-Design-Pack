import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'node:child_process'
import { runwareProxy } from './src/sections/canvas/runware-proxy'
import { agentProxy } from './src/sections/canvas/agent-proxy'
import { notatnikProxy } from './src/sections/notebook/notatnik-proxy'

/** Wersja widoczna w Canvas: hash commita w chwili startu serwera (po pullu i restarcie się zmienia). */
function hashCommita(): string {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim()
  } catch {
    return 'brak-gita'
  }
}

export default defineConfig({
  define: {
    __CANVAS_WERSJA__: JSON.stringify(hashCommita()),
    __SERWER_START__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    runwareProxy(),
    agentProxy(),
    notatnikProxy(),
    {
      // Aktualny commit NA DYSKU (za każdym razem z gita) — porównywany w Canvas
      // z wersją załadowaną przy starcie serwera: różnica = trzeba zrestartować.
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
    strictPort: true,
    host: true, // expose on LAN so it's reachable from a phone on the same Wi-Fi
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
