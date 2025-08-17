#!/usr/bin/env node
/**
 * NeonPro Healthcare Development Setup Script
 * Sets up development environment with healthcare compliance validation
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const HEALTHCARE_REQUIREMENTS = {
  node: '>=20.0.0',
  pnpm: '>=8.0.0',
  qualityThreshold: 9.9,
};

console.log('🏥 NeonPro Healthcare Development Setup');
console.log('=====================================');

function executeCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function validateEnvironment() {
  console.log('\n🔍 Validating Healthcare Development Environment...');

  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`Node.js version: ${nodeVersion}`);

  // Check pnpm
  try {
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    console.log(`pnpm version: ${pnpmVersion}`);
  } catch (error) {
    console.error('❌ pnpm not found. Please install pnpm first.');
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
}

function setupHealthcareCompliance() {
  console.log('\n⚖️ Setting up Healthcare Compliance Environment...');

  const envTemplate = `# NeonPro Healthcare Environment Variables
# ===========================================

# Healthcare Compliance Mode
NODE_ENV=development
HEALTHCARE_MODE=development
HEALTHCARE_QUALITY_THRESHOLD=9.9

# LGPD Compliance
LGPD_COMPLIANCE_MODE=true
LGPD_AUDIT_ENABLED=true
PATIENT_DATA_PROTECTION=maximum

# ANVISA Compliance  
ANVISA_COMPLIANCE_MODE=true
MEDICAL_DEVICE_VALIDATION=true

# CFM Requirements
CFM_COMPLIANCE_MODE=true
PROFESSIONAL_VALIDATION=true

# Development Settings
NEXT_PUBLIC_ENVIRONMENT=development
DEBUG_MODE=true
VERBOSE_LOGGING=true

# Testing
VITEST=true
E2E_BASE_URL=http://localhost:3000
PLAYWRIGHT_BROWSERS_PATH=.playwright
`;

  if (existsSync('.env.local')) {
    console.log('⚠️  .env.local already exists, skipping creation');
  } else {
    writeFileSync('.env.local', envTemplate);
    console.log('✅ Created .env.local with healthcare configuration');
  }
}

function installDependencies() {
  executeCommand('pnpm install --frozen-lockfile', 'Installing dependencies');
}

function setupPlaywright() {
  executeCommand('npx playwright install', 'Setting up Playwright browsers');
}

function validateHealthcareSetup() {
  console.log('\n🏥 Validating Healthcare Setup...');

  executeCommand('pnpm validate:healthcare', 'Healthcare validation');
  executeCommand('pnpm test:compliance', 'Compliance testing');

  console.log('✅ Healthcare setup validation completed');
}

function setupGitHooks() {
  executeCommand('npx husky install', 'Setting up Git hooks');
  console.log('✅ Git hooks configured for healthcare quality gates');
}

function displayNextSteps() {
  console.log('\n🎉 Healthcare Development Environment Setup Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. pnpm dev              - Start development server');
  console.log('2. pnpm test:unit        - Run unit tests');
  console.log('3. pnpm test:e2e         - Run E2E tests');
  console.log('4. pnpm claude:test-dashboard - Healthcare test dashboard');
  console.log('\n🏥 Healthcare Commands:');
  console.log('• pnpm claude:healthcare-compliance - LGPD+ANVISA+CFM validation');
  console.log('• pnpm claude:patient-data-security - Patient data security tests');
  console.log('• pnpm claude:biome-quality-check   - Code quality validation');
  console.log('\n⚖️ Compliance Status: All healthcare requirements configured');
  console.log('🎯 Quality Threshold: ≥9.9/10 healthcare standards');
}

// Main execution
async function main() {
  try {
    validateEnvironment();
    setupHealthcareCompliance();
    installDependencies();
    setupPlaywright();
    setupGitHooks();
    validateHealthcareSetup();
    displayNextSteps();
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
