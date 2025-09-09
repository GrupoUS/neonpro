/**
 * Contract: FileScanner Service
 * Purpose: Recursive directory traversal and file discovery for monorepo analysis
 * Generated: 2025-09-09
 */

// Core Types
export interface ScanOptions {
  /** Base directory to scan from */
  baseDirectory: string
  /** Maximum depth to traverse (-1 for unlimited) */
  maxDepth: number
  /** File patterns to include (glob patterns) */
  includePatterns: string[]
  /** File patterns to exclude (glob patterns) */
  excludePatterns: string[]
  /** Whether to follow symbolic links */
  followSymlinks: boolean
  /** Whether to include hidden files/directories */
  includeHidden: boolean
}

export interface ScanProgress {
  /** Total files discovered so far */
  filesFound: number
  /** Total directories discovered so far */
  directoriesFound: number
  /** Current directory being processed */
  currentPath: string
  /** Percentage complete (0-100) */
  percentComplete: number
  /** Estimated time remaining in milliseconds */
  estimatedTimeRemaining: number
}

export interface ScanResult {
  /** All discovered code assets */
  assets: CodeAsset[]
  /** Scan execution metrics */
  metrics: ScanMetrics
  /** Any warnings encountered during scan */
  warnings: ScanWarning[]
}

export interface ScanMetrics {
  /** Total execution time in milliseconds */
  executionTimeMs: number
  /** Total files processed */
  totalFiles: number
  /** Total directories processed */
  totalDirectories: number
  /** Files skipped due to filters */
  skippedFiles: number
  /** Memory usage peak in bytes */
  peakMemoryUsage: number
}

export interface ScanWarning {
  /** Warning type classification */
  type: 'access_denied' | 'symbolic_link' | 'large_file' | 'corrupt_file'
  /** File or directory path that triggered warning */
  path: string
  /** Human-readable warning message */
  message: string
  /** Whether warning affects analysis accuracy */
  critical: boolean
}

export interface CodeAsset {
  /** Absolute file path */
  path: string
  /** File extension */
  extension: string
  /** File size in bytes */
  size: number
  /** Last modified timestamp */
  lastModified: Date
  /** File type classification */
  type: AssetType
  /** Whether file is in apps/ or packages/ directory */
  location: 'apps' | 'packages' | 'root' | 'other'
  /** Package name if file belongs to a workspace package */
  packageName?: string
  /** Initial metadata discovered during scan */
  metadata: Record<string, unknown>
  /** Optional analysis additions used in tests */
  dependencies: string[]
  exports?: string[]
  layer?: string
  content?: string
  lineCount?: number
  complexity?: number
}

export type AssetType =
  | 'component'
  | 'route'
  | 'service'
  | 'utility'
  | 'test'
  | 'config'
  | 'documentation'
  | 'types'
  | 'typescript'
  | 'unknown'

// Service Interface
export interface IFileScanner {
  /**
   * Scan directory recursively for code assets
   * @param options Scanning configuration
   * @returns Promise resolving to scan results
   */
  scan(options: ScanOptions,): Promise<ScanResult>

  /**
   * Scan directory with progress callback
   * @param options Scanning configuration
   * @param onProgress Callback for progress updates
   * @returns Promise resolving to scan results
   */
  scanWithProgress(
    options: ScanOptions,
    onProgress: (progress: ScanProgress,) => void,
  ): Promise<ScanResult>

  /**
   * Get default scan options for monorepo
   * @param baseDirectory Root directory to scan
   * @returns Default scanning configuration
   */
  getDefaultOptions(baseDirectory: string,): ScanOptions

  /**
   * Validate scan options
   * @param options Options to validate
   * @returns Array of validation errors (empty if valid)
   */
  validateOptions(options: ScanOptions,): string[]

  /**
   * Cancel ongoing scan operation
   * @returns Promise resolving when cancellation complete
   */
  cancel(): Promise<void>
}

// Contract Tests Requirements
export interface FileScannerContractTests {
  /** Test basic directory scanning functionality */
  testBasicDirectoryScanning(): Promise<void>

  /** Test file type classification accuracy */
  testFileTypeClassification(): Promise<void>

  /** Test exclude pattern filtering */
  testExcludePatterns(): Promise<void>

  /** Test progress reporting accuracy */
  testProgressReporting(): Promise<void>

  /** Test cancellation mechanism */
  testScanCancellation(): Promise<void>

  /** Test large directory performance */
  testLargeDirectoryPerformance(): Promise<void>

  /** Test workspace package detection */
  testWorkspacePackageDetection(): Promise<void>

  /** Test error handling for inaccessible files */
  testErrorHandling(): Promise<void>
}

// Default Configuration
export const DEFAULT_SCAN_OPTIONS: Partial<ScanOptions> = {
  maxDepth: -1,
  includePatterns: ['**/*',],
  excludePatterns: [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    '**/*.log',
    'coverage/**',
    '.turbo/**',
    '.next/**',
  ],
  followSymlinks: false,
  includeHidden: false,
}

// Performance Constraints
export const PERFORMANCE_REQUIREMENTS = {
  /** Maximum acceptable scan time for 10k files (ms) */
  MAX_SCAN_TIME_10K_FILES: 30_000,
  /** Maximum memory usage during scan (bytes) */
  MAX_MEMORY_USAGE: 500_000_000, // 500MB
  /** Minimum progress update frequency (ms) */
  MIN_PROGRESS_UPDATE_INTERVAL: 100,
} as const
