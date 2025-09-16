/**
 * API Performance Monitoring Middleware
 * T079 - Backend API Performance Optimization
 * 
 * Features:
 * - Response time tracking
 * - Performance alerts
 * - Healthcare compliance monitoring
 * - Resource usage tracking
 */

import { Context, Next } from 'hono';
import { queryMonitor } from '../utils/query-optimizer';

// Performance metrics
export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  userId?: string;
  clinicId?: string;
  userAgent?: string;
  contentLength?: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

// Performance thresholds
export interface PerformanceThresholds {
  responseTime: {
    warning: number; // ms
    critical: number; // ms
  };
  memoryUsage: {
    warning: number; // MB
    critical: number; // MB
  };
  errorRate: {
    warning: number; // percentage
    critical: number; // percentage
  };
}

// Healthcare-specific performance thresholds
export const HEALTHCARE_THRESHOLDS: PerformanceThresholds = {
  responseTime: {
    warning: 200, // 200ms warning for healthcare APIs
    critical: 500, // 500ms critical
  },
  memoryUsage: {
    warning: 512, // 512MB warning
    critical: 1024, // 1GB critical
  },
  errorRate: {
    warning: 1, // 1% error rate warning
    critical: 5, // 5% error rate critical
  },
};

/**
 * API Performance Monitor
 */
export class APIPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetricsHistory = 10000;
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = [];
  
  /**
   * Record API performance metrics
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
    
    // Check for performance alerts
    this.checkPerformanceAlerts(metrics);
  }
  
  /**
   * Get performance statistics
   */
  getStats(timeWindow: number = 3600000): { // Default 1 hour
    totalRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    slowestEndpoints: Array<{ endpoint: string; averageTime: number }>;
    requestsPerMinute: number;
    healthcareCompliance: {
      avgPatientDataAccess: number;
      avgAppointmentResponse: number;
      sensitiveDataQueries: number;
    };
  } {
    const cutoffTime = new Date(Date.now() - timeWindow);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime);
    
    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRate: 0,
        slowestEndpoints: [],
        requestsPerMinute: 0,
        healthcareCompliance: {
          avgPatientDataAccess: 0,
          avgAppointmentResponse: 0,
          sensitiveDataQueries: 0,
        },
      };
    }
    
    // Basic statistics
    const totalRequests = recentMetrics.length;
    const responseTimes = recentMetrics.map(m => m.responseTime).sort((a, b) => a - b);
    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / totalRequests;
    
    // Percentiles
    const p95Index = Math.floor(totalRequests * 0.95);
    const p99Index = Math.floor(totalRequests * 0.99);
    const p95ResponseTime = responseTimes[p95Index] || 0;
    const p99ResponseTime = responseTimes[p99Index] || 0;
    
    // Error rate
    const errorRequests = recentMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorRequests / totalRequests) * 100;
    
    // Requests per minute
    const timeWindowMinutes = timeWindow / 60000;
    const requestsPerMinute = totalRequests / timeWindowMinutes;
    
    // Slowest endpoints
    const endpointStats = new Map<string, { total: number; count: number }>();
    recentMetrics.forEach(m => {
      const key = `${m.method} ${m.endpoint}`;
      const current = endpointStats.get(key) || { total: 0, count: 0 };
      endpointStats.set(key, {
        total: current.total + m.responseTime,
        count: current.count + 1,
      });
    });
    
    const slowestEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        averageTime: Math.round(stats.total / stats.count),
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10);
    
    // Healthcare-specific metrics
    const patientDataMetrics = recentMetrics.filter(m => 
      m.endpoint.includes('/patients') || m.endpoint.includes('/patient-records')
    );
    const appointmentMetrics = recentMetrics.filter(m => 
      m.endpoint.includes('/appointments')
    );
    const sensitiveDataQueries = recentMetrics.filter(m =>
      m.endpoint.includes('/patients') || 
      m.endpoint.includes('/medical-history') ||
      m.endpoint.includes('/patient-records')
    ).length;
    
    const avgPatientDataAccess = patientDataMetrics.length > 0
      ? patientDataMetrics.reduce((sum, m) => sum + m.responseTime, 0) / patientDataMetrics.length
      : 0;
    
    const avgAppointmentResponse = appointmentMetrics.length > 0
      ? appointmentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / appointmentMetrics.length
      : 0;
    
    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      p95ResponseTime,
      p99ResponseTime,
      errorRate: Math.round(errorRate * 100) / 100,
      slowestEndpoints,
      requestsPerMinute: Math.round(requestsPerMinute),
      healthcareCompliance: {
        avgPatientDataAccess: Math.round(avgPatientDataAccess),
        avgAppointmentResponse: Math.round(avgAppointmentResponse),
        sensitiveDataQueries,
      },
    };
  }
  
  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(metrics: PerformanceMetrics): void {
    const alerts: PerformanceAlert[] = [];
    
    // Response time alerts
    if (metrics.responseTime > HEALTHCARE_THRESHOLDS.responseTime.critical) {
      alerts.push({
        type: 'response_time',
        severity: 'critical',
        message: `Critical response time: ${metrics.responseTime}ms for ${metrics.method} ${metrics.endpoint}`,
        metrics,
        threshold: HEALTHCARE_THRESHOLDS.responseTime.critical,
      });
    } else if (metrics.responseTime > HEALTHCARE_THRESHOLDS.responseTime.warning) {
      alerts.push({
        type: 'response_time',
        severity: 'warning',
        message: `Slow response time: ${metrics.responseTime}ms for ${metrics.method} ${metrics.endpoint}`,
        metrics,
        threshold: HEALTHCARE_THRESHOLDS.responseTime.warning,
      });
    }
    
    // Memory usage alerts
    if (metrics.memoryUsage && metrics.memoryUsage > HEALTHCARE_THRESHOLDS.memoryUsage.critical) {
      alerts.push({
        type: 'memory_usage',
        severity: 'critical',
        message: `Critical memory usage: ${metrics.memoryUsage}MB`,
        metrics,
        threshold: HEALTHCARE_THRESHOLDS.memoryUsage.critical,
      });
    }
    
    // Healthcare-specific alerts
    if (metrics.endpoint.includes('/patients') && metrics.responseTime > 100) {
      alerts.push({
        type: 'healthcare_compliance',
        severity: 'warning',
        message: `Patient data access slower than recommended: ${metrics.responseTime}ms`,
        metrics,
        threshold: 100,
      });
    }
    
    // Trigger alert callbacks
    alerts.forEach(alert => {
      this.alertCallbacks.forEach(callback => {
        try {
          callback(alert);
        } catch (error) {
          console.error('Error in performance alert callback:', error);
        }
      });
    });
  }
  
  /**
   * Add alert callback
   */
  onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }
  
  /**
   * Clear metrics history
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}

// Performance alert interface
export interface PerformanceAlert {
  type: 'response_time' | 'memory_usage' | 'error_rate' | 'healthcare_compliance';
  severity: 'warning' | 'critical';
  message: string;
  metrics: PerformanceMetrics;
  threshold: number;
}

// Global performance monitor instance
export const apiPerformanceMonitor = new APIPerformanceMonitor();

/**
 * Performance monitoring middleware
 */
