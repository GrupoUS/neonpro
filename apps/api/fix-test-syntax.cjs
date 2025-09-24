#!/usr/bin/env node

/**
 * GREEN-004: Test File Syntax Error Fixer
 *
 * Systematically fixes the most common syntax errors found in test files:
 * 1. Missing closing parentheses
 * 2. Missing closing curly braces
 * 3. Unterminated strings
 * 4. Missing semicolons
 * 5. Import issues
 */

const fs = require('fs')
const path = require('path')

class TestFileSyntaxFixer {
  constructor() {
    this.fixedFiles = 0
    this.totalFixes = 0
    this.errors = []
  }

  // Find all test files recursively
  findTestFiles(dir) {
    const testFiles = []
    const scanDirectory = currentDir => {
      if (!fs.existsSync(currentDir)) return

      const entries = fs.readdirSync(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)

        if (
          entry.isDirectory() &&
          !entry.name.startsWith('.') &&
          entry.name !== 'node_modules' &&
          entry.name !== 'dist'
        ) {
          scanDirectory(fullPath)
        } else if (entry.isFile() && this.isTestFile(entry.name)) {
          testFiles.push(fullPath)
        }
      }
    }

    scanDirectory(dir)
    return testFiles
  }

  isTestFile(filename) {
    const testExtensions = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx']
    const ext = path.extname(filename)
    return testExtensions.includes(ext)
  }

  // Fix syntax errors in a file
  fixFileSyntax(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const originalContent = content
      let fixedContent = content
      let fixesApplied = 0

      // Fix 1: Unterminated strings (most common)
      fixedContent = this.fixUnterminatedStrings(fixedContent)
      if (fixedContent !== content) fixesApplied++

      // Fix 2: Missing closing parentheses
      fixedContent = this.fixMissingParentheses(fixedContent)
      if (fixedContent !== content) fixesApplied++

      // Fix 3: Missing closing curly braces
      fixedContent = this.fixMissingCurlyBraces(fixedContent)
      if (fixedContent !== content) fixesApplied++

      // Fix 4: Missing semicolons in strategic places
      fixedContent = this.fixMissingSemicolons(fixedContent)
      if (fixedContent !== content) fixesApplied++

      // Fix 5: Import path issues
      fixedContent = this.fixImportPaths(fixedContent)
      if (fixedContent !== content) fixesApplied++

      // Write back if fixes were applied
      if (fixedContent !== originalContent) {
        fs.writeFileSync(filePath, fixedContent, 'utf-8')
        this.fixedFiles++
        this.totalFixes += fixesApplied
        console.log(`✅ Fixed ${fixesApplied} issues in: ${filePath}`)
        return true
      }

      return false
    } catch (error) {
      this.errors.push({
        file: filePath,
        error: error.message,
      })
      console.error(`❌ Error fixing ${filePath}: ${error.message}`)
      return false
    }
  }

  fixUnterminatedStrings(content) {
    let fixed = content

    // Fix unterminated single quotes
    fixed = fixed.replace(/'([^']*?)$/gm, "'$1'")

    // Fix unterminated double quotes
    fixed = fixed.replace(/"([^"]*?)$/gm, '"$1"')

    // Fix unterminated template literals
    const templateLines = fixed.split('\n')
    for (let i = 0; i < templateLines.length; i++) {
      const line = templateLines[i]
      const backtickCount = (line.match(/`/g) || []).length
      if (backtickCount % 2 !== 0 && line.includes('`')) {
        templateLines[i] = line + '`'
      }
    }
    fixed = templateLines.join('\n')

    return fixed
  }

  fixMissingParentheses(content) {
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const openParens = (line.match(/\(/g) || []).length
      const closeParens = (line.match(/\)/g) || []).length

      if (openParens > closeParens) {
        const missing = openParens - closeParens
        lines[i] = line + ')'.repeat(missing)
      }
    }

    return lines.join('\n')
  }

  fixMissingCurlyBraces(content) {
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const openBraces = (line.match(/\{/g) || []).length
      const closeBraces = (line.match(/\}/g) || []).length

      if (openBraces > closeBraces) {
        const missing = openBraces - closeBraces
        lines[i] = line + '}'.repeat(missing)
      }
    }

    return lines.join('\n')
  }

  fixMissingSemicolons(content) {
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Add semicolon to lines that need them but don't have them
      if (
        line &&
        !line.endsWith(';') &&
        !line.endsWith('{') &&
        !line.endsWith('}') &&
        !line.includes('return ') &&
        !line.includes('if ') &&
        !line.includes('for ') &&
        !line.includes('while ') &&
        !line.includes('switch ') &&
        !line.includes('function ') &&
        !line.includes('class ') &&
        !line.includes('import ') &&
        !line.includes('export ') &&
        !line.includes('const ') &&
        !line.includes('let ') &&
        !line.includes('var ')
      ) {
        // Check if it's an expression that needs a semicolon
        if (
          line.includes('expect(') ||
          line.includes('mock(') ||
          line.includes('vi.fn') ||
          line.includes('.toBe') ||
          line.includes('.toEqual') ||
          line.includes('.toHaveBeenCalled')
        ) {
          lines[i] = line + ';'
        }
      }
    }

    return lines.join('\n')
  }

  fixImportPaths(content) {
    let fixed = content

    // Fix imports that should use aliases but don't
    fixed = fixed.replace(
      /import.*from\s+['"]\.\.\/\.\.\/src\/services\/([^'"]+)['"]/g,
      (match, service) => `import ... from '@/services/${service}'`,
    )

    fixed = fixed.replace(
      /import.*from\s+['"]\.\.\/\.\.\/src\/lib\/([^'"]+)['"]/g,
      (match, lib) => `import ... from '@/lib/${lib}'`,
    )

    fixed = fixed.replace(
      /import.*from\s+['"]\.\.\/\.\.\/src\/utils\/([^'"]+)['"]/g,
      (match, util) => `import ... from '@/utils/${util}'`,
    )

    return fixed
  }

  // Run the fixing process
  async fixAllFiles() {
    console.log('🚀 Starting test file syntax fixing...')

    const testFiles = this.findTestFiles('/home/vibecode/neonpro/apps')
    console.log(`Found ${testFiles.length} test files to process\n`)

    for (const filePath of testFiles) {
      this.fixFileSyntax(filePath)
    }

    console.log('\n=== SYNTAX FIXING SUMMARY ===')
    console.log(`✅ Files fixed: ${this.fixedFiles}`)
    console.log(`✅ Total fixes applied: ${this.totalFixes}`)
    console.log(`❌ Errors encountered: ${this.errors.length}`)

    if (this.errors.length > 0) {
      console.log('\nErrors:')
      this.errors.forEach(err => {
        console.log(`  ${err.file}: ${err.error}`)
      })
    }
  }
}

// Run the fixer
const fixer = new TestFileSyntaxFixer()
fixer.fixAllFiles().catch(console.error)
