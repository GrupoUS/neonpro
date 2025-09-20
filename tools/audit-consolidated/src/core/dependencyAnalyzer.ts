import { promises as fs } from 'fs';
import path from 'path';
import { DependencySummary, ScannedFile } from '../types.js';

const SUPPORTED_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
]);

export async function analyseDependencies(
  files: ScannedFile[],
): Promise<DependencySummary> {
  let totalImports = 0;
  const entryPoints: string[] = [];
  const candidatesForUnused: string[] = [];

  for (const file of files) {
    const ext = path.extname(file.path).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      continue;
    }

    if (isEntryPoint(file.path)) {
      entryPoints.push(file.path);
    }

    try {
      const content = await fs.readFile(file.path, 'utf-8');
      const importMatches = content.match(
        /^(import\s.+|const\s.+?=\srequire\()/gm,
      );
      const importCount = importMatches ? importMatches.length : 0;
      totalImports += importCount;

      if (importCount === 0 && !isEntryPoint(file.path)) {
        candidatesForUnused.push(file.path);
      }
    } catch {
      // Ignore read errors, they likely belong to binary files even if extension matches
      continue;
    }
  }

  return {
    totalFiles: files.length,
    totalImports,
    entryPoints,
    unusedFiles: candidatesForUnused.slice(0, 10),
  };
}

function isEntryPoint(filePath: string): boolean {
  return /index\.(t|j)sx?$/.test(path.basename(filePath));
}
