// Stock Alerts and Reports Types
// Story 11.4: Alertas e Relatórios de Estoque
// Implementation with Zod validation (QA Enhanced)

import { z } from 'zod';

// =====================================================
// BASE ENUMS AND CONSTANTS
// =====================================================

export const AlertType = {
  LOW_STOCK: 'low_stock',
  EXPIRING: 'expiring',
  EXPIRED: 'expired',
  OVERSTOCK: 'overstock',
  CRITICAL_SHORTAGE: 'critical_shortage',
} as const;

export const SeverityLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const AlertStatus = {
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
} as const;

export const ThresholdUnit = {
  QUANTITY: 'quantity',
  DAYS: 'days',
  PERCENTAGE: 'percentage',
} as const;

export const NotificationChannel = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
  SMS: 'sms',
} as const;

export const ReportType = {
  CONSUMPTION: 'consumption',
  VALUATION: 'valuation',
  MOVEMENT: 'movement',
  EXPIRATION: 'expiration',
  CUSTOM: 'custom',
  PERFORMANCE: 'performance',
} as const;

// =====================================================
// ZOD VALIDATION SCHEMAS (QA ENHANCED)
// =====================================================

// Base validation schemas
const uuidSchema = z.string().uuid('Invalid UUID format');
const positiveNumberSchema = z.number().positive('Must be a positive number');
const nonNegativeNumberSchema = z.number().min(0, 'Must be non-negative');
const percentageSchema = z
  .number()
  .min(0)
  .max(100, 'Must be between 0 and 100');
const emailSchema = z.string().email('Invalid email format');

// Alert type validation
const alertTypeSchema = z.enum([
  'low_stock',
  'expiring',
  'expired',
  'overstock',
  'critical_shortage',
]);

// Severity level validation
const severityLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

// Alert status validation
const alertStatusSchema = z.enum([
  'active',
  'acknowledged',
  'resolved',
  'dismissed',
]);

// Threshold unit validation
const thresholdUnitSchema = z.enum(['quantity', 'days', 'percentage']);

// Notification channels validation
const notificationChannelSchema = z.enum([
  'in_app',
  'email',
  'whatsapp',
  'sms',
]);

// Report type validation
const reportTypeSchema = z.enum([
  'consumption',
  'valuation',
  'movement',
  'expiration',
  'custom',
  'performance',
]);

// =====================================================
// STOCK ALERT CONFIG SCHEMAS
// =====================================================

export const stockAlertConfigSchema = z
  .object({
    id: uuidSchema.optional(),
    clinicId: uuidSchema,
    productId: uuidSchema.optional(),
    categoryId: uuidSchema.optional(),
    alertType: alertTypeSchema,
    thresholdValue: positiveNumberSchema,
    thresholdUnit: thresholdUnitSchema.default('quantity'),
    severityLevel: severityLevelSchema.default('medium'),
    isActive: z.boolean().default(true),
    notificationChannels: z
      .array(notificationChannelSchema)
      .min(1, 'At least one notification channel required'),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    createdBy: uuidSchema.optional(),
    updatedBy: uuidSchema.optional(),
  })
  .refine(
    (data) =>
      data.productId || data.categoryId || !(data.productId || data.categoryId),
    {
      message:
        'Either productId, categoryId, or neither should be provided (not both)',
      path: ['productId', 'categoryId'],
    },
  );

// Create alert config schema (for API requests)
export const createStockAlertConfigSchema = z.object({
  clinicId: uuidSchema,
  productId: uuidSchema.optional(),
  categoryId: uuidSchema.optional(),
  alertType: alertTypeSchema,
  thresholdValue: positiveNumberSchema,
  thresholdUnit: thresholdUnitSchema.default('quantity'),
  severityLevel: severityLevelSchema.default('medium'),
  isActive: z.boolean().default(true),
  notificationChannels: z
    .array(notificationChannelSchema)
    .min(1, 'At least one notification channel required'),
});

// Update alert config schema (for API requests)
export const updateStockAlertConfigSchema = z.object({
  productId: uuidSchema.optional(),
  categoryId: uuidSchema.optional(),
  alertType: alertTypeSchema.optional(),
  thresholdValue: positiveNumberSchema.optional(),
  thresholdUnit: thresholdUnitSchema.optional(),
  severityLevel: severityLevelSchema.optional(),
  isActive: z.boolean().optional(),
  notificationChannels: z
    .array(notificationChannelSchema)
    .min(1, 'At least one notification channel required')
    .optional(),
});

