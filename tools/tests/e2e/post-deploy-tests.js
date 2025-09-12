#!/usr/bin/env node

/**
 * 🧪 NEONPRO - Post-Deploy E2E Tests
 * Comprehensive end-to-end testing suite for production validation
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class E2ETestSuite {
  constructor() {
    this.baseUrl = process.env.DEPLOYMENT_URL || 'localhost';
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async runTest(name, testFunction) {
    this.totalTests++;
    console.log(`🧪 Running: ${name}`);
    
    try {
      const startTime = Date.now();
      await testFunction();
      const duration = Date.now() - startTime;
      
      this.passedTests++;
      this.results.push({
        name,
        status: 'PASSED',
        duration,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ ${name} - PASSED (${duration}ms)`);
      
    } catch (error) {
      this.failedTests++;
      this.results.push({
        name,
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`❌ ${name} - FAILED: ${error.message}`);
    }
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        hostname: this.baseUrl,
        port: 443,
        path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NeonPro-E2E-Tests/1.0',
          ...options.headers
        },
        timeout: options.timeout || 10000
      };

      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = {
              statusCode: res.statusCode,
              headers: res.headers,
              body: data,
              json: data ? JSON.parse(data) : null
            };
            resolve(response);
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data,
              json: null
            });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  // Test 1: Health Check Endpoints
  async testHealthChecks() {
    const endpoints = [
      '/api/health',
      '/api/v1/health'
    ];

    for (const endpoint of endpoints) {
      const response = await this.makeRequest(endpoint);
      
      if (response.statusCode !== 200) {
        throw new Error(`Health check ${endpoint} returned ${response.statusCode}`);
      }

      const health = response.json;
      if (!health || health.status !== 'ok') {
        throw new Error(`Health check ${endpoint} returned invalid status`);
      }
    }
  }

  // Test 2: Authentication Flow
  async testAuthenticationFlow() {
    // Test login endpoint exists and returns proper error for invalid credentials
    const response = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'test@invalid.com',
        password: 'invalid'
      }
    });

    // Should return 400 or 401, not 500 (server error)
    if (response.statusCode >= 500) {
      throw new Error(`Auth endpoint returned server error: ${response.statusCode}`);
    }
  }

  // Test 3: API Endpoints Accessibility
  async testAPIEndpoints() {
    const endpoints = [
      { path: '/api/patients', expectedStatus: [401, 403] }, // Should require auth
      { path: '/api/appointments', expectedStatus: [401, 403] }, // Should require auth
      { path: '/api/openapi.json', expectedStatus: [200] } // Should be public
    ];

    for (const { path, expectedStatus } of endpoints) {
      const response = await this.makeRequest(path);
      
      if (!expectedStatus.includes(response.statusCode)) {
        throw new Error(`Endpoint ${path} returned unexpected status ${response.statusCode}, expected one of ${expectedStatus.join(', ')}`);
      }
    }
  }

  // Test 4: CORS Headers
  async testCORSHeaders() {
    const response = await this.makeRequest('/api/health', {
      headers: {
        'Origin': 'https://neonpro.com.br'
      }
    });

    // Check for essential security headers
    const requiredHeaders = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options'
    ];

    for (const header of requiredHeaders) {
      if (!response.headers[header]) {
        throw new Error(`Missing security header: ${header}`);
      }
    }
  }

  // Test 5: Performance Benchmarks
  async testPerformanceBenchmarks() {
    const startTime = Date.now();
    const response = await this.makeRequest('/api/health');
    const responseTime = Date.now() - startTime;

    if (responseTime > 1000) {
      throw new Error(`Health endpoint too slow: ${responseTime}ms (expected < 1000ms)`);
    }

    if (response.statusCode !== 200) {
      throw new Error(`Health endpoint returned ${response.statusCode}`);
    }
  }

  // Test 6: Error Handling
  async testErrorHandling() {
    // Test 404 handling
    const response404 = await this.makeRequest('/api/nonexistent');
    if (response404.statusCode !== 404) {
      throw new Error(`Expected 404 for nonexistent endpoint, got ${response404.statusCode}`);
    }

    // Test invalid JSON handling
    const response = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'invalid json'
    });

    // Should handle gracefully, not crash
    if (response.statusCode >= 500) {
      throw new Error(`Server crashed on invalid JSON: ${response.statusCode}`);
    }
  }

  // Test 7: Database Connectivity (through API)
  async testDatabaseConnectivity() {
    // This tests DB connectivity through the API health check
    const response = await this.makeRequest('/api/v1/health');
    
    if (response.statusCode !== 200) {
      throw new Error(`Database health check failed: ${response.statusCode}`);
    }

    const health = response.json;
    if (health && health.database && health.database.status !== 'connected') {
      throw new Error(`Database not connected: ${health.database.status}`);
    }
  }

  // Test 8: LGPD Compliance Endpoints
  async testLGPDCompliance() {
    // Test consent endpoints exist (even if they require auth)
    const endpoints = [
      '/api/consent/preferences',
      '/api/consent/history'
    ];

    for (const endpoint of endpoints) {
      const response = await this.makeRequest(endpoint);
      
      // Should return 401/403 (auth required), not 404 (not found) or 500 (error)
      if (response.statusCode === 404) {
        throw new Error(`LGPD endpoint ${endpoint} not found`);
      }
      if (response.statusCode >= 500) {
        throw new Error(`LGPD endpoint ${endpoint} server error: ${response.statusCode}`);
      }
    }
  }

  // Test 9: Static Assets
  async testStaticAssets() {
    // Test that the main page loads
    const response = await this.makeRequest('/');
    
    if (response.statusCode !== 200) {
      throw new Error(`Main page returned ${response.statusCode}`);
    }

    // Should contain basic HTML structure
    if (!response.body.includes('<html') || !response.body.includes('</html>')) {
      throw new Error('Main page does not contain valid HTML structure');
    }
  }

  // Test 10: Rate Limiting (if implemented)
  async testRateLimiting() {
    // Make multiple rapid requests to test rate limiting
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(this.makeRequest('/api/health'));
    }

    const responses = await Promise.all(promises);
    
    // All should succeed for health endpoint (usually not rate limited)
    for (const response of responses) {
      if (response.statusCode >= 500) {
        throw new Error(`Rate limiting test caused server error: ${response.statusCode}`);
      }
    }
  }

  async runAllTests() {
    console.log('🚀 NEONPRO - E2E Post-Deploy Tests');
    console.log('==================================');
    console.log(`Testing deployment: ${this.baseUrl}`);
    console.log('');

    // Run all tests
    await this.runTest('Health Check Endpoints', () => this.testHealthChecks());
    await this.runTest('Authentication Flow', () => this.testAuthenticationFlow());
    await this.runTest('API Endpoints Accessibility', () => this.testAPIEndpoints());
    await this.runTest('CORS & Security Headers', () => this.testCORSHeaders());
    await this.runTest('Performance Benchmarks', () => this.testPerformanceBenchmarks());
    await this.runTest('Error Handling', () => this.testErrorHandling());
    await this.runTest('Database Connectivity', () => this.testDatabaseConnectivity());
    await this.runTest('LGPD Compliance Endpoints', () => this.testLGPDCompliance());
    await this.runTest('Static Assets', () => this.testStaticAssets());
    await this.runTest('Rate Limiting', () => this.testRateLimiting());

    this.printSummary();
    this.saveResults();
    
    // Exit with error if any tests failed
    if (this.failedTests > 0) {
      process.exit(1);
    }
  }

  printSummary() {
    console.log('');
    console.log('📊 Test Results Summary');
    console.log('======================');
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);

    if (this.failedTests > 0) {
      console.log('');
      console.log('❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
    }

    console.log('');
    console.log(this.failedTests === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed. Check the issues above.');
  }

  saveResults() {
    const resultsDir = path.join(__dirname, '../results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const resultsFile = path.join(resultsDir, `e2e-results-${Date.now()}.json`);
    const summary = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      successRate: (this.passedTests / this.totalTests) * 100,
      results: this.results
    };

    fs.writeFileSync(resultsFile, JSON.stringify(summary, null, 2));
    console.log(`📁 Results saved to: ${resultsFile}`);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new E2ETestSuite();
  testSuite.runAllTests().catch(console.error);
}

module.exports = E2ETestSuite;