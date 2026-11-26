/* COGIT — service worker (PWA).
   · Páginas HTML: rede primeiro; sem conexão, a cópia guardada ou /offline.html.
   · CSS, JS, fontes e imagens do próprio site: cache primeiro, atualizado em segundo plano.
     Os links de CSS/JS levam ?v=<hash do arquivo> (tools/build-pwa.mjs): mudou o arquivo, muda a URL.
   · Nada de outros domínios (Analytics, plataforma app.cmkcogit.com.br, Supabase, Mercado Pago),
     nada de /api/ e só requisições GET.
   · VERSION é o hash do conteúdo dos assets, gravado por tools/build-pwa.mjs (npm run check confere).
     Versão nova: instala, assume na hora (skipWaiting + clients.claim) e apaga os caches antigos. */
const VERSION = 'b8a8f7daffab';
const CACHE_PAGES = 'cogit-pages-' + VERSION;
const CACHE_ASSETS = 'cogit-assets-' + VERSION;
const OFFLINE_URL = '/offline.html';
const PRECACHE = [
  OFFLINE_URL,
  '/assets/fonts/clash-display-500.woff2',
  '/assets/fonts/satoshi-400.woff2',
  '/assets/fonts/satoshi-700.woff2',
  '/assets/images/icone-cogit.svg',
];
const MAX_PAGES = 40;
const MAX_ASSETS = 150;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_ASSETS)
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = [CACHE_PAGES, CACHE_ASSETS];
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('cogit-') && !keep.includes(k)).map((k) => caches.delete(k)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

function isAsset(url, request) {
  if (['style', 'script', 'font', 'image'].includes(request.destination)) return true;
  return /\.(?:css|js|woff2?|png|jpe?g|webp|avif|gif|svg|ico)$/i.test(url.pathname);
}

async function trim(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function networkFirst(event) {
  const { request } = event;
  const cache = await caches.open(CACHE_PAGES);
  try {
    const response = (await event.preloadResponse) || (await fetch(request));
    if (response.ok && response.type === 'basic') {
      cache.put(request, response.clone()).then(() => trim(CACHE_PAGES, MAX_PAGES));
    }
    return response;
  } catch (_) {
    return (await cache.match(request, { ignoreSearch: true }))
      || (await caches.match(OFFLINE_URL))
      || new Response('Você está sem conexão.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}

async function staleWhileRevalidate(event) {
  const { request } = event;
  const cache = await caches.open(CACHE_ASSETS);
  const cached = await cache.match(request);
  const update = fetch(request).then((response) => {
    if (response.ok && response.type === 'basic') {
      cache.put(request, response.clone()).then(() => trim(CACHE_ASSETS, MAX_ASSETS));
    }
    return response;
  }).catch(() => cached);
  if (cached) { event.waitUntil(update.then(() => {}, () => {})); return cached; }
  return update;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;             // Analytics, plataforma, APIs externas
  if (url.pathname.startsWith('/api/')) return;                 // rotas de API, se um dia existirem
  if (request.headers.has('range')) return;                     // vídeos (pedidos parciais)
  if (url.pathname === '/sw.js') return;
  if (request.mode === 'navigate') { event.respondWith(networkFirst(event)); return; }
  if (isAsset(url, request)) event.respondWith(staleWhileRevalidate(event));
});
