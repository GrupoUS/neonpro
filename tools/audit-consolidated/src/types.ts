export type OutputFormat = "json" | "text";

export interface ScanOptions {
  root: string;
  include?: string[];
  exclude?: string[];
  maxDepth?: number;
}

export interface ScannedFile {
  path: string;
  size: number;
  modified: Date;
}

export interface ScanResult {
  files: ScannedFile[];
  totalSize: number;
  durationMs: number;
  warnings: string[];
}

export interface DependencySummary {
  totalFiles: number;
  totalImports: number;
  entryPoints: string[];
  unusedFiles: string[];
}

export interface AuditOptions extends Partial<ScanOptions> {
  outputFormat?: OutputFormat;
  output?: string;
  verbose?: boolean;
}

export interface AuditReport {
  generatedAt: Date;
  root: string;
  scan: {
    fileCount: number;
    totalSize: number;
    warnings: string[];
  };
  dependency: {
    totalImports: number;
    unusedFiles: string[];
  };
  recommendations: string[];
}
