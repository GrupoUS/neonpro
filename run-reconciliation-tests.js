const { execSync } = require('child_process');
const path = require('path');

/**
 * NEONPRO RECONCILIATION TEST RUNNER
 * Healthcare-Grade Test Execution for Bank Reconciliation System
 */

console.log('🚀 NEONPRO RECONCILIATION TEST SUITE - Healthcare Excellence Validation');
console.log('='.repeat(80));

const RECONCILIATION_TESTS = [
  {
    name: 'API Integration Tests',
    file: 'tests/integration/bank-reconciliation-api.test.ts',
    description: 'Core reconciliation service functionality validation',
    priority: 'CRITICAL',
    timeout: 30000
  },
  {
    name: 'Security Audit Tests', 
    file: 'tests/security/security-audit.test.ts',
    description: 'LGPD compliance and security vulnerability validation',
    priority: 'CRITICAL',
    timeout: 45000
  },
  {
    name: 'Performance Load Tests',
    file: 'tests/performance/load-testing.test.ts', 
    description: 'System performance and concurrent user validation',
    priority: 'HIGH',
    timeout: 60000
  }
];

const E2E_TESTS = [
  {
    name: 'Bank Reconciliation E2E',
    file: 'playwright/tests/bank-reconciliation.spec.ts',
    description: 'Complete user journey validation',
    priority: 'CRITICAL',
    timeout: 90000
  }
];

function runTest(test, testType = 'UNIT') {
  console.log(`\n📊 Executing: ${test.name} [${test.priority}]`);
  console.log(`   Description: ${test.description}`);
  console.log(`   File: ${test.file}`);
  console.log('-'.repeat(60));
  
  try {
    const startTime = Date.now();
    
    if (testType === 'E2E') {
      // Run Playwright E2E tests
      const command = `npx playwright test ${test.file} --reporter=list --timeout=${test.timeout}`;
      console.log(`   Command: ${command}`);
      const output = execSync(command, { 
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: test.timeout + 30000
      });
      console.log(output);
    } else {
      // Run Jest tests with isolated configuration
      const command = `npx jest ${test.file} --verbose --detectOpenHandles --forceExit --timeout=${test.timeout}`;
      console.log(`   Command: ${command}`);
      const output = execSync(command, {
        cwd: path.join(process.cwd(), 'apps/web'),
        encoding: 'utf8', 
        timeout: test.timeout + 30000
      });
      console.log(output);
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ ${test.name} - PASSED (${duration.toFixed(2)}s)`);
    return { status: 'PASSED', duration, test: test.name };
    
  } catch (error) {
    const errorMessage = error.message || error.toString();
    console.log(`❌ ${test.name} - FAILED`);
    console.log(`   Error: ${errorMessage.substring(0, 500)}...`);
    
    return { status: 'FAILED', error: errorMessage, test: test.name };
  }
}

function generateReport(results) {
  console.log('\n' + '='.repeat(80));
  console.log('📋 NEONPRO RECONCILIATION TEST EXECUTION REPORT');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const total = results.length;
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total Tests: ${total}`);
  console.log(`   Passed: ${passed} ✅`);
  console.log(`   Failed: ${failed} ❌`);
  console.log(`   Success Rate: ${((passed/total) * 100).toFixed(1)}%`);
  
  if (passed >= 3) {
    console.log(`\n🏆 HEALTHCARE QUALITY STANDARD: ACHIEVED (≥75% pass rate)`);
  } else {
    console.log(`\n⚠️  HEALTHCARE QUALITY STANDARD: NEEDS IMPROVEMENT`);
  }
  
  console.log(`\n📋 DETAILED RESULTS:`);
  results.forEach(result => {
    const status = result.status === 'PASSED' ? '✅' : '❌';
    const duration = result.duration ? ` (${result.duration.toFixed(2)}s)` : '';
    console.log(`   ${status} ${result.test}${duration}`);
    
    if (result.status === 'FAILED' && result.error) {
      console.log(`      Error: ${result.error.substring(0, 200)}...`);
    }
  });
  
  console.log('\n' + '='.repeat(80));
  
  // Save results to file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: { total, passed, failed, successRate: ((passed/total) * 100).toFixed(1) },
    results,
    qualityStandard: passed >= 3 ? 'ACHIEVED' : 'NEEDS_IMPROVEMENT'
  };
  
  const fs = require('fs');
  const reportPath = 'reconciliation-test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  console.log(`📄 Detailed report saved to: ${reportPath}`);
  
  return reportData;
}

// Main execution
async function main() {
  console.log('🔧 Initializing NeonPro Reconciliation Test Environment...');
  
  const results = [];
  
  // Execute Unit/Integration Tests
  console.log('\n🧪 PHASE 1: UNIT & INTEGRATION TESTS');
  for (const test of RECONCILIATION_TESTS) {
    const result = runTest(test, 'UNIT');
    results.push(result);
  }
  
  // Execute E2E Tests  
  console.log('\n🎭 PHASE 2: END-TO-END TESTS');
  for (const test of E2E_TESTS) {
    const result = runTest(test, 'E2E');
    results.push(result);
  }
  
  // Generate comprehensive report
  const report = generateReport(results);
  
  // Exit with appropriate code
  const hasFailures = results.some(r => r.status === 'FAILED');
  process.exit(hasFailures ? 1 : 0);
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { main, runTest, generateReport };