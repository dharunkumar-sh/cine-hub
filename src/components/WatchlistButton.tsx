import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWatchlist } from "@/hooks/useWatchlist";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Bookmark, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WatchlistButtonProps {
  movieId: string;
  title: string;
  poster: string;
  className?: string;
  onRequireAuth: () => void;
}

export function WatchlistButton({
  movieId,
  title,
  poster,
  className = "",
  onRequireAuth,
}: WatchlistButtonProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const inList = isInWatchlist(movieId);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!auth.currentUser);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    setIsAnimating(true);

    try {
      if (inList) {
        const ok = await removeFromWatchlist(movieId);
        console.log("Remove result:", ok);
        if (ok) {
          toast({
            title: "Removed from watchlist",
            description: `${title} was removed from your watchlist`,
          });
        }
      } else {
        const ok = await addToWatchlist({ movieId, title, poster });
        console.log("Add result:", ok);
        if (ok) {
          toast({
            title: "Added to watchlist",
            description: `${title} added to your watchlist`,
          });
        }
      }
    } catch (error) {
      console.error("Watchlist error:", error);
      toast({
        title: "Error",
        description: "Failed to update watchlist",
        variant: "destructive",
      });
    }

    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <motion.button
      className={`absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-sm transition-all z-10 ${inList
          ? "bg-gold text-primary-foreground shadow-md opacity-100"
          : "bg-background/95 text-foreground border border-border hover:bg-gold hover:text-primary-foreground hover:border-gold shadow-sm opacity-0 group-hover:opacity-100"
        } ${className}`}
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      animate={
        isAnimating
          ? {
            scale: [1, 1.1, 1],
          }
          : {}
      }
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
      aria-label={
        inList ? `Remove ${title} from watchlist` : `Add ${title} to watchlist`
      }
      aria-pressed={inList}
      role="switch"
    >
      <AnimatePresence mode="wait">
        {inList ? (
          <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="flex items-center gap-1.5"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            <span>In Watchlist</span>
          </motion.div>
        ) : (
          <motion.div
            key="bookmark"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="flex items-center gap-1.5"
          >
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            <span>Add to Watchlist</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
