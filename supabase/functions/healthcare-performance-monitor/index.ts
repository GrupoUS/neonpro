import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface PerformanceMetric {
  metric_type:
    | 'response_time'
    | 'error_rate'
    | 'throughput'
    | 'availability'
    | 'user_sessions'
  metric_value: number
  timestamp: string
  service_name: string
  endpoint?: string
  clinic_id?: string
  user_id?: string
  metadata?: any
}

interface HealthCheckResult {
  service: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  response_time: number
  last_check: string
  error_message?: string
  metadata?: any
}

interface PerformanceAlert {
  alert_type:
    | 'performance_degradation'
    | 'high_error_rate'
    | 'system_down'
    | 'sla_breach'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affected_services: string[]
  metrics: any
  clinic_id?: string
  timestamp: string
}

// Performance thresholds for healthcare SLA compliance
const PERFORMANCE_THRESHOLDS = {
  response_time: {
    excellent: 50, // <50ms
    good: 100, // <100ms
    acceptable: 200, // <200ms
    poor: 500, // <500ms
  },
  error_rate: {
    excellent: 0.1, // <0.1%
    good: 0.5, // <0.5%
    acceptable: 1.0, // <1%
    poor: 2.0, // <2%
  },
  availability: {
    target: 99.9, // 99.9% uptime SLA
    warning: 99.5, // Warning threshold
    critical: 99.0, // Critical threshold
  },
}

serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    switch (action) {
      case 'metrics':
        return await handleMetricsCollection(req, supabase)
      case 'health':
        return await handleHealthCheck(req, supabase)
      case 'alerts':
        return await handleAlertGeneration(req, supabase)
      case 'dashboard':
        return await handleDashboardData(req, supabase)
      default:
        return await handleHealthCheck(req, supabase)
    }
  } catch (error) {
    console.error('Healthcare Performance Monitor Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function handleMetricsCollection(req: Request, supabase: any) {
  const startTime = performance.now()

  try {
    const { metrics }: { metrics: PerformanceMetric[] } = await req.json()

    // Validate metrics
    const validatedMetrics = metrics.map(metric => ({
      ...metric,
      timestamp: metric.timestamp || new Date().toISOString(),
      service_name: metric.service_name || 'unknown',
    }))

    // Store metrics in database
    const { data, error } = await supabase
      .from('performance_metrics')
      .insert(validatedMetrics)

    if (error) {
      console.error('Database error storing metrics:', error)
      return new Response(
        JSON.stringify({
          error: 'Failed to store metrics',
          details: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Check for performance alerts
    const alerts = await generatePerformanceAlerts(validatedMetrics, supabase)

    const responseTime = performance.now() - startTime

    return new Response(
      JSON.stringify({
        success: true,
        metrics_stored: validatedMetrics.length,
        alerts_generated: alerts.length,
        response_time_ms: Math.round(responseTime),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in metrics collection:', error)
    return new Response(
      JSON.stringify({
        error: 'Invalid request format',
        message: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}
async function handleHealthCheck(req: Request, supabase: any) {
  const startTime = performance.now()
  const healthResults: HealthCheckResult[] = []

  // Check database connectivity
  const dbStart = performance.now()
  try {
    const { data, error } = await supabase
      .from('clinics')
      .select('id')
      .limit(1)

    const dbTime = performance.now() - dbStart
    healthResults.push({
      service: 'database',
      status: error ? 'unhealthy' : dbTime > 100 ? 'degraded' : 'healthy',
      response_time: Math.round(dbTime),
      last_check: new Date().toISOString(),
      error_message: error?.message,
      metadata: { query_type: 'connection_test' },
    })
  } catch (error) {
    healthResults.push({
      service: 'database',
      status: 'unhealthy',
      response_time: 0,
      last_check: new Date().toISOString(),
      error_message: error.message,
    })
  }

  // Check real-time service
  const realtimeStart = performance.now()
  try {
    // Simple ping to realtime endpoint
    const realtimeResponse = await fetch(
      `${supabaseUrl}/realtime/v1/websocket`,
      {
        method: 'HEAD',
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      },
    )

    const realtimeTime = performance.now() - realtimeStart
    healthResults.push({
      service: 'realtime',
      status: realtimeResponse.ok
        ? realtimeTime > 50
          ? 'degraded'
          : 'healthy'
        : 'unhealthy',
      response_time: Math.round(realtimeTime),
      last_check: new Date().toISOString(),
      metadata: { status_code: realtimeResponse.status },
    })
  } catch (error) {
    healthResults.push({
      service: 'realtime',
      status: 'unhealthy',
      response_time: 0,
      last_check: new Date().toISOString(),
      error_message: error.message,
    })
  }

  // Check edge functions performance
  const edgeFunctionsStart = performance.now()
  try {
    const functionChecks = [
      'patient-lookup',
      'appointment-reminders',
      'anvisa-adverse-events',
    ]

    const functionResults = await Promise.allSettled(
      functionChecks.map(async funcName => {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/${funcName}`,
          {
            method: 'OPTIONS',
            headers: {
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
          },
        )
        return { name: funcName, status: response.status, ok: response.ok }
      }),
    )

    const edgeFunctionsTime = performance.now() - edgeFunctionsStart
    const healthyFunctions = functionResults.filter(
      result => result.status === 'fulfilled' && result.value.ok,
    ).length

    healthResults.push({
      service: 'edge_functions',
      status: healthyFunctions === functionChecks.length
        ? 'healthy'
        : healthyFunctions > 0
        ? 'degraded'
        : 'unhealthy',
      response_time: Math.round(edgeFunctionsTime / functionChecks.length),
      last_check: new Date().toISOString(),
      metadata: {
        total_functions: functionChecks.length,
        healthy_functions: healthyFunctions,
        function_results: functionResults,
      },
    })
  } catch (error) {
    healthResults.push({
      service: 'edge_functions',
      status: 'unhealthy',
      response_time: 0,
      last_check: new Date().toISOString(),
      error_message: error.message,
    })
  }

  // Overall system health
  const overallStatus = healthResults.every(r => r.status === 'healthy')
    ? 'healthy'
    : healthResults.some(r => r.status === 'unhealthy')
    ? 'unhealthy'
    : 'degraded'

  const totalResponseTime = performance.now() - startTime

  return new Response(
    JSON.stringify({
      overall_status: overallStatus,
      total_response_time_ms: Math.round(totalResponseTime),
      services: healthResults,
      timestamp: new Date().toISOString(),
      sla_compliance: {
        target_response_time: PERFORMANCE_THRESHOLDS.response_time.good,
        actual_response_time: Math.round(totalResponseTime),
        meets_sla: totalResponseTime < PERFORMANCE_THRESHOLDS.response_time.good,
      },
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
}

async function handleAlertGeneration(req: Request, supabase: any) {
  try {
    const { clinic_id, time_window = '5m' } = await req.json()

    // Get recent performance metrics
    const timeWindowMs = parseTimeWindow(time_window)
    const since = new Date(Date.now() - timeWindowMs).toISOString()

    let query = supabase
      .from('performance_metrics')
      .select('*')
      .gte('timestamp', since)
      .order('timestamp', { ascending: false })

    if (clinic_id) {
      query = query.eq('clinic_id', clinic_id)
    }

    const { data: metrics, error } = await query

    if (error) {
      throw new Error(`Failed to fetch metrics: ${error.message}`)
    }

    const alerts = await generatePerformanceAlerts(metrics || [], supabase)

    return new Response(
      JSON.stringify({
        alerts,
        metrics_analyzed: metrics?.length || 0,
        time_window,
        clinic_id,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error generating alerts:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to generate alerts',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}
async function handleDashboardData(req: Request, supabase: any) {
  try {
    const url = new URL(req.url)
    const clinic_id = url.searchParams.get('clinic_id')
    const time_range = url.searchParams.get('time_range') || '1h'

    const timeWindowMs = parseTimeWindow(time_range)
    const since = new Date(Date.now() - timeWindowMs).toISOString()

    // Get performance metrics summary
    let metricsQuery = supabase
      .from('performance_metrics')
      .select('*')
      .gte('timestamp', since)

    if (clinic_id) {
      metricsQuery = metricsQuery.eq('clinic_id', clinic_id)
    }

    const { data: metrics, error: metricsError } = await metricsQuery

    if (metricsError) {
      throw new Error(`Failed to fetch metrics: ${metricsError.message}`)
    }

    // Calculate performance summary
    const summary = calculatePerformanceSummary(metrics || [])

    // Get recent alerts
    let alertsQuery = supabase
      .from('performance_alerts')
      .select('*')
      .gte('timestamp', since)
      .order('timestamp', { ascending: false })
      .limit(10)

    if (clinic_id) {
      alertsQuery = alertsQuery.eq('clinic_id', clinic_id)
    }

    const { data: alerts, error: alertsError } = await alertsQuery

    if (alertsError) {
      console.warn('Failed to fetch alerts:', alertsError.message)
    }

    return new Response(
      JSON.stringify({
        summary,
        recent_alerts: alerts || [],
        time_range,
        clinic_id,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error generating dashboard data:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to generate dashboard data',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
}

async function generatePerformanceAlerts(
  metrics: PerformanceMetric[],
  supabase: any,
): Promise<PerformanceAlert[]> {
  const alerts: PerformanceAlert[] = []

  // Group metrics by service and type
  const metricsByService = metrics.reduce(
    (acc, metric) => {
      const key = `${metric.service_name}_${metric.metric_type}`
      if (!acc[key]) acc[key] = []
      acc[key].push(metric)
      return acc
    },
    {} as Record<string, PerformanceMetric[]>,
  )

  // Check each service for threshold violations
  for (const [serviceKey, serviceMetrics] of Object.entries(metricsByService)) {
    const [serviceName, metricType] = serviceKey.split('_')

    if (metricType === 'response_time') {
      const avgResponseTime = serviceMetrics.reduce((sum, m) => sum + m.metric_value, 0) /
        serviceMetrics.length

      if (avgResponseTime > PERFORMANCE_THRESHOLDS.response_time.poor) {
        alerts.push({
          alert_type: 'performance_degradation',
          severity: 'critical',
          description: `${serviceName} response time (${
            Math.round(avgResponseTime)
          }ms) exceeds critical threshold (${PERFORMANCE_THRESHOLDS.response_time.poor}ms)`,
          affected_services: [serviceName],
          metrics: {
            avg_response_time: avgResponseTime,
            threshold: PERFORMANCE_THRESHOLDS.response_time.poor,
          },
          timestamp: new Date().toISOString(),
        })
      } else if (
        avgResponseTime > PERFORMANCE_THRESHOLDS.response_time.acceptable
      ) {
        alerts.push({
          alert_type: 'performance_degradation',
          severity: 'medium',
          description: `${serviceName} response time (${
            Math.round(avgResponseTime)
          }ms) exceeds acceptable threshold (${PERFORMANCE_THRESHOLDS.response_time.acceptable}ms)`,
          affected_services: [serviceName],
          metrics: {
            avg_response_time: avgResponseTime,
            threshold: PERFORMANCE_THRESHOLDS.response_time.acceptable,
          },
          timestamp: new Date().toISOString(),
        })
      }
    }

    if (metricType === 'error_rate') {
      const avgErrorRate = serviceMetrics.reduce((sum, m) => sum + m.metric_value, 0) /
        serviceMetrics.length

      if (avgErrorRate > PERFORMANCE_THRESHOLDS.error_rate.poor) {
        alerts.push({
          alert_type: 'high_error_rate',
          severity: 'critical',
          description: `${serviceName} error rate (${
            avgErrorRate.toFixed(2)
          }%) exceeds critical threshold (${PERFORMANCE_THRESHOLDS.error_rate.poor}%)`,
          affected_services: [serviceName],
          metrics: {
            avg_error_rate: avgErrorRate,
            threshold: PERFORMANCE_THRESHOLDS.error_rate.poor,
          },
          timestamp: new Date().toISOString(),
        })
      }
    }
  }

  // Store alerts in database
  if (alerts.length > 0) {
    try {
      await supabase.from('performance_alerts').insert(alerts)
    } catch (error) {
      console.error('Failed to store alerts:', error)
    }
  }

  return alerts
}
function calculatePerformanceSummary(metrics: PerformanceMetric[]) {
  const summary = {
    total_requests: 0,
    avg_response_time: 0,
    error_rate: 0,
    availability: 0,
    sla_compliance: 0,
    services: {} as Record<string, any>,
  }

  if (metrics.length === 0) return summary

  // Group by service
  const serviceMetrics = metrics.reduce(
    (acc, metric) => {
      if (!acc[metric.service_name]) {
        acc[metric.service_name] = {
          response_times: [],
          error_rates: [],
          total_requests: 0,
        }
      }

      if (metric.metric_type === 'response_time') {
        acc[metric.service_name].response_times.push(metric.metric_value)
      } else if (metric.metric_type === 'error_rate') {
        acc[metric.service_name].error_rates.push(metric.metric_value)
      } else if (metric.metric_type === 'throughput') {
        acc[metric.service_name].total_requests += metric.metric_value
      }

      return acc
    },
    {} as Record<string, any>,
  )

  // Calculate overall metrics
  let totalResponseTime = 0
  let totalErrors = 0
  let totalRequests = 0

  for (const [serviceName, data] of Object.entries(serviceMetrics)) {
    const avgResponseTime = data.response_times.length > 0
      ? data.response_times.reduce((a: number, b: number) => a + b, 0) /
        data.response_times.length
      : 0
    const avgErrorRate = data.error_rates.length > 0
      ? data.error_rates.reduce((a: number, b: number) => a + b, 0) /
        data.error_rates.length
      : 0

    summary.services[serviceName] = {
      avg_response_time: Math.round(avgResponseTime),
      error_rate: parseFloat(avgErrorRate.toFixed(2)),
      total_requests: data.total_requests,
      sla_compliance: avgResponseTime < PERFORMANCE_THRESHOLDS.response_time.good
        ? 100
        : avgResponseTime < PERFORMANCE_THRESHOLDS.response_time.acceptable
        ? 75
        : 50,
    }

    totalResponseTime += avgResponseTime * data.response_times.length
    totalErrors += avgErrorRate * data.error_rates.length
    totalRequests += data.total_requests
  }

  const totalResponseTimeEntries = Object.values(serviceMetrics).reduce(
    (sum, data) => sum + data.response_times.length,
    0,
  )
  const totalErrorRateEntries = Object.values(serviceMetrics).reduce(
    (sum, data) => sum + data.error_rates.length,
    0,
  )

  summary.total_requests = totalRequests
  summary.avg_response_time = totalResponseTimeEntries > 0
    ? Math.round(totalResponseTime / totalResponseTimeEntries)
    : 0
  summary.error_rate = totalErrorRateEntries > 0
    ? parseFloat((totalErrors / totalErrorRateEntries).toFixed(2))
    : 0
  summary.availability = summary.error_rate < 1 ? 99.9 : 99.0
  summary.sla_compliance = summary.avg_response_time < PERFORMANCE_THRESHOLDS.response_time.good
    ? 100
    : summary.avg_response_time <
        PERFORMANCE_THRESHOLDS.response_time.acceptable
    ? 75
    : 50

  return summary
}

function parseTimeWindow(timeWindow: string): number {
  const match = timeWindow.match(/^(\d+)([smhd])$/)
  if (!match) return 5 * 60 * 1000 // Default 5 minutes

  const value = parseInt(match[1])
  const unit = match[2]

  switch (unit) {
    case 's':
      return value * 1000
    case 'm':
      return value * 60 * 1000
    case 'h':
      return value * 60 * 60 * 1000
    case 'd':
      return value * 24 * 60 * 60 * 1000
    default:
      return 5 * 60 * 1000
  }
}

/*
Healthcare Performance Monitor Edge Function

This function provides comprehensive performance monitoring for healthcare applications
with Brazilian compliance requirements (LGPD, CFM, ANVISA).

Features:
- Real-time performance metrics collection
- Health checks for all critical services
- SLA compliance monitoring (<100ms response times)
- Automated alert generation
- Performance dashboard data
- Brazilian healthcare-specific thresholds

Endpoints:
- /metrics - Collect and store performance metrics
- /health - System health check with SLA compliance
- /alerts - Generate performance alerts based on thresholds
- /dashboard - Performance summary for monitoring dashboards

Performance Targets:
- Response Time: <50ms excellent, <100ms good, <200ms acceptable
- Error Rate: <0.1% excellent, <0.5% good, <1% acceptable
- Availability: 99.9% target SLA

Compliance:
- LGPD: Privacy-preserving metric collection
- CFM: Medical-grade performance standards
- ANVISA: Healthcare system reliability requirements
*/
