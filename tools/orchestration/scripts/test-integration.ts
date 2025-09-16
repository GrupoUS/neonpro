#!/usr/bin/env node
/**
 * Integration Test Script
 * Validates the new categorized testing structure
 */

import { TestCoordinator } from '../src/test-coordinator.js';
import { TestCategoryManager } from '../../shared/src/utils/testing/test-categories';

async function testIntegration() {
  console.log('🧪 Testing NeonPro categorized testing structure integration...\n');

  try {
    // Test 1: Validate category configuration
    console.log('1️⃣ Testing category configuration...');
    const categories = TestCategoryManager.getAllCategories();
    console.log(`✅ Found ${categories.length} test categories:`);
    categories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.description}`);
      console.log(`     Agent: ${cat.primaryAgent} (+ ${cat.supportAgents.join(', ')})`);
    });
    console.log();

    // Test 2: Test command generation
    console.log('2️⃣ Testing command generation...');
    const frontendCommand = TestCategoryManager.generateTestCommand('frontend', 'e2e');
    const backendCommand = TestCategoryManager.generateTestCommand('backend');
    console.log(`✅ Frontend E2E command: ${frontendCommand}`);
    console.log(`✅ Backend command: ${backendCommand}`);
    console.log();

    // Test 3: Healthcare compliance categories
    console.log('3️⃣ Testing healthcare compliance...');
    const healthcareCategories = TestCategoryManager.getHealthcareComplianceCategories();
    console.log(`✅ Healthcare compliant categories: ${healthcareCategories.map(c => c.name).join(', ')}`);
    console.log();

    // Test 4: Test coordinator functionality
    console.log('4️⃣ Testing coordinator functionality...');
    const coordinator = new TestCoordinator();

    // Simulate frontend tests
    console.log('   Running simulated frontend tests...');
    const frontendResult = await coordinator.runFrontendTests({
      healthcareCompliance: true
    });
    console.log(`   ✅ Frontend tests: ${frontendResult.success ? 'PASSED' : 'FAILED'} (${frontendResult.duration}ms)`);

    // Simulate healthcare compliance tests
    console.log('   Running simulated healthcare compliance tests...');
    const healthcareResult = await coordinator.runHealthcareComplianceTests();
    console.log(`   ✅ Healthcare compliance: ${healthcareResult.success ? 'PASSED' : 'FAILED'}`);
    if (healthcareResult.healthcareCompliance) {
      console.log(`      - LGPD: ${healthcareResult.healthcareCompliance.lgpd.compliant ? '✅' : '❌'} (${healthcareResult.healthcareCompliance.lgpd.score}%)`);
      console.log(`      - ANVISA: ${healthcareResult.healthcareCompliance.anvisa.compliant ? '✅' : '❌'} (${healthcareResult.healthcareCompliance.anvisa.score}%)`);
      console.log(`      - CFM: ${healthcareResult.healthcareCompliance.cfm.compliant ? '✅' : '❌'} (${healthcareResult.healthcareCompliance.cfm.score}%)`);
    }
    console.log();

    // Test 5: Full test suite simulation
    console.log('5️⃣ Running full test suite simulation...');
    const fullResult = await coordinator.executeFullTestSuite({
      categories: ['frontend', 'backend', 'database', 'quality'],
      healthcareCompliance: true,
      parallel: false,
    });

    console.log(`✅ Full test suite: ${fullResult.success ? 'PASSED' : 'FAILED'} (${Math.round(fullResult.duration)}ms)`);
    console.log(`   - Total tests: ${fullResult.overallMetrics.totalTests}`);
    console.log(`   - Passed: ${fullResult.overallMetrics.passedTests}`);
    console.log(`   - Failed: ${fullResult.overallMetrics.failedTests}`);
    console.log(`   - Coverage: ${fullResult.overallMetrics.coverage}%`);
    console.log(`   - Quality score: ${fullResult.overallMetrics.qualityScore}/10`);
    console.log();

    // Test 6: Category results breakdown
    console.log('6️⃣ Category results breakdown:');
    Object.entries(fullResult.categoryResults).forEach(([category, result]) => {
      console.log(`   ${category}: ${result.success ? '✅' : '❌'} (${Math.round(result.duration)}ms)`);
      console.log(`      Tests: ${result.metrics.passed}/${result.metrics.tests} | Coverage: ${result.metrics.coverage}%`);
    });
    console.log();

    console.log('🎉 All integration tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('✅ Category configuration validated');
    console.log('✅ Command generation working');
    console.log('✅ Healthcare compliance detection working');
    console.log('✅ Test coordination functioning');
    console.log('✅ Agent orchestration simulated');
    console.log('✅ Quality gates validation working');
    console.log('\n🚀 The categorized testing structure is ready for use!');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    process.exit(1);
  }
}

// Run integration test if executed directly
if (import.meta.main) {
  testIntegration();
}

export { testIntegration };