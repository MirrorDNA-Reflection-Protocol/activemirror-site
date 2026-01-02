// sw.js - Service Worker for Active MirrorOS
// Offline-first with smart caching

const CACHE_NAME = 'mirror-os-v2';
const STATIC_ASSETS = [
    './',
    './index.html',
    './app.js',
    './app.css',
    './mirror-os.js',
    './i18n.js',
    './voice.js',
    './manifest.json'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => 
            Promise.all(keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: Cache-first for static, network-first for API/models
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip external CDN requests (fonts, etc) - let them fail gracefully offline
    if (!url.origin.includes(self.location.origin) && 
        !url.href.includes('fonts.googleapis.com') &&
        !url.href.includes('fonts.gstatic.com')) {
        return;
    }
    
    // Handle font requests with cache-first
    if (url.href.includes('fonts.googleapis.com') || url.href.includes('fonts.gstatic.com')) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                }).catch(() => new Response('', { status: 503 }));
            })
        );
        return;
    }
    
    // Static assets: Cache-first
    if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset.replace('./', '')))) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                // Return cached, but update in background
                const fetchPromise = fetch(event.request).then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                }).catch(() => null);
                
                return cached || fetchPromise || caches.match('./index.html');
            })
        );
        return;
    }
    
    // Everything else: Network-first with cache fallback
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(event.request).then(cached => {
                if (cached) return cached;
                // Fallback to index for navigation requests
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
                return new Response('Offline', { status: 503, statusText: 'Offline' });
            }))
    );
});

// Handle messages from main app
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
