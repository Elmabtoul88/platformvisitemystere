import { z } from "zod";

// The specific reportSchema is removed because validation is now dynamic
// based on the surveyQuestions prop passed to the ReportSubmissionForm component.
// Basic validation (like required fields) is handled within the component itself.
// More complex server-side validation should happen in the `submitReport` server action.

// Example of a potential schema for a single survey question (for reference/server-side use)
export const surveyQuestionSchema = z.object({
  id: z.union([z.string(), z.number()]),
  type: z.enum([
      'text',
      'multiple_choice',
      'checkboxes',
      'rating',
      'image_upload',
      'gps_capture',
      'audio_recording',
      // Add any other types here
  ]),
  text: z.string().min(1, "Question text cannot be empty"),
  isRequired: z.boolean().default(false),
  // Type-specific properties
  options: z.array(z.object({ id: z.union([z.string(), z.number()]), text: z.string().min(1) })).optional(), // For multiple_choice, checkboxes
  maxRating: z.number().min(2).max(10).optional(), // For rating
  minLabel: z.string().optional(), // For rating
  maxLabel: z.string().optional(), // For rating
  allowMultiple: z.boolean().optional(), // For image_upload
  maxImages: z.number().min(1).max(10).optional(), // For image_upload
  maxDurationSeconds: z.number().min(5).max(600).optional(), // For audio_recording
  // Add other type-specific configs as needed
});
