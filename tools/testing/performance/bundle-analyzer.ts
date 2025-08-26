/**
 * Bundle Analysis Utilities
 *
 * Advanced bundle optimization and analysis tools for Next.js 15
 * Based on 2025 performance best practices
 */

import { promises as fs } from "node:fs";
import path from "node:path";

// Bundle size thresholds (in bytes)
export const BUNDLE_THRESHOLDS = {
  CRITICAL: 50 * 1024, // 50KB - critical resources
  WARNING: 100 * 1024, // 100KB - warning threshold
  ERROR: 250 * 1024, // 250KB - error threshold
  TOTAL_WARNING: 1024 * 1024, // 1MB - total bundle warning
  TOTAL_ERROR: 2 * 1024 * 1024, // 2MB - total bundle error
} as const;

// Bundle analysis result interface
export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: {
    name: string;
    size: number;
    gzippedSize: number;
    modules: string[];
    status: "good" | "warning" | "error";
  }[];
  duplicates: {
    module: string;
    chunks: string[];
    wastedBytes: number;
  }[];
  largeModules: {
    name: string;
    size: number;
    chunk: string;
  }[];
  recommendations: string[];
}

// Analyze webpack bundle stats
export async function analyzeBundleStats(
  statsPath: string,
): Promise<BundleAnalysis> {
  try {
    const statsContent = await fs.readFile(statsPath, "utf8");
    const stats = JSON.parse(statsContent);

    const analysis: BundleAnalysis = {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      duplicates: [],
      largeModules: [],
      recommendations: [],
    };

    // Analyze chunks
    if (stats.chunks) {
      for (const chunk of stats.chunks) {
        const chunkSize = chunk.size || 0;
        const chunkStatus = getChunkStatus(chunkSize);

        analysis.chunks.push({
          name: chunk.names?.[0] || chunk.id,
          size: chunkSize,
          gzippedSize: Math.round(chunkSize * 0.3), // Estimated gzip ratio
          modules: chunk.modules?.map((m: any) => m.name) || [],
          status: chunkStatus,
        });

        analysis.totalSize += chunkSize;
      }
    }

    // Analyze modules for duplicates and large modules
    if (stats.modules) {
      analyzeModules(stats.modules, analysis);
    }

    // Generate recommendations
    analysis.recommendations = generateRecommendations(analysis);

    return analysis;
  } catch {
    throw new Error("Failed to analyze bundle stats");
  }
}

// Determine chunk status based on size
function getChunkStatus(size: number): "good" | "warning" | "error" {
  if (size > BUNDLE_THRESHOLDS.ERROR) {
    return "error";
  }
  if (size > BUNDLE_THRESHOLDS.WARNING) {
    return "warning";
  }
  return "good";
}

// Analyze modules for optimization opportunities
function analyzeModules(modules: any[], analysis: BundleAnalysis) {
  const moduleMap = new Map<string, { chunk: string; size: number }[]>();

  for (const module of modules) {
    const moduleName = cleanModuleName(module.name);
    const moduleSize = module.size || 0;

    // Track module usage across chunks
    if (!moduleMap.has(moduleName)) {
      moduleMap.set(moduleName, []);
    }

    moduleMap.get(moduleName)?.push({
      chunk: module.chunks?.[0] || "unknown",
      size: moduleSize,
    });

    // Identify large modules
    if (moduleSize > BUNDLE_THRESHOLDS.WARNING) {
      analysis.largeModules.push({
        name: moduleName,
        size: moduleSize,
        chunk: module.chunks?.[0] || "unknown",
      });
    }
  }

  // Find duplicate modules
  for (const [moduleName, occurrences] of moduleMap) {
    if (occurrences.length > 1) {
      const totalWasted =
        occurrences.reduce((sum, occ) => sum + occ.size, 0) -
        Math.max(...occurrences.map((occ) => occ.size));

      if (totalWasted > 1024) {
        // Only report if > 1KB wasted
        analysis.duplicates.push({
          module: moduleName,
          chunks: occurrences.map((occ) => occ.chunk),
          wastedBytes: totalWasted,
        });
      }
    }
  }

  // Sort by impact
  analysis.largeModules.sort((a, b) => b.size - a.size);
  analysis.duplicates.sort((a, b) => b.wastedBytes - a.wastedBytes);
}

