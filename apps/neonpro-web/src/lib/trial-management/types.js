"use strict";
// Trial Management Types - STORY-SUB-002 Task 3
// AI-powered trial management system with conversion optimization
// Created: 2025-01-22
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialSchema =
  exports.EngagementLevelSchema =
  exports.UserSegmentSchema =
  exports.ConversionStrategySchema =
  exports.TrialStageSchema =
    void 0;
var zod_1 = require("zod");
// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
exports.TrialStageSchema = zod_1.z.enum([
  "signup",
  "onboarding",
  "active",
  "at_risk",
  "converting",
  "converted",
  "expired",
  "cancelled",
]);
exports.ConversionStrategySchema = zod_1.z.enum([
  "engagement_boost",
  "feature_highlight",
  "discount_offer",
  "demo_scheduling",
  "urgency_reminder",
]);
exports.UserSegmentSchema = zod_1.z.enum([
  "power_user",
  "casual_user",
  "explorer",
  "passive",
  "high_value",
  "at_risk",
]);
exports.EngagementLevelSchema = zod_1.z.enum(["very_high", "high", "medium", "low", "very_low"]);
exports.TrialSchema = zod_1.z.object({
  id: zod_1.z.string(),
  userId: zod_1.z.string(),
  status: exports.TrialStageSchema,
  startDate: zod_1.z.date(),
  endDate: zod_1.z.date(),
  daysRemaining: zod_1.z.number(),
  conversionProbability: zod_1.z.number().min(0).max(1),
  engagementScore: zod_1.z.number().min(0).max(100),
  userSegment: exports.UserSegmentSchema,
  currentStrategy: exports.ConversionStrategySchema,
  metadata: zod_1.z.any(),
});
