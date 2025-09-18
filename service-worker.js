// v1 minimal SW: cache-first per i file statici
const CACHE = 'plutoo-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=140',
  './app.js?v=140',
  './logo-32.jpg',
  './dog1.jpg','./dog2.jpg','./dog3.jpg','./dog4.jpg'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
