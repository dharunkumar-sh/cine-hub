// Service Worker for Cinematic Actor Platform
const CACHE_NAME = "cinematic-v1";
const STATIC_ASSETS = ["/", "/index.html"];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, then cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip external requests
  if (url.origin !== location.origin) return;

  // Skip Vite dev server files (hot module replacement)
  // Check search params for ?t= and pathname for @vite and /src/
  if (
    url.search.includes("t=") ||
    url.pathname.includes("@vite") ||
    url.pathname.startsWith("/src/")
  ) {
    return;
  }

  // For API requests - network first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cloned);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache on network error
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Return a network error response
            return new Response("Network error", { status: 503 });
          });
        })
    );
    return;
  }

  // For static assets - stale while revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          // Update cache with fresh response
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cloned);
            });
          }
          return response;
        })
        .catch((error) => {
          // Return cached if fetch fails
          if (cached) return cached;
          // Return a proper error response
          console.error("[SW] Fetch failed for:", request.url, error);
          return new Response("Service unavailable", { status: 503 });
        });

      // Return cached immediately, update in background
      return cached || fetchPromise;
    })
  );
});

// Background sync for watchlist
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);

  if (event.tag === "watchlist-sync") {
    event.waitUntil(syncWatchlist());
  }
});

async function syncWatchlist() {
  console.log("[SW] Syncing watchlist...");

  try {
    // Open IndexedDB and get pending items
    const db = await openDB();
    const pending = await getPendingItems(db);

    if (pending.length === 0) {
      console.log("[SW] No pending items to sync");
      return;
    }

    console.log("[SW] Syncing", pending.length, "items");

    // Simulate sync (in production, this would call your API)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mark items as synced
    await markSynced(
      db,
      pending.map((p) => p.id)
    );

    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        count: pending.length,
      });
    });

    console.log("[SW] Sync complete");
  } catch (error) {
    console.error("[SW] Sync failed:", error);
    throw error; // Retry sync
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
      icon: "/favicon.ico",
      badge: "/favicon.ico",
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
