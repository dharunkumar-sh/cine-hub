import React, { Component, ErrorInfo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);

    // In production, send to error tracking service
    // errorTracker.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-[400px] flex flex-col items-center justify-center p-8 card-cinematic"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>

            <h2 className="font-display text-2xl text-foreground mb-2">
              Something went wrong
            </h2>

            <p className="text-muted-foreground mb-6">
              We encountered an unexpected error. This has been logged and we're
              working on fixing it.
            </p>

            {this.state.error && (
              <details className="text-left mb-6 p-4 bg-secondary rounded-lg">
                <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
                  Technical details
                </summary>
                <pre className="text-xs text-destructive overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleRetry} variant="gold">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Reload Page
              </Button>
            </div>

            {this.state.retryCount > 2 && (
              <p className="text-sm text-muted-foreground mt-4">
                If this keeps happening, try refreshing the page or clearing
                your browser cache.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading skeleton for suspense fallback
export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse ${className}`}
      aria-busy="true"
      aria-label="Loading content"
    >
      <div className="h-64 bg-secondary rounded-lg mb-4" />
      <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
      <div className="h-4 bg-secondary rounded w-1/2" />
    </div>
  );
}

// Card skeleton for filmography grid
export function FilmCardSkeleton() {
  return (
    <div className="card-cinematic overflow-hidden animate-pulse">
      <div className="aspect-video bg-secondary" />
      <div className="p-4">
        <div className="h-3 bg-secondary rounded w-1/2 mb-2" />
        <div className="h-5 bg-secondary rounded w-3/4 mb-2" />
        <div className="h-3 bg-secondary rounded w-1/3" />
      </div>
    </div>
  );
}

export function FilmGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <FilmCardSkeleton key={i} />
      ))}
    </div>
  );
}
