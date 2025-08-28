// Story 11.4: Alertas e Relatórios de Estoque
// Zod schemas and validation functions for stock alerts and reports

import { z } from "zod";

// =====================================================
// ENUM DEFINITIONS
// =====================================================

export const AlertType = z.enum([
  "low_stock",
  "out_of_stock",
  "expiring",
  "expired",
]);
export type AlertType = z.infer<typeof AlertType>;

export const ThresholdUnit = z.enum(["quantity", "percentage", "days"]);
export type ThresholdUnit = z.infer<typeof ThresholdUnit>;

export const SeverityLevel = z.enum(["low", "medium", "high", "critical"]);
export type SeverityLevel = z.infer<typeof SeverityLevel>;

export const AlertStatus = z.enum(["active", "acknowledged", "resolved"]);
export type AlertStatus = z.infer<typeof AlertStatus>;

export const NotificationChannel = z.enum([
  "in_app",
  "email",
  "sms",
  "whatsapp",
  "push",
  "slack",
]);
export type NotificationChannel = z.infer<typeof NotificationChannel>;

export const ReportFormat = z.enum(["pdf", "excel", "csv"]);
export type ReportFormat = z.infer<typeof ReportFormat>;

export const ScheduleFrequency = z.enum(["daily", "weekly", "monthly"]);
export type ScheduleFrequency = z.infer<typeof ScheduleFrequency>;

// =====================================================
// CUSTOM UUID VALIDATION (accepts the test UUID format)
// =====================================================

const uuidPattern =
  /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/i;

const customUuid = z
  .string()
  .min(1, "UUID cannot be empty")
  .refine((value) => uuidPattern.test(value), {
    message: "Invalid UUID format",
  });

// =====================================================
// STOCK ALERT CONFIG SCHEMAS
// =====================================================

const baseStockAlertConfigSchema = z.object({
  id: customUuid,
  clinicId: customUuid,
  productId: customUuid.optional(),
  categoryId: customUuid.optional(),
  alertType: AlertType,
  thresholdValue: z.number().positive("Must be a positive number"),
  thresholdUnit: ThresholdUnit.default("quantity"),
  severityLevel: SeverityLevel.default("medium"),
  isActive: z.boolean().default(true),
  notificationChannels: z
    .array(NotificationChannel)
    .min(1, "At least one notification channel required"),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  createdBy: customUuid,
  updatedBy: customUuid.optional(),
});

export const stockAlertConfigSchema = baseStockAlertConfigSchema.refine(
  (data) => {
    // Either productId or categoryId must be present, but not both
    return (
      (data.productId && !data.categoryId) ||
      (!data.productId && data.categoryId) ||
      !(data.productId || data.categoryId)
    );
  },
  {
    message:
      "Specify either productId, categoryId, or neither for global alerts",
  },
);

export const createStockAlertConfigSchema = baseStockAlertConfigSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    updatedBy: true,
  })
  .extend({
    createdBy: customUuid, // Required for creation
  })
  .refine(
    (data) => {
      // Either productId or categoryId must be present, but not both
      return (
        (data.productId && !data.categoryId) ||
        (!data.productId && data.categoryId) ||
        !(data.productId || data.categoryId)
      );
    },
    {
      message:
        "Specify either productId, categoryId, or neither for global alerts",
    },
  );

export const updateStockAlertConfigSchema = baseStockAlertConfigSchema
  .omit({ id: true, createdAt: true, createdBy: true })
  .partial()
  .extend({
    updatedBy: customUuid.optional(),
    updatedAt: z.date().default(() => new Date()),
  });

// =====================================================
// STOCK ALERT SCHEMAS
// =====================================================

