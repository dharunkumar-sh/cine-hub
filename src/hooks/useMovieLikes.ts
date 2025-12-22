import { useState, useEffect, useCallback } from "react";
import { toggleMovieLike, getMovieLikes, checkIfLiked } from "@/lib/firebaseDb";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function useMovieLikes(movieId: string) {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!movieId) {
      setIsLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email);
        checkIfLiked(user.uid, movieId).then(setIsLiked);
      } else {
        setUserId(null);
        setUserEmail(null);
        setIsLiked(false);
      }
    });

    const unsubscribeLikes = getMovieLikes(movieId, (count) => {
      setLikesCount(count);
      setIsLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeLikes();
    };
  }, [movieId]);

  const toggleLike = useCallback(async () => {
    if (!userId || !movieId) {
      console.warn("Cannot toggle like: missing userId or movieId");
      return;
    }

    console.log("toggleLike called:", { userId, userEmail, movieId });

    try {
      const liked = await toggleMovieLike(
        userId,
        userEmail || "anonymous",
        movieId
      );
      console.log("Like toggled, new state:", liked);
      setIsLiked(liked);
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  }, [userId, userEmail, movieId]);

  return { likesCount, isLiked, toggleLike, isLoggedIn: !!userId, isLoading };
}
