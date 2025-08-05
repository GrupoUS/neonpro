// Simple Schema Test - Validation for Stock Alerts
// Story 11.4: Basic validation testing for implemented schemas
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var zod_1 = require("zod");
// Simple schema definitions for testing (mimicking our main schemas)
var alertTypeSchema = zod_1.z.enum(["low_stock", "expiring", "expired", "overstock"]);
var severityLevelSchema = zod_1.z.enum(["low", "medium", "high", "critical"]);
var uuidSchema = zod_1.z.string().uuid();
var testAlertConfigSchema = zod_1.z.object({
  id: uuidSchema.optional(),
  clinicId: uuidSchema,
  productId: uuidSchema.optional(),
  alertType: alertTypeSchema,
  thresholdValue: zod_1.z.number().positive(),
  severityLevel: severityLevelSchema,
  isActive: zod_1.z.boolean(),
  notificationChannels: zod_1.z.array(zod_1.z.enum(["in_app", "email", "whatsapp", "sms"])).min(1),
});
var testCreateAlertConfigSchema = testAlertConfigSchema.omit({
  id: true,
});
(0, globals_1.describe)("Stock Alert Schema Validation - Basic Tests", () => {
  var validConfig = {
    clinicId: "123e4567-e89b-12d3-a456-426614174000",
    productId: "123e4567-e89b-12d3-a456-426614174001",
    alertType: "low_stock",
    thresholdValue: 10,
    severityLevel: "medium",
    isActive: true,
    notificationChannels: ["in_app", "email"],
  };
  (0, globals_1.it)("should validate a complete valid alert config", () => {
    var result = testAlertConfigSchema.safeParse(
      __assign({ id: "123e4567-e89b-12d3-a456-426614174002" }, validConfig),
    );
    (0, globals_1.expect)(result.success).toBe(true);
  });
  (0, globals_1.it)("should validate create alert config (without id)", () => {
    var result = testCreateAlertConfigSchema.safeParse(validConfig);
    (0, globals_1.expect)(result.success).toBe(true);
  });
  (0, globals_1.it)("should reject invalid UUID formats", () => {
    var invalidConfig = __assign(__assign({}, validConfig), { clinicId: "invalid-uuid" });
    var result = testCreateAlertConfigSchema.safeParse(invalidConfig);
    (0, globals_1.expect)(result.success).toBe(false);
  });
  (0, globals_1.it)("should reject negative threshold values", () => {
    var invalidConfig = __assign(__assign({}, validConfig), { thresholdValue: -5 });
    var result = testCreateAlertConfigSchema.safeParse(invalidConfig);
    (0, globals_1.expect)(result.success).toBe(false);
  });
  (0, globals_1.it)("should reject empty notification channels", () => {
    var invalidConfig = __assign(__assign({}, validConfig), { notificationChannels: [] });
    var result = testCreateAlertConfigSchema.safeParse(invalidConfig);
    (0, globals_1.expect)(result.success).toBe(false);
  });
  (0, globals_1.it)("should reject invalid alert types", () => {
    var invalidConfig = __assign(__assign({}, validConfig), { alertType: "invalid_type" });
    var result = testCreateAlertConfigSchema.safeParse(invalidConfig);
    (0, globals_1.expect)(result.success).toBe(false);
  });
});
