"use strict";
// Stock Alerts and Reports Types
// Story 11.4: Alertas e Relatórios de Estoque
// Implementation with Zod validation (QA Enhanced)
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPORT_TYPE_LABELS =
  exports.NOTIFICATION_CHANNEL_LABELS =
  exports.STATUS_LABELS =
  exports.SEVERITY_LABELS =
  exports.ALERT_TYPE_LABELS =
  exports.StockAlertValidationError =
  exports.validateReportsQuery =
  exports.validateAlertsQuery =
  exports.validateCustomStockReport =
  exports.validateResolveAlert =
  exports.validateAcknowledgeAlert =
  exports.validateCreateStockAlertConfig =
  exports.validateStockAlertConfig =
  exports.reportsQuerySchema =
  exports.alertsQuerySchema =
  exports.stockDashboardDataSchema =
  exports.recommendationSchema =
  exports.wasteAnalysisSchema =
  exports.alertsByTypeSchema =
  exports.topProductSchema =
  exports.consumptionTrendSchema =
  exports.stockKPIsSchema =
  exports.stockPerformanceMetricsSchema =
  exports.createCustomReportSchema =
  exports.customStockReportSchema =
  exports.resolveAlertSchema =
  exports.acknowledgeAlertSchema =
  exports.stockAlertSchema =
  exports.updateStockAlertConfigSchema =
  exports.createStockAlertConfigSchema =
  exports.stockAlertConfigSchema =
  exports.ReportType =
  exports.NotificationChannel =
  exports.ThresholdUnit =
  exports.AlertStatus =
  exports.SeverityLevel =
  exports.AlertType =
    void 0;
var zod_1 = require("zod");
// =====================================================
// BASE ENUMS AND CONSTANTS
// =====================================================
exports.AlertType = {
  LOW_STOCK: "low_stock",
  EXPIRING: "expiring",
  EXPIRED: "expired",
  OVERSTOCK: "overstock",
  CRITICAL_SHORTAGE: "critical_shortage",
};
exports.SeverityLevel = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};
exports.AlertStatus = {
  ACTIVE: "active",
  ACKNOWLEDGED: "acknowledged",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
};
exports.ThresholdUnit = {
  QUANTITY: "quantity",
  DAYS: "days",
  PERCENTAGE: "percentage",
};
exports.NotificationChannel = {
  IN_APP: "in_app",
  EMAIL: "email",
  WHATSAPP: "whatsapp",
  SMS: "sms",
};
exports.ReportType = {
  CONSUMPTION: "consumption",
  VALUATION: "valuation",
  MOVEMENT: "movement",
  EXPIRATION: "expiration",
  CUSTOM: "custom",
  PERFORMANCE: "performance",
};
// =====================================================
// ZOD VALIDATION SCHEMAS (QA ENHANCED)
// =====================================================
// Base validation schemas
var uuidSchema = zod_1.z.string().uuid("Invalid UUID format");
var positiveNumberSchema = zod_1.z.number().positive("Must be a positive number");
var nonNegativeNumberSchema = zod_1.z.number().min(0, "Must be non-negative");
var percentageSchema = zod_1.z.number().min(0).max(100, "Must be between 0 and 100");
var emailSchema = zod_1.z.string().email("Invalid email format");
// Alert type validation
var alertTypeSchema = zod_1.z.enum([
  "low_stock",
  "expiring",
  "expired",
  "overstock",
  "critical_shortage",
]);
// Severity level validation
var severityLevelSchema = zod_1.z.enum(["low", "medium", "high", "critical"]);
// Alert status validation
var alertStatusSchema = zod_1.z.enum(["active", "acknowledged", "resolved", "dismissed"]);
// Threshold unit validation
var thresholdUnitSchema = zod_1.z.enum(["quantity", "days", "percentage"]);
// Notification channels validation
var notificationChannelSchema = zod_1.z.enum(["in_app", "email", "whatsapp", "sms"]);
// Report type validation
var reportTypeSchema = zod_1.z.enum([
  "consumption",
  "valuation",
  "movement",
  "expiration",
  "custom",
  "performance",
]);
// =====================================================
// STOCK ALERT CONFIG SCHEMAS
// =====================================================
exports.stockAlertConfigSchema = zod_1.z
  .object({
    id: uuidSchema.optional(),
    clinicId: uuidSchema,
    productId: uuidSchema.optional(),
    categoryId: uuidSchema.optional(),
    alertType: alertTypeSchema,
    thresholdValue: positiveNumberSchema,
    thresholdUnit: thresholdUnitSchema.default("quantity"),
    severityLevel: severityLevelSchema.default("medium"),
    isActive: zod_1.z.boolean().default(true),
    notificationChannels: zod_1.z
      .array(notificationChannelSchema)
      .min(1, "At least one notification channel required"),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
    createdBy: uuidSchema.optional(),
    updatedBy: uuidSchema.optional(),
  })
  .refine(
    function (data) {
      return data.productId || data.categoryId || (!data.productId && !data.categoryId);
    },
    {
      message: "Either productId, categoryId, or neither should be provided (not both)",
      path: ["productId", "categoryId"],
    },
  );
