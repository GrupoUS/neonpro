Object.defineProperty(exports, "__esModule", { value: true });
exports.progressTrackingFiltersSchema =
  exports.createProgressPredictionRequestSchema =
  exports.createMultiSessionAnalysisRequestSchema =
  exports.progressMilestoneFiltersSchema =
  exports.createProgressMilestoneRequestSchema =
  exports.progressAlertFiltersSchema =
  exports.createProgressAlertRequestSchema =
  exports.updateProgressTrackingSchema =
  exports.createProgressTrackingSchema =
    void 0;
var zod_1 = require("zod");
exports.createProgressTrackingSchema = zod_1.z.object({
  patientId: zod_1.z.string().uuid(),
  treatmentId: zod_1.z.string().uuid(),
  clinicId: zod_1.z.string().uuid(),
  milestones: zod_1.z.array(
    zod_1.z.object({
      id: zod_1.z.string(),
      name: zod_1.z.string(),
      description: zod_1.z.string().optional(),
      targetDate: zod_1.z.date(),
      completedDate: zod_1.z.date().optional(),
      status: zod_1.z.enum(["pending", "in_progress", "completed", "delayed"]),
      progress: zod_1.z.number().min(0).max(100),
    }),
  ),
  overallProgress: zod_1.z.number().min(0).max(100),
  notes: zod_1.z.string().optional(),
  attachments: zod_1.z.array(zod_1.z.string()).optional(),
  createdBy: zod_1.z.string().uuid(),
});
exports.updateProgressTrackingSchema = exports.createProgressTrackingSchema.partial().extend({
  id: zod_1.z.string().uuid(),
});
// Missing exports for API routes
exports.createProgressAlertRequestSchema = zod_1.z.object({
  placeholder: zod_1.z.string().optional(),
});
exports.progressAlertFiltersSchema = zod_1.z.object({
  placeholder: zod_1.z.string().optional(),
});
exports.createProgressMilestoneRequestSchema = zod_1.z.object({
  placeholder: zod_1.z.string().optional(),
});
exports.progressMilestoneFiltersSchema = zod_1.z.object({
  placeholder: zod_1.z.string().optional(),
});
exports.createMultiSessionAnalysisRequestSchema = zod_1.z.object({
  placeholder: zod_1.z.string().optional(),
});
exports.createProgressPredictionRequestSchema = zod_1.z.object({
  placeholder: zod_1.z.string().optional(),
});
exports.progressTrackingFiltersSchema = zod_1.z.object({
  placeholder: zod_1.z.string().optional(),
});
