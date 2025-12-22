import { z } from "zod";

// Zod schema for review validation
export const ReviewSchema = z.object({
  id: z.string(),
  movieId: z.string(),
  userId: z.string(),
  userName: z.string(),
  userAvatar: z.string().optional(),
  rating: z.number().min(1).max(10),
  title: z.string().min(3).max(100),
  content: z.string().min(10).max(5000),
  createdAt: z.number(),
  updatedAt: z.number(),
  upvotes: z.number().default(0),
  downvotes: z.number().default(0),
  helpful: z.number().default(0),
  flagged: z.boolean().default(false),
  deleted: z.boolean().default(false),
  revisions: z
    .array(
      z.object({
        content: z.string(),
        timestamp: z.number(),
      })
    )
    .default([]),
});

export type Review = z.infer<typeof ReviewSchema>;

// Wilson Score calculation for ranking
export function wilsonScore(upvotes: number, downvotes: number): number {
  const n = upvotes + downvotes;
  if (n === 0) return 0;

  const z = 1.96; // 95% confidence
  const p = upvotes / n;

  const denominator = 1 + (z * z) / n;
  const center = p + (z * z) / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);

  return (center - spread) / denominator;
}

// Sort functions
export type SortOption =
  | "helpful"
  | "recent"
  | "controversial"
  | "rating-high"
  | "rating-low";

export function sortReviews(reviews: Review[], sortBy: SortOption): Review[] {
  const sorted = [...reviews];

  switch (sortBy) {
    case "helpful":
      return sorted.sort(
        (a, b) =>
          wilsonScore(b.upvotes, b.downvotes) -
          wilsonScore(a.upvotes, a.downvotes)
      );
    case "recent":
      return sorted.sort((a, b) => b.createdAt - a.createdAt);
    case "controversial":
      // High engagement with mixed votes
      return sorted.sort((a, b) => {
        const aScore = Math.min(a.upvotes, a.downvotes) * 2;
        const bScore = Math.min(b.upvotes, b.downvotes) * 2;
        return bScore - aScore;
      });
    case "rating-high":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "rating-low":
      return sorted.sort((a, b) => a.rating - b.rating);
    default:
      return sorted;
  }
}

// Profanity filter (basic implementation)
const profanityList = ["badword1", "badword2"]; // Placeholder

export function filterProfanity(text: string): string {
  let filtered = text;
  profanityList.forEach((word) => {
    const regex = new RegExp(word, "gi");
    filtered = filtered.replace(regex, "*".repeat(word.length));
  });
  return filtered;
}

// Generate diff between revisions
export function generateDiff(oldText: string, newText: string): string {
  // Simple word-level diff
  const oldWords = oldText.split(" ");
  const newWords = newText.split(" ");

  let diff = "";
  let i = 0,
    j = 0;

  while (i < oldWords.length || j < newWords.length) {
    if (oldWords[i] === newWords[j]) {
      diff += oldWords[i] + " ";
      i++;
      j++;
    } else if (j < newWords.length && !oldWords.includes(newWords[j])) {
      diff += `[+${newWords[j]}] `;
      j++;
    } else if (i < oldWords.length && !newWords.includes(oldWords[i])) {
      diff += `[-${oldWords[i]}] `;
      i++;
    } else {
      diff += `[-${oldWords[i] || ""}][+${newWords[j] || ""}] `;
      i++;
      j++;
    }
  }

  return diff.trim();
}

// Idempotency key generator
export function generateIdempotencyKey(
  userId: string,
  movieId: string
): string {
  return `${userId}-${movieId}-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
}
