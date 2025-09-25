/**
 * Simple Node.js script to run the test file syntax validation
 * This manually executes the validation logic without needing Vitest
 */

const fs = require('fs')
const path = require('path')

class TestFileSyntaxValidator {
  constructor(basePath = '/home/vibecode/neonpro/apps') {
    this.basePath = basePath
    this.testFiles = []
    this.collectTestFiles()
  }

  collectTestFiles() {
    console.error(`Scanning for test files in: ${this.basePath}`)

    const scanDirectory = (dir, depth = 0) => {
      if (!fs.existsSync(dir)) {
        console.error(`Directory does not exist: ${dir}`)
        return
      }

      const entries = fs.readdirSync(dir, { withFileTypes: true })
      console.error(`Scanning ${dir} (depth ${depth}), found ${entries.length} entries`)

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (
          entry.isDirectory() &&
          !entry.name.startsWith('.') &&
          entry.name !== 'node_modules' &&
          entry.name !== 'dist'
        ) {
          scanDirectory(fullPath, depth + 1)
        } else if (entry.isFile() && this.isTestFile(entry.name)) {
          this.testFiles.push(fullPath)
          console.error(`Found test file: ${fullPath}`)
        }
      }
    }

    scanDirectory(this.basePath)
    console.error(`Total test files found: ${this.testFiles.length}`)
  }

  isTestFile(filename) {
    // Check if filename contains .test. or .spec. (which covers cases like appointments.conflict.test.ts)
    const hasTestPattern = filename.includes('.test.') || filename.includes('.spec.')

    // Also check for standard extensions like .test.ts, .test.tsx, etc.
    const testExtensions = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx']
    const ext = path.extname(filename)
    const hasTestExtension = testExtensions.includes(ext)

    const isTest = hasTestPattern || hasTestExtension

    if (hasTestPattern || hasTestExtension) {
      console.error(
        `Found test file: ${filename}, pattern: ${hasTestPattern}, extension: ${ext}, isTest: ${isTest}`,
      )
    }

    return isTest
  }

  validateSyntax(content, filePath) {
    const result = {
      filePath,
      hasSyntaxErrors: false,
      errors: [],
      warnings: [],
      importErrors: [],
      typeErrors: [],
      structuralErrors: [],
    }

    // Split content into lines for line-by-line analysis
    const lines = content.split('\n')

    // Check each line for syntax issues
    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // Check for missing closing parentheses in function calls
      const openParens = (line.match(/\(/g) || []).length
      const closeParens = (line.match(/\)/g) || []).length
      if (openParens > closeParens) {
        result.errors.push({
          filePath,
          line: lineNumber,
          column: line.length,
          message: `Missing ${openParens - closeParens} closing parenthesis(s)`,
          code: line,
          severity: 'error',
        })
      }

      // Check for missing closing curly braces
      const openBraces = (line.match(/\{/g) || []).length
      const closeBraces = (line.match(/\}/g) || []).length
      if (openBraces > closeBraces) {
        result.errors.push({
          filePath,
          line: lineNumber,
          column: line.length,
          message: `Missing ${openBraces - closeBraces} closing curly brace(s)`,
          code: line,
          severity: 'error',
        })
      }

      // Check for malformed import statements
      if (line.includes('import') && line.includes('from')) {
        const importMatch = line.match(/import\s+.*from\s+['"]([^'"]*)['"]/)
        if (importMatch) {
          const importPath = importMatch[1]

          // Check for obvious import path issues
          if (importPath.startsWith('../../../web/src') && filePath.includes('/apps/api/')) {
            result.importErrors.push(
              `Line ${lineNumber}: Cross-app import from web to API - ${importPath}`,
            )
          }

          if (importPath.includes('/src/services') && !importPath.startsWith('@/')) {
            result.importErrors.push(
              `Line ${lineNumber}: Non-alias import for services - ${importPath}`,
            )
          }
        }
      }

      // Check for unterminated template literals
      const templateLiterals = line.match(/`/g) || []
      if (templateLiterals.length % 2 !== 0) {
        result.errors.push({
          filePath,
          line: lineNumber,
          column: line.length,
          message: 'Unterminated template literal',
          code: line,
          severity: 'error',
        })
      }

      // Check for malformed SQL or template strings
      if (line.includes('SELECT') || line.includes('INSERT') || line.includes('UPDATE')) {
        if (
          (line.match(/'/g) || []).length % 2 !== 0 || (line.match(/"/g) || []).length % 2 !== 0
        ) {
          result.errors.push({
            filePath,
            line: lineNumber,
            column: line.length,
            message: 'Malformed SQL query string',
            code: line,
            severity: 'error',
          })
        }
      }
    })

    result.hasSyntaxErrors = result.errors.length > 0
    return result
  }

  validateAllFiles() {
    const results = []

    for (const filePath of this.testFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8')
        const validation = this.validateSyntax(content, filePath)
        results.push(validation)
      } catch (error) {
        results.push({
          filePath,
          hasSyntaxErrors: true,
          errors: [{
            filePath,
            line: 0,
            column: 0,
            message: `Failed to read file: ${error.message}`,
            code: '',
            severity: 'error',
          }],
          warnings: [],
          importErrors: [],
          typeErrors: [],
          structuralErrors: [],
        })
      }
    }

    return results
  }

  getSummary() {
    const results = this.validateAllFiles()

    const summary = {
      totalFiles: results.length,
      filesWithErrors: results.filter(r => r.hasSyntaxErrors).length,
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
      errorTypes: {},
    }

    // Count error types
    results.forEach(result => {
      result.errors.forEach(error => {
        const errorType = error.message.split(':')[0]
        summary.errorTypes[errorType] = (summary.errorTypes[errorType] || 0) + 1
      })
    })

    return summary
  }

  runValidation() {
    console.error('=== Test File Syntax Validation Report ===\n')

    const summary = this.getSummary()
    const results = this.validateAllFiles()

    console.error(`📊 Summary:`)
    console.error(`   Total test files found: ${summary.totalFiles}`)
    console.error(`   Files with syntax errors: ${summary.filesWithErrors}`)
    console.error(`   Total syntax errors: ${summary.totalErrors}`)
    console.error(`   Total warnings: ${summary.totalWarnings}`)
    console.error(`   Error types:`, Object.keys(summary.errorTypes))

    if (summary.totalErrors === 0) {
      console.error('\n✅ No syntax errors found!')
      return
    }

    console.error('\n❌ Syntax Errors Found:')
    console.error(`   Expected 220+ errors, found ${summary.totalErrors}`)

    // Show files with most errors
    const filesWithErrors = results
      .filter(r => r.hasSyntaxErrors)
      .sort((a, b) => b.errors.length - a.errors.length)
      .slice(0, 10)

    console.error('\n📂 Top 10 files with most errors:')
    filesWithErrors.forEach((file, index) => {
      console.error(`   ${index + 1}. ${file.filePath} (${file.errors.length} errors)`)
    })

    // Show specific error examples
    console.error('\n🔍 Error Examples:')
    const firstFewErrors = results
      .filter(r => r.errors.length > 0)
      .slice(0, 5)
      .map(r => ({
        file: r.filePath,
        errors: r.errors.slice(0, 3),
      }))

    firstFewErrors.forEach(({ file, errors }) => {
      console.error(`\n   File: ${path.relative(this.basePath, file)}`)
      errors.forEach(error => {
        console.error(`      Line ${error.line}: ${error.message}`)
        console.error(`         Code: ${error.code.trim()}`)
      })
    })

    // Show import issues
    const importIssues = results.reduce((sum, r) => sum + r.importErrors.length, 0)
    if (importIssues > 0) {
      console.error(`\n📦 Import Issues Found: ${importIssues}`)
      results.filter(r => r.importErrors.length > 0).slice(0, 3).forEach(file => {
        console.error(`   ${path.relative(this.basePath, file.filePath)}:`)
        file.importErrors.slice(0, 2).forEach(issue => {
          console.error(`      ${issue}`)
        })
      })
    }

    console.error(`\n🎯 RED Phase Test Result: FAIL`)
    console.error(`   This test should fail because syntax errors were found.`)
    console.error(`   Expected: 220+ errors`)
    console.error(`   Found: ${summary.totalErrors} errors`)

    if (summary.totalErrors >= 220) {
      console.error(`   ✅ Met or exceeded expected error count`)
    } else {
      console.error(`   ⚠️  Found fewer errors than expected`)
    }

    return summary
  }
}

// Run the validation
console.error('🚀 Starting Test File Syntax Validation...\n')
const validator = new TestFileSyntaxValidator()
const summary = validator.runValidation()

// Exit with appropriate code
process.exit(summary.totalErrors >= 220 ? 0 : 1)
