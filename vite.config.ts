import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// In GitHub Actions setzt der Deploy-Workflow BASE_PATH auf "/<repo>/" (Pages-Projektpfad).
// Lokal (npm run dev / build) bleibt der Base-Pfad "/".
declare const process: { env: Record<string, string | undefined> }

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Zusätzliche statische Icons, die in den Precache aufgenommen werden.
      includeAssets: ['apple-touch-icon.png', 'favicon-64.png'],
      manifest: {
        name: 'HeimDesk — Service Desk',
        short_name: 'HeimDesk',
        description: 'Interner Service-Desk: Tickets erstellen, bearbeiten und verwalten.',
        lang: 'de',
        theme_color: '#1d4ed8',
        background_color: '#0a1120',
        display: 'standalone',
        orientation: 'any',
        // start_url / scope werden aus dem base-Pfad abgeleitet (funktioniert auch unter /Heimdesk/).
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      },
    }),
  ],
  server: { port: 4602, strictPort: true },
})
