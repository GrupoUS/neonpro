#!/usr/bin/env node
/**
 * Migration Validation Script
 * Validates that all test files have been successfully migrated
 * and the new testing structure is properly configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) =>
    console.log(`\n${colors.bold}${colors.blue}🔍 ${msg}${colors.reset}\n`),
};

class MigrationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.projectRoot = path.resolve(__dirname, '../..');
    this.testingRoot = path.resolve(__dirname);
  }

  validateFileExists(filePath, description) {
    const fullPath = path.resolve(this.projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      log.success(`${description}: ${filePath}`);
      return true;
    }
    this.errors.push(`Missing ${description}: ${filePath}`);
    log.error(`Missing ${description}: ${filePath}`);
    return false;
  }

  validateDirectoryExists(dirPath, description) {
    const fullPath = path.resolve(this.projectRoot, dirPath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      log.success(`${description}: ${dirPath}`);
      return true;
    }
    this.errors.push(`Missing ${description}: ${dirPath}`);
    log.error(`Missing ${description}: ${dirPath}`);
    return false;
  }

  validateTestStructure() {
    log.header('Validating Test Directory Structure');

    const expectedDirs = [
      'tools/testing/tests',
      'tools/testing/tests/accessibility',
      'tools/testing/tests/auth',
      'tools/testing/tests/integration',
      'tools/testing/tests/performance',
      'tools/testing/tests/security',
      'tools/testing/tests/unit',
      'tools/testing/__tests__',
    ];

    expectedDirs.forEach((dir) => {
      this.validateDirectoryExists(dir, 'Test directory');
    });
  }

  validateMigratedFiles() {
    log.header('Validating Migrated Test Files');

    const expectedFiles = [
      'tools/testing/tests/accessibility/accessibility-demo.spec.ts',
      'tools/testing/tests/accessibility/healthcare-accessibility.spec.ts',
      'tools/testing/tests/auth/task-002-final-integration.test.ts',
      'tools/testing/tests/auth/webauthn-verification.test.ts',
      'tools/testing/tests/integration/financial-integration.test.ts',
      'tools/testing/tests/performance/load-testing.test.ts',
      'tools/testing/tests/security/security-audit.test.ts',
      'tools/testing/tests/unit/monitoring.test.ts',
      'tools/testing/tests/simple-monitoring.test.ts',
    ];

    expectedFiles.forEach((file) => {
      this.validateFileExists(file, 'Migrated test file');
    });
  }

  validateConfigurationFiles() {
    log.header('Validating Configuration Files');

    const configFiles = [
      'tools/testing/jest.config.ts',
      'tools/testing/__tests__/setup.ts',
      'tools/testing/README.md',
      'tools/testing/migration-summary.md',
      '.env.test',
      'package.json',
    ];

    configFiles.forEach((file) => {
      this.validateFileExists(file, 'Configuration file');
    });
  }

  validatePackageJsonScripts() {
    log.header('Validating Package.json Test Scripts');

    try {
      const packageJsonPath = path.resolve(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      const expectedScripts = [
        'test',
        'test:unit',
        'test:integration',
        'test:performance',
        'test:security',
        'test:auth',
        'test:accessibility',
        'test:watch',
        'test:coverage',
        'test:verbose',
      ];

      expectedScripts.forEach((script) => {
        if (packageJson.scripts && packageJson.scripts[script]) {
          log.success(`Test script: ${script}`);
        } else {
          this.errors.push(`Missing test script: ${script}`);
          log.error(`Missing test script: ${script}`);
        }
      });
    } catch (error) {
      this.errors.push(`Error reading package.json: ${error.message}`);
      log.error(`Error reading package.json: ${error.message}`);
    }
  }

  validateJestConfiguration() {
    log.header('Validating Jest Configuration');

    try {
      const jestConfigPath = path.resolve(this.testingRoot, 'jest.config.ts');
      const jestConfig = fs.readFileSync(jestConfigPath, 'utf8');

      const requiredConfigs = [
        'testEnvironment',
        'roots',
        'testMatch',
        'collectCoverageFrom',
        'setupFilesAfterEnv',
        'moduleNameMapping',
        'projects',
      ];

      requiredConfigs.forEach((config) => {
        if (jestConfig.includes(config)) {
          log.success(`Jest config includes: ${config}`);
        } else {
          this.warnings.push(`Jest config missing: ${config}`);
          log.warning(`Jest config missing: ${config}`);
        }
      });
    } catch (error) {
      this.errors.push(`Error reading Jest config: ${error.message}`);
      log.error(`Error reading Jest config: ${error.message}`);
    }
  }

  checkOldTestDirectory() {
    log.header('Checking Old Test Directory');

    const oldTestDir = path.resolve(this.projectRoot, 'tests');
    if (fs.existsSync(oldTestDir)) {
      this.warnings.push('Old test directory still exists: tests/');
      log.warning('Old test directory still exists: tests/');
      log.info('Consider removing after validation: rm -rf tests/');
    } else {
      log.success('Old test directory has been removed');
    }
  }

  testJestExecution() {
    log.header('Testing Jest Execution');

    try {
      // Test if Jest can load the configuration
      execSync('npx jest --config=tools/testing/jest.config.ts --listTests', {
        cwd: this.projectRoot,
        stdio: 'pipe',
      });
      log.success('Jest configuration loads successfully');
    } catch (error) {
      this.errors.push(`Jest configuration error: ${error.message}`);
      log.error(`Jest configuration error: ${error.message}`);
    }
  }

  generateReport() {
    log.header('Migration Validation Report');

    console.log(`\n${colors.bold}📊 SUMMARY${colors.reset}`);
    console.log(`${colors.green}✅ Successful validations${colors.reset}`);
    console.log(
      `${colors.yellow}⚠️  Warnings: ${this.warnings.length}${colors.reset}`
    );
    console.log(`${colors.red}❌ Errors: ${this.errors.length}${colors.reset}`);

    if (this.warnings.length > 0) {
      console.log(`\n${colors.yellow}${colors.bold}WARNINGS:${colors.reset}`);
      this.warnings.forEach((warning) => {
        console.log(`${colors.yellow}  • ${warning}${colors.reset}`);
      });
    }

    if (this.errors.length > 0) {
      console.log(`\n${colors.red}${colors.bold}ERRORS:${colors.reset}`);
      this.errors.forEach((error) => {
        console.log(`${colors.red}  • ${error}${colors.reset}`);
      });
    }

    console.log(`\n${colors.bold}🎯 NEXT STEPS:${colors.reset}`);
    if (this.errors.length === 0) {
      console.log(
        `${colors.green}  ✅ Migration validation successful!${colors.reset}`
      );
      console.log(
        `${colors.blue}  🚀 You can now run: npm test${colors.reset}`
      );
      if (this.warnings.length === 0) {
        console.log(
          `${colors.green}  🎉 Perfect migration - no issues found!${colors.reset}`
        );
      }
    } else {
      console.log(
        `${colors.red}  ❌ Fix the errors above before proceeding${colors.reset}`
      );
    }

    if (fs.existsSync(path.resolve(this.projectRoot, 'tests'))) {
      console.log(
        `${colors.yellow}  🧹 Consider removing old test directory: rm -rf tests/${colors.reset}`
      );
    }

    return this.errors.length === 0;
  }

  run() {
    console.log(
      `${colors.bold}${colors.blue}🧪 NeonPro Test Migration Validator${colors.reset}\n`
    );

    this.validateTestStructure();
    this.validateMigratedFiles();
    this.validateConfigurationFiles();
    this.validatePackageJsonScripts();
    this.validateJestConfiguration();
    this.checkOldTestDirectory();
    this.testJestExecution();

    const success = this.generateReport();
    process.exit(success ? 0 : 1);
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new MigrationValidator();
  validator.run();
}

module.exports = MigrationValidator;
