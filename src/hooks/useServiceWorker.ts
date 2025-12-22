import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    isRegistered: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    registration: null,
  });

  // Register service worker
  useEffect(() => {
    if (!state.isSupported) return;

    async function register() {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        setState((prev) => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        console.log('[App] Service worker registered:', registration.scope);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[App] New service worker available');
                // Could show update notification here
              }
            });
          }
        });
      } catch (error) {
        console.error('[App] Service worker registration failed:', error);
      }
    }

    register();

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[App] Message from SW:', event.data);
      if (event.data.type === 'SYNC_COMPLETE') {
        // Trigger UI update
        window.dispatchEvent(new CustomEvent('watchlist-synced', {
          detail: { count: event.data.count },
        }));
      }
    });
  }, [state.isSupported]);

  // Online/offline status
  useEffect(() => {
    const handleOnline = () => setState((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Request background sync
  const requestSync = useCallback(async (tag: string = 'watchlist-sync') => {
    if (!state.registration) return false;

    try {
      const reg = state.registration as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } };
      if (reg.sync) {
        await reg.sync.register(tag);
        console.log('[App] Background sync registered:', tag);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[App] Background sync failed:', error);
      return false;
    }
  }, [state.registration]);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    if (!state.registration) return;
    await state.registration.update();
  }, [state.registration]);

  // Skip waiting (apply update immediately)
  const skipWaiting = useCallback(() => {
    if (!state.registration?.waiting) return;
    state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }, [state.registration]);

  return {
    ...state,
    requestSync,
    checkForUpdates,
    skipWaiting,
  };
}
