#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple syntax fixer for common test file issues
class SimpleSyntaxFixer {
  constructor() {
    this.fixes = 0;
    this.files = 0;
  }

  findTestFiles(dir) {
    const testFiles = [];
    const scanDirectory = (currentDir) => {
      if (!fs.existsSync(currentDir)) return;

      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
          scanDirectory(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx'))) {
          testFiles.push(fullPath);
        }
      }
    };

    scanDirectory(dir);
    return testFiles;
  }

  fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      let fixed = content;
      let madeChanges = false;

      // Fix 1: Unterminated strings - common pattern
      fixed = fixed.replace(/:\s*'([^']*?)\s*,\s*\/\/\s*([^']*?)$/gm, "': '', // $2");
      fixed = fixed.replace(/:\s*"([^"]*?)\s*,\s*\/\/\s*([^']*?)$/gm, '": "", // $2');

      // Fix 2: Missing consents array when accessing consents?.*
      if (fixed.includes('consents?.') && !fixed.includes('consents: [')) {
        // Look for consentRecord objects and add consents array
        fixed = fixed.replace(/(consentRecord\s*:\s*\{[^}]*)(\})/g, (match, before, after) => {
          if (before.includes('consents?') && !before.includes('consents:')) {
            return before + '  consents: [],\n' + after;
          }
          return match;
        });
      }

      // Fix 3: Missing catch parameters
      fixed = fixed.replace(/catch\s*\{\s*$/gm, 'catch (error) {');
      fixed = fixed.replace(/catch\s*$/gm, 'catch (error)');

      // Fix 4: Missing semicolons in import statements
      fixed = fixed.replace(/import\s+.*?from\s+['"][^'"]*['"]\s*$/gm, (match) => {
        if (!match.trim().endsWith(';')) {
          return match + ';';
        }
        return match;
      });

      // Fix 5: Common missing colons in object properties
      fixed = fixed.replace(/(\w+)\s*([A-Z_a-z][A-Z_a-z0-9]*)\s*[=\[]/g, '$1: $2 = [');

      if (madeChanges || fixed !== content) {
        fs.writeFileSync(filePath, fixed, 'utf-8');
        this.fixes++;
        console.log(`✅ Fixed ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}: ${error.message}`);
      return false;
    }
  }

  run() {
    console.log('🚀 Simple syntax fixer running...');
    
    const testFiles = this.findTestFiles('/home/vibecode/neonpro/apps');
    console.log(`Found ${testFiles.length} test files`);

    let fixedCount = 0;
    for (const file of testFiles) {
      if (this.fixFile(file)) {
        fixedCount++;
      }
    }

    console.log(`\n=== FIX SUMMARY ===`);
    console.log(`✅ Files fixed: ${fixedCount}`);
    console.log(`✅ Total fixes: ${this.fixes}`);
    console.log(`📊 Success rate: ${((fixedCount / testFiles.length) * 100).toFixed(1)}%`);
  }
}

// Run the fixer
const fixer = new SimpleSyntaxFixer();
fixer.run();