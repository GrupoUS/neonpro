// Analytics Service Layer - Main Export - STORY-SUB-002 Task 2
// Created: 2025-01-22
// Complete analytics architecture with types, services, and controllers

// Core Types and Interfaces
export type {
  MetricPeriod,
  MetricCategory,
  TrialStatus,
  SubscriptionTier,
  BaseMetric,
  RevenueMetric,
  ConversionMetric,
  TrialMetric,
  MetricAggregation,
  RevenueAnalytics,
  ConversionAnalytics,
  FunnelStage,
  CohortData,
  ForecastData,
  TrialConversionPrediction,
  RealTimeMetric,
  MetricAlert,
  AnalyticsQuery,
  AnalyticsResponse,
  MetricType,
  AnalyticsQueryResult
} from './types'

// Validation Schemas
export {
  MetricPeriodSchema,
  MetricCategorySchema,
  TrialStatusSchema,
  SubscriptionTierSchema,
  AnalyticsQuerySchema
} from './types'

// Service Layer Architecture
export { AnalyticsRepository } from './repository'
export { AnalyticsService } from './service'
export { AnalyticsController, analyticsController } from './controller'

// Service instances
export const analyticsService = new AnalyticsService()

// Export System - STORY-SUB-002 Task 7
export * from './export'
export { AnalyticsExportService } from './export/service'

// Convenience exports for common patterns
export class Analytics {
  static service = new AnalyticsService()
  static controller = analyticsController

  // Factory methods for quick analytics queries
  static async getRevenueMetrics(period: MetricPeriod = 'month') {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    return Analytics.service.getRevenueAnalytics(period, startDate, endDate)
  }

  static async getConversionMetrics(period: MetricPeriod = 'month') {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    return Analytics.service.getConversionAnalytics(period, startDate, endDate)
  }

  static async predictTrialConversion(userId: string, trialId: string) {
    return Analytics.service.predictTrialConversion(userId, trialId)
  }

  static async getRealTimeMetrics() {
    return Analytics.service.getRealTimeMetrics()
  }
}

// Export convenience class
export class AnalyticsExport {
  static service = new (require('./export/service').AnalyticsExportService)()
  
  // Quick export methods
  static async exportToPDF(config: any) {
    return AnalyticsExport.service.generatePDFExport(config)
  }
  
  static async exportToExcel(config: any) {
    return AnalyticsExport.service.generateExcelExport(config)
  }
  
  static async exportToCSV(config: any) {
    return AnalyticsExport.service.generateCSVExport(config)
  }
}

// Default export
export default Analytics