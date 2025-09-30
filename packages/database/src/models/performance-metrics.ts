/**
 * Performance Metrics Model
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { z } from 'zod'

// Edge Performance Schema
export const EdgePerformanceSchema = z.object({
  ttfb: z.number().max(150, 'Edge TTFB must be ≤ 150ms'),
  cacheHitRate: z.number().min(0).max(100, 'Cache hit rate must be between 0 and 100'),
  coldStartFrequency: z.number().min(0, 'Cold start frequency must be non-negative'),
  regionLatency: z.record(z.string(), z.number().min(0, 'Region latency must be non-negative')),
  timestamp: z.date(),
})

// Realtime Performance Schema
export const RealtimePerformanceSchema = z.object({
  uiPatchTime: z.number().max(1.5, 'Realtime UI patch must be ≤ 1.5s'),
  connectionLatency: z.number().min(0, 'Connection latency must be non-negative'),
  messageDeliveryTime: z.number().min(0, 'Message delivery time must be non-negative'),
  subscriptionSetupTime: z.number().min(0, 'Subscription setup time must be non-negative'),
  timestamp: z.date(),
})

// AI Performance Schema
export const AIPerformanceSchema = z.object({
  copilotToolRoundtrip: z.number().max(2, 'Copilot tool roundtrip must be ≤ 2s'),
  modelInferenceTime: z.number().min(0, 'Model inference time must be non-negative'),
  responseGenerationTime: z.number().min(0, 'Response generation time must be non-negative'),
  timestamp: z.date(),
})

// Build Performance Schema
export const BuildPerformanceSchema = z.object({
  buildTime: z.number().min(0, 'Build time must be positive'),
  installTime: z.number().min(0, 'Install time must be positive'),
  bundleSize: z.object({
    main: z.number().min(0, 'Main bundle size must be positive'),
    vendor: z.number().min(0, 'Vendor bundle size must be positive'),
    total: z.number().min(0, 'Total bundle size must be positive'),
  }),
  cacheHitRate: z.number().min(0).max(100, 'Cache hit rate must be between 0 and 100'),
  timestamp: z.date(),
})

// System Performance Schema
export const SystemPerformanceSchema = z.object({
  uptime: z.number().min(99.9, 'Uptime must be ≥ 99.9%'),
  memoryUsage: z.number().min(0).max(100, 'Memory usage must be between 0 and 100'),
  cpuUsage: z.number().min(0).max(100, 'CPU usage must be between 0 and 100'),
  diskUsage: z.number().min(0).max(100, 'Disk usage must be between 0 and 100'),
  timestamp: z.date(),
})

// Performance Metrics Schema
export const PerformanceMetricsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  environment: z.enum(['development', 'staging', 'production']),
  edgePerformance: EdgePerformanceSchema,
  realtimePerformance: RealtimePerformanceSchema,
  aiPerformance: AIPerformanceSchema,
  buildPerformance: BuildPerformanceSchema,
  systemPerformance: SystemPerformanceSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Performance Metrics Update Schema
export const PerformanceMetricsUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  edgePerformance: EdgePerformanceSchema.optional(),
  realtimePerformance: RealtimePerformanceSchema.optional(),
  aiPerformance: AIPerformanceSchema.optional(),
  buildPerformance: BuildPerformanceSchema.optional(),
  systemPerformance: SystemPerformanceSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// Types
export type EdgePerformance = z.infer<typeof EdgePerformanceSchema>
export type RealtimePerformance = z.infer<typeof RealtimePerformanceSchema>
export type AIPerformance = z.infer<typeof AIPerformanceSchema>
export type BuildPerformance = z.infer<typeof BuildPerformanceSchema>
export type SystemPerformance = z.infer<typeof SystemPerformanceSchema>
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>
export type PerformanceMetricsUpdate = z.infer<typeof PerformanceMetricsUpdateSchema>

// Default values
export const defaultEdgePerformance: EdgePerformance = {
  ttfb: 150,
  cacheHitRate: 80,
  coldStartFrequency: 0,
  regionLatency: {},
  timestamp: new Date(),
}

export const defaultRealtimePerformance: RealtimePerformance = {
  uiPatchTime: 1.5,
  connectionLatency: 100,
  messageDeliveryTime: 50,
  subscriptionSetupTime: 200,
  timestamp: new Date(),
}

export const defaultAIPerformance: AIPerformance = {
  copilotToolRoundtrip: 2,
  modelInferenceTime: 500,
  responseGenerationTime: 300,
  timestamp: new Date(),
}

export const defaultBuildPerformance: BuildPerformance = {
  buildTime: 0,
  installTime: 0,
  bundleSize: {
    main: 0,
    vendor: 0,
    total: 0,
  },
  cacheHitRate: 0,
  timestamp: new Date(),
}

export const defaultSystemPerformance: SystemPerformance = {
  uptime: 99.9,
  memoryUsage: 50,
  cpuUsage: 30,
  diskUsage: 40,
  timestamp: new Date(),
}

export const defaultPerformanceMetrics: Omit<PerformanceMetrics, 'id' | 'name' | 'environment' | 'createdAt' | 'updatedAt'> = {
  edgePerformance: defaultEdgePerformance,
  realtimePerformance: defaultRealtimePerformance,
  aiPerformance: defaultAIPerformance,
  buildPerformance: defaultBuildPerformance,
  systemPerformance: defaultSystemPerformance,
  metadata: {},
}

// Validation functions
export const validatePerformanceMetrics = (metrics: unknown): PerformanceMetrics => {
  return PerformanceMetricsSchema.parse(metrics)
}

export const validatePerformanceMetricsUpdate = (update: unknown): PerformanceMetricsUpdate => {
  return PerformanceMetricsUpdateSchema.parse(update)
}

export const validateEdgePerformance = (performance: unknown): EdgePerformance => {
  return EdgePerformanceSchema.parse(performance)
}

export const validateRealtimePerformance = (performance: unknown): RealtimePerformance => {
  return RealtimePerformanceSchema.parse(performance)
}

export const validateAIPerformance = (performance: unknown): AIPerformance => {
  return AIPerformanceSchema.parse(performance)
}

export const validateBuildPerformance = (performance: unknown): BuildPerformance => {
  return BuildPerformanceSchema.parse(performance)
}

export const validateSystemPerformance = (performance: unknown): SystemPerformance => {
  return SystemPerformanceSchema.parse(performance)
}

// Performance validation
export const validatePerformanceTargets = (metrics: PerformanceMetrics): boolean => {
  return (
    metrics.edgePerformance.ttfb <= 150 &&
    metrics.realtimePerformance.uiPatchTime <= 1.5 &&
    metrics.aiPerformance.copilotToolRoundtrip <= 2 &&
    metrics.systemPerformance.uptime >= 99.9
  )
}

// Bun performance validation
export const validateBunPerformance = (metrics: PerformanceMetrics): boolean => {
  // Bun should provide 3-5x improvement in build/dev times
  // This is a simplified check - in a real implementation, we would compare with baseline
  return (
    metrics.buildPerformance.buildTime > 0 &&
    metrics.buildPerformance.cacheHitRate >= 80
  )
}

// Edge performance validation
export const validateEdgePerformance = (performance: EdgePerformance): boolean => {
  return (
    performance.ttfb <= 150 &&
    performance.cacheHitRate >= 80 &&
    performance.coldStartFrequency <= 5
  )
}

// Realtime performance validation
export const validateRealtimePerformance = (performance: RealtimePerformance): boolean => {
  return (
    performance.uiPatchTime <= 1.5 &&
    performance.connectionLatency <= 200 &&
    performance.messageDeliveryTime <= 100
  )
}

// AI performance validation
export const validateAIPerformance = (performance: AIPerformance): boolean => {
  return (
    performance.copilotToolRoundtrip <= 2 &&
    performance.modelInferenceTime <= 1000 &&
    performance.responseGenerationTime <= 500
  )
}

// Build performance validation
export const validateBuildPerformance = (performance: BuildPerformance): boolean => {
  return (
    performance.buildTime > 0 &&
    performance.cacheHitRate >= 80
  )
}

// System performance validation
export const validateSystemPerformance = (performance: SystemPerformance): boolean => {
  return (
    performance.uptime >= 99.9 &&
    performance.memoryUsage <= 80 &&
    performance.cpuUsage <= 70 &&
    performance.diskUsage <= 80
  )
}

// Database operations
export const createPerformanceMetrics = async (
  supabase: any,
  metrics: Omit<PerformanceMetrics, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PerformanceMetrics> => {
  const now = new Date()
  const newMetrics = {
    ...metrics,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }

  const { data, error } = await supabase
    .from('performance_metrics')
    .insert(newMetrics)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create performance metrics: ${error.message}`)
  }

  return validatePerformanceMetrics(data)
}

export const getPerformanceMetrics = async (
  supabase: any,
  environment: string
): Promise<PerformanceMetrics | null> => {
  const { data, error } = await supabase
    .from('performance_metrics')
    .select('*')
    .eq('environment', environment)
    .order('createdAt', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to get performance metrics: ${error.message}`)
  }

  return validatePerformanceMetrics(data)
}

export const updatePerformanceMetrics = async (
  supabase: any,
  id: string,
  update: PerformanceMetricsUpdate
): Promise<PerformanceMetrics> => {
  const now = new Date()
  const updatedMetrics = {
    ...update,
    updatedAt: now,
  }

  const { data, error } = await supabase
    .from('performance_metrics')
    .update(updatedMetrics)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update performance metrics: ${error.message}`)
  }

  return validatePerformanceMetrics(data)
}

export const deletePerformanceMetrics = async (
  supabase: any,
  id: string
): Promise<void> => {
  const { error } = await supabase
    .from('performance_metrics')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete performance metrics: ${error.message}`)
  }
}

// Performance tracking
export const trackEdgePerformance = async (
  supabase: any,
  metricsId: string,
  performance: EdgePerformance
): Promise<void> => {
  const { error } = await supabase
    .from('edge_performance_logs')
    .insert({
      metrics_id: metricsId,
      ttfb: performance.ttfb,
      cache_hit_rate: performance.cacheHitRate,
      cold_start_frequency: performance.coldStartFrequency,
      region_latency: performance.regionLatency,
      timestamp: performance.timestamp,
    })

  if (error) {
    throw new Error(`Failed to track edge performance: ${error.message}`)
  }
}

export const trackRealtimePerformance = async (
  supabase: any,
  metricsId: string,
  performance: RealtimePerformance
): Promise<void> => {
  const { error } = await supabase
    .from('realtime_performance_logs')
    .insert({
      metrics_id: metricsId,
      ui_patch_time: performance.uiPatchTime,
      connection_latency: performance.connectionLatency,
      message_delivery_time: performance.messageDeliveryTime,
      subscription_setup_time: performance.subscriptionSetupTime,
      timestamp: performance.timestamp,
    })

  if (error) {
    throw new Error(`Failed to track realtime performance: ${error.message}`)
  }
}

export const trackAIPerformance = async (
  supabase: any,
  metricsId: string,
  performance: AIPerformance
): Promise<void> => {
  const { error } = await supabase
    .from('ai_performance_logs')
    .insert({
      metrics_id: metricsId,
      copilot_tool_roundtrip: performance.copilotToolRoundtrip,
      model_inference_time: performance.modelInferenceTime,
      response_generation_time: performance.responseGenerationTime,
      timestamp: performance.timestamp,
    })

  if (error) {
    throw new Error(`Failed to track AI performance: ${error.message}`)
  }
}

export const trackBuildPerformance = async (
  supabase: any,
  metricsId: string,
  performance: BuildPerformance
): Promise<void> => {
  const { error } = await supabase
    .from('build_performance_logs')
    .insert({
      metrics_id: metricsId,
      build_time: performance.buildTime,
      install_time: performance.installTime,
      bundle_size: performance.bundleSize,
      cache_hit_rate: performance.cacheHitRate,
      timestamp: performance.timestamp,
    })

  if (error) {
    throw new Error(`Failed to track build performance: ${error.message}`)
  }
}

  metrics: PerformanceMetrics,
  updates: Partial<PerformanceMetrics>
): PerformanceMetrics => {
  // Ensure we get a fresh timestamp that's always different
  const now = new Date()
  // Add milliseconds to ensure uniqueness if timestamps are the same
  now.setMilliseconds(now.getMilliseconds() + 1)

  return validatePerformanceMetrics({
    ...metrics,
    ...updates,
    metadata: {
      ...metrics.metadata,
      updated_at: now.toISOString(),
      updated_by: updates.metadata?.updated_by || metrics.metadata.updated_by,
      ...updates.metadata
    }
  })
}

// Metric recording
export const recordMetric = (
  metrics: PerformanceMetrics,
  metricType: MetricTypeType,
  value: number,
  unit: MetricUnitType,
  options: {
    region?: string
    metadata?: Record<string, unknown>
  } = {}
): PerformanceMetrics => {
  const newEntry = {
    timestamp: new Date().toISOString(),
    metric_type: metricType,
    value,
    unit,
    region: options.region,
    metadata: options.metadata
  }

  return updatePerformanceMetrics(metrics, {
    history: [...metrics.history, newEntry]
  })
}

// Performance validation
export const validateTTFBTarget = (metrics: PerformanceMetrics): boolean => {
  return metrics.edge.metrics.ttfb.current <= metrics.edge.metrics.ttfb.target
}

export const validateColdStartTarget = (metrics: PerformanceMetrics): boolean => {
  return metrics.edge.metrics.cold_start.current <= metrics.edge.metrics.cold_start.target
}

export const validateBunPerformance = (metrics: PerformanceMetrics): boolean => {
  const { build_time, install_time, memory_usage } = metrics.bun.metrics

  return build_time.current <= build_time.target &&
         install_time.current <= install_time.target &&
         memory_usage.current <= memory_usage.target
}

export const validateHealthcarePerformance = (metrics: PerformanceMetrics): boolean => {
  const { lgpd, anvisa, cfm } = metrics.healthcare.compliance

  return lgpd.data_access_time.current <= lgpd.data_access_time.target &&
         lgpd.audit_log_time.current <= lgpd.audit_log_time.target &&
         anvisa.validation_time.current <= anvisa.validation_time.target &&
         cfm.medical_record_access_time.current <= cfm.medical_record_access_time.target
}

// Performance analysis
export const getPerformanceSummary = (metrics: PerformanceMetrics) => {
  return {
    edge: {
      ttfb_status: validateTTFBTarget(metrics) ? 'on_target' : 'needs_improvement',
      ttfb_improvement: ((metrics.edge.metrics.ttfb.baseline - metrics.edge.metrics.ttfb.current) / metrics.edge.metrics.ttfb.baseline) * 100,
      cold_start_status: validateColdStartTarget(metrics) ? 'on_target' : 'needs_improvement',
      cache_hit_rate_status: metrics.edge.metrics.cache_hit_rate.current >= metrics.edge.metrics.cache_hit_rate.target ? 'on_target' : 'needs_improvement'
    },
    bun: {
      status: validateBunPerformance(metrics) ? 'on_target' : 'needs_improvement',
      build_improvement: metrics.bun.metrics.build_time.improvement_percentage,
      install_improvement: metrics.bun.metrics.install_time.improvement_percentage,
      memory_reduction: metrics.bun.metrics.memory_usage.reduction_percentage
    },
    healthcare: {
      status: validateHealthcarePerformance(metrics) ? 'compliant' : 'non_compliant',
      lgpd_compliant: metrics.healthcare.compliance.lgpd.data_access_time.current <= metrics.healthcare.compliance.lgpd.data_access_time.target,
      anvisa_compliant: metrics.healthcare.compliance.anvisa.validation_time.current <= metrics.healthcare.compliance.anvisa.validation_time.target,
      cfm_compliant: metrics.healthcare.compliance.cfm.medical_record_access_time.current <= metrics.healthcare.compliance.cfm.medical_record_access_time.target
    }
  }
}

// Alert checking
export const checkAlerts = (metrics: PerformanceMetrics) => {
  const alerts: string[] = []
  const { alert_thresholds } = metrics.monitoring

  if (metrics.edge.metrics.ttfb.current > alert_thresholds.ttfb) {
    alerts.push(`TTFB (${metrics.edge.metrics.ttfb.current}ms) exceeds threshold (${alert_thresholds.ttfb}ms)`)
  }

  if (metrics.edge.metrics.cold_start.current > alert_thresholds.cold_start) {
    alerts.push(`Cold start (${metrics.edge.metrics.cold_start.current}ms) exceeds threshold (${alert_thresholds.cold_start}ms)`)
  }

  if (metrics.application.metrics.memory_usage.current > alert_thresholds.memory_usage) {
    alerts.push(`Memory usage (${metrics.application.metrics.memory_usage.current}MB) exceeds threshold (${alert_thresholds.memory_usage}MB)`)
  }

  if (metrics.application.metrics.cpu_usage.current > alert_thresholds.cpu_usage) {
    alerts.push(`CPU usage (${metrics.application.metrics.cpu_usage.current}%) exceeds threshold (${alert_thresholds.cpu_usage}%)`)
  }

  return alerts
}

// History cleanup
export const cleanupHistory = (metrics: PerformanceMetrics, retentionDays: number = 30): PerformanceMetrics => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  const filteredHistory = metrics.history.filter(entry =>
    new Date(entry.timestamp) >= cutoffDate
  )

  return updatePerformanceMetrics(metrics, {
    history: filteredHistory
  })
}

// Regional performance analysis
export const getRegionalPerformance = (metrics: PerformanceMetrics, region: string) => {
  const regionalHistory = metrics.history.filter(entry => entry.region === region)

  if (regionalHistory.length === 0) {
    return null
  }

  const latestMetrics = regionalHistory.reduce((latest, current) =>
    new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
  )

  return {
    region,
    latest_metrics: latestMetrics,
    data_points: regionalHistory.length,
    average_ttfb: regionalHistory
      .filter(m => m.metric_type === 'ttfb')
      .reduce((sum, m, _, arr) => sum + m.value / arr.length, 0)
  }
}

// Bun optimization recommendations
export const getBunOptimizationRecommendations = (metrics: PerformanceMetrics) => {
  const recommendations: string[] = []

  if (!validateBunPerformance(metrics)) {
    if (metrics.bun.metrics.build_time.current > metrics.bun.metrics.build_time.target) {
      recommendations.push('Consider enabling aggressive build optimization level')
      recommendations.push('Review build configuration for unused dependencies')
    }

    if (metrics.bun.metrics.memory_usage.current > metrics.bun.metrics.memory_usage.target) {
      recommendations.push('Enable memory profiling to identify memory leaks')
      recommendations.push('Optimize bundle size and enable tree shaking')
    }
  }

  if (metrics.bun.optimization_level !== 'aggressive') {
    recommendations.push('Consider upgrading to aggressive optimization level for better performance')
  }

  return recommendations
}

