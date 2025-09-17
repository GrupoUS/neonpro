import { analyseDependencies } from './core/dependencyAnalyzer.js';
import { scanWorkspace } from './core/fileScanner.js';
import { buildAuditReport } from './core/reportGenerator.js';
import { AuditOptions, AuditReport } from './types.js';

export async function runAudit(options: AuditOptions): Promise<AuditReport> {
  if (!options.root) {
    throw new Error('Missing root directory for audit');
  }

  const scanResult = await scanWorkspace({
    root: options.root,
    include: options.include,
    exclude: options.exclude,
    maxDepth: options.maxDepth,
  });

  const dependencySummary = await analyseDependencies(scanResult.files);

  return buildAuditReport(options.root, scanResult, dependencySummary);
}
