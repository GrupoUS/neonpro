/**
 * Test Runner for Database Package Tests
 * 
 * Provides comprehensive test execution with environment setup,
 * health checks, and detailed reporting for healthcare compliance testing.
 */

import { execSync } from 'child_process'
import * as fs from 'fs';
import * as path from 'path';

// ES module compatibility
const filename = new URL(import.meta.url).pathname;
const dirname = path.dirname(__filename);

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  output?: string;
}

interface TestSuiteResult {
  suite: string;
  tests: TestResult[];
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  timestamp: string;
}

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
}

class DatabaseTestRunner {
  private testResults: TestSuiteResult[] = [];
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  /**
   * Run health checks before testing
   */
  async runHealthChecks(): Promise<HealthCheckResult[]> {
    const healthChecks: HealthCheckResult[] = [];

    console.log('🔍 Running pre-test health checks...');

    // Check Node.js version
    const nodeVersion = process.version;
    const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
    healthChecks.push({
      component: 'Node.js',
      status: nodeMajor >= 18 ? 'healthy' : 'warning',
      message: `Node.js version ${nodeVersion}`,
      details: { version: nodeVersion, required: '>=18.0.0' }
    });

    // Check test environment
    const testEnv = process.env.NODE_ENV;
    healthChecks.push({
      component: 'Test Environment',
      status: testEnv === 'test' ? 'healthy' : 'error',
      message: `NODE_ENV: ${testEnv}`,
      details: { required: 'test', current: testEnv }
    });

    // Check for required environment variables
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    healthChecks.push({
      component: 'Environment Variables',
      status: missingEnvVars.length === 0 ? 'healthy' : 'warning',
      message: missingEnvVars.length === 0 
        ? 'All required environment variables set'
        : `Missing environment variables: ${missingEnvVars.join(', ')}`,
      details: { missing: missingEnvVars, required: requiredEnvVars }
    });

    // Check test dependencies
    const dependencies = ['vitest', '@types/node', 'typescript'];
    const missingDeps = dependencies.filter(dep => {
      try {
        require.resolve(dep);
        return false;
      } catch {
        return true;
      }
    });

    healthChecks.push({
      component: 'Test Dependencies',
      status: missingDeps.length === 0 ? 'healthy' : 'error',
      message: missingDeps.length === 0 
        ? 'All test dependencies available'
        : `Missing dependencies: ${missingDeps.join(', ')}`,
      details: { missing: missingDeps, required: dependencies }
    });

    // Check test file structure
    const testDir = path.join(__dirname);
    const testFiles = this.findTestFiles(testDir);
    healthChecks.push({
      component: 'Test Files',
      status: testFiles.length > 0 ? 'healthy' : 'warning',
      message: `Found ${testFiles.length} test files`,
      details: { files: testFiles }
    });

    // Report health check results
    this.reportHealthChecks(healthChecks);

    return healthChecks;
  }

  /**
   * Find all test files in the tests directory
   */
  private findTestFiles(dir: string): string[] {
    const testFiles: string[] = [];
    
    const findFiles = (currentDir: string) => {
      const files = fs.readdirSync(currentDir);
      
      for (const file of files) {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.')) {
          findFiles(filePath);
        } else if (file.endsWith('.test.ts') || file.endsWith('.test.js')) {
          testFiles.push(path.relative(dir, filePath));
        }
      }
    };
    
