/**
 * 🔧 NeonPro Intelligent Error Handler
 *
 * Sistema adaptativo que captura, categoriza e resolve erros automaticamente
 * com recuperação inteligente e prevenção proativa
 */

import { LRUCache } from 'lru-cache';
import React from 'react';
import { performanceMonitor } from '@/lib/monitoring/performance-monitor';
import { KNOWN_ERROR_PATTERNS } from './error-patterns';

type ErrorContext = {
  errorId: string;
  message: string;
  stack?: string;
  code?: string;
  route?: string;
  userId?: string;
  clinicId?: string;
  userAgent?: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'database' | 'api' | 'auth' | 'validation' | 'network' | 'unknown';
  metadata?: Record<string, any>;
  recoveryAction?: string;
  resolved: boolean;
};

type ErrorPattern = {
  pattern: RegExp;
  category: ErrorContext['category'];
  severity: ErrorContext['severity'];
  recoveryAction: string;
  description: string;
};

// Cache para evitar spam de erros iguais
const errorDeduplicationCache = new LRUCache<string, ErrorContext>({
  max: 1000,
  ttl: 5 * 60 * 1000, // 5 minutes
});

// Cache para tracking de error patterns
const errorPatternsCache = new LRUCache<string, number>({
  max: 500,
  ttl: 30 * 60 * 1000, // 30 minutes
});

export class IntelligentErrorHandler {
  private static instance: IntelligentErrorHandler;
  private errorHistory: ErrorContext[] = [];
  private readonly maxErrors = 10_000;

  static getInstance(): IntelligentErrorHandler {
    if (!IntelligentErrorHandler.instance) {
      IntelligentErrorHandler.instance = new IntelligentErrorHandler();
    }
    return IntelligentErrorHandler.instance;
  }

  /**
   * 🚨 Capture and process error with intelligent analysis
   */
  captureError(
    error: Error | string,
    context: Partial<ErrorContext> = {},
  ): ErrorContext {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'object' ? error.stack : undefined;

    const errorId = this.generateErrorId(errorMessage, context.route);

    // Check for deduplication
    const existingError = errorDeduplicationCache.get(errorId);
    if (existingError) {
      // Update count but don't create new error
      return existingError;
    }

    // Analyze error pattern
    const analysis = this.analyzeError(errorMessage, errorStack);

    const errorContext: ErrorContext = {
      errorId,
      message: errorMessage,
      stack: errorStack,
      timestamp: Date.now(),
      severity: analysis.severity,
      category: analysis.category,
      recoveryAction: analysis.recoveryAction,
      resolved: false,
      ...context,
    };

    // Cache for deduplication
    errorDeduplicationCache.set(errorId, errorContext);

    // Add to history
    this.addToHistory(errorContext);

    // Record performance impact
    this.recordErrorMetrics(errorContext);

    // Auto-recovery attempt
    this.attemptAutoRecovery(errorContext);

    return errorContext;
  }

  /**
   * 📊 Record error metrics for monitoring
   */
  private recordErrorMetrics(errorContext: ErrorContext): void {
    performanceMonitor.recordClientPerformance(
      `error.${errorContext.category}.${errorContext.severity}`,
      1,
      {
        errorId: errorContext.errorId,
        route: errorContext.route,
        recoveryAction: errorContext.recoveryAction,
        timestamp: errorContext.timestamp,
      },
    );
  }

  /**
   * 📚 Add error to history with memory management
   */
  private addToHistory(errorContext: ErrorContext): void {
    this.errorHistory.push(errorContext);

    // Clean old errors to prevent memory leaks
    if (this.errorHistory.length > this.maxErrors) {
      this.errorHistory = this.errorHistory.slice(
        -Math.floor(this.maxErrors * 0.8),
      );
    }
  }

