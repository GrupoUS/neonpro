/**
 * TASK-001: Foundation Setup & Baseline
 * Error Tracking and Monitoring System
 * 
 * Comprehensive error monitoring with categorization, alerting,
 * and baseline error rate establishment for enhancement safety.
 */

import { createClient } from '@/lib/supabase/client';

export interface ErrorEvent {
  error_type: 'javascript' | 'api' | 'database' | 'network' | 'validation' | 'authentication';
  error_message: string;
  error_stack?: string;
  error_code?: string;
  route_path: string;
  user_id?: string;
  session_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface ErrorSummary {
  error_type: string;
  count: number;
  first_occurrence: string;
  last_occurrence: string;
  affected_users: number;
  error_rate: number;
}

export interface ErrorThreshold {
  error_type: string;
  max_count_per_hour: number;
  max_rate_percentage: number;
  alert_enabled: boolean;
}

class ErrorTracker {
  private supabase = createClient();
  private errorQueue: ErrorEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private thresholds: ErrorThreshold[] = [
    { error_type: 'javascript', max_count_per_hour: 50, max_rate_percentage: 1, alert_enabled: true },
    { error_type: 'api', max_count_per_hour: 30, max_rate_percentage: 2, alert_enabled: true },
    { error_type: 'database', max_count_per_hour: 10, max_rate_percentage: 0.5, alert_enabled: true },
    { error_type: 'authentication', max_count_per_hour: 20, max_rate_percentage: 1, alert_enabled: true }
  ];

  constructor() {
    this.setupGlobalErrorHandlers();
    this.startErrorFlushing();
  }

  /**
   * Track an error event
   */
  async trackError(
    errorType: ErrorEvent['error_type'],
    error: Error | string,
    context?: {
      route_path?: string;
      user_id?: string;
      session_id?: string;
      severity?: ErrorEvent['severity'];
      metadata?: Record<string, any>;
      error_code?: string;
    }
  ): Promise<void> {
    const errorEvent: ErrorEvent = {
      error_type: errorType,
      error_message: error instanceof Error ? error.message : error,
      error_stack: error instanceof Error ? error.stack : undefined,
      error_code: context?.error_code,
      route_path: context?.route_path || window.location.pathname,
      user_id: context?.user_id,
      session_id: context?.session_id || this.getSessionId(),
      severity: context?.severity || this.determineSeverity(errorType, error),
      metadata: context?.metadata,
      timestamp: new Date().toISOString()
    };

    this.errorQueue.push(errorEvent);

    // Check thresholds for immediate alerting
    await this.checkErrorThresholds(errorEvent);

    // Immediate flush for critical errors
    if (errorEvent.severity === 'critical') {
      await this.flushErrors();
    }
  }

  /**
   * Determine error severity automatically
   */
  private determineSeverity(
    errorType: ErrorEvent['error_type'],
    error: Error | string
  ): ErrorEvent['severity'] {
    const message = error instanceof Error ? error.message : error;
    const lowerMessage = message.toLowerCase();

    // Critical severity indicators
    if (
      lowerMessage.includes('database') ||
      lowerMessage.includes('connection') ||
      lowerMessage.includes('timeout') ||
      lowerMessage.includes('unauthorized') ||
      errorType === 'database' ||
      errorType === 'authentication'
    ) {
      return 'critical';
    }

    // High severity indicators
    if (
      lowerMessage.includes('api') ||
      lowerMessage.includes('server') ||
      lowerMessage.includes('network') ||
      errorType === 'api'
    ) {
      return 'high';
    }

    // Medium severity indicators
    if (
      lowerMessage.includes('validation') ||
      lowerMessage.includes('permission') ||
      errorType === 'validation'
    ) {
      return 'medium';
    }

    // Default to low for JavaScript errors and others
    return 'low';
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError('javascript', event.error || event.message, {
        route_path: window.location.pathname,
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('javascript', event.reason, {
        route_path: window.location.pathname,
        severity: 'high',
        metadata: {
          type: 'unhandled_promise_rejection'
        }
      });
    });

    // Network errors (fetch/XMLHttpRequest)
    this.interceptFetchErrors();
  }

