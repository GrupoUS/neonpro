/**
 * Error Tracking Bridge for Legacy Compatibility
 *
 * This module provides backward compatibility between the old error tracking
 * system and the new healthcare-compliant error tracking system.
 */

import type {
  Breadcrumb as LegacyBreadcrumb,
  ErrorContext as LegacyErrorContext,
  ErrorEvent as LegacyErrorEvent,
  ErrorTrackingConfig as LegacyConfig,
} from "../lib/error-tracking";
import {
  createHealthcareErrorTracker,
  HealthcareErrorTracker,
} from "./error-tracking";

// Global instance for backward compatibility
let legacyCompatibleTracker: LegacyErrorTracker | null = null;

/**
 * Legacy-compatible error tracker that wraps the new healthcare error tracker
 */
class LegacyErrorTracker {
  private healthcareTracker: HealthcareErrorTracker;
  private breadcrumbs: LegacyBreadcrumb[] = [];
  private config: LegacyConfig;

  constructor(config: Partial<LegacyConfig> = {}) {
    this.healthcareTracker = createHealthcareErrorTracker();
    this.config = {
      enabled: true,
      environment: (process.env.NODE_ENV as any) || "development",
      sampleRate: 1.0,
      maxBreadcrumbs: 100,
      ignoreErrors: [],
      ignoreUrls: [],
      ...config,
    };
  }

  /**
   * Capture an exception (legacy compatibility)
   */
  captureException(
    error: Error,
    context: Partial<LegacyErrorContext> = {},
    extra?: Record<string, any>,
  ): string {
    if (!this.config.enabled) {
      return "disabled";
    }

    // Convert legacy context to healthcare context
    const healthcareContext = this.convertContext(context);

    // Use healthcare tracker
    return this.healthcareTracker.captureException(
      error,
      healthcareContext,
      extra,
    );
  }

  /**
   * Capture a message (legacy compatibility)
   */
  captureMessage(
    message: string,
    level: LegacyErrorEvent["level"] = "info",
    context: Partial<LegacyErrorContext> = {},
    extra?: Record<string, any>,
  ): string {
    if (!this.config.enabled) {
      return "disabled";
    }

    // Convert legacy context to healthcare context
    const healthcareContext = this.convertContext(context);

    // Map level to severity
    const severity =
      level === "error" ? "high" : level === "warning" ? "medium" : "low";

    // Use healthcare tracker
    return this.healthcareTracker.captureMessage(
      message,
      severity,
      healthcareContext,
      extra,
    );
  }

  /**
   * Add a breadcrumb (legacy compatibility)
   */
  addBreadcrumb(
    message: string,
    type: LegacyBreadcrumb["type"] = "info",
    data?: Record<string, any>,
    level: LegacyBreadcrumb["level"] = "info",
  ): void {
    if (!this.config.enabled) {
      return;
    }

    // Add to legacy breadcrumbs for compatibility
    const breadcrumb: LegacyBreadcrumb = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      message,
      data,
      level,
    };

    this.breadcrumbs.push(breadcrumb);

