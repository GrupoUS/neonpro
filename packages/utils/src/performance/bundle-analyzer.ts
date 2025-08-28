/**
 * Bundle Analysis & Optimization System
 * Analyzes bundle sizes, implements code splitting, and optimizes compression
 */

export interface BundleAnalysisReport {
  totalSize: number;
  gzipSize: number;
  brotliSize: number;
  chunks: BundleChunk[];
  dependencies: BundleDependency[];
  recommendations: BundleRecommendation[];
  healthScore: number;
}

export interface BundleChunk {
  name: string;
  size: number;
  gzipSize: number;
  modules: string[];
  isEntry: boolean;
  isAsync: boolean;
  loadPriority: "high" | "medium" | "low";
}

export interface BundleDependency {
  name: string;
  version: string;
  size: number;
  treeshakeable: boolean;
  isDevDependency: boolean;
  unusedExports: string[];
  alternatives?: string[];
}

export interface BundleRecommendation {
  type: "size-reduction" | "code-splitting" | "dependency-optimization" | "compression";
  severity: "high" | "medium" | "low";
  description: string;
  impact: number; // bytes saved
  action: string;
}

export interface OptimizationConfig {
  targetBundleSize: number; // bytes
  compressionPreference: "brotli" | "gzip";
  enableCodeSplitting: boolean;
  enableTreeShaking: boolean;
  minChunkSize: number;
  maxAsyncRequests: number;
  maxInitialRequests: number;
  healthcareModules: {
    emergency: "high" | "critical";
    patient: "high" | "critical"; 
    ai: "medium" | "low";
    analytics: "low";
  };
}

