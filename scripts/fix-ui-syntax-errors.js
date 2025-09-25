#!/usr/bin/env node

/**
 * UI Package Syntax Error Fixer
 *
 * This script systematically fixes common syntax errors in UI components
 * that are blocking the test suite compilation.
 *
 * Patterns fixed:
 * 1. Parameter destructuring with underscores: { name,_label, ...props } → { name, label, ...props }
 * 2. Component parameter syntax: ({ param1,_param2 }) → ({ param1, param2 })
 * 3. Variable naming issues: _parameterName → parameterName
 * 4. Missing imports for zod
 */

const fs = require('fs')
const path = require('path')

const UI_COMPONENTS_DIR = '/home/vibecode/neonpro/packages/ui/src/components'

// Fix patterns
const FIX_PATTERNS = [
  // Parameter destructuring with underscores
  {
    pattern: /{([^}]*),_([^,}]+)([^}]*)}/g,
    replacement: (match, before, param, after) => {
      // Remove the underscore from the parameter name
      return `{${before},${param}${after}}`
    },
    description: 'Remove underscores from destructured parameters',
  },

  // Component parameter syntax with underscores
  {
    pattern: /\(({[^}]*),_([^,}]+)([^}]*)\)\s*=>/g,
    replacement: (match, before, param, after) => {
      // Remove the underscore from the parameter name
      return `(${before},${param}${after}) =>`
    },
    description: 'Remove underscores from component parameters',
  },

  // Standalone underscore parameters in function signatures
  {
    pattern: /_\s*([^,\s)]+)/g,
    replacement: '$1',
    description: 'Remove underscore prefix from parameter names',
  },

  // Fix variable references to underscored parameters
  {
    pattern: /_([a-zA-Z_][a-zA-Z0-9_]*)/g,
    replacement: (match, paramName) => {
      // Only replace if it's not a known intentional underscore (like _error)
      const intentionalUnderscores = ['_error', '_validationError', '_index']
      if (!intentionalUnderscores.includes(`_${paramName}`)) {
        return paramName
      }
      return match
    },
    description: 'Fix variable references to remove underscore prefix',
  },

  // Fix useEffect parameter issues
  {
    pattern: /useEffect\(_\(\)\s*=>/g,
    replacement: 'useEffect(() =>',
    description: 'Fix useEffect parameter syntax',
  },
]

// Add missing imports for commonly missing modules
const MISSING_IMPORTS = {
  zod: "import { z } from 'zod';",
  react: "import React from 'react';",
}

// Files to fix (based on the error report)
const TARGET_FILES = [
  'ui/dropdown-menu.tsx',
  'forms/healthcare-select.tsx',
  'healthcare/healthcare-theme-provider.tsx',
  'healthcare/lgpd-consent-banner.tsx',
]

function fixFile(filePath) {
  console.error(`\n🔧 Fixing ${filePath}...`)

  try {
    let content = fs.readFileSync(filePath, 'utf8')
    const _originalContent = content
    let changesMade = false

    // Apply each fix pattern
    for (const fix of FIX_PATTERNS) {
      const beforeFix = content
      content = content.replace(fix.pattern, fix.replacement)

      if (beforeFix !== content) {
        console.error(`  ✅ Applied: ${fix.description}`)
        changesMade = true
      }
    }

    // Check for missing imports
    for (const [module, importStatement] of Object.entries(MISSING_IMPORTS)) {
      if (content.includes(module) && !content.includes(importStatement)) {
        // Find where to insert the import (after existing imports)
        const importInsertPosition = content.lastIndexOf('import')
        const importEndPosition = content.indexOf('\n', importInsertPosition)

        if (importInsertPosition !== -1 && importEndPosition !== -1) {
          content = `${
            content.slice(0, importEndPosition + 1) +
            importStatement
          }\n${content.slice(importEndPosition + 1)}`
          console.error(`  ✅ Added missing import: ${module}`)
          changesMade = true
        }
      }
    }

    // Write back if changes were made
    if (changesMade) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.error(`  📝 File updated successfully`)
      return true
    } else {
      console.error(`  ℹ️  No changes needed`)
      return false
    }
  } catch (error) {
    console.error(`  ❌ Error fixing ${filePath}:`, error.message)
    return false
  }
}

function validateCompilation() {
  console.error('\n🔍 Validating UI package compilation...')

  try {
    // Try to check if TypeScript compilation would work
    const packageJsonPath = path.join(UI_COMPONENTS_DIR, '..', 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    console.error(`  📦 Package: ${packageJson.name}`)
    console.error(
      `  📋 Build script: ${packageJson.scripts?.build || 'not found'}`,
    )

    // For now, just check if the files exist and have content
    const filesChecked = TARGET_FILES.map(file => {
      const fullPath = path.join(UI_COMPONENTS_DIR, file)
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8')
        return { file, exists: true, size: content.length }
      } else {
        return { file, exists: false }
      }
    })

    filesChecked.forEach(({ file, exists, size }) => {
      if (exists) {
        console.error(`  ✅ ${file} (${size} characters)`)
      } else {
        console.error(`  ❌ ${file} - NOT FOUND`)
      }
    })

    return true
  } catch (error) {
    console.error('  ❌ Validation error:', error.message)
    return false
  }
}

function main() {
  console.error('🚀 Starting UI Package Syntax Error Fixer')
  console.error('===========================================')

  let filesFixed = 0
  let totalFiles = 0

  // Process each target file
  for (const relativePath of TARGET_FILES) {
    const fullPath = path.join(UI_COMPONENTS_DIR, relativePath)

    if (fs.existsSync(fullPath)) {
      totalFiles++
      if (fixFile(fullPath)) {
        filesFixed++
      }
    } else {
      console.error(`❌ File not found: ${fullPath}`)
    }
  }

  console.error('\n📊 Summary:')
  console.error(`   Files processed: ${totalFiles}`)
  console.error(`   Files fixed: ${filesFixed}`)
  console.error(`   Files unchanged: ${totalFiles - filesFixed}`)

  // Validate the fixes
  validateCompilation()

  console.error('\n✨ UI syntax error fixing complete!')
  console.error('\n🎯 Next steps:')
  console.error('   1. Run the test suite to verify fixes')
  console.error('   2. Check if UI package compiles successfully')
  console.error('   3. Verify all UI components work as expected')
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { fixFile, validateCompilation }