// =====================================================
// STOCK ALERT SCHEMAS
// =====================================================

export const stockAlertSchema = z
  .object({
    id: uuidSchema.optional(),
    clinicId: uuidSchema,
    alertConfigId: uuidSchema.optional(),
    productId: uuidSchema,
    alertType: alertTypeSchema,
    severityLevel: severityLevelSchema,
    currentValue: nonNegativeNumberSchema,
    thresholdValue: positiveNumberSchema,
    message: z
      .string()
      .min(1, 'Message is required')
      .max(1000, 'Message too long'),
    status: alertStatusSchema.default('active'),
    metadata: z.record(z.any()).default({}),
    acknowledgedBy: uuidSchema.optional(),
    acknowledgedAt: z.date().optional(),
    resolvedAt: z.date().optional(),
    createdAt: z.date().optional(),
  })
  .refine(
    (data) => {
      // If acknowledged, must have both acknowledgedBy and acknowledgedAt
      if (data.acknowledgedBy || data.acknowledgedAt) {
        return data.acknowledgedBy && data.acknowledgedAt;
      }
      return true;
    },
    {
      message:
        'Both acknowledgedBy and acknowledgedAt must be provided when acknowledging an alert',
      path: ['acknowledgedBy', 'acknowledgedAt'],
    },
  );

// Acknowledge alert schema
export const acknowledgeAlertSchema = z.object({
  alertId: uuidSchema,
  acknowledgedBy: uuidSchema,
  note: z
    .string()
    .optional()
    .transform((val) => val?.trim())
    .pipe(z.string().max(500, 'Note too long').optional()),
});

// Resolve alert schema
export const resolveAlertSchema = z.object({
  alertId: uuidSchema,
  resolvedBy: uuidSchema,
  resolution: z
    .string()
    .min(1, 'Resolution description required')
    .max(1000, 'Resolution too long'),
  actionsTaken: z.array(z.string()).optional(),
});

// =====================================================
// CUSTOM REPORTS SCHEMAS
// =====================================================

const reportFiltersSchema = z.object({
  dateRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .optional()
    .refine((data) => !data || data.start <= data.end, {
      message: 'Start date must be before or equal to end date',
    }),
  productIds: z.array(uuidSchema).optional(),
  categoryIds: z.array(uuidSchema).optional(),
  supplierId: uuidSchema.optional(),
  costCenterId: uuidSchema.optional(),
  alertTypes: z.array(alertTypeSchema).optional(),
  severityLevels: z.array(severityLevelSchema).optional(),
  customFilters: z.record(z.any()).optional(),
});

const reportScheduleConfigSchema = z
  .object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    dayOfWeek: z.number().min(0).max(6).optional(), // 0 = Sunday
    dayOfMonth: z.number().min(1).max(31).optional(),
    time: z
      .string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    recipients: z.array(emailSchema).min(1, 'At least one recipient required'),
    enabled: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.frequency === 'weekly' && !data.dayOfWeek) {
        return false;
      }
      if (data.frequency === 'monthly' && !data.dayOfMonth) {
        return false;
      }
      return true;
    },
    {
      message:
        'dayOfWeek required for weekly frequency, dayOfMonth required for monthly frequency',
    },
  );

