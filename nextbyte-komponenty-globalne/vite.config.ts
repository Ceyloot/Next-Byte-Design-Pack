import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: { port: 5191, host: true },
  preview: { port: 5192 },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  define: { __NB_APP_VERSION__: JSON.stringify('paczka-komponentow') },
});
