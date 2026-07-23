/* HeimDesk (Luxury) — Service Worker
   App-Shell offline verfügbar machen. Same-Origin-Dateien werden beim
   Installieren vorgeladen; alles Weitere (inkl. der CDN-Skripte von unpkg)
   wird beim ersten Laden zwischengespeichert („cache-first"). */
const CACHE = 'heimdesk-lux-v1'
const DS = '_ds/luxury-design-system-be25ffed-e9f1-4dd7-8ade-79b64a54ef5a/'
const SHELL = [
  './',
  './index.html',
  './support.js',
  './manifest.webmanifest',
  DS + '_ds_bundle.js',
  DS + 'styles.css',
  DS + 'tokens/fonts.css',
  DS + 'tokens/luxury.css',
  './icons/pwa-192x192.png',
  './icons/pwa-512x512.png',
]

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE)
    // Einzeln laden, damit ein fehlendes Asset die Installation nicht abbricht.
    await Promise.allSettled(SHELL.map((u) => c.add(u)))
    self.skipWaiting()
  })())
})

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return

  // Navigationen: erst Netz, sonst gecachte Startseite (offline-Fallback).
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try { return await fetch(req) }
      catch { return (await caches.match('./index.html')) || Response.error() }
    })())
    return
  }

  // Übrige GETs: erst Cache, sonst Netz – und erfolgreiche Antworten cachen
  // (auch die CORS-Skripte von unpkg für Offline-Betrieb).
  e.respondWith((async () => {
    const cached = await caches.match(req)
    if (cached) return cached
    try {
      const res = await fetch(req)
      if (res && (res.ok || res.type === 'opaque')) {
        const c = await caches.open(CACHE)
        c.put(req, res.clone())
      }
      return res
    } catch {
      return cached || Response.error()
    }
  })())
})
