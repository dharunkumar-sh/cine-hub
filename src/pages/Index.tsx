import { useState, useCallback, Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { mockActor } from "@/data/mockData";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorBoundary, FilmGridSkeleton } from "@/components/ErrorBoundary";
import { VirtualizedFilmography } from "@/components/VirtualizedFilmography";
import { MovieDetailsModal } from "@/components/MovieDetailsModal";
import { SimilarActorsPanel } from "@/components/SimilarActorsPanel";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import { AuthModal } from "@/components/AuthModal";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Movie } from "@/data/mockData";
import {
  Award,
  Calendar,
  MapPin,
  Film,
  Instagram,
  Twitter,
  Globe,
  ExternalLink,
  LogOut,
  User as UserIcon,
} from "lucide-react";

const PersonJsonLd = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name: mockActor.name,
        alternateName: mockActor.alternateName,
        birthDate: mockActor.birthDate,
        birthPlace: mockActor.birthPlace,
        nationality: mockActor.nationality,
        image: mockActor.photo,
        description: mockActor.shortBio,
        jobTitle: "Actor",
        sameAs: mockActor.socialLinks.map((s) => s.url),
      }),
    }}
  />
);

function ActorProfile() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { syncStatus, pendingCount } = useWatchlist();
  const { isOnline } = useServiceWorker();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleMovieClick = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
  }, []);

  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (!selectedMovie) return;
      const currentIndex = mockActor.filmography.findIndex(
        (f) => f.id === selectedMovie.id
      );
      const newIndex =
        direction === "prev" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex >= 0 && newIndex < mockActor.filmography.length) {
        setSelectedMovie(mockActor.filmography[newIndex]);
      }
    },
    [selectedMovie]
  );

  const currentIndex = selectedMovie
    ? mockActor.filmography.findIndex((f) => f.id === selectedMovie.id)
    : -1;

  return (
    <div className="min-h-screen bg-background">
      <PersonJsonLd />

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Hero Section */}
      <header className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <img
          src={mockActor.backdropImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 hero-overlay" />

        <nav className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center">
          <span className="font-display text-2xl tracking-widest text-gold">
            Sivakarthikeyan Doss
          </span>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <SyncStatusIndicator
                  status={syncStatus}
                  pendingCount={pendingCount}
                  isOnline={isOnline}
                />
                <span className="text-sm text-foreground/80 hidden md:block">
                  {user.displayName || user.email}
                </span>
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => signOut(auth)}
                  className="text-muted-foreground hover:text-gold"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="goldOutline"
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
                className="gap-2"
              >
                <UserIcon className="h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container mx-auto flex flex-col md:flex-row gap-8 items-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-32 md:w-64 rounded-lg overflow-hidden shadow-elevated border-2 border-gold/30 flex-shrink-0"
            >
              <img
                src={mockActor.photo}
                alt={mockActor.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-5xl md:text-7xl text-foreground mb-2"
              >
                {mockActor.name}
              </motion.h1>
              {mockActor.alternateName && (
                <p className="font-serif text-xl text-muted-foreground italic mb-4">
                  {mockActor.alternateName}
                </p>
              )}
              <p className="text-lg text-foreground/80 max-w-2xl font-serif leading-relaxed mb-6">
                {mockActor.shortBio}
              </p>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gold" />
                  {new Date(mockActor.birthDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gold" />
                  {mockActor.birthPlace}
                </span>
                <span className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-gold" />
                  {mockActor.stats.totalFilms} Films
                </span>
                <span className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gold" />
                  {mockActor.stats.awardsWon} Awards
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-12">
        <ErrorBoundary>
          <Suspense fallback={<FilmGridSkeleton />}>
            <VirtualizedFilmography
              films={mockActor.filmography}
              onMovieClick={handleMovieClick}
              onRequireAuth={() => setIsAuthModalOpen(true)}
            />
          </Suspense>
        </ErrorBoundary>

        <div className="mt-16">
          <SimilarActorsPanel actors={mockActor.similarActors} />
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-display text-2xl text-gold">
            Sivakarthikeyan Doss
          </span>
          <div className="flex gap-4">
            {mockActor.socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors"
                aria-label={`Visit ${link.platform}`}
              >
                {link.platform === "instagram" && (
                  <Instagram className="h-5 w-5" />
                )}
                {link.platform === "twitter" && <Twitter className="h-5 w-5" />}
                {link.platform === "website" && <Globe className="h-5 w-5" />}
                {link.platform === "imdb" && (
                  <ExternalLink className="h-5 w-5" />
                )}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <MovieDetailsModal
        movie={selectedMovie}
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onNavigate={handleNavigate}
        hasPrev={currentIndex > 0}
        hasNext={currentIndex < mockActor.filmography.length - 1}
        onRequireAuth={() => setIsAuthModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function Index() {
  return (
    <ThemeProvider>
      <ActorProfile />
    </ThemeProvider>
  );
}
