import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')
const analysisDir = resolve(rootDir, 'analysis')

const beforePath = resolve(analysisDir, 'pre-cleanup-routes.json')
const afterPath = resolve(analysisDir, 'post-cleanup-routes.json')

const readJson = (path: string, label: string) => {
  try {
    const raw = readFileSync(path, 'utf-8')
    return JSON.parse(raw) as string[]
  } catch (error) {
    console.error(`❌ Failed to read ${label} at ${path}`)
    throw error
  }
}

const before = new Set(readJson(beforePath, 'pre-cleanup routes'))
const after = new Set(readJson(afterPath, 'post-cleanup routes'))

const missing = [...before].filter(route => !after.has(route))
const added = [...after].filter(route => !before.has(route))

if (missing.length === 0 && added.length === 0) {
  console.log('✅ Route parity check passed – all routes preserved.')
  process.exit(0)
}

if (missing.length > 0) {
  console.error('❌ Missing routes detected:')
  missing.forEach(route => console.error(`  - ${route}`))
}

if (added.length > 0) {
  console.warn('ℹ️ New routes detected:')
  added.forEach(route => console.warn(`  + ${route}`))
}

process.exit(1)
