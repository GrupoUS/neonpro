/**
 * Authentication Performance Tracker
 * 
 * Tracks authentication performance metrics and integrates with 
 * the monitoring infrastructure from TASK-001.
 * 
 * Target: ≤350ms authentication response time
 */

import { trackPerformance } from '@/lib/monitoring/performance';
import { logAnalyticsEvent } from '@/lib/monitoring/analytics';

export interface AuthPerformanceMetrics {
  operation: 'login' | 'logout' | 'session_validation' | 'token_refresh' | 'mfa_verification';
  duration: number;
  success: boolean;
  userId?: string;
  method?: 'email' | 'webauthn' | 'social' | 'mfa';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AuthPerformanceThresholds {
  login: number;           // Target: ≤350ms
  logout: number;          // Target: ≤200ms
  session_validation: number; // Target: ≤100ms
  token_refresh: number;   // Target: ≤250ms
  mfa_verification: number; // Target: ≤500ms
}

class AuthPerformanceTracker {
  private static instance: AuthPerformanceTracker;
  private startTimes: Map<string, number> = new Map();
  
  // Performance thresholds (TASK-002 targets)
  private readonly thresholds: AuthPerformanceThresholds = {
    login: 350,           // ≤350ms target from TASK-002
    logout: 200,
    session_validation: 100,
    token_refresh: 250,
    mfa_verification: 500,
  };

  private constructor() {}

  public static getInstance(): AuthPerformanceTracker {
    if (!AuthPerformanceTracker.instance) {
      AuthPerformanceTracker.instance = new AuthPerformanceTracker();
    }
    return AuthPerformanceTracker.instance;
  }

  /**
   * Start tracking an authentication operation
   */
  public startTracking(operationId: string, operation: AuthPerformanceMetrics['operation']): void {
    const startTime = performance.now();
    this.startTimes.set(operationId, startTime);
    
    // Log operation start for monitoring
    logAnalyticsEvent('auth_operation_start', {
      operation,
      operationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Complete tracking an authentication operation
   */
  public async completeTracking(
    operationId: string,
    operation: AuthPerformanceMetrics['operation'],
    success: boolean,
    metadata?: {
      userId?: string;
      method?: AuthPerformanceMetrics['method'];
      additionalData?: Record<string, any>;
    }
  ): Promise<AuthPerformanceMetrics> {
    const endTime = performance.now();
    const startTime = this.startTimes.get(operationId);
    
    if (!startTime) {
      throw new Error(`No start time found for operation: ${operationId}`);
    }

    const duration = endTime - startTime;
    const timestamp = new Date();
    
    const metrics: AuthPerformanceMetrics = {
      operation,
      duration,
      success,
      userId: metadata?.userId,
      method: metadata?.method,
      timestamp,
      metadata: metadata?.additionalData,
    };

    // Clean up
    this.startTimes.delete(operationId);

    // Track performance using monitoring infrastructure
    await this.recordMetrics(metrics);
    
    // Check if performance meets thresholds
    await this.checkPerformanceThresholds(metrics);

    return metrics;
  }

  /**
   * Record metrics using TASK-001 monitoring infrastructure
   */
  private async recordMetrics(metrics: AuthPerformanceMetrics): Promise<void> {
    try {
      // Use performance monitoring from TASK-001
      await trackPerformance({
        category: 'authentication',
        name: `auth_${metrics.operation}`,
        duration: metrics.duration,
        success: metrics.success,
        metadata: {
          method: metrics.method,
          userId: metrics.userId,
          ...metrics.metadata,
        },
      });

      // Log analytics event
      await logAnalyticsEvent('auth_performance_tracked', {
        operation: metrics.operation,
        duration: metrics.duration,
        success: metrics.success,
        method: metrics.method,
        threshold_met: metrics.duration <= this.thresholds[metrics.operation],
        timestamp: metrics.timestamp.toISOString(),
      });

    } catch (error) {
      console.error('Failed to record auth performance metrics:', error);
    }
  }

  /**
   * Check if performance meets TASK-002 thresholds
   */
  private async checkPerformanceThresholds(metrics: AuthPerformanceMetrics): Promise<void> {
    const threshold = this.thresholds[metrics.operation];
    const thresholdMet = metrics.duration <= threshold;
    
    if (!thresholdMet) {
      // Log performance threshold violation
      await logAnalyticsEvent('auth_performance_threshold_exceeded', {
        operation: metrics.operation,
        duration: metrics.duration,
        threshold,
        excess: metrics.duration - threshold,
        userId: metrics.userId,
        method: metrics.method,
        timestamp: metrics.timestamp.toISOString(),
      });

      // Log warning for monitoring
      console.warn(`Auth performance threshold exceeded: ${metrics.operation} took ${metrics.duration}ms (threshold: ${threshold}ms)`);
    }
  }

  /**
   * Get performance summary for dashboard
   */
  public getPerformanceThresholds(): AuthPerformanceThresholds {
    return { ...this.thresholds };
  }

  /**
   * Utility method for quick performance tracking
   */
  public async trackAuthOperation<T>(
    operation: AuthPerformanceMetrics['operation'],
    fn: () => Promise<T>,
    metadata?: {
      userId?: string;
      method?: AuthPerformanceMetrics['method'];
      additionalData?: Record<string, any>;
    }
  ): Promise<T> {
    const operationId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.startTracking(operationId, operation);
    
    try {
      const result = await fn();
      await this.completeTracking(operationId, operation, true, metadata);
      return result;
    } catch (error) {
      await this.completeTracking(operationId, operation, false, metadata);
      throw error;
    }
  }
}

// Export singleton instance
export const authPerformanceTracker = AuthPerformanceTracker.getInstance();

// Utility functions for common operations
export async function trackLoginPerformance<T>(
  fn: () => Promise<T>,
  metadata?: {
    userId?: string;
    method?: 'email' | 'webauthn' | 'social';
    additionalData?: Record<string, any>;
  }
): Promise<T> {
  return authPerformanceTracker.trackAuthOperation('login', fn, metadata);
}

export async function trackSessionValidation<T>(
  fn: () => Promise<T>,
  userId?: string
): Promise<T> {
  return authPerformanceTracker.trackAuthOperation('session_validation', fn, { userId });
}

export async function trackTokenRefresh<T>(
  fn: () => Promise<T>,
  userId?: string
): Promise<T> {
  return authPerformanceTracker.trackAuthOperation('token_refresh', fn, { userId });
}

export async function trackMFAVerification<T>(
  fn: () => Promise<T>,
  metadata?: {
    userId?: string;
    method?: 'webauthn' | 'totp' | 'sms' | 'backup_code';
    additionalData?: Record<string, any>;
  }
): Promise<T> {
  return authPerformanceTracker.trackAuthOperation('mfa_verification', fn, metadata);
}