import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In GitHub Actions setzt der Deploy-Workflow BASE_PATH auf "/<repo>/" (Pages-Projektpfad).
// Lokal (npm run dev / build) bleibt der Base-Pfad "/".
declare const process: { env: Record<string, string | undefined> }

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  server: { port: 4602, strictPort: true },
})
