/**
 * Audit Tool Type Definitions
 * Consolidated types for the audit system
 */

export type AssetType = 'source' | 'test' | 'config' | 'documentation' | 'assets' | 'build';

export interface CodeAsset {
  path: string;
  relativePath: string;
  type: AssetType;
  size: number;
  extension: string;
  lastModified: Date;
  dependencies?: string[];
  exports?: string[];
  complexity?: number;
}

export interface ScanOptions {
  patterns: string[];
  excludePatterns: string[];
  followSymlinks: boolean;
  maxDepth: number;
  maxFileSize: number;
  enableMetrics: boolean;
  enableProgress: boolean;
}

export interface ScanProgress {
  totalFiles: number;
  processedFiles: number;
  currentFile: string;
  percentage: number;
  estimatedTimeRemaining: number;
}

export interface ScanWarning {
  type: 'permission' | 'size' | 'symlink' | 'encoding';
  path: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ScanMetrics {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  filesProcessed: number;
  bytesProcessed: number;
  averageFileSize: number;
  filesPerSecond: number;
  memoryUsage: number;
  warnings: ScanWarning[];
}

export interface ScanResult {
  assets: CodeAsset[];
  metrics: ScanMetrics;
  warnings: ScanWarning[];
  summary: {
    totalFiles: number;
    totalSize: number;
    typeBreakdown: Record<AssetType, number>;
    largestFiles: CodeAsset[];
    oldestFiles: CodeAsset[];
  };
}

export interface IFileScanner {
  scan(rootPath: string, options?: Partial<ScanOptions>): Promise<ScanResult>;
  cancel(): void;
  isScanning(): boolean;
  getProgress(): ScanProgress | null;
}

export const DEFAULT_SCAN_OPTIONS: ScanOptions = {
  patterns: ['**/*.{ts,tsx,js,jsx,vue,svelte,py,rb,php,java,cs,cpp,c,h,hpp,go,rs,swift}'],
  excludePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
  followSymlinks: false,
  maxDepth: 10,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  enableMetrics: true,
  enableProgress: true,
};

export const PERFORMANCE_REQUIREMENTS = {
  maxScanTimeMs: 30000, // 30 seconds
  maxMemoryUsageMB: 512, // 512MB
  minFilesPerSecond: 100,
  maxConcurrentFiles: 50,
};