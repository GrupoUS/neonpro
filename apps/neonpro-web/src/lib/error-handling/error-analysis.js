/**
 * Error Analysis System - VIBECODE V1.0 Intelligence
 * Advanced error pattern recognition and categorization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorAnalysisSystem = exports.ErrorAnalysisSystem = void 0;
// Known error patterns for intelligent categorization
var KNOWN_ERROR_PATTERNS = [
  {
    pattern: /ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i,
    category: "network",
    severity: "high",
    recoveryAction: "retry_with_backoff",
    description: "Network connection failure",
  },
  {
    pattern: /unauthorized|invalid.*token|expired.*token/i,
    category: "auth",
    severity: "medium",
    recoveryAction: "refresh_token",
    description: "Authentication token issue",
  },
  {
    pattern: /duplicate.*key|unique.*constraint/i,
    category: "database",
    severity: "low",
    recoveryAction: "handle_duplicate",
    description: "Database duplicate entry",
  },
  {
    pattern: /validation.*failed|required.*field|invalid.*format/i,
    category: "validation",
    severity: "low",
    recoveryAction: "validate_input",
    description: "Input validation error",
  },
  {
    pattern: /session.*expired|login.*required/i,
    category: "auth",
    severity: "medium",
    recoveryAction: "redirect_login",
    description: "Session expiration",
  },
  {
    pattern: /rate.*limit|too.*many.*requests/i,
    category: "api",
    severity: "medium",
    recoveryAction: "retry_with_backoff",
    description: "Rate limiting",
  },
];
// Cache for error pattern frequency tracking
var errorPatternsCache = new Map();
var ErrorAnalysisSystem = /** @class */ (() => {
  function ErrorAnalysisSystem() {
    this.errorHistory = [];
    this.patternStats = new Map();
    this.initializePatternTracking();
  }
  /**
   * Initialize pattern tracking
   */
  ErrorAnalysisSystem.prototype.initializePatternTracking = function () {
    for (
      var _i = 0, KNOWN_ERROR_PATTERNS_1 = KNOWN_ERROR_PATTERNS;
      _i < KNOWN_ERROR_PATTERNS_1.length;
      _i++
    ) {
      var pattern = KNOWN_ERROR_PATTERNS_1[_i];
      this.patternStats.set(pattern.description, 0);
    }
  };
  /**
   * Analyze and categorize an error
   */
  ErrorAnalysisSystem.prototype.analyzeError = function (message, stack, route) {
    var analysis = this.performAnalysis(message, stack);
    var errorId = this.generateErrorId(message, route);
    var errorContext = {
      errorId: errorId,
      category: analysis.category,
      severity: analysis.severity,
      message: message,
      stack: stack,
      route: route,
      timestamp: Date.now(),
      metadata: {
        recoveryAction: analysis.recoveryAction,
        analysisVersion: "1.0",
        patternMatched: analysis.patternMatched,
      },
    };
    // Store in history for trend analysis
    this.errorHistory.push(errorContext);
    this.cleanOldHistory();
    return errorContext;
  };
  /**
   * 🔍 Analyze error to determine category, severity and recovery action
   */
  ErrorAnalysisSystem.prototype.performAnalysis = function (message, stack) {
    var fullText = "".concat(message, " ").concat(stack || "");
    // Check against known patterns
    for (
      var _i = 0, KNOWN_ERROR_PATTERNS_2 = KNOWN_ERROR_PATTERNS;
      _i < KNOWN_ERROR_PATTERNS_2.length;
      _i++
    ) {
      var pattern = KNOWN_ERROR_PATTERNS_2[_i];
      if (pattern.pattern.test(fullText)) {
        // Track pattern frequency
        var patternKey = pattern.description;
        var currentCount = errorPatternsCache.get(patternKey) || 0;
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
    var category = "unknown";
    var severity = "medium";
    // Basic categorization based on keywords
    if (/database|sql|query|connection/i.test(fullText)) {
      category = "database";
    } else if (/auth|token|session|login/i.test(fullText)) {
      category = "auth";
    } else if (/api|fetch|request|response/i.test(fullText)) {
      category = "api";
    } else if (/validation|invalid|required/i.test(fullText)) {
      category = "validation";
      severity = "low";
    } else if (/network|timeout|refused/i.test(fullText)) {
      category = "network";
    }
    return {
      category: category,
      severity: severity,
      recoveryAction: "log_and_monitor",
    };
  };
  /**
   * 🆔 Generate unique error ID for deduplication
   */
  ErrorAnalysisSystem.prototype.generateErrorId = (message, route) => {
    var baseString = "".concat(message, "_").concat(route || "unknown");
    // Simple hash function for error ID
    var hash = 0;
    for (var i = 0; i < baseString.length; i++) {
      var char = baseString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return "err_".concat(Math.abs(hash).toString(36), "_").concat(Date.now());
  };
  /**
   * Get error trends and patterns
   */
  ErrorAnalysisSystem.prototype.getErrorTrends = function () {
    var now = Date.now();
    var oneHour = 60 * 60 * 1000;
    var recentErrors = this.errorHistory.filter((error) => now - error.timestamp < oneHour);
    var categoryBreakdown = new Map();
    var severityBreakdown = new Map();
    for (var _i = 0, recentErrors_1 = recentErrors; _i < recentErrors_1.length; _i++) {
      var error = recentErrors_1[_i];
      categoryBreakdown.set(error.category, (categoryBreakdown.get(error.category) || 0) + 1);
      severityBreakdown.set(error.severity, (severityBreakdown.get(error.severity) || 0) + 1);
    }
    return {
      totalErrors: recentErrors.length,
      categoryBreakdown: Object.fromEntries(categoryBreakdown),
      severityBreakdown: Object.fromEntries(severityBreakdown),
      patternStats: Object.fromEntries(this.patternStats),
      timeRange: "Last 1 hour",
    };
  };
  /**
   * Get error analysis report
   */
  ErrorAnalysisSystem.prototype.generateAnalysisReport = function () {
    var _a;
    var trends = this.getErrorTrends();
    var criticalErrors = this.errorHistory.filter(
      (error) => error.severity === "critical" && Date.now() - error.timestamp < 3600000,
    );
    var topPatterns = Array.from(this.patternStats.entries())
      .sort((_a, _b) => {
        var a = _a[1];
        var b = _b[1];
        return b - a;
      })
      .slice(0, 5);
    return {
      summary: {
        totalErrorsAnalyzed: this.errorHistory.length,
        recentCriticalErrors: criticalErrors.length,
        topErrorPattern:
          ((_a = topPatterns[0]) === null || _a === void 0 ? void 0 : _a[0]) || "None",
      },
      trends: trends,
      criticalErrors: criticalErrors.slice(-10),
      topPatterns: topPatterns,
      recommendations: this.generateRecommendations(trends),
    };
  };
  /**
   * Generate recommendations based on error patterns
   */
  ErrorAnalysisSystem.prototype.generateRecommendations = (trends) => {
    var recommendations = [];
    if (trends.categoryBreakdown.network > 5) {
      recommendations.push("Consider implementing circuit breaker pattern for network calls");
    }
    if (trends.categoryBreakdown.auth > 3) {
      recommendations.push("Review authentication token refresh mechanism");
    }
    if (trends.severityBreakdown.critical > 0) {
      recommendations.push("Immediate attention required for critical errors");
    }
    if (trends.totalErrors > 20) {
      recommendations.push("High error rate detected - consider system health check");
    }
    return recommendations;
  };
  /**
   * Clean old error history
   */
  ErrorAnalysisSystem.prototype.cleanOldHistory = function () {
    var maxAge = 24 * 60 * 60 * 1000; // 24 hours
    var cutoff = Date.now() - maxAge;
    this.errorHistory = this.errorHistory.filter((error) => error.timestamp > cutoff);
  };
  /**
   * Get error by ID
   */
  ErrorAnalysisSystem.prototype.getErrorById = function (errorId) {
    return this.errorHistory.find((error) => error.errorId === errorId);
  };
  /**
   * Clear all error history
   */
  ErrorAnalysisSystem.prototype.clearHistory = function () {
    this.errorHistory = [];
    this.patternStats.clear();
    this.initializePatternTracking();
  };
  return ErrorAnalysisSystem;
})();
exports.ErrorAnalysisSystem = ErrorAnalysisSystem;
// Export singleton instance
exports.errorAnalysisSystem = new ErrorAnalysisSystem();
