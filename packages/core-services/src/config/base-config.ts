/**
 * Base configuration management for Background Jobs Manager
 * Consolidates common configuration patterns from circuit breaker and performance optimization services
 */

export interface BaseConfig {
  enableDebugMode?: boolean
  logLevel?: 'error' | 'warn' | 'info' | 'debug'
  maxHistorySize?: number
  cleanupIntervalMs?: number
  enableMetrics?: boolean
}

export interface CircuitBreakerConfig extends BaseConfig {
  failureThreshold?: number
  recoveryTimeout?: number
  expectedResponseTime?: number
  healthCheckInterval?: number
  maxConcurrentRequests?: number
  timeoutMs?: number
  enableFallback?: boolean
  healthcareCritical?: boolean
}

export interface PerformanceConfig extends BaseConfig {
  cacheEnabled?: boolean
  cacheTTL?: number
  cacheWarmerEnabled?: boolean
  enableCompression?: boolean
  enableQueryLogging?: boolean
  enablePerformanceMonitoring?: boolean
  queryTimeoutMs?: number
  maxPageSize?: number
  defaultPageSize?: number
  slowQueryThreshold?: number
  maxBatchSize?: number
}

export interface JobProcessorConfig extends BaseConfig {
  timeoutMs?: number
  retryAttempts?: number
  retryDelayMs?: number
  maxConcurrentJobs?: number
  maxBatchSize?: number
  enablePriorityQueue?: boolean
  continueOnError?: boolean
  enableJobHistory?: boolean
  jobHistorySize?: number
}

/**
 * Default configurations
 */
export const DEFAULT_CIRCUIT_BREAKER_CONFIG: Required<CircuitBreakerConfig> = {
  enableDebugMode: false,
  logLevel: 'info',
  maxHistorySize: 1000,
  cleanupIntervalMs: 300000,
  enableMetrics: true,
  failureThreshold: 5,
  recoveryTimeout: 60000,
  expectedResponseTime: 1000,
  healthCheckInterval: 30000,
  maxConcurrentRequests: 100,
  timeoutMs: 30000,
  enableFallback: true,
  healthcareCritical: false
}

export const DEFAULT_PERFORMANCE_CONFIG: Required<PerformanceConfig> = {
  enableDebugMode: false,
  logLevel: 'info',
  maxHistorySize: 1000,
  cleanupIntervalMs: 300000,
  enableMetrics: true,
  cacheEnabled: true,
  cacheTTL: 300000,
  cacheWarmerEnabled: true,
  enableCompression: true,
  enableQueryLogging: false,
  enablePerformanceMonitoring: true,
  queryTimeoutMs: 30000,
  maxPageSize: 100,
  defaultPageSize: 20,
  slowQueryThreshold: 1000,
  maxBatchSize: 50
}

export const DEFAULT_JOB_PROCESSOR_CONFIG: Required<JobProcessorConfig> = {
  enableDebugMode: false,
  logLevel: 'info',
  maxHistorySize: 1000,
  cleanupIntervalMs: 300000,
  enableMetrics: true,
  timeoutMs: 30000,
  retryAttempts: 3,
  retryDelayMs: 1000,
  maxConcurrentJobs: 10,
  maxBatchSize: 100,
  enablePriorityQueue: true,
  continueOnError: false,
  enableJobHistory: true,
  jobHistorySize: 1000
}

/**
 * Configuration validator
 */
export class ConfigValidator {
  /**
   * Validate circuit breaker configuration
   */
  static validateCircuitBreakerConfig(config: Partial<CircuitBreakerConfig>): {
    isValid: boolean
    errors: string[]
    normalizedConfig: CircuitBreakerConfig
  } {
    const errors: string[] = []
    const normalizedConfig = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config }

    // Validate numeric values
    if (normalizedConfig.failureThreshold < 1) {
      errors.push('failureThreshold must be at least 1')
    }

    if (normalizedConfig.recoveryTimeout < 1000) {
      errors.push('recoveryTimeout must be at least 1000ms')
    }

    if (normalizedConfig.expectedResponseTime < 100) {
      errors.push('expectedResponseTime must be at least 100ms')
    }

    if (normalizedConfig.healthCheckInterval < 1000) {
      errors.push('healthCheckInterval must be at least 1000ms')
    }

    if (normalizedConfig.maxConcurrentRequests < 1) {
      errors.push('maxConcurrentRequests must be at least 1')
    }

    if (normalizedConfig.timeoutMs < 100) {
      errors.push('timeoutMs must be at least 100ms')
    }

    if (normalizedConfig.maxHistorySize < 10) {
      errors.push('maxHistorySize must be at least 10')
    }

