/* Plutoo SW – hard refresh & sane caching
   Bumpare SEMPRE la VERSION ad ogni deploy per invalidare la cache. */
const VERSION = "plutoo-sw-2025-10-19-01";
const STATIC_CACHE = `static-${VERSION}`;

// Elenco minimo di asset locali da preriscaldare (aggiungi se vuoi)
const ASSETS = [
  "/",                 // root
  "/index.html",
  "/style.css",
  "/app.js",
  "/plutoo-icon-192.png",
  "/plutoo-icon-512.png",
  "/sponsor-logo.png",
  "/dog1.jpg","/dog2.jpg","/dog3.jpg","/dog4.jpg"
];

// Utility: verifica se la richiesta è same-origin
const sameOrigin = url => self.location.origin === new URL(url, self.location).origin;

// Install: salta subito in waiting e precarica con cache: 'reload'
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache =>
      cache.addAll(ASSETS.map(u => new Request(u, { cache: "reload" }))).catch(() => void 0)
    )
  );
});

// Activate: elimina cache vecchie e prendi controllo immediatamente
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== STATIC_CACHE ? caches.delete(k) : Promise.resolve())));
    await self.clients.claim();
  })());
});

// Fetch strategy:
// - Se query contiene forceReload / v / build / cb → sempre NETWORK FIRST (bypass cache)
// - Navigazioni HTML → NETWORK FIRST (fallback cache se offline)
// - Altri asset → CACHE FIRST (fallback network) + aggiornamento silente
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Regole per hard refresh via querystring
  const hasHardParam = url.searchParams.has("forceReload") ||
                       url.searchParams.has("v") ||
                       url.searchParams.has("build") ||
                       url.searchParams.has("cb");

  // Navigazioni (HTML) o hard param → NETWORK FIRST
  const isHTML =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isHTML || hasHardParam) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Altri asset → CACHE FIRST con refresh in background
  event.respondWith(cacheFirst(req));
});

async function networkFirst(request) {
  try {
    // cache: 'reload' forza il roundtrip al server
    const fresh = await fetch(new Request(request, { cache: "reload" }));
    // Metti in cache solo se same-origin
    if (sameOrigin(request.url)) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (err) {
    // Offline → prova cache
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    // Ultimo fallback: una index se navigate
    if (request.mode === "navigate") {
      const fallback = await caches.match("/index.html");
      if (fallback) return fallback;
    }
    throw err;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) {
    // Aggiorna in background
    refreshInBg(request).catch(()=>{});
    return cached;
  }
  // Niente in cache → rete e poi salva (se same-origin)
  const res = await fetch(request);
  if (sameOrigin(request.url)) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, res.clone());
  }
  return res;
}

async function refreshInBg(request) {
  try {
    const fresh = await fetch(request);
    if (sameOrigin(request.url)) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, fresh.clone());
    }
  } catch {}
}
