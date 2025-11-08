/**
 * PageForge Service Worker
 * This file caches the app's core dependencies so it can load
 * and run completely offline after the first visit.
 */

const CACHE_NAME = 'pageforge-cache-v1';
const URLS_TO_CACHE = [
    // Tailwind CSS
    'https://cdn.tailwindcss.com',
    // Google Font (Inter)
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    // The converter module from your GitHub
    'https://raw.githubusercontent.com/Cleo876/Page-Forge-/refs/heads/main/forge-converter.js'
];

// 1. Install the Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened PageForge cache');
                // Fetch and cache all core assets
                return cache.addAll(URLS_TO_CACHE);
            })
            .catch(err => {
                console.error('Failed to cache assets during install:', err);
            })
    );
});

// 2. Intercept network requests
self.addEventListener('fetch', event => {
    event.respondWith(
        // Try to find the request in the cache first
        caches.match(event.request)
            .then(cachedResponse => {
                // 2a. If it's in the cache, return it immediately
                if (cachedResponse) {
                    return cachedResponse;
                }

                // 2b. If not in cache, fetch it from the network
                return fetch(event.request).then(
                    networkResponse => {
                        // And if the fetch is successful, cache it for next time
                        return caches.open(CACHE_NAME)
                            .then(cache => {
                                // We clone the response because it can only be consumed once
                                cache.put(event.request, networkResponse.clone());
                                console.log('Cached new resource:', event.request.url);
                                return networkResponse;
                            });
                    }
                ).catch(err => {
                    // Handle fetch errors (e.g., offline)
                    console.error('Service Worker fetch failed:', err);
                    // We don't have a fallback page, so we just let the fetch fail
                });
            })
    );
});

// 3. Clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Delete old cache
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
