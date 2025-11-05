// service-worker.js — SAFE UNREGISTER BUILD
// Scopo: disattivare il vecchio SW e svuotare le cache per evitare schermate nere o immagini mancanti.

self.addEventListener('install', (event) => {
  // Passa subito allo stato "activated"
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // 1) Svuota tutte le cache gestite dal SW precedente
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));

    // 2) Disinstalla questo SW (niente più caching lato SW)
    await self.registration.unregister();

    // 3) Prendi il controllo immediato delle pagine e forzane il reload pulito
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      // Ricarica la stessa URL per rimuovere l'effetto del vecchio SW
      client.navigate(client.url);
    }
  })());
});

// Nessun handler di fetch: lascia tutto alla rete/headers del server
self.addEventListener('fetch', () => {});
