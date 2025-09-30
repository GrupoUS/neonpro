/**
 * Performance Metrics Model
 *
 * This model defines the performance metrics for the NeonPro platform,
 * specifically tracking edge TTFB (Time To First Byte) and Bun optimization metrics.
 *
 * Key features:
 * - Edge performance tracking
 * - TTFB monitoring
 * - Bun optimization metrics
 * - Healthcare compliance performance
 * - Real-time monitoring
 */

import { z } from 'zod'

// Performance metric type enumeration
export const MetricType = z.enum([
  'ttfb',
  'cold_start',
  'warm_start',
  'build_time',
  'install_time',
  'test_time',
  'memory_usage',
  'cpu_usage',
  'disk_usage',
  'network_latency',
  'database_query_time',
  'api_response_time'
])

export type MetricTypeType = z.infer<typeof MetricType>

// Performance unit enumeration
export const MetricUnit = z.enum([
  'milliseconds',
  'seconds',
  'bytes',
  'kilobytes',
  'megabytes',
  'percentage',
  'count',
  'requests_per_second'
])

export type MetricUnitType = z.infer<typeof MetricUnit>

// Base performance metrics schema
export const PerformanceMetricsSchema = z.object({
  // Basic configuration
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string().min(1),
  environment: z.enum(['development', 'staging', 'production']),

  // Edge performance metrics
  edge: z.object({
    enabled: z.boolean(),
    provider: z.enum(['vercel', 'cloudflare', 'aws', 'azure']),
    regions: z.array(z.string()),
    metrics: z.object({
      ttfb: z.object({
        current: z.number().min(0), // milliseconds
        baseline: z.number().min(0), // milliseconds
        target: z.number().min(0), // milliseconds
        percentile_50: z.number().min(0),
        percentile_95: z.number().min(0),
        percentile_99: z.number().min(0)
      }),
      cold_start: z.object({
        current: z.number().min(0), // milliseconds
        baseline: z.number().min(0), // milliseconds
        target: z.number().min(0), // milliseconds
        frequency: z.number().min(0).max(1) // percentage
      }),
      warm_start: z.object({
        current: z.number().min(0), // milliseconds
        baseline: z.number().min(0), // milliseconds
        target: z.number().min(0) // milliseconds
      }),
      cache_hit_rate: z.object({
        current: z.number().min(0).max(1),
        target: z.number().min(0).max(1)
      })
    })
  }),

  // Bun performance metrics
  bun: z.object({
    enabled: z.boolean(),
    version: z.string(),
    optimization_level: z.enum(['basic', 'standard', 'aggressive']),
    metrics: z.object({
      build_time: z.object({
        current: z.number().min(0), // seconds
        baseline: z.number().min(0), // seconds
        target: z.number().min(0), // seconds
        improvement_percentage: z.number()
      }),
      install_time: z.object({
        current: z.number().min(0), // seconds
        baseline: z.number().min(0), // seconds
        target: z.number().min(0), // seconds
        improvement_percentage: z.number()
      }),
      memory_usage: z.object({
        current: z.number().min(0), // MB
        baseline: z.number().min(0), // MB
        target: z.number().min(0), // MB
        reduction_percentage: z.number()
      }),
      bundle_size: z.object({
        current: z.number().min(0), // KB
        baseline: z.number().min(0), // KB
        target: z.number().min(0), // KB
        reduction_percentage: z.number()
      })
    })
  }),

  // Application performance metrics
  application: z.object({
    metrics: z.object({
      database_query_time: z.object({
        current: z.number().min(0), // milliseconds
        baseline: z.number().min(0), // milliseconds
        target: z.number().min(0) // milliseconds
      }),
      api_response_time: z.object({
        current: z.number().min(0), // milliseconds
        baseline: z.number().min(0), // milliseconds
        target: z.number().min(0) // milliseconds
      }),
      cpu_usage: z.object({
        current: z.number().min(0).max(100), // percentage
        baseline: z.number().min(0).max(100), // percentage
        target: z.number().min(0).max(100) // percentage
      }),
      memory_usage: z.object({
        current: z.number().min(0), // MB
        baseline: z.number().min(0), // MB
        target: z.number().min(0) // MB
      })
    })
  }),

  // Healthcare compliance performance
  healthcare: z.object({
    compliance: z.object({
      lgpd: z.object({
        data_access_time: z.object({
          current: z.number().min(0), // milliseconds
          target: z.number().min(0) // milliseconds
        }),
        audit_log_time: z.object({
          current: z.number().min(0), // milliseconds
          target: z.number().min(0) // milliseconds
        }),
        encryption_overhead: z.object({
          current: z.number().min(0).max(100), // percentage
          target: z.number().min(0).max(100) // percentage
        })
      }),
      anvisa: z.object({
        validation_time: z.object({
          current: z.number().min(0), // milliseconds
          target: z.number().min(0) // milliseconds
        }),
        documentation_time: z.object({
          current: z.number().min(0), // milliseconds
          target: z.number().min(0) // milliseconds
        })
      }),
      cfm: z.object({
        medical_record_access_time: z.object({
          current: z.number().min(0), // milliseconds
          target: z.number().min(0) // milliseconds
        }),
        audit_trail_time: z.object({
          current: z.number().min(0), // milliseconds
          target: z.number().min(0) // milliseconds
        })
      })
    })
  }),

  // Monitoring configuration
  monitoring: z.object({
    enabled: z.boolean(),
    interval: z.number().min(1), // seconds
    retention_period: z.number().min(0), // days
    alert_thresholds: z.object({
      ttfb: z.number().min(0), // milliseconds
      cold_start: z.number().min(0), // milliseconds
      memory_usage: z.number().min(0), // MB
      cpu_usage: z.number().min(0).max(100), // percentage
      error_rate: z.number().min(0).max(1) // percentage
    }),
    notifications: z.object({
      email: z.boolean(),
      slack: z.boolean(),
      pagerduty: z.boolean()
    })
  }),

  // Historical data
  history: z.array(z.object({
    timestamp: z.string().datetime(),
    metric_type: MetricType,
    value: z.number(),
    unit: MetricUnit,
    region: z.string().optional(),
    metadata: z.record(z.unknown()).optional()
  })),

  // Metadata
  metadata: z.object({
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    created_by: z.string(),
    updated_by: z.string().optional(),
    tags: z.array(z.string()),
    notes: z.string().optional()
  })
})

