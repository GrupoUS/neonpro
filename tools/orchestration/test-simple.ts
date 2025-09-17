#!/usr/bin/env bun
/**
 * Simple Integration Test for TDD Orchestration
 * Basic validation of key functionality
 */

import { executeQualityControl } from './index';
import { createLogger, LogLevel } from './utils/logger';

const logger = createLogger('SimpleTest', LogLevel.INFO);

async function testSimpleIntegration() {
  logger.info('🚀 Simple TDD Orchestration Test\n');

  try {
    // Test quality control execution
    logger.info('Testing quality control execution...');
    const result = await executeQualityControl('analyze --type security --parallel');

    logger.success(`Quality control executed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    logger.info(`Duration: ${result.duration}ms`);
    logger.info(`Command: ${result.command}`);

    return result.success;

  } catch (error) {
    logger.error('Simple integration test failed:', error);
    return false;
  }
}

// CLI execution
if (import.meta.main) {
  testSimpleIntegration().then(success => {
    if (success) {
      logger.success('\n✨ Simple Test: PASSED');
      process.exit(0);
    } else {
      logger.error('\n💥 Simple Test: FAILED');
      process.exit(1);
    }
  }).catch(error => {
    logger.error('💥 Simple Test crashed:', error);
    process.exit(1);
  });
}