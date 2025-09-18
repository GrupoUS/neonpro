/**
 * Bundle Optimization Utilities for Healthcare Edge Runtime
 * 
 * Provides dynamic imports, code splitting, and performance monitoring
 * specifically optimized for Brazilian healthcare compliance requirements.
 */

// Type definitions for bundle optimization
export interface BundleMetrics {
  size: number
  loadTime: number
  module: string
  cached: boolean
  compressionRatio?: number
}

export interface HealthcareBundleConfig {
  maxSize: number
  criticalModules: string[]
  deferredModules: string[]
  complianceModules: string[]
}

// Healthcare-specific bundle configuration
export const HEALTHCARE_BUNDLE_CONFIG: HealthcareBundleConfig = {
  maxSize: 244000, // 244KB limit for Vercel Edge Runtime
  
  // Critical modules that must load immediately
  criticalModules: [
    'healthcare-middleware',
    'lgpd-compliance',
    'emergency-protocols',
    'patient-safety'
  ],
  
  // Modules that can be loaded on demand
  deferredModules: [
    'report-generation',
    'analytics',
    'audit-logging',
    'backup-systems'
  ],
  
  // Brazilian compliance modules
  complianceModules: [
    'lgpd-validation',
    'cfm-certification',
    'anvisa-reporting',
    'brazilian-standards'
  ]
}

/**
 * Dynamic import with healthcare-specific error handling
 */
export async function importHealthcareModule<T = any>(
  modulePath: string,
  options: {
    timeout?: number
    fallback?: () => T
    critical?: boolean
  } = {}
): Promise<T> {
  const startTime = performance.now()
  const { timeout = 5000, fallback, critical = false } = options
  
  try {
    // Create timeout promise for non-critical modules
    const timeoutPromise = new Promise<never>((_, reject) => {
      if (!critical) {
        setTimeout(() => reject(new Error(`Module ${modulePath} load timeout`)), timeout)
      }
    })
    
    // Dynamic import with timeout
    const module = critical 
      ? await import(modulePath)
      : await Promise.race([import(modulePath), timeoutPromise])
    
    const loadTime = performance.now() - startTime
    
    // Log performance metrics for healthcare optimization
    console.log(`Healthcare module loaded: ${modulePath} in ${Math.round(loadTime)}ms`)
    
    return module.default || module
    
  } catch (error) {
    console.error(`Failed to load healthcare module ${modulePath}:`, error)
    
    // Use fallback for non-critical modules
    if (fallback && !critical) {
      console.warn(`Using fallback for module ${modulePath}`)
      return fallback()
    }
    
    // For critical healthcare modules, throw error
    if (critical) {
      throw new Error(`Critical healthcare module ${modulePath} failed to load: ${error}`)
    }
    
    throw error
  }
}

/**
 * Lazy load Brazilian compliance modules
 */
export const loadLgpdCompliance = () => importHealthcareModule(
  '../middleware/lgpd-compliance',
  { critical: true, timeout: 3000 }
)

export const loadCfmValidation = () => importHealthcareModule(
  '../services/cfm-validation',
  { critical: true, timeout: 3000 }
)

export const loadAnvisaReporting = () => importHealthcareModule(
  '../services/anvisa-reporting',
  { critical: false, timeout: 5000 }
)

/**
 * Preload critical healthcare modules for edge runtime
 */
export async function preloadCriticalHealthcareModules(): Promise<void> {
  const startTime = performance.now()
  
  try {
    // Preload critical modules in parallel
    const criticalModules = await Promise.allSettled([
      loadLgpdCompliance(),
      loadCfmValidation(),
      importHealthcareModule('../utils/emergency-protocols', { critical: true }),
      importHealthcareModule('../utils/patient-safety', { critical: true })
    ])
    
    // Check if any critical modules failed
    const failedModules = criticalModules
      .map((result, index) => ({ result, module: HEALTHCARE_BUNDLE_CONFIG.criticalModules[index] }))
      .filter(({ result }) => result.status === 'rejected')
    
    if (failedModules.length > 0) {
      console.error('Critical healthcare modules failed to preload:', failedModules)
      throw new Error(`Critical healthcare modules failed: ${failedModules.map(f => f.module).join(', ')}`)
    }
    
    const loadTime = performance.now() - startTime
    console.log(`Critical healthcare modules preloaded in ${Math.round(loadTime)}ms`)
    
  } catch (error) {
    console.error('Failed to preload critical healthcare modules:', error)
    throw error
  }
}

/**
 * Bundle size analyzer for healthcare edge runtime
 */
export class HealthcareBundleAnalyzer {
  private metrics: Map<string, BundleMetrics> = new Map()
  
  /**
   * Track module loading metrics
   */
  trackModuleLoad(moduleName: string, size: number, loadTime: number, cached = false): void {
    this.metrics.set(moduleName, {
      size,
      loadTime,
      module: moduleName,
      cached,
      compressionRatio: this.calculateCompressionRatio(size)
    })
  }
  
  /**
   * Get total bundle size
   */
  getTotalBundleSize(): number {
    return Array.from(this.metrics.values())
      .reduce((total, metric) => total + metric.size, 0)
  }
  
