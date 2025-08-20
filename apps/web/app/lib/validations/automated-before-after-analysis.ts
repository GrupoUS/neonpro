import { z } from 'zod';

// Validation schemas for automated before/after analysis
export const validationSchemas = {
  analysisSessionFilters: z.object({
    patient_id: z.string().optional(),
    treatment_type: z.string().optional(),
    analysis_type: z.string().optional(),
    status: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    accuracy_min: z.number().optional(),
    created_by: z.string().optional(),
  }),

  createAnalysisSession: z.object({
    patient_id: z.string(),
    treatment_type: z.string(),
    analysis_type: z.string(),
    before_images: z.array(z.string()).optional(),
    after_images: z.array(z.string()).optional(),
  }),

  updateAnalysisSession: z.object({
    status: z.string().optional(),
    results: z.any().optional(),
    notes: z.string().optional(),
  }),
};

export default validationSchemas;
