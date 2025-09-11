#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const gzipSize = require('gzip-size');

class BundleAnalyzer {
  constructor() {
    this.buildDir = path.join(process.cwd(), 'apps/web/dist');
    this.reportPath = path.join(process.cwd(), 'bundle-analysis.json');
  }

  async analyze() {
    console.log('🔍 Analyzing bundle sizes...');

    const results = {
      timestamp: new Date().toISOString(),
      bundles: [],
      summary: {
        totalSize: 0,
        totalGzipSize: 0,
        chunkCount: 0,
        largestChunk: null,
        warnings: []
      }
    };

    try {
      const files = this.getJSFiles();
      
      for (const file of files) {
        const filePath = path.join(this.buildDir, file);
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath);
        const gzipedSize = await gzipSize(content);

        const bundle = {
          name: file,
          size: stats.size,
          gzipSize: gzipedSize,
          ratio: gzipedSize / stats.size
        };

        results.bundles.push(bundle);
        results.summary.totalSize += stats.size;
        results.summary.totalGzipSize += gzipedSize;
        results.summary.chunkCount++;

        // Track largest chunk
        if (!results.summary.largestChunk || gzipedSize > results.summary.largestChunk.gzipSize) {
          results.summary.largestChunk = bundle;
        }

        // Performance warnings
        if (gzipedSize > 180 * 1024) { // 180KB threshold
          results.summary.warnings.push({
            type: 'large-bundle',
            file: file,
            size: gzipedSize,
            threshold: 180 * 1024,
            message: `Bundle ${file} exceeds 180KB gzipped (${Math.round(gzipedSize / 1024)}KB)`
          });
        }
      }

      // Generate recommendations
      results.recommendations = this.generateRecommendations(results);

      // Save report
      fs.writeFileSync(this.reportPath, JSON.stringify(results, null, 2));

      this.printReport(results);
      return results;

    } catch (error) {
      console.error('Bundle analysis failed:', error);
      throw error;
    }
  }

  getJSFiles() {
    if (!fs.existsSync(this.buildDir)) {
      throw new Error(`Build directory not found: ${this.buildDir}`);
    }

    return fs.readdirSync(this.buildDir)
      .filter(file => file.endsWith('.js'))
      .filter(file => !file.includes('.map'));
  }

  generateRecommendations(results) {
    const recommendations = [];

    // Large bundle recommendations
    const largeBundles = results.bundles.filter(b => b.gzipSize > 180 * 1024);
    if (largeBundles.length > 0) {
      recommendations.push({
        category: 'bundle-size',
        priority: 'high',
        title: 'Split large bundles',
        description: 'Consider code splitting for bundles over 180KB',
        bundles: largeBundles.map(b => b.name)
      });
    }

    // Total size recommendations
    if (results.summary.totalGzipSize > 1024 * 1024) { // 1MB
      recommendations.push({
        category: 'total-size',
        priority: 'medium',
        title: 'Reduce total bundle size',
        description: 'Total bundle size exceeds 1MB, consider lazy loading'
      });
    }

    // Compression ratio recommendations
    const poorCompression = results.bundles.filter(b => b.ratio > 0.8);
    if (poorCompression.length > 0) {
      recommendations.push({
        category: 'compression',
        priority: 'low',
        title: 'Improve compression ratio',
        description: 'Some bundles have poor compression ratios',
        bundles: poorCompression.map(b => b.name)
      });
    }

    return recommendations;
  }

  printReport(results) {
    console.log('\n📊 Bundle Analysis Report');
    console.log('========================');
    console.log(`Total bundles: ${results.summary.chunkCount}`);
    console.log(`Total size: ${Math.round(results.summary.totalSize / 1024)}KB`);
    console.log(`Total gzipped: ${Math.round(results.summary.totalGzipSize / 1024)}KB`);
    
    if (results.summary.largestChunk) {
      console.log(`Largest chunk: ${results.summary.largestChunk.name} (${Math.round(results.summary.largestChunk.gzipSize / 1024)}KB)`);
    }

    if (results.summary.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      results.summary.warnings.forEach(warning => {
        console.log(`  - ${warning.message}`);
      });
    }

    if (results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      results.recommendations.forEach(rec => {
        console.log(`  ${rec.priority.toUpperCase()}: ${rec.title}`);
        console.log(`    ${rec.description}`);
      });
    }

    console.log(`\n📄 Full report saved to: ${this.reportPath}`);
  }
}

// Run analysis
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = BundleAnalyzer;