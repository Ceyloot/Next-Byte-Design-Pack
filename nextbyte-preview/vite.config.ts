import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { runwareProxy } from './src/sections/canvas/runware-proxy'
import { agentProxy } from './src/sections/canvas/agent-proxy'
import { notatnikProxy } from './src/sections/notebook/notatnik-proxy'

export default defineConfig({
  plugins: [react(), runwareProxy(), agentProxy(), notatnikProxy()],
  server: {
    port: 5190,
    strictPort: true,
    host: true, // expose on LAN so it's reachable from a phone on the same Wi-Fi
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Kopia Panelu Głównego 1:1 wyglądowo, bez Supabase i bez danych.
      // Własny korzeń, żeby przeniesione pliki zachowały swoje `@/…`
      // i nie mieszały się z komponentami preview o tych samych nazwach.
      '@d2': path.resolve(__dirname, './src/dashboard2'),
    },
  },
})

