import React, { useState, useCallback } from "react";
import { Film } from "lucide-react";

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  containerClassName?: string;
  aspectRatioClass?: string;
}

export function OptimizedImage({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  aspectRatioClass = "aspect-video",
  fallbackTitle,
  loading = "lazy",
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  return (
    <div
      className={`relative overflow-hidden bg-card/60 ${aspectRatioClass} ${containerClassName}`}
    >
      {/* Shimmer loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-muted/40 z-0" />
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-card text-muted-foreground border border-border/30 z-10">
          <Film className="h-6 w-6 text-gold/40 mb-1.5" />
          {fallbackTitle ? (
            <span className="font-display text-sm text-foreground/80 line-clamp-2 px-2">
              {fallbackTitle}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Cinematic Poster</span>
          )}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
}
