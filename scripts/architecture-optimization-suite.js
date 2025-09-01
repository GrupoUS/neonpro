#!/usr/bin/env node

/**
 * NeonPro Architecture Optimization Suite
 * 
 * Automated scripts for safe package consolidation, file removal,
 * and configuration optimization based on comprehensive audit findings.
 * 
 * Usage:
 *   node scripts/architecture-optimization-suite.js --phase=1
 *   node scripts/architecture-optimization-suite.js --consolidate-cache
 *   node scripts/architecture-optimization-suite.js --cleanup-test-artifacts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  backupDir: './.archive',
  logFile: './optimization.log',
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
};

// Logging utility
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${level}: ${message}`;
  
  console.log(logMessage);
  
  if (!CONFIG.dryRun) {
    fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
  }
}

// Backup utility
function createBackup(filePath) {
  if (CONFIG.dryRun) {
    log(`[DRY RUN] Would backup: ${filePath}`);
    return;
  }
  
  const backupPath = path.join(CONFIG.backupDir, filePath);
  const backupDir = path.dirname(backupPath);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    log(`Backed up: ${filePath} -> ${backupPath}`);
  }
}

// Phase 1: Safe Cleanup (Test Artifacts & Obsolete Config)
function phase1SafeCleanup() {
  log('=== PHASE 1: SAFE CLEANUP ===');
  
  // Clean up test artifacts
  const testArtifacts = [
    'tools/testing/reports/test-results/',
    'tools/testing/test-results/',
  ];
  
  testArtifacts.forEach(dir => {
    if (fs.existsSync(dir)) {
      createBackup(dir);
      if (!CONFIG.dryRun) {
        execSync(`rm -rf "${dir}"`);
        log(`Removed test artifacts: ${dir}`);
      } else {
        log(`[DRY RUN] Would remove: ${dir}`);
      }
    }
  });
  
  // Clean up obsolete environment configuration
  cleanupEnvironmentConfig();
  
  log('Phase 1 completed successfully');
}

// Clean up obsolete environment configuration
function cleanupEnvironmentConfig() {
  const envFile = 'packages/devops/src/deployment/environments/production.env';
  
  if (!fs.existsSync(envFile)) {
    log(`Environment file not found: ${envFile}`, 'WARN');
    return;
  }
  
  createBackup(envFile);
  
  if (CONFIG.dryRun) {
    log(`[DRY RUN] Would clean up obsolete config in: ${envFile}`);
    return;
  }
  
  let content = fs.readFileSync(envFile, 'utf8');
  
  // Remove commented Redis configuration (lines 28-36)
  content = content.replace(/# REDIS_URL=.*\n# REDIS_PASSWORD=.*\n# REDIS_TLS_ENABLED=.*\n# REDIS_CONNECTION_POOL_SIZE=.*\n# REDIS_MAX_RETRIES=.*\n# REDIS_RETRY_DELAY=.*\n/g, '');
  
  // Remove CFM compliance settings
  content = content.replace(/CFM_COMPLIANCE_ENABLED=.*\n/g, '');
  content = content.replace(/CFM_REGISTRATION_ENABLED=.*\n/g, '');
  content = content.replace(/CFM_TELEMEDICINE_COMPLIANCE=.*\n/g, '');
  content = content.replace(/CFM_MEDICAL_RECORD_INTEGRITY=.*\n/g, '');
  content = content.replace(/CFM_PROFESSIONAL_AUTHORIZATION_REQUIRED=.*\n/g, '');
  
  // Remove ANVISA compliance settings
  content = content.replace(/ANVISA_COMPLIANCE_ENABLED=.*\n/g, '');
  content = content.replace(/ANVISA_REGISTRATION_NUMBER=.*\n/g, '');
  content = content.replace(/ANVISA_REPORTING_ENABLED=.*\n/g, '');
  content = content.replace(/ANVISA_AUDIT_TRAIL_REQUIRED=.*\n/g, '');
  
  fs.writeFileSync(envFile, content);
  log(`Cleaned up obsolete configuration in: ${envFile}`);
}

// Phase 2: Package Consolidation
function phase2PackageConsolidation() {
  log('=== PHASE 2: PACKAGE CONSOLIDATION ===');
  
  if (process.argv.includes('--consolidate-cache')) {
    consolidateCacheImplementations();
  }
  
  if (process.argv.includes('--merge-monitoring')) {
    mergeMonitoringPackages();
  }
  
  if (process.argv.includes('--consolidate-auth')) {
    consolidateAuthPackages();
  }
  
  log('Phase 2 completed successfully');
}

// Consolidate cache implementations
function consolidateCacheImplementations() {
  log('Consolidating cache implementations...');
  
  const duplicateFiles = [
    'packages/ai/src/services/cache-management-service.ts',
    'packages/ai/src/services/cache-service.ts'
  ];
  
  duplicateFiles.forEach(file => {
    if (fs.existsSync(file)) {
      createBackup(file);
      
      if (!CONFIG.dryRun) {
        // Move AI-specific cache logic to @neonpro/cache if needed
        // For now, just remove the duplicates
        fs.unlinkSync(file);
        log(`Removed duplicate cache implementation: ${file}`);
      } else {
        log(`[DRY RUN] Would remove duplicate: ${file}`);
      }
    }
  });
  
  // Update AI package to import from @neonpro/cache
  updateImportStatements('packages/ai/src/', 'cache-management-service', '@neonpro/cache');
  updateImportStatements('packages/ai/src/', 'cache-service', '@neonpro/cache');
}

// Merge monitoring packages
function mergeMonitoringPackages() {
  log('Merging health-dashboard into monitoring package...');
  
  const healthDashboardDir = 'packages/health-dashboard/';
  const monitoringDir = 'packages/monitoring/';
  
  if (fs.existsSync(healthDashboardDir)) {
    createBackup(healthDashboardDir);
    
    if (!CONFIG.dryRun) {
      // Move health-dashboard components to monitoring
      const srcDir = path.join(healthDashboardDir, 'src/components/');
      const targetDir = path.join(monitoringDir, 'src/dashboard/');
      
      if (fs.existsSync(srcDir)) {
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        execSync(`cp -r "${srcDir}"* "${targetDir}"`);
        log(`Moved health-dashboard components to monitoring package`);
      }
      
      // Remove health-dashboard package
      execSync(`rm -rf "${healthDashboardDir}"`);
      log(`Removed health-dashboard package`);
    } else {
      log(`[DRY RUN] Would merge health-dashboard into monitoring`);
    }
  }
}

// Update import statements
function updateImportStatements(directory, oldImport, newImport) {
  if (CONFIG.dryRun) {
    log(`[DRY RUN] Would update imports in: ${directory}`);
    return;
  }
  
  const files = getAllTsFiles(directory);
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Update import statements
    content = content.replace(
      new RegExp(`from ['"].*${oldImport}['"]`, 'g'),
      `from '${newImport}'`
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      log(`Updated imports in: ${file}`);
    }
  });
}

// Get all TypeScript files recursively
function getAllTsFiles(directory) {
  const files = [];
  
  function traverse(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    });
  }
  
  if (fs.existsSync(directory)) {
    traverse(directory);
  }
  
  return files;
}

// Main execution
function main() {
  log('Starting NeonPro Architecture Optimization Suite');
  
  // Create backup directory
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }
  
  // Parse command line arguments
  const phase = process.argv.find(arg => arg.startsWith('--phase='))?.split('=')[1];
  
  if (phase === '1' || process.argv.includes('--cleanup-test-artifacts')) {
    phase1SafeCleanup();
  }
  
  if (phase === '2' || process.argv.some(arg => arg.startsWith('--consolidate') || arg.startsWith('--merge'))) {
    phase2PackageConsolidation();
  }
  
  if (!phase && !process.argv.some(arg => arg.startsWith('--'))) {
    log('No specific phase or action specified. Use --help for usage information.');
    console.log(`
Usage:
  node scripts/architecture-optimization-suite.js --phase=1
  node scripts/architecture-optimization-suite.js --phase=2
  node scripts/architecture-optimization-suite.js --consolidate-cache
  node scripts/architecture-optimization-suite.js --merge-monitoring
  node scripts/architecture-optimization-suite.js --cleanup-test-artifacts
  node scripts/architecture-optimization-suite.js --dry-run --verbose
    `);
  }
  
  log('Architecture optimization completed');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  phase1SafeCleanup,
  phase2PackageConsolidation,
  consolidateCacheImplementations,
  mergeMonitoringPackages,
  updateImportStatements
};
