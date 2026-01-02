// sw.js
const CACHE_NAME = 'mirror-os-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/mirror-os.js',
    '/styles/app.css',
    '/manifest.json'
    // Add other assets as they are created
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    // Network-first for API/Models, cache-first for static assets
    const url = new URL(event.request.url);

    // Cache First for static files
    if (STATIC_ASSETS.includes(url.pathname)) {
        event.respondWith(
            caches.match(event.request).then((response) => response || fetch(event.request))
        );
    } else {
        // Network First for everything else
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
    }
});
