import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { z } from 'zod';

// Zod schema for validation
export const WatchlistItemSchema = z.object({
  id: z.string(),
  movieId: z.string(),
  title: z.string(),
  poster: z.string().url().optional().or(z.string()),
  addedAt: z.number(),
  watched: z.boolean(),
  notes: z.string().optional(),
  syncStatus: z.enum(['synced', 'pending', 'conflict']).default('pending'),
  vectorClock: z.record(z.string(), z.number()).default({}),
  lastModified: z.number(),
  deleted: z.boolean().default(false),
});

export type WatchlistItem = z.infer<typeof WatchlistItemSchema>;

interface WatchlistDB extends DBSchema {
  watchlist: {
    key: string;
    value: WatchlistItem;
    indexes: {
      'by-sync-status': string;
      'by-modified': number;
    };
  };
  syncMeta: {
    key: string;
    value: {
      lastSync: number;
      deviceId: string;
    };
  };
}

const DB_NAME = 'cinematic-watchlist';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<WatchlistDB>> | null = null;

function getDeviceId(): string {
  let deviceId = localStorage.getItem('watchlist-device-id');
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('watchlist-device-id', deviceId);
  }
  return deviceId;
}

async function getDb(): Promise<IDBPDatabase<WatchlistDB>> {
  if (!dbPromise) {
    dbPromise = openDB<WatchlistDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Watchlist store
        if (!db.objectStoreNames.contains('watchlist')) {
          const watchlistStore = db.createObjectStore('watchlist', { keyPath: 'id' });
          watchlistStore.createIndex('by-sync-status', 'syncStatus');
          watchlistStore.createIndex('by-modified', 'lastModified');
        }
        
        // Sync metadata store
        if (!db.objectStoreNames.contains('syncMeta')) {
          db.createObjectStore('syncMeta', { keyPath: 'deviceId' });
        }
      },
    });
  }
  return dbPromise;
}

// Vector clock utilities
function incrementClock(clock: Record<string, number>): Record<string, number> {
  const deviceId = getDeviceId();
  return {
    ...clock,
    [deviceId]: (clock[deviceId] || 0) + 1,
  };
}

function compareClock(a: Record<string, number>, b: Record<string, number>): 'before' | 'after' | 'concurrent' {
  let aBeforeB = false;
  let bBeforeA = false;
  
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  
  for (const key of allKeys) {
    const aVal = a[key] || 0;
    const bVal = b[key] || 0;
    
    if (aVal < bVal) aBeforeB = true;
    if (bVal < aVal) bBeforeA = true;
  }
  
  if (aBeforeB && !bBeforeA) return 'before';
  if (bBeforeA && !aBeforeB) return 'after';
  return 'concurrent';
}

// Merge function for last-write-wins with vector clock
function mergeItems(local: WatchlistItem, remote: WatchlistItem): WatchlistItem {
  const comparison = compareClock(local.vectorClock, remote.vectorClock);
  
  if (comparison === 'before') {
    return { ...remote, syncStatus: 'synced' };
  } else if (comparison === 'after') {
    return { ...local, syncStatus: 'pending' };
  } else {
    // Concurrent: use last-write-wins
    return local.lastModified >= remote.lastModified
      ? { ...local, syncStatus: 'pending' }
      : { ...remote, syncStatus: 'synced' };
  }
}

