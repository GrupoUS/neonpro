import { promises as fs } from 'fs'
import path from 'path'
import { ScannedFile, ScanOptions, ScanResult } from '../types.js'

const DEFAULT_MAX_DEPTH = 6

interface TraversalOptions {
  root: string
  currentDepth: number
  maxDepth: number
  include: string[]
  exclude: string[]
  warnings: string[]
  files: ScannedFile[]
}

export async function scanWorkspace(options: ScanOptions): Promise<ScanResult> {
  const start = Date.now()
  const warnings: string[] = []
  const files: ScannedFile[] = []

  const normalisedRoot = path.resolve(options.root)
  const include = normalisePatterns(options.include)
  const exclude = normalisePatterns(options.exclude)
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH

  await walk({
    root: normalisedRoot,
    include,
    exclude,
    maxDepth,
    warnings,
    files,
    currentDepth: 0,
  })

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const durationMs = Date.now() - start

  return {
    files,
    totalSize,
    durationMs,
    warnings,
  }
}

async function walk(options: TraversalOptions): Promise<void> {
  if (options.currentDepth > options.maxDepth) {
    options.warnings.push(
      `Maximum depth (${options.maxDepth}) reached at ${options.root}`,
    )
    return
  }

  let entries: string[]
  try {
    entries = await fs.readdir(options.root)
  } catch (error) {
    options.warnings.push(
      `Cannot read directory ${options.root}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
    return
  }

  for (const entry of entries) {
    const fullPath = path.join(options.root, entry)
    let stats
    try {
      stats = await fs.stat(fullPath)
    } catch (error) {
      options.warnings.push(
        `Cannot stat ${fullPath}: ${error instanceof Error ? error.message : String(error)}`,
      )
      continue
    }

    if (stats.isDirectory()) {
      await walk({
        ...options,
        root: fullPath,
        currentDepth: options.currentDepth + 1,
      })
      continue
    }

    const relativePath = path.relative(process.cwd(), fullPath)
    if (!matchesPatterns(relativePath, options.include, options.exclude)) {
      continue
    }

    options.files.push({
      path: relativePath,
      size: stats.size,
      modified: stats.mtime,
    })
  }
}

function normalisePatterns(patterns?: string[]): string[] {
  if (!patterns || patterns.length === 0) {
    return []
  }

  return patterns.map((pattern) => pattern.trim()).filter(Boolean)
}

function matchesPatterns(
  relativePath: string,
  include: string[],
  exclude: string[],
): boolean {
  if (exclude.some((pattern) => relativePath.includes(pattern))) {
    return false
  }

  if (include.length === 0) {
    return true
  }

  return include.some((pattern) => relativePath.includes(pattern))
}
