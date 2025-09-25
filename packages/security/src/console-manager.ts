/**
 * Console Management Utilities for Security Package
 * Consolidates console method handling for healthcare compliance
 * Provides unified interface for console method storage, replacement, and restoration
 */

/**
 * Console method storage interface
 */
export interface ConsoleMethods {
  log: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  debug: (...args: unknown[]) => void
}

/**
 * Console Manager class for handling console method operations
 */
export class ConsoleManager {
  private static instance: ConsoleManager
  private originalMethods: ConsoleMethods
  private currentMethods: ConsoleMethods

  private constructor() {
    this.originalMethods = {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
    }
    this.currentMethods = { ...this.originalMethods }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ConsoleManager {
    if (!ConsoleManager.instance) {
      ConsoleManager.instance = new ConsoleManager()
    }
    return ConsoleManager.instance
  }

  /**
   * Store current console methods
   */
  storeCurrentMethods(): ConsoleMethods {
    return {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
    }
  }

  /**
   * Replace console methods with custom implementations
   */
  replaceMethods(methods: Partial<ConsoleMethods>): void {
    if (methods.log) console.log = methods.log
    if (methods.error) console.error = methods.error
    if (methods.warn) console.warn = methods.warn
    if (methods.info) console.info = methods.info
    if (methods.debug) console.debug = methods.debug

    // Update current methods tracking
    this.currentMethods = this.storeCurrentMethods()
  }

  /**
   * Restore console methods to original state
   */
  restoreToOriginal(): void {
    console.log = this.originalMethods.log
    console.error = this.originalMethods.error
    console.warn = this.originalMethods.warn
    console.info = this.originalMethods.info
    console.debug = this.originalMethods.debug

    this.currentMethods = { ...this.originalMethods }
  }

  /**
   * Restore console methods to last stored state
   */
  restoreToLastStored(): void {
    console.log = this.currentMethods.log
    console.error = this.currentMethods.error
    console.warn = this.currentMethods.warn
    console.info = this.currentMethods.info
    console.debug = this.currentMethods.debug
  }

  /**
   * Get current console methods
   */
  getCurrentMethods(): ConsoleMethods {
    return { ...this.currentMethods }
  }

  /**
   * Get original console methods
   */
  getOriginalMethods(): ConsoleMethods {
    return { ...this.originalMethods }
  }

  /**
   * Check if console methods are currently replaced
   */
  isReplaced(): boolean {
    return (
      console.log !== this.originalMethods.log ||
      console.error !== this.originalMethods.error ||
      console.warn !== this.originalMethods.warn ||
      console.info !== this.originalMethods.info ||
      console.debug !== this.originalMethods.debug
    )
  }

  /**
   * Create healthcare-compliant console methods
   */
  createHealthcareMethods(logger: any): ConsoleMethods {
    return {
      log: (...args: unknown[]) => {
        const message = args.map(arg => {
          if (typeof arg === 'object') return JSON.stringify(arg)
          return String(arg)
        }).join(' ')

        logger.info(message, { originalArgs: args })
      },
      error: (...args: unknown[]) => {
        const message = args.map(arg => {
          if (typeof arg === 'object') return JSON.stringify(arg)
          return String(arg)
        }).join(' ')

        logger.error(message, { originalArgs: args })
      },
      warn: (...args: unknown[]) => {
        const message = args.map(arg => {
          if (typeof arg === 'object') return JSON.stringify(arg)
          return String(arg)
        }).join(' ')

        logger.warn(message, { originalArgs: args })
      },
      info: (...args: unknown[]) => {
        const message = args.map(arg => {
          if (typeof arg === 'object') return JSON.stringify(arg)
          return String(arg)
        }).join(' ')

        logger.info(message, { originalArgs: args })
      },
      debug: (...args: unknown[]) => {
        const message = args.map(arg => {
          if (typeof arg === 'object') return JSON.stringify(arg)
          return String(arg)
        }).join(' ')

        logger.debug(message, { originalArgs: args })
      },
    }
  }

  /**
   * Create secure console methods with sanitization
   */
  createSecureMethods(sanitizeFn: (args: unknown[]) => unknown[]): ConsoleMethods {
    return {
      log: (...args: unknown[]) => {
        const sanitizedArgs = sanitizeFn(args)
        this.originalMethods.log(...sanitizedArgs)
      },
      error: (...args: unknown[]) => {
        const sanitizedArgs = sanitizeFn(args)
        this.originalMethods.error(...sanitizedArgs)
      },
      warn: (...args: unknown[]) => {
        const sanitizedArgs = sanitizeFn(args)
        this.originalMethods.warn(...sanitizedArgs)
      },
      info: (...args: unknown[]) => {
        const sanitizedArgs = sanitizeFn(args)
        this.originalMethods.info(...sanitizedArgs)
      },
      debug: (...args: unknown[]) => {
        const sanitizedArgs = sanitizeFn(args)
        this.originalMethods.debug(...sanitizedArgs)
      },
    }
  }
}

// Export singleton instance
export const consoleManager = ConsoleManager.getInstance()