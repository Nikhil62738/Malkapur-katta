// Minimal, NON-CACHING service worker.
//
// Purpose:
//  1. Enable PWA installability (the "Install App" button) WITHOUT caching any
//     content, so the site always serves fresh data from the network. This
//     fixes the problem where admin changes did not reflect on the main site
//     because an aggressive precache (the old vite-plugin-pwa/Workbox worker)
//     kept serving stale assets.
//  2. Evict every cache left behind by the previous PWA build on activation.

self.addEventListener('install', () => {
  // Take over immediately, replacing any previously installed worker.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete all caches created by the old Workbox precache so no stale
      // HTML/JS/CSS can ever be served again.
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

// Network-only navigation handling: never serve a cached app shell.
// Every other request falls through to the browser's default network handling
// (no caching), which keeps API data, images and videos always fresh.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method === 'GET' && req.mode === 'navigate') {
    event.respondWith(fetch(req));
  }
});
