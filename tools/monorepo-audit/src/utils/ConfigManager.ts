import { EventEmitter, } from 'events'
import { existsSync, readFileSync, unwatchFile, watchFile, } from 'fs'
import { join, resolve, } from 'path'
import { LogContext, logger, } from './Logger.js'
import { LogLevel, } from './Logger.js'

export interface AuditToolConfig {
  // Core settings
  projectName: string
  version: string
  environment: 'development' | 'testing' | 'production'

  // Scanning configuration
  scanning: {
    includePaths: string[]
    excludePaths: string[]
    fileExtensions: string[]
    maxFileSize: number // in bytes
    followSymlinks: boolean
    respectGitignore: boolean
    maxDepth: number
    parallelism: number
  }

  // Dependency analysis
  dependencies: {
    enableCircularDetection: boolean
    enableUnusedDetection: boolean
    enableDuplicateDetection: boolean
    importanceThreshold: number
    maxDependencyDepth: number
    excludeDevDependencies: boolean
  }

  // Architecture validation
  architecture: {
    enableTurborepoValidation: boolean
    enableHonoValidation: boolean
    enableTanStackRouterValidation: boolean
    customRulesPath?: string
    strictMode: boolean
    autoFixEnabled: boolean
  }

  // Cleanup settings
  cleanup: {
    enabled: boolean
    createBackups: boolean
    backupDirectory: string
    dryRunByDefault: boolean
    confirmationRequired: boolean
    cleanupTypes: {
      unusedFiles: boolean
      duplicateFiles: boolean
      orphanedFiles: boolean
      emptyDirectories: boolean
    }
  }

  // Reporting
  reporting: {
    defaultFormat: 'json' | 'html' | 'markdown' | 'pdf'
    outputDirectory: string
    includeMetrics: boolean
    generateDashboard: boolean
    includeRecommendations: boolean
    templatePath?: string
  }

  // Performance monitoring
  performance: {
    enabled: boolean
    collectMetrics: boolean
    metricsInterval: number // milliseconds
    memoryThreshold: number // MB
    operationTimeout: number // milliseconds
    eventLoopThreshold: number // milliseconds
  }

  // Logging
  logging: {
    level: LogLevel
    format: 'json' | 'text' | 'pretty'
    enableConsole: boolean
    enableFile: boolean
    logDirectory: string
    maxFileSize: number
    maxFiles: number
  }

  // CLI settings
  cli: {
    defaultCommand: string
    enableColors: boolean
    enableProgress: boolean
    confirmDestructiveActions: boolean
  }

  // Cache settings
  cache: {
    enabled: boolean
    directory: string
    ttl: number // seconds
    maxSize: number // MB
  }

  // Integration settings
  integrations: {
    git: {
      enabled: boolean
      respectGitignore: boolean
      trackChanges: boolean
    }
    ci: {
      enabled: boolean
      failOnIssues: boolean
      generateArtifacts: boolean
    }
  }
}

export interface ConfigValidationError {
  path: string
  message: string
  value: any
  expected?: string
}

export interface ConfigSource {
  name: string
  priority: number
  load(): Partial<AuditToolConfig>
}

export class ConfigManager extends EventEmitter {
  private config: AuditToolConfig
  private sources: ConfigSource[] = []
  private watchedFiles: Set<string> = new Set()
  private validationErrors: ConfigValidationError[] = []

  constructor(initialConfig?: Partial<AuditToolConfig>,) {
    super()
    this.config = this.getDefaultConfig()

    if (initialConfig) {
      this.mergeConfig(initialConfig,)
    }
  }

