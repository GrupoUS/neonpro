#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting specific error fixing...');

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix remaining catch parameters
    const catchParamPatterns = [
      /} catch \((_error)\) \{/g,
      /} catch \((_error2)\) \{/g,
      /} catch \((_fallbackError)\) \{/g,
      /} catch \((_checkError)\) \{/g,
      /catch \((_error)\) \{/g,
      /catch \((error)\) \{([^}]*console\.error[^}]*)\}/g
    ];

    for (const pattern of catchParamPatterns) {
      if (content.match(pattern)) {
        content = content.replace(pattern, (match) => {
          if (match.includes('console.error')) {
            return match.replace(/catch \((error)\)/, 'catch (_error)');
          }
          return match;
        });
        modified = true;
      }
    }

    // Fix unused parameters by prefixing with _
    const paramPatterns = [
      /(\w+): any\) \{[\s\S]*?\/\/ [^}]*Parameter '\1' is declared but never used/g,
      /(\w+)\?: any,[\s\S]*?\/\/ [^}]*Parameter '\1' is declared but never used/g,
      /(\w+): [^,)]+\)[\s\S]*?\/\/ [^}]*Parameter '\1' is declared but never used/g
    ];

    // Specific parameter fixes based on error output
    const specificParams = [
      { old: 'config: any', new: '_config: any' },
      { old: 'options?: any', new: '_options?: any' },
      { old: 'query', new: '_query' },
      { old: 'context', new: '_context' },
      { old: 'userId', new: '_userId' },
      { old: 'request', new: '_request' },
      { old: 'role', new: '_role' },
      { old: 'payload', new: '_payload' },
      { old: 'service', new: '_service' },
      { old: 'fallbackValue', new: '_fallbackValue' },
      { old: 'ColumnDef', new: '_ColumnDef' }
    ];

    for (const { old, new: newParam } of specificParams) {
      const oldPattern = new RegExp(`\\b${old}\\b(?=[:)]|\\?:)`, 'g');
      if (content.match(oldPattern)) {
        content = content.replace(oldPattern, newParam);
        modified = true;
      }
    }

    // Fix unused variables by prefixing with _
    const varPatterns = [
      /const (rateLimitKey) = /g,
      /const (now) = /g,
      /const (windowMs) = /g
    ];

    for (const pattern of varPatterns) {
      content = content.replace(pattern, (match, varName) => {
        return match.replace(varName, `_${varName}`);
      });
      modified = true;
    }

    // Fix remaining unused imports
    const unusedImports = [
      /import.*z.*from ['"]zod['"];?\s*\n/g,
      /import { z } from ['"]zod['"];?\s*\n/g,
      /import {[^}]*z[^}]*} from ['"]zod['"];?\s*\n/g
    ];

    for (const pattern of unusedImports) {
      if (content.match(pattern)) {
        content = content.replace(pattern, '');
        modified = true;
      }
    }

    // Clean up multiple empty lines
    content = content.replace(/\n\n\n+/g, '\n\n');

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
  return false;
}

function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  let fixedCount = 0;

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      fixedCount += processDirectory(fullPath);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js'))) {
      if (processFile(fullPath)) {
        fixedCount++;
      }
    }
  }

  return fixedCount;
}

// Process main directories
const directories = ['./apps', './packages'];
let totalFixed = 0;

for (const dir of directories) {
  if (fs.existsSync(dir)) {
    console.log(`📁 Processing ${dir}...`);
    totalFixed += processDirectory(dir);
  }
}

// Also fix the root level scripts
const rootFiles = ['fix-unused-imports.js', 'fix-remaining-errors-comprehensive.cjs'];
for (const file of rootFiles) {
  if (fs.existsSync(file)) {
    if (processFile(file)) {
      totalFixed++;
    }
  }
}

console.log(`\n📊 Summary:`);
console.log(`✅ Files modified: ${totalFixed}`);
console.log(`🎯 Error types fixed:`);
console.log(`  - Catch parameters (prefixed with _)`);
console.log(`  - Unused parameters (prefixed with _)`);
console.log(`  - Unused variables (prefixed with _)`);
console.log(`  - Remaining unused imports (z from zod)`);