import { useState, useEffect, useCallback, useRef } from "react";
import {
  watchlistRepository,
  subscribeToWatchlistChanges,
  syncWithServer,
  WatchlistItem,
} from "@/lib/watchlistDb";
import {
  addToFirebaseWatchlist,
  removeFromFirebaseWatchlist,
  fetchFirebaseWatchlist,
  subscribeFirebaseWatchlist,
} from "@/lib/firebaseDb";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface UseWatchlistReturn {
  items: WatchlistItem[];
  isLoading: boolean;
  error: string | null;
  addToWatchlist: (movie: {
    movieId: string;
    title: string;
    poster: string;
  }) => Promise<boolean>;
  removeFromWatchlist: (movieId: string) => Promise<boolean>;
  toggleWatched: (id: string) => Promise<void>;
  updateNotes: (id: string, notes: string) => Promise<void>;
  isInWatchlist: (movieId: string) => boolean;
  syncStatus: "idle" | "syncing" | "success" | "error";
  pendingCount: number;
  forceSync: () => Promise<void>;
}

export function useWatchlist(): UseWatchlistReturn {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [pendingCount, setPendingCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const remoteUnsubscribeRef = useRef<(() => void) | null>(null);

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return unsubscribe;
  }, []);

  // Load initial data
  const loadItems = useCallback(async () => {
    try {
      const data = await watchlistRepository.getAll();
      setItems(data);

      const pending = await watchlistRepository.getPending();
      setPendingCount(pending.length);

      setError(null);
    } catch (e) {
      setError("Failed to load watchlist");
      console.error("Watchlist load error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync remote watchlist when authenticated
  useEffect(() => {
    if (!userId) {
      if (remoteUnsubscribeRef.current) {
        remoteUnsubscribeRef.current();
        remoteUnsubscribeRef.current = null;
      }
      return;
    }

    let isActive = true;

    const bootstrapRemote = async () => {
      setSyncStatus("syncing");
      try {
        const remoteItems = await fetchFirebaseWatchlist(userId);
        await watchlistRepository.applyRemoteChanges(remoteItems);
        if (!isActive) return;
        const localItems = await watchlistRepository.getAll();
        setItems(localItems);
        const pending = await watchlistRepository.getPending();
        setPendingCount(pending.length);
        setSyncStatus("success");
        setTimeout(() => setSyncStatus("idle"), 1500);
      } catch (e) {
        console.error("Failed to fetch remote watchlist", e);
        if (isActive) {
          setError("Failed to sync watchlist");
          setSyncStatus("error");
        }
      }
    };

    bootstrapRemote();

    remoteUnsubscribeRef.current = subscribeFirebaseWatchlist(
      userId,
      async (remoteItems) => {
        await watchlistRepository.applyRemoteChanges(remoteItems);
        const localItems = await watchlistRepository.getAll();
        if (isActive) {
          setItems(localItems);
          const pending = await watchlistRepository.getPending();
          setPendingCount(pending.length);
        }
      },
      (err) => {
        console.error("Watchlist subscription error", err);
        setError("Live sync unavailable");
      }
    );

    return () => {
      isActive = false;
      if (remoteUnsubscribeRef.current) {
        remoteUnsubscribeRef.current();
        remoteUnsubscribeRef.current = null;
      }
    };
  }, [userId]);

  // Background sync
  const performSync = useCallback(async () => {
    if (!isOnlineRef.current) return;

    setSyncStatus("syncing");

    try {
      const result = await syncWithServer();

      if (result.success) {
        setSyncStatus("success");
        setPendingCount(0);

        // Reset to idle after a delay
        setTimeout(() => setSyncStatus("idle"), 2000);
      } else {
        setSyncStatus("error");
      }
    } catch (e) {
      setSyncStatus("error");
      console.error("Sync error:", e);
    }
  }, []);

  // Schedule sync after changes
  const scheduleSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      performSync();
    }, 2000);
  }, [performSync]);

  // Initialize
  useEffect(() => {
    loadItems();

    // Subscribe to cross-tab changes
    const unsubscribe = subscribeToWatchlistChanges((event) => {
      console.log("Cross-tab event:", event.type);
      loadItems();
    });

    // Online/offline handling
    const handleOnline = () => {
      isOnlineRef.current = true;
      performSync();
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial sync if online
    if (navigator.onLine) {
      scheduleSync();
    }

    return () => {
      unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [loadItems, performSync, scheduleSync]);

  // Optimistic add
  const addToWatchlist = useCallback(
    async (movie: {
      movieId: string;
      title: string;
      poster: string;
    }): Promise<boolean> => {
      const now = Date.now();

      // Optimistic update
      const optimisticItem: WatchlistItem = {
        id: `watchlist-${movie.movieId}`,
        movieId: movie.movieId,
        title: movie.title,
        poster: movie.poster,
        addedAt: now,
        watched: false,
        syncStatus: "pending",
        vectorClock: {},
        lastModified: now,
        deleted: false,
      };

      setItems((prev) => [optimisticItem, ...prev]);
      setPendingCount((c) => c + 1);

      try {
        await watchlistRepository.add(movie as any);

        // Sync to Firebase if logged in
        if (userId) {
          await addToFirebaseWatchlist(userId, {
            ...movie,
            watched: false,
          });
        }

        scheduleSync();
        return true;
      } catch (e) {
        // Rollback on failure
        setItems((prev) => prev.filter((i) => i.id !== optimisticItem.id));
        setPendingCount((c) => Math.max(0, c - 1));
        setError("Failed to add to watchlist");
        return false;
      }
    },
    [scheduleSync, userId]
  );

  // Optimistic remove
  const removeFromWatchlist = useCallback(
    async (movieId: string): Promise<boolean> => {
      const id = `watchlist-${movieId}`;
      const removedItem = items.find((i) => i.id === id);

      // Optimistic update
      setItems((prev) => prev.filter((i) => i.id !== id));

      try {
        await watchlistRepository.remove(id);
        // Sync to Firebase if logged in
        if (userId) {
          await removeFromFirebaseWatchlist(userId, movieId);
        }
        scheduleSync();
        return true;
      } catch (e) {
        // Rollback on failure
        if (removedItem) {
          setItems((prev) => [...prev, removedItem]);
        }
        setError("Failed to remove from watchlist");
        return false;
      }
    },
    [items, scheduleSync, userId]
  );

  // Toggle watched status
  const toggleWatched = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      // Optimistic update
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, watched: !i.watched } : i))
      );

      try {
        await watchlistRepository.update(id, { watched: !item.watched });
        scheduleSync();
      } catch (e) {
        // Rollback
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, watched: item.watched } : i))
        );
        setError("Failed to update watchlist");
      }
    },
    [items, scheduleSync]
  );

  // Update notes
  const updateNotes = useCallback(
    async (id: string, notes: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const oldNotes = item.notes;

      // Optimistic update
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, notes } : i)));

      try {
        await watchlistRepository.update(id, { notes });
        scheduleSync();
      } catch (e) {
        // Rollback
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, notes: oldNotes } : i))
        );
        setError("Failed to update notes");
      }
    },
    [items, scheduleSync]
  );

  // Check if movie is in watchlist
  const isInWatchlist = useCallback(
    (movieId: string): boolean => {
      return items.some((i) => i.movieId === movieId && !i.deleted);
    },
    [items]
  );

  // Force sync
  const forceSync = useCallback(async () => {
    await performSync();
  }, [performSync]);

  return {
    items,
    isLoading,
    error,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatched,
    updateNotes,
    isInWatchlist,
    syncStatus,
    pendingCount,
    forceSync,
  };
}
