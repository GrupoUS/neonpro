#!/usr/bin/env bun
/**
 * Edge Routes TTFB Benchmark Script
 *
 * This script benchmarks all Edge routes for Phase 2 of the NeonPro architecture migration.
 * It runs 100 concurrent requests to each route, measures TTFB, calculates P95, and logs
 * results to the performance_metrics table.
 *
 * Target: TTFB <150ms P95 for all routes
 * Routes: GET /architecture/config, GET /performance/metrics, GET /compliance/status,
 *         GET /migration/state, POST /migration/start (forward), GET /package-manager/config,
 *         GET /health, GET /realtime/status
 */

import { createClient } from '@supabase/supabase-js'
import { performance } from 'perf_hooks'

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001'
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key'
const CONCURRENT_REQUESTS = 100
const TTFB_TARGET_MS = 150

// Test JWT token (replace with valid token from your test environment)
const TEST_JWT_TOKEN = process.env.TEST_JWT_TOKEN || 'test-jwt-token'

// Edge routes to benchmark
const EDGE_ROUTES = [
  { method: 'GET', path: '/architecture/config' },
  { method: 'GET', path: '/performance/metrics' },
  { method: 'GET', path: '/compliance/status' },
  { method: 'GET', path: '/migration/state' },
  { method: 'POST', path: '/migration/start', body: { migrationId: '123e4567-e89b-12d3-a456-426614174000', options: { dry_run: true } } },
  { method: 'GET', path: '/package-manager/config' },
  { method: 'GET', path: '/health' },
  { method: 'GET', path: '/realtime/status' }
]

interface BenchmarkResult {
  route: string
  method: string
  timings: number[]
  p50: number
  p95: number
  p99: number
  mean: number
  min: number
  max: number
  successRate: number
  errors: string[]
}

interface PerformanceMetric {
  metric_name: string
  metric_value: number
  clinic_id: string
  additional_metadata?: Record<string, any>
}

/**
 * Calculate percentile from array of numbers
 */
function calculatePercentile(numbers: number[], percentile: number): number {
  const sorted = numbers.slice().sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[index] || 0
}

/**
 * Make a single HTTP request and measure TTFB
 */
