/* Plutoo — Image-only Service Worker (safe)
   Caches only images with a stale-while-revalidate strategy.
   No HTML/CSS/JS caching, no offline routing. */

const CACHE_NAME = 'plutoo-img-v3';

// Immagini locali note del repo da precache (aggiungi qui se ne metti di nuove)
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

// Limite di sicurezza per evitare cache infinita
const MAX_ENTRIES = 60;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_IMAGES))
  );
  // attiva subito la nuova versione
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

// Helper: decide se una request è un'immagine
function isImageRequest(request) {
  const url = new URL(request.url);
  const ext = url.pathname.split('.').pop().toLowerCase();
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif'].includes(ext)) return true;
  // fallback: usa destination (moderno)
  return request.destination === 'image';
}

// Helper: mantiene la cache entro MAX_ENTRIES
async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_ENTRIES) return;
  // elimina gli elementi più vecchi
  await cache.delete(keys[0]);
  return trimCache(cache);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Gestiamo solo richieste GET di immagini (stale-while-revalidate)
  if (request.method !== 'GET' || !isImageRequest(request)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    const fetchPromise = fetch(request)
      .then(async (networkResp) => {
        // metti in cache solo se ok e “same-origin”/“cors”
        if (networkResp && networkResp.ok && (networkResp.type === 'basic' || networkResp.type === 'cors')) {
          cache.put(request, networkResp.clone()).then(() => trimCache(cache));
        }
        return networkResp;
      })
      .catch(() => cached); // in caso di offline, ricadi sul cached (se esiste)

    // ritorna subito il cached se c'è, altrimenti la rete
    return cached || fetchPromise;
  })());
});