  private getDefaultConfig(): AuditToolConfig {
    return {
      projectName: 'monorepo-audit',
      version: '1.0.0',
      environment: 'development',

      scanning: {
        includePaths: ['apps/**', 'packages/**', 'libs/**',],
        excludePaths: [
          'node_modules/**',
          'dist/**',
          'build/**',
          '.next/**',
          '.nuxt/**',
          'coverage/**',
          '**/*.log',
          '**/.DS_Store',
          '**/Thumbs.db',
        ],
        fileExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md',],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        followSymlinks: false,
        respectGitignore: true,
        maxDepth: 10,
        parallelism: 4,
      },

      dependencies: {
        enableCircularDetection: true,
        enableUnusedDetection: true,
        enableDuplicateDetection: true,
        importanceThreshold: 0.1,
        maxDependencyDepth: 20,
        excludeDevDependencies: false,
      },

      architecture: {
        enableTurborepoValidation: true,
        enableHonoValidation: true,
        enableTanStackRouterValidation: true,
        strictMode: false,
        autoFixEnabled: false,
      },

      cleanup: {
        enabled: true,
        createBackups: true,
        backupDirectory: './backup',
        dryRunByDefault: true,
        confirmationRequired: true,
        cleanupTypes: {
          unusedFiles: true,
          duplicateFiles: true,
          orphanedFiles: true,
          emptyDirectories: false,
        },
      },

      reporting: {
        defaultFormat: 'html',
        outputDirectory: './reports',
        includeMetrics: true,
        generateDashboard: true,
        includeRecommendations: true,
      },

      performance: {
        enabled: true,
        collectMetrics: true,
        metricsInterval: 5000,
        memoryThreshold: 1024, // 1GB
        operationTimeout: 30000, // 30 seconds
        eventLoopThreshold: 100, // 100ms
      },

      logging: {
        level: LogLevel.INFO,
        format: 'pretty',
        enableConsole: true,
        enableFile: true,
        logDirectory: './logs',
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      },

      cli: {
        defaultCommand: 'audit',
        enableColors: true,
        enableProgress: true,
        confirmDestructiveActions: true,
      },

      cache: {
        enabled: true,
        directory: './cache',
        ttl: 3600, // 1 hour
        maxSize: 100, // 100MB
      },

      integrations: {
        git: {
          enabled: true,
          respectGitignore: true,
          trackChanges: false,
        },
        ci: {
          enabled: false,
          failOnIssues: true,
          generateArtifacts: true,
        },
      },
    }
  } // Configuration validation methods
  private validateConfig(config: Partial<AuditToolConfig>,): ConfigValidationError[] {
    const errors: ConfigValidationError[] = []

    // Validate scanning configuration
    if (config.scanning) {
      const scanning = config.scanning

      if (
        scanning.maxFileSize
        && (scanning.maxFileSize < 0 || scanning.maxFileSize > 100 * 1024 * 1024)
      ) {
        errors.push({
          path: 'scanning.maxFileSize',
          message: 'Max file size must be between 0 and 100MB',
          value: scanning.maxFileSize,
          expected: '0 - 104857600 bytes',
        },)
      }

      if (scanning.maxDepth && (scanning.maxDepth < 1 || scanning.maxDepth > 50)) {
        errors.push({
          path: 'scanning.maxDepth',
          message: 'Max depth must be between 1 and 50',
          value: scanning.maxDepth,
          expected: '1-50',
        },)
      }

      if (scanning.parallelism && (scanning.parallelism < 1 || scanning.parallelism > 32)) {
        errors.push({
          path: 'scanning.parallelism',
          message: 'Parallelism must be between 1 and 32',
          value: scanning.parallelism,
          expected: '1-32',
        },)
      }
    }

    // Validate dependencies configuration
    if (config.dependencies) {
      const deps = config.dependencies

      if (
        deps.importanceThreshold && (deps.importanceThreshold < 0 || deps.importanceThreshold > 1)
      ) {
        errors.push({
          path: 'dependencies.importanceThreshold',
          message: 'Importance threshold must be between 0 and 1',
          value: deps.importanceThreshold,
          expected: '0.0-1.0',
        },)
      }

      if (deps.maxDependencyDepth && deps.maxDependencyDepth < 1) {
        errors.push({
          path: 'dependencies.maxDependencyDepth',
          message: 'Max dependency depth must be at least 1',
          value: deps.maxDependencyDepth,
          expected: '≥ 1',
        },)
      }
    }

    // Validate performance configuration
    if (config.performance) {
      const perf = config.performance

      if (perf.metricsInterval && perf.metricsInterval < 1000) {
        errors.push({
          path: 'performance.metricsInterval',
          message: 'Metrics interval must be at least 1000ms',
          value: perf.metricsInterval,
          expected: '≥ 1000',
        },)
      }

      if (perf.memoryThreshold && perf.memoryThreshold < 64) {
        errors.push({
          path: 'performance.memoryThreshold',
          message: 'Memory threshold must be at least 64MB',
          value: perf.memoryThreshold,
          expected: '≥ 64',
        },)
      }

      if (
        perf.operationTimeout && (perf.operationTimeout < 1000 || perf.operationTimeout > 300000)
      ) {
        errors.push({
          path: 'performance.operationTimeout',
          message: 'Operation timeout must be between 1 second and 5 minutes',
          value: perf.operationTimeout,
          expected: '1000-300000 ms',
        },)
      }
    }

    // Validate logging configuration
    if (config.logging) {
      const logging = config.logging

      if (logging.level !== undefined && (logging.level < 0 || logging.level > 4)) {
        errors.push({
          path: 'logging.level',
          message: 'Log level must be between 0 (ERROR) and 4 (TRACE)',
          value: logging.level,
          expected: '0-4',
        },)
      }

      if (logging.maxFileSize && logging.maxFileSize < 1024 * 1024) {
        errors.push({
          path: 'logging.maxFileSize',
          message: 'Max log file size must be at least 1MB',
          value: logging.maxFileSize,
          expected: '≥ 1048576 bytes',
        },)
      }

      if (logging.maxFiles && (logging.maxFiles < 1 || logging.maxFiles > 100)) {
        errors.push({
          path: 'logging.maxFiles',
          message: 'Max log files must be between 1 and 100',
          value: logging.maxFiles,
          expected: '1-100',
        },)
      }
    }

    // Validate cache configuration
    if (config.cache) {
      const cache = config.cache

      if (cache.ttl && cache.ttl < 60) {
        errors.push({
          path: 'cache.ttl',
          message: 'Cache TTL must be at least 60 seconds',
          value: cache.ttl,
          expected: '≥ 60',
        },)
      }

      if (cache.maxSize && (cache.maxSize < 10 || cache.maxSize > 10000)) {
        errors.push({
          path: 'cache.maxSize',
          message: 'Cache max size must be between 10MB and 10GB',
          value: cache.maxSize,
          expected: '10-10000 MB',
        },)
      }
    }

    return errors
  } // Configuration source loaders
  private createFileSource(filePath: string, priority: number = 50,): ConfigSource {
    return {
      name: `file:${filePath}`,
      priority,
      load: (): Partial<AuditToolConfig> => {
        const resolvedPath = resolve(filePath,)

        if (!existsSync(resolvedPath,)) {
          logger.debug(`Config file not found: ${resolvedPath}`, {
            component: 'ConfigManager',
          },)
          return {}
        }

        try {
          const content = readFileSync(resolvedPath, 'utf8',)
          let config: Partial<AuditToolConfig>

          if (resolvedPath.endsWith('.json',)) {
            config = JSON.parse(content,)
          } else if (resolvedPath.endsWith('.js',) || resolvedPath.endsWith('.mjs',)) {
            // Dynamic import for ES modules
            delete require.cache[resolvedPath]
            const module = require(resolvedPath,)
            config = module.default || module
          } else {
            throw new Error(`Unsupported config file format: ${resolvedPath}`,)
          }

          logger.info(`Loaded configuration from file: ${resolvedPath}`, {
            component: 'ConfigManager',
            metadata: { configKeys: Object.keys(config,), },
          },)

          return config
        } catch (error) {
          logger.error(`Failed to load config file: ${resolvedPath}`, {
            component: 'ConfigManager',
          }, error as Error,)
          return {}
        }
      },
    }
  }

