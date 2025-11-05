/* Plutoo — Image-only Service Worker (safe) for legacy sw.js
   Caches only images with a stale-while-revalidate strategy.
   No HTML/CSS/JS caching, no offline routing. */

const CACHE_NAME = 'plutoo-img-v4';

const PRECACHE_IMAGES = [
  '/plutoo-icon-192.png',
  '/plutoo-icon-512.png',
  '/sponsor-logo.png',
  '/dog1.jpg',
  '/dog2.jpg',
  '/dog3.jpg',
  '/dog4.jpg',
  '/dog5.jpg',
  '/dog6.jpg',
  '/dog7.jpg',
  '/dog8.jpg'
];

const MAX_ENTRIES = 60;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_IMAGES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

function isImageRequest(request) {
  const url = new URL(request.url);
  const ext = url.pathname.split('.').pop().toLowerCase();
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif'].includes(ext)) return true;
  return request.destination === 'image';
}

async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_ENTRIES) return;
  await cache.delete(keys[0]);
  return trimCache(cache);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || !isImageRequest(request)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    const fetchPromise = fetch(request)
      .then(async (networkResp) => {
        if (networkResp && networkResp.ok && (networkResp.type === 'basic' || networkResp.type === 'cors')) {
          cache.put(request, networkResp.clone()).then(() => trimCache(cache));
        }
        return networkResp;
      })
      .catch(() => cached);

    return cached || fetchPromise;
  })());
});
