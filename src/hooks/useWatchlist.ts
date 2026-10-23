import { useWatchlistContext } from "@/contexts/WatchlistContext";
import type { WatchlistItem } from "@/lib/watchlistDb";

export type { WatchlistItem };

export function useWatchlist() {
  return useWatchlistContext();
}