// Clean module names for better readability
function cleanModuleName(name: string): string {
  if (!name) {
    return "unknown";
  }

  // Remove webpack loader syntax
  name = name.replace(/^.*!/, "");

  // Simplify node_modules paths
  name = name.replace(/.*node_modules\//, "");

  // Remove query parameters
  name = name.replace(/\?.*$/, "");

  return name;
}

// Generate optimization recommendations
function generateRecommendations(analysis: BundleAnalysis): string[] {
  const recommendations: string[] = [];

  // Bundle size recommendations
  if (analysis.totalSize > BUNDLE_THRESHOLDS.TOTAL_ERROR) {
    recommendations.push(
      "🚨 Total bundle size exceeds 2MB - implement aggressive code splitting",
    );
  } else if (analysis.totalSize > BUNDLE_THRESHOLDS.TOTAL_WARNING) {
    recommendations.push(
      "⚠️ Total bundle size exceeds 1MB - consider code splitting",
    );
  }

  // Large chunk recommendations
  const largeChunks = analysis.chunks.filter(
    (chunk) => chunk.status === "error",
  );
  if (largeChunks.length > 0) {
    recommendations.push(
      `🔄 ${largeChunks.length} chunks exceed 250KB - split into smaller chunks`,
    );
  }

  // Duplicate module recommendations
  if (analysis.duplicates.length > 0) {
    const totalWasted = analysis.duplicates.reduce(
      (sum, dup) => sum + dup.wastedBytes,
      0,
    );
    recommendations.push(
      `📦 ${analysis.duplicates.length} duplicate modules waste ${formatBytes(
        totalWasted,
      )} - optimize imports`,
    );
  }

  // Large module recommendations
  if (analysis.largeModules.length > 0) {
    recommendations.push(
      `🎯 ${analysis.largeModules.length} large modules found - consider lazy loading`,
    );
  }

  // Specific library recommendations
  const recharts = analysis.largeModules.find((m) =>
    m.name.includes("recharts"),
  );
  if (recharts) {
    recommendations.push(
      '📊 Recharts detected - use selective imports: import { LineChart } from "recharts"',
    );
  }

  const lodash = analysis.largeModules.find((m) => m.name.includes("lodash"));
  if (lodash) {
    recommendations.push(
      '🛠️ Lodash detected - use individual imports: import debounce from "lodash/debounce"',
    );
  }

  return recommendations;
}

// Format bytes for human readability
export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

// Generate bundle report
export function generateBundleReport(analysis: BundleAnalysis): string {
  let report = "# Bundle Analysis Report\n\n";

  // Summary
  report += "## Summary\n";
  report += `- **Total Size**: ${formatBytes(analysis.totalSize)}\n`;
  report += `- **Estimated Gzipped**: ${formatBytes(analysis.gzippedSize)}\n`;
  report += `- **Chunks**: ${analysis.chunks.length}\n`;
  report += `- **Large Modules**: ${analysis.largeModules.length}\n`;
  report += `- **Duplicates**: ${analysis.duplicates.length}\n\n`;

  // Recommendations
  if (analysis.recommendations.length > 0) {
    report += "## Recommendations\n";
    analysis.recommendations.forEach((rec) => {
      report += `- ${rec}\n`;
    });
    report += "\n";
  }

  // Chunk details
  report += "## Chunks\n";
  analysis.chunks.forEach((chunk) => {
    const status =
      chunk.status === "error"
        ? "🚨"
        : chunk.status === "warning"
          ? "⚠️"
          : "✅";
    report += `- ${status} **${chunk.name}**: ${formatBytes(chunk.size)}\n`;
  });
  report += "\n";

  // Large modules
  if (analysis.largeModules.length > 0) {
    report += `## Large Modules (>${formatBytes(BUNDLE_THRESHOLDS.WARNING)})\n`;
    analysis.largeModules.slice(0, 10).forEach((module) => {
      report += `- **${module.name}**: ${formatBytes(module.size)} (${module.chunk})\n`;
    });
    report += "\n";
  }

  // Duplicates
  if (analysis.duplicates.length > 0) {
    report += "## Duplicate Modules\n";
    analysis.duplicates.slice(0, 10).forEach((dup) => {
      report += `- **${dup.module}**: ${formatBytes(
        dup.wastedBytes,
      )} wasted across ${dup.chunks.length} chunks\n`;
    });
  }

  return report;
}

// CLI utility for bundle analysis
export async function runBundleAnalysis(statsPath?: string) {
  const defaultStatsPath = path.join(
    process.cwd(),
    ".next",
    "analyze",
    "stats.json",
  );
  const finalStatsPath = statsPath || defaultStatsPath;

  try {
    const analysis = await analyzeBundleStats(finalStatsPath);

    // Write report to file
    const reportPath = path.join(process.cwd(), "bundle-analysis-report.md");
    await fs.writeFile(reportPath, generateBundleReport(analysis));

    return analysis;
  } catch {
    process.exit(1);
  }
}
