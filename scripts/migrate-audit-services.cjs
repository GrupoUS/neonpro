#!/usr/bin/env node

/**
 * Migration Script: Consolidate Audit Services
 * 
 * This script helps migrate from the three separate audit implementations
 * to the unified audit service in the security package.
 * 
 * Usage: node scripts/migrate-audit-services.js
 */

const fs = require('fs');
const path = require('path');

// Patterns to find and replace
const MIGRATION_PATTERNS = [
  // Import statements
  {
    from: /import.*from.*["']@neonpro\/compliance.*audit.*["']/g,
    to: "import { UnifiedAuditService, AuditEventType, AuditSeverity } from '@neonpro/security';"
  },
  {
    from: /import.*from.*["']@neonpro\/audit-trail.*["']/g,
    to: "import { UnifiedAuditService, AuditEventType, AuditSeverity } from '@neonpro/security';"
  },
  {
    from: /import.*AuditService.*from.*["'].*security.*audit-service.*["']/g,
    to: "import { UnifiedAuditService as AuditService } from '@neonpro/security';"
  },
  
  // Class instantiation
  {
    from: /new AuditService\(/g,
    to: "new UnifiedAuditService("
  },
  {
    from: /new ImmutableAuditLogger\(/g,
    to: "new UnifiedAuditService("
  },
  
  // Method calls that need updating
  {
    from: /\.logHealthcareEvent\(/g,
    to: ".logProcedureEvent("
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
  /unified-audit-service\.ts$/,
  /migrate-audit-services\.js$/
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
  console.log('🚀 Starting audit service migration...\n');
  
  const projectRoot = path.resolve(__dirname, '..');
  const { totalFiles, updatedFiles } = processDirectory(projectRoot);
  
  console.log('\n📊 Migration Summary:');
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files updated: ${updatedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - updatedFiles}`);
  
  if (updatedFiles > 0) {
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Review the changes with git diff');
    console.log('   2. Test the application to ensure audit functionality works');
    console.log('   3. Remove old audit service files after validation');
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
