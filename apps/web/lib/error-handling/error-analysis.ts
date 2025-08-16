/**
 * Error Analysis System - VIBECODE V1.0 Intelligence
 * Advanced error pattern recognition and categorization
 */

export type ErrorContext = {
  errorId: string;
  category: 'auth' | 'database' | 'api' | 'validation' | 'network' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  route?: string;
  timestamp: number;
  metadata?: Record<string, any>;
};

export type ErrorPattern = {
  pattern: RegExp;
  category: ErrorContext['category'];
  severity: ErrorContext['severity'];
  recoveryAction: string;
  description: string;
};

// Known error patterns for intelligent categorization
const KNOWN_ERROR_PATTERNS: ErrorPattern[] = [
  {
    pattern: /ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i,
    category: 'network',
    severity: 'high',
    recoveryAction: 'retry_with_backoff',
    description: 'Network connection failure',
  },
  {
    pattern: /unauthorized|invalid.*token|expired.*token/i,
    category: 'auth',
    severity: 'medium',
    recoveryAction: 'refresh_token',
    description: 'Authentication token issue',
  },
  {
    pattern: /duplicate.*key|unique.*constraint/i,
    category: 'database',
    severity: 'low',
    recoveryAction: 'handle_duplicate',
    description: 'Database duplicate entry',
  },
  {
    pattern: /validation.*failed|required.*field|invalid.*format/i,
    category: 'validation',
    severity: 'low',
    recoveryAction: 'validate_input',
    description: 'Input validation error',
  },
  {
    pattern: /session.*expired|login.*required/i,
    category: 'auth',
    severity: 'medium',
    recoveryAction: 'redirect_login',
    description: 'Session expiration',
  },
  {
    pattern: /rate.*limit|too.*many.*requests/i,
    category: 'api',
    severity: 'medium',
    recoveryAction: 'retry_with_backoff',
    description: 'Rate limiting',
  },
];

// Cache for error pattern frequency tracking
const errorPatternsCache = new Map<string, number>();

export class ErrorAnalysisSystem {
  private errorHistory: ErrorContext[] = [];
  private readonly patternStats: Map<string, number> = new Map();

  constructor() {
    this.initializePatternTracking();
  }

  /**
   * Initialize pattern tracking
   */
  private initializePatternTracking(): void {
    for (const pattern of KNOWN_ERROR_PATTERNS) {
      this.patternStats.set(pattern.description, 0);
    }
  }

  /**
   * Analyze and categorize an error
   */
  analyzeError(message: string, stack?: string, route?: string): ErrorContext {
    const analysis = this.performAnalysis(message, stack);
    const errorId = this.generateErrorId(message, route);

    const errorContext: ErrorContext = {
      errorId,
      category: analysis.category,
      severity: analysis.severity,
      message,
      stack,
      route,
      timestamp: Date.now(),
      metadata: {
        recoveryAction: analysis.recoveryAction,
        analysisVersion: '1.0',
        patternMatched: analysis.patternMatched,
      },
    };

    // Store in history for trend analysis
    this.errorHistory.push(errorContext);
    this.cleanOldHistory();

    return errorContext;
  }

  /**
   * 🔍 Analyze error to determine category, severity and recovery action
   */
  private performAnalysis(
    message: string,
    stack?: string
  ): {
    category: ErrorContext['category'];
    severity: ErrorContext['severity'];
    recoveryAction: string;
    patternMatched?: string;
  } {
    const fullText = `${message} ${stack || ''}`;

    // Check against known patterns
    for (const pattern of KNOWN_ERROR_PATTERNS) {
      if (pattern.pattern.test(fullText)) {
        // Track pattern frequency
        const patternKey = pattern.description;
        const currentCount = errorPatternsCache.get(patternKey) || 0;
        errorPatternsCache.set(patternKey, currentCount + 1);
        this.patternStats.set(patternKey, currentCount + 1);

        return {
          category: pattern.category,
          severity: pattern.severity,
          recoveryAction: pattern.recoveryAction,
          patternMatched: pattern.description,
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
   * Get error trends and patterns
   */
  getErrorTrends(): any {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentErrors = this.errorHistory.filter(
      (error) => now - error.timestamp < oneHour
    );

    const categoryBreakdown = new Map<string, number>();
    const severityBreakdown = new Map<string, number>();

    for (const error of recentErrors) {
      categoryBreakdown.set(
        error.category,
        (categoryBreakdown.get(error.category) || 0) + 1
      );
      severityBreakdown.set(
        error.severity,
        (severityBreakdown.get(error.severity) || 0) + 1
      );
    }

    return {
      totalErrors: recentErrors.length,
      categoryBreakdown: Object.fromEntries(categoryBreakdown),
      severityBreakdown: Object.fromEntries(severityBreakdown),
      patternStats: Object.fromEntries(this.patternStats),
      timeRange: 'Last 1 hour',
    };
  }

  /**
   * Get error analysis report
   */
  generateAnalysisReport(): any {
    const trends = this.getErrorTrends();
    const criticalErrors = this.errorHistory.filter(
      (error) =>
        error.severity === 'critical' &&
        Date.now() - error.timestamp < 3_600_000
    );

    const topPatterns = Array.from(this.patternStats.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      summary: {
        totalErrorsAnalyzed: this.errorHistory.length,
        recentCriticalErrors: criticalErrors.length,
        topErrorPattern: topPatterns[0]?.[0] || 'None',
      },
      trends,
      criticalErrors: criticalErrors.slice(-10),
      topPatterns,
      recommendations: this.generateRecommendations(trends),
    };
  }

  /**
   * Generate recommendations based on error patterns
   */
  private generateRecommendations(trends: any): string[] {
    const recommendations: string[] = [];

    if (trends.categoryBreakdown.network > 5) {
      recommendations.push(
        'Consider implementing circuit breaker pattern for network calls'
      );
    }

    if (trends.categoryBreakdown.auth > 3) {
      recommendations.push('Review authentication token refresh mechanism');
    }

    if (trends.severityBreakdown.critical > 0) {
      recommendations.push('Immediate attention required for critical errors');
    }

    if (trends.totalErrors > 20) {
      recommendations.push(
        'High error rate detected - consider system health check'
      );
    }

    return recommendations;
  }

  /**
   * Clean old error history
   */
  private cleanOldHistory(): void {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const cutoff = Date.now() - maxAge;

    this.errorHistory = this.errorHistory.filter(
      (error) => error.timestamp > cutoff
    );
  }

  /**
   * Get error by ID
   */
  getErrorById(errorId: string): ErrorContext | undefined {
    return this.errorHistory.find((error) => error.errorId === errorId);
  }

  /**
   * Clear all error history
   */
  clearHistory(): void {
    this.errorHistory = [];
    this.patternStats.clear();
    this.initializePatternTracking();
  }
}

// Export singleton instance
export const errorAnalysisSystem = new ErrorAnalysisSystem();
