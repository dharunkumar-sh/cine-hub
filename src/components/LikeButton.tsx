import { useState } from "react";
import { motion } from "framer-motion";
import { useMovieLikes } from "@/hooks/useMovieLikes";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  movieId: string;
  movieTitle: string;
  className?: string;
  onRequireAuth: () => void;
}

export function LikeButton({
  movieId,
  movieTitle,
  className = "",
  onRequireAuth,
}: LikeButtonProps) {
  const { isLiked, toggleLike, isLoggedIn, isLoading } = useMovieLikes(
    movieId,
    { fetchCount: false }
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }

    if (isLoading) return;

    setIsAnimating(true);
    try {
      await toggleLike(movieTitle);
    } catch (error) {
      console.error("Error toggling like:", error);
    }

    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <motion.button
      className={`absolute top-2 left-2 p-2 rounded-full backdrop-blur-md transition-colors z-10 ${
        isLiked
          ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
          : "bg-background/80 text-red-500 hover:bg-background border border-red-500/30"
      } ${className}`}
      onClick={handleClick}
      whileTap={{ scale: 0.8 }}
      whileHover={{ scale: 1.15 }}
      animate={
        isAnimating
          ? {
              scale: [1, 1.4, 1],
              rotate: isLiked ? [0, -10, 10, 0] : [0, 10, -10, 0],
            }
          : {}
      }
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 15,
      }}
      aria-label={isLiked ? `Unlike ${movieTitle}` : `Like ${movieTitle}`}
      aria-pressed={isLiked}
      disabled={isLoading}
    >
      <Heart
        className={`h-4 w-4 transition-all ${isLiked ? "fill-current" : ""}`}
      />
    </motion.button>
  );
}
