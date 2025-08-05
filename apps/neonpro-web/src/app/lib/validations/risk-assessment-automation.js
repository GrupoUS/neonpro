Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskAssessmentSchema = exports.ValidationSchema = exports.AlertSchema = void 0;
var zod_1 = require("zod");
exports.AlertSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  patientId: zod_1.z.string().uuid(),
  clinicId: zod_1.z.string().uuid(),
  type: zod_1.z.enum(["high_risk", "medication_conflict", "allergy_alert", "critical_result"]),
  severity: zod_1.z.enum(["low", "medium", "high", "critical"]),
  title: zod_1.z.string().min(1),
  description: zod_1.z.string(),
  triggered: zod_1.z.boolean().default(true),
  acknowledged: zod_1.z.boolean().default(false),
  acknowledgedBy: zod_1.z.string().uuid().optional(),
  acknowledgedAt: zod_1.z.date().optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
  createdAt: zod_1.z.date().default(() => new Date()),
  expiresAt: zod_1.z.date().optional(),
});
exports.ValidationSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  name: zod_1.z.string().min(1),
  description: zod_1.z.string(),
  ruleType: zod_1.z.enum(["medication_check", "allergy_check", "lab_result", "vital_signs"]),
  conditions: zod_1.z.array(
    zod_1.z.object({
      field: zod_1.z.string(),
      operator: zod_1.z.enum(["equals", "greater_than", "less_than", "contains", "not_contains"]),
      value: zod_1.z.any(),
      dataType: zod_1.z.enum(["string", "number", "boolean", "date"]),
    }),
  ),
  actions: zod_1.z.array(
    zod_1.z.object({
      type: zod_1.z.enum(["alert", "notification", "workflow_trigger", "flag_record"]),
      params: zod_1.z.record(zod_1.z.any()),
    }),
  ),
  active: zod_1.z.boolean().default(true),
  priority: zod_1.z.number().min(1).max(10),
  clinicId: zod_1.z.string().uuid(),
  createdBy: zod_1.z.string().uuid(),
  createdAt: zod_1.z.date().default(() => new Date()),
});
exports.RiskAssessmentSchema = zod_1.z.object({
  patientId: zod_1.z.string().uuid(),
  clinicId: zod_1.z.string().uuid(),
  riskScore: zod_1.z.number().min(0).max(100),
  riskCategory: zod_1.z.enum(["low", "medium", "high", "critical"]),
  factors: zod_1.z.array(
    zod_1.z.object({
      factor: zod_1.z.string(),
      weight: zod_1.z.number(),
      value: zod_1.z.any(),
      impact: zod_1.z.number(),
    }),
  ),
  recommendations: zod_1.z.array(zod_1.z.string()),
  validUntil: zod_1.z.date(),
  assessedBy: zod_1.z.string().uuid(),
  assessedAt: zod_1.z.date().default(() => new Date()),
});
