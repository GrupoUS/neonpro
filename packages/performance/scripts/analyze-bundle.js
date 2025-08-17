#!/usr/bin/env node

/**
 * Healthcare Bundle Analysis Script
 * Analyzes webpack bundles for healthcare-specific optimizations
 */

const fs = require('fs');
const path = require('path');
const {
  HealthcareBundleAnalyzer,
} = require('../dist/bundle-analysis/bundle-analyzer');

async function analyzeBundles() {
  try {
    const analyzer = new HealthcareBundleAnalyzer();

    // Look for webpack stats file
    const possibleStatsPaths = [
      path.join(process.cwd(), 'webpack-stats.json'),
      path.join(process.cwd(), '.next', 'bundle-stats.json'),
      path.join(process.cwd(), 'stats.json'),
      path.join(process.cwd(), 'bundle-analyzer-stats.json'),
    ];

    let statsPath = null;
    for (const statsFile of possibleStatsPaths) {
      if (fs.existsSync(statsFile)) {
        statsPath = statsFile;
        break;
      }
    }

    if (!statsPath) {
      return;
    }
    await analyzer.loadStats(`file://${statsPath}`);

    const analysis = analyzer.analyzeBundles();

    // Generate detailed report
    const _report = analyzer.getBundleSizeReport(analysis);

    // Generate optimization script
    const optimizationScript = analyzer.generateOptimizationScript(analysis);
    const optimizationPath = path.join(
      process.cwd(),
      'webpack.healthcare-optimization.js'
    );
    fs.writeFileSync(optimizationPath, optimizationScript);

    // Save detailed analysis
    const analysisPath = path.join(
      process.cwd(),
      'healthcare-bundle-analysis.json'
    );
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));

    const highPriorityRecs = analysis.recommendations.filter(
      (r) => r.priority === 'high'
    );
    if (highPriorityRecs.length > 0) {
      highPriorityRecs.forEach((_rec, _index) => {});
    }
  } catch (_error) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  analyzeBundles();
}

module.exports = { analyzeBundles };
