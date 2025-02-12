const CACHE_NAME = 'your-app-v1';
const assetsToCache = [
    './godot_game.html',
    './manifest.json',
    // Add paths to all your important files:
    './service-worker.js',
    './Icon-196.png',
    './Icon-512.png'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(assetsToCache);
            })
    );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});