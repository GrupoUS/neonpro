#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SupabaseSmokeTestRunner {
  constructor() {
    this.projectRoot = process.cwd();
    this.testResults = {
      connectivity: null,
      authentication: null,
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Supabase Smoke Tests...\n');

    // Check prerequisites
    this.checkPrerequisites();

    const testSuites = [
      { name: 'Connectivity', file: 'supabase-connectivity.test.ts' },
      { name: 'Authentication', file: 'supabase-auth.test.ts' }
    ];

    for (const suite of testSuites) {
      console.log(`🔍 Running ${suite.name} Tests...`);
      try {
        const result = await this.runTestSuite(suite);
        this.testResults[suite.name.toLowerCase()] = result;
        console.log(`✅ ${suite.name} Tests: ${result.status}\n`);
      } catch (error) {
        console.error(`❌ ${suite.name} Tests: FAILED`);
        console.error(`Error: ${error.message}\n`);
        this.testResults[suite.name.toLowerCase()] = {
          status: 'FAILED',
          error: error.message
        };
      }
    }

    this.generateReport();
    return this.testResults;
  }

  checkPrerequisites() {
    console.log('🔧 Checking prerequisites...');

    // Check environment variables
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Check if service role key is available for advanced tests
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not found - some advanced tests will be skipped');
    }

    // Check if test files exist
    const testDir = path.join(this.projectRoot, 'tools/tests/integration');
    if (!fs.existsSync(testDir)) {
      throw new Error(`Test directory not found: ${testDir}`);
    }

    console.log('✅ Prerequisites check passed\n');
  }

  async runTestSuite(suite) {
    const testFile = path.join('tools/tests/integration', suite.file);
    
    try {
      // Run tests using vitest
      const command = `npx vitest run ${testFile} --reporter=verbose`;
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000 // 60 second timeout
      });

      return {
        status: 'PASSED',
        output: output,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'FAILED',
        error: error.message,
        output: error.stdout || error.stderr || '',
        timestamp: new Date().toISOString()
      };
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      environment: {
        node_env: process.env.NODE_ENV,
        supabase_url: process.env.SUPABASE_URL?.replace(/\/\/.*@/, '//*****@'), // Mask credentials
        has_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      results: this.testResults,
      summary: this.calculateSummary(),
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(this.projectRoot, 'supabase-smoke-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.printReport(report);
    
    return report;
  }

  calculateSummary() {
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    Object.values(this.testResults).forEach(result => {
      if (result && typeof result === 'object' && result.status) {
        if (result.status === 'PASSED') passed++;
        else if (result.status === 'FAILED') failed++;
        else if (result.status === 'SKIPPED') skipped++;
      }
    });

    return {
      total: passed + failed + skipped,
      passed,
      failed,
      skipped,
      success_rate: passed / (passed + failed) * 100
    };
  }

  generateRecommendations() {
    const recommendations = [];

    // Check connectivity
    if (this.testResults.connectivity?.status === 'FAILED') {
      recommendations.push({
        category: 'connectivity',
        priority: 'high',
        message: 'Database connectivity issues detected. Check network and credentials.'
      });
    }

    // Check authentication
    if (this.testResults.authentication?.status === 'FAILED') {
      recommendations.push({
        category: 'authentication',
        priority: 'high',
        message: 'Authentication issues detected. Verify Supabase Auth configuration.'
      });
    }

    // Service role recommendation
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      recommendations.push({
        category: 'testing',
        priority: 'medium',
        message: 'Add SUPABASE_SERVICE_ROLE_KEY for comprehensive testing coverage.'
      });
    }

    return recommendations;
  }

  printReport(report) {
    console.log('\n📊 Supabase Smoke Test Report');
    console.log('================================');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⏭️  Skipped: ${report.summary.skipped}`);
    console.log(`Success Rate: ${report.summary.success_rate.toFixed(1)}%`);

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
      });
    }

    console.log(`\n📄 Full report saved to: supabase-smoke-test-report.json`);
  }
}

// Run smoke tests
if (require.main === module) {
  const runner = new SupabaseSmokeTestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = SupabaseSmokeTestRunner;