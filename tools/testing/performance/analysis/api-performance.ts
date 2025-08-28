/**
 * API Performance Testing for NeonPro Healthcare
 *
 * Tests Hono.dev backend API performance, load testing, and healthcare endpoints
 */

import { performance } from "node:perf_hooks";

export interface ApiPerformanceMetrics {
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
    average: number;
  };
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface HealthcareApiMetrics {
  patientEndpoints: EndpointMetrics;
  appointmentEndpoints: EndpointMetrics;
  medicalRecordEndpoints: EndpointMetrics;
  authenticationEndpoints: EndpointMetrics;
  emergencyEndpoints: EndpointMetrics;
}

export interface EndpointMetrics {
  endpoint: string;
  method: string;
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  errorRate: number;
  requestsPerSecond: number;
}

export interface LoadTestConfig {
  baseUrl: string;
  concurrentUsers: number;
  duration: number; // seconds
  rampUpTime: number; // seconds
}

export class ApiPerformanceTester {
  private readonly baseUrl: string;
  private readonly authToken?: string;

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  /**
   * Test single endpoint performance
   */
  async testEndpoint(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    payload?: unknown,
    iterations = 100,
  ): Promise<EndpointMetrics> {
    const responseTimes: number[] = [];
    let errorCount = 0;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const requestStart = performance.now();

      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(this.authToken && {
              Authorization: `Bearer ${this.authToken}`,
            }),
          },
          ...(payload && { body: JSON.stringify(payload) }),
        });

        const requestEnd = performance.now();
        responseTimes.push(requestEnd - requestStart);

        if (!response.ok) {
          errorCount++;
        }
      } catch {
        errorCount++;
        responseTimes.push(10_000); // 10s timeout penalty
      }
    }

    const totalTime = performance.now() - startTime;

    responseTimes.sort((a, b) => a - b);

    return {
      endpoint,
      method,
      averageResponseTime:
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      maxResponseTime: Math.max(...responseTimes),
      minResponseTime: Math.min(...responseTimes),
      errorRate: errorCount / iterations,
      requestsPerSecond: iterations / (totalTime / 1000),
    };
  } /**
   * Test healthcare-specific API endpoints
   */

  async testHealthcareEndpoints(): Promise<HealthcareApiMetrics> {
    const results: HealthcareApiMetrics = {
      patientEndpoints: await this.testEndpoint("/api/patients", "GET"),
      appointmentEndpoints: await this.testEndpoint("/api/appointments", "GET"),
      medicalRecordEndpoints: await this.testEndpoint(
        "/api/medical-records",
        "GET",
      ),
      authenticationEndpoints: await this.testEndpoint(
        "/api/auth/validate",
        "POST",
        {
          token: this.authToken,
        },
      ),
      emergencyEndpoints: await this.testEndpoint(
        "/api/emergency/patient-data",
        "GET",
      ),
    };

    return results;
  }

  /**
   * Run load testing simulation
   */
  async runLoadTest(config: LoadTestConfig): Promise<ApiPerformanceMetrics> {
    const { concurrentUsers, duration, rampUpTime } = config;
    const responseTimes: number[] = [];
    let totalRequests = 0;
    let totalErrors = 0;

    const startTime = performance.now();
    const endTime = startTime + duration * 1000;

    // Simulate concurrent users with ramp-up
    const userPromises: Promise<void>[] = [];

    for (let user = 0; user < concurrentUsers; user++) {
      const userDelay = (rampUpTime * 1000 * user) / concurrentUsers;

      userPromises.push(
        this.simulateUser(userDelay, endTime, responseTimes).then((results) => {
          return;
          totalRequests += results.requests;
          totalErrors += results.errors;
        }),
      );
    }

    await Promise.all(userPromises);

    const totalTime = performance.now() - startTime;
    responseTimes.sort((a, b) => a - b);

    return {
      responseTime: {
        average:
          responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        p50: this.percentile(responseTimes, 0.5),
        p95: this.percentile(responseTimes, 0.95),
        p99: this.percentile(responseTimes, 0.99),
      },
      throughput: totalRequests / (totalTime / 1000),
      errorRate: totalErrors / totalRequests,
      memoryUsage: 0, // Would need process monitoring
      cpuUsage: 0, // Would need process monitoring
    };
  }
  private async simulateUser(
    startDelay: number,
    endTime: number,
    responseTimes: number[],
  ): Promise<{ requests: number; errors: number }> {
    await new Promise((resolve) => setTimeout(resolve, startDelay));

    let requests = 0;
    let errors = 0;

    while (performance.now() < endTime) {
      const requestStart = performance.now();

      try {
        const response = await fetch(`${this.baseUrl}/api/health`);
        const requestEnd = performance.now();

        responseTimes.push(requestEnd - requestStart);
        requests++;

        if (!response.ok) {
          errors++;
        }
      } catch {
        errors++;
        responseTimes.push(10_000); // Timeout penalty
      }

      // Brief pause between requests (simulating user behavior)
      await new Promise((resolve) =>
        setTimeout(resolve, 100 + Math.random() * 400),
      );
    }

    return { requests, errors };
  }

  private percentile(sortedArray: number[], percentile: number): number {
    const index = Math.ceil(sortedArray.length * percentile) - 1;
    return sortedArray[index] || 0;
  }

  /**
   * Generate performance test report
   */
  async generateReport(
    metrics: ApiPerformanceMetrics,
    healthcareMetrics: HealthcareApiMetrics,
    _outputPath: string,
  ): Promise<void> {}

  private generateRecommendations(
    metrics: ApiPerformanceMetrics,
    healthcareMetrics: HealthcareApiMetrics,
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.responseTime.p95 > 100) {
      recommendations.push(
        "P95 response time exceeds 100ms. Consider API optimization.",
      );
    }

    if (metrics.errorRate > 0.01) {
      recommendations.push(
        "Error rate exceeds 1%. Investigate error handling.",
      );
    }

    if (healthcareMetrics.emergencyEndpoints.averageResponseTime > 500) {
      recommendations.push(
        "Emergency endpoints are slow. Critical for patient safety.",
      );
    }

    return recommendations;
  }
}
