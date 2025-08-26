import { z } from "zod";

// Validation schemas for treatment success tracking

export const updateTreatmentOutcomeSchema = z.object({
	success_rating: z.number().min(0).max(10).optional(),
	outcome_status: z.enum(["successful", "partial", "unsuccessful"]).optional(),
	notes: z.string().optional(),
	metrics: z.record(z.number()).optional(),
	follow_up_required: z.boolean().optional(),
});

export type UpdateTreatmentOutcomeData = z.infer<typeof updateTreatmentOutcomeSchema>;

export const placeholder = true;
export default placeholder;
