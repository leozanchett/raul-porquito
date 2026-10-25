// Guarda o app no tablet para funcionar sem internet.
// Ao mudar algum arquivo do app, aumente a versão para o tablet buscar a nova.
const CACHE = 'porquinho-v3';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Responde com o que está guardado e atualiza em segundo plano quando houver internet.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(event.request, { ignoreSearch: true });
    const network = fetch(event.request)
      .then(res => {
        if (res.ok || res.type === 'opaque') cache.put(event.request, res.clone());
        return res;
      })
      .catch(() => cached);
    if (cached) {
      event.waitUntil(network);
      return cached;
    }
    return network;
  }));
});
