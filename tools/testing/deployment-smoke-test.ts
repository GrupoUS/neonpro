#!/usr/bin/env node
/**
 * Deployment Smoke Test Script for NeonPro
 *
 * Comprehensive post-deployment validation script that tests:
 * - Health endpoints functionality
 * - Homepage accessibility
 * - API functionality
 * - Performance validation
 * - Security headers
 * - CORS configuration
 *
 * Usage:
 *   npx tsx tools/testing/deployment-smoke-test.ts [base-url]
 *
 * Examples:
 *   npx tsx tools/testing/deployment-smoke-test.ts https://neonpro.vercel.app
 *   npx tsx tools/testing/deployment-smoke-test.ts http://localhost:3000
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
  details?: Record<string, any>;
}

interface SmokeTestReport {
  timestamp: string;
  baseUrl: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  success: boolean;
  tests: TestResult[];
}

class SmokeTestRunner {
  private baseUrl: string;
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const start = Date.now();
    console.log(`🧪 Running: ${name}`);

    try {
      await testFn();
      const duration = Date.now() - start;
      this.results.push({ name, status: 'pass', duration });
      console.log(`✅ ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - start;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({ name, status: 'fail', duration, error: errorMessage });
      console.log(`❌ ${name} (${duration}ms): ${errorMessage}`);
    }
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 10000,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async testHomepage(): Promise<void> {
    const response = await this.fetchWithTimeout(this.baseUrl);

    if (!response.ok) {
      throw new Error(`Homepage returned ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('text/html')) {
      throw new Error(`Expected HTML content, got: ${contentType}`);
    }

    const html = await response.text();
    if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
      throw new Error('Response does not appear to be valid HTML');
    }
  }

  private async testHealthEndpoint(): Promise<void> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/api/health`);

    if (!response.ok) {
      throw new Error(`Health endpoint returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.status !== 'ok') {
      throw new Error(`Health check failed: ${JSON.stringify(data)}`);
    }
  }

  private async testDetailedHealthEndpoint(): Promise<void> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/health`);

    if (!response.ok) {
      throw new Error(
        `Detailed health endpoint returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();
    if (data.status !== 'healthy') {
      throw new Error(`Detailed health check failed: ${JSON.stringify(data)}`);
    }

    // Validate expected fields
    const requiredFields = ['version', 'uptime', 'timestamp', 'environment'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field in health response: ${field}`);
      }
    }
  }

  private async testOpenAPIEndpoint(): Promise<void> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/api/openapi.json`);

    if (!response.ok) {
      throw new Error(`OpenAPI endpoint returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.openapi) {
      throw new Error('OpenAPI response missing openapi field');
    }

    if (!data.info?.title) {
      throw new Error('OpenAPI response missing info.title field');
    }
  }

  private async testSecurityHeaders(): Promise<void> {
    const response = await this.fetchWithTimeout(this.baseUrl);

    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
    ];

    const missingHeaders: string[] = [];
    for (const header of securityHeaders) {
      if (!response.headers.get(header)) {
        missingHeaders.push(header);
      }
    }

    if (missingHeaders.length > 0) {
      console.warn(`⚠️  Missing security headers: ${missingHeaders.join(', ')}`);
      // Don't fail the test for missing headers, just warn
    }
  }

  private async testCORSHeaders(): Promise<void> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/api/health`, {
      method: 'OPTIONS',
    });

    // CORS preflight should return 200 or 204
    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`CORS preflight failed: ${response.status}`);
    }
  }

  private async testPerformance(): Promise<void> {
    const start = Date.now();
    const response = await this.fetchWithTimeout(this.baseUrl);
    const duration = Date.now() - start;

    if (!response.ok) {
      throw new Error(`Performance test failed: ${response.status}`);
    }

    // Performance thresholds
    const maxResponseTime = 5000; // 5 seconds
    if (duration > maxResponseTime) {
      throw new Error(`Response time too slow: ${duration}ms (max: ${maxResponseTime}ms)`);
    }

    console.log(`📊 Homepage response time: ${duration}ms`);
  }

  public async runAllTests(): Promise<SmokeTestReport> {
    console.log(`🚀 Starting smoke tests for: ${this.baseUrl}`);
    console.log('='.repeat(60));

    // Core functionality tests
    await this.runTest('Homepage Accessibility', () => this.testHomepage());
    await this.runTest('Health Endpoint', () => this.testHealthEndpoint());
    await this.runTest('Detailed Health Endpoint', () => this.testDetailedHealthEndpoint());
    await this.runTest('OpenAPI Endpoint', () => this.testOpenAPIEndpoint());

    // Security and configuration tests
    await this.runTest('Security Headers', () => this.testSecurityHeaders());
    await this.runTest('CORS Configuration', () => this.testCORSHeaders());

    // Performance tests
    await this.runTest('Performance Validation', () => this.testPerformance());

    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;

    const report: SmokeTestReport = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      totalTests: this.results.length,
      passed,
      failed,
      skipped,
      duration: totalDuration,
      success: failed === 0,
      tests: this.results,
    };

    console.log('='.repeat(60));
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
    console.log(`⏱️  Total duration: ${totalDuration}ms`);
    console.log(
      `${report.success ? '✅' : '❌'} Overall result: ${report.success ? 'PASS' : 'FAIL'}`,
    );

    return report;
  }
}

async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:3000';

  console.log('🧪 NeonPro Deployment Smoke Test');
  console.log(`📍 Target URL: ${baseUrl}`);
  console.log('');

  const runner = new SmokeTestRunner(baseUrl);
  const report = await runner.runAllTests();

  // Save report to file
  const reportPath = join(process.cwd(), 'tools/testing/smoke-test-results.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved to: ${reportPath}`);

  // Exit with appropriate code
  process.exit(report.success ? 0 : 1);
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Smoke test runner failed:', error);
    process.exit(1);
  });
}

export { type SmokeTestReport, SmokeTestRunner, type TestResult };
