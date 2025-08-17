/**
 * Bundle Analysis and Optimization for Healthcare Applications
 * Analyzes webpack bundles for healthcare-specific optimizations
 */

import type { BundleAnalysisResult, BundleChunk, BundleRecommendation } from '../types';

type WebpackStats = {
  chunks: Array<{
    id: string;
    names: string[];
    size: number;
    modules: Array<{
      name: string;
      size: number;
      reasons: Array<{
        moduleName: string;
        type: string;
      }>;
    }>;
    initial: boolean;
    async: boolean;
  }>;
  assets: Array<{
    name: string;
    size: number;
    chunks: string[];
  }>;
  modules: Array<{
    name: string;
    size: number;
    chunks: string[];
    reasons: Array<{
      moduleName: string;
      type: string;
    }>;
  }>;
};

export class HealthcareBundleAnalyzer {
  private readonly stats: WebpackStats | null = null;
  private readonly healthcareModules = new Set([
    'medical-form',
    'patient-data',
    'appointment',
    'billing',
    'medication',
    'diagnosis',
    'procedure',
    'vital-signs',
    'lab-results',
    'imaging',
    'prescription',
    'compliance',
    'audit',
    'security',
    'encryption',
  ]);

  /**
   * Load webpack stats for analysis
   */
  async loadStats(statsPath: string): Promise<void> {
    try {
      const response = await fetch(statsPath);
      this.stats = await response.json();
    } catch (_error) {
      throw new Error(`Unable to load bundle stats from ${statsPath}`);
    }
  }

  /**
   * Analyze bundle for healthcare optimizations
   */
  analyzeBundles(): BundleAnalysisResult {
    if (!this.stats) {
      throw new Error('Stats not loaded. Call loadStats() first.');
    }

    const chunks = this.analyzeChunks();
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const gzippedSize = Math.round(totalSize * 0.3); // Approximate gzip ratio
    const recommendations = this.generateRecommendations(chunks);
    const healthcareOptimized = this.assessHealthcareOptimization(chunks);

    return {
      totalSize,
      gzippedSize,
      chunks,
      recommendations,
      healthcareOptimized,
    };
  }

  /**
   * Analyze individual chunks
   */
  private analyzeChunks(): BundleChunk[] {
    if (!this.stats) {
      return [];
    }

    return this.stats.chunks.map((chunk) => ({
      name: chunk.names[0] || chunk.id,
      size: chunk.size,
      gzippedSize: Math.round(chunk.size * 0.3),
      modules: chunk.modules.map((module) => module.name),
      isAsync: chunk.async,
      isInitial: chunk.initial,
      healthcareCritical: this.isHealthcareCritical(chunk),
    }));
  }

