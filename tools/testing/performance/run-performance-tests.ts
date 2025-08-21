#!/usr/bin/env ts-node

/**
 * NeonPro Healthcare Performance Test Runner
 * 
 * Executable script to run comprehensive performance testing suite
 */

import { PerformanceTestRunner, PerformanceTestConfig } from './performance-test-runner';
import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Load environment variables
dotenvConfig();

interface CliArgs {
  baseUrl: string;
  apiUrl: string;
  buildPath: string;
  outputPath: string;
  duration: number;
  users: number;
  environment: 'development' | 'staging' | 'production';
  quick?: boolean;
  lighthouse?: boolean;
  api?: boolean;
  database?: boolean;
  frontend?: boolean;
  bundle?: boolean;
  healthcare?: boolean;
}

const argv = yargs(hideBin(process.argv))
  .option('baseUrl', {
    alias: 'u',
    type: 'string',
    default: 'http://localhost:3000',
    description: 'Base URL for frontend testing'
  })
  .option('apiUrl', {
    alias: 'a',
    type: 'string', 
    default: 'http://localhost:3001',
    description: 'API URL for backend testing'
  })
  .option('buildPath', {
    alias: 'b',
    type: 'string',
    default: './apps/web',
    description: 'Path to Next.js build directory'
  })
  .option('outputPath', {
    alias: 'o',
    type: 'string',
    default: './performance-reports',
    description: 'Output directory for reports'
  })
  .option('duration', {
    alias: 'd',
    type: 'number',
    default: 60,
    description: 'Test duration in seconds'
  })
  .option('users', {
    alias: 'c',
    type: 'number',
    default: 10,
    description: 'Concurrent users for load testing'
  })
  .option('environment', {
    alias: 'e',
    type: 'string',
    choices: ['development', 'staging', 'production'] as const,
    default: 'development' as const,
    description: 'Target environment'
  })
  .option('quick', {
    type: 'boolean',
    default: false,
    description: 'Run quick performance check (reduced test scope)'
  })
  .option('lighthouse', {
    type: 'boolean',
    default: true,
    description: 'Run Lighthouse performance audit'
  })
  .option('api', {
    type: 'boolean',
    default: true,
    description: 'Run API performance tests'
  })
  .option('database', {
    type: 'boolean',
    default: true,
    description: 'Run database performance tests'
  })
  .option('frontend', {
    type: 'boolean',
    default: true,
    description: 'Run frontend performance tests'
  })
  .option('bundle', {
    type: 'boolean',
    default: true,
    description: 'Run bundle analysis'
  })
  .option('healthcare', {
    type: 'boolean',
    default: true,
    description: 'Run healthcare-specific performance tests'
  })
  .help()
  .parseSync() as CliArgs;

async function main(): Promise<void> {
  console.log('🏥 NeonPro Healthcare Performance Testing Suite\n');
  
  // Validate environment
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL environment variable is required');
    process.exit(1);
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
  }

  const config: PerformanceTestConfig = {
    baseUrl: argv.baseUrl,
    apiUrl: argv.apiUrl,
    buildPath: path.resolve(argv.buildPath),
    outputPath: path.resolve(argv.outputPath),
    testDuration: argv.quick ? 30 : argv.duration,
    concurrentUsers: argv.quick ? 5 : argv.users
  };

  console.log('📋 Test Configuration:');
  console.log(`   Base URL: ${config.baseUrl}`);
  console.log(`   API URL: ${config.apiUrl}`);
  console.log(`   Environment: ${argv.environment}`);
  console.log(`   Duration: ${config.testDuration}s`);
  console.log(`   Concurrent Users: ${config.concurrentUsers}`);
  console.log(`   Output: ${config.outputPath}\n`);

  try {
    const runner = new PerformanceTestRunner(config);
    const report = await runner.runAll();
    
    // Display summary
    console.log('\n📊 Performance Test Results:');
    console.log(`   Overall Score: ${report.summary.overallScore}/100`);
    console.log(`   Passed Tests: ${report.summary.passedTargets}/${report.summary.totalTargets}`);
    console.log(`   Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`   Warnings: ${report.summary.warnings}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Key Recommendations:');
      report.recommendations.slice(0, 5).forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }
    
    // Set exit code based on results
    const hasFailures = report.summary.criticalIssues > 0 || report.failedTests.length > 0;
    const exitCode = hasFailures ? 1 : 0;
    
    console.log(`\n${hasFailures ? '❌' : '✅'} Performance testing completed`);
    console.log(`📋 Full report available at: ${config.outputPath}/performance-report.md`);
    
    process.exit(exitCode);
    
  } catch (error) {
    console.error('\n❌ Performance testing failed:', error);
    process.exit(1);
  }
}

// Run the performance test suite
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});