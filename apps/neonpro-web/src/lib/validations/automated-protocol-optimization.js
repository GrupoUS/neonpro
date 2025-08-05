"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProtocolVersionSchema =
  exports.createProtocolVersionSchema =
  exports.createProtocolOutcomeSchema =
  exports.updateProtocolFeedbackSchema =
  exports.createProtocolFeedbackSchema =
  exports.updateProtocolExperimentSchema =
  exports.createProtocolExperimentSchema =
    void 0;
var zod_1 = require("zod");
exports.createProtocolExperimentSchema = zod_1.z.object({
  name: zod_1.z.string().min(1),
  description: zod_1.z.string().optional(),
  clinicId: zod_1.z.string().uuid(),
  parameters: zod_1.z.record(zod_1.z.any()),
  targetMetrics: zod_1.z.array(zod_1.z.string()),
  duration: zod_1.z.number().positive(),
  active: zod_1.z.boolean().default(true),
});
exports.updateProtocolExperimentSchema = exports.createProtocolExperimentSchema.partial();
exports.createProtocolFeedbackSchema = zod_1.z.object({
  experimentId: zod_1.z.string().uuid(),
  userId: zod_1.z.string().uuid(),
  rating: zod_1.z.number().min(1).max(5),
  comment: zod_1.z.string().optional(),
  metrics: zod_1.z.record(zod_1.z.number()),
  timestamp: zod_1.z.date().default(function () {
    return new Date();
  }),
});
exports.updateProtocolFeedbackSchema = exports.createProtocolFeedbackSchema.partial();
exports.createProtocolOutcomeSchema = zod_1.z.object({
  experimentId: zod_1.z.string().uuid(),
  metrics: zod_1.z.record(zod_1.z.number()),
  success: zod_1.z.boolean(),
  analysis: zod_1.z.string(),
  recommendations: zod_1.z.array(zod_1.z.string()),
  timestamp: zod_1.z.date().default(function () {
    return new Date();
  }),
});
exports.createProtocolVersionSchema = zod_1.z.object({
  protocolId: zod_1.z.string().uuid(),
  version: zod_1.z.string(),
  changes: zod_1.z.string(),
  parameters: zod_1.z.record(zod_1.z.any()),
  active: zod_1.z.boolean().default(false),
  createdBy: zod_1.z.string().uuid(),
});
exports.updateProtocolVersionSchema = exports.createProtocolVersionSchema.partial();
