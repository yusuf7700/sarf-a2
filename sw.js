// Sarf A2 — Service Worker
// Versiyani har safar sezilarli o'zgarish qilinganda oshiring (v1 -> v2 ...),
// aks holda eski kesh saqlanib qolishi mumkin.
const CACHE_NAME = 'sarf-a2-v6';

const APP_SHELL = [
  './',
  'index.html',
  'styles.css',
  'script.js',
  'firebase-init.js',
  'manifest.json',
  'data/bob01.js',
  'data/bob02.js',
  'data/bob03.js',
  'data/bob04.js',
  'data/bob05.js',
  'data/bob06.js',
  'data/bob07.js',
  'data/bob08.js',
  'data/bob09.js',
  'data/bob10.js',
  'data/bob11.js',
  'data/bob12.js',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// O'rnatish — app shell'ni keshga oladi
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Faollashtirish — eski keshlarni tozalaydi
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// So'rovlarni ushlash: kesh-birinchi, topilmasa tarmoqdan, u ham bo'lmasa fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Muvaffaqiyatli javobni keshga qo'shib boramiz (keyingi safar offline ishlashi uchun)
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Tarmoq yo'q va keshda ham topilmadi — sahifa so'rovi bo'lsa asosiy sahifani qaytaramiz
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
        });
    })
  );
});
                      
