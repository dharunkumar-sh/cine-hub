import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  increment,
  serverTimestamp,
  getDoc,
  onSnapshot,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import { WatchlistItem } from "./watchlistDb";
import { Review } from "@/data/reviewData";

// Helper to normalize Firestore watchlist docs into local shape
const mapWatchlistDoc = (
  docSnap: QueryDocumentSnapshot<DocumentData>
): WatchlistItem => {
  const data = docSnap.data();
  const now = Date.now();

  return {
    id: `watchlist-${docSnap.id}`,
    movieId: data?.movieId || docSnap.id,
    title: data?.title || "Untitled",
    poster: data?.poster || "",
    addedAt: data?.addedAt?.toMillis?.() || now,
    watched: data?.watched ?? false,
    notes: data?.notes,
    syncStatus: "synced",
    vectorClock: data?.vectorClock || {},
    lastModified:
      data?.lastModified ||
      data?.updatedAt?.toMillis?.() ||
      data?.addedAt?.toMillis?.() ||
      now,
    deleted: false,
  };
};

// Watchlist Operations
export const syncWatchlistToFirebase = async (
  userId: string,
  items: WatchlistItem[]
) => {
  if (!userId) return;
  const watchlistRef = collection(db, "users", userId, "watchlist");
  for (const item of items) {
    await setDoc(doc(watchlistRef, item.movieId), {
      ...item,
      updatedAt: serverTimestamp(),
    });
  }
};

