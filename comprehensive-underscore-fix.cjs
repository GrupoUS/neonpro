#!/usr/bin/env node

/**
 * Comprehensive fix script for underscore syntax errors
 * Addresses patterns:
 * 1. `_()` → `()` (function parameters)
 * 2. `_'string'_` → `'string'` (string literals)
 * 3. `_(param1,_param2)` → `(param1, param2)` (parameter lists)
 * 4. `_,_` → `,` (comma separation)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UnderscoreSyntaxFixer {
  constructor() {
    this.filesProcessed = 0;
    this.filesModified = 0;
    this.totalFixes = 0;
    this.errors = [];
    
    // Define regex patterns for fixes
    this.patterns = [
      {
        name: 'function parameters',
        regex: /_\(\s*([^)]+)\s*\)/g,
        replacement: '($1)',
        description: '_() → ()'
      },
      {
        name: 'string literals',
        regex: /_'([^']+)'_/g,
        replacement: "'$1'",
        description: "_'string'_ → 'string'"
      },
      {
        name: 'parameter commas',
        regex: /_\s*,\s*_/g,
        replacement: ', ',
        description: '_,_ → ,'
      },
      {
        name: 'callback parameters',
        regex: /\(_([a-zA-Z_][a-zA-Z0-9_]*)\s*,\s*_([a-zA-Z_][a-zA-Z0-9_]*)\)/g,
        replacement: '($1, $2)',
        description: '_(param1,_param2) → (param1, param2)'
      },
      {
        name: 'single parameter with underscore',
        regex: /\(_([a-zA-Z_][a-zA-Z0-9_]*)\)/g,
        replacement: '($1)',
        description: '_(param) → (param)'
      },
      {
        name: 'event handler underscores',
        regex: /\.on\(_'([^']+)',_\s*\(/g,
        replacement: '.on(\'$1\', (',
        description: ".on('event',_( → .on('event', ("
      }
    ];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  shouldProcessFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const validExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    // Skip node_modules, dist, build, etc.
    const skipDirs = ['node_modules', 'dist', 'build', '.git', '.next', '.turbo'];
    
    return validExtensions.includes(ext) && 
           !skipDirs.some(dir => filePath.includes(`/${dir}/`)) &&
           fs.existsSync(filePath);
  }

  processFile(filePath) {
    try {
      if (!this.shouldProcessFile(filePath)) {
        return false;
      }

      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;
      let fileFixes = 0;

      // Apply each pattern
      for (const pattern of this.patterns) {
        const matches = content.match(pattern.regex);
        if (matches) {
          content = content.replace(pattern.regex, pattern.replacement);
          fileFixes += matches.length;
          this.log(`Applied ${pattern.description} to ${filePath}: ${matches.length} matches`, 'debug');
        }
      }

      // Additional specific fixes for complex patterns
      // Fix setInterval, setTimeout, etc.
      content = content.replace(/(setInterval|setTimeout|setImmediate)\s*\(_\(\s*\)\s*=>/g, '$1(() =>');
      
      // Fix event handlers with complex patterns
      content = content.replace(/\.on\(_'([^']+)'\s*,\s*_\(\s*([^)]+)\s*\)/g, '.on(\'$1\', ($2)');
      
      // Fix array/object access patterns
      content = content.replace(/\[\s*_'([^']+)'\s*\]/g, '[\'$1\']');
      
      // Only write if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.filesModified++;
        this.totalFixes += fileFixes;
        this.log(`Fixed ${fileFixes} issues in ${filePath}`, 'success');
        return true;
      }

      this.filesProcessed++;
      return false;
    } catch (error) {
      this.errors.push({
        file: filePath,
        error: error.message
      });
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  processDirectory(dirPath) {
    this.log(`Processing directory: ${dirPath}`);
    
    const walkDir = (currentPath) => {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (stat.isFile()) {
          this.processFile(fullPath);
        }
      }
    };
    
    walkDir(dirPath);
  }

  runTypeScriptCheck() {
    try {
      this.log('Running TypeScript compilation check...');
      const result = execSync('npx tsc --noEmit --skipLibCheck 2>&1', { 
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      
      const errors = result.split('\n').filter(line => line.includes('error TS'));
      this.log(`TypeScript check completed. ${errors.length} errors remaining.`);
      
      if (errors.length > 0) {
        this.log('Sample remaining errors:', 'warn');
        errors.slice(0, 10).forEach(error => {
          this.log(`  ${error}`, 'warn');
        });
      }
      
      return errors.length;
    } catch (error) {
      this.log(`TypeScript check failed: ${error.message}`, 'error');
      return -1;
    }
  }

  generateReport() {
    const report = {
      summary: {
        filesProcessed: this.filesProcessed,
        filesModified: this.filesModified,
        totalFixes: this.totalFixes,
        errors: this.errors.length
      },
      errors: this.errors,
      patterns: this.patterns.map(p => ({
        name: p.name,
        description: p.description
      }))
    };
    
    return report;
  }

  run() {
    this.log('Starting comprehensive underscore syntax fix...');
    
    const startTime = Date.now();
    
    // Process apps directory first
    this.processDirectory('./apps');
    
    // Then process packages directory
    this.processDirectory('./packages');
    
    // Process root level files
    const rootFiles = fs.readdirSync('./');
    rootFiles.forEach(file => {
      const filePath = path.join('./', file);
      if (fs.statSync(filePath).isFile()) {
        this.processFile(filePath);
      }
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // Generate and display report
    const report = this.generateReport();
    
    this.log('=== FIX SUMMARY ===', 'info');
    this.log(`Files processed: ${report.summary.filesProcessed}`, 'info');
    this.log(`Files modified: ${report.summary.filesModified}`, 'info');
    this.log(`Total fixes applied: ${report.summary.totalFixes}`, 'info');
    this.log(`Errors encountered: ${report.summary.errors}`, 'info');
    this.log(`Duration: ${duration.toFixed(2)} seconds`, 'info');
    
    if (report.summary.errors > 0) {
      this.log('Errors encountered:', 'warn');
      report.errors.forEach(err => {
        this.log(`  ${err.file}: ${err.error}`, 'warn');
      });
    }
    
    // Run TypeScript check
    const remainingErrors = this.runTypeScriptCheck();
    
    // Save detailed report
    fs.writeFileSync(
      'underscore-fix-report.json', 
      JSON.stringify({ ...report, remainingErrors, duration }, null, 2)
    );
    
    this.log('Detailed report saved to: underscore-fix-report.json', 'success');
    
    return report;
  }
}

// Run the fixer if this file is executed directly
if (require.main === module) {
  const fixer = new UnderscoreSyntaxFixer();
  fixer.run();
}

module.exports = UnderscoreSyntaxFixer;
