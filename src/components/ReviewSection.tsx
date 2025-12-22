import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReviews } from "@/hooks/useReviews";
import { Button } from "@/components/ui/button";
import { Review, SortOption, wilsonScore } from "@/data/reviewData";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Edit,
  Trash2,
  Undo,
  MessageSquare,
  ChevronDown,
  Loader2,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReviewSectionProps {
  movieId: string;
  movieTitle: string;
  onRequireAuth: () => void;
}

// Star rating input
function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div
      className="flex gap-1"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHoverValue(0)}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          className="p-0.5 focus:outline-none focus:ring-2 focus:ring-gold rounded"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} stars`}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= (hoverValue || value)
                ? "text-gold fill-gold"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">{value}/10</span>
    </div>
  );
}

// Individual review card
function ReviewCard({
  review,
  onVote,
  onDelete,
  onUndo,
  onFlag,
  currentUserId,
}: {
  review: Review;
  onVote: (type: "up" | "down") => void;
  onDelete: () => void;
  onUndo: () => void;
  onFlag: (reason: string) => void;
  currentUserId: string | null;
}) {
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const score = wilsonScore(review.upvotes, review.downvotes);
  const isOwn =
    review.userId === "current-user" ||
    (currentUserId && review.userId === currentUserId);

  const handleDelete = () => {
    setIsDeleted(true);
    onDelete();

    // Auto-clear undo after 5 seconds
    undoTimeoutRef.current = setTimeout(() => {
      setIsDeleted(false);
    }, 5000);
  };

  const handleUndo = () => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    setIsDeleted(false);
    onUndo();
  };

  if (isDeleted) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="card-cinematic p-4 flex items-center justify-between"
      >
        <span className="text-muted-foreground">Review deleted</span>
        <Button variant="ghost" size="sm" onClick={handleUndo}>
          <Undo className="h-4 w-4 mr-1" /> Undo
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card-cinematic p-6"
      aria-label={`Review by ${review.userName}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.userAvatar && (
            <img
              src={review.userAvatar}
              alt=""
              className="w-10 h-10 rounded-full bg-secondary"
            />
          )}
          <div>
            <p className="font-medium text-foreground">{review.userName}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-0.5">
                <Star className="h-3.5 w-3.5 text-gold fill-gold" />
                <span>{review.rating}/10</span>
              </div>
              <span>•</span>
              <time dateTime={new Date(review.createdAt).toISOString()}>
                {new Date(review.createdAt).toLocaleDateString()}
              </time>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwn && (
            <Button
              variant="ghost"
              size="iconSm"
              onClick={handleDelete}
              aria-label="Delete review"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setShowFlagDialog(true)}
            aria-label="Flag review"
          >
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
      <p className="text-foreground/80 leading-relaxed font-serif">
        {review.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
        <button
          onClick={() => onVote("up")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors"
          aria-label={`Helpful (${review.upvotes})`}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{review.upvotes}</span>
        </button>
        <button
          onClick={() => onVote("down")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
          aria-label={`Not helpful (${review.downvotes})`}
        >
          <ThumbsDown className="h-4 w-4" />
          <span>{review.downvotes}</span>
        </button>

        {review.revisions.length > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            Edited {review.revisions.length} time
            {review.revisions.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Flag dialog */}
      <AnimatePresence>
        {showFlagDialog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-secondary rounded-lg"
          >
            <p className="text-sm text-foreground mb-3">
              Why are you flagging this review?
            </p>
            <div className="flex flex-wrap gap-2">
              {["Spam", "Offensive", "Spoilers", "Off-topic"].map((reason) => (
                <Button
                  key={reason}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onFlag(reason);
                    setShowFlagDialog(false);
                  }}
                >
                  {reason}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFlagDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// Review form with autosave
function ReviewForm({
  movieId,
  draft,
  onSaveDraft,
  onSubmit,
  isSaving,
  isSubmitting,
  onClearDraft,
}: {
  movieId: string;
  draft: { title: string; content: string; rating: number } | null;
  onSaveDraft: (data: {
    title?: string;
    content?: string;
    rating?: number;
  }) => void;
  onSubmit: (data: { title: string; content: string; rating: number }) => void;
  isSaving: boolean;
  isSubmitting: boolean;
  onClearDraft: () => void;
}) {
  const [title, setTitle] = useState(draft?.title || "");
  const [content, setContent] = useState(draft?.content || "");
  const [rating, setRating] = useState(draft?.rating || 7);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>(
    {}
  );

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Autosave on change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (title || content) {
        onSaveDraft({ title, content, rating });
      }
    }, 1000);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [title, content, rating, onSaveDraft]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (title.length < 3)
      newErrors.title = "Title must be at least 3 characters";
    if (title.length > 100)
      newErrors.title = "Title must be less than 100 characters";
    if (content.length < 10)
      newErrors.content = "Review must be at least 10 characters";
    if (content.length > 5000)
      newErrors.content = "Review must be less than 5000 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ title, content, rating });
      setTitle("");
      setContent("");
      setRating(7);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-cinematic p-6 mb-6">
      <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-gold" />
        Write a Review
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-2">
            Your Rating
          </label>
          <StarRating
            value={rating}
            onChange={setRating}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label
            htmlFor="review-title"
            className="block text-sm text-muted-foreground mb-2"
          >
            Title
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-secondary border border-border rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="Summarize your thoughts..."
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title && (
            <p
              id="title-error"
              className="text-sm text-destructive mt-1 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" /> {errors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="review-content"
            className="block text-sm text-muted-foreground mb-2"
          >
            Your Review
          </label>
          <textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            rows={5}
            className="w-full bg-secondary border border-border rounded-md px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gold resize-none"
            placeholder="What did you think of this film?"
            aria-invalid={!!errors.content}
            aria-describedby={errors.content ? "content-error" : undefined}
          />
          {errors.content && (
            <p
              id="content-error"
              className="text-sm text-destructive mt-1 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" /> {errors.content}
            </p>
          )}
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{content.length}/5000</span>
            {isSaving && (
              <span className="flex items-center gap-1">
                <Save className="h-3 w-3" /> Saving draft...
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" variant="gold" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
          {draft && (
            <Button type="button" variant="ghost" onClick={onClearDraft}>
              Clear Draft
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

export function ReviewSection({
  movieId,
  movieTitle,
  onRequireAuth,
}: ReviewSectionProps) {
  const {
    reviews,
    isLoading,
    sortBy,
    setSortBy,
    draft,
    saveDraft,
    clearDraft,
    isSavingDraft,
    submitReview,
    isSubmitting,
    vote,
    deleteReview,
    undoDelete,
    flagReview,
    userId,
  } = useReviews(movieId);

  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const isLoggedIn = !!userId;

  const handleWriteReview = () => {
    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }
    setShowForm(!showForm);
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "helpful", label: "Most Helpful" },
    { value: "recent", label: "Most Recent" },
    { value: "controversial", label: "Controversial" },
    { value: "rating-high", label: "Highest Rated" },
    { value: "rating-low", label: "Lowest Rated" },
  ];

  const handleSubmit = (data: {
    title: string;
    content: string;
    rating: number;
  }) => {
    submitReview(data, {
      onSuccess: () => {
        toast({
          title: "Review posted!",
          description: `Your review for ${movieTitle} has been published and is now visible to everyone.`,
        });
        setShowForm(false);
        clearDraft();
      },
      onError: (error: any) => {
        toast({
          title: "Failed to submit review",
          description: error?.message || "Please try again later.",
          variant: "destructive",
        });
      },
    });
  };

  const handleFlag = (reviewId: string, reason: string) => {
    flagReview(reviewId, reason);
    toast({
      title: "Review flagged",
      description: "Thank you for your feedback. We'll review this content.",
    });
  };

  return (
    <section aria-labelledby="reviews-heading">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3
          id="reviews-heading"
          className="font-display text-2xl text-foreground"
        >
          Reviews ({reviews.length})
        </h3>

        <div className="flex items-center gap-3">
          <label htmlFor="sort-reviews" className="sr-only">
            Sort reviews
          </label>
          <select
            id="sort-reviews"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <Button
            variant={showForm ? "gold" : "goldOutline"}
            onClick={handleWriteReview}
          >
            Write Review
          </Button>
        </div>
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ReviewForm
              movieId={movieId}
              draft={draft}
              onSaveDraft={saveDraft}
              onSubmit={handleSubmit}
              isSaving={isSavingDraft}
              isSubmitting={isSubmitting}
              onClearDraft={clearDraft}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      )}

      {/* Reviews list */}
      {!isLoading && (
        <div className="space-y-4" role="feed" aria-label="Reviews">
          <AnimatePresence mode="popLayout">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onVote={(type) => vote({ reviewId: review.id, voteType: type })}
                onDelete={() => deleteReview(review.id)}
                onUndo={() => undoDelete(review.id)}
                onFlag={(reason) => handleFlag(review.id, reason)}
                currentUserId={userId}
              />
            ))}
          </AnimatePresence>

          {reviews.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-foreground">
                No reviews yet
              </p>
              <p>Add your first review to share your thoughts!</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
