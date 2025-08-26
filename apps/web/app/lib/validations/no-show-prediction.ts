import { z } from "zod";

// No-show prediction validation schemas
export const UpdatePredictionInputSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  appointmentId: z.string().min(1, "Appointment ID is required"),
  riskFactors: z.array(z.string()).optional(),
  customWeight: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
  actual_outcome: z.enum(["cancelled", "no_show", "attended"]).optional(),
});

export type UpdatePredictionInput = z.infer<typeof UpdatePredictionInputSchema>;

export const PredictionResultSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  appointmentId: z.string(),
  riskScore: z.number().min(0).max(1),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  factors: z.array(z.string()),
  recommendations: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PredictionResult = z.infer<typeof PredictionResultSchema>;

// Placeholder export for compatibility
export const placeholder = true;
export default placeholder;
