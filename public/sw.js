// Offline support: the app shell and every built asset are cached on install,
// and pages fall back to the cached shell when there is no network.
// The build replaces BUILD with the real version and asset list (see vite.config.js).
const BUILD = { version: 'dev', files: [] }
const CACHE = `scam-sms-checker-${BUILD.version}`
const SHELL = ['./', './index.html', './manifest.webmanifest', './favicon.svg', ...BUILD.files]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const appPage = new URL('./', self.registration.scope).pathname
          const { pathname } = new URL(request.url)
          // Only the app itself may refresh the cached shell, never a 404 page.
          if (response.ok && (pathname === appPage || pathname === `${appPage}index.html`)) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put('./index.html', copy))
          }
          return response
        })
        .catch(() => caches.match('./index.html')),
    )
    return
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        }),
    ),
  )
})
