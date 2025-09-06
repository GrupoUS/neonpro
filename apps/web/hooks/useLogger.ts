"use client";

/**
 * Client-side Logging Hook
 * React hook for structured logging in browser environment
 */

import { clientEnv } from "@/lib/env";
import { useCallback, useMemo } from "react";

// Client-side log levels
export enum ClientLogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Client-side log categories
export enum ClientLogCategory {
  USER_ACTION = "user_action",
  NAVIGATION = "navigation",
  PERFORMANCE = "performance",
  ERROR = "error",
  ANALYTICS = "analytics",
  COMPLIANCE = "compliance",
}

// Client log entry interface
interface ClientLogEntry {
  timestamp: string;
  level: keyof typeof ClientLogLevel;
  category: ClientLogCategory;
  message: string;
  sessionId?: string;
  userId?: string;
  clinicId?: string;
  url: string;
  userAgent: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  performance?: {
    duration?: number;
    memory?: number;
  };
}

// Client-side logger implementation
class ClientLogger {
  private sessionId: string;
  private minLevel: ClientLogLevel;

  constructor() {
    this.sessionId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    this.minLevel = clientEnv.app.environment === "production"
      ? ClientLogLevel.INFO
      : ClientLogLevel.DEBUG;
  }

  private shouldLog(level: ClientLogLevel): boolean {
    return level >= this.minLevel;
  }

  private createEntry(
    level: keyof typeof ClientLogLevel,
    category: ClientLogCategory,
    message: string,
    options?: Partial<ClientLogEntry>,
  ): ClientLogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      sessionId: this.sessionId,
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
      ...options,
    };
  }

  private sendLog(entry: ClientLogEntry): void {
    if (!this.shouldLog(ClientLogLevel[entry.level])) return;

    // In development, log to console with formatting
    if (clientEnv.app.environment === "development") {
      const formattedEntry = JSON.stringify(entry, null, 2);

      switch (entry.level) {
        case "DEBUG":
          console.debug(`🔍 ${entry.category}:`, formattedEntry);
          break;
        case "INFO":
          console.info(`ℹ️ ${entry.category}:`, formattedEntry);
          break;
        case "WARN":
          console.warn(`⚠️ ${entry.category}:`, formattedEntry);
          break;
        case "ERROR":
          console.error(`❌ ${entry.category}:`, formattedEntry);
          break;
      }
    }

    // In production, send to logging service
    if (clientEnv.app.environment === "production" || clientEnv.app.enableAnalytics) {
      // Send to external logging service (e.g., Sentry, LogRocket, etc.)
      // For now, using a simple endpoint
      this.sendToServer(entry);
    }
  }

  private async sendToServer(entry: ClientLogEntry): Promise<void> {
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fallback to console if server logging fails
      console.error("Failed to send log to server:", error);
      console.log("Original log entry:", entry);
    }
  }

  debug(category: ClientLogCategory, message: string, options?: Partial<ClientLogEntry>): void {
    this.sendLog(this.createEntry("DEBUG", category, message, options));
  }

  info(category: ClientLogCategory, message: string, options?: Partial<ClientLogEntry>): void {
    this.sendLog(this.createEntry("INFO", category, message, options));
  }

  warn(category: ClientLogCategory, message: string, options?: Partial<ClientLogEntry>): void {
    this.sendLog(this.createEntry("WARN", category, message, options));
  }

  error(category: ClientLogCategory, message: string, options?: Partial<ClientLogEntry>): void {
    this.sendLog(this.createEntry("ERROR", category, message, options));
  }

  // Healthcare-specific client logging
  userAction(action: string, metadata?: Record<string, any>): void {
    this.info(ClientLogCategory.USER_ACTION, `User action: ${action}`, { metadata });
  }

  patientDataAccess(patientId: string, dataType: string, metadata?: Record<string, any>): void {
    this.info(ClientLogCategory.COMPLIANCE, `Patient data accessed: ${dataType}`, {
      metadata: {
        ...metadata,
        patientId: clientEnv.app.environment === "production"
          ? `***-${patientId.slice(-4)}`
          : patientId, // Redact in production
        dataType,
      },
    });
  }

  performanceMetric(operation: string, duration: number, metadata?: Record<string, any>): void {
    this.info(ClientLogCategory.PERFORMANCE, `Performance: ${operation}`, {
      performance: { duration },
      metadata,
    });
  }

  navigationEvent(from: string, to: string, metadata?: Record<string, any>): void {
    this.info(ClientLogCategory.NAVIGATION, `Navigation: ${from} → ${to}`, { metadata });
  }
}

// Hook for using logger in React components
export function useLogger() {
  const logger = useMemo(() => new ClientLogger(), []);

  const logUserAction = useCallback((action: string, metadata?: Record<string, any>) => {
    logger.userAction(action, metadata);
  }, [logger]);

  const logError = useCallback((error: Error, context?: string, metadata?: Record<string, any>) => {
    logger.error(ClientLogCategory.ERROR, `${context || "Unhandled error"}: ${error.message}`, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      metadata,
    });
  }, [logger]);

  const logPerformance = useCallback(
    (operation: string, startTime: number, metadata?: Record<string, any>) => {
      const duration = Date.now() - startTime;
      logger.performanceMetric(operation, duration, metadata);
    },
    [logger],
  );

  const logPatientAccess = useCallback(
    (patientId: string, dataType: string, metadata?: Record<string, any>) => {
      logger.patientDataAccess(patientId, dataType, metadata);
    },
    [logger],
  );

  const logNavigation = useCallback((from: string, to: string, metadata?: Record<string, any>) => {
    logger.navigationEvent(from, to, metadata);
  }, [logger]);

  return {
    logger,
    logUserAction,
    logError,
    logPerformance,
    logPatientAccess,
    logNavigation,
    // Direct access to log levels
    debug: logger.debug.bind(logger),
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
  };
}

// Performance monitoring hook
export function usePerformanceLogger(operationName: string) {
  const { logPerformance } = useLogger();

  return useCallback((metadata?: Record<string, any>) => {
    const startTime = Date.now();

    return {
      end: (additionalMetadata?: Record<string, any>) => {
        logPerformance(operationName, startTime, {
          ...metadata,
          ...additionalMetadata,
        });
      },
    };
  }, [logPerformance, operationName]);
}

// Error boundary logging
export function useErrorLogger() {
  const { logError } = useLogger();

  return useCallback((error: Error, errorInfo?: { componentStack: string; }) => {
    logError(error, "React Error Boundary", {
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
    });
  }, [logError]);
}

export { type ClientLogEntry, ClientLogger };
export default useLogger;
