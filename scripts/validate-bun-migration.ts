#!/usr/bin/env bun

/**
 * Bun Migration Validation Script
 *
 * This script validates the Bun migration by checking:
 * 1. Performance metrics
 * 2. Bundle size
 * 3. Healthcare compliance
 * 4. Architecture configuration
 * 5. Package manager configuration
 * 6. Migration state
 * 7. Compliance status
 */

import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

// Create Supabase clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Validation results
interface ValidationResult {
  success: boolean
  errors: string[]
  warnings: string[]
  metrics: Record<string, any>
}

// Main validation function
async function validateBunMigration(): Promise<ValidationResult> {
  console.log('🔍 Validating Bun migration...')

  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    metrics: {},
  }

  try {
    // Validate architecture configuration
    console.log('📐 Validating architecture configuration...')
    const architectureResult = await validateArchitectureConfiguration()
    result.metrics.architecture = architectureResult.metrics

    if (!architectureResult.success) {
      result.success = false
      result.errors.push(...architectureResult.errors)
    }

    result.warnings.push(...architectureResult.warnings)

    // Validate package manager configuration
    console.log('📦 Validating package manager configuration...')
    const packageManagerResult = await validatePackageManagerConfiguration()
    result.metrics.packageManager = packageManagerResult.metrics

    if (!packageManagerResult.success) {
      result.success = false
      result.errors.push(...packageManagerResult.errors)
    }

    result.warnings.push(...packageManagerResult.warnings)

    // Validate migration state
    console.log('🔄 Validating migration state...')
    const migrationResult = await validateMigrationStateConfiguration()
    result.metrics.migration = migrationResult.metrics

    if (!migrationResult.success) {
      result.success = false
      result.errors.push(...migrationResult.errors)
    }

    result.warnings.push(...migrationResult.warnings)

    // Validate performance metrics
    console.log('📊 Validating performance metrics...')
    const performanceResult = await validatePerformanceMetricsConfiguration()
    result.metrics.performance = performanceResult.metrics

    if (!performanceResult.success) {
      result.success = false
      result.errors.push(...performanceResult.errors)
    }

    result.warnings.push(...performanceResult.warnings)

    // Validate compliance status
    console.log('🛡️ Validating compliance status...')
    const complianceResult = await validateComplianceStatusConfiguration()
    result.metrics.compliance = complianceResult.metrics

    if (!complianceResult.success) {
      result.success = false
      result.errors.push(...complianceResult.errors)
    }

    result.warnings.push(...complianceResult.warnings)

    // Calculate overall score
    const overallScore = calculateOverallScore(result.metrics)
    result.metrics.overallScore = overallScore

    console.log(`✅ Overall score: ${overallScore}/100`)

    return result
  } catch (error) {
    result.success = false
    result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`)
    return result
  }
}

// Validate architecture configuration
async function validateArchitectureConfiguration(): Promise<ValidationResult> {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    metrics: {},
  }

  try {
    // Get architecture configurations
    const { data: configs, error } = await supabase
      .from('architecture_configs')
      .select('*')

    if (error) {
      result.success = false
      result.errors.push(`Error fetching architecture configs: ${error.message}`)
      return result
    }

    if (!configs || configs.length === 0) {
      result.success = false
      result.errors.push('No architecture configurations found')
      return result
    }

    // Validate each configuration
    let validConfigs = 0
    let totalScore = 0

    for (const config of configs) {
      // Simple validation check
      if (config.name && config.environment && config.edgeEnabled !== undefined) {
        validConfigs++
        totalScore += config.performanceMetrics?.uptime || 0
      } else {
        result.errors.push(`Invalid architecture config for ${config.environment}`)
      }
    }

    result.metrics.validConfigs = validConfigs
    result.metrics.totalConfigs = configs.length
    result.metrics.averageUptime = totalScore / configs.length

    // Check if all environments are configured
    const environments = ['development', 'staging', 'production']
    const configuredEnvironments = configs.map(config => config.environment)

    for (const env of environments) {
      if (!configuredEnvironments.includes(env)) {
        result.warnings.push(`Missing architecture configuration for ${env} environment`)
      }
    }

    return result
  } catch (error) {
    result.success = false
    result.errors.push(`Error validating architecture configuration: ${error instanceof Error ? error.message : String(error)}`)
    return result
  }
}

// Validate package manager configuration
async function validatePackageManagerConfiguration(): Promise<ValidationResult> {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    metrics: {},
  }

  try {
    // Get package manager configurations
    const { data: configs, error } = await supabase
      .from('package_manager_configs')
      .select('*')

    if (error) {
      result.success = false
      result.errors.push(`Error fetching package manager configs: ${error.message}`)
      return result
    }

    if (!configs || configs.length === 0) {
      result.success = false
      result.errors.push('No package manager configurations found')
      return result
    }

    // Validate each configuration
    let validConfigs = 0
    let totalBuildTime = 0
    let totalBundleSize = 0

    for (const config of configs) {
      // Simple validation check
      if (config.name && config.packageManager && config.buildPerformance) {
        validConfigs++
        totalBuildTime += config.buildPerformance.buildTime || 0
        totalBundleSize += config.buildPerformance.bundleSize?.total || 0
      } else {
        result.errors.push(`Invalid package manager config for ${config.packageManager}`)
      }
    }

    result.metrics.validConfigs = validConfigs
    result.metrics.totalConfigs = configs.length
    result.metrics.averageBuildTime = totalBuildTime / configs.length
    result.metrics.averageBundleSize = totalBundleSize / configs.length

    // Check if Bun is configured
    const bunConfig = configs.find(config => config.packageManager === 'bun')
    if (!bunConfig) {
      result.warnings.push('Bun package manager not configured')
    }

    return result
  } catch (error) {
    result.success = false
    result.errors.push(`Error validating package manager configuration: ${error instanceof Error ? error.message : String(error)}`)
    return result
  }
}

// Validate migration state
async function validateMigrationStateConfiguration(): Promise<ValidationResult> {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    metrics: {},
  }

  try {
    // Get migration states
    const { data: states, error } = await supabase
      .from('migration_states')
      .select('*')

    if (error) {
      result.success = false
      result.errors.push(`Error fetching migration states: ${error.message}`)
      return result
    }

    if (!states || states.length === 0) {
      result.success = false
      result.errors.push('No migration states found')
      return result
    }

    // Validate each state
    let validStates = 0
    let totalProgress = 0

    for (const state of states) {
      // Simple validation check
      if (state.name && state.environment && state.status && state.progress !== undefined) {
        validStates++
        totalProgress += state.progress || 0
      } else {
        result.errors.push(`Invalid migration state for ${state.environment}`)
      }
    }

    result.metrics.validStates = validStates
    result.metrics.totalStates = states.length
    result.metrics.averageProgress = totalProgress / states.length

    // Check if any migration is in progress
    const inProgressMigrations = states.filter(state => state.status === 'in_progress')
    if (inProgressMigrations.length > 0) {
      result.warnings.push(`${inProgressMigrations.length} migration(s) in progress`)
    }

    // Check if any migration has failed
    const failedMigrations = states.filter(state => state.status === 'failed')
    if (failedMigrations.length > 0) {
      result.errors.push(`${failedMigrations.length} migration(s) failed`)
      result.success = false
    }

    return result
  } catch (error) {
    result.success = false
    result.errors.push(`Error validating migration state: ${error instanceof Error ? error.message : String(error)}`)
    return result
  }
}

// Validate performance metrics
async function validatePerformanceMetricsConfiguration(): Promise<ValidationResult> {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    metrics: {},
  }

  try {
    // Get performance metrics
    const { data: metrics, error } = await supabase
      .from('performance_metrics')
      .select('*')

    if (error) {
      result.success = false
      result.errors.push(`Error fetching performance metrics: ${error.message}`)
      return result
    }

    if (!metrics || metrics.length === 0) {
      result.success = false
      result.errors.push('No performance metrics found')
      return result
    }

    // Validate each metric
    let validMetrics = 0
    let totalTTFB = 0
    let totalCacheHitRate = 0

    for (const metric of metrics) {
      // Simple validation check
      if (metric.name && metric.environment && metric.edgePerformance) {
        validMetrics++
        totalTTFB += metric.edgePerformance.ttfb || 0
        totalCacheHitRate += metric.edgePerformance.cacheHitRate || 0
      } else {
        result.errors.push(`Invalid performance metrics for ${metric.environment}`)
      }
    }

    result.metrics.validMetrics = validMetrics
    result.metrics.totalMetrics = metrics.length
    result.metrics.averageTTFB = totalTTFB / metrics.length
    result.metrics.averageCacheHitRate = totalCacheHitRate / metrics.length

    // Check if TTFB is within acceptable range
    if (result.metrics.averageTTFB > 100) {
      result.warnings.push(`Average TTFB (${result.metrics.averageTTFB}ms) is above target (100ms)`)
    }

    // Check if cache hit rate is within acceptable range
    if (result.metrics.averageCacheHitRate < 90) {
      result.warnings.push(`Average cache hit rate (${result.metrics.averageCacheHitRate}%) is below target (90%)`)
    }

    return result
  } catch (error) {
    result.success = false
    result.errors.push(`Error validating performance metrics: ${error instanceof Error ? error.message : String(error)}`)
    return result
  }
}

// Validate compliance status
async function validateComplianceStatusConfiguration(): Promise<ValidationResult> {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    metrics: {},
  }

  try {
    // Get compliance statuses
    const { data: statuses, error } = await supabase
      .from('compliance_statuses')
      .select('*')

    if (error) {
      result.success = false
      result.errors.push(`Error fetching compliance statuses: ${error.message}`)
      return result
    }

    if (!statuses || statuses.length === 0) {
      result.success = false
      result.errors.push('No compliance statuses found')
      return result
    }

    // Validate each status
    let validStatuses = 0
    let totalScore = 0

    for (const status of statuses) {
      // Simple validation check
      if (status.name && status.environment && status.overallScore !== undefined) {
        validStatuses++
        totalScore += status.overallScore || 0
      } else {
        result.errors.push(`Invalid compliance status for ${status.environment}`)
      }
    }

    result.metrics.validStatuses = validStatuses
    result.metrics.totalStatuses = statuses.length
    result.metrics.averageScore = totalScore / statuses.length

    // Check if compliance score is within acceptable range
    if (result.metrics.averageScore < 95) {
      result.warnings.push(`Average compliance score (${result.metrics.averageScore}%) is below target (95%)`)
    }

    return result
  } catch (error) {
    result.success = false
    result.errors.push(`Error validating compliance status: ${error instanceof Error ? error.message : String(error)}`)
    return result
  }
}

// Calculate overall score
function calculateOverallScore(metrics: Record<string, any>): number {
  let score = 0
  let totalWeight = 0

  // Architecture configuration (20%)
  if (metrics.architecture) {
    const architectureScore = (metrics.architecture.validConfigs / metrics.architecture.totalConfigs) * 100
    score += architectureScore * 0.2
    totalWeight += 0.2
  }

  // Package manager configuration (20%)
  if (metrics.packageManager) {
    const packageManagerScore = (metrics.packageManager.validConfigs / metrics.packageManager.totalConfigs) * 100
    score += packageManagerScore * 0.2
    totalWeight += 0.2
  }

  // Migration state (20%)
  if (metrics.migration) {
    const migrationScore = metrics.migration.averageProgress
    score += migrationScore * 0.2
    totalWeight += 0.2
  }

  // Performance metrics (20%)
  if (metrics.performance) {
    const performanceScore = Math.max(0, 100 - metrics.performance.averageTTFB)
    score += performanceScore * 0.2
    totalWeight += 0.2
  }

  // Compliance status (20%)
  if (metrics.compliance) {
    const complianceScore = metrics.compliance.averageScore
    score += complianceScore * 0.2
    totalWeight += 0.2
  }

  return totalWeight > 0 ? Math.round(score / totalWeight) : 0
}

// Print validation results
function printValidationResults(result: ValidationResult): void {
  console.log('\n📊 Validation Results:')
  console.log('=====================')

  if (result.success) {
    console.log('✅ Migration validation passed!')
  } else {
    console.log('❌ Migration validation failed!')
  }

  console.log(`📈 Overall Score: ${result.metrics.overallScore}/100`)

  if (result.errors.length > 0) {
    console.log('\n❌ Errors:')
    result.errors.forEach(error => console.log(`  - ${error}`))
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️ Warnings:')
    result.warnings.forEach(warning => console.log(`  - ${warning}`))
  }

  console.log('\n📊 Metrics:')
  console.log('-----------')

  if (result.metrics.architecture) {
    console.log(`📐 Architecture: ${result.metrics.architecture.validConfigs}/${result.metrics.architecture.totalConfigs} configs valid`)
    console.log(`   Average Uptime: ${result.metrics.architecture.averageUptime.toFixed(2)}%`)
  }

  if (result.metrics.packageManager) {
    console.log(`📦 Package Manager: ${result.metrics.packageManager.validConfigs}/${result.metrics.packageManager.totalConfigs} configs valid`)
    console.log(`   Average Build Time: ${result.metrics.packageManager.averageBuildTime.toFixed(2)}ms`)
    console.log(`   Average Bundle Size: ${(result.metrics.packageManager.averageBundleSize / 1024 / 1024).toFixed(2)}MB`)
  }

  if (result.metrics.migration) {
    console.log(`🔄 Migration: ${result.metrics.migration.validStates}/${result.metrics.migration.totalStates} states valid`)
    console.log(`   Average Progress: ${result.metrics.migration.averageProgress.toFixed(2)}%`)
  }

  if (result.metrics.performance) {
    console.log(`📊 Performance: ${result.metrics.performance.validMetrics}/${result.metrics.performance.totalMetrics} metrics valid`)
    console.log(`   Average TTFB: ${result.metrics.performance.averageTTFB.toFixed(2)}ms`)
    console.log(`   Average Cache Hit Rate: ${result.metrics.performance.averageCacheHitRate.toFixed(2)}%`)
  }

  if (result.metrics.compliance) {
    console.log(`🛡️ Compliance: ${result.metrics.compliance.validStatuses}/${result.metrics.compliance.totalStatuses} statuses valid`)
    console.log(`   Average Score: ${result.metrics.compliance.averageScore.toFixed(2)}%`)
  }
}

// Main execution
async function main(): Promise<void> {
  console.log('🚀 Starting Bun migration validation...')

  const result = await validateBunMigration()

  printValidationResults(result)

  // Exit with appropriate code
  process.exit(result.success ? 0 : 1)
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })
}
