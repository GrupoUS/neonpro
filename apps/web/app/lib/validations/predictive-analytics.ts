import { z } from "zod";

// Validation schemas for predictive analytics

export const updateForecastingModelSchema = z.object({
	name: z.string().optional(),
	description: z.string().optional(),
	type: z.string().optional(),
	parameters: z.record(z.any()).optional(),
	is_active: z.boolean().optional(),
});

export type UpdateForecastingModelData = z.infer<typeof updateForecastingModelSchema>;

export const placeholder = true;
export default placeholder;