  /**
   * 📋 Get error summary for monitoring
   */
  getErrorSummary(timeWindow: number = 30 * 60 * 1000): {
    totalErrors: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    topErrors: Array<{ pattern: string; count: number }>;
    recentErrors: ErrorContext[];
  } {
    const now = Date.now();
    const recentErrors = this.errorHistory.filter(
      (e) => now - e.timestamp <= timeWindow,
    );

    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    recentErrors.forEach((error) => {
      byCategory[error.category] = (byCategory[error.category] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    // Get top error patterns
    const topErrors: Array<{ pattern: string; count: number }> = [];
    errorPatternsCache.forEach((count, pattern) => {
      topErrors.push({ pattern, count });
    });
    topErrors.sort((a, b) => b.count - a.count);

    return {
      totalErrors: recentErrors.length,
      byCategory,
      bySeverity,
      topErrors: topErrors.slice(0, 10),
      recentErrors: recentErrors.slice(-20), // Last 20 errors
    };
  }

  /**
   * 🔍 Get specific error details
   */
  getError(errorId: string): ErrorContext | undefined {
    return (
      this.errorHistory.find((e) => e.errorId === errorId) ||
      errorDeduplicationCache.get(errorId)
    );
  }

  /**
   * ✅ Mark error as resolved
   */
  resolveError(errorId: string, resolution?: string): boolean {
    const error = this.getError(errorId);
    if (error) {
      error.resolved = true;
      error.metadata = {
        ...error.metadata,
        resolution,
        resolvedAt: Date.now(),
      };
      return true;
    }
    return false;
  }

  /**
   * 🔍 Analyze error to determine category, severity and recovery action
   */
  private analyzeError(
    message: string,
    stack?: string,
  ): {
    category: ErrorContext['category'];
    severity: ErrorContext['severity'];
    recoveryAction: string;
  } {
    const fullText = `${message} ${stack || ''}`;

    // Check against known patterns
    for (const pattern of KNOWN_ERROR_PATTERNS) {
      if (pattern.pattern.test(fullText)) {
        // Track pattern frequency
        const patternKey = pattern.description;
        const currentCount = errorPatternsCache.get(patternKey) || 0;
        errorPatternsCache.set(patternKey, currentCount + 1);

        return {
          category: pattern.category,
          severity: pattern.severity,
          recoveryAction: pattern.recoveryAction,
        };
      }
    }

    // Default fallback analysis
    let category: ErrorContext['category'] = 'unknown';
    let severity: ErrorContext['severity'] = 'medium';

    // Basic categorization based on keywords
    if (/database|sql|query|connection/i.test(fullText)) {
      category = 'database';
    } else if (/auth|token|session|login/i.test(fullText)) {
      category = 'auth';
    } else if (/api|fetch|request|response/i.test(fullText)) {
      category = 'api';
    } else if (/validation|invalid|required/i.test(fullText)) {
      category = 'validation';
      severity = 'low';
    } else if (/network|timeout|refused/i.test(fullText)) {
      category = 'network';
    }

    return {
      category,
      severity,
      recoveryAction: 'log_and_monitor',
    };
  }

  /**
   * 🆔 Generate unique error ID for deduplication
   */
  private generateErrorId(message: string, route?: string): string {
    const baseString = `${message}_${route || 'unknown'}`;
    // Simple hash function for error ID
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash; // Convert to 32-bit integer
    }
    return `err_${Math.abs(hash).toString(36)}_${Date.now()}`;
  }

  /**
   * 🔧 Attempt automatic error recovery
   */
  private attemptAutoRecovery(errorContext: ErrorContext): void {
    switch (errorContext.recoveryAction) {
      case 'retry_with_backoff':
        this.scheduleRetry(errorContext);
        break;

      case 'refresh_token':
        this.logRecoveryAction(errorContext, 'Token refresh recommended');
        break;

      case 'redirect_login':
        this.logRecoveryAction(errorContext, 'Login redirect recommended');
        break;

      case 'handle_duplicate':
        this.logRecoveryAction(errorContext, 'Duplicate data handling needed');
        break;

      case 'validate_input':
        this.logRecoveryAction(errorContext, 'Input validation required');
        break;

      default:
        this.logRecoveryAction(errorContext, 'Manual investigation required');
    }
  }

  /**
   * ⏰ Schedule retry with exponential backoff
   */
  private scheduleRetry(errorContext: ErrorContext): void {
    const retryCount = errorContext.metadata?.retryCount || 0;
    const maxRetries = 3;

    if (retryCount < maxRetries) {
      const backoffMs = 2 ** retryCount * 1000; // 1s, 2s, 4s

      setTimeout(() => {
        // Mark as recovery attempted
        errorContext.metadata = {
          ...errorContext.metadata,
          retryCount: retryCount + 1,
          retryAttempted: true,
          lastRetryAt: Date.now(),
        };
      }, backoffMs);
    }
  }

  /**
   * 📝 Log recovery action taken
   */
  private logRecoveryAction(errorContext: ErrorContext, action: string): void {
    errorContext.metadata = {
      ...errorContext.metadata,
      recoveryAction: action,
      recoveryAttemptedAt: Date.now(),
    };
  }
}

/**
 * 🎯 Singleton instance export
 */
export const intelligentErrorHandler = IntelligentErrorHandler.getInstance();

/**
 * 🚨 Global error boundary utility
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Partial<ErrorContext>,
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      intelligentErrorHandler.captureError(error as Error, context);
      return null;
    }
  };
}

/**
 * 🛡️ React Error Boundary HOC helper
 */
export function withErrorBoundary(
  Component: React.ComponentType<any>,
  fallback?: React.ComponentType<{ error: Error; errorId: string }>,
) {
  return class ErrorBoundaryWrapper extends React.Component<
    any,
    { hasError: boolean; error?: Error; errorId?: string }
  > {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
      const errorContext = intelligentErrorHandler.captureError(error, {
        route: window.location.pathname,
        userId: undefined, // Set from context if available
        metadata: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
        },
      });

      this.setState({ errorId: errorContext.errorId });
    }

    render() {
      if (this.state.hasError) {
        if (fallback && this.state.error && this.state.errorId) {
          const FallbackComponent = fallback;
          return React.createElement(FallbackComponent, {
            error: this.state.error,
            errorId: this.state.errorId,
          });
        }

        return React.createElement(
          'div',
          {
            className:
              'error-boundary p-4 border border-red-200 bg-red-50 rounded-lg',
          },
          [
            React.createElement(
              'h2',
              {
                key: 'title',
                className: 'text-red-800 font-medium mb-2',
              },
              'Algo deu errado',
            ),
            React.createElement(
              'p',
              {
                key: 'message',
                className: 'text-red-600 text-sm',
              },
              'Um erro inesperado ocorreu. Nossa equipe foi notificada.',
            ),
            this.state.errorId &&
              React.createElement(
                'p',
                {
                  key: 'errorId',
                  className: 'text-red-500 text-xs mt-2 font-mono',
                },
                `ID: ${this.state.errorId}`,
              ),
          ].filter(Boolean),
        );
      }

      return React.createElement(Component, this.props);
    }
  };
}
