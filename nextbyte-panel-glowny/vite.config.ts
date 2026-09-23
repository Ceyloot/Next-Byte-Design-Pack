import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8093,
    /*
      Funkcje edge platformy przepuszczają tylko adresy NextByte (CORS), więc
      z localhosta idą przez to proxy — tak samo jak `npm run dev` platformy
      (patrz `src/integrations/supabase/client.ts`, `fetchZProxy`).
    */
    proxy: {
      "/nb-funkcje": {
        target: "https://iwuvszxeutvmzcfuetuo.supabase.co",
        changeOrigin: true,
        secure: true,
        rewrite: (sciezka) => sciezka.replace(/^\/nb-funkcje/, "/functions/v1"),
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom"],
  },
});
