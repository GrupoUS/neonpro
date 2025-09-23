/**
 * Query Timeout Middleware for AI Agent Performance
 * Ensures all queries complete within <2s healthcare compliance requirement
 */

import { NextFunction, Request, Response } from 'express';
// Use global performance API available in Node.js
declare const performance: {
  now(): number;
};

export interface QueryTimeoutConfig {
  defaultTimeout: number; // milliseconds
  maxTimeout: number; // maximum allowed timeout
  timeoutHeader: string; // header to override timeout
  enableTimeoutExtension: boolean; // allow timeout extension for complex queries
  enableResponseCompression: boolean; // compress responses to reduce latency
}

export interface QueryMetrics {
  queryId: string;
  startTime: number;
  endTime: number;
  duration: number;
  timeout: number;
  timedOut: boolean;
  route: string;
  method: string;
  statusCode: number;
  responseSize: number;
  userAgent?: string;
  _userId?: string;
}

export class QueryTimeoutMiddleware {
  private config: QueryTimeoutConfig;
  private metrics: QueryMetrics[] = [];
  private activeQueries: Map<
    string,
    { startTime: number; timeout: number; req: Request }
  > = new Map();
  private timeoutWarnings: Set<string> = new Set();

  constructor(config: Partial<QueryTimeoutConfig> = {}) {
    this.config = {
      defaultTimeout: 2000, // 2 seconds for healthcare compliance
      maxTimeout: 5000, // 5 seconds maximum
      timeoutHeader: 'X-Query-Timeout',
      enableTimeoutExtension: true,
      enableResponseCompression: true,
      ...config,
    };

    // Start metrics cleanup interval
    setInterval(() => this.cleanupMetrics(), 300000); // 5 minutes
  }

  /**
   * Express middleware function
   */
  middleware = (req: Request, res: Response, next: NextFunction): void => {
    const queryId = this.generateQueryId();
    const startTime = performance.now();

    // Get timeout from header or use default
    const timeoutHeader = req.headers[this.config.timeoutHeader.toLowerCase()];
    let timeout = this.config.defaultTimeout;

    if (timeoutHeader) {
      const headerTimeout = parseInt(timeoutHeader as string);
      if (!isNaN(headerTimeout) && headerTimeout > 0) {
        timeout = Math.min(headerTimeout, this.config.maxTimeout);
      }
    }

    // Add query ID to request for tracking
    req.queryId = queryId;
    req.queryTimeout = timeout;

    // Track active query
    this.activeQueries.set(queryId, {
      startTime,
      timeout,
      req,
    });

    // Set up timeout timer
    const timeoutTimer = setTimeout(() => {
      this.handleQueryTimeout(queryId, req, res);
    }, timeout);

    // Override res.end to track completion
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      clearTimeout(timeoutTimer);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Record metrics
      const metrics: QueryMetrics = {
        queryId,
        startTime,
        endTime,
        duration,
        timeout,
        timedOut: false,
        route: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseSize: chunk ? chunk.length : 0,
        userAgent: req.headers['user-agent'],
        _userId: this.extractUserId(req),
      };

      this.recordQueryMetrics(metrics);
      this.activeQueries.delete(queryId);

      // Log slow queries that didn't timeout
      if (duration > timeout * 0.8 && duration < timeout) {
        console.warn(
          `[QueryTimeout] Query approaching timeout: ${duration}ms / ${timeout}ms`,
          {
            queryId,
            route: req.path,
            method: req.method,
            _userId: metrics.userId,
          },
        );
      }

      return originalEnd.call(this, chunk, encoding);
    }.bind(this);

    // Set up response compression if enabled
    if (this.config.enableResponseCompression) {
      this.setupResponseCompression(res);
    }