    return {
      isValid: errors.length === 0,
      errors,
      normalizedConfig
    }
  }

  /**
   * Validate performance configuration
   */
  static validatePerformanceConfig(config: Partial<PerformanceConfig>): {
    isValid: boolean
    errors: string[]
    normalizedConfig: PerformanceConfig
  } {
    const errors: string[] = []
    const normalizedConfig = { ...DEFAULT_PERFORMANCE_CONFIG, ...config }

    // Validate numeric values
    if (normalizedConfig.cacheTTL < 1000) {
      errors.push('cacheTTL must be at least 1000ms')
    }

    if (normalizedConfig.queryTimeoutMs < 100) {
      errors.push('queryTimeoutMs must be at least 100ms')
    }

    if (normalizedConfig.maxPageSize < 1) {
      errors.push('maxPageSize must be at least 1')
    }

    if (normalizedConfig.defaultPageSize < 1) {
      errors.push('defaultPageSize must be at least 1')
    }

    if (normalizedConfig.defaultPageSize > normalizedConfig.maxPageSize) {
      errors.push('defaultPageSize cannot be greater than maxPageSize')
    }

    if (normalizedConfig.slowQueryThreshold < 100) {
      errors.push('slowQueryThreshold must be at least 100ms')
    }

    if (normalizedConfig.maxBatchSize < 1) {
      errors.push('maxBatchSize must be at least 1')
    }

    if (normalizedConfig.maxHistorySize < 10) {
      errors.push('maxHistorySize must be at least 10')
    }

    return {
      isValid: errors.length === 0,
      errors,
      normalizedConfig
    }
  }

  /**
   * Validate job processor configuration
   */
  static validateJobProcessorConfig(config: Partial<JobProcessorConfig>): {
    isValid: boolean
    errors: string[]
    normalizedConfig: JobProcessorConfig
  } {
    const errors: string[] = []
    const normalizedConfig = { ...DEFAULT_JOB_PROCESSOR_CONFIG, ...config }

    // Validate numeric values
    if (normalizedConfig.timeoutMs < 100) {
      errors.push('timeoutMs must be at least 100ms')
    }

    if (normalizedConfig.retryAttempts < 0) {
      errors.push('retryAttempts cannot be negative')
    }

    if (normalizedConfig.retryDelayMs < 0) {
      errors.push('retryDelayMs cannot be negative')
    }

    if (normalizedConfig.maxConcurrentJobs < 1) {
      errors.push('maxConcurrentJobs must be at least 1')
    }

    if (normalizedConfig.maxBatchSize < 1) {
      errors.push('maxBatchSize must be at least 1')
    }

    if (normalizedConfig.jobHistorySize < 10) {
      errors.push('jobHistorySize must be at least 10')
    }

    if (normalizedConfig.maxHistorySize < 10) {
      errors.push('maxHistorySize must be at least 10')
    }

    return {
      isValid: errors.length === 0,
      errors,
      normalizedConfig
    }
  }
}

/**
 * Configuration manager with runtime updates
 */
export class ConfigManager<T extends BaseConfig> {
  private config: T
  private listeners: Set<(config: T) => void> = new Set()
  private validator: (config: Partial<T>) => { isValid: boolean; errors: string[]; normalizedConfig: T }

  constructor(
    initialConfig: T,
    validator: (config: Partial<T>) => { isValid: boolean; errors: string[]; normalizedConfig: T }
  ) {
    const validation = validator(initialConfig)
    if (!validation.isValid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`)
    }
    this.config = validation.normalizedConfig
    this.validator = validator
  }

  /**
   * Get current configuration
   */
  getConfig(): T {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<T>): { success: boolean; errors?: string[] } {
    const validation = this.validator({ ...this.config, ...updates })
    
    if (!validation.isValid) {
      return { success: false, errors: validation.errors }
    }

    this.config = validation.normalizedConfig
    this.notifyListeners()
    
    return { success: true }
  }

  /**
   * Subscribe to configuration changes
   */
  subscribe(listener: (config: T) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Get specific configuration value
   */
  get<K extends keyof T>(key: K): T[K] {
    return this.config[key]
  }

  /**
   * Set specific configuration value
   */
  set<K extends keyof T>(key: K, value: T[K]): { success: boolean; errors?: string[] } {
    return this.updateConfig({ [key]: value } as unknown as Partial<T>)
  }

  /**
   * Reset to default configuration
   */
  reset(): void {
    const defaultConfig = this.validator({}).normalizedConfig
    this.config = defaultConfig
    this.notifyListeners()
  }

  /**
   * Notify listeners of configuration changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config))
  }

  /**
   * Export configuration as JSON
   */
  export(): string {
    return JSON.stringify(this.config, null, 2)
  }

  /**
   * Import configuration from JSON
   */
  import(jsonConfig: string): { success: boolean; errors?: string[] } {
    try {
      const parsedConfig = JSON.parse(jsonConfig)
      return this.updateConfig(parsedConfig)
    } catch (error) {
      return { 
        success: false, 
        errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      }
    }
  }
}

/**
 * Factory functions for creating configuration managers
 */
export class ConfigFactory {
  /**
   * Create circuit breaker configuration manager
   */
  static createCircuitBreakerManager(
    config: Partial<CircuitBreakerConfig> = {}
  ): ConfigManager<CircuitBreakerConfig> {
    return new ConfigManager(
      config,
      ConfigValidator.validateCircuitBreakerConfig
    )
  }

  /**
   * Create performance configuration manager
   */
  static createPerformanceManager(
    config: Partial<PerformanceConfig> = {}
  ): ConfigManager<PerformanceConfig> {
    return new ConfigManager(
      config,
      ConfigValidator.validatePerformanceConfig
    )
  }

  /**
   * Create job processor configuration manager
   */
  static createJobProcessorManager(
    config: Partial<JobProcessorConfig> = {}
  ): ConfigManager<JobProcessorConfig> {
    return new ConfigManager(
      config,
      ConfigValidator.validateJobProcessorConfig
    )
  }
}