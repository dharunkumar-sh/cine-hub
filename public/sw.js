// Optimized Service Worker for Cinematic Actor Platform
const CACHE_NAME = "cinematic-v2";
const IMAGE_CACHE = "cinematic-images-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/hero.webp",
  "/background.webp",
  "/placeholder.svg",
  "/logo.svg",
];

// Install event - cache static core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== IMAGE_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event with intelligent routing
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Firebase APIs and live database websockets
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("identitytoolkit") ||
    url.hostname.includes("securetoken") ||
    url.hostname.includes("firebase")
  ) {
    return;
  }

  // Skip Vite dev server files
  if (
    url.search.includes("t=") ||
    url.pathname.includes("@vite") ||
    url.pathname.startsWith("/src/")
  ) {
    return;
  }

  // Handle Images (Local and External CDNs)
  const isImageRequest =
    request.destination === "image" ||
    /\.(jpg|jpeg|png|webp|svg|gif)($|\?)/i.test(url.pathname) ||
    url.hostname.includes("bmscdn.com") ||
    url.hostname.includes("ottplay.com") ||
    url.hostname.includes("media-amazon.com") ||
    url.hostname.includes("moviecrow.com") ||
    url.hostname.includes("pinimg.com");

  if (isImageRequest) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // If cached, return immediately and update in background
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Handle Google Fonts
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Same-origin static assets - Stale while revalidate
  if (url.origin === location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }
});

// Background sync for watchlist
self.addEventListener("sync", (event) => {
  if (event.tag === "watchlist-sync") {
    event.waitUntil(syncWatchlist());
  }
});

async function syncWatchlist() {
  try {
    const db = await openDB();
    const pending = await getPendingItems(db);

    if (pending.length === 0) return;

    await new Promise((resolve) => setTimeout(resolve, 500));

    await markSynced(
      db,
      pending.map((p) => p.id)
    );

    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        count: pending.length,
      });
    });
  } catch (error) {
    console.error("[SW] Sync failed:", error);
    throw error;
  }
}

// IndexedDB helpers for service worker
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("cinematic-watchlist", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getPendingItems(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("watchlist", "readonly");
    const store = tx.objectStore("watchlist");
    const index = store.index("by-sync-status");
    const request = index.getAll("pending");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

function markSynced(db, ids) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("watchlist", "readwrite");
    const store = tx.objectStore("watchlist");

    const promises = ids.map((id) => {
      return new Promise((res, rej) => {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const item = getReq.result;
          if (item) {
            item.syncStatus = "synced";
            store.put(item);
          }
          res();
        };
        getReq.onerror = rej;
      });
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Push notification handling
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/logo.svg",
      badge: "/logo.svg",
      data: data.url,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.notification.data) {
    event.waitUntil(clients.openWindow(event.notification.data));
  }
});
