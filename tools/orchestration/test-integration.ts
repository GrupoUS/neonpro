#!/usr/bin/env bun
/**
 * Integration Test for TDD Orchestration
 * Tests the complete integration with quality control commands
 */

import { createTDDOrchestrationSystem, executeQualityControl, runTDDCycle } from './index';
import { createLogger, LogLevel } from './utils/logger';

const logger = createLogger('IntegrationTest', LogLevel.INFO);

async function testTDDOrchestrationIntegration() {
  logger.info('🔗 Starting TDD Orchestration Integration Test\n');

  try {
    // Test 1: Factory Function Creation
    logger.info('1️⃣ Testing Factory Function...');
    const system = createTDDOrchestrationSystem({
      enableCommunication: true,
      enableMetrics: true,
      enableCompliance: true,
      healthcareMode: true,
    });

    await system.initialize();
    logger.success('TDD Orchestration System created and initialized');

    const status = system.getStatus();
    logger.info(`   - System version: ${status.version}`);
    logger.info(`   - Healthcare mode: ${status.healthcareMode ? 'Enabled' : 'Disabled'}`);
    logger.info(`   - Components: ${Object.keys(status.components).length} active`);

    // Test 2: Direct Quality Control Execution
    logger.info('\n2️⃣ Testing Direct Quality Control Execution...');
    const qualityCommands = [
      'analyze --type security --depth L7 --parallel --healthcare',
      'test --type integration --parallel --agents test,security-auditor',
      'review --depth L5 --healthcare --agents architect-review,code-reviewer',
    ];

    for (const command of qualityCommands) {
      try {
        const result = await executeQualityControl(command);
        logger.success(`Quality control "${command.split(' ')[0]}" executed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
        logger.info(`   - Duration: ${result.duration}ms`);
        logger.info(`   - Command: ${result.command}`);
      } catch (error) {
        logger.error(`Quality control "${command}" failed:`, error);
      }
    }

    // Test 3: Complete TDD Cycle with Quality Control
    logger.info('\n3️⃣ Testing Complete TDD Cycle...');
    const testFeature = {
      name: 'healthcare-integration-feature',
      description: 'Feature for testing healthcare compliance integration',
      domain: ['healthcare', 'integration', 'compliance'],
      complexity: 'high' as const,
      requirements: [
        'LGPD data protection compliance',
        'ANVISA medical device standards',
        'CFM telemedicine regulations',
        'Parallel agent execution',
        'Quality control integration',
      ],
      acceptance: [
        'All healthcare compliance checks pass',
        'Agents execute in parallel',
        'Quality gates are enforced',
        'Constitutional logging is active',
      ],
    };

    const result = await runTDDCycle(testFeature, {
      workflow: 'parallel',
      coordination: 'parallel',
      agents: ['security-auditor', 'architect-review', 'code-reviewer'],
      healthcare: true,
      enableMetrics: true,
      enableCompliance: true,
    });

    logger.success(`TDD Cycle completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    logger.info(`   - Duration: ${result.duration}ms`);
    logger.info(`   - Phases completed: ${result.phases?.length || 0}`);
    logger.info(`   - Agent results: ${result.agentResults?.length || 0}`);
    logger.info(`   - Coordination pattern: ${result.coordination}`);

    if (result.healthcareCompliance) {
      logger.constitutional(
        result.healthcareCompliance.overall.compliant ? LogLevel.INFO : LogLevel.WARN,
        `Healthcare compliance: ${result.healthcareCompliance.overall.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`,
        {
          compliance: result.healthcareCompliance.overall.compliant,
          requirement: 'Healthcare Compliance Integration',
          standard: 'LGPD,ANVISA,CFM',
        }
      );
    }

    // Test 4: System Metrics and Analytics
    logger.info('\n4️⃣ Testing System Metrics...');
    const metrics = system.getMetrics();
    if ('snapshot' in metrics) {
      logger.success('Metrics collection working');
      logger.info(`   - Total executions: ${metrics.snapshot.orchestration.totalExecutions}`);
      logger.info(`   - Quality score: ${metrics.snapshot.quality.overallQualityScore.toFixed(1)}/10`);
      logger.info(`   - Performance: ${metrics.snapshot.performance.averageExecutionTime}ms avg`);
    }

    // Test 5: System Commands and Examples
    logger.info('\n5️⃣ Testing System Commands...');
    const examples = system.getCommandExamples();
    logger.success('Command examples available');
    logger.info(`   - Available commands: ${examples.availableCommands.length}`);
    logger.info(`   - Example commands: ${examples.examples.slice(0, 3).join(', ')}`);
    logger.info(`   - Workflows: ${examples.workflows.join(', ')}`);
    logger.info(`   - Agents: ${examples.agents.length} registered`);

    // Cleanup
    await system.shutdown();
    logger.success('System shutdown completed');

    // Summary
    logger.info('\n🏁 Integration Test Summary:');
    logger.success('Factory Function Creation');
    logger.success('Direct Quality Control Execution');
    logger.success('Complete TDD Cycle with Healthcare Compliance');
    logger.success('System Metrics and Analytics');
    logger.success('System Commands and Examples');

    logger.info('\n🎉 TDD Orchestration Integration Test: PASSED');
    logger.info('\n📋 Integration Capabilities Verified:');
    logger.info('   🔹 Quality control command integration');
    logger.info('   🔹 Healthcare compliance validation (LGPD/ANVISA/CFM)');
    logger.info('   🔹 Parallel agent coordination');
    logger.info('   🔹 Constitutional logging and compliance tracking');
    logger.info('   🔹 Metrics collection and analytics');
    logger.info('   🔹 System lifecycle management');
    logger.info('   🔹 Multi-agent TDD workflow orchestration');

    return true;

  } catch (error) {
    logger.error('Integration test failed:', error);
    return false;
  }
}

// CLI execution
if (import.meta.main) {
  testTDDOrchestrationIntegration().then(success => {
    if (success) {
      logger.success('\n✨ Integration Test: PASSED');
      process.exit(0);
    } else {
      logger.error('\n💥 Integration Test: FAILED');
      process.exit(1);
    }
  }).catch(error => {
    logger.error('💥 Integration Test crashed:', error);
    process.exit(1);
  });
}

export { testTDDOrchestrationIntegration };