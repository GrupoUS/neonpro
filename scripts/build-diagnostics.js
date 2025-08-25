#!/usr/bin/env node

/**
 * Build Diagnostics Script for NeonPro Vercel Deployment
 * Validates build process and identifies specific error causes
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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

async function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    try {
      log(`Running: ${command}`, colors.blue);
      const result = execSync(command, { 
        cwd, 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000 // 5 minutes timeout
      });
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

async function checkPrerequisites() {
  logHeader('Prerequisites Check');
  
  try {
    // Check Node version
    const nodeVersion = await runCommand('node --version');
    logSuccess(`Node.js version: ${nodeVersion.trim()}`);
    
    // Check PNPM version
    const pnpmVersion = await runCommand('pnpm --version');
    logSuccess(`PNPM version: ${pnpmVersion.trim()}`);
    
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      throw new Error('package.json not found. Run this script from the root directory.');
    }
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.name !== 'neonpro') {
      throw new Error('This script must be run from the NeonPro root directory.');
    }
    
    logSuccess('Directory structure validated');
    return true;
  } catch (error) {
    logError(`Prerequisites check failed: ${error.message}`);
    return false;
  }
}

async function validateWorkspace() {
  logHeader('Workspace Validation');
  
  try {
    // Check pnpm-workspace.yaml
    if (!fs.existsSync('pnpm-workspace.yaml')) {
      throw new Error('pnpm-workspace.yaml not found');
    }
    logSuccess('Workspace configuration found');
    
    // Check apps/web exists
    if (!fs.existsSync('apps/web')) {
      throw new Error('apps/web directory not found');
    }
    logSuccess('Web app directory exists');
    
    // Check apps/web/package.json
    if (!fs.existsSync('apps/web/package.json')) {
      throw new Error('apps/web/package.json not found');
    }
    logSuccess('Web app package.json exists');
    
    // Check turbo.json
    if (!fs.existsSync('turbo.json')) {
      throw new Error('turbo.json not found');
    }
    logSuccess('Turbo configuration found');
    
    return true;
  } catch (error) {
    logError(`Workspace validation failed: ${error.message}`);
    return false;
  }
}

async function testDependencyInstallation() {
  logHeader('Dependency Installation Test');
  
  try {
    // Clean install
    log('Cleaning node_modules and installing dependencies...');
    if (fs.existsSync('node_modules')) {
      logWarning('Removing existing node_modules...');
      await runCommand('rm -rf node_modules');
    }
    
    if (fs.existsSync('apps/web/node_modules')) {
      logWarning('Removing existing apps/web/node_modules...');
      await runCommand('rm -rf apps/web/node_modules');
    }
    
    // Fresh install
    await runCommand('pnpm install');
    logSuccess('Dependencies installed successfully');
    
    return true;
  } catch (error) {
    logError(`Dependency installation failed: ${error.message}`);
    logError(error.stdout || '');
    logError(error.stderr || '');
    return false;
  }
}

async function testWorkspacePackages() {
  logHeader('Workspace Packages Test');
  
  try {
    // List workspace packages
    const workspaces = await runCommand('pnpm list --depth=0 --json');
    const workspaceData = JSON.parse(workspaces);
    
    logSuccess(`Found ${workspaceData.length || 0} workspace packages`);
    
    // Check if @neonpro packages are available
    const requiredPackages = ['@neonpro/ui', '@neonpro/utils', '@neonpro/domain', '@neonpro/db'];
    
    for (const pkg of requiredPackages) {
      try {
        await runCommand(`pnpm list ${pkg}`);
        logSuccess(`Package ${pkg} is available`);
      } catch (error) {
        logWarning(`Package ${pkg} may not be properly linked`);
      }
    }
    
    return true;
  } catch (error) {
    logError(`Workspace packages test failed: ${error.message}`);
    return false;
  }
}

async function testTypeScript() {
  logHeader('TypeScript Validation');
  
  try {
    // Type check root
    await runCommand('npx tsc --noEmit --project .');
    logSuccess('Root TypeScript validation passed');
    
    // Type check web app
    await runCommand('npx tsc --noEmit --project apps/web');
    logSuccess('Web app TypeScript validation passed');
    
    return true;
  } catch (error) {
    logError(`TypeScript validation failed: ${error.message}`);
    logError(error.stdout || '');
    logError(error.stderr || '');
    return false;
  }
}

async function testBuild() {
  logHeader('Build Test');
  
  try {
    // Try Turbo build
    log('Testing Turbo build...');
    await runCommand('pnpm run build --filter=@neonpro/web');
    logSuccess('Turbo build successful');
    
    // Verify output
    if (fs.existsSync('apps/web/.next')) {
      logSuccess('Build output directory created');
      
      const buildFiles = fs.readdirSync('apps/web/.next');
      logSuccess(`Build files created: ${buildFiles.length} items`);
    } else {
      logWarning('Build output directory not found');
    }
    
    return true;
  } catch (error) {
    logError(`Build test failed: ${error.message}`);
    logError(error.stdout || '');
    logError(error.stderr || '');
    
    // Try direct Next.js build
    try {
      log('Trying direct Next.js build...');
      await runCommand('npx next build', 'apps/web');
      logSuccess('Direct Next.js build successful');
      return true;
    } catch (nextError) {
      logError(`Direct Next.js build also failed: ${nextError.message}`);
      logError(nextError.stdout || '');
      logError(nextError.stderr || '');
      return false;
    }
  }
}

async function testVercelConfiguration() {
  logHeader('Vercel Configuration Test');
  
  try {
    // Check vercel.json
    if (!fs.existsSync('vercel.json')) {
      throw new Error('vercel.json not found');
    }
    
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    logSuccess('vercel.json found and valid');
    
    // Validate configuration
    if (!vercelConfig.buildCommand) {
      logWarning('No buildCommand specified in vercel.json');
    } else {
      logSuccess(`Build command: ${vercelConfig.buildCommand}`);
    }
    
    if (!vercelConfig.outputDirectory) {
      logWarning('No outputDirectory specified in vercel.json');
    } else {
      logSuccess(`Output directory: ${vercelConfig.outputDirectory}`);
    }
    
    // Test if output directory exists after build
    if (fs.existsSync(vercelConfig.outputDirectory)) {
      logSuccess('Output directory exists');
    } else {
      logWarning('Output directory does not exist (build may have failed)');
    }
    
    return true;
  } catch (error) {
    logError(`Vercel configuration test failed: ${error.message}`);
    return false;
  }
}

async function generateDiagnosticReport() {
  logHeader('Generating Diagnostic Report');
  
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: '',
    pnpmVersion: '',
    environment: process.env.NODE_ENV || 'development',
    errors: [],
    warnings: [],
    success: [],
    recommendations: []
  };
  
  try {
    report.nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    report.pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
  } catch (error) {
    report.errors.push('Failed to get version information');
  }
  
  // Add recommendations based on common issues
  report.recommendations.push('Consider using Node.js 18.x or 20.x for better compatibility');
  report.recommendations.push('Ensure all @neonpro/* packages are properly built before web app');
  report.recommendations.push('Check if TypeScript errors are blocking the build');
  report.recommendations.push('Verify Vercel environment variables are properly set');
  
  const reportPath = 'build-diagnostic-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logSuccess(`Diagnostic report saved to ${reportPath}`);
  
  return report;
}

async function runDiagnostics() {
  logHeader('NeonPro Build Diagnostics');
  log('Starting comprehensive build validation...\n');
  
  const results = {
    prerequisites: false,
    workspace: false,
    dependencies: false,
    packages: false,
    typescript: false,
    build: false,
    vercel: false
  };
  
  // Run all tests
  results.prerequisites = await checkPrerequisites();
  results.workspace = await validateWorkspace();
  results.dependencies = await testDependencyInstallation();
  results.packages = await testWorkspacePackages();
  results.typescript = await testTypeScript();
  results.build = await testBuild();
  results.vercel = await testVercelConfiguration();
  
  // Generate report
  await generateDiagnosticReport();
  
  // Summary
  logHeader('Diagnostic Summary');
  
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      logSuccess(`${test}: PASSED`);
    } else {
      logError(`${test}: FAILED`);
    }
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    log(`\n${colors.bold}${colors.green}🎉 All diagnostics passed! Build should work on Vercel.${colors.reset}`);
    process.exit(0);
  } else {
    log(`\n${colors.bold}${colors.red}💥 Some diagnostics failed. Check the issues above and the diagnostic report.${colors.reset}`);
    process.exit(1);
  }
}

// Run diagnostics if called directly
if (require.main === module) {
  runDiagnostics().catch(error => {
    logError(`Unexpected error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  runDiagnostics,
  checkPrerequisites,
  validateWorkspace,
  testDependencyInstallation,
  testWorkspacePackages,
  testTypeScript,
  testBuild,
  testVercelConfiguration
};