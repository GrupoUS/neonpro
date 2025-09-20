import { AuditReport, DependencySummary, ScanResult } from '../types.js';

export function buildAuditReport(
  root: string,
  scan: ScanResult,
  dependency: DependencySummary,
): AuditReport {
  const recommendations = generateRecommendations(scan, dependency);

  return {
    generatedAt: new Date(),
    root,
    scan: {
      fileCount: scan.files.length,
      totalSize: scan.totalSize,
      warnings: scan.warnings,
    },
    dependency: {
      totalImports: dependency.totalImports,
      unusedFiles: dependency.unusedFiles,
    },
    recommendations,
  };
}

export function formatAuditReport(report: AuditReport): string {
  const lines: string[] = [];
  lines.push('NeonPro Audit Report');
  lines.push('='.repeat(40));
  lines.push(`Generated at: ${report.generatedAt.toISOString()}`);
  lines.push(`Root: ${report.root}`);
  lines.push('');
  lines.push('Scan Summary');
  lines.push('-'.repeat(20));
  lines.push(`Files analysed: ${report.scan.fileCount}`);
  lines.push(`Total size: ${formatBytes(report.scan.totalSize)}`);
  if (report.scan.warnings.length > 0) {
    lines.push('Warnings:');
    report.scan.warnings.forEach(warning => lines.push(`  • ${warning}`));
  } else {
    lines.push('Warnings: none');
  }
  lines.push('');
  lines.push('Dependency Summary');
  lines.push('-'.repeat(20));
  lines.push(`Total imports: ${report.dependency.totalImports}`);
  if (report.dependency.unusedFiles.length > 0) {
    lines.push('Potentially unused files:');
    report.dependency.unusedFiles.forEach(file => lines.push(`  • ${file}`));
  } else {
    lines.push('Potentially unused files: none');
  }
  lines.push('');
  lines.push('Recommendations');
  lines.push('-'.repeat(20));
  if (report.recommendations.length === 0) {
    lines.push('  • No outstanding issues detected. Great job!');
  } else {
    report.recommendations.forEach(rec => lines.push(`  • ${rec}`));
  }

  return lines.join('\n');
}

function generateRecommendations(
  scan: ScanResult,
  dependency: DependencySummary,
): string[] {
  const recommendations: string[] = [];

  if (scan.warnings.length > 0) {
    recommendations.push(
      'Review scan warnings and address inaccessible directories or files.',
    );
  }

  if (dependency.unusedFiles.length > 0) {
    recommendations.push(
      'Consider removing or refactoring files that appear unused.',
    );
  }

  if (dependency.totalImports === 0) {
    recommendations.push(
      'No imports detected. Confirm that the project root is correct.',
    );
  }

  return recommendations;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(2)} ${units[index]}`;
}