// Create alert config schema (for API requests)
exports.createStockAlertConfigSchema = zod_1.z
  .object({
    clinicId: uuidSchema,
    productId: uuidSchema.optional(),
    categoryId: uuidSchema.optional(),
    alertType: alertTypeSchema,
    thresholdValue: positiveNumberSchema,
    thresholdUnit: thresholdUnitSchema.default("quantity"),
    severityLevel: severityLevelSchema.default("medium"),
    isActive: zod_1.z.boolean().default(true),
    notificationChannels: zod_1.z
      .array(notificationChannelSchema)
      .min(1, "At least one notification channel required"),
  })
  .refine(
    function (data) {
      return data.productId || data.categoryId || (!data.productId && !data.categoryId);
    },
    {
      message: "Either productId, categoryId, or neither should be provided (not both)",
      path: ["productId", "categoryId"],
    },
  );
// Update alert config schema (for API requests)
exports.updateStockAlertConfigSchema = zod_1.z
  .object({
    productId: uuidSchema.optional(),
    categoryId: uuidSchema.optional(),
    alertType: alertTypeSchema.optional(),
    thresholdValue: positiveNumberSchema.optional(),
    thresholdUnit: thresholdUnitSchema.optional(),
    severityLevel: severityLevelSchema.optional(),
    isActive: zod_1.z.boolean().optional(),
    notificationChannels: zod_1.z.array(notificationChannelSchema).optional(),
  })
  .partial();
// =====================================================
// STOCK ALERT SCHEMAS
// =====================================================
exports.stockAlertSchema = zod_1.z
  .object({
    id: uuidSchema.optional(),
    clinicId: uuidSchema,
    alertConfigId: uuidSchema.optional(),
    productId: uuidSchema,
    alertType: alertTypeSchema,
    severityLevel: severityLevelSchema,
    currentValue: nonNegativeNumberSchema,
    thresholdValue: positiveNumberSchema,
    message: zod_1.z.string().min(1, "Message is required").max(1000, "Message too long"),
    status: alertStatusSchema.default("active"),
    metadata: zod_1.z.record(zod_1.z.any()).default({}),
    acknowledgedBy: uuidSchema.optional(),
    acknowledgedAt: zod_1.z.date().optional(),
    resolvedAt: zod_1.z.date().optional(),
    createdAt: zod_1.z.date().optional(),
  })
  .refine(
    function (data) {
      // If acknowledged, must have both acknowledgedBy and acknowledgedAt
      if (data.acknowledgedBy || data.acknowledgedAt) {
        return data.acknowledgedBy && data.acknowledgedAt;
      }
      return true;
    },
    {
      message:
        "Both acknowledgedBy and acknowledgedAt must be provided when acknowledging an alert",
      path: ["acknowledgedBy", "acknowledgedAt"],
    },
  );
