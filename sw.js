/* Network first, so the site always updates when you upload a new index.html.
   The saved copy is only used when the phone is offline. */
var C = 'tlc-v1';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(function (res) {
    var copy = res.clone();
    caches.open(C).then(function (c) { c.put(r, copy); });
    return res;
  }).catch(function () {
    return caches.match(r).then(function (m) { return m || caches.match('./'); });
  }));
});