  /**
   * Check if bundle size is within healthcare edge runtime limits
   */
  isWithinHealthcareLimits(): boolean {
    const totalSize = this.getTotalBundleSize()
    return totalSize <= HEALTHCARE_BUNDLE_CONFIG.maxSize
  }
  
  /**
   * Get performance report for healthcare compliance
   */
  getHealthcarePerformanceReport(): {
    totalSize: number
    withinLimits: boolean
    criticalModuleMetrics: BundleMetrics[]
    recommendations: string[]
  } {
    const totalSize = this.getTotalBundleSize()
    const withinLimits = this.isWithinHealthcareLimits()
    
    const criticalModuleMetrics = HEALTHCARE_BUNDLE_CONFIG.criticalModules
      .map(module => this.metrics.get(module))
      .filter(Boolean) as BundleMetrics[]
    
    const recommendations = this.generateOptimizationRecommendations()
    
    return {
      totalSize,
      withinLimits,
      criticalModuleMetrics,
      recommendations
    }
  }
  
  /**
   * Generate optimization recommendations for healthcare edge runtime
   */
  private generateOptimizationRecommendations(): string[] {
    const recommendations: string[] = []
    const totalSize = this.getTotalBundleSize()
    
    if (totalSize > HEALTHCARE_BUNDLE_CONFIG.maxSize * 0.9) {
      recommendations.push('Bundle size approaching edge runtime limit - consider code splitting')
    }
    
    // Check for slow loading critical modules
    const slowCriticalModules = Array.from(this.metrics.values())
      .filter(metric => 
        HEALTHCARE_BUNDLE_CONFIG.criticalModules.includes(metric.module) && 
        metric.loadTime > 100
      )
    
    if (slowCriticalModules.length > 0) {
      recommendations.push(`Critical healthcare modules loading slowly: ${slowCriticalModules.map(m => m.module).join(', ')}`)
    }
    
    // Check for large non-critical modules
    const largeNonCriticalModules = Array.from(this.metrics.values())
      .filter(metric => 
        !HEALTHCARE_BUNDLE_CONFIG.criticalModules.includes(metric.module) && 
        metric.size > 50000
      )
    
    if (largeNonCriticalModules.length > 0) {
      recommendations.push(`Consider lazy loading large modules: ${largeNonCriticalModules.map(m => m.module).join(', ')}`)
    }
    
    return recommendations
  }
  
  /**
   * Calculate compression ratio estimate
   */
  private calculateCompressionRatio(size: number): number {
    // Estimate compression ratio based on typical JavaScript compression
    // Healthcare modules typically compress well due to repetitive patterns
    return Math.round((size * 0.3) / size * 100) / 100 // ~70% compression typical
  }
}

/**
 * Code splitting utility for healthcare routes
 */
export function createHealthcareRouteLoader<T>(
  routeImport: () => Promise<T>,
  options: {
    preload?: boolean
    fallback?: React.ComponentType
    errorBoundary?: React.ComponentType<{ error: Error }>
  } = {}
) {
  const { preload = false, fallback, errorBoundary } = options
  
  // Preload if specified (for critical healthcare routes)
  if (preload && typeof window !== 'undefined') {
    routeImport().catch(error => {
      console.error('Failed to preload healthcare route:', error)
    })
  }
  
  return {
    import: routeImport,
    fallback,
    errorBoundary
  }
}

/**
 * Performance monitoring for healthcare edge runtime
 */
export class HealthcareEdgePerformanceMonitor {
  private static instance: HealthcareEdgePerformanceMonitor
  private bundleAnalyzer = new HealthcareBundleAnalyzer()
  
  static getInstance(): HealthcareEdgePerformanceMonitor {
    if (!this.instance) {
      this.instance = new HealthcareEdgePerformanceMonitor()
    }
    return this.instance
  }
  
  /**
   * Monitor edge runtime performance for healthcare compliance
   */
  monitorEdgePerformance(): {
    memoryUsage: number
    responseTime: number
    bundleCompliance: boolean
    healthcareReadiness: boolean
  } {
    const memoryUsage = this.getMemoryUsage()
    const responseTime = this.getAverageResponseTime()
    const bundleCompliance = this.bundleAnalyzer.isWithinHealthcareLimits()
    
    // Healthcare readiness requires all systems to be optimal
    const healthcareReadiness = memoryUsage < 100 && 
                               responseTime < 100 && 
                               bundleCompliance
    
    return {
      memoryUsage,
      responseTime,
      bundleCompliance,
      healthcareReadiness
    }
  }
  
  private getMemoryUsage(): number {
    // Estimate memory usage (actual implementation would use performance API)
    return Math.round(Math.random() * 128) // Simulated for edge runtime
  }
  
  private getAverageResponseTime(): number {
    // Calculate average response time from tracked metrics
    const metrics = Array.from(this.bundleAnalyzer['metrics'].values())
    if (metrics.length === 0) return 0
    
    return metrics.reduce((sum, metric) => sum + metric.loadTime, 0) / metrics.length
  }
}

// Export singleton instances
export const healthcareBundleAnalyzer = new HealthcareBundleAnalyzer()
export const healthcarePerformanceMonitor = HealthcareEdgePerformanceMonitor.getInstance()