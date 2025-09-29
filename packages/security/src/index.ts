// Re-exports from auth utilities
export * from './auth';

// Re-exports from encryption utilities
export * from './encryption';

// Re-exports from compliance utilities
export * from './compliance';

// Export SecureLogger from utils
export { SecureLogger } from './utils';

// Export ConsoleManager
export class ConsoleManager {
  private static instance: ConsoleManager
  private originalMethods: {
    log: typeof console.log
    error: typeof console.error
    warn: typeof console.warn
    info: typeof console.info
    debug: typeof console.debug
  }

  private constructor() {
    this.originalMethods = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    }
  }

  static getInstance(): ConsoleManager {
    if (!ConsoleManager.instance) {
      ConsoleManager.instance = new ConsoleManager()
    }
    return ConsoleManager.instance
  }

  getOriginalMethods() {
    return this.originalMethods
  }
}

// HealthcareSecurityLogger implementation
export class HealthcareSecurityLogger {
  private originalConsole: {
    log: typeof console.log
    error: typeof console.error
    warn: typeof console.warn
    info: typeof console.info
    debug: typeof console.debug
  } | null = null

  private enableConsoleLogging: boolean
  private logLevel: 'debug' | 'info' | 'warn' | 'error' = 'debug'
  private _complianceLevel: 'basic' | 'enhanced' = 'enhanced' // Used for future compliance features

  constructor(options: {
    enableConsoleLogging?: boolean
    logLevel?: 'debug' | 'info' | 'warn' | 'error'
    complianceLevel?: 'basic' | 'enhanced'
  } = {}) {
    this.enableConsoleLogging = options.enableConsoleLogging ?? true
    this.logLevel = options.logLevel ?? 'debug'
    // Store compliance level for future use
    this._complianceLevel = options.complianceLevel ?? 'enhanced'
  }

  static initialize(logger: HealthcareSecurityLogger): void {
    if (!logger.enableConsoleLogging) return

    // Store original console methods
    logger.originalConsole = {
      // eslint-disable-next-line no-console
      log: console.log,
      // eslint-disable-next-line no-console
      error: console.error,
      // eslint-disable-next-line no-console
      warn: console.warn,
      // eslint-disable-next-line no-console
      info: console.info,
      // eslint-disable-next-line no-console
      debug: console.debug,
    }

    // Replace console methods with secure versions
    // eslint-disable-next-line no-console
    console.log = (...args: unknown[]) => {
      const sanitized = args.map(arg => HealthcareSecurityLogger.sanitizeLogArgument(arg as any))
      logger.originalConsole?.log(...sanitized)
    }

    // eslint-disable-next-line no-console
    console.error = (...args: unknown[]) => {
      const sanitized = args.map(arg => HealthcareSecurityLogger.sanitizeLogArgument(arg as any))
      logger.originalConsole?.error(...sanitized)
    }

    // eslint-disable-next-line no-console
    console.warn = (...args: unknown[]) => {
      const sanitized = args.map(arg => HealthcareSecurityLogger.sanitizeLogArgument(arg as any))
      logger.originalConsole?.warn(...sanitized)
    }

    // eslint-disable-next-line no-console
    console.info = (...args: unknown[]) => {
      const sanitized = args.map(arg => HealthcareSecurityLogger.sanitizeLogArgument(arg as any))
      logger.originalConsole?.info(...sanitized)
    }

    // eslint-disable-next-line no-console
    console.debug = (...args: unknown[]) => {
      if (logger.logLevel === 'debug') {
        const sanitized = args.map(arg => HealthcareSecurityLogger.sanitizeLogArgument(arg as any))
        logger.originalConsole?.debug(...sanitized)
      }
    }
  }

  static restore(logger: HealthcareSecurityLogger): void {
    if (logger.originalConsole) {
      // eslint-disable-next-line no-console
      console.log = logger.originalConsole.log
      // eslint-disable-next-line no-console
      console.error = logger.originalConsole.error
      // eslint-disable-next-line no-console
      console.warn = logger.originalConsole.warn
      // eslint-disable-next-line no-console
      console.info = logger.originalConsole.info
      // eslint-disable-next-line no-console
      console.debug = logger.originalConsole.debug
      logger.originalConsole = null
    }
  }

  static sanitizeLogArgument(arg: any): any {
    if (typeof arg === 'object' && arg !== null) {
      // Sanitize objects by removing sensitive fields
      const sensitiveFields = ['password', 'token', 'secret', 'cpf', 'rg', 'credit', 'ssn']
      const sanitized = { ...arg }
      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]'
        }
      })
      return sanitized
    }
    return arg
  }

  // Compliance level getter for future use
  get complianceLevel(): 'basic' | 'enhanced' {
    return this._complianceLevel
  }
}
