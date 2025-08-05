"use strict";
// Analytics Core Types - STORY-SUB-002 Task 2
// Created: 2025-01-22
// High-performance TypeScript interfaces for analytics service layer
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsQuerySchema =
  exports.SubscriptionTierSchema =
  exports.TrialStatusSchema =
  exports.MetricCategorySchema =
  exports.MetricPeriodSchema =
    void 0;
var zod_1 = require("zod");
// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================
exports.MetricPeriodSchema = zod_1.z.enum(["day", "week", "month", "quarter", "year"]);
exports.MetricCategorySchema = zod_1.z.enum([
  "revenue",
  "conversion",
  "engagement",
  "retention",
  "growth",
]);
exports.TrialStatusSchema = zod_1.z.enum(["active", "converted", "expired", "cancelled"]);
exports.SubscriptionTierSchema = zod_1.z.enum(["free", "basic", "professional", "enterprise"]);
exports.AnalyticsQuerySchema = zod_1.z.object({
  metrics: zod_1.z.array(exports.MetricCategorySchema),
  period: exports.MetricPeriodSchema,
  startDate: zod_1.z.date(),
  endDate: zod_1.z.date(),
  filters: zod_1.z.record(zod_1.z.any()).optional(),
  groupBy: zod_1.z.array(zod_1.z.string()).optional(),
  aggregation: zod_1.z.enum(["sum", "avg", "count", "max", "min"]).optional(),
});
