/**
 * Bundle Analyzer and Optimizer for NeonPro Healthcare
 *
 * Analyzes JavaScript bundles and provides optimization recommendations
 */

export type BundleAnalysis = {
	totalSize: number;
	gzippedSize: number;
	chunks: ChunkAnalysis[];
	recommendations: OptimizationRecommendation[];
	treeShakingOpportunities: TreeShakingOpportunity[];
};

export type ChunkAnalysis = {
	name: string;
	size: number;
	gzippedSize: number;
	modules: ModuleAnalysis[];
};

export type ModuleAnalysis = {
	name: string;
	size: number;
	imported: boolean;
	used: boolean;
};

export type OptimizationRecommendation = {
	type: "code-splitting" | "tree-shaking" | "compression" | "lazy-loading";
	severity: "high" | "medium" | "low";
	description: string;
	estimatedSavings: number;
};

export type TreeShakingOpportunity = {
	module: string;
	unusedExports: string[];
	estimatedSavings: number;
}; /**
 * Bundle Analyzer and Optimizer for NeonPro Healthcare
 *
 * Analyzes JavaScript bundles and provides optimization recommendations
 */

import fs from "node:fs/promises";
import path from "node:path";
import gzip from "gzip-size";

export type BundleAnalysis = {
	totalSize: number;
	gzippedSize: number;
	chunks: ChunkAnalysis[];
	recommendations: OptimizationRecommendation[];
	treeShakingOpportunities: TreeShakingOpportunity[];
};

export type ChunkAnalysis = {
	name: string;
	size: number;
	gzippedSize: number;
	modules: ModuleAnalysis[];
};

export type ModuleAnalysis = {
	name: string;
	size: number;
	imported: boolean;
	used: boolean;
};

export type OptimizationRecommendation = {
	type: "code-splitting" | "tree-shaking" | "compression" | "lazy-loading";
	severity: "high" | "medium" | "low";
	description: string;
	estimatedSavings: number;
};

export type TreeShakingOpportunity = {
	module: string;
	unusedExports: string[];
	estimatedSavings: number;
};

export class BundleOptimizer {
	private readonly buildDir: string;
	private readonly outputDir: string;

