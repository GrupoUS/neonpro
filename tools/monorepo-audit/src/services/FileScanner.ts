/**
 * FileScanner Service Implementation
 * Recursive directory traversal and file discovery for monorepo analysis
 * Based on: specs/003-monorepo-audit-optimization/contracts/file-scanner.contract.ts
 * Generated: 2025-09-09
 */

import { promises as fs, } from 'fs'
import { glob, } from 'glob'
import { extname, join, relative, resolve, } from 'path'
import type {
  AssetType,
  CodeAsset,
  IFileScanner,
  ScanMetrics,
  ScanOptions,
  ScanProgress,
  ScanResult,
  ScanWarning,
} from '../../../specs/003-monorepo-audit-optimization/contracts/file-scanner.contract'
import {
  DEFAULT_SCAN_OPTIONS,
  PERFORMANCE_REQUIREMENTS,
} from '../../../specs/003-monorepo-audit-optimization/contracts/file-scanner.contract'

export class FileScanner implements IFileScanner {
  private isCancelled: boolean = false
  private currentScan: Promise<ScanResult> | null = null

  /**
   * Scan directory recursively for code assets
   */
  public async scan(options: ScanOptions,): Promise<ScanResult> {
    this.isCancelled = false
    const startTime = Date.now()
    const startMemory = process.memoryUsage().heapUsed

    const assets: CodeAsset[] = []
    const warnings: ScanWarning[] = []
    let filesProcessed = 0
    const directoriesProcessed = 0
    let skippedFiles = 0

    try {
      // Validate options first
      const validationErrors = this.validateOptions(options,)
      if (validationErrors.length > 0) {
        throw new Error(`Invalid scan options: ${validationErrors.join(', ',)}`,)
      }

      // Resolve base directory
      const baseDir = resolve(options.baseDirectory,)

      // Check if base directory exists
      const baseStat = await fs.stat(baseDir,).catch(() => null)
      if (!baseStat || !baseStat.isDirectory()) {
        throw new Error(`Base directory does not exist: ${baseDir}`,)
      }

      // Build glob patterns for inclusion
      const includePatterns = options.includePatterns.map(pattern => join(baseDir, pattern,))

      // Find all matching files
      const allFiles = await this.findMatchingFiles(includePatterns, options,)

      // Process each file
      for (const filePath of allFiles) {
        if (this.isCancelled) {
          break
        }

        try {
          const asset = await this.processFile(filePath, baseDir, options,)
          if (asset) {
            assets.push(asset,)
            filesProcessed++
          } else {
            skippedFiles++
          }
        } catch (error) {
          warnings.push({
            type: 'access_denied',
            path: filePath,
            message: `Failed to process file: ${
              error instanceof Error ? error.message : String(error,)
            }`,
            critical: false,
          },)
          skippedFiles++
        }
      }

      // Calculate metrics
      const endTime = Date.now()
      const endMemory = process.memoryUsage().heapUsed
      const metrics: ScanMetrics = {
        executionTimeMs: endTime - startTime,
        totalFiles: filesProcessed,
        totalDirectories: directoriesProcessed,
        skippedFiles,
        peakMemoryUsage: Math.max(startMemory, endMemory,),
      }

      return {
        assets,
        metrics,
        warnings,
      }
    } catch (error) {
      // Convert error to warning and return partial results
      warnings.push({
        type: 'access_denied',
        path: options.baseDirectory,
        message: `Scan failed: ${error instanceof Error ? error.message : String(error,)}`,
        critical: true,
      },)

      const endTime = Date.now()
      const metrics: ScanMetrics = {
        executionTimeMs: endTime - startTime,
        totalFiles: filesProcessed,
        totalDirectories: directoriesProcessed,
        skippedFiles,
        peakMemoryUsage: process.memoryUsage().heapUsed,
      }

      return {
        assets,
        metrics,
        warnings,
      }
    } finally {
      this.currentScan = null
    }
  } /**
   * Scan directory with progress callback
   */

