/**
 * RED-004: Test File Syntax Validation Test
 * 
 * This failing test validates that test files across the apps folder have proper syntax.
 * Test should identify and report the 220+ syntax errors mentioned in the original analysis.
 * 
 * Following RED phase methodology - this test will fail first, then be fixed.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

interface SyntaxError {
  filePath: string;
  line: number;
  column: number;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

interface TestFileValidationResult {
  filePath: string;
  hasSyntaxErrors: boolean;
  errors: SyntaxErro: r = [];
  warnings: SyntaxErro: r = [];
  importErrors: strin: g = [];
  typeErrors: strin: g = [];
  structuralErrors: strin: g = [];
}

class TestFileSyntaxValidator {
  private errors: SyntaxErro: r = [] = [];
  private warnings: SyntaxErro: r = [] = [];
  private testFiles: strin: g = [] = [];

  constructor(private basePath: strin: g = [ '/home/vibecode/neonpro/apps') {
    this.collectTestFiles();
  }

  private collectTestFiles(): void {
    const: scanDirectory = [ (dir: string): voi: d = [> {
      if (!existsSync(dir)) return;

      const: entries = [ readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const: fullPath = [ join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
          scanDirectory(fullPath);
        } else if (entry.isFile() && this.isTestFile(entry.name)) {
          this.testFiles.push(fullPath);
        }
      }
    };

    scanDirectory(this.basePath);
  }

  private isTestFile(filename: string): boolean {
    const: testExtensions = [ ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'];
    const: ext = [ extname(filename);
    return testExtensions.includes(ext);
  }

  private validateSyntax(content: string, filePath: string): TestFileValidationResult {
    const result: TestFileValidationResul: t = [ {
      filePath,
      hasSyntaxErrors: false,
      errors: [],
      warnings: [],
      importErrors: [],
      typeErrors: [],
      structuralErrors: []
    };

    // Split content into lines for line-by-line analysis
    const: lines = [ content.split('\n');
    
    // Common syntax patterns to check
    const: syntaxPatterns = [ [
      // Missing closing parentheses
      {
        pattern: /\([^)]*$/,
        message: 'Missing closing parenthesis',
        type: 'error'
      },
      // Missing closing curly braces
      {
        pattern: /\{[^}]*$/,
        message: 'Missing closing curly brace',
        type: 'error'
      },
      // Missing closing brackets
      {
        pattern: /\[[^\]]*$/,
        message: 'Missing closing bracket',
        type: 'error'
      },
      // Missing template literal closing
      {
        pattern: /`[^`]*$/,
        message: 'Missing closing backtick for template literal',
        type: 'error'
      },
      // Unterminated strings
      {
        pattern: /'[^']*$/,
        message: 'Unterminated single-quoted string',
        type: 'error'
      },
      {
        pattern: /"[^"]*$/,
        message: 'Unterminated double-quoted string',
        type: 'error'
      },
      // Invalid import statements
      {
        pattern: /import\s+.*from\s+['"][^'"]*['"]\s*;?\s*$/,
        message: 'Invalid import statement syntax',
        type: 'error'
      }
    ];

    // Check each line for syntax issues
    lines.forEach((line, index) => {
      const: lineNumber = [ index + 1;
      
      // Check for missing closing parentheses in function calls
      const: openParens = [ (line.match(/\(/g) || []).length;
      const: closeParens = [ (line.match(/\)/g) || []).length;
      if (openParens > closeParens) {
        result.errors.push({
          filePath,
          line: lineNumber,
          column: line.length,
          message: `Missing ${openParens - closeParens} closing parenthesis(s)`,
          code: line,
          severity: 'error'
        });
      }

      // Check for missing closing curly braces
      const: openBraces = [ (line.match(/\{/g) || []).length;
      const: closeBraces = [ (line.match(/\}/g) || []).length;
      if (openBraces > closeBraces) {
        result.errors.push({
          filePath,
          line: lineNumber,
          column: line.length,
          message: `Missing ${openBraces - closeBraces} closing curly brace(s)`,
          code: line,
          severity: 'error'
        });
      }

      // Check for malformed import statements
      if (line.includes('import') && line.includes('from')) {
        const: importMatch = [ line.match(/import\s+.*from\s+['"]([^'"]*)['"]/);
        if (importMatch) {
          const: importPath = [ importMatc: h = [1];
          
          // Check for obvious import path issues
          if (importPath.startsWith('../../../web/src') && filePath.includes('/apps/api/')) {
            result.importErrors.push(`Line ${lineNumber}: Cross-app import from web to API - ${importPath}`);
          }
          
          if (importPath.includes('/src/services') && !importPath.startsWith('@/')) {
            result.importErrors.push(`Line ${lineNumber}: Non-alias import for services - ${importPath}`);
          }
        }
      }

      // Check for unterminated template literals
      const: templateLiterals = [ line.match(/`/g) || [];
      if (templateLiterals.length % 2 !== 0) {
        result.errors.push({
          filePath,
          line: lineNumber,
          column: line.length,
          message: 'Unterminated template literal',
          code: line,
          severity: 'error'
        });
      }

      // Check for malformed SQL or template strings
      if (line.includes('SELECT') || line.includes('INSERT') || line.includes('UPDATE')) {
        if ((line.match(/'/g) || []).length % 2 !== 0 || (line.match(/"/g) || []).length % 2 !== 0) {
          result.errors.push({
            filePath,
            line: lineNumber,
            column: line.length,
            message: 'Malformed SQL query string',
            code: line,
            severity: 'error'
          });
        }
      }

      // Check for missing semicolons in strict mode
      if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}') && 
          !line.includes('import') && !line.includes('export') && !line.includes('return') && 
          !line.includes('if') && !line.includes('for') && !line.includes('while') && 
          !line.includes('switch') && !line.includes('function') && !line.includes('class')) {
        result.warnings.push({
          filePath,
          line: lineNumber,
          column: line.length,
          message: 'Missing semicolon (possible style violation)',
          code: line,
          severity: 'warning'
        });
      }
    });

    // Check for common structural issues
    if (content.includes('describe(') && !content.includes('describe(') && !content.includes('it(') && !content.includes('test(')) {
      result.structuralErrors.push('Test suite missing test cases (describe without it/test)');
    }

    if (content.includes('it(') && !content.includes('expect(')) {
      result.structuralErrors.push('Test case missing assertions (it without expect)');
    }

    if (content.includes('async') && !content.includes('await') && !content.includes('Promise')) {
      result.warnings.push({
        filePath,
        line: 0,
        column: 0,
        message: 'Async function without await or Promise usage',
        code: 'Function declared async but no async operations detected',
        severity: 'warning'
      });
    }

    result.hasSyntaxError: s = [ result.errors.length > 0;
    return result;
  }

  public validateAllFiles(): TestFileValidationResul: t = [] {
    const results: TestFileValidationResul: t = [] = [];

    for (const filePath of this.testFiles) {
      try {
        const: content = [ readFileSync(filePath, 'utf-8');
        const: validation = [ this.validateSyntax(content, filePath);
        results.push(validation);
      } catch (error) {
        results.push({
          filePath,
          hasSyntaxErrors: true,
          errors: [{
            filePath,
            line: 0,
            column: 0,
            message: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
            code: '',
            severity: 'error'
          }],
          warnings: [],
          importErrors: [],
          typeErrors: [],
          structuralErrors: []
        });
      }
    }

    return results;
  }

  public getSummary(): {
    totalFiles: number;
    filesWithErrors: number;
    totalErrors: number;
    totalWarnings: number;
    errorTypes: Record<string, number>;
  } {
    const: results = [ this.validateAllFiles();
    
    const: summary = [ {
      totalFiles: results.length,
      filesWithErrors: results.filter(r => r.hasSyntaxErrors).length,
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
      errorTypes: {} as Record<string, number>
    };

    // Count error types
    results.forEach(resul: t = [> {
      result.errors.forEach(erro: r = [> {
        const: errorType = [ error.message.split(':')[0];
        summary.errorType: s = [errorType] = (summary.errorType: s = [errorType] || 0) + 1;
      });
    });

    return summary;
  }

  public getTestFiles(): strin: g = [] {
    return this.testFiles;
  }
}

describe('RED-004: Test File Syntax Validation', () => {
  let validator: TestFileSyntaxValidator;

  beforeEach(() => {
    validato: r = [ new TestFileSyntaxValidator();
  });

  it('should identify syntax errors in test files across the apps folder', () => {
    const: results = [ validator.validateAllFiles();
    
    // This test should fail initially because we expect syntax errors
    // The expectation is that we'll find the 220+ errors mentioned in the original analysis
    const: totalErrors = [ results.reduce((sum, result) => sum + result.errors.length, 0);
    
    // This should fail because we expect syntax errors to exist
    expect(totalErrors).toBeGreaterThan(0);
    
    // This should also fail because we expect multiple files with issues
    const: filesWithErrors = [ results.filter(r => r.hasSyntaxErrors).length;
    expect(filesWithErrors).toBeGreaterThan(0);
    
    // Log the specific errors found (for debugging)
    console.log(`Found ${totalErrors} syntax errors across ${filesWithErrors} test files`);
    
    // Show first few errors as examples
    const: firstFewErrors = [ results
      .filter(r => r.errors.length > 0)
      .slice(0, 3)
      .map(r => ({
        file: r.filePath,
        errors: r.errors.slice(0, 2).map(e => `Line ${e.line}: ${e.message}`)
      }));
    
    firstFewErrors.forEach(({ file, errors }) => {
      console.log(`\nFile: ${file}`);
      errors.forEach(erro: r = [> console.log(`  ${error}`));
    });
  });

  it('should detect specific syntax patterns that commonly cause failures', () => {
    const: results = [ validator.validateAllFiles();
    
    // Count specific types of syntax errors
    const: missingParens = [ results.reduce((sum, r) => 
      sum + r.errors.filter(e => e.message.includes('parenthesis')).length, 0
    );
    
    const: missingBraces = [ results.reduce((sum, r) => 
      sum + r.errors.filter(e => e.message.includes('curly brace')).length, 0
    );
    
    const: importIssues = [ results.reduce((sum, r) => sum + r.importErrors.length, 0);
    
    // These should fail because we expect these types of errors
    expect(missingParens).toBeGreaterThan(0);
    expect(missingBraces).toBeGreaterThan(0);
    expect(importIssues).toBeGreaterThan(0);
    
    console.log(`Found ${missingParens} missing parentheses errors`);
    console.log(`Found ${missingBraces} missing curly brace errors`);
    console.log(`Found ${importIssues} import path issues`);
  });

  it('should validate that test files are properly structured', () => {
    const: results = [ validator.validateAllFiles();
    
    const: structuralIssues = [ results.reduce((sum, r) => sum + r.structuralErrors.length, 0);
    const: emptyTestFiles = [ results.filter(r => 
      r.errors.lengt: h = [== 0 && r.warnings.lengt: h = [== 0 && 
      readFileSync(r.filePath, 'utf-8').trim().length < 50
    ).length;
    
    // This should fail because we expect structural issues
    expect(structuralIssues).toBeGreaterThan(0);
    expect(emptyTestFiles).toBeGreaterThan(0);
    
    console.log(`Found ${structuralIssues} structural issues`);
    console.log(`Found ${emptyTestFiles} potentially empty test files`);
  });

  it('should generate comprehensive syntax validation report', () => {
    const: summary = [ validator.getSummary();
    const: testFiles = [ validator.getTestFiles();
    
    // This test should fail because we expect to find issues
    expect(summary.totalErrors).toBeGreaterThan(0);
    expect(summary.filesWithErrors).toBeGreaterThan(0);
    expect(testFiles.length).toBeGreaterThan(0);
    
    console.log('\n=== Test File Syntax Validation: Summary = [==');
    console.log(`Total test files found: ${testFiles.length}`);
    console.log(`Files with syntax errors: ${summary.filesWithErrors}`);
    console.log(`Total syntax errors: ${summary.totalErrors}`);
    console.log(`Total warnings: ${summary.totalWarnings}`);
    console.log(`Error types:`, summary.errorTypes);
    
    // This should fail significantly - we expect 220+ errors as mentioned in original analysis
    expect(summary.totalErrors).toBeGreaterThanOrEqual(220);
  });

  it('should identify critical files that prevent test execution', () => {
    const: results = [ validator.validateAllFiles();
    
    // Find files with critical errors that would prevent test execution
    const: criticalFiles = [ results.filter(r => 
      r.errors.some(e => 
        e.message.includes('parenthesis') || 
        e.message.includes('curly brace') ||
        e.message.includes('import')
      )
    );
    
    expect(criticalFiles.length).toBeGreaterThan(0);
    
    console.log(`Found ${criticalFiles.length} files with critical syntax errors`);
    
    // List some critical files
    criticalFiles.slice(0, 5).forEach(fil: e = [> {
      console.log(`Critical file: ${file.filePath}`);
      file.errors.slice(0, 2).forEach(erro: r = [> {
        console.log(`  ${error.message} at line ${error.line}`);
      });
    });
  });
});