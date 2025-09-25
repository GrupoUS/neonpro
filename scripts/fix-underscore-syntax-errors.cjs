#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function fixUnderscoreSyntaxErrors() {
  console.log('🔧 Fixing underscore syntax errors...')

  const packagesDir = path.join(__dirname, '..', 'packages')
  const appsDir = path.join(__dirname, '..', 'apps')

  let totalFilesFixed = 0
  let totalErrorsFixed = 0

  function processDirectory(dir) {
    if (!fs.existsSync(dir)) return

    const files = fs.readdirSync(dir, { withFileTypes: true })

    for (const file of files) {
      const fullPath = path.join(dir, file.name)

      if (file.isDirectory()) {
        if (
          !['node_modules', 'dist', '.git', 'build', 'coverage'].includes(
            file.name,
          )
        ) {
          processDirectory(fullPath)
        }
      } else if (file.isFile() && /\.(ts|tsx|js|jsx)$/.test(file.name)) {
        const fixed = fixFile(fullPath)
        if (fixed.errorsFixed > 0) {
          totalFilesFixed++
          totalErrorsFixed += fixed.errorsFixed
        }
      }
    }
  }

  function fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      let newContent = content
      let errorsFixed = 0

      // Track changes for logging
      const changes = []

      // 1. Fix function parameter destructuring: (_{  -> ({
      const funcParamRegex = /\(\s*_\s*\{/g
      const funcParamMatches = [...content.matchAll(funcParamRegex)]
      if (funcParamMatches.length > 0) {
        newContent = newContent.replace(funcParamRegex, '({')
        changes.push(`Function parameters: ${funcParamMatches.length} fixes`)
        errorsFixed += funcParamMatches.length
      }

      // 2. Fix JSX expressions: (_<  -> (<
      const jsxRegex = /\(\s*_\s*</g
      const jsxMatches = [...newContent.matchAll(jsxRegex)]
      if (jsxMatches.length > 0) {
        newContent = newContent.replace(jsxRegex, '(<')
        changes.push(`JSX expressions: ${jsxMatches.length} fixes`)
        errorsFixed += jsxMatches.length
      }

      // 3. Fix array element syntax: _[" -> ["
      const arrayRegex = /_\["/g
      const arrayMatches = [...newContent.matchAll(arrayRegex)]
      if (arrayMatches.length > 0) {
        newContent = newContent.replace(arrayRegex, '["')
        changes.push(`Array elements: ${arrayMatches.length} fixes`)
        errorsFixed += arrayMatches.length
      }

      // 4. Fix type definitions: Record<string,_() => void> -> Record<string, () => void>
      const typeRegex = /Record<string,\s*_\(\)/g
      const typeMatches = [...newContent.matchAll(typeRegex)]
      if (typeMatches.length > 0) {
        newContent = newContent.replace(typeRegex, 'Record<string, ()')
        changes.push(`Type definitions: ${typeMatches.length} fixes`)
        errorsFixed += typeMatches.length
      }

      // 5. Fix enum array elements: ,"_something" -> ,"something" (but preserve the quotes)
      const enumRegex = /,\s*_"([^"]+)"/g
      const enumMatches = [...newContent.matchAll(enumRegex)]
      if (enumMatches.length > 0) {
        newContent = newContent.replace(enumRegex, ',"$1"')
        changes.push(`Enum elements: ${enumMatches.length} fixes`)
        errorsFixed += enumMatches.length
      }

      // 6. Fix standalone underscore variables in destructuring: ,_children -> ,children
      const destructuringRegex = /,\s*_([a-zA-Z][a-zA-Z0-9]*)\s*,/g
      const destructuringMatches = [...newContent.matchAll(destructuringRegex)]
      if (destructuringMatches.length > 0) {
        newContent = newContent.replace(destructuringRegex, ',$1,')
        changes.push(
          `Destructuring vars: ${destructuringMatches.length} fixes`,
        )
        errorsFixed += destructuringMatches.length
      }

      // 7. Fix arrow function expressions: => (_ -> => (
      const arrowRegex = /=>\s*_\s*\(/g
      const arrowMatches = [...newContent.matchAll(arrowRegex)]
      if (arrowMatches.length > 0) {
        newContent = newContent.replace(arrowRegex, '=> (')
        changes.push(`Arrow functions: ${arrowMatches.length} fixes`)
        errorsFixed += arrowMatches.length
      }

      // 8. Fix export/import issues with underscored names
      // Only fix if the name clearly shouldn't have underscore (not private/protected convention)
      const exportRegex = /export\s+\{\s*(_[A-Z][a-zA-Z]*)\s*\}/g
      const exportMatches = [...newContent.matchAll(exportRegex)]
      for (const match of exportMatches) {
        const originalName = match[1]
        const cleanName = originalName.substring(1) // Remove leading underscore
        newContent = newContent.replace(match[0], `export { ${cleanName} }`)
        changes.push(`Export names: 1 fix (${originalName} -> ${cleanName})`)
        errorsFixed++
      }

      // Write file only if changes were made
      if (errorsFixed > 0) {
        fs.writeFileSync(filePath, newContent, 'utf8')
        console.log(`✅ Fixed ${filePath}:`)
        changes.forEach(change => console.log(`   - ${change}`))
        console.log(`   Total errors fixed: ${errorsFixed}\n`)
      }

      return { errorsFixed }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message)
      return { errorsFixed: 0 }
    }
  }

  // Process both packages and apps directories
  processDirectory(packagesDir)
  processDirectory(appsDir)

  console.log('\n📊 Summary:')
  console.log(`Files fixed: ${totalFilesFixed}`)
  console.log(`Total errors fixed: ${totalErrorsFixed}`)

  return { totalFilesFixed, totalErrorsFixed }
}

// Run the script
if (require.main === module) {
  fixUnderscoreSyntaxErrors()
}

module.exports = { fixUnderscoreSyntaxErrors }