  private createEnvironmentSource(prefix: string = 'AUDIT_TOOL_',): ConfigSource {
    return {
      name: 'environment',
      priority: 75,
      load: (): Partial<AuditToolConfig> => {
        const config: any = {}
        const envVars = Object.keys(process.env,)
          .filter(key => key.startsWith(prefix,))
          .sort()

        for (const envKey of envVars) {
          const value = process.env[envKey]
          if (value === undefined) continue

          // Convert env key to config path
          const configPath = envKey
            .substring(prefix.length,)
            .toLowerCase()
            .split('_',)

          // Set nested value
          let current = config
          for (let i = 0; i < configPath.length - 1; i++) {
            const key = configPath[i]
            if (!(key in current)) {
              current[key] = {}
            }
            current = current[key]
          }

          const finalKey = configPath[configPath.length - 1]

          // Type conversion
          let parsedValue: any = value
          if (value === 'true') parsedValue = true
          else if (value === 'false') parsedValue = false
          else if (/^\d+$/.test(value,)) parsedValue = parseInt(value, 10,)
          else if (/^\d*\.\d+$/.test(value,)) parsedValue = parseFloat(value,)
          else if (value.startsWith('[',) && value.endsWith(']',)) {
            try {
              parsedValue = JSON.parse(value,)
            } catch {
              // Keep as string if JSON parsing fails
            }
          }

          current[finalKey] = parsedValue
        }

        if (Object.keys(config,).length > 0) {
          logger.info(`Loaded configuration from environment variables`, {
            component: 'ConfigManager',
            metadata: { prefix, variableCount: envVars.length, },
          },)
        }

        return config
      },
    }
  }

