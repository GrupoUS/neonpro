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


// Performance validation functions (return boolean)
export const checkEdgePerformance = (performance: EdgePerformance): boolean => {
  return (
    performance.ttfb <= 150 &&
    performance.cacheHitRate >= 80 &&
    performance.coldStartFrequency <= 5
  )
}

export const checkRealtimePerformance = (performance: RealtimePerformance): boolean => {
  return (
    performance.uiPatchTime <= 1.5 &&
    performance.connectionLatency <= 200 &&
    performance.messageDeliveryTime <= 100
  )
}

export const checkAIPerformance = (performance: AIPerformance): boolean => {
  return (
    performance.copilotToolRoundtrip <= 2 &&
    performance.modelInferenceTime <= 1000 &&
    performance.responseGenerationTime <= 500
  )
}

export const checkBuildPerformance = (performance: BuildPerformance): boolean => {
  return (
    performance.buildTime > 0 &&
    performance.cacheHitRate >= 80
  )
}

export const checkSystemPerformance = (performance: SystemPerformance): boolean => {
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

export const trackSystemPerformance = async (
  supabase: any,
  metricsId: string,
  performance: SystemPerformance
): Promise<void> => {
  const { error } = await supabase
    .from('system_performance_logs')
    .insert({
      metrics_id: metricsId,
      uptime: performance.uptime,
      memory_usage: performance.memoryUsage,
      cpu_usage: performance.cpuUsage,
      disk_usage: performance.diskUsage,
      timestamp: performance.timestamp,
    })

  if (error) {
    throw new Error(`Failed to track system performance: ${error.message}`)
  }
}

// Get performance history
export const getPerformanceHistory = async (
  supabase: any,
  metricsId: string,
  limit: number = 10
): Promise<PerformanceMetrics[]> => {
  const { data, error } = await supabase
    .from('performance_metrics')
    .select('*')
    .eq('id', metricsId)
    .order('createdAt', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to get performance history: ${error.message}`)
  }

  return data.map((metrics: any) => validatePerformanceMetrics(metrics))
}

// Compare performance with baseline
export const comparePerformanceWithBaseline = async (
  supabase: any,
  metricsId: string,
  currentMetrics: PerformanceMetrics
): Promise<{
  edgeTTFBImprovement: number
  realtimeUIPatchImprovement: number
  aiCopilotToolRoundtripImprovement: number
  buildTimeImprovement: number
  uptimeImprovement: number
}> => {
  // Get baseline metrics (first recorded metrics)
  const history = await getPerformanceHistory(supabase, metricsId, 1)

  if (history.length === 0) {
    return {
      edgeTTFBImprovement: 0,
      realtimeUIPatchImprovement: 0,
      aiCopilotToolRoundtripImprovement: 0,
      buildTimeImprovement: 0,
      uptimeImprovement: 0,
    }
  }

  const baseline = history[0]

  // Calculate improvements
  const edgeTTFBImprovement = baseline?.edgePerformance?.ttfb && baseline.edgePerformance.ttfb > 0
    ? ((baseline.edgePerformance.ttfb - currentMetrics.edgePerformance.ttfb) / baseline.edgePerformance.ttfb) * 100
    : 0

  const realtimeUIPatchImprovement = baseline?.realtimePerformance?.uiPatchTime && baseline.realtimePerformance.uiPatchTime > 0
    ? ((baseline.realtimePerformance.uiPatchTime - currentMetrics.realtimePerformance.uiPatchTime) / baseline.realtimePerformance.uiPatchTime) * 100
    : 0

  const aiCopilotToolRoundtripImprovement = baseline?.aiPerformance?.copilotToolRoundtrip && baseline.aiPerformance.copilotToolRoundtrip > 0
    ? ((baseline.aiPerformance.copilotToolRoundtrip - currentMetrics.aiPerformance.copilotToolRoundtrip) / baseline.aiPerformance.copilotToolRoundtrip) * 100
    : 0

  const buildTimeImprovement = baseline?.buildPerformance?.buildTime && baseline.buildPerformance.buildTime > 0
    ? ((baseline.buildPerformance.buildTime - currentMetrics.buildPerformance.buildTime) / baseline.buildPerformance.buildTime) * 100
    : 0

  const uptimeImprovement = currentMetrics.systemPerformance.uptime - (baseline?.systemPerformance?.uptime || 0)

  return {
    edgeTTFBImprovement,
    realtimeUIPatchImprovement,
    aiCopilotToolRoundtripImprovement,
    buildTimeImprovement,
    uptimeImprovement,
  }
}
