#!/usr/bin/env node

/**
 * Fix variable name issues introduced by automated underscore prefixing
 * Addresses cases where parameters were renamed but usage wasn't updated
 */

const fs = require('fs')
const path = require('path')

// Count of fixes applied
let fixesApplied = 0
let filesProcessed = 0

/**
 * Fix variable name mismatches and common property issues
 */
function fixVariableNames(content, filePath) {
  let fixed = content
  let localFixes = 0

  // Fix common variable name mismatches
  const varFixes = [
    // Parameters that were incorrectly prefixed but used without prefix
    { wrong: /\b_request\b([^:=]*?:.*?request\b)/g, correct: '_request$1' },
    { wrong: /\b_userId\b([^:=]*?:.*?userId\b)/g, correct: '_userId$1' },
    { wrong: /\b_message\b([^:=]*?:.*?message\b)/g, correct: '_message$1' },
    { wrong: /\b_query\b([^:=]*?:.*?query\b)/g, correct: '_query$1' },
    { wrong: /\b_clinicId\b([^:=]*?:.*?clinicId\b)/g, correct: '_clinicId$1' },
    {
      wrong: /\b_patientId\b([^:=]*?:.*?patientId\b)/g,
      correct: '_patientId$1',
    },
    { wrong: /\b_char\b([^:=]*?:.*?char\b)/g, correct: '_char$1' },

    // Usage that should match parameter names
    { wrong: /(\w+\s*:\s*)request([,\s}])/g, correct: '$1_request$2' },
    { wrong: /(\w+\s*:\s*)userId([,\s}])/g, correct: '$1_userId$2' },
    { wrong: /(\w+\s*:\s*)message([,\s}])/g, correct: '$1_message$2' },
    { wrong: /(\w+\s*:\s*)query([,\s}])/g, correct: '$1_query$2' },
    { wrong: /(\w+\s*:\s*)clinicId([,\s}])/g, correct: '$1_clinicId$2' },
    { wrong: /(\w+\s*:\s*)patientId([,\s}])/g, correct: '$1_patientId$2' },
    { wrong: /(\w+\s*:\s*)char([,\s}])/g, correct: '$1_char$2' },

    // Variable usage that should match parameter names
    { wrong: /\$\{request\}/g, correct: '${_request}' },
    { wrong: /\$\{userId\}/g, correct: '${_userId}' },
    { wrong: /\$\{message\}/g, correct: '${_message}' },
    { wrong: /\$\{query\}/g, correct: '${_query}' },
    { wrong: /\$\{clinicId\}/g, correct: '${_clinicId}' },
    { wrong: /\$\{patientId\}/g, correct: '${_patientId}' },
    { wrong: /\$\{char\}/g, correct: '${_char}' },

    // Function calls and property access
    { wrong: /\.request\./g, correct: '._request.' },
    { wrong: /\.userId\./g, correct: '._userId.' },
    { wrong: /\.message\./g, correct: '._message.' },
    { wrong: /\.query\./g, correct: '._query.' },
    { wrong: /\.clinicId\./g, correct: '._clinicId.' },
    { wrong: /\.patientId\./g, correct: '._patientId.' },
    { wrong: /\.char\./g, correct: '._char.' },

    // Object property access
    { wrong: /\brequest\[/g, correct: '_request[' },
    { wrong: /\buserId\[/g, correct: '_userId[' },
    { wrong: /\bmessage\[/g, correct: '_message[' },
    { wrong: /\bquery\[/g, correct: '_query[' },
    { wrong: /\bclinicId\[/g, correct: '_clinicId[' },
    { wrong: /\bpatientId\[/g, correct: '_patientId[' },
    { wrong: /\bchar\[/g, correct: '_char[' },

    // Stand-alone usage in expressions
    { wrong: /([^_.]\s+)request([^A-Za-z_])/g, correct: '$1_request$2' },
    { wrong: /([^_.]\s+)userId([^A-Za-z_])/g, correct: '$1_userId$2' },
    { wrong: /([^_.]\s+)message([^A-Za-z_])/g, correct: '$1_message$2' },
    { wrong: /([^_.]\s+)query([^A-Za-z_])/g, correct: '$1_query$2' },
    { wrong: /([^_.]\s+)clinicId([^A-Za-z_])/g, correct: '$1_clinicId$2' },
    { wrong: /([^_.]\s+)patientId([^A-Za-z_])/g, correct: '$1_patientId$2' },
    { wrong: /([^_.]\s+)char([^A-Za-z_])/g, correct: '$1_char$2' },
  ]

  // Apply each fix
  for (const fix of varFixes) {
    const beforeCount = (fixed.match(fix.wrong) || []).length
    if (beforeCount > 0) {
      fixed = fixed.replace(fix.wrong, fix.correct)
      localFixes += beforeCount
    }
  }

  // Fix property name mismatches for known type structures
  const propFixes = [
    // AuditLogEntry properties
    { wrong: /userId:/g, correct: '_userId:' },
    { wrong: /(\w+):\s*userId([,\s}])/g, correct: '$1: _userId$2' },

    // Property shorthand fixes
    { wrong: /{\s*userId\s*}/g, correct: '{ _userId }' },
    { wrong: /{\s*userId\s*,/g, correct: '{ _userId,' },
    { wrong: /,\s*userId\s*}/g, correct: ', _userId }' },
    { wrong: /,\s*userId\s*,/g, correct: ', _userId,' },
  ]

  for (const fix of propFixes) {
    const beforeCount = (fixed.match(fix.wrong) || []).length
    if (beforeCount > 0) {
      fixed = fixed.replace(fix.wrong, fix.correct)
      localFixes += beforeCount
    }
  }

  if (localFixes > 0) {
    console.log(`Fixed ${localFixes} variable name issues in ${filePath}`)
    fixesApplied += localFixes
  }

  return fixed
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const fixed = fixVariableNames(content, filePath)

    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed, 'utf8')
    }

    filesProcessed++
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message)
  }
}

/**
 * Recursively process directory
 */
function processDirectory(
  dirPath,
  extensions = ['.ts', '.tsx', '.js', '.jsx'],
) {
  const items = fs.readdirSync(dirPath)

  for (const item of items) {
    const fullPath = path.join(dirPath, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
        processDirectory(fullPath, extensions)
      }
    } else if (stat.isFile()) {
      const ext = path.extname(fullPath)
      if (extensions.includes(ext)) {
        processFile(fullPath)
      }
    }
  }
}

// Main execution
console.log('🔧 Fixing variable name mismatches...')

const packagesDir = path.join(__dirname, '..', 'packages', 'domain')
if (fs.existsSync(packagesDir)) {
  processDirectory(packagesDir)
}

console.log(`\n✅ Completed processing ${filesProcessed} files`)
console.log(`🔧 Applied ${fixesApplied} variable name fixes`)

if (fixesApplied > 0) {
  console.log('\n🎯 Variable name mismatches have been repaired!')
  console.log('📝 Run build verification to check for remaining issues.')
} else {
  console.log('\n✨ No variable name issues found!')
}
