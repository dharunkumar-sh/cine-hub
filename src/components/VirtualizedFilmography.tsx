import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Movie, genres, roles } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { LikeButton } from "./LikeButton";
import { Star, Filter, X, Grid, List, Search } from "lucide-react";

interface VirtualizedFilmographyProps {
  films: Movie[];
  onMovieClick: (movie: Movie) => void;
  onRequireAuth: () => void;
}

type ViewMode = "grid" | "list";

export function VirtualizedFilmography({
  films,
  onMovieClick,
  onRequireAuth,
}: VirtualizedFilmographyProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique years
  const years = useMemo(() => {
    return [...new Set(films.map((f) => f.year))].sort((a, b) => b - a);
  }, [films]);

  // Filter films
  const filteredFilms = useMemo(() => {
    return films.filter((film) => {
      if (
        searchQuery &&
        !film.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (yearFilter !== "all" && film.year !== parseInt(yearFilter))
        return false;
      if (genreFilter !== "all" && !film.genre.includes(genreFilter))
        return false;
      if (roleFilter !== "all" && film.role !== roleFilter) return false;
      return true;
    });
  }, [films, searchQuery, yearFilter, genreFilter, roleFilter]);

  const hasActiveFilters =
    yearFilter !== "all" ||
    genreFilter !== "all" ||
    roleFilter !== "all" ||
    searchQuery;

  const clearFilters = useCallback(() => {
    setYearFilter("all");
    setGenreFilter("all");
    setRoleFilter("all");
    setSearchQuery("");
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, movie: Movie) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onMovieClick(movie);
      }
    },
    [onMovieClick]
  );

  return (
    <section aria-labelledby="filmography-heading" className="relative">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2
              id="filmography-heading"
              className="font-display text-4xl text-foreground mb-2"
            >
              Filmography
            </h2>
            <p className="text-lg text-muted-foreground font-serif">
              {filteredFilms.length} of {films.length} films
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-secondary" : "hover:bg-secondary/50"
                  }`}
                aria-pressed={viewMode === "grid"}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-secondary" : "hover:bg-secondary/50"
                  }`}
                aria-pressed={viewMode === "list"}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button
              variant={showFilters ? "gold" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 w-2 h-2 bg-gold rounded-full" />
              )}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search films..."
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
            aria-label="Search filmography"
          />
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="card-cinematic p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="year-filter"
                    className="block text-sm text-muted-foreground mb-2"
                  >
                    Year
                  </label>
                  <select
                    id="year-filter"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-foreground"
                  >
                    <option value="all">All Years</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="genre-filter"
                    className="block text-sm text-muted-foreground mb-2"
                  >
                    Genre
                  </label>
                  <select
                    id="genre-filter"
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-foreground"
                  >
                    <option value="all">All Genres</option>
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="role-filter"
                    className="block text-sm text-muted-foreground mb-2"
                  >
                    Role
                  </label>
                  <select
                    id="role-filter"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-foreground"
                  >
                    <option value="all">All Roles</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  <X className="h-4 w-4" /> Clear All Filters
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Film List/Grid */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            : "flex flex-col gap-4"
        }
        role="list"
        aria-label="Filmography"
      >
        {filteredFilms.map((film) => {
          if (viewMode === "grid") {
            return (
              <motion.article
                key={film.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative card-cinematic overflow-hidden cursor-pointer flex flex-col h-full"
                onClick={() => onMovieClick(film)}
                onKeyDown={(e) => handleKeyDown(e, film)}
                tabIndex={0}
                role="listitem"
                aria-label={`${film.title} (${film.year})`}
                whileHover={{ y: -5 }}
              >
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={film.posterLandscape || film.poster}
                    alt={`${film.title} poster`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>

                <LikeButton
                  movieId={film.id}
                  movieTitle={film.title}
                  onRequireAuth={onRequireAuth}
                />

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs text-gold font-medium bg-gold/10 px-2 py-1 rounded">
                      {film.year}
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {film.role}
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-foreground group-hover:text-gold transition-colors line-clamp-2 mb-1">
                    {film.title}
                  </h3>
                  {film.character && (
                    <p className="text-sm text-muted-foreground font-serif italic line-clamp-1 mb-3">
                      as {film.character}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-auto">
                    <Star className="h-4 w-4 text-gold fill-gold" />
                    <span className="text-sm text-foreground font-medium">
                      {film.rating.toFixed(1)}
                    </span>
                    {film.runtime && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          {film.runtime}m
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          }

          // List view
          return (
            <motion.article
              key={film.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-cinematic flex gap-6 p-4 cursor-pointer hover:border-gold/30 transition-all group relative"
              onClick={() => onMovieClick(film)}
              onKeyDown={(e) => handleKeyDown(e, film)}
              tabIndex={0}
              role="listitem"
            >
              <div className="w-48 aspect-video rounded-md overflow-hidden flex-shrink-0 shadow-lg relative">
                <img
                  src={film.posterLandscape || film.poster}
                  alt={`${film.title} poster`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <LikeButton
                  movieId={film.id}
                  movieTitle={film.title}
                  onRequireAuth={onRequireAuth}
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display text-2xl text-foreground group-hover:text-gold transition-colors truncate">
                      {film.title}
                    </h3>
                    <span className="text-sm text-gold font-medium bg-gold/10 px-2 py-1 rounded whitespace-nowrap">
                      {film.year}
                    </span>
                  </div>
                  {film.character && (
                    <p className="text-base text-muted-foreground font-serif italic mb-2">
                      as {film.character}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2 max-w-2xl">
                    {film.synopsis}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Star className="h-4 w-4 text-gold fill-gold" />
                    {film.rating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">{film.role}</span>
                  {film.runtime && (
                    <span className="flex items-center gap-1">
                      {film.runtime}m
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    {film.genre.join(", ")}
                  </span>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredFilms.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-xl mb-4">No films match your filters.</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </section>
  );
}
