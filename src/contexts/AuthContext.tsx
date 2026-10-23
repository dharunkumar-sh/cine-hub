import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toggleMovieLike } from "@/lib/firebaseDb";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: FirebaseUser | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  signOut: () => Promise<void>;
  likedMovieIds: Set<string>;
  isMovieLiked: (movieId: string) => boolean;
  toggleLike: (movieId: string, movieTitle: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [likedMovieIds, setLikedMovieIds] = useState<Set<string>>(new Set());
  const likesUnsubscribeRef = useRef<(() => void) | null>(null);

  // Centralized Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);

      // Clean up previous likes listener
      if (likesUnsubscribeRef.current) {
        likesUnsubscribeRef.current();
        likesUnsubscribeRef.current = null;
      }

      if (currentUser) {
        // Single listener for all user likes
        const userLikesRef = collection(db, "users", currentUser.uid, "likes");
        likesUnsubscribeRef.current = onSnapshot(
          userLikesRef,
          (snapshot) => {
            const ids = new Set<string>();
            snapshot.docs.forEach((doc) => ids.add(doc.id));
            setLikedMovieIds(ids);
          },
          (error) => {
            console.error("[AuthContext] Error fetching likes:", error);
          }
        );
      } else {
        setLikedMovieIds(new Set());
      }
    });

    return () => {
      unsubscribe();
      if (likesUnsubscribeRef.current) {
        likesUnsubscribeRef.current();
      }
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setLikedMovieIds(new Set());
    } catch (error) {
      console.error("[AuthContext] Error signing out:", error);
      throw error;
    }
  }, []);

  const isMovieLiked = useCallback(
    (movieId: string) => {
      return likedMovieIds.has(movieId);
    },
    [likedMovieIds]
  );

  const toggleLike = useCallback(
    async (movieId: string, movieTitle: string): Promise<boolean> => {
      if (!user) {
        return false;
      }

      const wasLiked = likedMovieIds.has(movieId);

      // Optimistic update for instant responsiveness
      setLikedMovieIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) {
          next.delete(movieId);
        } else {
          next.add(movieId);
        }
        return next;
      });

      try {
        const result = await toggleMovieLike(
          user.uid,
          user.email || "anonymous",
          movieId
        );

        toast({
          title: result ? "Liked" : "Unliked",
          description: result
            ? `Added ${movieTitle} to your likes`
            : `Removed ${movieTitle} from your likes`,
        });

        return result;
      } catch (error) {
        // Rollback on error
        setLikedMovieIds((prev) => {
          const next = new Set(prev);
          if (wasLiked) {
            next.add(movieId);
          } else {
            next.delete(movieId);
          }
          return next;
        });

        toast({
          title: "Error",
          description: "Failed to update like status",
          variant: "destructive",
        });

        throw error;
      }
    },
    [user, likedMovieIds]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAuthLoading,
        signOut,
        likedMovieIds,
        isMovieLiked,
        toggleLike,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
