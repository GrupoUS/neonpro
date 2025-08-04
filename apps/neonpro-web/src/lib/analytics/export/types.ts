// Analytics Export Types - STORY-SUB-002 Task 7
// Created: 2025-01-22
// Comprehensive export system types for PDF, Excel, and CSV generation

import { z } from 'zod'
import type {
  MetricPeriod,
  MetricCategory,
  RevenueAnalytics,
  ConversionAnalytics,
  CohortData,
  ForecastData,
  TrialConversionPrediction
} from '../types'

// ============================================================================
// EXPORT FORMAT TYPES
// ============================================================================

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json'
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type ReportType = 'revenue' | 'conversion' | 'trial' | 'cohort' | 'forecast' | 'comprehensive'

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

export interface ExportConfig {
  format: ExportFormat
  reportType: ReportType
  includeCharts: boolean
  includeRawData: boolean
  includeSummary: boolean
  dateRange: {
    startDate: Date
    endDate: Date
  }
  filters?: Record<string, any>
  customization?: {
    title?: string
    subtitle?: string
    logo?: string
    branding?: boolean
    watermark?: string
  }
  compression?: boolean
  password?: string
}

// ============================================================================
// EXPORT DATA STRUCTURES
// ============================================================================

export interface ExportableData {
  revenue?: RevenueAnalytics
  conversion?: ConversionAnalytics
  cohorts?: CohortData[]
  forecasts?: ForecastData[]
  trials?: TrialConversionPrediction[]
  rawMetrics?: any[]
  metadata: {
    generatedAt: Date
    period: MetricPeriod
    totalRecords: number
    dataFreshness: Date
    queryExecutionTime: number
  }
}

// ============================================================================
// PDF EXPORT TYPES
// ============================================================================

export interface PDFExportOptions {
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal'
  orientation: 'portrait' | 'landscape'
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  header?: {
    text: string
    fontSize: number
    alignment: 'left' | 'center' | 'right'
  }
  footer?: {
    includePageNumbers: boolean
    includeTimestamp: boolean
    customText?: string
  }
  styling: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    fontSize: number
  }
  charts: {
    includeCharts: boolean
    chartFormat: 'png' | 'svg'
    chartQuality: 'low' | 'medium' | 'high'
  }
}

// ============================================================================
// EXCEL EXPORT TYPES
// ============================================================================

export interface ExcelExportOptions {
  worksheets: {
    summary: boolean
    revenue: boolean
    conversion: boolean
    cohorts: boolean
    forecasts: boolean
    rawData: boolean
  }
  formatting: {
    autoWidth: boolean
    freezePanes: boolean
    conditionalFormatting: boolean
    charts: boolean
  }
  protection: {
    password?: string
    allowEditing: boolean
    allowFormatting: boolean
  }
}

// ============================================================================
// CSV EXPORT TYPES
// ============================================================================

export interface CSVExportOptions {
  delimiter: ',' | ';' | '\t' | '|'
  encoding: 'utf-8' | 'utf-16' | 'ascii'
  includeHeaders: boolean
  dateFormat: 'iso' | 'us' | 'eu' | 'custom'
  customDateFormat?: string
  numberFormat: {
    decimalSeparator: '.' | ','
    thousandsSeparator: ',' | '.' | ' ' | ''
  }
  compression: 'none' | 'gzip' | 'zip'
}

// ============================================================================
// EXPORT REQUEST & RESPONSE
// ============================================================================

export interface ExportRequest {
  id: string
  userId: string
  config: ExportConfig
  pdfOptions?: PDFExportOptions
  excelOptions?: ExcelExportOptions
  csvOptions?: CSVExportOptions
  scheduledFor?: Date
  priority: 'low' | 'normal' | 'high'
  notifyOnComplete: boolean
  email?: string
}

export interface ExportResponse {
  id: string
  status: ExportStatus
  downloadUrl?: string
  fileName: string
  fileSize?: number
  createdAt: Date
  completedAt?: Date
  expiresAt: Date
  error?: {
    code: string
    message: string
    details?: any
  }
  progress?: {
    percentage: number
    currentStep: string
    estimatedTimeRemaining?: number
  }
}

