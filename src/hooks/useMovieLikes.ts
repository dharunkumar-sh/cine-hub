import { useState, useEffect, useCallback } from "react";
import { getMovieLikes } from "@/lib/firebaseDb";
import { useAuth } from "@/contexts/AuthContext";

export function useMovieLikes(
  movieId: string,
  options?: { fetchCount?: boolean }
) {
  const { user, isLoggedIn, isMovieLiked, toggleLike: authToggleLike } = useAuth();
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const shouldFetchCount = options?.fetchCount ?? true;
  const isLiked = isMovieLiked(movieId);

  useEffect(() => {
    if (!movieId || !shouldFetchCount) {
      return;
    }

    setIsLoading(true);
    const unsubscribeLikes = getMovieLikes(movieId, (count) => {
      setLikesCount(count);
      setIsLoading(false);
    });

    return () => {
      unsubscribeLikes();
    };
  }, [movieId, shouldFetchCount]);

  const toggleLike = useCallback(
    async (movieTitle = "Movie") => {
      if (!isLoggedIn || !movieId) {
        return;
      }
      return await authToggleLike(movieId, movieTitle);
    },
    [isLoggedIn, movieId, authToggleLike]
  );

  return {
    likesCount,
    isLiked,
    toggleLike,
    isLoggedIn,
    isLoading,
  };
}