  private createCliArgsSource(args: string[],): ConfigSource {
    return {
      name: 'cli-args',
      priority: 100,
      load: (): Partial<AuditToolConfig> => {
        const config: any = {}

        for (let i = 0; i < args.length; i++) {
          const arg = args[i]

          if (arg.startsWith('--config-',)) {
            const configPath = arg.substring(9,).split('-',)
            const value = args[i + 1]

            if (value && !value.startsWith('--',)) {
              // Set nested value
              let current = config
              for (let j = 0; j < configPath.length - 1; j++) {
                const key = configPath[j]
                if (!(key in current)) {
                  current[key] = {}
                }
                current = current[key]
              }

              const finalKey = configPath[configPath.length - 1]

              // Type conversion
              let parsedValue: any = value
              if (value === 'true') parsedValue = true
              else if (value === 'false') parsedValue = false
              else if (/^\d+$/.test(value,)) parsedValue = parseInt(value, 10,)
              else if (/^\d*\.\d+$/.test(value,)) parsedValue = parseFloat(value,)

              current[finalKey] = parsedValue
              i++ // Skip the value argument
            }
          }
        }

        if (Object.keys(config,).length > 0) {
          logger.info(`Loaded configuration from CLI arguments`, {
            component: 'ConfigManager',
            metadata: { configCount: Object.keys(config,).length, },
          },)
        }

        return config
      },
    }
  } // Configuration merging and management
  private mergeConfig(partial: Partial<AuditToolConfig>,): void {
    this.config = this.deepMerge(this.config, partial,)
  }

