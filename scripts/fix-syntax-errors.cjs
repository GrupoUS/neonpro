#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

/**
 * Fix-Syntax-Errors Script
 * Corrects over-zealous underscore prefixes that broke function syntax
 */

function fixSyntaxInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    let hasChanges = false

    // 1. Fix hook callback functions: useEffect(_() => should be useEffect(() =>
    const hookPatterns = [
      { from: /useEffect\(_\(\)\s*=>/g, to: 'useEffect(() =>' },
      { from: /useMemo\(_\(\)\s*=>/g, to: 'useMemo(() =>' },
      { from: /useCallback\(_\(\)\s*=>/g, to: 'useCallback(() =>' },
      { from: /React\.useEffect\(_\(\)\s*=>/g, to: 'React.useEffect(() =>' },
      { from: /React\.useMemo\(_\(\)\s*=>/g, to: 'React.useMemo(() =>' },
      {
        from: /React\.useCallback\(_\(\)\s*=>/g,
        to: 'React.useCallback(() =>',
      },
    ]

    hookPatterns.forEach(({ from, to }) => {
      const before = content
      content = content.replace(from, to)
      if (content !== before) hasChanges = true
    })

    // 2. Fix function parameter syntax: ,_...props should be , ...props
    const restParameterFixes = [
      { from: /,\s*_\.\.\.([a-zA-Z][a-zA-Z0-9]*)/g, to: ', ...$1' },
      { from: /\(\s*_\.\.\.([a-zA-Z][a-zA-Z0-9]*)/g, to: '(...$1' },
    ]

    restParameterFixes.forEach(({ from, to }) => {
      const before = content
      content = content.replace(from, to)
      if (content !== before) hasChanges = true
    })

    // 3. Fix function parameter refs: },_ref) => should be }, ref) =>
    const refParameterFixes = [
      { from: /},\s*_ref\s*\)/g, to: '}, ref)' },
      { from: /},\s*_ref\s*,/g, to: '}, ref,' },
      { from: /\(\s*_ref\s*\)/g, to: '(ref)' },
      { from: /\(\s*_ref\s*,/g, to: '(ref,' },
    ]

    refParameterFixes.forEach(({ from, to }) => {
      const before = content
      content = content.replace(from, to)
      if (content !== before) hasChanges = true
    })

    // 4. Fix arrow function parameters: ) => _( should be ) => (
    const arrowFunctionFixes = [
      { from: /\)\s*=>\s*_\(/g, to: ') => (' },
      { from: /\]\s*=>\s*_\(/g, to: '] => (' },
    ]

    arrowFunctionFixes.forEach(({ from, to }) => {
      const before = content
      content = content.replace(from, to)
      if (content !== before) hasChanges = true
    })

    // 5. Fix specific JSX patterns: >_(< should be >(<
    const jsxFixes = [
      { from: />\s*_\(/g, to: '>(' },
      { from: /=\s*_\(/g, to: '=(' },
    ]

    jsxFixes.forEach(({ from, to }) => {
      const before = content
      content = content.replace(from, to)
      if (content !== before) hasChanges = true
    })

    // 6. Fix requestAnimationFrame and similar callback patterns
    const callbackFixes = [
      {
        from: /requestAnimationFrame\(_\(\)\s*=>/g,
        to: 'requestAnimationFrame(() =>',
      },
      { from: /setTimeout\(_\(\)\s*=>/g, to: 'setTimeout(() =>' },
      { from: /setInterval\(_\(\)\s*=>/g, to: 'setInterval(() =>' },
    ]

    callbackFixes.forEach(({ from, to }) => {
      const before = content
      content = content.replace(from, to)
      if (content !== before) hasChanges = true
    })

    // Write back if there were changes
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8')
      return true
    }
    return false
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message)
    return false
  }
}

function scanDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = []

  function walk(currentPath) {
    try {
      const items = fs.readdirSync(currentPath, { withFileTypes: true })

      for (const item of items) {
        const fullPath = path.join(currentPath, item.name)

        if (item.isDirectory()) {
          // Skip node_modules, .git, dist, build
          if (
            !['node_modules', '.git', 'dist', 'build', '.next'].includes(
              item.name,
            )
          ) {
            walk(fullPath)
          }
        } else if (item.isFile()) {
          const ext = path.extname(item.name)
          if (extensions.includes(ext)) {
            files.push(fullPath)
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentPath}:`, error.message)
    }
  }

  walk(dirPath)
  return files
}

function main() {
  const projectRoot = process.cwd()
  const packagesDir = path.join(projectRoot, 'packages')

  console.log(
    '🔧 Fixing syntax errors from over-zealous underscore prefixes...',
  )
  console.log(`Scanning: ${packagesDir}`)

  const files = scanDirectory(packagesDir)
  console.log(`Found ${files.length} files to check`)

  let fixedFiles = 0

  for (const file of files) {
    const relativePath = path.relative(projectRoot, file)
    if (fixSyntaxInFile(file)) {
      console.log(`✅ Fixed: ${relativePath}`)
      fixedFiles++
    }
  }

  console.log(`\n🎉 Fixed syntax errors in ${fixedFiles} files`)

  if (fixedFiles > 0) {
    console.log('\n✅ Ready to run build verification again')
  } else {
    console.log('\n🤔 No syntax errors found - might need manual review')
  }
}

if (require.main === module) {
  main()
}
