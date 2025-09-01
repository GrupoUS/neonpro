#!/usr/bin/env node

/**
 * Migration Script: Consolidate Enterprise Audit Service
 * 
 * This script migrates from EnterpriseAuditService to UnifiedAuditService
 * completing the final audit service consolidation.
 * 
 * Usage: node scripts/migrate-enterprise-audit.cjs
 */

const fs = require('fs');
const path = require('path');

// Patterns to find and replace
const MIGRATION_PATTERNS = [
  // Import statements
  {
    from: /import.*EnterpriseAuditService.*from.*["'].*enterprise.*audit.*["']/g,
    to: "import { UnifiedAuditService as EnterpriseAuditService } from '@neonpro/security';"
  },
  {
    from: /import.*{.*EnterpriseAuditService.*}.*from.*["'].*enterprise.*["']/g,
    to: "import { UnifiedAuditService as EnterpriseAuditService } from '@neonpro/security';"
  },
  
  // Export statements
  {
    from: /export.*{.*EnterpriseAuditService.*}.*from.*["'].*audit.*EnterpriseAuditService.*["']/g,
    to: "export { UnifiedAuditService as EnterpriseAuditService } from '@neonpro/security';"
  },
  
  // Class instantiation
  {
    from: /new EnterpriseAuditService\(/g,
    to: "new UnifiedAuditService("
  },
  
  // Type annotations
  {
    from: /:\s*EnterpriseAuditService/g,
    to: ": UnifiedAuditService"
  },
  
  // Comments and documentation
  {
    from: /EnterpriseAuditService:/g,
    to: "UnifiedAuditService:"
  }
];

// Files to exclude from migration
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /\.turbo/,
  /EnterpriseAuditService\.ts$/,
  /migrate-enterprise-audit\.cjs$/
];

// File extensions to process
const INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  // Check exclude patterns
  if (EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath))) {
    return false;
  }
  
  // Check file extension
  const ext = path.extname(filePath);
  return INCLUDE_EXTENSIONS.includes(ext);
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;
    
    // Apply migration patterns
    MIGRATION_PATTERNS.forEach(pattern => {
      const newContent = updatedContent.replace(pattern.from, pattern.to);
      if (newContent !== updatedContent) {
        hasChanges = true;
        updatedContent = newContent;
      }
    });
    
    // Write back if changes were made
    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dirPath) {
  let totalFiles = 0;
  let updatedFiles = 0;
  
  function walkDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        walkDirectory(itemPath);
      } else if (stat.isFile() && shouldProcessFile(itemPath)) {
        totalFiles++;
        if (processFile(itemPath)) {
          updatedFiles++;
        }
      }
    });
  }
  
  walkDirectory(dirPath);
  return { totalFiles, updatedFiles };
}

/**
 * Main migration function
 */
function main() {
  console.log('🚀 Starting enterprise audit service migration...\n');
  
  const projectRoot = path.resolve(__dirname, '..');
  const { totalFiles, updatedFiles } = processDirectory(projectRoot);
  
  console.log('\n📊 Migration Summary:');
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files updated: ${updatedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - updatedFiles}`);
  
  if (updatedFiles > 0) {
    console.log('\n✅ Enterprise audit migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Review the changes with git diff');
    console.log('   2. Test the application to ensure audit functionality works');
    console.log('   3. Remove EnterpriseAuditService.ts file after validation');
    console.log('   4. Update package.json dependencies if needed');
  } else {
    console.log('\n✨ No files needed updating - migration may already be complete!');
  }
}

// Run migration if called directly
if (require.main === module) {
  main();
}

module.exports = { processFile, processDirectory, MIGRATION_PATTERNS };