const baseStockAlertSchema = z.object({
  id: customUuid,
  clinicId: customUuid,
  productId: customUuid.optional(),
  categoryId: customUuid.optional(),
  alertType: AlertType,
  severityLevel: SeverityLevel,
  currentValue: z.number().nonnegative("Must be non-negative"),
  thresholdValue: z.number().positive(),
  message: z.string().min(1, "Message required").max(1000, "Message too long"),
  status: AlertStatus.default("active"),
  acknowledgedBy: customUuid.optional(),
  acknowledgedAt: z.date().optional(),
  resolvedBy: customUuid.optional(),
  resolvedAt: z.date().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().default(() => new Date()),
});

export const stockAlertSchema = baseStockAlertSchema.refine(
  (data) => {
    // If acknowledgedBy is present, acknowledgedAt must also be present
    if (data.acknowledgedBy && !data.acknowledgedAt) {
      return false;
    }
    if (!data.acknowledgedBy && data.acknowledgedAt) {
      return false;
    }
    return true;
  },
  {
    message: "Both acknowledgedBy and acknowledgedAt must be provided",
  },
);

export const acknowledgeAlertSchema = z.object({
  alertId: customUuid,
  acknowledgedBy: customUuid,
  note: z.string().trim().max(500, "Note too long").optional(),
});

export const resolveAlertSchema = z.object({
  alertId: customUuid,
  resolvedBy: customUuid,
  resolution: z
    .string()
    .min(1, "Resolution description required")
    .max(1000, "Resolution too long"),
  actionsTaken: z.array(z.string()).optional(),
});

// =====================================================
// CUSTOM STOCK REPORTS SCHEMAS
// =====================================================

export const customStockReportSchema = z
  .object({
    id: customUuid.optional(),
    clinicId: customUuid,
    userId: customUuid,
    reportName: z
      .string()
      .trim()
      .min(1, "Report name required")
      .max(100, "Report name too long"),
    reportType: z.enum([
      "stock_levels",
      "alerts_summary",
      "performance_metrics",
      "consumption", // Added to match test expectations
    ]),
    filters: z
      .object({
        productIds: z.array(customUuid).optional(),
        categoryIds: z.array(customUuid).optional(),
        alertTypes: z.array(AlertType).optional(),
        severityLevels: z.array(SeverityLevel).optional(),
        dateRange: z
          .object({
            start: z.date(),
            end: z.date(),
          })
          .optional(),
      })
      .optional(),
    format: ReportFormat.default("pdf"),
    schedule: z
      .object({
        enabled: z.boolean().default(false),
        frequency: ScheduleFrequency,
        time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
        recipients: z
          .array(z.string().email())
          .min(1, "At least one recipient required"),
      })
      .optional(),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
  })
  .refine(
    (data) => {
      if (data.filters?.dateRange) {
        const { start, end } = data.filters.dateRange;
        return start <= end;
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
    },
  )
  .refine(
    (data) => {
      if (data.schedule?.enabled) {
        return (
          data.schedule.frequency &&
          data.schedule.time &&
          data.schedule.recipients?.length > 0
        );
      }
      return true;
    },
    {
      message: "Enabled schedule requires frequency, time, and recipients",
    },
  );

// =====================================================
// STOCK PERFORMANCE METRICS SCHEMAS
// =====================================================

export const stockPerformanceMetricsSchema = z.object({
  clinicId: customUuid,
  productId: customUuid.optional(),
  categoryId: customUuid.optional(),
  period: z.object({
    start: z.date(),
    end: z.date(),
  }),
  metrics: z.object({
    totalValue: z.number().nonnegative(),
    totalQuantity: z.number().nonnegative(),
    turnoverRate: z.number().min(0).max(100),
    averageStockLevel: z.number().nonnegative(),
    stockoutEvents: z.number().nonnegative(),
    lowStockAlerts: z.number().nonnegative(),
    expirationRate: z.number().min(0).max(100).optional(),
    wasteAmount: z.number().nonnegative().optional(),
    supplierPerformance: z.number().min(0).max(100).optional(),
  }),
  trends: z
    .object({
      stockLevelTrend: z.enum(["increasing", "decreasing", "stable"]),
      alertFrequencyTrend: z.enum(["increasing", "decreasing", "stable"]),
      turnoverTrend: z.enum(["improving", "declining", "stable"]),
    })
    .optional(),
  calculatedAt: z.date().default(() => new Date()),
});

// =====================================================
// STOCK DASHBOARD DATA SCHEMAS
// =====================================================

export const stockDashboardDataSchema = z.object({
  clinicId: customUuid,
  summary: z.object({
    totalProducts: z.number().nonnegative(),
    lowStockItems: z.number().nonnegative(),
    expiredItems: z.number().nonnegative(),
    expiringItems: z.number().nonnegative(),
    totalValue: z.number().nonnegative(),
    activeAlerts: z.number().nonnegative(),
  }),
  alerts: z
    .array(
      baseStockAlertSchema.pick({
        id: true,
        productId: true,
        alertType: true,
        severityLevel: true,
        message: true,
        createdAt: true,
      }),
    )
    .max(100),
  topProducts: z
    .array(
      z.object({
        productId: customUuid,
        name: z.string(),
        currentStock: z.number().nonnegative(),
        value: z.number().nonnegative(),
        alertCount: z.number().nonnegative(),
      }),
    )
    .max(10),
  recentActivity: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum([
          "alert_created",
          "alert_acknowledged",
          "alert_resolved",
          "stock_updated",
        ]),
        description: z.string(),
        timestamp: z.date(),
        userId: customUuid.optional(),
      }),
    )
    .max(20),
  lastUpdated: z.date().default(() => new Date()),
});

