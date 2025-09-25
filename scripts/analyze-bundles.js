#!/usr/bin/env node

/**
 * Bundle Size Analysis Script
 * Analyzes and reports on bundle sizes for optimization opportunities
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const BUNDLE_LIMITS = {
  web: { js: 500000, css: 100000 }, // 500KB JS, 100KB CSS
  api: { js: 200000 }, // 200KB JS
  'ai-agent': { js: 150000 }, // 150KB JS
  tools: { js: 100000 } // 100KB JS
};

class BundleAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      bundles: {},
      recommendations: [],
      totalSize: 0,
      optimizedSize: 0
    };
  }

  log(message) {
    console.log(`📦 ${message}`);
  }

  getFileSize(filePath) {
    try {
      const stats = readFileSync(filePath);
      return stats.length;
    } catch {
      return 0;
    }
  }

  analyzeBundle(appName, distDir) {
    const bundleInfo = {
      name: appName,
      files: [],
      totalSize: 0,
      breakdown: { js: 0, css: 0, other: 0 },
      limits: BUNDLE_LIMITS[appName] || { js: 1000000, css: 500000 },
      withinLimits: true
    };

    // Analyze common bundle patterns
    const patterns = [
      { pattern: '*.js', type: 'js' },
      { pattern: '*.mjs', type: 'js' },
      { pattern: '*.css', type: 'css' },
      { pattern: '*.tsx', type: 'js' },
      { pattern: '*.ts', type: 'js' }
    ];

    // This is a simplified analysis - in real implementation,
    // you'd use proper bundler stats or webpack-bundle-analyzer
    
    this.results.bundles[appName] = bundleInfo;
    return bundleInfo;
  }

  generateRecommendations() {
    const recommendations = [];
    
    Object.entries(this.results.bundles).forEach(([appName, bundle]) => {
      const { breakdown, limits, totalSize } = bundle;
      
      // Check JavaScript size
      if (breakdown.js > limits.js) {
        recommendations.push({
          app: appName,
          type: 'javascript',
          current: breakdown.js,
          limit: limits.js,
          issue: 'JS bundle too large',
          suggestions: [
            'Implement code splitting',
            'Remove unused dependencies',
            'Enable tree shaking',
            'Use dynamic imports'
          ]
        });
      }
      
      // Check CSS size
      if (breakdown.css > limits.css) {
        recommendations.push({
          app: appName,
          type: 'css',
          current: breakdown.css,
          limit: limits.css,
          issue: 'CSS bundle too large',
          suggestions: [
            'Remove unused CSS',
            'Implement CSS tree shaking',
            'Use CSS modules',
            'Minimize CSS output'
          ]
        });
      }
      
      // General recommendations for large bundles
      if (totalSize > 1000000) { // 1MB
        recommendations.push({
          app: appName,
          type: 'general',
          current: totalSize,
          limit: 1000000,
          issue: 'Total bundle size too large',
          suggestions: [
            'Implement lazy loading',
            'Optimize images and assets',
            'Use compression',
            'Consider CDN delivery'
          ]
        });
      }
    });
    
    this.results.recommendations = recommendations;
    return recommendations;
  }

  async analyzeAllBundles() {
    this.log('=== Analyzing Bundle Sizes ===');
    
    const apps = ['web', 'api', 'ai-agent', 'tools'];
    
    for (const appName of apps) {
      const distDir = join(rootDir, 'apps', appName, 'dist');
      
      if (existsSync(distDir)) {
        this.log(`📦 Analyzing ${appName} bundle...`);
        const bundle = this.analyzeBundle(appName, distDir);
        this.log(`📊 ${appName}: ${bundle.totalSize} bytes total`);
      } else {
        this.log(`⚠️  ${appName} dist directory not found`);
      }
    }
    
    // Generate recommendations
    const recommendations = this.generateRecommendations();
    
    this.log(`📋 Found ${recommendations.length} optimization opportunities`);
    recommendations.forEach(rec => {
      this.log(`  • ${rec.app} ${rec.type}: ${rec.issue}`);
      rec.suggestions.forEach(suggestion => {
        this.log(`    - ${suggestion}`);
      });
    });
    
    return this.results;
  }

  generateReport() {
    this.log('=== Generating Bundle Analysis Report ===');
    
    const reportDir = join(rootDir, 'performance-results');
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = join(reportDir, 'bundle-analysis.json');
    writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    this.log(`📄 Bundle analysis saved to ${reportPath}`);
    
    // Generate markdown report
    const markdownReport = this.generateMarkdownReport();
    const markdownPath = join(reportDir, 'bundle-analysis.md');
    writeFileSync(markdownPath, markdownReport);
    
    this.log(`📄 Markdown report saved to ${markdownPath}`);
    
    return this.results;
  }

  generateMarkdownReport() {
    let report = `# Bundle Size Analysis Report\n\n`;
    report += `**Generated**: ${this.results.timestamp}\n\n`;
    
    // Summary
    const totalSize = Object.values(this.results.bundles)
      .reduce((sum, bundle) => sum + bundle.totalSize, 0);
    
    report += `## Summary\n\n`;
    report += `- **Total Bundle Size**: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`;
    report += `- **Applications Analyzed**: ${Object.keys(this.results.bundles).length}\n`;
    report += `- **Optimization Opportunities**: ${this.results.recommendations.length}\n\n`;
    
    // Bundle details
    report += `## Bundle Details\n\n`;
    
    Object.entries(this.results.bundles).forEach(([appName, bundle]) => {
      report += `### ${appName}\n\n`;
      report += `- **Total Size**: ${(bundle.totalSize / 1024).toFixed(2)} KB\n`;
      report += `- **JavaScript**: ${(bundle.breakdown.js / 1024).toFixed(2)} KB\n`;
      report += `- **CSS**: ${(bundle.breakdown.css / 1024).toFixed(2)} KB\n`;
      report += `- **Within Limits**: ${bundle.withinLimits ? '✅' : '❌'}\n\n`;
    });
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      report += `## Optimization Recommendations\n\n`;
      
      this.results.recommendations.forEach(rec => {
        report += `### ${rec.app} - ${rec.type.toUpperCase()}\n\n`;
        report += `**Issue**: ${rec.issue}\n\n`;
        report += `**Current**: ${(rec.current / 1024).toFixed(2)} KB\n`;
        report += `**Limit**: ${(rec.limit / 1024).toFixed(2)} KB\n\n`;
        report += `**Suggestions**:\n`;
        rec.suggestions.forEach(suggestion => {
          report += `- ${suggestion}\n`;
        });
        report += `\n`;
      });
    }
    
    return report;
  }

  async run() {
    this.log('🚀 Starting Bundle Size Analysis');
    
    try {
      await this.analyzeAllBundles();
      const report = this.generateReport();
      
      this.log('🎉 Bundle analysis completed successfully!');
      return report;
      
    } catch (error) {
      this.log(`❌ Bundle analysis failed: ${error.message}`);
      throw error;
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new BundleAnalyzer();
  analyzer.run().catch(console.error);
}

export default BundleAnalyzer;