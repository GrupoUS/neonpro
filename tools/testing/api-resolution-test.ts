#!/usr/bin/env tsx

/**
 * API Resolution Verification Test
 *
 * Tests to verify that the Vercel framework configuration fix has resolved
 * the API routing issues. This script validates that API endpoints are now
 * served by the Hono API instead of being intercepted by the web application.
 */

interface TestResult {
  name: string;
  status: 'pass' | 'fail';
  duration: number;
  details?: string;
  error?: string;
}

interface ApiResolutionReport {
  timestamp: string;
  baseUrl: string;
  totalTests: number;
  passed: number;
  failed: number;
  success: boolean;
  tests: TestResult[];
  summary: {
    webAppWorking: boolean;
    apiEndpointsResolved: boolean;
    frameworkMismatchFixed: boolean;
    readyForProduction: boolean;
  };
}

class ApiResolutionTester {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  private async fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'NeonPro-API-Resolution-Test/1.0',
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    console.log(`🧪 Running: ${name}`);

    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({ name, status: 'pass', duration });
      console.log(`✅ ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({ name, status: 'fail', duration, error: errorMessage });
      console.log(`❌ ${name} (${duration}ms): ${errorMessage}`);
    }
  }

  private async testWebAppStillWorking(): Promise<void> {
    const response = await this.fetchWithTimeout(this.baseUrl);

    if (!response.ok) {
      throw new Error(`Homepage returned ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    if (!html.includes('NEON PRO') && !html.includes('NeonPro')) {
      throw new Error('Homepage content does not contain expected NeonPro branding');
    }
  }

  private async testApiHealthEndpoint(): Promise<void> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/api/health`);

    if (!response.ok) {
      throw new Error(`API health endpoint returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Check that it's NOT the web app response
    if (data.service === 'neonpro-web') {
      throw new Error(
        'API health endpoint still returning web app response - framework mismatch not resolved',
      );
    }

    // Check that it's the correct API response
    if (data.status !== 'ok') {
      throw new Error(
        `API health endpoint returned incorrect status: ${data.status} (expected: 'ok')`,
      );
    }

    console.log(`📊 API Health Response: ${JSON.stringify(data)}`);
  }

  private async testApiV1HealthEndpoint(): Promise<void> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/health`);

    if (!response.ok) {
      throw new Error(`API v1 health endpoint returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Check for expected v1 health response format
    if (data.status !== 'healthy') {
      throw new Error(
        `API v1 health endpoint returned incorrect status: ${data.status} (expected: 'healthy')`,
      );
    }

    if (data.version !== 'v1') {
      throw new Error(
        `API v1 health endpoint missing version field: ${data.version} (expected: 'v1')`,
      );
    }

    // Validate expected fields
    const requiredFields = ['uptime', 'timestamp', 'environment'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field in v1 health response: ${field}`);
      }
    }

    console.log(`📊 API v1 Health Response: ${JSON.stringify(data)}`);
  }

  private async testOpenApiEndpoint(): Promise<void> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/api/openapi.json`);

    if (!response.ok) {
      throw new Error(`OpenAPI endpoint returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Check for OpenAPI specification format
    if (!data.openapi) {
      throw new Error('OpenAPI endpoint response missing openapi field');
    }

    if (!data.info || !data.info.title) {
      throw new Error('OpenAPI endpoint response missing info.title field');
    }

    if (data.info.title !== 'NeonPro API') {
      throw new Error(
        `OpenAPI endpoint returned incorrect title: ${data.info.title} (expected: 'NeonPro API')`,
      );
    }

    console.log(`📊 OpenAPI Response: ${JSON.stringify(data)}`);
  }

  private async testEnvironmentValidation(): Promise<void> {
    // Test that the API is properly validating environment variables
    // by checking if the health endpoint includes environment info
    const response = await this.fetchWithTimeout(`${this.baseUrl}/api/v1/health`);

    if (!response.ok) {
      throw new Error('Cannot test environment validation - v1 health endpoint not accessible');
    }

    const data = await response.json();

    if (!data.environment) {
      throw new Error('API v1 health response missing environment information');
    }

    // Check that environment validation is working (should be production)
    if (data.environment.NODE_ENV !== 'production') {
      console.log(`⚠️  Environment NODE_ENV: ${data.environment.NODE_ENV} (expected: production)`);
    }

    console.log(`📊 Environment Validation: ${JSON.stringify(data.environment)}`);
  }

  public async runAllTests(): Promise<ApiResolutionReport> {
    console.log(`🚀 Starting API Resolution Verification Tests`);
    console.log(`📍 Target URL: ${this.baseUrl}`);
    console.log('='.repeat(60));

    // Core resolution tests
    await this.runTest('Web App Still Working', () => this.testWebAppStillWorking());
    await this.runTest('API Health Endpoint Resolution', () => this.testApiHealthEndpoint());
    await this.runTest('API v1 Health Endpoint Resolution', () => this.testApiV1HealthEndpoint());
    await this.runTest('OpenAPI Endpoint Resolution', () => this.testOpenApiEndpoint());
    await this.runTest('Environment Validation Working', () => this.testEnvironmentValidation());

    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`📊 Test Results: ${passed} passed, ${failed} failed, 0 skipped`);
    console.log(`⏱️  Total duration: ${totalDuration}ms`);

    const success = failed === 0;
    console.log(`${success ? '✅' : '❌'} Overall result: ${success ? 'PASS' : 'FAIL'}`);

    // Generate summary
    const summary = {
      webAppWorking: this.results.find(r => r.name === 'Web App Still Working')?.status === 'pass',
      apiEndpointsResolved: this.results.filter(r =>
        r.name.includes('API') && r.name.includes('Resolution')
      ).every(r => r.status === 'pass'),
      frameworkMismatchFixed:
        this.results.find(r => r.name === 'API Health Endpoint Resolution')?.status === 'pass',
      readyForProduction: success,
    };

    const report: ApiResolutionReport = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      totalTests: this.results.length,
      passed,
      failed,
      success,
      tests: this.results,
      summary,
    };

    // Save report
    const reportPath = '/root/neonpro/tools/testing/api-resolution-results.json';
    const fs = await import('fs/promises');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${reportPath}`);

    return report;
  }
}

// Main execution
async function main() {
  const baseUrl = process.argv[2] || 'https://neonpro.vercel.app';

  console.log('🧪 NeonPro API Resolution Verification Test');
  console.log(`📍 Target URL: ${baseUrl}\n`);

  const tester = new ApiResolutionTester(baseUrl);
  const report = await tester.runAllTests();

  // Exit with appropriate code
  process.exit(report.success ? 0 : 1);
}

if (import.meta.main) {
  main().catch(console.error);
}
