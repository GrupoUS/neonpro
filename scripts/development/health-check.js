#!/usr/bin/env node
/**
 * NeonPro Healthcare Development Health Check
 * Validates development environment health and compliance
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🏥 NeonPro Healthcare Development Health Check');
console.log('=============================================');

let healthScore = 0;
let maxScore = 0;
const issues = [];

function checkItem(name, checkFn, weight = 1) {
  maxScore += weight;
  console.log(`\n🔍 Checking ${name}...`);

  try {
    const result = checkFn();
    if (result.success) {
      console.log(`✅ ${name}: ${result.message}`);
      healthScore += weight;
    } else {
      console.log(`⚠️  ${name}: ${result.message}`);
      issues.push(`${name}: ${result.message}`);
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    issues.push(`${name}: ${error.message}`);
  }
}

function checkNodeVersion() {
  const version = process.version;
  const major = Number.parseInt(version.slice(1).split('.')[0]);
  return {
    success: major >= 20,
    message:
      major >= 20
        ? `Node.js ${version} (✓ healthcare requirement)`
        : `Node.js ${version} (requires ≥20.0.0)`,
  };
}

function checkPnpmInstallation() {
  try {
    const version = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    return {
      success: true,
      message: `pnpm ${version} installed`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'pnpm not found or not working',
    };
  }
}

function checkDependencies() {
  const lockFileExists = existsSync('pnpm-lock.yaml');
  const nodeModulesExists = existsSync('node_modules');

  if (!lockFileExists) {
    return {
      success: false,
      message: 'pnpm-lock.yaml not found',
    };
  }

  if (!nodeModulesExists) {
    return {
      success: false,
      message: 'node_modules not found - run pnpm install',
    };
  }

  return {
    success: true,
    message: 'Dependencies installed',
  };
}

function checkHealthcareConfig() {
  const envExists = existsSync('.env.local');
  const turboExists = existsSync('turbo.json');
  const biomeExists = existsSync('biome.jsonc');

  if (!envExists) {
    return {
      success: false,
      message: '.env.local missing - run pnpm dev:setup',
    };
  }

  if (!turboExists) {
    return {
      success: false,
      message: 'turbo.json missing',
    };
  }

  if (!biomeExists) {
    return {
      success: false,
      message: 'biome.jsonc missing',
    };
  }

  return {
    success: true,
    message: 'Healthcare configuration files present',
  };
}

function checkTestingSetup() {
  const vitestConfig = existsSync('vitest.config.ts');
  const playwrightConfig = existsSync('playwright.config.ts');
  const testingTools = existsSync('tools/testing');

  if (!vitestConfig) {
    return {
      success: false,
      message: 'vitest.config.ts missing',
    };
  }

  if (!playwrightConfig) {
    return {
      success: false,
      message: 'playwright.config.ts missing',
    };
  }

  if (!testingTools) {
    return {
      success: false,
      message: 'tools/testing directory missing',
    };
  }

  return {
    success: true,
    message: 'Testing infrastructure configured',
  };
}

function checkTypeScript() {
  try {
    execSync('pnpm type-check', { stdio: 'pipe' });
    return {
      success: true,
      message: 'TypeScript compilation successful',
    };
  } catch (error) {
    return {
      success: false,
      message: 'TypeScript compilation errors detected',
    };
  }
}

function checkLinting() {
  try {
    execSync('pnpm lint', { stdio: 'pipe' });
    return {
      success: true,
      message: 'Linting passed (Biome)',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Linting errors detected',
    };
  }
}

function checkHealthcareCompliance() {
  try {
    execSync('pnpm test:compliance', { stdio: 'pipe' });
    return {
      success: true,
      message: 'Healthcare compliance tests passed',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Healthcare compliance issues detected',
    };
  }
}

function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const hasChanges = status.trim().length > 0;

    return {
      success: true,
      message: hasChanges
        ? 'Git repository has uncommitted changes'
        : 'Git repository clean',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Not in a git repository or git not available',
    };
  }
}

function checkPlaywrightBrowsers() {
  try {
    execSync('npx playwright --version', { stdio: 'pipe' });
    return {
      success: true,
      message: 'Playwright browsers installed',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Playwright browsers not installed - run npx playwright install',
    };
  }
}

function displayResults() {
  const percentage = Math.round((healthScore / maxScore) * 100);
  const healthGrade = getHealthGrade(percentage);

  console.log('\n📊 Healthcare Development Health Report');
  console.log('========================================');
  console.log(`Health Score: ${healthScore}/${maxScore} (${percentage}%)`);
  console.log(`Health Grade: ${healthGrade.grade} ${healthGrade.emoji}`);
  console.log(
    `Quality Standard: ${percentage >= 90 ? '✅ Meets healthcare requirements (≥90%)' : '❌ Below healthcare requirements'}`
  );

  if (issues.length > 0) {
    console.log('\n🚨 Issues to Address:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }

  if (percentage >= 95) {
    console.log(
      '\n🎉 Excellent! Your healthcare development environment is in perfect condition.'
    );
  } else if (percentage >= 80) {
    console.log(
      '\n✅ Good! Your environment is mostly healthy. Address the issues above.'
    );
  } else {
    console.log(
      '\n⚠️  Warning! Your environment needs attention. Please resolve the issues above.'
    );
  }

  console.log('\n🏥 Healthcare Compliance Status:');
  console.log(
    `LGPD Compliance: ${percentage >= 90 ? '✅ Ready' : '❌ Needs attention'}`
  );
  console.log(
    `ANVISA Compliance: ${percentage >= 90 ? '✅ Ready' : '❌ Needs attention'}`
  );
  console.log(
    `CFM Compliance: ${percentage >= 90 ? '✅ Ready' : '❌ Needs attention'}`
  );

  console.log('\n💡 Quick Fixes:');
  console.log('• Run: pnpm dev:setup    - Setup development environment');
  console.log('• Run: pnpm dev:clean    - Clean and reinstall dependencies');
  console.log(
    '• Run: pnpm validate:healthcare - Validate healthcare compliance'
  );
}

function getHealthGrade(percentage) {
  if (percentage >= 95) return { grade: 'A+', emoji: '🌟' };
  if (percentage >= 90) return { grade: 'A', emoji: '✅' };
  if (percentage >= 80) return { grade: 'B', emoji: '👍' };
  if (percentage >= 70) return { grade: 'C', emoji: '⚠️' };
  if (percentage >= 60) return { grade: 'D', emoji: '😰' };
  return { grade: 'F', emoji: '🚨' };
}

// Run all health checks
async function main() {
  checkItem('Node.js Version', checkNodeVersion, 2);
  checkItem('pnpm Installation', checkPnpmInstallation, 2);
  checkItem('Dependencies', checkDependencies, 2);
  checkItem('Healthcare Configuration', checkHealthcareConfig, 3);
  checkItem('Testing Setup', checkTestingSetup, 2);
  checkItem('TypeScript Compilation', checkTypeScript, 2);
  checkItem('Code Linting', checkLinting, 2);
  checkItem('Healthcare Compliance', checkHealthcareCompliance, 3);
  checkItem('Git Status', checkGitStatus, 1);
  checkItem('Playwright Browsers', checkPlaywrightBrowsers, 1);

  displayResults();

  const percentage = Math.round((healthScore / maxScore) * 100);
  process.exit(percentage >= 80 ? 0 : 1);
}

main();