    findFiles(dir);
    return testFiles;
  }

  /**
   * Report health check results
   */
  private reportHealthChecks(healthChecks: HealthCheckResult[]): void {
    console.log('\n📊 Health Check Results:');
    console.log('═'.repeat(60));
    
    healthChecks.forEach(check => {
      const statusEmoji = {
        healthy: '✅',
        warning: '⚠️ ',
        error: '❌'
      }[check.status];
      
      console.log(`${statusEmoji} ${check.component}: ${check.message}`);
      
      if (check.details) {
        console.log(`   Details: ${JSON.stringify(check.details, null, 2)}`);
      }
    });

    const hasErrors = healthChecks.some(check => check.status === 'error');
    const hasWarnings = healthChecks.some(check => check.status === 'warning');
    
    console.log('\n' + '═'.repeat(60));
    
    if (hasErrors) {
      console.log('❌ Health check failed. Please resolve errors before running tests.');
      process.exit(1);
    } else if (hasWarnings) {
      console.log('⚠️  Health check passed with warnings. Tests may run with limited functionality.');
    } else {
      console.log('✅ All health checks passed. Ready to run tests.');
    }
  }

  /**
   * Run all tests
   */
  async runTests(testPattern?: string): Promise<TestSuiteResult[]> {
    console.log('\n🚀 Starting Database Package Tests...');
    console.log('═'.repeat(60));

    const testSuites = [
      {
        name: 'Logging Compliance Tests',
        pattern: 'logging-sensitive-data.test.ts',
        description: 'LGPD, ANVISA, and CFM compliance for logging'
      },
      {
        name: 'Database Connection Tests',
        pattern: 'database-connection.test.ts',
        description: 'Database connection and basic operations'
      },
      {
        name: 'LGPD Compliance Tests',
        pattern: 'lgpd-compliance.test.ts',
        description: 'LGPD data protection and privacy compliance'
      }
    ];

    for (const suite of testSuites) {
      if (testPattern && !suite.pattern.includes(testPattern)) {
        console.log(`⏭️  Skipping ${suite.name} (doesn't match pattern)`);
        continue;
      }

      console.log(`\n🔬 Running ${suite.name}...`);
      console.log(`   ${suite.description}`);

      const result = await this.runTestSuite(suite.name, suite.pattern);
      this.testResults.push(result);
      
      this.reportTestSuiteResult(result);
    }

    return this.testResults;
  }

  /**
   * Run a specific test suite
   */
  private async runTestSuite(suiteName: string, pattern: string): Promise<TestSuiteResult> {
    const startTime = Date.now();
    
    try {
      // Run vitest with specific pattern
      const command = `npx vitest run --pattern "${pattern}" --reporter=verbose --json`;
      const output = execSync(command, {
        cwd: path.join(__dirname, '../..'),
        encoding: 'utf-8',
        timeout: 60000, // 60 second timeout
        stdio: 'pipe'
      });

      const duration = Date.now() - startTime;
      
      // Parse vitest JSON output (simplified parsing)
      const tests = this.parseVitestOutput(output);
      
      return {
        suite: suiteName,
        tests,
        totalTests: tests.length,
        passed: tests.filter(t => t.status === 'passed').length,
        failed: tests.filter(t => t.status === 'failed').length,
        skipped: tests.filter(t => t.status === 'skipped').length,
        duration,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;

      return {
        suite: suiteName,
        tests: [{
          name: suiteName,
          status: 'failed',
          duration,
          error: error.message,
          output: error.stdout || error.stderr
        }],
        totalTests: 1,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Parse vitest output (simplified implementation)
   */
  private parseVitestOutput(output: string): TestResult[] {
    // This is a simplified parser. In a real implementation,
    // you would parse the JSON output from vitest
    const tests: TestResult[] = [];
    
    // Look for test results in the output
    const testLines = output.split('\n').filter(line => line.includes('✓') || line.includes('✗'));
    
    testLines.forEach(line => {
      const passed = line.includes('✓');
      const testName = line.replace(/[✓✗]/, '').trim();
      
      tests.push({
        name: testName,
        status: passed ? 'passed' : 'failed',
        duration: 0, // Would need to parse from actual output
        output: line
      });
    });

    return tests;
  }

  /**
   * Report test suite results
   */
  private reportTestSuiteResult(result: TestSuiteResult): void {
    console.log(`\\n📋 ${result.suite} Results:`);
    console.log('─'.repeat(40));
    
    console.log(`Total Tests: ${result.totalTests}`);
    console.log(`✅ Passed: ${result.passed}`);
    console.log(`❌ Failed: ${result.failed}`);
    console.log(`⏭️  Skipped: ${result.skipped}`);
    console.log(`⏱️  Duration: ${result.duration}ms`);
    
    if (result.failed > 0) {
      console.log('\\n❌ Failed Tests:');
      result.tests
        .filter(test => test.status === 'failed')
        .forEach(test => {
          console.log(`   - ${test.name}`);
          if (test.error) {
            console.log(`     Error: ${test.error}`);
          }
        });
    }
  }

  /**
   * Generate final test report
   */
  generateFinalReport(): void {
    console.log('\\n🎯 Final Test Report');
    console.log('═'.repeat(60));
    
    const totalTests = this.testResults.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = this.testResults.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.testResults.reduce((sum, suite) => sum + suite.failed, 0);
    const totalSkipped = this.testResults.reduce((sum, suite) => sum + suite.skipped, 0);
    const totalDuration = this.testResults.reduce((sum,_suite) => sum + suite.duration, 0);
    const successRate = totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(2) : '0';

    console.log(`📊 Overall Results:`);
    console.log(`   Total Test Suites: ${this.testResults.length}`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${totalPassed} (${successRate}%)`);
    console.log(`   Failed: ${totalFailed}`);
    console.log(`   Skipped: ${totalSkipped}`);
    console.log(`   Total Duration: ${totalDuration}ms`);
    console.log(`   Test Started: ${this.startTime.toISOString()}`);
    console.log(`   Test Completed: ${new Date().toISOString()}`);

    // Test suite breakdown
    console.log('\\n📋 Test Suite Breakdown:');
    this.testResults.forEach(suite => {
      const suiteSuccessRate = suite.totalTests > 0 
        ? (suite.passed / suite.totalTests * 100).toFixed(2) 
        : '0';
      
      const statusEmoji = suite.failed === 0 ? '✅' : '❌';
      console.log(`${statusEmoji} ${suite.suite}: ${suite.passed}/${suite.totalTests} (${suiteSuccessRate}%)`);
    });

    // Compliance status
    const complianceStatus = this.testResults.some(suite => 
      suite.suite.includes('Compliance') || suite.suite.includes('LGPD')
    );
    
    if (complianceStatus) {
      console.log('\\n🛡️  Healthcare Compliance Status:');
      const complianceTests = this.testResults.filter(suite => 
        suite.suite.includes('Compliance') || suite.suite.includes('LGPD')
      );
      
      complianceTests.forEach(suite => {
        const complianceRate = suite.totalTests > 0 
          ? (suite.passed / suite.totalTests * 100).toFixed(2) 
          : '0';
        
        console.log(`   ${suite.suite}: ${complianceRate}% compliant`);
      });
    }

    // Final verdict
    console.log('\\n' + '═'.repeat(60));
    
    if (totalFailed === 0) {
      console.log('🎉 All tests passed! The database package is ready for production.');
    } else {
      console.log(`⚠️  ${totalFailed} test(s) failed. Please review and fix the issues before deployment.`);
    }
  }

  /**
   * Save test results to file
   */
  saveResultsToFile(outputDir: string = './test-results'): void {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      testResults: this.testResults,
      summary: {
        totalSuites: this.testResults.length,
        totalTests: this.testResults.reduce((sum, suite) => sum + suite.totalTests, 0),
        totalPassed: this.testResults.reduce((sum, suite) => sum + suite.passed, 0),
        totalFailed: this.testResults.reduce((sum, suite) => sum + suite.failed, 0),
        totalSkipped: this.testResults.reduce((sum, suite) => sum + suite.skipped, 0),
        totalDuration: this.testResults.reduce((sum, suite) => sum + suite.duration, 0),
        successRate: this.testResults.reduce((sum, suite) => sum + suite.totalTests, 0) > 0
          ? (this.testResults.reduce((sum, suite) => sum + suite.passed, 0) /
             this.testResults.reduce((sum, suite) => sum + suite.totalTests, 0) * 100).toFixed(2)
          : '0'
      }
    };

    const filename = `database-test-results-${Date.now()}.json`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`📄 Test results saved to: ${filepath}`);
  }
}

/**
 * Main test runner function
 */
async function runDatabaseTests() {
  const runner = new DatabaseTestRunner();
  
  try {
    // Run health checks
    const healthChecks = await runner.runHealthChecks();
    const hasErrors = healthChecks.some(check => check.status === 'error');
    
    if (hasErrors) {
      process.exit(1);
    }

    // Get test pattern from command line arguments
    const testPattern = process.argv[2];

    // Run tests
    const results = await runner.runTests(testPattern);

    // Generate final report
    runner.generateFinalReport();

    // Save results to file
    runner.saveResultsToFile();

    // Exit with appropriate code
    const totalFailed = results.reduce((sum, suite) => sum + suite.failed, 0);
    process.exit(totalFailed > 0 ? 1 : 0);

  } catch (error) {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
runDatabaseTests();

export { DatabaseTestRunner, runDatabaseTests };