  /**
   * Intercept fetch errors for API monitoring
   */
  private interceptFetchErrors(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Track API errors based on status codes
        if (!response.ok) {
          const url = args[0] instanceof Request ? args[0].url : args[0];
          
          this.trackError('api', `HTTP ${response.status}: ${response.statusText}`, {
            route_path: window.location.pathname,
            severity: response.status >= 500 ? 'critical' : 'medium',
            error_code: response.status.toString(),
            metadata: {
              url: url.toString(),
              status: response.status,
              statusText: response.statusText
            }
          });
        }
        
        return response;
      } catch (error) {
        // Track network errors
        const url = args[0] instanceof Request ? args[0].url : args[0];
        
        this.trackError('network', error instanceof Error ? error : 'Network error', {
          route_path: window.location.pathname,
          severity: 'high',
          metadata: {
            url: url.toString(),
            type: 'network_error'
          }
        });
        
        throw error;
      }
    };
  }

  /**
   * Get current session ID
   */
  private getSessionId(): string {
    return localStorage.getItem('neonpro_session_id') || 'anonymous';
  }

  /**
   * Check error thresholds and trigger alerts
   */
  private async checkErrorThresholds(errorEvent: ErrorEvent): Promise<void> {
    const threshold = this.thresholds.find(t => t.error_type === errorEvent.error_type);
    if (!threshold || !threshold.alert_enabled) return;

    try {
      // Get error count for the last hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { data, error } = await this.supabase
        .from('system_metrics')
        .select('id')
        .eq('metric_type', 'error_count')
        .eq('metric_name', errorEvent.error_type)
        .gte('timestamp', oneHourAgo.toISOString());

      if (error) {
        console.error('Error checking thresholds:', error);
        return;
      }

      const hourlyCount = data?.length || 0;

      // Check if threshold exceeded
      if (hourlyCount >= threshold.max_count_per_hour) {
        await this.triggerErrorAlert(errorEvent.error_type, hourlyCount, threshold);
      }

      // Log error count metric
      await this.logErrorMetric(errorEvent.error_type, hourlyCount + 1);

    } catch (error) {
      console.error('Error in threshold checking:', error);
    }
  }

  /**
   * Trigger error alert
   */
  private async triggerErrorAlert(
    errorType: string,
    count: number,
    threshold: ErrorThreshold
  ): Promise<void> {
    console.error(`🚨 ERROR THRESHOLD EXCEEDED: ${errorType} - ${count} errors in the last hour (threshold: ${threshold.max_count_per_hour})`);

    // Log alert as system metric
    await this.supabase
      .from('system_metrics')
      .insert({
        metric_type: 'error_alert',
        metric_name: `${errorType}_threshold_exceeded`,
        metric_value: count,
        metric_unit: 'count',
        metadata: {
          threshold: threshold.max_count_per_hour,
          error_type: errorType,
          alert_time: new Date().toISOString()
        }
      });

    // Here you would integrate with your alerting system
    // (Slack, email, SMS, etc.)
  }

  /**
   * Log error metric
   */
  private async logErrorMetric(errorType: string, count: number): Promise<void> {
    try {
      await this.supabase
        .from('system_metrics')
        .insert({
          metric_type: 'error_count',
          metric_name: errorType,
          metric_value: count,
          metric_unit: 'count'
        });
    } catch (error) {
      console.error('Error logging error metric:', error);
    }
  }

  /**
   * Get error summary for a time period
   */
  async getErrorSummary(
    hours: number = 24,
    errorType?: ErrorEvent['error_type']
  ): Promise<ErrorSummary[]> {
    try {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - hours);

      let query = this.supabase
        .from('system_metrics')
        .select('metric_name, metric_value, timestamp, metadata')
        .eq('metric_type', 'error_count')
        .gte('timestamp', startDate.toISOString());

      if (errorType) {
        query = query.eq('metric_name', errorType);
      }

      const { data, error } = await query;

      if (error || !data) {
        console.error('Error fetching error summary:', error);
        return [];
      }

      // Group by error type and calculate summary
      const summaryMap: Record<string, ErrorSummary> = {};

      data.forEach(record => {
        const errorType = record.metric_name;
        if (!summaryMap[errorType]) {
          summaryMap[errorType] = {
            error_type: errorType,
            count: 0,
            first_occurrence: record.timestamp,
            last_occurrence: record.timestamp,
            affected_users: 0,
            error_rate: 0
          };
        }

        summaryMap[errorType].count += record.metric_value;
        
        if (record.timestamp < summaryMap[errorType].first_occurrence) {
          summaryMap[errorType].first_occurrence = record.timestamp;
        }
        
        if (record.timestamp > summaryMap[errorType].last_occurrence) {
          summaryMap[errorType].last_occurrence = record.timestamp;
        }
      });

      return Object.values(summaryMap);
    } catch (error) {
      console.error('Error generating error summary:', error);
      return [];
    }
  }

  /**
   * Get error baseline data
   */
  async getErrorBaseline(days: number = 7): Promise<Record<string, any>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('system_metrics')
        .select('metric_name, metric_value, timestamp')
        .eq('metric_type', 'error_count')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp');

      if (error || !data) {
        console.error('Error fetching error baseline:', error);
        return {};
      }

      // Calculate baseline metrics by error type
      const baseline: Record<string, any> = {};

      data.forEach(record => {
        const errorType = record.metric_name;
        if (!baseline[errorType]) {
          baseline[errorType] = {
            total_errors: 0,
            daily_averages: [],
            peak_hour: null,
            trend: 'stable'
          };
        }

        baseline[errorType].total_errors += record.metric_value;
        // Add more baseline calculations as needed
      });

      return baseline;
    } catch (error) {
      console.error('Error calculating error baseline:', error);
      return {};
    }
  }

  /**
   * Flush errors to database
   */
  private async flushErrors(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errorsToFlush = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // Store errors as system metrics for analysis
      const metrics = errorsToFlush.map(error => ({
        metric_type: 'error_event',
        metric_name: error.error_type,
        metric_value: 1,
        metric_unit: 'count',
        metadata: {
          error_message: error.error_message,
          error_stack: error.error_stack,
          error_code: error.error_code,
          route_path: error.route_path,
          user_id: error.user_id,
          session_id: error.session_id,
          severity: error.severity,
          timestamp: error.timestamp,
          ...error.metadata
        }
      }));

      const { error } = await this.supabase
        .from('system_metrics')
        .insert(metrics);

      if (error) {
        console.error('Failed to flush errors:', error);
        // Re-queue errors on failure
        this.errorQueue.unshift(...errorsToFlush);
      }
    } catch (error) {
      console.error('Error flushing errors:', error);
      this.errorQueue.unshift(...errorsToFlush);
    }
  }

  /**
   * Start periodic error flushing
   */
  private startErrorFlushing(): void {
    this.flushInterval = setInterval(() => {
      this.flushErrors();
    }, 5000); // Flush every 5 seconds
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushErrors(); // Final flush
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();

// Utility function for manual error tracking
export async function trackError(
  errorType: ErrorEvent['error_type'],
  error: Error | string,
  context?: Parameters<typeof errorTracker.trackError>[2]
): Promise<void> {
  return errorTracker.trackError(errorType, error, context);
}

// React Hook for error boundary integration
export function useErrorTracking() {
  return {
    trackError: errorTracker.trackError.bind(errorTracker),
    getErrorSummary: errorTracker.getErrorSummary.bind(errorTracker),
    getErrorBaseline: errorTracker.getErrorBaseline.bind(errorTracker)
  };
}