// Repository layer
export const watchlistRepository = {
  async getAll(): Promise<WatchlistItem[]> {
    const db = await getDb();
    const items = await db.getAll('watchlist');
    return items.filter(item => !item.deleted);
  },

  async getById(id: string): Promise<WatchlistItem | undefined> {
    const db = await getDb();
    const item = await db.get('watchlist', id);
    return item && !item.deleted ? item : undefined;
  },

  async add(item: Omit<WatchlistItem, 'id' | 'syncStatus' | 'vectorClock' | 'lastModified' | 'deleted'>): Promise<WatchlistItem> {
    const db = await getDb();
    const now = Date.now();
    
    const newItem: WatchlistItem = {
      ...item,
      id: `watchlist-${item.movieId}`,
      syncStatus: 'pending',
      vectorClock: incrementClock({}),
      lastModified: now,
      deleted: false,
    };
    
    const validated = WatchlistItemSchema.parse(newItem);
    await db.put('watchlist', validated);
    
    // Broadcast to other tabs
    broadcastChange({ type: 'add', item: validated });
    
    return validated;
  },

  async update(id: string, updates: Partial<Pick<WatchlistItem, 'watched' | 'notes'>>): Promise<WatchlistItem | undefined> {
    const db = await getDb();
    const existing = await db.get('watchlist', id);
    
    if (!existing || existing.deleted) return undefined;
    
    const updated: WatchlistItem = {
      ...existing,
      ...updates,
      syncStatus: 'pending',
      vectorClock: incrementClock(existing.vectorClock),
      lastModified: Date.now(),
    };
    
    const validated = WatchlistItemSchema.parse(updated);
    await db.put('watchlist', validated);
    
    broadcastChange({ type: 'update', item: validated });
    
    return validated;
  },

  async remove(id: string): Promise<boolean> {
    const db = await getDb();
    const existing = await db.get('watchlist', id);
    
    if (!existing) return false;
    
    // Soft delete for sync purposes
    const deleted: WatchlistItem = {
      ...existing,
      deleted: true,
      syncStatus: 'pending',
      vectorClock: incrementClock(existing.vectorClock),
      lastModified: Date.now(),
    };
    
    await db.put('watchlist', deleted);
    broadcastChange({ type: 'remove', item: deleted });
    
    return true;
  },

  async getPending(): Promise<WatchlistItem[]> {
    const db = await getDb();
    return db.getAllFromIndex('watchlist', 'by-sync-status', 'pending');
  },

  async markSynced(ids: string[]): Promise<void> {
    const db = await getDb();
    const tx = db.transaction('watchlist', 'readwrite');
    
    for (const id of ids) {
      const item = await tx.store.get(id);
      if (item) {
        await tx.store.put({ ...item, syncStatus: 'synced' });
      }
    }
    
    await tx.done;
  },

  async applyRemoteChanges(remoteItems: WatchlistItem[]): Promise<void> {
    const db = await getDb();
    const tx = db.transaction('watchlist', 'readwrite');
    
    for (const remote of remoteItems) {
      const local = await tx.store.get(remote.id);
      
      if (!local) {
        await tx.store.put({ ...remote, syncStatus: 'synced' });
      } else {
        const merged = mergeItems(local, remote);
        await tx.store.put(merged);
      }
    }
    
    await tx.done;
    broadcastChange({ type: 'sync' });
  },

  async isInWatchlist(movieId: string): Promise<boolean> {
    const db = await getDb();
    const item = await db.get('watchlist', `watchlist-${movieId}`);
    return !!item && !item.deleted;
  },
};

// BroadcastChannel for cross-tab sync
type WatchlistChangeEvent = 
  | { type: 'add'; item: WatchlistItem }
  | { type: 'update'; item: WatchlistItem }
  | { type: 'remove'; item: WatchlistItem }
  | { type: 'sync' };

let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel {
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel('watchlist-sync');
  }
  return broadcastChannel;
}

function broadcastChange(event: WatchlistChangeEvent): void {
  try {
    getBroadcastChannel().postMessage(event);
  } catch (e) {
    console.warn('BroadcastChannel not supported', e);
  }
}

export function subscribeToWatchlistChanges(
  callback: (event: WatchlistChangeEvent) => void
): () => void {
  const channel = getBroadcastChannel();
  
  const handler = (e: MessageEvent<WatchlistChangeEvent>) => {
    callback(e.data);
  };
  
  channel.addEventListener('message', handler);
  
  return () => {
    channel.removeEventListener('message', handler);
  };
}

// Mock server sync (simulates network sync)
export async function syncWithServer(): Promise<{ success: boolean; synced: number }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
  
  const pending = await watchlistRepository.getPending();
  
  if (pending.length > 0) {
    // Simulate successful sync
    await watchlistRepository.markSynced(pending.map(p => p.id));
    return { success: true, synced: pending.length };
  }
  
  return { success: true, synced: 0 };
}