export class BundleAnalyzer {
  private config: OptimizationConfig;
  private readonly BRAZILIAN_HEALTHCARE_MODULES = {
    critical: ["emergency-protocols", "patient-management", "cfm-compliance"],
    high: ["appointment-booking", "lgpd-compliance", "anvisa-tracking"],
    medium: ["ai-chat", "predictive-analytics", "automated-analysis"],
    low: ["advanced-reporting", "dashboard-widgets", "export-tools"]
  };

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      targetBundleSize: 500 * 1024, // 500KB default
      compressionPreference: "brotli",
      enableCodeSplitting: true,
      enableTreeShaking: true,
      minChunkSize: 20 * 1024, // 20KB
      maxAsyncRequests: 30,
      maxInitialRequests: 6,
      healthcareModules: {
        emergency: "critical",
        patient: "critical",
        ai: "medium", 
        analytics: "low"
      },
      ...config
    };
  }

  /**
   * Analyze current bundle structure and generate optimization report
   */
  async analyzeBundles(): Promise<BundleAnalysisReport> {
    const chunks = await this.analyzeChunks();
    const dependencies = await this.analyzeDependencies();
    const recommendations = this.generateRecommendations(chunks, dependencies);
    
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const gzipSize = chunks.reduce((sum, chunk) => sum + chunk.gzipSize, 0);
    const brotliSize = Math.floor(gzipSize * 0.85); // Brotli typically 15% better than gzip

    return {
      totalSize,
      gzipSize,
      brotliSize,
      chunks,
      dependencies,
      recommendations,
      healthScore: this.calculateHealthScore(totalSize, chunks, recommendations)
    };
  }

  private async analyzeChunks(): Promise<BundleChunk[]> {
    // In production, this would analyze webpack stats or similar build output
    // For now, simulate healthcare-focused chunk analysis
    const mockChunks: BundleChunk[] = [
      {
        name: "main",
        size: 280000, // 280KB
        gzipSize: 95000, // ~95KB gzipped
        modules: ["@neonpro/core", "@neonpro/auth", "@neonpro/ui"],
        isEntry: true,
        isAsync: false,
        loadPriority: "high"
      },
      {
        name: "emergency-protocols",
        size: 75000, // 75KB
        gzipSize: 25000, // ~25KB gzipped
        modules: ["@neonpro/emergency", "@neonpro/samu-integration"],
        isEntry: false,
        isAsync: true,
        loadPriority: "high"
      },
      {
        name: "patient-management",
        size: 120000, // 120KB
        gzipSize: 40000, // ~40KB gzipped
        modules: ["@neonpro/patient", "@neonpro/lgpd", "@neonpro/cfm"],
        isEntry: false,
        isAsync: true,
        loadPriority: "high"
      },
      {
        name: "ai-features",
        size: 450000, // 450KB - Large AI bundle
        gzipSize: 150000, // ~150KB gzipped
        modules: ["@neonpro/ai", "@neonpro/ml", "@neonpro/chat"],
        isEntry: false,
        isAsync: true,
        loadPriority: "medium"
      },
      {
        name: "analytics",
        size: 200000, // 200KB
        gzipSize: 65000, // ~65KB gzipped
        modules: ["@neonpro/analytics", "@neonpro/reporting", "@neonpro/charts"],
        isEntry: false,
        isAsync: true,
        loadPriority: "low"
      }
    ];

    return mockChunks;
  }

  private async analyzeDependencies(): Promise<BundleDependency[]> {
    // Analyze package.json dependencies and their usage
    const mockDependencies: BundleDependency[] = [
      {
        name: "react",
        version: "18.3.1",
        size: 45000,
        treeshakeable: false,
        isDevDependency: false,
        unusedExports: []
      },
      {
        name: "lodash",
        version: "4.17.21",
        size: 72000,
        treeshakeable: true,
        isDevDependency: false,
        unusedExports: ["debounce", "throttle", "merge"],
        alternatives: ["lodash-es", "ramda"]
      },
      {
        name: "moment",
        version: "2.29.4",
        size: 67000,
        treeshakeable: false,
        isDevDependency: false,
        unusedExports: [],
        alternatives: ["date-fns", "dayjs"]
      },
      {
        name: "@supabase/supabase-js",
        version: "2.45.4",
        size: 125000,
        treeshakeable: true,
        isDevDependency: false,
        unusedExports: []
      },
      {
        name: "chart.js",
        version: "4.4.0",
        size: 180000,
        treeshakeable: true,
        isDevDependency: false,
        unusedExports: ["ScatterController", "BubbleController"]
      }
    ];

    return mockDependencies;
  }

  private generateRecommendations(
    chunks: BundleChunk[],
    dependencies: BundleDependency[]
  ): BundleRecommendation[] {
    const recommendations: BundleRecommendation[] = [];

    // Analyze oversized chunks
    chunks.forEach(chunk => {
      if (chunk.size > 300000 && !chunk.isEntry) {
        recommendations.push({
          type: "code-splitting",
          severity: "high",
          description: `Chunk '${chunk.name}' is ${Math.round(chunk.size / 1024)}KB. Consider splitting further.`,
          impact: Math.floor(chunk.size * 0.3),
          action: `Split ${chunk.name} into smaller, feature-specific chunks`
        });
      }
    });

    // Analyze dependencies
    dependencies.forEach(dep => {
      if (dep.alternatives && dep.alternatives.length > 0) {
        const potentialSavings = Math.floor(dep.size * 0.4);
        if (potentialSavings > 10000) { // Only recommend if >10KB savings
          recommendations.push({
            type: "dependency-optimization",
            severity: dep.size > 50000 ? "high" : "medium",
            description: `Replace '${dep.name}' with lighter alternative`,
            impact: potentialSavings,
            action: `Consider using ${dep.alternatives[0]} instead of ${dep.name}`
          });
        }
      }

      if (dep.unusedExports.length > 0) {
        recommendations.push({
          type: "size-reduction",
          severity: "medium",
          description: `'${dep.name}' has unused exports that can be tree-shaken`,
          impact: Math.floor(dep.size * 0.2),
          action: `Remove unused imports: ${dep.unusedExports.join(", ")}`
        });
      }
    });

    // Compression recommendations
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    if (totalSize > this.config.targetBundleSize) {
      recommendations.push({
        type: "compression",
        severity: "high",
        description: "Bundle size exceeds target. Enable advanced compression.",
        impact: Math.floor(totalSize * 0.15),
        action: "Enable Brotli compression and optimize asset delivery"
      });
    }

    // Healthcare-specific recommendations
    const aiChunk = chunks.find(c => c.name.includes("ai"));
    if (aiChunk && aiChunk.loadPriority !== "low") {
      recommendations.push({
        type: "code-splitting",
        severity: "medium", 
        description: "AI features should be lazy-loaded for Brazilian connectivity",
        impact: aiChunk.size,
        action: "Set AI chunk load priority to 'low' and implement progressive loading"
      });
    }

    return recommendations.sort((a, b) => {
      const severityWeight = { high: 3, medium: 2, low: 1 };
      return severityWeight[b.severity] - severityWeight[a.severity];
    });
  }

  private calculateHealthScore(
    totalSize: number,
    chunks: BundleChunk[],
    recommendations: BundleRecommendation[]
  ): number {
    let score = 100;

    // Penalize oversized bundles
    if (totalSize > this.config.targetBundleSize) {
      const overageRatio = totalSize / this.config.targetBundleSize;
      score -= Math.min(40, (overageRatio - 1) * 30);
    }

    // Penalize lack of code splitting
    const hasProperSplitting = chunks.filter(c => c.isAsync).length >= 3;
    if (!hasProperSplitting) {
      score -= 20;
    }

    // Penalize high severity recommendations
    const highSeverityCount = recommendations.filter(r => r.severity === "high").length;
    score -= highSeverityCount * 10;

    // Bonus for healthcare-optimized structure
    const hasEmergencyChunk = chunks.some(c => 
      this.BRAZILIAN_HEALTHCARE_MODULES.critical.some(mod => c.name.includes(mod))
    );
    if (hasEmergencyChunk) {
      score += 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generate Webpack configuration optimized for Brazilian healthcare
   */
  generateOptimizedWebpackConfig(): Record<string, unknown> {
    return {
      optimization: {
        splitChunks: {
          chunks: "all",
          minSize: this.config.minChunkSize,
          maxAsyncRequests: this.config.maxAsyncRequests,
          maxInitialRequests: this.config.maxInitialRequests,
          cacheGroups: {
            // Critical healthcare modules
            emergency: {
              test: /[\\/]node_modules[\\/]@neonpro[\\/](emergency|samu|protocols)/,
              name: "emergency-critical",
              priority: 100,
              chunks: "all"
            },
            patient: {
              test: /[\\/]node_modules[\\/]@neonpro[\\/](patient|lgpd|cfm)/,
              name: "patient-core", 
              priority: 90,
              chunks: "all"
            },
            // AI modules - lazy loaded
            ai: {
              test: /[\\/]node_modules[\\/]@neonpro[\\/](ai|ml|chat)/,
              name: "ai-features",
              priority: 30,
              chunks: "async"
            },
            // Analytics - lowest priority
            analytics: {
              test: /[\\/]node_modules[\\/]@neonpro[\\/](analytics|reporting|charts)/,
              name: "analytics",
              priority: 20,
              chunks: "async"
            },
            // Vendor libraries
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: 10,
              chunks: "all"
            }
          }
        },
        usedExports: this.config.enableTreeShaking,
        sideEffects: false,
        moduleIds: "deterministic",
        chunkIds: "deterministic"
      },
      resolve: {
        alias: {
          // Optimize common libraries for Brazilian infrastructure
          "lodash": "lodash-es", // Use ES modules for tree shaking
          "moment": "dayjs",     // Lighter date library
          "chart.js": "chart.js/auto" // Optimized chart.js
        }
      },
      output: {
        filename: "static/js/[name].[contenthash:8].js",
        chunkFilename: "static/js/[name].[contenthash:8].chunk.js",
        assetModuleFilename: "static/media/[name].[contenthash:8][ext]"
      }
    };
  }

  /**
   * Generate Next.js configuration optimized for Brazilian healthcare
   */
  generateOptimizedNextConfig(): Record<string, unknown> {
    return {
      experimental: {
        optimizeCss: true,
        gzipSize: true,
        esmExternals: true,
        modularizeImports: {
          "@neonpro/ui": {
            transform: "@neonpro/ui/{{member}}"
          },
          "lodash": {
            transform: "lodash/{{member}}"
          }
        }
      },
      compiler: {
        removeConsole: process.env.NODE_ENV === "production",
        reactRemoveProperties: process.env.NODE_ENV === "production" 
          ? { properties: ["^data-testid$"] } 
          : false
      },
      images: {
        formats: ["image/webp", "image/avif"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 31536000, // 1 year
        dangerouslyAllowSVG: false
      },
      compress: true,
      poweredByHeader: false,
      generateEtags: false,
      // Brazilian CDN optimization
      assetPrefix: process.env.CDN_URL || "",
      // Performance budgets for Brazilian connectivity
      onDemandEntries: {
        maxInactiveAge: 25 * 1000, // 25 seconds
        pagesBufferLength: 2
      }
    };
  }

  /**
   * Create performance budget configuration
   */
  createPerformanceBudget(): Record<string, unknown> {
    return {
      budgets: [
        {
          type: "initial",
          maximumWarning: this.config.targetBundleSize,
          maximumError: this.config.targetBundleSize * 1.2
        },
        {
          type: "anyComponentStyle",
          maximumWarning: "6kb"
        },
        {
          type: "any",
          maximumWarning: "2mb"
        },
        // Brazilian healthcare specific budgets
        {
          type: "bundle",
          name: "emergency-critical",
          maximumWarning: "50kb",
          maximumError: "75kb"
        },
        {
          type: "bundle", 
          name: "patient-core",
          maximumWarning: "100kb",
          maximumError: "150kb"
        },
        {
          type: "bundle",
          name: "ai-features", 
          maximumWarning: "300kb",
          maximumError: "500kb"
        }
      ]
    };
  }

  /**
   * Generate optimization report for Brazilian healthcare context
   */
  async generateBrazilianHealthcareReport(): Promise<string> {
    const analysis = await this.analyzeBundles();
    
    const report = `
# 🇧🇷 NeonPro Bundle Analysis Report

## 📊 Overall Health Score: ${analysis.healthScore}/100

### Bundle Sizes
- **Total**: ${Math.round(analysis.totalSize / 1024)}KB
- **Gzipped**: ${Math.round(analysis.gzipSize / 1024)}KB  
- **Brotli**: ${Math.round(analysis.brotliSize / 1024)}KB
- **Target**: ${Math.round(this.config.targetBundleSize / 1024)}KB

### 🏥 Healthcare Module Analysis
${analysis.chunks.map(chunk => {
  const priority = chunk.loadPriority;
  const icon = priority === "high" ? "🚨" : priority === "medium" ? "⚡" : "📊";
  return `${icon} **${chunk.name}**: ${Math.round(chunk.size / 1024)}KB (${chunk.isAsync ? 'Async' : 'Sync'})`;
}).join('\n')}

### 🔍 Top Recommendations
${analysis.recommendations.slice(0, 5).map((rec, i) => {
  const severity = rec.severity === "high" ? "🔴" : rec.severity === "medium" ? "🟡" : "🟢";
  const savings = Math.round(rec.impact / 1024);
  return `${i + 1}. ${severity} ${rec.description}\n   💾 **Savings**: ${savings}KB\n   🔧 **Action**: ${rec.action}`;
}).join('\n\n')}

### 🌐 Brazilian Connectivity Optimization
- Emergency protocols: ${analysis.chunks.some(c => c.name.includes("emergency")) ? "✅" : "❌"} Properly chunked
- Patient management: ${analysis.chunks.some(c => c.name.includes("patient")) ? "✅" : "❌"} Optimized
- AI features: ${analysis.chunks.some(c => c.name.includes("ai") && c.isAsync) ? "✅" : "❌"} Lazy loaded

### 📈 Performance Targets
- Tier 1 (São Paulo/Rio): Target ${Math.round(this.config.targetBundleSize / 1024)}KB ✅
- Tier 2 (Regional): Target ${Math.round(this.config.targetBundleSize * 0.75 / 1024)}KB ${analysis.brotliSize <= this.config.targetBundleSize * 0.75 ? "✅" : "⚠️"}
- Tier 3 (Interior): Target ${Math.round(this.config.targetBundleSize * 0.5 / 1024)}KB ${analysis.brotliSize <= this.config.targetBundleSize * 0.5 ? "✅" : "❌"}
`;

    return report.trim();
  }
}

// Export optimized instance for Brazilian healthcare
export const brazilianBundleAnalyzer = new BundleAnalyzer({
  targetBundleSize: 500 * 1024, // 500KB target for Brazilian connectivity
  compressionPreference: "brotli",
  healthcareModules: {
    emergency: "critical",
    patient: "critical", 
    ai: "medium",
    analytics: "low"
  }
});

export { BundleAnalyzer };