  public async scanWithProgress(
    options: ScanOptions,
    onProgress: (progress: ScanProgress,) => void,
  ): Promise<ScanResult> {
    this.isCancelled = false
    const startTime = Date.now()

    // Store the scan promise for cancellation
    this.currentScan = this.performProgressScan(options, onProgress, startTime,)

    return this.currentScan
  }

  /**
   * Get default scan options for monorepo
   */
  public getDefaultOptions(baseDirectory: string,): ScanOptions {
    return {
      baseDirectory: resolve(baseDirectory,),
      maxDepth: DEFAULT_SCAN_OPTIONS.maxDepth ?? -1,
      includePatterns: DEFAULT_SCAN_OPTIONS.includePatterns ?? ['**/*',],
      excludePatterns: DEFAULT_SCAN_OPTIONS.excludePatterns ?? [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**',
        '**/*.log',
        'coverage/**',
        '.turbo/**',
        '.next/**',
      ],
      followSymlinks: DEFAULT_SCAN_OPTIONS.followSymlinks ?? false,
      includeHidden: DEFAULT_SCAN_OPTIONS.includeHidden ?? false,
    }
  }

  /**
   * Validate scan options
   */
  public validateOptions(options: ScanOptions,): string[] {
    const errors: string[] = []

    // Validate baseDirectory
    if (!options.baseDirectory || typeof options.baseDirectory !== 'string') {
      errors.push('baseDirectory is required and must be a string',)
    }

    // Validate maxDepth
    if (options.maxDepth !== -1 && (typeof options.maxDepth !== 'number' || options.maxDepth < 0)) {
      errors.push('maxDepth must be a non-negative number or -1 for unlimited',)
    }

    // Validate patterns
    if (!Array.isArray(options.includePatterns,)) {
      errors.push('includePatterns must be an array',)
    }

    if (!Array.isArray(options.excludePatterns,)) {
      errors.push('excludePatterns must be an array',)
    }

    // Validate boolean options
    if (typeof options.followSymlinks !== 'boolean') {
      errors.push('followSymlinks must be a boolean',)
    }

    if (typeof options.includeHidden !== 'boolean') {
      errors.push('includeHidden must be a boolean',)
    }

    // Validate glob patterns
    try {
      options.includePatterns.forEach(pattern => {
        if (typeof pattern !== 'string' || pattern.length === 0) {
          errors.push(`Invalid include pattern: ${pattern}`,)
        }
      },)
    } catch (error) {
      errors.push('Invalid include patterns',)
    }

    try {
      options.excludePatterns.forEach(pattern => {
        if (typeof pattern !== 'string' || pattern.length === 0) {
          errors.push(`Invalid exclude pattern: ${pattern}`,)
        }
      },)
    } catch (error) {
      errors.push('Invalid exclude patterns',)
    }

    return errors
  }

  /**
   * Cancel ongoing scan operation
   */
  public async cancel(): Promise<void> {
    this.isCancelled = true

    if (this.currentScan) {
      try {
        await this.currentScan
      } catch (error) {
        // Cancellation may cause promise rejection, which is expected
      }
      this.currentScan = null
    }
  }

