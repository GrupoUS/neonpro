// Performance tracker enhanced with CommonJS compatibility
export interface PerformanceThresholds {
  authentication: number;
  registration: number;
  databaseQuery: number;
  apiResponse: number;
}

export interface AuthenticationMetrics {
  averageTime: number;
  p95Time: number;
  errorRate: number;
  successRate: number;
}

export class AuthPerformanceTracker {
  private readonly metrics: Map<string, number[]> = new Map();
  private readonly thresholds: PerformanceThresholds = {
    authentication: 200, // ms
    registration: 500, // ms
    databaseQuery: 100, // ms
    apiResponse: 150, // ms
  };

  recordAuthenticationTime(duration: number): void {
    this.recordMetric('authentication', duration);
  }

  recordRegistrationTime(duration: number): void {
    this.recordMetric('registration', duration);
  }

  private recordMetric(type: string, value: number): void {
    const metrics = this.metrics.get(type) || [];
    metrics.push(value);
    this.metrics.set(type, metrics.slice(-100)); // Keep last 100 measurements
  }

  getPerformanceThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  getAuthenticationMetrics(): AuthenticationMetrics {
    const authTimes = this.metrics.get('authentication') || [];
    return {
      averageTime: authTimes.reduce((a, b) => a + b, 0) / authTimes.length || 0,
      p95Time: this.calculateP95(authTimes),
      errorRate: 0.1, // Mock value
      successRate: 99.9, // Mock value
    };
  }

  private calculateP95(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index] || 0;
  }

  isPerformanceAcceptable(): boolean {
    const metrics = this.getAuthenticationMetrics();
    return metrics.p95Time < this.thresholds.authentication;
  }
}

// Export instance
export const authPerformanceTracker = new AuthPerformanceTracker();

// CommonJS compatibility
module.exports = {
  AuthPerformanceTracker,
  authPerformanceTracker,
};
