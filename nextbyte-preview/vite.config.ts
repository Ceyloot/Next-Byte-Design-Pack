import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { runwareProxy } from './src/sections/canvas/runware-proxy'

export default defineConfig({
  plugins: [react(), runwareProxy()],
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