// Export types
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>

// Default configuration values
export const DEFAULT_PERFORMANCE_METRICS: Partial<PerformanceMetrics> = {
  environment: 'development',
  edge: {
    enabled: true,
    provider: 'vercel',
    regions: ['gru1', 'gso1', 'cpt1'],
    metrics: {
      ttfb: {
        current: 150,
        baseline: 200,
        target: 100,
        percentile_50: 120,
        percentile_95: 180,
        percentile_99: 250
      },
      cold_start: {
        current: 800,
        baseline: 1200,
        target: 500,
        frequency: 0.1
      },
      warm_start: {
        current: 50,
        baseline: 100,
        target: 30
      },
      cache_hit_rate: {
        current: 0.85,
        target: 0.9
      }
    }
  },
  bun: {
    enabled: true,
    version: '>=1.1.0',
    optimization_level: 'standard',
    metrics: {
      build_time: {
        current: 30,
        baseline: 120,
        target: 30,
        improvement_percentage: 75
      },
      install_time: {
        current: 45,
        baseline: 180,
        target: 45,
        improvement_percentage: 75
      },
      memory_usage: {
        current: 800,
        baseline: 1024,
        target: 800,
        reduction_percentage: 22
      },
      bundle_size: {
        current: 450,
        baseline: 500,
        target: 450,
        reduction_percentage: 10
      }
    }
  },
  application: {
    metrics: {
      database_query_time: {
        current: 50,
        baseline: 80,
        target: 50
      },
      api_response_time: {
        current: 100,
        baseline: 150,
        target: 100
      },
      cpu_usage: {
        current: 40,
        baseline: 50,
        target: 40
      },
      memory_usage: {
        current: 512,
        baseline: 768,
        target: 512
      }
    }
  },
  healthcare: {
    compliance: {
      lgpd: {
        data_access_time: {
          current: 25,
          target: 30
        },
        audit_log_time: {
          current: 15,
          target: 20
        },
        encryption_overhead: {
          current: 5,
          target: 10
        }
      },
      anvisa: {
        validation_time: {
          current: 100,
          target: 150
        },
        documentation_time: {
          current: 50,
          target: 75
        }
      },
      cfm: {
        medical_record_access_time: {
          current: 30,
          target: 40
        },
        audit_trail_time: {
          current: 20,
          target: 25
        }
      }
    }
  },
  monitoring: {
    enabled: true,
    interval: 60, // 1 minute
    retention_period: 30, // 30 days
    alert_thresholds: {
      ttfb: 200,
      cold_start: 1000,
      memory_usage: 1024,
      cpu_usage: 80,
      error_rate: 0.05
    },
    notifications: {
      email: true,
      slack: true,
      pagerduty: false
    }
  },
  history: []
}

// Validation functions
export const validatePerformanceMetrics = (metrics: unknown): PerformanceMetrics => {
  return PerformanceMetricsSchema.parse(metrics)
}

export const isValidPerformanceMetrics = (metrics: unknown): boolean => {
  return PerformanceMetricsSchema.safeParse(metrics).success
}

// Utility functions
export const createPerformanceMetrics = (overrides: Partial<PerformanceMetrics> = {}): PerformanceMetrics => {
  const now = new Date().toISOString()

  return validatePerformanceMetrics({
    id: crypto.randomUUID(),
    name: 'NeonPro Performance Metrics',
    description: 'NeonPro platform performance metrics with edge TTFB tracking',
    version: '1.0.0',
    environment: 'development',
    ...DEFAULT_PERFORMANCE_METRICS,
    ...overrides,
    metadata: {
      created_at: now,
      updated_at: now,
      created_by: 'system',
      tags: ['performance', 'edge', 'ttfb', 'bun', 'healthcare'],
      ...overrides.metadata
    }
  })
}

export const updatePerformanceMetrics = (
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