async function measureTTFB(route: typeof EDGE_ROUTES[0]): Promise<{ timing: number; success: boolean; error?: string }> {
  const startTime = performance.now()

  try {
    const response = await fetch(`${API_BASE_URL}${route.path}`, {
      method: route.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_JWT_TOKEN}`
      },
      body: route.method === 'POST' ? JSON.stringify(route.body) : undefined
    })

    const endTime = performance.now()
    const ttfb = endTime - startTime

    if (!response.ok) {
      return {
        timing: ttfb,
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }

    return { timing: ttfb, success: true }
  } catch (error) {
    const endTime = performance.now()
    const ttfb = endTime - startTime

    return {
      timing: ttfb,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Run concurrent requests for a single route
 */
async function benchmarkRoute(route: typeof EDGE_ROUTES[0]): Promise<BenchmarkResult> {
  console.log(`\n🔍 Benchmarking ${route.method} ${route.path}...`)

  const promises = Array.from({ length: CONCURRENT_REQUESTS }, () => measureTTFB(route))
  const results = await Promise.all(promises)

  const timings = results.filter(r => r.success).map(r => r.timing)
  const errors = results.filter(r => !r.success).map(r => r.error || 'Unknown error')

  if (timings.length === 0) {
    console.error(`❌ All requests failed for ${route.method} ${route.path}`)
    return {
      route: route.path,
      method: route.method,
      timings: [],
      p50: 0,
      p95: 0,
      p99: 0,
      mean: 0,
      min: 0,
      max: 0,
      successRate: 0,
      errors
    }
  }

  const p50 = calculatePercentile(timings, 50)
  const p95 = calculatePercentile(timings, 95)
  const p99 = calculatePercentile(timings, 99)
  const mean = timings.reduce((sum, t) => sum + t, 0) / timings.length
  const min = Math.min(...timings)
  const max = Math.max(...timings)
  const successRate = (timings.length / CONCURRENT_REQUESTS) * 100

  const result: BenchmarkResult = {
    route: route.path,
    method: route.method,
    timings,
    p50,
    p95,
    p99,
    mean,
    min,
    max,
    successRate,
    errors
  }

  // Print results
  console.log(`📊 Results for ${route.method} ${route.path}:`)
  console.log(`   Success Rate: ${successRate.toFixed(1)}%`)
  console.log(`   P50: ${p50.toFixed(2)}ms`)
  console.log(`   P95: ${p95.toFixed(2)}ms ${p95 < TTFB_TARGET_MS ? '✅' : '❌'}`)
  console.log(`   P99: ${p99.toFixed(2)}ms`)
  console.log(`   Mean: ${mean.toFixed(2)}ms`)
  console.log(`   Min: ${min.toFixed(2)}ms`)
  console.log(`   Max: ${max.toFixed(2)}ms`)

  if (errors.length > 0) {
    console.log(`   Errors: ${errors.length}`)
    console.log(`   Sample errors: ${errors.slice(0, 3).join(', ')}`)
  }

  return result
}

/**
 * Log benchmark results to performance_metrics table
 */
async function logResultsToDatabase(results: BenchmarkResult[]): Promise<void> {
  console.log('\n💾 Logging results to performance_metrics table...')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const metrics: PerformanceMetric[] = results.map(result => ({
    metric_name: 'ttfb_benchmark',
    metric_value: result.p95,
    clinic_id: 'benchmark-clinic', // Use a special clinic ID for benchmarks
    additional_metadata: {
      route: result.route,
      method: result.method,
      p50: result.p50,
      p95: result.p95,
      p99: result.p99,
      mean: result.mean,
      min: result.min,
      max: result.max,
      successRate: result.successRate,
      errorCount: result.errors.length,
      timestamp: new Date().toISOString()
    }
  }))

  try {
    const { error } = await supabase
      .from('performance_metrics')
      .insert(metrics)

    if (error) {
      console.error('❌ Failed to log results to database:', error)
    } else {
      console.log(`✅ Successfully logged ${metrics.length} metrics to database`)
    }
  } catch (error) {
    console.error('❌ Database error:', error)
  }
}

/**
 * Generate benchmark report
 */
function generateReport(results: BenchmarkResult[]): void {
  console.log('\n📈 BENCHMARK REPORT')
  console.log('==================')

  const allP95 = results.map(r => r.p95).filter(p => p > 0)
  const overallP95 = allP95.length > 0 ? calculatePercentile(allP95, 95) : 0
  const routesUnderTarget = results.filter(r => r.p95 < TTFB_TARGET_MS && r.p95 > 0).length
  const totalRoutes = results.filter(r => r.p95 > 0).length

  console.log(`Target TTFB: <${TTFB_TARGET_MS}ms P95`)
  console.log(`Overall P95: ${overallP95.toFixed(2)}ms ${overallP95 < TTFB_TARGET_MS ? '✅' : '❌'}`)
  console.log(`Routes under target: ${routesUnderTarget}/${totalRoutes}`)
  console.log(`Success rate: ${totalRoutes > 0 ? ((routesUnderTarget / totalRoutes) * 100).toFixed(1) : 0}%`)

  console.log('\n📋 Route Details:')
  results.forEach(result => {
    if (result.p95 > 0) {
      const status = result.p95 < TTFB_TARGET_MS ? '✅' : '❌'
      console.log(`   ${status} ${result.method} ${result.route}: ${result.p95.toFixed(2)}ms P95`)
    } else {
      console.log(`   ❌ ${result.method} ${result.route}: FAILED`)
    }
  })

  // Check for regressions (comparison with Phase 1 would go here if data available)
  console.log('\n🔍 Phase 1 Comparison:')
  console.log('   (Phase 1 data not available - establishing baseline)')
  console.log(`   Baseline P95: ${overallP95.toFixed(2)}ms`)
  console.log('   Target improvement: 3-5x speed')

  // Recommendations
  console.log('\n💡 Recommendations:')
  results.forEach(result => {
    if (result.p95 > TTFB_TARGET_MS) {
      console.log(`   • Optimize ${result.method} ${result.route} (${result.p95.toFixed(2)}ms > ${TTFB_TARGET_MS}ms)`)
    }
    if (result.successRate < 100) {
      console.log(`   • Fix errors in ${result.method} ${result.route} (${(100 - result.successRate).toFixed(1)}% failure rate)`)
    }
  })

  if (routesUnderTarget === totalRoutes && totalRoutes > 0) {
    console.log('   🎉 All routes meet performance targets!')
  }
}

/**
 * Main benchmark execution
 */
async function main(): Promise<void> {
  console.log('🚀 Starting Edge Routes TTFB Benchmark')
  console.log('=====================================')
  console.log(`API URL: ${API_BASE_URL}`)
  console.log(`Concurrent requests per route: ${CONCURRENT_REQUESTS}`)
  console.log(`Target TTFB: <${TTFB_TARGET_MS}ms P95`)

  const results: BenchmarkResult[] = []

  // Benchmark each route
  for (const route of EDGE_ROUTES) {
    const result = await benchmarkRoute(route)
    results.push(result)

    // Small delay between routes to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Log results to database
  await logResultsToDatabase(results)

  // Generate report
  generateReport(results)

  console.log('\n✅ Benchmark completed!')

  // Exit with error code if any routes don't meet target
  const failedRoutes = results.filter(r => r.p95 > TTFB_TARGET_MS || r.p95 === 0)
  if (failedRoutes.length > 0) {
    console.log(`\n❌ ${failedRoutes.length} route(s) failed to meet performance targets`)
    process.exit(1)
  }
}

// Run the benchmark
if (import.meta.main) {
  main().catch(error => {
    console.error('❌ Benchmark failed:', error)
    process.exit(1)
  })
}
