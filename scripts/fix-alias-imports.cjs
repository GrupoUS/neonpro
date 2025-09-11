// scripts/fix-alias-imports.cjs
const fs = require('fs')
const path = require('path')

const specsPath = path.join(process.cwd(), 'import-specs.json')
if (!fs.existsSync(specsPath)) {
  console.error('import-specs.json not found at', specsPath)
  process.exit(1)
}
const specs = JSON.parse(fs.readFileSync(specsPath, 'utf8'))

function removeExt(p) {
  return p.replace(/\.(ts|tsx|js|jsx|mts|cts)$/, '')
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')
}

const summary = { modified: [] }

for (const s of specs) {
  const { file, specifier, resolved, resolvedPath } = s
  if (!specifier || !specifier.startsWith('@/')) continue
  if (!resolved || !resolvedPath) continue

  // ensure same top-level package (e.g., apps/web)
  const fileParts = file.split('/')
  const resolvedParts = resolvedPath.split('/')
  if (fileParts.length < 2 || resolvedParts.length < 2) continue
  const packageRoot = fileParts.slice(0, 2).join('/')
  const resolvedRoot = resolvedParts.slice(0, 2).join('/')
  if (packageRoot !== resolvedRoot) continue

  const absFile = path.join(process.cwd(), file)
  const absResolved = path.join(process.cwd(), resolvedPath)
  if (!fs.existsSync(absFile) || !fs.existsSync(absResolved)) continue

  // compute relative import from file dir to resolved path (without extension)
  const rel = path.posix.relative(path.posix.dirname(file), removeExt(resolvedPath))
  const relImport = rel.startsWith('.') ? rel : './' + rel

  let content = fs.readFileSync(absFile, 'utf8')
  const pattern = new RegExp(`(['"])${escapeRegExp(specifier)}\\\\1`, 'g')
  if (!pattern.test(content)) {
    // nothing to replace (maybe different quoting) — try without surrounding quotes
    const pattern2 = new RegExp(escapeRegExp(specifier), 'g')
    if (!pattern2.test(content)) continue
  }

  const newContent = content.replace(pattern, (match, quote) => `${quote}${relImport}${quote}`)
  if (newContent === content) continue

  // backup original
  fs.writeFileSync(absFile + '.bak.fix-alias', content, 'utf8')
  fs.writeFileSync(absFile, newContent, 'utf8')

  summary.modified.push({
    file,
    from: specifier,
    to: relImport,
  })
}

console.log(JSON.stringify(summary, null, 2))