// Acknowledge alert schema
exports.acknowledgeAlertSchema = zod_1.z.object({
  alertId: uuidSchema,
  acknowledgedBy: uuidSchema,
  note: zod_1.z
    .string()
    .optional()
    .transform(function (val) {
      return val === null || val === void 0 ? void 0 : val.trim();
    })
    .pipe(zod_1.z.string().max(500, "Note too long").optional()),
});
// Resolve alert schema
exports.resolveAlertSchema = zod_1.z.object({
  alertId: uuidSchema,
  resolvedBy: uuidSchema,
  resolution: zod_1.z
    .string()
    .min(1, "Resolution description required")
    .max(1000, "Resolution too long"),
  actionsTaken: zod_1.z.array(zod_1.z.string()).optional(),
});
// =====================================================
// CUSTOM REPORTS SCHEMAS
// =====================================================
var reportFiltersSchema = zod_1.z.object({
  dateRange: zod_1.z
    .object({
      start: zod_1.z.date(),
      end: zod_1.z.date(),
    })
    .optional()
    .refine(
      function (data) {
        return !data || data.start <= data.end;
      },
      { message: "Start date must be before or equal to end date" },
    ),
  productIds: zod_1.z.array(uuidSchema).optional(),
  categoryIds: zod_1.z.array(uuidSchema).optional(),
  supplierId: uuidSchema.optional(),
  costCenterId: uuidSchema.optional(),
  alertTypes: zod_1.z.array(alertTypeSchema).optional(),
  severityLevels: zod_1.z.array(severityLevelSchema).optional(),
  customFilters: zod_1.z.record(zod_1.z.any()).optional(),
});
var reportScheduleConfigSchema = zod_1.z
  .object({
    frequency: zod_1.z.enum(["daily", "weekly", "monthly"]),
    dayOfWeek: zod_1.z.number().min(0).max(6).optional(), // 0 = Sunday
    dayOfMonth: zod_1.z.number().min(1).max(31).optional(),
    time: zod_1.z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    recipients: zod_1.z.array(emailSchema).min(1, "At least one recipient required"),
    enabled: zod_1.z.boolean().default(true),
  })
  .refine(
    function (data) {
      if (data.frequency === "weekly" && !data.dayOfWeek) {
        return false;
      }
      if (data.frequency === "monthly" && !data.dayOfMonth) {
        return false;
      }
      return true;
    },
    {
      message: "dayOfWeek required for weekly frequency, dayOfMonth required for monthly frequency",
    },
  );
