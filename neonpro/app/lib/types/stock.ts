// Stock Management Types - Enhanced with QA Best Practices
// Implementation of Story 11.4: Alertas e Relatórios de Estoque

import { z } from 'zod'

// ============================================================================
// VALIDATION SCHEMAS (QA Recommendation: Input validation using Zod)
// ============================================================================

export const StockAlertConfigSchema = z.object({
  id: z.string().uuid().optional(),
  clinicId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  alertType: z.enum(['low_stock', 'expiring', 'expired', 'overstock']),
  thresholdValue: z.number().positive(),
  thresholdUnit: z.enum(['quantity', 'days', 'percentage']),
  severityLevel: z.enum(['low', 'medium', 'high', 'critical']),
  isActive: z.boolean().default(true),
  notificationChannels: z.array(z.enum(['in_app', 'email', 'whatsapp', 'sms'])),
})

export const StockAlertSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  alertConfigId: z.string().uuid(),
  productId: z.string().uuid(),
  alertType: z.string(),
  severityLevel: z.enum(['low', 'medium', 'high', 'critical']),
  currentValue: z.number(),
  thresholdValue: z.number().positive(),
  message: z.string().min(1),
  status: z.enum(['active', 'acknowledged', 'resolved']),
  acknowledgedBy: z.string().uuid().optional(),
  acknowledgedAt: z.date().optional(),
  resolvedAt: z.date().optional(),
  createdAt: z.date(),
})

export const CustomStockReportSchema = z.object({
  id: z.string().uuid().optional(),
  clinicId: z.string().uuid(),
  userId: z.string().uuid(),
  reportName: z.string().min(1).max(200),
  reportType: z.enum(['consumption', 'valuation', 'movement', 'custom']),
  filters: z.object({
    dateRange: z.object({
      start: z.date(),
      end: z.date(),
    }).optional(),
    productIds: z.array(z.string().uuid()).optional(),
    categoryIds: z.array(z.string().uuid()).optional(),
    supplierId: z.string().uuid().optional(),
    costCenterId: z.string().uuid().optional(),
    customFilters: z.record(z.unknown()).optional(),
  }),
  scheduleConfig: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    recipients: z.array(z.string().email()),
  }).optional(),
  isActive: z.boolean().default(true),
})

// ============================================================================
// TYPESCRIPT INTERFACES (Generated from Zod schemas for type safety)
// ============================================================================

export type StockAlertConfig = z.infer<typeof StockAlertConfigSchema>
export type StockAlert = z.infer<typeof StockAlertSchema>
export type CustomStockReport = z.infer<typeof CustomStockReportSchema>

// ============================================================================
// EXTENDED INTERFACES FOR BUSINESS LOGIC
// ============================================================================

export interface StockAlertWithRelations extends StockAlert {
  product?: {
    id: string
    name: string
    currentStock: number
    minStock: number
    category: {
      id: string
      name: string
    }
  }
  acknowledgedUser?: {
    id: string
    name: string
    email: string
  }
  config?: StockAlertConfig
}

export interface StockPerformanceMetrics {
  id: string
  clinicId: string
  metricDate: Date
  totalValue: number
  turnoverRate: number
  daysCoverage: number
  accuracyPercentage: number
  wasteValue: number
  wastePercentage: number
  createdAt: Date
}

export interface StockDashboardData {
  kpis: {
    totalValue: number
    turnoverRate: number
    daysCoverage: number
    accuracyPercentage: number
    activeAlerts: number
    criticalAlerts: number
  }
  charts: {
    consumptionTrend: Array<{
      date: string
      value: number
      category?: string
    }>
    topProducts: Array<{
      productId: string
      name: string
      consumption: number
      value: number
    }>
    alertsByType: Array<{
      type: string
      count: number
      severity: string
    }>
    wasteAnalysis: Array<{
      period: string
      waste: number
      percentage: number
    }>
  }
  alerts: StockAlertWithRelations[]
  recommendations: Array<{
    type: 'reorder' | 'optimize' | 'attention'
    priority: 'high' | 'medium' | 'low'
    message: string
    actionable: boolean
    productId?: string
  }>
}

// ============================================================================
// EVENT SOURCING TYPES (QA Recommendation: Event-driven architecture)
// ============================================================================

export type StockEventType = 
  | 'ALERT_GENERATED' 
  | 'ALERT_ACKNOWLEDGED' 
  | 'ALERT_RESOLVED'
  | 'THRESHOLD_CHANGED' 
  | 'STOCK_UPDATED'
  | 'REPORT_GENERATED'

export interface StockEvent {
  id: string
  type: StockEventType
  aggregateId: string
  aggregateType: 'stock_alert' | 'stock_item' | 'stock_report'
  payload: unknown
  timestamp: Date
  userId: string
  clinicId: string
  metadata?: Record<string, unknown>
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateAlertConfigRequest {
  productId?: string
  categoryId?: string
  alertType: 'low_stock' | 'expiring' | 'expired' | 'overstock'
  thresholdValue: number
  thresholdUnit: 'quantity' | 'days' | 'percentage'
  severityLevel: 'low' | 'medium' | 'high' | 'critical'
  notificationChannels: ('in_app' | 'email' | 'whatsapp' | 'sms')[]
}

export interface AcknowledgeAlertRequest {
  alertId: string
  note?: string
}

export interface ResolveAlertRequest {
  alertId: string
  resolutionNote?: string
  resolutionAction?: string
}

export interface GenerateReportRequest {
  reportType: 'consumption' | 'expiration' | 'valuation' | 'performance'
  filters: {
    dateRange?: { start: Date; end: Date }
    productIds?: string[]
    categoryIds?: string[]
    supplierId?: string
    costCenterId?: string
  }
  format: 'json' | 'csv' | 'pdf' | 'excel'
}

// ============================================================================
// ERROR TYPES (QA Recommendation: Proper error handling)
// ============================================================================

export class StockAlertError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'StockAlertError'
  }
}

export class StockReportError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'StockReportError'
  }
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertStatus = 'active' | 'acknowledged' | 'resolved'
export type NotificationChannel = 'in_app' | 'email' | 'whatsapp' | 'sms'
export type ReportFormat = 'json' | 'csv' | 'pdf' | 'excel'

// ============================================================================
// CONSTANTS
// ============================================================================

export const ALERT_SEVERITY_PRIORITY: Record<AlertSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

export const DEFAULT_NOTIFICATION_CHANNELS: NotificationChannel[] = ['in_app', 'email']

export const STOCK_REPORT_TYPES = {
  consumption: 'Relatório de Consumo',
  valuation: 'Relatório de Valorização',
  movement: 'Relatório de Movimentação',
  expiration: 'Relatório de Vencimentos',
  performance: 'Métricas de Performance',
  custom: 'Relatório Personalizado',
} as const

export const NOTIFICATION_CHANNEL_LABELS = {
  in_app: 'Notificação no App',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
} as const

export const SEVERITY_LABELS = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
} as const

export const ALERT_TYPE_LABELS = {
  low_stock: 'Estoque Baixo',
  expiring: 'Vencendo',
  expired: 'Vencido',
  overstock: 'Excesso de Estoque',
} as const

export const THRESHOLD_UNIT_LABELS = {
  quantity: 'Quantidade',
  days: 'Dias',
  percentage: 'Porcentagem',
} as const