    // Limit breadcrumbs
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.config.maxBreadcrumbs);
    }

    // Also add to healthcare tracker
    this.healthcareTracker.addBreadcrumb(message, data);
  }

  /**
   * Track an error event (legacy compatibility)
   */
  async trackError(
    error: Error,
    context: Partial<LegacyErrorContext> = {},
  ): Promise<string> {
    if (!this.config.enabled) {
      return "disabled";
    }
    const healthcareContext = this.convertContext(context);
    return await this.healthcareTracker.trackError(error, healthcareContext);
  }

  /**
   * Log an audit event (legacy compatibility)
   */
  async logAuditEvent(
    event: { action: string; subject?: string; metadata?: Record<string, any> },
    context: Partial<LegacyErrorContext> = {},
  ): Promise<void> {
    if (!this.config.enabled) return;
    // Map to breadcrumb + structured context; defer to healthcare tracker if audit API exists later
    const { action, subject, metadata } = event;
    const breadcrumbData = { action, subject, ...metadata };
    this.addBreadcrumb(
      `audit:${action}` + (subject ? `:${subject}` : ""),
      "info",
      breadcrumbData,
    );
  }

  /**
   * Clear all breadcrumbs (legacy compatibility)
   */
  clearBreadcrumbs(): void {
    this.breadcrumbs = [];
    this.healthcareTracker.clearBreadcrumbs();
  }

  /**
   * Extract context from Hono request (legacy compatibility)
   */
  extractContextFromHono(c: any): LegacyErrorContext {
    const context: LegacyErrorContext = {
      requestId: c.get("requestId"),
      method: c.req.method,
      endpoint: c.req.path,
      userAgent: c.req.header("user-agent"),
      ip: c.req.header("x-forwarded-for") || c.req.header("x-real-ip"),
      statusCode: c.res?.status,
    };

    // Extract user context
    const user = c.get("user");
    if (user) {
      context.userId = user.id;
    }

    // Extract healthcare context
    const patientId = c.req.param("patientId") || c.req.query("patientId");
    const clinicId = c.req.param("clinicId") || c.req.query("clinicId");

    if (patientId) {
      context.patientId = patientId;
    }

    if (clinicId) {
      context.clinicId = clinicId;
    }

    return context;
  }

  /**
   * Set user context (legacy compatibility)
   */
  setUserContext(user: { id: string; email?: string; name?: string }): void {
    this.addBreadcrumb("User context set", "info", { userId: user.id });
    this.healthcareTracker.setUserContext(user.id);
  }

  /**
   * Clear user context (legacy compatibility)
   */
  clearUserContext(): void {
    this.addBreadcrumb("User context cleared", "info");
    this.healthcareTracker.clearUserContext();
  }

  /**
   * Set extra context (legacy compatibility)
   */
  setExtraContext(extra: Record<string, any>): void {
    this.addBreadcrumb("Extra context set", "info", extra);
  }

  /**
   * Set tags (legacy compatibility)
   */
  setTags(tags: Record<string, string>): void {
    this.addBreadcrumb("Tags set", "info", tags);
  }

  /**
   * Get current breadcrumbs (legacy compatibility)
   */
  getBreadcrumbs(): LegacyBreadcrumb[] {
    return [...this.breadcrumbs];
  }

  /**
   * Get configuration (legacy compatibility)
   */
  getConfig(): LegacyConfig {
    return { ...this.config };
  }

  /**
   * Update configuration (legacy compatibility)
   */
  updateConfig(config: Partial<LegacyConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Enable/disable error tracking (legacy compatibility)
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  /**
   * Get statistics (legacy compatibility)
   */
  getStats(): {
    enabled: boolean;
    breadcrumbCount: number;
    environment: string;
    sampleRate: number;
  } {
    return {
      enabled: this.config.enabled,
      breadcrumbCount: this.breadcrumbs.length,
      environment: this.config.environment,
      sampleRate: this.config.sampleRate,
    };
  }

  /**
   * Get the underlying healthcare tracker
   */
  getHealthcareTracker(): HealthcareErrorTracker {
    return this.healthcareTracker;
  }

  /**
   * Convert legacy context to healthcare context
   */
  private convertContext(legacyContext: Partial<LegacyErrorContext>) {
    return {
      requestId: legacyContext.requestId,
      userId: legacyContext.userId,
      userAgent: legacyContext.userAgent,
      ip: legacyContext.ip,
      endpoint: legacyContext.endpoint,
      method: legacyContext.method,
      statusCode: legacyContext.statusCode,
      patientId: legacyContext.patientId,
      clinicId: legacyContext.clinicId,
    };
  }
}

/**
 * Get singleton legacy-compatible tracker instance
 */
export function getLegacyErrorTracker(
  config?: Partial<LegacyConfig>,
): LegacyErrorTracker {
  if (!legacyCompatibleTracker) {
    legacyCompatibleTracker = new LegacyErrorTracker(config);
  }
  return legacyCompatibleTracker;
}

/**
 * Initialize error tracking with legacy compatibility
 */
export function initializeLegacyErrorTracking(
  config?: Partial<LegacyConfig>,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const tracker = getLegacyErrorTracker(config);

      // Add initialization breadcrumb
      tracker.addBreadcrumb("Legacy error tracking initialized", "info", {
        environment: tracker.getConfig().environment,
        enabled: tracker.getConfig().enabled,
        timestamp: new Date().toISOString(),
      });

      console.log("[Legacy Error Tracker] Initialized successfully");
      resolve();
    } catch (error) {
      console.error("[Legacy Error Tracker] Failed to initialize:", error);
      reject(error);
    }
  });
}

// Export singleton instance for backward compatibility
export const errorTracker = getLegacyErrorTracker();
// Import the missing healthcare error factory
import {
  createHealthcareError,
  ErrorCategory,
  ErrorSeverity,
} from "./createHealthcareError";

// Re-export the missing functions and types
export { createHealthcareError, ErrorCategory, ErrorSeverity };

// Export both legacy and new implementations
export { LegacyErrorTracker };
export type {
  LegacyBreadcrumb,
  LegacyConfig,
  LegacyErrorContext,
  LegacyErrorEvent,
};