	constructor(buildDir: string, outputDir = "performance-reports") {
		this.buildDir = buildDir;
		this.outputDir = outputDir;
	} /**
	 * Analyze Next.js bundle and provide optimization recommendations
	 */
	async analyzeBundles(): Promise<BundleAnalysis> {
		const buildPath = path.join(this.buildDir, ".next");
		const staticPath = path.join(buildPath, "static", "chunks");

		try {
			const files = await fs.readdir(staticPath);
			const jsFiles = files.filter((file) => file.endsWith(".js"));

			let totalSize = 0;
			let totalGzippedSize = 0;
			const chunks: ChunkAnalysis[] = [];

			for (const file of jsFiles) {
				const filePath = path.join(staticPath, file);
				const content = await fs.readFile(filePath, "utf8");
				const size = Buffer.byteLength(content, "utf8");
				const gzippedSize = await gzip(content);

				totalSize += size;
				totalGzippedSize += gzippedSize;

				chunks.push({
					name: file,
					size,
					gzippedSize,
					modules: await this.analyzeChunkModules(content),
				});
			}

			const recommendations = this.generateRecommendations(chunks, totalSize);
			const treeShakingOpportunities = this.findTreeShakingOpportunities(chunks);

			return {
				totalSize,
				gzippedSize: totalGzippedSize,
				chunks,
				recommendations,
				treeShakingOpportunities,
			};
		} catch (error) {
			throw new Error(`Bundle analysis failed: ${error}`);
		}
	}
	private async analyzeChunkModules(content: string): Promise<ModuleAnalysis[]> {
		// Simplified module analysis - in real implementation would use AST parsing
		const modules: ModuleAnalysis[] = [];
		const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
		const requireRegex = /require\(['"](.+?)['"]\)/g;

		let match;
		const importedModules = new Set<string>();

		while ((match = importRegex.exec(content)) !== null) {
			importedModules.add(match[1]);
		}

		while ((match = requireRegex.exec(content)) !== null) {
			importedModules.add(match[1]);
		}

		for (const module of importedModules) {
			modules.push({
				name: module,
				size: this.estimateModuleSize(module, content),
				imported: true,
				used: this.isModuleUsed(module, content),
			});
		}

		return modules;
	}

	private estimateModuleSize(moduleName: string, content: string): number {
		// Estimate based on occurrences - simplified approach
		const occurrences = (content.match(new RegExp(moduleName, "g")) || []).length;
		return occurrences * 100; // Rough estimation
	}
	private isModuleUsed(moduleName: string, content: string): boolean {
		// Check if module exports are actually used
		const moduleUsageRegex = new RegExp(`${moduleName}\\.[a-zA-Z_$][a-zA-Z0-9_$]*`, "g");
		return moduleUsageRegex.test(content);
	}

	private generateRecommendations(chunks: ChunkAnalysis[], totalSize: number): OptimizationRecommendation[] {
		const recommendations: OptimizationRecommendation[] = [];

		// Large bundle warning
		if (totalSize > 500 * 1024) {
			// 500KB
			recommendations.push({
				type: "code-splitting",
				severity: "high",
				description: "Bundle size exceeds 500KB. Consider implementing route-based code splitting.",
				estimatedSavings: totalSize * 0.3,
			});
		}

		// Large chunks detection
		for (const chunk of chunks) {
			if (chunk.size > 200 * 1024) {
				// 200KB
				recommendations.push({
					type: "code-splitting",
					severity: "medium",
					description: `Chunk ${chunk.name} is large (${Math.round(chunk.size / 1024)}KB). Consider splitting.`,
					estimatedSavings: chunk.size * 0.4,
				});
			}
		}

		return recommendations;
	}
	private findTreeShakingOpportunities(chunks: ChunkAnalysis[]): TreeShakingOpportunity[] {
		const opportunities: TreeShakingOpportunity[] = [];

		for (const chunk of chunks) {
			for (const module of chunk.modules) {
				if (module.imported && !module.used) {
					opportunities.push({
						module: module.name,
						unusedExports: ["default"], // Simplified - would need AST analysis for real detection
						estimatedSavings: module.size,
					});
				}
			}
		}

		return opportunities.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
	}

	/**
	 * Generate bundle optimization report
	 */
	async generateReport(analysis: BundleAnalysis): Promise<void> {
		const reportPath = path.join(this.outputDir, "bundle-analysis-report.json");

		await fs.mkdir(this.outputDir, { recursive: true });
		await fs.writeFile(reportPath, JSON.stringify(analysis, null, 2));

		// Generate human-readable report
		const readableReport = this.generateReadableReport(analysis);
		const readableReportPath = path.join(this.outputDir, "bundle-analysis-report.md");
		await fs.writeFile(readableReportPath, readableReport);
	}

	private generateReadableReport(analysis: BundleAnalysis): string {
		const { totalSize, gzippedSize, chunks, recommendations, treeShakingOpportunities } = analysis;

		let report = "# Bundle Analysis Report\n\n";
		report += "## Summary\n";
		report += `- **Total Size**: ${Math.round(totalSize / 1024)}KB\n`;
		report += `- **Gzipped Size**: ${Math.round(gzippedSize / 1024)}KB\n`;
		report += `- **Compression Ratio**: ${Math.round((1 - gzippedSize / totalSize) * 100)}%\n\n`;

		report += "## Chunks Analysis\n";
		for (const chunk of chunks.sort((a, b) => b.size - a.size)) {
			report += `### ${chunk.name}\n`;
			report += `- Size: ${Math.round(chunk.size / 1024)}KB\n`;
			report += `- Gzipped: ${Math.round(chunk.gzippedSize / 1024)}KB\n`;
			report += `- Modules: ${chunk.modules.length}\n\n`;
		}

		if (recommendations.length > 0) {
			report += "## Optimization Recommendations\n";
			for (const rec of recommendations) {
				report += `### ${rec.type} (${rec.severity})\n`;
				report += `${rec.description}\n`;
				report += `*Estimated savings: ${Math.round(rec.estimatedSavings / 1024)}KB*\n\n`;
			}
		}

		if (treeShakingOpportunities.length > 0) {
			report += "## Tree Shaking Opportunities\n";
			for (const opp of treeShakingOpportunities.slice(0, 10)) {
				report += `- **${opp.module}**: ${Math.round(opp.estimatedSavings / 1024)}KB potential savings\n`;
			}
		}

		return report;
	}
}
