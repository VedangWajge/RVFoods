import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z.string().min(5, "Comment must be at least 5 characters").max(500, "Comment cannot exceed 500 characters"),
  image: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
