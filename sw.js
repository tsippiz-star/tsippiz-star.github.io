/* סל משווה — Service Worker של המעטפת.
 * שומר במטמון רק את המעטפת (מסך פתיחה, אייקונים, מסמכים) — המחירים תמיד נטענים טריים מהאתר.
 */
const CACHE = 'sal-mashve-shell-v1';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'favicon.png',
               'privacy.html', 'terms.html', 'support.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  // רשת קודם (כדי לקבל עדכונים), מטמון כגיבוי כשאין אינטרנט
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
