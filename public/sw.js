// BlockLogic Service Worker
// Enables offline functionality and app-like experience

const CACHE_NAME = 'blocklogic-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/Grid.js',
  '/js/Pieces.js',
  '/js/ScoreManager.js',
  '/js/ScoreBackupManager.js',
  '/js/Renderer.js',
  '/js/InputHandler.js',
  '/js/Game.js',
  '/js/main.js',
  '/manifest.json'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch((error) => {
      console.error('[Service Worker] Cache failed:', error);
    })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - implement cache-first strategy with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Strategy: Cache first for static assets, network first for API
  if (request.method === 'GET') {
    if (isApiRequest(url)) {
      // Network-first strategy for API calls
      event.respondWith(networkFirst(request));
    } else {
      // Cache-first strategy for static assets
      event.respondWith(cacheFirst(request));
    }
  }
});

/**
 * Cache-first strategy: Try cache first, fallback to network
 */
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    // Return offline page if available
    return caches.match('/index.html');
  }
}

/**
 * Network-first strategy: Try network first, fallback to cache
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[Service Worker] Network request failed:', error);
    // Return cached response if available
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // Return a 503 response if offline and no cache
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Offline - No cached response available',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Determine if a request is for an API endpoint
 */
function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
