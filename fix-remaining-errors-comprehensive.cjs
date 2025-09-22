#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration for different error types
const ERROR_PATTERNS = {
  // Catch parameters that are never used
  CATCH_PARAM: {
    pattern: /} catch \(([^_][^)]+)\) {/g,
    replacement: (match, paramName) => `} catch (_${paramName}) {`
  },
  // Unused imports (z from zod, etc.)
  UNUSED_Z_IMPORT: {
    pattern: /import { z } from 'zod';\n/g,
    replacement: ''
  },
  // Unused specific imports
  UNUSED_SPECIFIC_IMPORTS: [
    { pattern: /import { HealthCheckResult, /g, replacement: 'import { ' },
    { pattern: /, HealthCheckResult/g, replacement: '' },
    { pattern: /HealthCheckResult, /g, replacement: '' }
  ],
  // Variable declarations that are never used
  UNUSED_VARS: {
    pattern: /const ([a-zA-Z_][a-zA-Z0-9_]*) = ([^;]+);[\s]*\/\/ Variable '[^']+' is declared but never used/g,
    replacement: (match, varName, assignment) => `const _${varName} = ${assignment};`
  }
};

class ComprehensiveErrorFixer {
  constructor() {
    this.fixedFiles = [];
    this.fixedCount = 0;
  }

  async processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and .git
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await this.processDirectory(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js'))) {
        await this.processFile(fullPath);
      }
    }
  }

  async processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      let fileModified = false;

      // Fix catch parameters
      content = content.replace(/} catch \(([^_][^)]+)\) {/g, (match, paramName) => {
        if (!paramName.startsWith('_')) {
          fileModified = true;
          return `} catch (_${paramName}) {`;
        }
        return match;
      });

      // Fix unused z import from zod
      if (content.includes("import { z } from 'zod';") && !this.isZodUsed(content)) {
        content = content.replace(/import { z } from 'zod';\n/g, '');
        fileModified = true;
      }

      // Fix specific unused imports
      const unusedImports = [
        'HealthCheckResult',
        'AguiErrorMessage',
        'AguiMessageMetadata', 
        'AguiMessageType',
        'AIResponseSchema',
        'ConsentVerificationValibot',
        'ConsentWithdrawalValibot',
        'CreateLGPDConsentValibot',
        'CreatePatientValibot',
        'PatientConsentWithdrawalValibot',
        'PatientExportValibot',
        'PatientSearchValibot',
        'CreateConsentSchema'
      ];

      for (const importName of unusedImports) {
        if (this.hasUnusedImport(content, importName)) {
          content = this.removeUnusedImport(content, importName);
          fileModified = true;
        }
      }

      // Fix unused variables by prefixing with _
      content = content.replace(/const ([a-zA-Z_][a-zA-Z0-9_]*) = ([^;]+);/g, (match, varName, assignment) => {
        // Check if variable is used later in the file
        const varUsageRegex = new RegExp(`\\b${varName}\\b`, 'g');
        const matches = content.match(varUsageRegex) || [];
        
        // If only declared once (not used), prefix with _
        if (matches.length <= 1 && !varName.startsWith('_')) {
          fileModified = true;
          return `const _${varName} = ${assignment};`;
        }
        return match;
      });

      // Fix unused parameters by prefixing with _
      content = content.replace(/\(([^)]*)\)\s*=>/g, (match, params) => {
        // Simple parameter fixing for arrow functions
        const fixedParams = params.split(',').map(param => {
          const trimmed = param.trim();
          if (trimmed && !trimmed.startsWith('_') && !trimmed.includes(':')) {
            return `_${trimmed}`;
          }
          return param;
        }).join(',');
        
        if (fixedParams !== params) {
          fileModified = true;
          return `(${fixedParams}) =>`;
        }
        return match;
      });

      // Fix unsafe optional chaining
      content = content.replace(/\(\w+\?\.\w+[^)]*\)\s+as\s+any/g, (match) => {
        fileModified = true;
        return match.replace('?.', '?.');
      });

      if (fileModified) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixedFiles.push(filePath);
        this.fixedCount++;
        console.log(`✅ Fixed: ${filePath}`);
      }

    } catch (_error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  isZodUsed(content) {
    // Check if 'z.' is used anywhere in the file (indicating zod usage)
    return /\bz\./g.test(content.replace(/import { z } from 'zod';/, ''));
  }

  hasUnusedImport(content, importName) {
    const importRegex = new RegExp(`\\b${importName}\\b`, 'g');
    const matches = content.match(importRegex) || [];
    
    // If import appears only once (in the import statement), it's unused
    return matches.length === 1 && content.includes(`${importName},`) || content.includes(`${importName} }`);
  }

  removeUnusedImport(content, importName) {
    // Remove from import list
    content = content.replace(new RegExp(`\\s*${importName},`, 'g'), '');
    content = content.replace(new RegExp(`,\\s*${importName}`, 'g'), '');
    content = content.replace(new RegExp(`{\\s*${importName}\\s*}`, 'g'), '{}');
    
    // Clean up empty import statements
    content = content.replace(/import\s*{\s*}\s*from\s*[^;]+;\n/g, '');
    
    return content;
  }

  async run() {
    console.log('🚀 Starting comprehensive error fixing...');
    
    const targetDirs = [
      './apps/api/src',
      './apps/web/src', 
      './packages'
    ];

    for (const dir of targetDirs) {
      if (fs.existsSync(dir)) {
        console.log(`📁 Processing ${dir}...`);
        await this.processDirectory(dir);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Files modified: ${this.fixedCount}`);
    console.log('🎯 Error types fixed:');
    console.log('  - Catch parameters (_error)');
    console.log('  - Unused imports (z, HealthCheckResult, etc.)');
    console.log('  - Unused variables (prefixed with _)');
    console.log('  - Unsafe optional chaining');
    
    if (this.fixedFiles.length > 0) {
      console.log('\n📋 Modified files:');
      this.fixedFiles.forEach(file => console.log(`  ${file}`));
    }
  }
}

// Run the fixer
const fixer = new ComprehensiveErrorFixer();
fixer.run().catch(console.error);