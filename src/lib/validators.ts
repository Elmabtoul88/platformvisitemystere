import { z } from "zod";

export const reportSchema = z.object({
  rating: z.coerce.number().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  comments: z.string().min(10, "Comments must be at least 10 characters long").max(1000, "Comments cannot exceed 1000 characters"),
  // Basic validation for photo URL, assuming it's a string. More complex validation might be needed for file uploads.
  photoUrl: z.string().url("Please provide a valid URL for the photo").optional().or(z.literal('')),
});