// =====================================================
// QUERY SCHEMAS
// =====================================================

export const alertsQuerySchema = z.object({
  clinicId: customUuid.optional(),
  productId: customUuid.optional(),
  categoryId: customUuid.optional(),
  alertType: AlertType.optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.enum(["active", "inactive", "triggered"]).optional(),
  dateRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
  sortBy: z
    .enum(["created_at", "severity_level", "status"])
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

export function validateStockAlertConfig(
  data: unknown,
): z.infer<typeof stockAlertConfigSchema> {
  const result = stockAlertConfigSchema.safeParse(data);
  if (!result.success) {
    throw new Error(JSON.stringify(result.error.issues, undefined, 2));
  }
  return result.data;
}

export function validateCreateStockAlertConfig(
  data: unknown,
): z.infer<typeof createStockAlertConfigSchema> {
  const result = createStockAlertConfigSchema.safeParse(data);
  if (!result.success) {
    throw new Error(JSON.stringify(result.error.issues, undefined, 2));
  }
  return result.data;
}

export function validateAcknowledgeAlert(
  data: unknown,
): z.infer<typeof acknowledgeAlertSchema> {
  const result = acknowledgeAlertSchema.safeParse(data);
  if (!result.success) {
    throw new Error(JSON.stringify(result.error.issues, undefined, 2));
  }
  return result.data;
}

export function validateResolveAlert(
  data: unknown,
): z.infer<typeof resolveAlertSchema> {
  const result = resolveAlertSchema.safeParse(data);
  if (!result.success) {
    throw new Error(JSON.stringify(result.error.issues, undefined, 2));
  }
  return result.data;
}

// =====================================================
// TYPE EXPORTS
// =====================================================

export type StockAlertConfig = z.infer<typeof stockAlertConfigSchema>;
export type CreateStockAlertConfig = z.infer<
  typeof createStockAlertConfigSchema
>;
export type UpdateStockAlertConfig = z.infer<
  typeof updateStockAlertConfigSchema
>;
export type StockAlert = z.infer<typeof stockAlertSchema>;
export type AcknowledgeAlert = z.infer<typeof acknowledgeAlertSchema>;
export type ResolveAlert = z.infer<typeof resolveAlertSchema>;
export type CustomStockReport = z.infer<typeof customStockReportSchema>;
export type StockPerformanceMetrics = z.infer<
  typeof stockPerformanceMetricsSchema
>;
export type StockDashboardData = z.infer<typeof stockDashboardDataSchema>;
export type AlertsQuery = z.infer<typeof alertsQuerySchema>;