  /**
   * Check if chunk contains healthcare-critical code
   */
  private isHealthcareCritical(chunk: any): boolean {
    return chunk.modules.some((module: any) =>
      this.healthcareModules.some((healthcareModule) =>
        module.name.toLowerCase().includes(healthcareModule)
      )
    );
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(chunks: BundleChunk[]): BundleRecommendation[] {
    const recommendations: BundleRecommendation[] = [];

    // Check for large chunks
    chunks.forEach((chunk) => {
      if (chunk.size > 500_000) {
        // 500KB
        recommendations.push({
          type: 'code-splitting',
          description: `Chunk "${chunk.name}" is large (${Math.round(chunk.size / 1024)}KB). Consider splitting into smaller chunks.`,
          potentialSavings: Math.round(chunk.size * 0.5),
          priority: chunk.healthcareCritical ? 'high' : 'medium',
        });
      }

      if (chunk.size > 200_000 && chunk.isInitial && !chunk.healthcareCritical) {
        recommendations.push({
          type: 'lazy-loading',
          description: `Chunk "${chunk.name}" could be lazy-loaded to improve initial bundle size.`,
          potentialSavings: chunk.size,
          priority: 'medium',
        });
      }
    });

    // Check for duplicate modules
    const moduleMap = new Map<string, string[]>();
    chunks.forEach((chunk) => {
      chunk.modules.forEach((module) => {
        if (!moduleMap.has(module)) {
          moduleMap.set(module, []);
        }
        moduleMap.get(module)?.push(chunk.name);
      });
    });

    moduleMap.forEach((chunkNames, module) => {
      if (chunkNames.length > 1 && module.includes('node_modules')) {
        const moduleName = module.split('/').pop() || module;
        recommendations.push({
          type: 'tree-shaking',
          description: `Module "${moduleName}" appears in multiple chunks: ${chunkNames.join(', ')}. Consider extracting to a shared chunk.`,
          potentialSavings: 50_000, // Estimated
          priority: 'medium',
        });
      }
    });

    // Healthcare-specific recommendations
    this.addHealthcareRecommendations(chunks, recommendations);

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Add healthcare-specific recommendations
   */
  private addHealthcareRecommendations(
    chunks: BundleChunk[],
    recommendations: BundleRecommendation[]
  ): void {
    // Healthcare modules should be prioritized in critical chunks
    const healthcareChunks = chunks.filter((chunk) => chunk.healthcareCritical);
    const nonHealthcareChunks = chunks.filter(
      (chunk) => !chunk.healthcareCritical && chunk.isInitial
    );

    if (nonHealthcareChunks.length > 0 && healthcareChunks.length > 0) {
      const nonHealthcareSize = nonHealthcareChunks.reduce((sum, chunk) => sum + chunk.size, 0);
      if (nonHealthcareSize > 300_000) {
        // 300KB
        recommendations.push({
          type: 'lazy-loading',
          description:
            'Non-healthcare modules in initial bundle should be lazy-loaded to prioritize medical workflows.',
          potentialSavings: nonHealthcareSize,
          priority: 'high',
        });
      }
    }

    // Medical form components should be preloaded
    const hasFormComponents = chunks.some((chunk) =>
      chunk.modules.some(
        (module) =>
          module.includes('form') || module.includes('input') || module.includes('medical')
      )
    );

    if (hasFormComponents) {
      recommendations.push({
        type: 'code-splitting',
        description:
          'Medical form components should be in a separate preloadable chunk for faster form rendering.',
        potentialSavings: 100_000, // Estimated
        priority: 'high',
      });
    }
  }

  /**
   * Assess overall healthcare optimization
   */
  private assessHealthcareOptimization(chunks: BundleChunk[]): boolean {
    const healthcareChunks = chunks.filter((chunk) => chunk.healthcareCritical);
    const totalHealthcareSize = healthcareChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);

    // Healthcare modules should not dominate the initial bundle
    const healthcareRatio = totalHealthcareSize / totalSize;

    // Good optimization: healthcare modules are reasonably sized and properly split
    return healthcareRatio < 0.6 && healthcareChunks.length > 1;
  }

  /**
   * Generate bundle optimization script
   */
  generateOptimizationScript(analysis: BundleAnalysisResult): string {
    const script = `
// Healthcare Bundle Optimization Configuration
// Generated on ${new Date().toISOString()}

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Healthcare-critical modules
        healthcare: {
          name: 'healthcare',
          test: /[\\/]src[\\/](components|features)[\\/](medical|patient|appointment|billing)/,
          priority: 30,
          chunks: 'all'
        },
        
        // Medical forms (should be preloadable)
        medicalForms: {
          name: 'medical-forms',
          test: /[\\/]src[\\/]components[\\/]forms[\\/]/,
          priority: 25,
          chunks: 'all'
        },
        
        // UI components (can be lazy loaded)
        ui: {
          name: 'ui',
          test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
          priority: 20,
          chunks: 'async'
        },
        
        // Vendor libraries
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'all',
          maxSize: 500000 // 500KB max
        }
      }
    }
  }
};

// Recommendations implemented:
${analysis.recommendations.map((rec) => `// - ${rec.description}`).join('\n')}
`;

    return script;
  }

  /**
   * Get bundle size report
   */
  getBundleSizeReport(analysis: BundleAnalysisResult): string {
    const formatSize = (bytes: number) => {
      const kb = bytes / 1024;
      return kb > 1024 ? `${(kb / 1024).toFixed(2)}MB` : `${kb.toFixed(2)}KB`;
    };

    const report = `
🏥 HEALTHCARE BUNDLE ANALYSIS REPORT
=====================================

📊 Bundle Overview:
- Total Size: ${formatSize(analysis.totalSize)}
- Gzipped Size: ${formatSize(analysis.gzippedSize)}
- Healthcare Optimized: ${analysis.healthcareOptimized ? '✅ Yes' : '❌ No'}

📦 Chunk Analysis:
${analysis.chunks
  .map(
    (chunk) => `
- ${chunk.name}: ${formatSize(chunk.size)} (${chunk.healthcareCritical ? '🏥 Healthcare Critical' : '📦 General'})
  ${chunk.isInitial ? '⚡ Initial Load' : '🔄 Async Load'}
`
  )
  .join('')}

🎯 Optimization Recommendations:
${analysis.recommendations
  .map(
    (rec, index) => `
${index + 1}. [${rec.priority.toUpperCase()}] ${rec.description}
   💾 Potential Savings: ${formatSize(rec.potentialSavings)}
   🔧 Type: ${rec.type}
`
  )
  .join('')}

${
  analysis.healthcareOptimized
    ? '✅ Bundle is well-optimized for healthcare workflows!'
    : '⚠️  Bundle needs optimization for healthcare use cases.'
}
`;

    return report;
  }
}

export default HealthcareBundleAnalyzer;