// ============================================================================
// SCHEDULED EXPORTS
// ============================================================================

export interface ScheduledExport {
  id: string
  userId: string
  name: string
  description?: string
  config: ExportConfig
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    dayOfWeek?: number // 0-6 for weekly
    dayOfMonth?: number // 1-31 for monthly
    time: string // HH:MM format
    timezone: string
  }
  isActive: boolean
  lastRun?: Date
  nextRun: Date
  recipients: string[]
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// EXPORT ANALYTICS & MONITORING
// ============================================================================

export interface ExportMetrics {
  totalExports: number
  exportsByFormat: Record<ExportFormat, number>
  exportsByType: Record<ReportType, number>
  averageProcessingTime: number
  successRate: number
  errorRate: number
  popularReports: Array<{
    type: ReportType
    count: number
    avgSize: number
  }>
  peakUsageHours: number[]
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const ExportFormatSchema = z.enum(['pdf', 'excel', 'csv', 'json'])
export const ReportTypeSchema = z.enum(['revenue', 'conversion', 'trial', 'cohort', 'forecast', 'comprehensive'])
export const ExportStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed'])

export const ExportConfigSchema = z.object({
  format: ExportFormatSchema,
  reportType: ReportTypeSchema,
  includeCharts: z.boolean(),
  includeRawData: z.boolean(),
  includeSummary: z.boolean(),
  dateRange: z.object({
    startDate: z.date(),
    endDate: z.date()
  }),
  filters: z.record(z.any()).optional(),
  customization: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    logo: z.string().optional(),
    branding: z.boolean().optional(),
    watermark: z.string().optional()
  }).optional(),
  compression: z.boolean().optional(),
  password: z.string().optional()
})

export const ExportRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  config: ExportConfigSchema,
  scheduledFor: z.date().optional(),
  priority: z.enum(['low', 'normal', 'high']),
  notifyOnComplete: z.boolean(),
  email: z.string().email().optional()
})

// ============================================================================
// TYPE UTILITIES
// ============================================================================

export type ExportDataByType<T extends ReportType> = 
  T extends 'revenue' ? { revenue: RevenueAnalytics } :
  T extends 'conversion' ? { conversion: ConversionAnalytics } :
  T extends 'cohort' ? { cohorts: CohortData[] } :
  T extends 'forecast' ? { forecasts: ForecastData[] } :
  T extends 'trial' ? { trials: TrialConversionPrediction[] } :
  T extends 'comprehensive' ? ExportableData :
  never

export type ExportOptionsForFormat<T extends ExportFormat> = 
  T extends 'pdf' ? PDFExportOptions :
  T extends 'excel' ? ExcelExportOptions :
  T extends 'csv' ? CSVExportOptions :
  never

// Default configurations
export const DEFAULT_PDF_OPTIONS: PDFExportOptions = {
  pageSize: 'A4',
  orientation: 'portrait',
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  styling: {
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    fontFamily: 'Arial',
    fontSize: 12
  },
  charts: {
    includeCharts: true,
    chartFormat: 'png',
    chartQuality: 'high'
  }
}

export const DEFAULT_EXCEL_OPTIONS: ExcelExportOptions = {
  worksheets: {
    summary: true,
    revenue: true,
    conversion: true,
    cohorts: true,
    forecasts: true,
    rawData: false
  },
  formatting: {
    autoWidth: true,
    freezePanes: true,
    conditionalFormatting: true,
    charts: true
  },
  protection: {
    allowEditing: false,
    allowFormatting: false
  }
}

export const DEFAULT_CSV_OPTIONS: CSVExportOptions = {
  delimiter: ',',
  encoding: 'utf-8',
  includeHeaders: true,
  dateFormat: 'iso',
  numberFormat: {
    decimalSeparator: '.',
    thousandsSeparator: ','
  },
  compression: 'none'
}