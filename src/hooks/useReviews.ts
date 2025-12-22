import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import { openDB } from "idb";
import {
  Review,
  ReviewSchema,
  sortReviews,
  SortOption,
  filterProfanity,
  generateIdempotencyKey,
} from "@/data/reviewData";
import { auth } from "@/lib/firebase";
import {
  addFirebaseReview,
  getFirebaseReviews,
  voteFirebaseReview,
  deleteFirebaseReview,
} from "@/lib/firebaseDb";
import { onAuthStateChanged } from "firebase/auth";

// IndexedDB for draft autosave
const DB_NAME = "review-drafts";
const STORE_NAME = "drafts";

async function getDraftDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "movieId" });
      }
    },
  });
}

interface ReviewDraft {
  movieId: string;
  title: string;
  content: string;
  rating: number;
  lastSaved: number;
}

export function useReviews(movieId: string) {
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<SortOption>("helpful");
  const [draft, setDraft] = useState<ReviewDraft | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [pendingIdempotencyKeys] = useState(new Set<string>());
  const [userId, setUserId] = useState<string | null>(null);
  const [firebaseReviews, setFirebaseReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return unsubscribe;
  }, []);

  // Real-time Firebase reviews
  useEffect(() => {
    if (!movieId) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = getFirebaseReviews(
      movieId,
      (reviews) => {
        setFirebaseReviews(reviews);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [movieId]);

  // Combine mock and firebase reviews (if any)
  const allReviews = [...firebaseReviews];

  // Sorted reviews
  const sortedReviews = sortReviews(
    allReviews.filter((r) => !r.deleted),
    sortBy
  );

  // Load draft from IndexedDB on mount
  useEffect(() => {
    async function loadDraft() {
      try {
        const db = await getDraftDb();
        const savedDraft = await db.get(STORE_NAME, movieId);
        if (savedDraft) {
          setDraft(savedDraft);
        }
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
    loadDraft();
  }, [movieId]);

  // Autosave draft
  const saveDraft = useCallback(
    async (draftData: Partial<ReviewDraft>) => {
      setIsSavingDraft(true);
      try {
        const db = await getDraftDb();
        const newDraft: ReviewDraft = {
          movieId,
          title: draftData.title || draft?.title || "",
          content: draftData.content || draft?.content || "",
          rating: draftData.rating || draft?.rating || 5,
          lastSaved: Date.now(),
        };
        await db.put(STORE_NAME, newDraft);
        setDraft(newDraft);
      } catch (e) {
        console.error("Failed to save draft:", e);
      } finally {
        setIsSavingDraft(false);
      }
    },
    [movieId, draft]
  );

  // Clear draft
  const clearDraft = useCallback(async () => {
    try {
      const db = await getDraftDb();
      await db.delete(STORE_NAME, movieId);
      setDraft(null);
    } catch (e) {
      console.error("Failed to clear draft:", e);
    }
  }, [movieId]);

  // Submit review mutation with optimistic updates
  const submitMutation = useMutation({
    mutationFn: async (reviewData: {
      title: string;
      content: string;
      rating: number;
    }) => {
      const idempotencyKey = generateIdempotencyKey(
        userId || "anonymous",
        movieId
      );

      // Check for duplicate submission
      if (pendingIdempotencyKeys.has(idempotencyKey)) {
        throw new Error("Duplicate submission detected");
      }
      pendingIdempotencyKeys.add(idempotencyKey);

      const sanitizedContent = filterProfanity(reviewData.content || "");
      const sanitizedTitle = filterProfanity(reviewData.title || "");

      if (!userId) {
        throw new Error("You must be logged in to post a review");
      }

      return addFirebaseReview(movieId, {
        ...reviewData,
        title: sanitizedTitle,
        content: sanitizedContent,
        rating: reviewData.rating,
        userId: userId,
        userName:
          auth.currentUser?.displayName ||
          auth.currentUser?.email?.split("@")[0] ||
          "Anonymous User",
        userAvatar:
          auth.currentUser?.photoURL ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      });
    },
    onMutate: async (newReview) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["reviews", movieId] });

      // Snapshot previous value
      const previousReviews = queryClient.getQueryData<Review[]>([
        "reviews",
        movieId,
      ]);

      // Optimistic update
      const optimisticReview: Review = {
        id: `temp-${Date.now()}`,
        movieId,
        userId: "current-user",
        userName: "You",
        rating: newReview.rating,
        title: filterProfanity(newReview.title),
        content: filterProfanity(newReview.content),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        upvotes: 0,
        downvotes: 0,
        helpful: 0,
        flagged: false,
        deleted: false,
        revisions: [],
      };

      queryClient.setQueryData<Review[]>(["reviews", movieId], (old) => [
        optimisticReview,
        ...(old || []),
      ]);

      return { previousReviews };
    },
    onError: (err, newReview, context) => {
      // Rollback on error
      if (context?.previousReviews) {
        queryClient.setQueryData(["reviews", movieId], context.previousReviews);
      }
    },
    onSuccess: async () => {
      // Clear draft on success
      await clearDraft();
      // Refetch to get server version
      queryClient.invalidateQueries({ queryKey: ["reviews", movieId] });
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({
      reviewId,
      voteType,
    }: {
      reviewId: string;
      voteType: "up" | "down";
    }) => {
      return voteFirebaseReview(movieId, reviewId, voteType);
    },
    onMutate: async ({ reviewId, voteType }) => {
      await queryClient.cancelQueries({ queryKey: ["reviews", movieId] });
      const previousReviews = queryClient.getQueryData<Review[]>([
        "reviews",
        movieId,
      ]);

      queryClient.setQueryData<Review[]>(["reviews", movieId], (old) =>
        old?.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                upvotes:
                  voteType === "up" ? review.upvotes + 1 : review.upvotes,
                downvotes:
                  voteType === "down" ? review.downvotes + 1 : review.downvotes,
              }
            : review
        )
      );

      return { previousReviews };
    },
    onError: (err, variables, context) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(["reviews", movieId], context.previousReviews);
      }
    },
  });

  // Soft delete with undo
  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return deleteFirebaseReview(movieId, reviewId);
    },
    onMutate: async (reviewId) => {
      await queryClient.cancelQueries({ queryKey: ["reviews", movieId] });
      const previousReviews = queryClient.getQueryData<Review[]>([
        "reviews",
        movieId,
      ]);

      queryClient.setQueryData<Review[]>(["reviews", movieId], (old) =>
        old?.map((review) =>
          review.id === reviewId ? { ...review, deleted: true } : review
        )
      );

      return { previousReviews, reviewId };
    },
    onError: (err, reviewId, context) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(["reviews", movieId], context.previousReviews);
      }
    },
  });

  // Undo delete
  const undoDelete = useCallback(
    (reviewId: string) => {
      queryClient.setQueryData<Review[]>(["reviews", movieId], (old) =>
        old?.map((review) =>
          review.id === reviewId ? { ...review, deleted: false } : review
        )
      );
    },
    [movieId, queryClient]
  );

  // Flag review
  const flagReview = useCallback(async (reviewId: string, reason: string) => {
    // In production, this would call an API
    console.log("Flagged review:", reviewId, "Reason:", reason);
  }, []);

  return {
    reviews: sortedReviews,
    isLoading,
    error,
    sortBy,
    setSortBy,
    draft,
    saveDraft,
    clearDraft,
    isSavingDraft,
    submitReview: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.error,
    vote: voteMutation.mutate,
    deleteReview: deleteMutation.mutate,
    undoDelete,
    flagReview,
    refetch: () => {},
    userId,
  };
}
