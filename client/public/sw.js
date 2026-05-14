const CACHE_NAME = 'streamflix-v5';
const DATA_CACHE_NAME = 'streamflix-data-v4';
const VIDEO_CACHE_NAME = 'streamflix-videos-v3';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME && cacheName !== VIDEO_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API: network-first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(request)
          .then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => caches.match(request));
      })
    );
    return;
  }

  // Images: network-first, cache fallback
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(request)
          .then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => caches.match(request));
      })
    );
    return;
  }

  // Navigation (HTML): network-first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets (JS, CSS): network-first, cache fallback
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return fetch(request)
        .then(response => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => caches.match(request));
    })
  );
});

self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'DOWNLOAD_VIDEO') {
    downloadVideo(event.data.url, event.data.movieId);
  }
  if (event.data.type === 'GET_CACHED_VIDEOS') {
    getCachedVideos().then(videos => {
      event.source.postMessage({ type: 'CACHED_VIDEOS_LIST', videos });
    });
  }
  if (event.data.type === 'DELETE_VIDEO') {
    deleteVideo(event.data.movieId);
  }
});

async function downloadVideo(url, movieId) {
  try {
    const cache = await caches.open(VIDEO_CACHE_NAME);
    const response = await fetch(url);
    await cache.put(`video_${movieId}`, response);
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'DOWNLOAD_COMPLETE', movieId });
      });
    });
  } catch (error) {
    console.error('Download failed:', error);
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: 'DOWNLOAD_ERROR', movieId, error: error.message });
      });
    });
  }
}

async function getCachedVideos() {
  const cache = await caches.open(VIDEO_CACHE_NAME);
  const keys = await cache.keys();
  return keys
    .filter(req => req.url.includes('video_'))
    .map(req => ({ url: req.url, movieId: req.url.split('video_')[1] }));
}

async function deleteVideo(movieId) {
  const cache = await caches.open(VIDEO_CACHE_NAME);
  await cache.delete(`video_${movieId}`);
}
