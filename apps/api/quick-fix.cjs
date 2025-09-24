#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Find common TypeScript errors and fix them
class QuickSyntaxFixer {
  constructor() {
    this.fixes = 0
    this.files = 0
  }

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
        } else if (entry.isFile() && entry.name.endsWith('.test.ts')) {
          testFiles.push(fullPath)
        }
      }
    }

    scanDirectory(dir)
    return testFiles
  }

  fixCommonIssues(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      let fixed = content
      let madeChanges = false

      // Fix 1: Missing closing quotes at end of lines
      fixed = fixed.replace(/'([^']*)$/gm, "'$1'")
      fixed = fixed.replace(/"([^"]*)$/gm, '"$1"')

      // Fix 2: Missing array properties that are accessed
      if (fixed.includes('.consents?.') && !fixed.includes('consents: [')) {
        fixed = fixed.replace(/(consentRecord[^}]*})/g, match => {
          if (match.includes('consents?.') && !match.includes('consents:')) {
            return match.replace('}', '  consents: [],\n}')
          }
          return match
        })
        if (fixed !== content) madeChanges = true
      }

      // Fix 3: Missing properties that are accessed
      const commonMissingProps = [
        { pattern: /\.consents\?\./, prop: 'consents', defaultValue: '[]' },
        { pattern: /\.consentRecords\?\.?/, prop: 'consentRecords', defaultValue: '[]' },
        { pattern: /\.auditTrail\?\.?/, prop: 'auditTrail', defaultValue: 'false' },
      ]

      for (const { pattern, prop, defaultValue } of commonMissingProps) {
        if (fixed.includes(pattern)) {
          // Find object definitions before the property access
          const lines = fixed.split('\n')
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (line.includes(pattern)) {
              // Look backwards to find the object definition
              for (let j = i - 1; j >= Math.max(0, i - 20); j--) {
                const prevLine = lines[j]
                if (prevLine.includes('const ') && prevLine.includes('= {')) {
                  // Found object definition, check if property exists
                  const objEnd = this.findObjectEnd(lines, j)
                  if (objEnd !== -1 && !this.hasProperty(lines, j, objEnd, prop)) {
                    // Add missing property
                    lines[objEnd - 1] = lines[objEnd - 1] + `,\n  ${prop}: ${defaultValue}`
                    madeChanges = true
                  }
                  break
                }
              }
            }
          }
          fixed = lines.join('\n')
        }
      }

      if (madeChanges) {
        fs.writeFileSync(filePath, fixed, 'utf-8')
        this.fixes++
        console.log(`✅ Fixed ${filePath}`)
        return true
      }
      return false
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}: ${error.message}`)
      return false
    }
  }

  findObjectEnd(lines, startLine) {
    let braceCount = 0
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i]
      braceCount += (line.match(/\{/g) || []).length
      braceCount -= (line.match(/\}/g) || []).length
      if (braceCount === 0 && line.includes('}')) {
        return i + 1
      }
    }
    return -1
  }

  hasProperty(lines, start, end, prop) {
    for (let i = start; i < end; i++) {
      const line = lines[i]
      if (line.includes(`${prop}:`) || line.includes(`${prop} :`)) {
        return true
      }
    }
    return false
  }

  async run() {
    console.log('🚀 Quick syntax fixer running...')
    const testFiles = this.findTestFiles('/home/vibecode/neonpro/apps')

    console.log(`Found ${testFiles.length} test files`)

    for (const file of testFiles) {
      if (this.fixCommonIssues(file)) {
        this.files++
      }
    }

    console.log(`\n=== QUICK FIX SUMMARY ===`)
    console.log(`✅ Files fixed: ${this.files}`)
    console.log(`✅ Total fixes: ${this.fixes}`)
  }
}

const fixer = new QuickSyntaxFixer()
fixer.run().catch(console.error)
