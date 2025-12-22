// API Client with Circuit Breaker, Rate Limiting, and Retry Logic

type CircuitState = "closed" | "open" | "half-open";

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenRequests: number;
}

class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private lastFailure: number | null = null;
  private halfOpenAttempts = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - (this.lastFailure || 0) > this.config.resetTimeout) {
        this.state = "half-open";
        this.halfOpenAttempts = 0;
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    if (this.state === "half-open") {
      this.halfOpenAttempts++;
      if (this.halfOpenAttempts >= this.config.halfOpenRequests) {
        this.state = "closed";
      }
    }
  }

  private onFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.config.failureThreshold) {
      this.state = "open";
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// Token Bucket Rate Limiter
class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number // tokens per second
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<boolean> {
    this.refill();
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }

  async waitForToken(): Promise<void> {
    while (!(await this.acquire())) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  private refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.capacity,
      this.tokens + elapsed * this.refillRate
    );
    this.lastRefill = now;
  }
}

// Exponential backoff with jitter
function getBackoffDelay(
  attempt: number,
  baseDelay = 1000,
  maxDelay = 30000
): number {
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = exponentialDelay * 0.2 * Math.random();
  return exponentialDelay + jitter;
}

// Request deduplication cache
const requestCache = new Map<string, Promise<unknown>>();

function getCacheKey(url: string, options?: RequestInit): string {
  return `${options?.method || "GET"}:${url}`;
}

// Main API Client
class ApiClient {
  private circuitBreaker: CircuitBreaker;
  private rateLimiter: TokenBucket;

  constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 30000,
      halfOpenRequests: 3,
    });
    this.rateLimiter = new TokenBucket(10, 2); // 10 tokens, refill 2/sec
  }

  async fetch<T>(
    url: string,
    options?: RequestInit & {
      retries?: number;
      dedupe?: boolean;
      cacheTime?: number;
    }
  ): Promise<T> {
    const {
      retries = 3,
      dedupe = true,
      cacheTime = 5000,
      ...fetchOptions
    } = options || {};
    const cacheKey = getCacheKey(url, fetchOptions);

    // Request deduplication
    if (dedupe && requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey) as Promise<T>;
    }

    const request = this.executeWithRetry<T>(url, fetchOptions, retries);

    if (dedupe) {
      requestCache.set(cacheKey, request);
      request.finally(() => {
        setTimeout(() => requestCache.delete(cacheKey), cacheTime);
      });
    }

    return request;
  }

  private async executeWithRetry<T>(
    url: string,
    options: RequestInit | undefined,
    retries: number
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await this.rateLimiter.waitForToken();

        const result = await this.circuitBreaker.execute(async () => {
          const response = await fetch(url, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              ...options?.headers,
            },
          });

          if (!response.ok) {
            if (response.status === 429) {
              throw new Error("Rate limited");
            }
            if (response.status >= 500) {
              throw new Error(`Server error: ${response.status}`);
            }
            throw new Error(`HTTP error: ${response.status}`);
          }

          return response.json() as Promise<T>;
        });

        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt < retries && this.isRetryable(error as Error)) {
          const delay = getBackoffDelay(attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }

    throw lastError || new Error("Request failed");
  }

  private isRetryable(error: Error): boolean {
    return (
      error.message.includes("Rate limited") ||
      error.message.includes("Server error") ||
      error.message.includes("network") ||
      error.message.includes("Circuit breaker")
    );
  }

  getCircuitState(): CircuitState {
    return this.circuitBreaker.getState();
  }
}

export const apiClient = new ApiClient();

// Mock API functions for the actor platform
export async function fetchActorData(actorId: string) {
  // Simulate API call with mock data
  await new Promise((resolve) => setTimeout(resolve, 200));
  const { mockActor } = await import("@/data/mockData");
  return mockActor;
}

export async function fetchMovieDetails(movieId: string) {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const { mockActor } = await import("@/data/mockData");
  return mockActor.filmography.find((f) => f.id === movieId);
}
