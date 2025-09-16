/**
 * File Scanner Contract
 * Defines the interface for the file scanning service
 */

import { AssetType, UsageStatus, CodeAsset } from '../../src/models/types.js';

export interface FileScannerContract {
  /**
   * Scans directory for files matching patterns
   */
  scanDirectory(path: string, patterns: string[]): Promise<CodeAsset[]>;
  
  /**
   * Analyzes file type and metadata
   */
  analyzeFile(filePath: string): Promise<CodeAsset>;
  
  /**
   * Gets file statistics
   */
  getFileStats(filePath: string): Promise<{
    size: number;
    lineCount: number;
    lastModified: Date;
  }>;
}

export interface ScanOptions {
  includeHidden: boolean;
  followSymlinks: boolean;
  maxDepth: number;
  patterns: string[];
  excludePatterns: string[];
}

export interface ScanResult {
  assets: CodeAsset[];
  totalFiles: number;
  totalSize: number;
  errors: string[];
}