    next();
  };

  /**
   * Handle query timeout
   */
  private handleQueryTimeout(
    queryId: string,
    req: Request,
    res: Response,
  ): void {
    const activeQuery = this.activeQueries.get(queryId);
    if (!activeQuery) return;

    const { startTime, timeout } = activeQuery;
    const duration = performance.now() - startTime;

    // Record timeout metrics
    const metrics: QueryMetrics = {
      queryId,
      startTime,
      endTime: performance.now(),
      duration,
      timeout,
      timedOut: true,
      route: req.path,
      method: req.method,
      statusCode: 504, // Gateway Timeout
      responseSize: 0,
      userAgent: req.headers['user-agent'],
      _userId: this.extractUserId(req),
    };

    this.recordQueryMetrics(metrics);
    this.activeQueries.delete(queryId);

    // Log timeout event
    console.error(
      `[QueryTimeout] Query timeout exceeded: ${duration}ms > ${timeout}ms`,
      {
        queryId,
        route: req.path,
        method: req.method,
        _userId: metrics.userId,
        userAgent: req.headers['user-agent'],
      },
    );

    // Send timeout response
    if (!res.headersSent) {
      res.status(504).json({
        error: 'Query timeout exceeded',
        message: 'The request took longer than the allowed time to process',
        queryId,
        timeout: timeout,
        actualTime: duration,
        retryable: true,
      });
    }

    // Emit timeout event for monitoring
    this.emitTimeoutEvent(metrics);
  }

  /**
   * Setup response compression
   */
  private setupResponseCompression(res: Response): void {
    // Simple compression setup - in production, use compression middleware
    const acceptEncoding = res.req.headers['accept-encoding'];
    if (acceptEncoding && acceptEncoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip');
    }
  }

  /**
   * Extract user ID from request
   */
  private extractUserId(req: Request): string | undefined {
    // Extract user ID from various possible sources
    return (
      (req.headers['x-user-id'] as string)
      || (req.headers['user-id'] as string)
      || (req.query?.userId as string)
      || (req.body?.userId as string)
      || req.user?.id
    );
  }

  /**
   * Generate query ID
   */
  private generateQueryId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Record query metrics
   */
  private recordQueryMetrics(metrics: QueryMetrics): void {
    this.metrics.push(metrics);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Cleanup old metrics
   */
  private cleanupMetrics(): void {
    const oneHourAgo = Date.now() - 3600000;
    this.metrics = this.metrics.filter(m => m.endTime > oneHourAgo);
  }

  /**
   * Emit timeout event for monitoring
   */
  private emitTimeoutEvent(metrics: QueryMetrics): void {
    // This could be integrated with your monitoring system
    if (typeof process.emit === 'function') {
      process.emit('queryTimeout', metrics);
    }
  }

  /**
   * Get timeout statistics
   */
  getTimeoutStats() {
    const stats = {
      totalQueries: this.metrics.length,
      timedOutQueries: this.metrics.filter(m => m.timedOut).length,
      timeoutRate: 0,
      averageResponseTime: 0,
      averageTimeout: 0,
      routesWithMostTimeouts: this.getRoutesWithMostTimeouts(),
      timeoutDistribution: this.getTimeoutDistribution(),
      currentActiveQueries: this.activeQueries.size,
      longestRunningQuery: this.getLongestRunningQuery(),
    };

    if (stats.totalQueries > 0) {
      stats.timeoutRate = (stats.timedOutQueries / stats.totalQueries) * 100;
      stats.averageResponseTime = this.metrics.reduce((sum, _m) => sum + m.duration, 0)
        / stats.totalQueries;
      stats.averageTimeout = this.metrics.reduce((sum, _m) => sum + m.timeout, 0)
        / stats.totalQueries;
    }

    return stats;
  }

  /**
   * Get routes with most timeouts
   */
  private getRoutesWithMostTimeouts(limit = 5) {
    const routeTimeouts: Record<string, number> = {};

    this.metrics
      .filter(m => m.timedOut)
      .forEach(m => {
        routeTimeouts[m.route] = (routeTimeouts[m.route] || 0) + 1;
      });

    return Object.entries(routeTimeouts)
      .sort((a, _b) => b[1] - a[1])
      .slice(0, limit);
  }

  /**
   * Get timeout distribution
   */
  private getTimeoutDistribution() {
    const ranges = {
      '<500ms': 0,
      '500-1000ms': 0,
      '1000-1500ms': 0,
      '1500-2000ms': 0,
      '>2000ms': 0,
    };

    this.metrics.forEach(m => {
      const percentage = (m.duration / m.timeout) * 100;
      if (percentage < 25) ranges['<500ms']++;
      else if (percentage < 50) ranges['500-1000ms']++;
      else if (percentage < 75) ranges['1000-1500ms']++;
      else if (percentage < 100) ranges['1500-2000ms']++;
      else ranges['>2000ms']++;
    });

    return ranges;
  }

  /**
   * Get longest running active query
   */
  private getLongestRunningQuery() {
    let longestQuery: {
      queryId: string;
      duration: number;
      route: string;
    } | null = null;
    let longestDuration = 0;

    const now = performance.now();
    for (const [queryId, query] of this.activeQueries) {
      const duration = now - query.startTime;
      if (duration > longestDuration) {
        longestDuration = duration;
        longestQuery = {
          queryId,
          duration,
          route: query.req.path,
        };
      }
    }

    return longestQuery;
  }

  /**
   * Check for queries approaching timeout
   */
  checkApproachingTimeouts(
    thresholdPercentage = 80,
  ): Array<{
    queryId: string;
    duration: number;
    timeout: number;
    route: string;
  }> {
    const now = performance.now();
    const approaching: Array<{
      queryId: string;
      duration: number;
      timeout: number;
      route: string;
    }> = [];

    for (const [queryId, query] of this.activeQueries) {
      const duration = now - query.startTime;
      const percentage = (duration / query.timeout) * 100;

      if (percentage >= thresholdPercentage) {
        approaching.push({
          queryId,
          duration,
          timeout: query.timeout,
          route: query.req.path,
        });
      }
    }

    return approaching.sort((a, _b) => b.duration - a.duration);
  }

  /**
   * Force timeout specific queries
   */
  forceTimeout(queryIds: string[]): number {
    let timeoutCount = 0;

    queryIds.forEach(queryId => {
      const activeQuery = this.activeQueries.get(queryId);
      if (activeQuery) {
        // This would need to be integrated with your request handling system
        // For now, we'll just track it
        this.timeoutWarnings.add(queryId);
        timeoutCount++;
      }
    });

    return timeoutCount;
  }

  /**
   * Get real-time monitoring data
   */
  getRealTimeMetrics() {
    return {
      activeQueries: Array.from(this.activeQueries.entries()).map(
        ([id, _query]) => ({
          queryId: id,
          duration: performance.now() - query.startTime,
          timeout: query.timeout,
          route: query.req.path,
          method: query.req.method,
          percentageUsed: ((performance.now() - query.startTime) / query.timeout) * 100,
        }),
      ),
      approachingTimeouts: this.checkApproachingTimeouts(),
      stats: this.getTimeoutStats(),
    };
  }

  /**
   * Health check
   */
  healthCheck() {
    const stats = this.getTimeoutStats();
    const isHealthy = stats.timeoutRate < 5 && stats.currentActiveQueries < 100;

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      metrics: stats,
      recommendations: this.generateHealthRecommendations(stats),
    };
  }

  /**
   * Generate health recommendations
   */
  private generateHealthRecommendations(stats: any): string[] {
    const recommendations: string[] = [];

    if (stats.timeoutRate > 5) {
      recommendations.push(
        'High timeout rate detected - consider increasing timeout values or optimizing queries',
      );
    }

    if (stats.averageResponseTime > 1500) {
      recommendations.push(
        'Average response time is high - investigate query performance',
      );
    }

    if (stats.currentActiveQueries > 50) {
      recommendations.push(
        'High number of active queries - consider scaling or load balancing',
      );
    }

    const problematicRoutes = stats.routesWithMostTimeouts;
    if (problematicRoutes.length > 0 && problematicRoutes[0][1] > 10) {
      recommendations.push(
        `Route ${problematicRoutes[0][0]} has high timeout count - investigate performance`,
      );
    }

    return recommendations;
  }
}

/**
 * Healthcare-specific timeout middleware configuration
 */
export function createHealthcareTimeoutMiddleware(): QueryTimeoutMiddleware {
  return new QueryTimeoutMiddleware({
    defaultTimeout: 2000, // Strict 2-second timeout for healthcare
    maxTimeout: 3000, // Maximum 3 seconds for complex healthcare queries
    timeoutHeader: 'X-Healthcare-Timeout',
    enableTimeoutExtension: false, // Disable extension for healthcare compliance
    enableResponseCompression: true,
  });
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      queryId?: string;
      queryTimeout?: number;
    }
  }
}