  /**
   * Perform scan with progress reporting
   */
  private async performProgressScan(
    options: ScanOptions,
    onProgress: (progress: ScanProgress,) => void,
    startTime: number,
  ): Promise<ScanResult> {
    const assets: CodeAsset[] = []
    const warnings: ScanWarning[] = []
    let filesProcessed = 0
    const directoriesProcessed = 0
    let skippedFiles = 0

    try {
      const baseDir = resolve(options.baseDirectory,)
      const allFiles = await this.findMatchingFiles([join(baseDir, '**/*',),], options,)
      const totalFiles = allFiles.length

      let lastProgressUpdate = Date.now()

      for (let i = 0; i < allFiles.length; i++) {
        if (this.isCancelled) {
          throw new Error('Scan cancelled by user',)
        }

        const filePath = allFiles[i]
        const currentTime = Date.now()

        try {
          const asset = await this.processFile(filePath, baseDir, options,)
          if (asset) {
            assets.push(asset,)
            filesProcessed++
          } else {
            skippedFiles++
          }
        } catch (error) {
          warnings.push({
            type: 'access_denied',
            path: filePath,
            message: `Failed to process: ${
              error instanceof Error ? error.message : String(error,)
            }`,
            critical: false,
          },)
          skippedFiles++
        }

        // Update progress at minimum intervals
        if (
          currentTime - lastProgressUpdate
            >= PERFORMANCE_REQUIREMENTS.MIN_PROGRESS_UPDATE_INTERVAL
        ) {
          const progress: ScanProgress = {
            filesFound: filesProcessed,
            directoriesFound: directoriesProcessed,
            currentPath: filePath,
            percentComplete: Math.round((i / totalFiles) * 100,),
            estimatedTimeRemaining: this.calculateEstimatedTime(
              startTime,
              currentTime,
              i,
              totalFiles,
            ),
          }

          onProgress(progress,)
          lastProgressUpdate = currentTime
        }
      }

      // Final progress update
      const endTime = Date.now()
      onProgress({
        filesFound: filesProcessed,
        directoriesFound: directoriesProcessed,
        currentPath: '',
        percentComplete: 100,
        estimatedTimeRemaining: 0,
      },)

      const metrics: ScanMetrics = {
        executionTimeMs: endTime - startTime,
        totalFiles: filesProcessed,
        totalDirectories: directoriesProcessed,
        skippedFiles,
        peakMemoryUsage: process.memoryUsage().heapUsed,
      }

      return { assets, metrics, warnings, }
    } catch (error) {
      const endTime = Date.now()
      const metrics: ScanMetrics = {
        executionTimeMs: endTime - startTime,
        totalFiles: filesProcessed,
        totalDirectories: directoriesProcessed,
        skippedFiles,
        peakMemoryUsage: process.memoryUsage().heapUsed,
      }

      if (error.message.includes('cancelled',)) {
        warnings.push({
          type: 'access_denied',
          path: options.baseDirectory,
          message: 'Scan was cancelled',
          critical: true,
        },)
      }

      return { assets, metrics, warnings, }
    }
  } /**
   * Find matching files using glob patterns
   */

  private async findMatchingFiles(
    includePatterns: string[],
    options: ScanOptions,
  ): Promise<string[]> {
    const allFiles: string[] = []

    for (const pattern of includePatterns) {
      try {
        const globOptions: any = {
          ignore: options.excludePatterns,
        }

        // Only set follow if explicitly enabled
        if (options.followSymlinks) {
          globOptions.follow = true
        }

        // Only set dot if explicitly enabled
        if (options.includeHidden) {
          globOptions.dot = true
        }

        // Only set maxDepth if not unlimited (-1)
        if (options.maxDepth !== -1) {
          globOptions.maxDepth = options.maxDepth
        }

        const files = await glob(pattern, globOptions,)
        allFiles.push(...files,)
      } catch (error) {
        // Continue with other patterns if one fails
        continue
      }
    }

    // Remove duplicates and sort
    return [...new Set(allFiles,),].sort()
  }

  /**
   * Process individual file and create CodeAsset
   */
  private async processFile(
    filePath: string,
    baseDir: string,
    options: ScanOptions,
  ): Promise<CodeAsset | null> {
    try {
      const stats = await fs.stat(filePath,)

      if (!stats.isFile()) {
        return null
      }

      const relativePath = relative(baseDir, filePath,)
      const extension = extname(filePath,).toLowerCase()
      const assetType = this.classifyFileType(filePath, relativePath,)
      const location = this.determineLocation(relativePath,)
      const packageName = await this.detectPackageName(filePath,)

      const metadata = {
        location,
        packageName,
        lineCount: await this.countLines(filePath,),
        contentHash: await this.calculateContentHash(filePath,),
      }

      return {
        path: filePath,
        extension: extension.substring(1,), // Remove leading dot
        size: stats.size,
        lastModified: stats.mtime,
        type: assetType,
        location,
        packageName,
        metadata,
      }
    } catch (error) {
      throw new Error(
        `Failed to process file ${filePath}: ${
          error instanceof Error ? error.message : String(error,)
        }`,
      )
    }
  }

