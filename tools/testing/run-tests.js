#!/usr/bin/env node

/**
 * NeonPro Healthcare Test Runner
 * ============================
 *
 * Utility script to run Vitest and Playwright tests
 * with the correct configurations and environments.
 */

const { spawn } = require('node:child_process');
const path = require('node:path');

// Test configurations
const CONFIGS = {
  vitest: {
    simple: 'vitest.simple.config.ts',
    full: 'vitest.config.ts',
  },
  playwright: {
    simple: 'playwright.simple.config.ts',
    full: 'playwright.config.ts',
  },
};

// Environment setup
const HEALTHCARE_ENV = {
  NODE_ENV: 'test',
  HEALTHCARE_MODE: 'true',
  LGPD_COMPLIANCE: 'true',
  ANVISA_VALIDATION: 'true',
  CFM_STANDARDS: 'true',
};

/**
 * Run command with proper environment and error handling
 */
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Running: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, ...HEALTHCARE_ENV, ...options.env },
      cwd: options.cwd || process.cwd(),
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${command} completed successfully`);
        resolve(code);
      } else {
        console.log(`❌ ${command} failed with code ${code}`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.error(`❌ Error running ${command}:`, error);
      reject(error);
    });
  });
}

/**
 * Run Vitest tests
 */
async function runVitest(config = 'simple') {
  const configFile = CONFIGS.vitest[config];

  try {
    await runCommand('npx', [
      'vitest',
      'run',
      '--config',
      configFile,
      '--reporter=verbose',
    ]);
  } catch (error) {
    console.error('Vitest failed:', error.message);
    process.exit(1);
  }
}

/**
 * Run Playwright tests
 */
async function runPlaywright(config = 'simple') {
  const configFile = CONFIGS.playwright[config];

  try {
    await runCommand('npx', [
      'playwright',
      'test',
      '--config',
      configFile,
      '--reporter=line',
    ]);
  } catch (error) {
    console.error('Playwright failed:', error.message);
    process.exit(1);
  }
}

/**
 * Main CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const config = args[1] || 'simple';

  console.log('🏥 NeonPro Healthcare Test Runner');
  console.log('================================');

  switch (command) {
    case 'vitest':
      await runVitest(config);
      break;

    case 'playwright':
      await runPlaywright(config);
      break;

    case 'all':
      console.log('Running all tests...');
      await runVitest(config);
      await runPlaywright(config);
      break;

    case 'help':
    default:
      console.log('Usage:');
      console.log(
        '  node run-tests.js vitest [simple|full]     - Run Vitest tests'
      );
      console.log(
        '  node run-tests.js playwright [simple|full] - Run Playwright tests'
      );
      console.log(
        '  node run-tests.js all [simple|full]        - Run all tests'
      );
      console.log(
        '  node run-tests.js help                     - Show this help'
      );
      break;
  }
}

// Run the CLI
main().catch((error) => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
