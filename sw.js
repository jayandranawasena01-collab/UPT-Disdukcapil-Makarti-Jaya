// File Service Worker Dasar
const CACHE_NAME = 'disdukcapil-v1';

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activated');
});

self.addEventListener('fetch', (e) => {
  // Hanya pass-through, biarkan iframe yang bekerja mengambil data dari Google Script
  e.respondWith(fetch(e.request).catch(() => {
      return new Response("Anda sedang offline. Periksa koneksi internet Anda.");
  }));
});
