import type { z } from "zod";

export const AlertSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  clinicId: z.string().uuid(),
  type: z.enum(["high_risk", "medication_conflict", "allergy_alert", "critical_result"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  title: z.string().min(1),
  description: z.string(),
  triggered: z.boolean().default(true),
  acknowledged: z.boolean().default(false),
  acknowledgedBy: z.string().uuid().optional(),
  acknowledgedAt: z.date().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().default(() => new Date()),
  expiresAt: z.date().optional(),
});

export const ValidationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  ruleType: z.enum(["medication_check", "allergy_check", "lab_result", "vital_signs"]),
  conditions: z.array(
    z.object({
      field: z.string(),
      operator: z.enum(["equals", "greater_than", "less_than", "contains", "not_contains"]),
      value: z.any(),
      dataType: z.enum(["string", "number", "boolean", "date"]),
    }),
  ),
  actions: z.array(
    z.object({
      type: z.enum(["alert", "notification", "workflow_trigger", "flag_record"]),
      params: z.record(z.any()),
    }),
  ),
  active: z.boolean().default(true),
  priority: z.number().min(1).max(10),
  clinicId: z.string().uuid(),
  createdBy: z.string().uuid(),
  createdAt: z.date().default(() => new Date()),
});

export const RiskAssessmentSchema = z.object({
  patientId: z.string().uuid(),
  clinicId: z.string().uuid(),
  riskScore: z.number().min(0).max(100),
  riskCategory: z.enum(["low", "medium", "high", "critical"]),
  factors: z.array(
    z.object({
      factor: z.string(),
      weight: z.number(),
      value: z.any(),
      impact: z.number(),
    }),
  ),
  recommendations: z.array(z.string()),
  validUntil: z.date(),
  assessedBy: z.string().uuid(),
  assessedAt: z.date().default(() => new Date()),
});

export type Alert = z.infer<typeof AlertSchema>;
export type Validation = z.infer<typeof ValidationSchema>;
export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;
