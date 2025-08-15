// Plik: frontend/public/service-worker.js

// To zdarzenie jest wywoływane przy pierwszej instalacji Service Workera.
self.addEventListener('install', event => {
  console.log('Service Worker: Instalacja...');
  // Ta linia sprawia, że nowy Service Worker aktywuje się natychmiast.
  self.skipWaiting();
});

// To zdarzenie jest wywoływane po aktywacji Service Workera.
self.addEventListener('activate', event => {
  console.log('Service Worker: Aktywacja...');
  // Ta linia sprawia, że Service Worker natychmiast przejmuje kontrolę nad stroną.
  event.waitUntil(self.clients.claim());
});

// To zdarzenie jest wywoływane, gdy przychodzi powiadomienie push.
self.addEventListener('push', event => {
  console.log('Service Worker: Otrzymano Push.');
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/images/icon-192x192.png',
  };
  event.waitUntil(
    self.registration.showNotification(data.head, options)
  );
});