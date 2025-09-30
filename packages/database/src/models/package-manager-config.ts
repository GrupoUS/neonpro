/**
 * Package Manager Configuration Model
 * Hybrid Architecture: Bun + Vercel Edge + Supabase Functions
 * Healthcare Compliance: LGPD, ANVISA, CFM
 */

import { z } from 'zod'

// Build Performance Schema
export const BuildPerformanceSchema = z.object({
  buildTime: z.number().min(0, 'Build time must be positive'),
  installTime: z.number().min(0, 'Install time must be positive'),
  bundleSize: z.number().min(0, 'Bundle size must be positive'),
  cacheHitRate: z.number().min(0).max(100, 'Cache hit rate must be between 0 and 100'),
  timestamp: z.date(),
})

// Package Manager Schema
export const PackageManagerSchema = z.object({
  primary: z.enum(['bun', 'pnpm', 'npm', 'yarn']),
  version: z.string().min(1, 'Version is required'),
  lockFile: z.enum(['bun.lockb', 'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock']),
  registry: z.string().url('Registry must be a valid URL'),
  fallback: z.enum(['bun', 'pnpm', 'npm', 'yarn']).optional(),
  scopes: z.array(z.string()).optional(),
})

// Package Manager Configuration Schema
export const PackageManagerConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  environment: z.enum(['development', 'staging', 'production']),
  packageManager: PackageManagerSchema,
  buildPerformance: BuildPerformanceSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Package Manager Configuration Update Schema
export const PackageManagerConfigUpdateSchema = z.object({
  packageManager: PackageManagerSchema.optional(),
  buildPerformance: BuildPerformanceSchema.optional(),
})

// Types
export type BuildPerformance = z.infer<typeof BuildPerformanceSchema>
export type PackageManager = z.infer<typeof PackageManagerSchema>
export type PackageManagerConfig = z.infer<typeof PackageManagerConfigSchema>
export type PackageManagerConfigUpdate = z.infer<typeof PackageManagerConfigUpdateSchema>

// Default values
export const defaultBuildPerformance: BuildPerformance = {
  buildTime: 0,
  installTime: 0,
  bundleSize: 0,
  cacheHitRate: 0,
  timestamp: new Date(),
}

export const defaultPackageManager: PackageManager = {
  primary: 'bun',
  version: '1.2.23',
  lockFile: 'bun.lockb',
  registry: 'https://registry.npmjs.org',
  fallback: 'pnpm',
  scopes: [],
}

export const defaultPackageManagerConfig: Omit<PackageManagerConfig, 'id' | 'name' | 'environment' | 'createdAt' | 'updatedAt'> = {
  packageManager: defaultPackageManager,
  buildPerformance: defaultBuildPerformance,
}

// Validation functions
export const validatePackageManagerConfig = (config: unknown): PackageManagerConfig => {
  return PackageManagerConfigSchema.parse(config)
}

export const validatePackageManagerConfigUpdate = (update: unknown): PackageManagerConfigUpdate => {
  return PackageManagerConfigUpdateSchema.parse(update)
}

export const validateBuildPerformance = (performance: unknown): BuildPerformance => {
  return BuildPerformanceSchema.parse(performance)
}

export const validatePackageManager = (manager: unknown): PackageManager => {
  return PackageManagerSchema.parse(manager)
}

// Bun performance validation
export const validateBunPerformance = (performance: BuildPerformance): boolean => {
  // Bun should provide 3-5x improvement in build/dev times
  // This is a simplified check - in a real implementation, we would compare with baseline
  return performance.buildTime > 0 && performance.cacheHitRate >= 80
}

// Package manager compatibility validation
export const validatePackageManagerCompatibility = (manager: PackageManager): boolean => {
  // Check if the package manager is compatible with the project
  return (
    manager.primary === 'bun' ||
    manager.primary === 'pnpm' ||
    manager.primary === 'npm' ||
    manager.primary === 'yarn'
  )
}

// Database operations
export const createPackageManagerConfig = async (
  supabase: any,
  config: Omit<PackageManagerConfig, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PackageManagerConfig> => {
  const now = new Date()
  const newConfig = {
    ...config,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }

  const { data, error } = await supabase
    .from('package_manager_configs')
    .insert(newConfig)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create package manager config: ${error.message}`)
  }

  return validatePackageManagerConfig(data)
}

export const getPackageManagerConfig = async (
  supabase: any,
  environment: string
): Promise<PackageManagerConfig | null> => {
  const { data, error } = await supabase
    .from('package_manager_configs')
    .select('*')
    .eq('environment', environment)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to get package manager config: ${error.message}`)
  }

  return validatePackageManagerConfig(data)
}

export const updatePackageManagerConfig = async (
  supabase: any,
  id: string,
  update: PackageManagerConfigUpdate
): Promise<PackageManagerConfig> => {
  const now = new Date()
  const updatedConfig = {
    ...update,
    updatedAt: now,
  }

  const { data, error } = await supabase
    .from('package_manager_configs')
    .update(updatedConfig)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update package manager config: ${error.message}`)
  }

  return validatePackageManagerConfig(data)
}

export const deletePackageManagerConfig = async (
  supabase: any,
  id: string
): Promise<void> => {
  const { error } = await supabase
    .from('package_manager_configs')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete package manager config: ${error.message}`)
  }
}

// Performance tracking
export const trackBuildPerformance = async (
  supabase: any,
  configId: string,
  performance: BuildPerformance
): Promise<void> => {
  const { error } = await supabase
    .from('build_performance_logs')
    .insert({
      config_id: configId,
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

// Get performance history
export const getPerformanceHistory = async (
  supabase: any,
  configId: string,
  limit: number = 10
): Promise<BuildPerformance[]> => {
  const { data, error } = await supabase
    .from('build_performance_logs')
    .select('*')
    .eq('config_id', configId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to get performance history: ${error.message}`)
  }

  return data.map((log: any) => validateBuildPerformance({
    buildTime: log.build_time,
    installTime: log.install_time,
    bundleSize: log.bundle_size,
    cacheHitRate: log.cache_hit_rate,
    timestamp: log.timestamp,
  }))
}

// Compare performance with baseline
export const comparePerformanceWithBaseline = async (
  supabase: any,
  configId: string,
  currentPerformance: BuildPerformance
): Promise<{
  buildTimeImprovement: number
  installTimeImprovement: number
  bundleSizeReduction: number
  cacheHitRateImprovement: number
}> => {
  // Get baseline performance (first recorded performance)
  const history = await getPerformanceHistory(supabase, configId, 1)

  if (history.length === 0) {
    return {
      buildTimeImprovement: 0,
      installTimeImprovement: 0,
      bundleSizeReduction: 0,
      cacheHitRateImprovement: 0,
    }
  }

  const baseline = history[0]

  // Calculate improvements
  const buildTimeImprovement = baseline.buildTime > 0
    ? ((baseline.buildTime - currentPerformance.buildTime) / baseline.buildTime) * 100
    : 0

  const installTimeImprovement = baseline.installTime > 0
    ? ((baseline.installTime - currentPerformance.installTime) / baseline.installTime) * 100
    : 0

  const bundleSizeReduction = baseline.bundleSize > 0
    ? ((baseline.bundleSize - currentPerformance.bundleSize) / baseline.bundleSize) * 100
    : 0

  const cacheHitRateImprovement = currentPerformance.cacheHitRate - baseline.cacheHitRate

  return {
    buildTimeImprovement,
    installTimeImprovement,
    bundleSizeReduction,
    cacheHitRateImprovement,
  }
}
