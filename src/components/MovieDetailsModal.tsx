import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Movie } from "@/data/mockData";
import { useMovieLikes } from "@/hooks/useMovieLikes";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  User,
  Heart,
} from "lucide-react";
import { ReviewSection } from "./ReviewSection";
import { useToast } from "@/hooks/use-toast";

interface MovieDetailsModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (direction: "prev" | "next") => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onRequireAuth: () => void;
}

export function MovieDetailsModal({
  movie,
  isOpen,
  onClose,
  onNavigate,
  hasPrev = false,
  hasNext = false,
  onRequireAuth,
}: MovieDetailsModalProps) {
  const { toast } = useToast();
  const {
    likesCount,
    isLiked,
    toggleLike,
    isLoading: likesLoading,
    isLoggedIn,
  } = useMovieLikes(movie?.id || "");

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          if (e.shiftKey && onNavigate && hasPrev) {
            onNavigate("prev");
          }
          break;
        case "ArrowRight":
          if (e.shiftKey && onNavigate && hasNext) {
            onNavigate("next");
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNavigate, hasPrev, hasNext]);

  if (!movie) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-5xl h-[90vh] p-0 overflow-hidden bg-card border-border"
        aria-describedby="movie-description"
        hideClose
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Navigation arrows */}
        {onNavigate && (
          <>
            {hasPrev && (
              <button
                onClick={() => onNavigate("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                aria-label="Previous movie"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={() => onNavigate("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                aria-label="Next movie"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </>
        )}

        <div className="h-full overflow-y-auto">
          {/* Movie Info */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Poster */}
              <motion.div
                className="w-full md:w-64 aspect-square rounded-lg overflow-hidden shadow-elevated flex-shrink-0 relative z-10 border-2 border-gold/30"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <img
                  src={movie.posterSquare || movie.poster}
                  alt={`${movie.title} poster`}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Details */}
              <div className="flex-1">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <DialogHeader>
                    <DialogTitle className="font-display text-4xl md:text-5xl text-foreground mb-2">
                      {movie.title}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                    <span className="text-gold font-medium">{movie.year}</span>
                    {movie.runtime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {movie.runtime} min
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-gold fill-gold" />
                      {movie.rating}/10
                    </span>
                    {movie.director && (
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {movie.director}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.genre.map((g) => (
                      <span
                        key={g}
                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  {movie.character && (
                    <p className="font-serif text-lg text-muted-foreground italic mb-4">
                      Starring as{" "}
                      <span className="text-gold">{movie.character}</span>
                    </p>
                  )}

                  {movie.synopsis && (
                    <p
                      id="movie-description"
                      className="text-foreground/80 leading-relaxed mb-6 font-serif"
                    >
                      {movie.synopsis}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      variant={isLiked ? "destructive" : "outline"}
                      onClick={async () => {
                        if (!isLoggedIn) {
                          onRequireAuth();
                          return;
                        }
                        const wasLiked = isLiked;
                        await toggleLike();
                        toast({
                          title: wasLiked ? "Unliked" : "Liked",
                          description: wasLiked
                            ? `Removed ${movie.title} from your likes`
                            : `Added ${movie.title} to your likes`,
                        });
                      }}
                      disabled={likesLoading}
                      className={`gap-2 ${isLiked
                          ? ""
                          : "border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                        }`}
                    >
                      <Heart
                        className={`h-4 w-4 transition-all ${isLiked ? "fill-current scale-110" : ""
                          }`}
                      />
                      {isLiked ? "Liked" : "Like"}
                      {likesCount > 0 && (
                        <span className="ml-1 text-xs opacity-80">
                          ({likesCount})
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Reviews Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12"
            >
              <ReviewSection
                movieId={movie.id}
                movieTitle={movie.title}
                onRequireAuth={onRequireAuth}
              />
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
