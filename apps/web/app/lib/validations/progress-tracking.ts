import { z } from "zod";

// Validation schemas for progress tracking

export const updateProgressTrackingSchema = z.object({
	tracking_type: z.string().optional(),
	progress_percentage: z.number().min(0).max(100).optional(),
	measurements: z.record(z.number()).optional(),
	notes: z.string().optional(),
	is_active: z.boolean().optional(),
});

export type UpdateProgressTrackingData = z.infer<typeof updateProgressTrackingSchema>;

export const placeholder = true;
export default placeholder;