  private deepMerge(target: any, source: any,): any {
    const result = { ...target, }

    for (const key in source) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key],)) {
        result[key] = this.deepMerge(target[key] || {}, source[key],)
      } else {
        result[key] = source[key]
      }
    }

    return result
  }

  // Public API methods
  public addSource(source: ConfigSource,): void {
    this.sources.push(source,)
    this.sources.sort((a, b,) => a.priority - b.priority)

    logger.debug(`Added configuration source: ${source.name}`, {
      component: 'ConfigManager',
      metadata: { priority: source.priority, totalSources: this.sources.length, },
    },)
  }

  public addFileSource(filePath: string, priority: number = 50,): void {
    const source = this.createFileSource(filePath, priority,)
    this.addSource(source,)

    // Watch file for changes
    if (existsSync(resolve(filePath,),)) {
      this.watchFile(resolve(filePath,),)
    }
  }

  public addEnvironmentSource(prefix: string = 'AUDIT_TOOL_',): void {
    const source = this.createEnvironmentSource(prefix,)
    this.addSource(source,)
  }

  public addCliArgsSource(args: string[],): void {
    const source = this.createCliArgsSource(args,)
    this.addSource(source,)
  }

  private watchFile(filePath: string,): void {
    if (this.watchedFiles.has(filePath,)) return

    this.watchedFiles.add(filePath,)

    watchFile(filePath, { interval: 1000, }, (curr, prev,) => {
      if (curr.mtime !== prev.mtime) {
        logger.info(`Configuration file changed: ${filePath}`, {
          component: 'ConfigManager',
        },)

        this.reload()
        this.emit('configChanged', this.config,)
      }
    },)

    logger.debug(`Watching configuration file: ${filePath}`, {
      component: 'ConfigManager',
    },)
  }

  public reload(): boolean {
    logger.info('Reloading configuration from all sources', {
      component: 'ConfigManager',
      metadata: { sourceCount: this.sources.length, },
    },)

    // Reset to default config
    const newConfig = this.getDefaultConfig()

    // Apply all sources in priority order
    for (const source of this.sources) {
      try {
        const sourceConfig = source.load()
        Object.assign(newConfig, this.deepMerge(newConfig, sourceConfig,),)
      } catch (error) {
        logger.error(`Failed to load configuration source: ${source.name}`, {
          component: 'ConfigManager',
        }, error as Error,)
      }
    }

    // Validate the merged configuration
    this.validationErrors = this.validateConfig(newConfig,)

    if (this.validationErrors.length > 0) {
      logger.warn('Configuration validation errors found', {
        component: 'ConfigManager',
        metadata: { errorCount: this.validationErrors.length, },
      },)

      this.validationErrors.forEach(error => {
        logger.warn(`Config validation error at ${error.path}: ${error.message}`, {
          component: 'ConfigManager',
          metadata: { value: error.value, expected: error.expected, },
        },)
      },)

      // In strict mode, don't apply invalid configuration
      if (newConfig.environment === 'production') {
        logger.error('Configuration validation failed in production mode', {
          component: 'ConfigManager',
        },)
        return false
      }
    }

    this.config = newConfig

    logger.info('Configuration reloaded successfully', {
      component: 'ConfigManager',
      metadata: { validationErrors: this.validationErrors.length, },
    },)

    return true
  }

  public get(): AuditToolConfig {
    return { ...this.config, }
  }

  public getPartial<K extends keyof AuditToolConfig,>(key: K,): AuditToolConfig[K] {
    return { ...this.config[key], } as AuditToolConfig[K]
  }

  public set<K extends keyof AuditToolConfig,>(key: K, value: AuditToolConfig[K],): void {
    const oldValue = this.config[key]
    this.config[key] = value

    // Validate the change
    const partialConfig = { [key]: value, } as Partial<AuditToolConfig>
    const errors = this.validateConfig(partialConfig,)

    if (errors.length > 0) {
      // Revert on validation error
      this.config[key] = oldValue
      throw new Error(`Configuration validation failed for ${key}: ${errors[0].message}`,)
    }

    logger.debug(`Configuration updated: ${key}`, {
      component: 'ConfigManager',
      metadata: { oldValue, newValue: value, },
    },)

    this.emit('configChanged', this.config, key,)
  }

  public getValidationErrors(): ConfigValidationError[] {
    return [...this.validationErrors,]
  }

  public isValid(): boolean {
    return this.validationErrors.length === 0
  }

  public export(format: 'json' | 'yaml' = 'json',): string {
    if (format === 'json') {
      return JSON.stringify(this.config, null, 2,)
    }

    if (format === 'yaml') {
      // Simple YAML serialization
      const yamlLines: string[] = []

      const serializeObject = (obj: any, indent: string = '',): void => {
        for (const [key, value,] of Object.entries(obj,)) {
          if (value === null || value === undefined) {
            yamlLines.push(`${indent}${key}: null`,)
          } else if (typeof value === 'object' && !Array.isArray(value,)) {
            yamlLines.push(`${indent}${key}:`,)
            serializeObject(value, indent + '  ',)
          } else if (Array.isArray(value,)) {
            yamlLines.push(`${indent}${key}:`,)
            value.forEach(item => {
              yamlLines.push(`${indent}  - ${JSON.stringify(item,)}`,)
            },)
          } else {
            yamlLines.push(`${indent}${key}: ${JSON.stringify(value,)}`,)
          }
        }
      }

      serializeObject(this.config,)
      return yamlLines.join('\n',)
    }

    throw new Error(`Unsupported export format: ${format}`,)
  }

  public reset(): void {
    this.config = this.getDefaultConfig()
    this.validationErrors = []

    logger.info('Configuration reset to defaults', {
      component: 'ConfigManager',
    },)

    this.emit('configChanged', this.config,)
  }

  public destroy(): void {
    // Unwatch all files
    for (const filePath of this.watchedFiles) {
      unwatchFile(filePath,)
    }
    this.watchedFiles.clear()

    // Clear sources
    this.sources = []

    // Remove all listeners
    this.removeAllListeners()

    logger.info('Configuration manager destroyed', {
      component: 'ConfigManager',
    },)
  }

  // Static factory methods
  static createDefault(): ConfigManager {
    const manager = new ConfigManager()

    // Add standard configuration sources in priority order
    manager.addFileSource('./audit-tool.config.json', 30,)
    manager.addFileSource('./audit-tool.config.js', 35,)
    manager.addFileSource('./.audit-tool.json', 40,)
    manager.addEnvironmentSource()

    // Load initial configuration
    manager.reload()

    return manager
  }

  static createFromFile(filePath: string,): ConfigManager {
    const manager = new ConfigManager()
    manager.addFileSource(filePath, 50,)
    manager.reload()
    return manager
  }

  static createFromObject(config: Partial<AuditToolConfig>,): ConfigManager {
    const manager = new ConfigManager(config,)
    return manager
  }
}

// Default configuration manager instance
export const defaultConfigManager = ConfigManager.createDefault()

// Convenience functions
export const config = {
  get: () => defaultConfigManager.get(),
  getPartial: <K extends keyof AuditToolConfig,>(key: K,) => defaultConfigManager.getPartial(key,),
  set: <K extends keyof AuditToolConfig,>(key: K, value: AuditToolConfig[K],) =>
    defaultConfigManager.set(key, value,),
  reload: () => defaultConfigManager.reload(),
  isValid: () => defaultConfigManager.isValid(),
  getValidationErrors: () => defaultConfigManager.getValidationErrors(),
  export: (format?: 'json' | 'yaml',) => defaultConfigManager.export(format,),
}