  /**
   * Classify file type based on path and content
   */
  private classifyFileType(filePath: string, relativePath: string,): AssetType {
    const fileName = filePath.toLowerCase()
    const extension = extname(fileName,)

    // Test files
    if (
      fileName.includes('.test.',)
      || fileName.includes('.spec.',)
      || relativePath.includes('__tests__',)
      || relativePath.includes('/test/',)
    ) {
      return 'test'
    }

    // Configuration files
    if (
      fileName.includes('config',)
      || fileName.includes('.json',)
      || fileName.includes('.yml',)
      || fileName.includes('.yaml',)
      || ['package.json', 'turbo.json', 'tsconfig.json', '.eslintrc.js',].some(name =>
        fileName.endsWith(name,)
      )
    ) {
      return 'config'
    }

    // Type definition files
    if (extension === '.d.ts' || relativePath.includes('/types/',)) {
      return 'types'
    }

    // Documentation files
    if (['.md', '.txt', '.rst',].includes(extension,)) {
      return 'documentation'
    }

    // Component files
    if (
      ['.tsx', '.jsx',].includes(extension,)
      && (relativePath.includes('/components/',) || relativePath.includes('/ui/',))
    ) {
      return 'component'
    }

    // Route files
    if (relativePath.includes('/routes/',) || relativePath.includes('/pages/',)) {
      return 'route'
    }

    // Service files
    if (relativePath.includes('/services/',) || relativePath.includes('/api/',)) {
      return 'service'
    }

    // Utility files
    if (relativePath.includes('/utils/',) || relativePath.includes('/helpers/',)) {
      return 'utility'
    }

    return 'unknown'
  }

  /**
   * Determine location classification (apps, packages, root, other)
   */
  private determineLocation(relativePath: string,): 'apps' | 'packages' | 'root' | 'other' {
    if (relativePath.startsWith('apps/',)) {
      return 'apps'
    }

    if (relativePath.startsWith('packages/',)) {
      return 'packages'
    }

    // Root level files (no subdirectory or only one level deep)
    if (!relativePath.includes('/',) || relativePath.split('/',).length <= 2) {
      return 'root'
    }

    return 'other'
  }

  /**
   * Detect package name for workspace files
   */
  private async detectPackageName(filePath: string,): Promise<string | undefined> {
    let currentDir = filePath

    // Traverse up the directory tree looking for package.json
    for (let i = 0; i < 5; i++) {
      // Limit traversal to prevent infinite loops
      currentDir = join(currentDir, '..',)
      const packageJsonPath = join(currentDir, 'package.json',)

      try {
        const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8',)
        const packageJson = JSON.parse(packageJsonContent,)

        if (packageJson.name) {
          return packageJson.name
        }
      } catch (error) {
        // Continue searching in parent directory
        continue
      }
    }

    return undefined
  }

  /**
   * Count lines in a text file
   */
  private async countLines(filePath: string,): Promise<number | undefined> {
    try {
      // Only count lines for text files
      const extension = extname(filePath,).toLowerCase()
      const textExtensions = [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.json',
        '.md',
        '.txt',
        '.yml',
        '.yaml',
      ]

      if (!textExtensions.includes(extension,)) {
        return undefined
      }

      const content = await fs.readFile(filePath, 'utf-8',)
      return content.split('\n',).length
    } catch (error) {
      return undefined
    }
  }

  /**
   * Calculate content hash for change detection
   */
  private async calculateContentHash(filePath: string,): Promise<string | undefined> {
    try {
      const crypto = await import('crypto')
      const content = await fs.readFile(filePath,)
      return crypto.createHash('sha256',).update(content,).digest('hex',).substring(0, 16,)
    } catch (error) {
      return undefined
    }
  }

  /**
   * Calculate estimated time remaining
   */
  private calculateEstimatedTime(
    startTime: number,
    currentTime: number,
    processedCount: number,
    totalCount: number,
  ): number {
    if (processedCount === 0) {
      return 0
    }

    const elapsedTime = currentTime - startTime
    const avgTimePerFile = elapsedTime / processedCount
    const remainingFiles = totalCount - processedCount

    return Math.round(remainingFiles * avgTimePerFile,)
  }
}