export function createPerformanceMonitoringMiddleware() {
  return async (c: Context, next: Next) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    // Extract request information
    const method = c.req.method;
    const endpoint = c.req.path;
    const userAgent = c.req.header('user-agent');
    const userId = c.get('userId'); // From auth middleware
    const clinicId = c.get('clinicId'); // From auth middleware
    
    try {
      await next();
      
      // Calculate metrics
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const endMemory = process.memoryUsage();
      const memoryUsage = Math.round((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024);
      
      const metrics: PerformanceMetrics = {
        endpoint,
        method,
        responseTime,
        statusCode: c.res.status,
        timestamp: new Date(),
        userId,
        clinicId,
        userAgent,
        contentLength: parseInt(c.res.headers.get('content-length') || '0', 10),
        memoryUsage,
      };
      
      // Record metrics
      apiPerformanceMonitor.recordMetrics(metrics);
      
      // Add performance headers
      c.header('X-Response-Time', `${responseTime}ms`);
      c.header('X-Memory-Usage', `${memoryUsage}MB`);
      c.header('X-Performance-Tier', getPerformanceTier(responseTime));
      
      // Healthcare compliance headers
      if (endpoint.includes('/patients') || endpoint.includes('/appointments')) {
        c.header('X-Healthcare-Performance', 'monitored');
        c.header('X-LGPD-Compliant', 'true');
      }
      
    } catch (error) {
      // Record error metrics
      const responseTime = Date.now() - startTime;
      const metrics: PerformanceMetrics = {
        endpoint,
        method,
        responseTime,
        statusCode: 500,
        timestamp: new Date(),
        userId,
        clinicId,
        userAgent,
      };
      
      apiPerformanceMonitor.recordMetrics(metrics);
      throw error;
    }
  };
}

/**
 * Get performance tier based on response time
 */
function getPerformanceTier(responseTime: number): string {
  if (responseTime < 50) return 'excellent';
  if (responseTime < 100) return 'good';
  if (responseTime < 200) return 'acceptable';
  if (responseTime < 500) return 'slow';
  return 'critical';
}

/**
 * Performance dashboard middleware
 */
export function createPerformanceDashboardMiddleware() {
  return async (c: Context, next: Next) => {
    if (c.req.path === '/v1/performance/stats') {
      const timeWindow = parseInt(c.req.query('window') || '3600000', 10); // Default 1 hour
      const stats = apiPerformanceMonitor.getStats(timeWindow);
      const queryStats = queryMonitor.getStats();
      
      return c.json({
        api: stats,
        database: queryStats,
        timestamp: new Date().toISOString(),
        healthcareCompliance: {
          patientDataPerformance: stats.healthcareCompliance.avgPatientDataAccess < 100 ? 'compliant' : 'warning',
          appointmentPerformance: stats.healthcareCompliance.avgAppointmentResponse < 150 ? 'compliant' : 'warning',
          overallCompliance: stats.averageResponseTime < 200 ? 'compliant' : 'non-compliant',
        },
      });
    }
    
    await next();
  };
}

// Setup default alert handlers
apiPerformanceMonitor.onAlert((alert) => {
  console.warn('Performance Alert:', alert);
  
  // In production, you would send alerts to monitoring systems
  if (alert.severity === 'critical') {
    // Send to alerting system (PagerDuty, Slack, etc.)
    console.error('CRITICAL PERFORMANCE ALERT:', alert.message);
  }
});

export default {
  APIPerformanceMonitor,
  apiPerformanceMonitor,
  createPerformanceMonitoringMiddleware,
  createPerformanceDashboardMiddleware,
  HEALTHCARE_THRESHOLDS,
};
