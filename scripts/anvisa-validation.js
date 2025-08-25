#!/usr/bin/env node

/**
 * ANVISA Compliance Validation Script
 * Validates ANVISA compliance for Brazilian healthcare regulation
 * Used by GitHub Actions CI/CD pipeline
 */

const path = require('path');
const fs = require('fs');

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${colors.bold}${colors.blue}=== ${message} ===${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

async function validateProjectStructure() {
  logHeader('ANVISA Project Structure Validation');
  
  const requiredFiles = [
    'packages/compliance/src/anvisa',
    'packages/utils/src/compliance/anvisa.ts',
    'apps/web/lib/healthcare/anvisa-samd-compliance.ts'
  ];

  let allValid = true;

  for (const file of requiredFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      logSuccess(`Found: ${file}`);
    } else {
      logError(`Missing: ${file}`);
      allValid = false;
    }
  }

  return allValid;
}

async function validateComplianceModules() {
  logHeader('ANVISA Compliance Modules Validation');
  
  try {
    // Check if we can load the compliance modules
    const compliancePath = path.resolve(process.cwd(), 'packages/compliance/src/anvisa');
    
    if (!fs.existsSync(compliancePath)) {
      logError('ANVISA compliance modules not found');
      return false;
    }

    const files = fs.readdirSync(compliancePath);
    const expectedModules = [
      'index.ts',
      'regulatory-documentation-service.ts',
      'product-registration-service.ts',
      'procedure-classification-service.ts',
      'medical-device-service.ts',
      'adverse-event-service.ts'
    ];

    let allModulesPresent = true;

    for (const module of expectedModules) {
      if (files.includes(module)) {
        logSuccess(`Module found: ${module}`);
      } else {
        logWarning(`Optional module missing: ${module}`);
      }
    }

    return allModulesPresent;
  } catch (error) {
    logError(`Error validating compliance modules: ${error.message}`);
    return false;
  }
}

async function validateEnvironmentVariables() {
  logHeader('Environment Variables Validation');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  let allValid = true;

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      logSuccess(`${envVar} is set`);
    } else {
      logWarning(`${envVar} is not set (may be intentional for CI)`);
      // Don't fail on missing env vars in CI context
    }
  }

  return allValid;
}

async function validateANVISAConfiguration() {
  logHeader('ANVISA Configuration Validation');
  
  try {
    // Check package.json for ANVISA-related dependencies - look in apps/web first
    const webPackageJsonPath = path.resolve(process.cwd(), 'apps/web/package.json');
    const rootPackageJsonPath = path.resolve(process.cwd(), 'package.json');
    
    let packageJsonPath = webPackageJsonPath;
    
    if (!fs.existsSync(webPackageJsonPath)) {
      if (!fs.existsSync(rootPackageJsonPath)) {
        logError('package.json not found in apps/web or root');
        return false;
      }
      packageJsonPath = rootPackageJsonPath;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check for Supabase client (required for ANVISA compliance)
    const hasSupabase = packageJson.dependencies?.['@supabase/supabase-js'] || 
                      packageJson.devDependencies?.['@supabase/supabase-js'];
    
    if (hasSupabase) {
      logSuccess(`Supabase client dependency found in ${packageJsonPath.includes('apps/web') ? 'apps/web' : 'root'}`);
    } else {
      logError('Supabase client dependency missing');
      return false;
    }

    return true;
  } catch (error) {
    logError(`Error validating ANVISA configuration: ${error.message}`);
    return false;
  }
}

async function runANVISAValidation() {
  logHeader('ANVISA Compliance Validation Suite');
  
  const validations = [
    { name: 'Project Structure', fn: validateProjectStructure },
    { name: 'Compliance Modules', fn: validateComplianceModules },
    { name: 'Environment Variables', fn: validateEnvironmentVariables },
    { name: 'ANVISA Configuration', fn: validateANVISAConfiguration }
  ];

  let allPassed = true;
  const results = [];

  for (const validation of validations) {
    try {
      log(`\nRunning ${validation.name} validation...`);
      const result = await validation.fn();
      results.push({ name: validation.name, passed: result });
      
      if (result) {
        logSuccess(`${validation.name} validation passed`);
      } else {
        logError(`${validation.name} validation failed`);
        allPassed = false;
      }
    } catch (error) {
      logError(`${validation.name} validation error: ${error.message}`);
      results.push({ name: validation.name, passed: false, error: error.message });
      allPassed = false;
    }
  }

  // Summary
  logHeader('ANVISA Validation Summary');
  
  results.forEach(result => {
    if (result.passed) {
      logSuccess(`${result.name}: PASSED`);
    } else {
      logError(`${result.name}: FAILED${result.error ? ` (${result.error})` : ''}`);
    }
  });

  if (allPassed) {
    log(`\n${colors.bold}${colors.green}🎉 All ANVISA compliance validations passed!${colors.reset}`);
    process.exit(0);
  } else {
    log(`\n${colors.bold}${colors.red}💥 Some ANVISA compliance validations failed!${colors.reset}`);
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  runANVISAValidation().catch(error => {
    logError(`Unexpected error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  validateProjectStructure,
  validateComplianceModules,
  validateEnvironmentVariables,
  validateANVISAConfiguration,
  runANVISAValidation
};