export const addToFirebaseWatchlist = async (
  userId: string,
  movie: Partial<WatchlistItem> & { movieId: string }
) => {
  if (!userId || !movie.movieId) return;
  const docRef = doc(db, "users", userId, "watchlist", movie.movieId);
  await setDoc(docRef, {
    movieId: movie.movieId,
    title: movie.title || "Untitled",
    poster: movie.poster || "",
    watched: movie.watched ?? false,
    notes: movie.notes || "",
    addedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const removeFromFirebaseWatchlist = async (
  userId: string,
  movieId: string
) => {
  if (!userId || !movieId) return;
  const docRef = doc(db, "users", userId, "watchlist", movieId);
  await deleteDoc(docRef);
};

export const fetchFirebaseWatchlist = async (
  userId: string
): Promise<WatchlistItem[]> => {
  if (!userId) return [];
  const watchlistRef = collection(db, "users", userId, "watchlist");
  const snapshot = await getDocs(watchlistRef);
  return snapshot.docs.map((d) => mapWatchlistDoc(d));
};

export const subscribeFirebaseWatchlist = (
  userId: string,
  callback: (items: WatchlistItem[]) => void,
  onError?: (error: Error) => void
) => {
  if (!userId) return () => { };

  const watchlistRef = collection(db, "users", userId, "watchlist");
  return onSnapshot(
    watchlistRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => mapWatchlistDoc(d));
      callback(items);
    },
    (error) => {
      console.error("Watchlist subscription error:", error);
      if (onError) onError(error as Error);
    }
  );
};

// Review Operations
export const addFirebaseReview = async (
  movieId: string,
  review: Partial<Review>
) => {
  if (!movieId) throw new Error("Movie ID is required");
  if (!review.userId) throw new Error("User ID is required");
  if (!review.userName) throw new Error("User name is required");

  console.log("Adding review:", {
    movieId,
    userId: review.userId,
    userName: review.userName,
  });

  try {
    const reviewRef = doc(collection(db, "movies", movieId, "reviews"));
    const reviewData = {
      ...review,
      movieId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      helpful: 0,
      flagged: false,
      deleted: false,
      revisions: [],
    };

    await setDoc(reviewRef, reviewData);
    console.log("Review added successfully with ID:", reviewRef.id);
    return reviewRef.id;
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

export const updateFirebaseReview = async (
  movieId: string,
  reviewId: string,
  updates: Partial<Review>
) => {
  if (!movieId || !reviewId) return;
  const reviewRef = doc(db, "movies", movieId, "reviews", reviewId);
  await updateDoc(reviewRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteFirebaseReview = async (
  movieId: string,
  reviewId: string
) => {
  if (!movieId || !reviewId) return;
  const reviewRef = doc(db, "movies", movieId, "reviews", reviewId);
  await deleteDoc(reviewRef);
};

export const voteFirebaseReview = async (
  movieId: string,
  reviewId: string,
  voteType: "up" | "down"
) => {
  if (!movieId || !reviewId) return;

  console.log("Voting on review:", { movieId, reviewId, voteType });

  try {
    const reviewRef = doc(db, "movies", movieId, "reviews", reviewId);
    await updateDoc(reviewRef, {
      [voteType === "up" ? "upvotes" : "downvotes"]: increment(1),
    });
    console.log("Vote recorded successfully");
  } catch (error) {
    console.error("Error voting on review:", error);
    throw error;
  }
};

export const getFirebaseReviews = (
  movieId: string,
  callback: (reviews: Review[]) => void,
  onError?: (error: Error) => void
) => {
  if (!movieId) {
    callback([]);
    return () => { };
  }

  const reviewsRef = collection(db, "movies", movieId, "reviews");
  const q = query(reviewsRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const reviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        updatedAt:
          doc.data().updatedAt?.toMillis() ||
          doc.data().createdAt?.toMillis() ||
          Date.now(),
      })) as Review[];
      callback(reviews);
    },
    (error) => {
      console.error("Error fetching reviews:", error);
      if (onError) onError(error);
    }
  );
};

// Like Operations
export const toggleMovieLike = async (
  userId: string,
  userEmail: string,
  movieId: string
) => {
  if (!userId || !movieId) {
    console.error("toggleMovieLike: Missing userId or movieId");
    return false;
  }

  console.log("Toggling like for:", { userId, movieId, userEmail });

  try {
    const likeRef = doc(db, "users", userId, "likes", movieId);
    const movieLikeRef = doc(db, "movies", movieId, "likes", userId);
    const movieRef = doc(db, "movies", movieId);

    const likeDoc = await getDoc(likeRef);
    console.log("Like doc exists:", likeDoc.exists());

    if (likeDoc.exists()) {
      console.log("Removing like...");
      await deleteDoc(likeRef);
      await deleteDoc(movieLikeRef);

      const movieDoc = await getDoc(movieRef);
      if (movieDoc.exists()) {
        await updateDoc(movieRef, {
          likesCount: increment(-1),
        });
      }
      console.log("Like removed successfully");
      return false; // Unliked
    } else {
      console.log("Adding like...");
      const likeData = {
        likedAt: serverTimestamp(),
        userEmail: userEmail,
        movieId: movieId,
        userId: userId,
      };

      await setDoc(likeRef, likeData);
      await setDoc(movieLikeRef, likeData);

      // Ensure movie doc exists before updating
      const movieDoc = await getDoc(movieRef);
      if (!movieDoc.exists()) {
        console.log("Creating new movie doc with likes");
        await setDoc(movieRef, { likesCount: 1 });
      } else {
        console.log("Updating existing movie doc");
        await updateDoc(movieRef, {
          likesCount: increment(1),
        });
      }
      console.log("Like added successfully");
      return true; // Liked
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

export const getMovieLikes = (
  movieId: string,
  callback: (count: number) => void
) => {
  if (!movieId) {
    callback(0);
    return () => { };
  }

  const movieRef = doc(db, "movies", movieId);
  return onSnapshot(movieRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().likesCount || 0);
    } else {
      callback(0);
    }
  });
};

export const checkIfLiked = async (userId: string, movieId: string) => {
  if (!userId || !movieId) return false;
  const likeRef = doc(db, "users", userId, "likes", movieId);
  const likeDoc = await getDoc(likeRef);
  return likeDoc.exists();
};