export const customStockReportSchema = z.object({
  id: uuidSchema.optional(),
  clinicId: uuidSchema,
  userId: uuidSchema,
  reportName: z
    .string()
    .min(1, 'Report name required')
    .max(200, 'Report name too long')
    .trim(),
  reportType: reportTypeSchema,
  filters: reportFiltersSchema,
  scheduleConfig: reportScheduleConfigSchema.optional(),
  isActive: z.boolean().default(true),
  lastExecutedAt: z.date().optional(),
  executionCount: nonNegativeNumberSchema.default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Create custom report schema
export const createCustomReportSchema = customStockReportSchema.omit({
  id: true,
  lastExecutedAt: true,
  executionCount: true,
  createdAt: true,
  updatedAt: true,
});

// =====================================================
// PERFORMANCE METRICS SCHEMAS
// =====================================================

export const stockPerformanceMetricsSchema = z.object({
  id: uuidSchema.optional(),
  clinicId: uuidSchema,
  metricDate: z.date(),
  totalValue: nonNegativeNumberSchema,
  turnoverRate: z.number().min(0).optional(),
  daysCoverage: z.number().int().positive().optional(),
  accuracyPercentage: percentageSchema.optional(),
  wasteValue: nonNegativeNumberSchema,
  wastePercentage: percentageSchema,
  activeAlertsCount: nonNegativeNumberSchema,
  criticalAlertsCount: nonNegativeNumberSchema,
  productsCount: nonNegativeNumberSchema,
  outOfStockCount: nonNegativeNumberSchema,
  lowStockCount: nonNegativeNumberSchema,
  createdAt: z.date().optional(),
});

// =====================================================
// DASHBOARD DATA SCHEMAS
// =====================================================

export const stockKPIsSchema = z.object({
  totalValue: nonNegativeNumberSchema,
  turnoverRate: z.number().min(0),
  daysCoverage: z.number().int().positive(),
  accuracyPercentage: percentageSchema,
  activeAlerts: nonNegativeNumberSchema,
  criticalAlerts: nonNegativeNumberSchema,
  wasteValue: nonNegativeNumberSchema,
  wastePercentage: percentageSchema,
});

export const consumptionTrendSchema = z.object({
  date: z.string().datetime(),
  value: nonNegativeNumberSchema,
  category: z.string().optional(),
  trend: z.enum(['up', 'down', 'stable']).optional(),
});

export const topProductSchema = z.object({
  productId: uuidSchema,
  name: z.string(),
  sku: z.string().optional(),
  consumption: nonNegativeNumberSchema,
  value: nonNegativeNumberSchema,
  changePercentage: z.number().optional(),
});

export const alertsByTypeSchema = z.object({
  type: alertTypeSchema,
  count: nonNegativeNumberSchema,
  severity: severityLevelSchema,
  percentage: percentageSchema.optional(),
});

export const wasteAnalysisSchema = z.object({
  period: z.string(),
  waste: nonNegativeNumberSchema,
  percentage: percentageSchema,
  trend: z.enum(['improving', 'worsening', 'stable']).optional(),
});

export const recommendationSchema = z.object({
  id: z.string(),
  type: z.enum(['reorder', 'optimize', 'attention', 'action_required']),
  priority: z.enum(['high', 'medium', 'low']),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  actionable: z.boolean(),
  productId: uuidSchema.optional(),
  actions: z
    .array(
      z.object({
        label: z.string(),
        action: z.string(),
        parameters: z.record(z.any()).optional(),
      }),
    )
    .optional(),
  dismissible: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
});

export const stockDashboardDataSchema = z.object({
  kpis: stockKPIsSchema,
  charts: z.object({
    consumptionTrend: z.array(consumptionTrendSchema),
    topProducts: z.array(topProductSchema),
    alertsByType: z.array(alertsByTypeSchema),
    wasteAnalysis: z.array(wasteAnalysisSchema),
  }),
  alerts: z.array(stockAlertSchema),
  recommendations: z.array(recommendationSchema),
  lastUpdated: z.date().default(() => new Date()),
});

// =====================================================
// API REQUEST/RESPONSE SCHEMAS
// =====================================================

// Query parameters for alerts list
export const alertsQuerySchema = z.object({
  status: alertStatusSchema.optional(),
  severity: severityLevelSchema.optional(),
  type: alertTypeSchema.optional(),
  productId: uuidSchema.optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  sortBy: z
    .enum(['created_at', 'severity_level', 'alert_type'])
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Query parameters for reports
export const reportsQuerySchema = z.object({
  type: reportTypeSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  productIds: z.array(uuidSchema).optional(),
  categoryIds: z.array(uuidSchema).optional(),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
});

// =====================================================
// TYPESCRIPT TYPES (INFERRED FROM SCHEMAS)
// =====================================================

export type AlertType = z.infer<typeof alertTypeSchema>;
export type SeverityLevel = z.infer<typeof severityLevelSchema>;
export type AlertStatus = z.infer<typeof alertStatusSchema>;
export type ThresholdUnit = z.infer<typeof thresholdUnitSchema>;
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;
export type ReportType = z.infer<typeof reportTypeSchema>;

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
export type CreateCustomReport = z.infer<typeof createCustomReportSchema>;
export type ReportFilters = z.infer<typeof reportFiltersSchema>;
export type ReportScheduleConfig = z.infer<typeof reportScheduleConfigSchema>;

export type StockPerformanceMetrics = z.infer<
  typeof stockPerformanceMetricsSchema
>;
export type StockKPIs = z.infer<typeof stockKPIsSchema>;
export type ConsumptionTrend = z.infer<typeof consumptionTrendSchema>;
export type TopProduct = z.infer<typeof topProductSchema>;
export type AlertsByType = z.infer<typeof alertsByTypeSchema>;
export type WasteAnalysis = z.infer<typeof wasteAnalysisSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
export type StockDashboardData = z.infer<typeof stockDashboardDataSchema>;

export type AlertsQuery = z.infer<typeof alertsQuerySchema>;
export type ReportsQuery = z.infer<typeof reportsQuerySchema>;

// =====================================================
// EXTENDED TYPES WITH RELATIONS
// =====================================================

export interface StockAlertWithProduct extends StockAlert {
  product?: {
    id: string;
    name: string;
    sku?: string;
    category?: {
      id: string;
      name: string;
    };
  };
  acknowledgedUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CustomStockReportWithUser extends CustomStockReport {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  executionHistory?: Array<{
    executedAt: Date;
    status: 'success' | 'error';
    errorMessage?: string;
    resultCount?: number;
  }>;
}

export interface StockAlertConfigWithDetails extends StockAlertConfig {
  product?: {
    id: string;
    name: string;
    sku?: string;
    currentStock?: number;
  };
  category?: {
    id: string;
    name: string;
    productsCount?: number;
  };
  lastTriggered?: Date;
  triggersCount?: number;
}

// =====================================================
// UTILITY FUNCTIONS FOR VALIDATION
// =====================================================

export const validateStockAlertConfig = (data: unknown): StockAlertConfig => {
  return stockAlertConfigSchema.parse(data);
};

export const validateCreateStockAlertConfig = (
  data: unknown,
): CreateStockAlertConfig => {
  return createStockAlertConfigSchema.parse(data);
};

export const validateAcknowledgeAlert = (data: unknown): AcknowledgeAlert => {
  return acknowledgeAlertSchema.parse(data);
};

export const validateResolveAlert = (data: unknown): ResolveAlert => {
  return resolveAlertSchema.parse(data);
};

export const validateCustomStockReport = (data: unknown): CustomStockReport => {
  return customStockReportSchema.parse(data);
};

export const validateAlertsQuery = (data: unknown): AlertsQuery => {
  return alertsQuerySchema.parse(data);
};

export const validateReportsQuery = (data: unknown): ReportsQuery => {
  return reportsQuerySchema.parse(data);
};

// =====================================================
// ERROR TYPES
// =====================================================

export class StockAlertValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'StockAlertValidationError';
  }
}

// =====================================================
// CONSTANTS FOR UI
// =====================================================

export const ALERT_TYPE_LABELS = {
  [AlertType.LOW_STOCK]: 'Estoque Baixo',
  [AlertType.EXPIRING]: 'Próximo ao Vencimento',
  [AlertType.EXPIRED]: 'Vencido',
  [AlertType.OVERSTOCK]: 'Excesso de Estoque',
  [AlertType.CRITICAL_SHORTAGE]: 'Falta Crítica',
} as const;

export const SEVERITY_LABELS = {
  [SeverityLevel.LOW]: 'Baixa',
  [SeverityLevel.MEDIUM]: 'Média',
  [SeverityLevel.HIGH]: 'Alta',
  [SeverityLevel.CRITICAL]: 'Crítica',
} as const;

export const STATUS_LABELS = {
  [AlertStatus.ACTIVE]: 'Ativo',
  [AlertStatus.ACKNOWLEDGED]: 'Reconhecido',
  [AlertStatus.RESOLVED]: 'Resolvido',
  [AlertStatus.DISMISSED]: 'Descartado',
} as const;

export const NOTIFICATION_CHANNEL_LABELS = {
  [NotificationChannel.IN_APP]: 'Notificação no App',
  [NotificationChannel.EMAIL]: 'Email',
  [NotificationChannel.WHATSAPP]: 'WhatsApp',
  [NotificationChannel.SMS]: 'SMS',
} as const;

export const REPORT_TYPE_LABELS = {
  [ReportType.CONSUMPTION]: 'Relatório de Consumo',
  [ReportType.VALUATION]: 'Relatório de Valorização',
  [ReportType.MOVEMENT]: 'Relatório de Movimentação',
  [ReportType.EXPIRATION]: 'Relatório de Vencimentos',
  [ReportType.CUSTOM]: 'Relatório Personalizado',
  [ReportType.PERFORMANCE]: 'Métricas de Performance',
} as const;