exports.customStockReportSchema = zod_1.z.object({
  id: uuidSchema.optional(),
  clinicId: uuidSchema,
  userId: uuidSchema,
  reportName: zod_1.z
    .string()
    .min(1, "Report name required")
    .max(200, "Report name too long")
    .trim(),
  reportType: reportTypeSchema,
  filters: reportFiltersSchema,
  scheduleConfig: reportScheduleConfigSchema.optional(),
  isActive: zod_1.z.boolean().default(true),
  lastExecutedAt: zod_1.z.date().optional(),
  executionCount: nonNegativeNumberSchema.default(0),
  createdAt: zod_1.z.date().optional(),
  updatedAt: zod_1.z.date().optional(),
});
// Create custom report schema
exports.createCustomReportSchema = zod_1.z.object({
  clinicId: uuidSchema,
  userId: uuidSchema,
  reportName: zod_1.z
    .string()
    .min(1, "Report name required")
    .max(200, "Report name too long")
    .trim(),
  reportType: reportTypeSchema,
  filters: reportFiltersSchema,
  scheduleConfig: reportScheduleConfigSchema.optional(),
  isActive: zod_1.z.boolean().default(true),
});
// =====================================================
// PERFORMANCE METRICS SCHEMAS
// =====================================================
exports.stockPerformanceMetricsSchema = zod_1.z.object({
  id: uuidSchema.optional(),
  clinicId: uuidSchema,
  metricDate: zod_1.z.date(),
  totalValue: nonNegativeNumberSchema,
  turnoverRate: zod_1.z.number().min(0).optional(),
  daysCoverage: zod_1.z.number().int().positive().optional(),
  accuracyPercentage: percentageSchema.optional(),
  wasteValue: nonNegativeNumberSchema,
  wastePercentage: percentageSchema,
  activeAlertsCount: nonNegativeNumberSchema,
  criticalAlertsCount: nonNegativeNumberSchema,
  productsCount: nonNegativeNumberSchema,
  outOfStockCount: nonNegativeNumberSchema,
  lowStockCount: nonNegativeNumberSchema,
  createdAt: zod_1.z.date().optional(),
});
// =====================================================
// DASHBOARD DATA SCHEMAS
// =====================================================
exports.stockKPIsSchema = zod_1.z.object({
  totalValue: nonNegativeNumberSchema,
  turnoverRate: zod_1.z.number().min(0),
  daysCoverage: zod_1.z.number().int().positive(),
  accuracyPercentage: percentageSchema,
  activeAlerts: nonNegativeNumberSchema,
  criticalAlerts: nonNegativeNumberSchema,
  wasteValue: nonNegativeNumberSchema,
  wastePercentage: percentageSchema,
});
exports.consumptionTrendSchema = zod_1.z.object({
  date: zod_1.z.string().datetime(),
  value: nonNegativeNumberSchema,
  category: zod_1.z.string().optional(),
  trend: zod_1.z.enum(["up", "down", "stable"]).optional(),
});
exports.topProductSchema = zod_1.z.object({
  productId: uuidSchema,
  name: zod_1.z.string(),
  sku: zod_1.z.string().optional(),
  consumption: nonNegativeNumberSchema,
  value: nonNegativeNumberSchema,
  changePercentage: zod_1.z.number().optional(),
});
exports.alertsByTypeSchema = zod_1.z.object({
  type: alertTypeSchema,
  count: nonNegativeNumberSchema,
  severity: severityLevelSchema,
  percentage: percentageSchema.optional(),
});
exports.wasteAnalysisSchema = zod_1.z.object({
  period: zod_1.z.string(),
  waste: nonNegativeNumberSchema,
  percentage: percentageSchema,
  trend: zod_1.z.enum(["improving", "worsening", "stable"]).optional(),
});
exports.recommendationSchema = zod_1.z.object({
  id: zod_1.z.string(),
  type: zod_1.z.enum(["reorder", "optimize", "attention", "action_required"]),
  priority: zod_1.z.enum(["high", "medium", "low"]),
  title: zod_1.z.string().min(1).max(100),
  message: zod_1.z.string().min(1).max(500),
  actionable: zod_1.z.boolean(),
  productId: uuidSchema.optional(),
  actions: zod_1.z
    .array(
      zod_1.z.object({
        label: zod_1.z.string(),
        action: zod_1.z.string(),
        parameters: zod_1.z.record(zod_1.z.any()).optional(),
      }),
    )
    .optional(),
  dismissible: zod_1.z.boolean().default(true),
  createdAt: zod_1.z.date().default(function () {
    return new Date();
  }),
});
exports.stockDashboardDataSchema = zod_1.z.object({
  kpis: exports.stockKPIsSchema,
  charts: zod_1.z.object({
    consumptionTrend: zod_1.z.array(exports.consumptionTrendSchema),
    topProducts: zod_1.z.array(exports.topProductSchema),
    alertsByType: zod_1.z.array(exports.alertsByTypeSchema),
    wasteAnalysis: zod_1.z.array(exports.wasteAnalysisSchema),
  }),
  alerts: zod_1.z.array(exports.stockAlertSchema),
  recommendations: zod_1.z.array(exports.recommendationSchema),
  lastUpdated: zod_1.z.date().default(function () {
    return new Date();
  }),
});
// =====================================================
// API REQUEST/RESPONSE SCHEMAS
// =====================================================
// Query parameters for alerts list
exports.alertsQuerySchema = zod_1.z.object({
  status: alertStatusSchema.optional(),
  severity: severityLevelSchema.optional(),
  type: alertTypeSchema.optional(),
  productId: uuidSchema.optional(),
  limit: zod_1.z.number().int().min(1).max(100).default(50),
  offset: zod_1.z.number().int().min(0).default(0),
  sortBy: zod_1.z.enum(["created_at", "severity_level", "alert_type"]).default("created_at"),
  sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
// Query parameters for reports
exports.reportsQuerySchema = zod_1.z.object({
  type: reportTypeSchema.optional(),
  startDate: zod_1.z.string().datetime().optional(),
  endDate: zod_1.z.string().datetime().optional(),
  productIds: zod_1.z.array(uuidSchema).optional(),
  categoryIds: zod_1.z.array(uuidSchema).optional(),
  format: zod_1.z.enum(["json", "csv", "pdf"]).default("json"),
});
// =====================================================
// UTILITY FUNCTIONS FOR VALIDATION
// =====================================================
var validateStockAlertConfig = function (data) {
  return exports.stockAlertConfigSchema.parse(data);
};
exports.validateStockAlertConfig = validateStockAlertConfig;
var validateCreateStockAlertConfig = function (data) {
  return exports.createStockAlertConfigSchema.parse(data);
};
exports.validateCreateStockAlertConfig = validateCreateStockAlertConfig;
var validateAcknowledgeAlert = function (data) {
  return exports.acknowledgeAlertSchema.parse(data);
};
exports.validateAcknowledgeAlert = validateAcknowledgeAlert;
var validateResolveAlert = function (data) {
  return exports.resolveAlertSchema.parse(data);
};
exports.validateResolveAlert = validateResolveAlert;
var validateCustomStockReport = function (data) {
  return exports.customStockReportSchema.parse(data);
};
exports.validateCustomStockReport = validateCustomStockReport;
var validateAlertsQuery = function (data) {
  return exports.alertsQuerySchema.parse(data);
};
exports.validateAlertsQuery = validateAlertsQuery;
var validateReportsQuery = function (data) {
  return exports.reportsQuerySchema.parse(data);
};
exports.validateReportsQuery = validateReportsQuery;
// =====================================================
// ERROR TYPES
// =====================================================
var StockAlertValidationError = /** @class */ (function (_super) {
  __extends(StockAlertValidationError, _super);
  function StockAlertValidationError(message, field, code) {
    var _this = _super.call(this, message) || this;
    _this.field = field;
    _this.code = code;
    _this.name = "StockAlertValidationError";
    return _this;
  }
  return StockAlertValidationError;
})(Error);
exports.StockAlertValidationError = StockAlertValidationError;
// =====================================================
// CONSTANTS FOR UI
// =====================================================
exports.ALERT_TYPE_LABELS =
  ((_a = {}),
  (_a[exports.AlertType.LOW_STOCK] = "Estoque Baixo"),
  (_a[exports.AlertType.EXPIRING] = "Próximo ao Vencimento"),
  (_a[exports.AlertType.EXPIRED] = "Vencido"),
  (_a[exports.AlertType.OVERSTOCK] = "Excesso de Estoque"),
  (_a[exports.AlertType.CRITICAL_SHORTAGE] = "Falta Crítica"),
  _a);
exports.SEVERITY_LABELS =
  ((_b = {}),
  (_b[exports.SeverityLevel.LOW] = "Baixa"),
  (_b[exports.SeverityLevel.MEDIUM] = "Média"),
  (_b[exports.SeverityLevel.HIGH] = "Alta"),
  (_b[exports.SeverityLevel.CRITICAL] = "Crítica"),
  _b);
exports.STATUS_LABELS =
  ((_c = {}),
  (_c[exports.AlertStatus.ACTIVE] = "Ativo"),
  (_c[exports.AlertStatus.ACKNOWLEDGED] = "Reconhecido"),
  (_c[exports.AlertStatus.RESOLVED] = "Resolvido"),
  (_c[exports.AlertStatus.DISMISSED] = "Descartado"),
  _c);
exports.NOTIFICATION_CHANNEL_LABELS =
  ((_d = {}),
  (_d[exports.NotificationChannel.IN_APP] = "Notificação no App"),
  (_d[exports.NotificationChannel.EMAIL] = "Email"),
  (_d[exports.NotificationChannel.WHATSAPP] = "WhatsApp"),
  (_d[exports.NotificationChannel.SMS] = "SMS"),
  _d);
exports.REPORT_TYPE_LABELS =
  ((_e = {}),
  (_e[exports.ReportType.CONSUMPTION] = "Relatório de Consumo"),
  (_e[exports.ReportType.VALUATION] = "Relatório de Valorização"),
  (_e[exports.ReportType.MOVEMENT] = "Relatório de Movimentação"),
  (_e[exports.ReportType.EXPIRATION] = "Relatório de Vencimentos"),
  (_e[exports.ReportType.CUSTOM] = "Relatório Personalizado"),
  (_e[exports.ReportType.PERFORMANCE] = "Métricas de Performance"),
  _e);
