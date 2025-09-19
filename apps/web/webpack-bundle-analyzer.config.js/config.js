const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Healthcare Performance Budget Configuration
const performanceBudgets = {
  // Critical healthcare workflows must load quickly
  critical: {
    maxSize: 300 * 1024, // 300KB for critical healthcare features
    maxAssets: 10,
    maxAssetSize: 100 * 1024, // 100KB per asset
    warningSize: 250 * 1024, // Warning at 250KB
  },
  // Main application bundle
  main: {
    maxSize: 800 * 1024, // 800KB for main application
    maxAssets: 20,
    maxAssetSize: 200 * 1024, // 200KB per asset
    warningSize: 700 * 1024, // Warning at 700KB
  },
  // Telemedicine features (real-time video)
  telemedicine: {
    maxSize: 500 * 1024, // 500KB for telemedicine features
    maxAssets: 15,
    maxAssetSize: 150 * 1024, // 150KB per asset
    warningSize: 450 * 1024, // Warning at 450KB
  },
  // Patient data management
  patientData: {
    maxSize: 400 * 1024, // 400KB for patient data features
    maxAssets: 12,
    maxAssetSize: 120 * 1024, // 120KB per asset
    warningSize: 350 * 1024, // Warning at 350KB
  },
  // Admin and reporting
  admin: {
    maxSize: 600 * 1024, // 600KB for admin features
    maxAssets: 18,
    maxAssetSize: 180 * 1024, // 180KB per asset
    warningSize: 550 * 1024, // Warning at 550KB
  },
};

// Healthcare Feature-Specific Budgets
const featureBudgets = {
  // Emergency access features (must be extremely lightweight)
  emergency: {
    maxSize: 200 * 1024, // 200KB for emergency features
    maxAssets: 8,
    maxAssetSize: 80 * 1024, // 80KB per asset
    warningSize: 180 * 1024, // Warning at 180KB
  },
  // Mobile-optimized features for healthcare workers
  mobile: {
    maxSize: 350 * 1024, // 350KB for mobile features
    maxAssets: 12,
    maxAssetSize: 100 * 1024, // 100KB per asset
    warningSize: 320 * 1024, // Warning at 320KB
  },
  // Accessibility features for healthcare
  accessibility: {
    maxSize: 250 * 1024, // 250KB for accessibility features
    maxAssets: 10,
    maxAssetSize: 90 * 1024, // 90KB per asset
    warningSize: 225 * 1024, // Warning at 225KB
  },
};

// LGPD Compliance Performance Requirements
const lgpdPerformanceRequirements = {
  // Data transfer efficiency for compliance
  maxDataTransferSize: 500 * 1024, // 500KB per data transfer
  maxConcurrentTransfers: 5,
  maxResponseTime: 5000, // 5 seconds max response time
  
  // Processing efficiency for PII data
  piiProcessingBudget: {
    maxProcessingTime: 2000, // 2 seconds max processing time
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB max memory usage
    maxCPUUsage: 30, // 30% max CPU usage
  },
  
  // Audit trail performance
  auditTrailBudget: {
    maxProcessingTime: 1000, // 1 second max for audit logging
    maxBatchSize: 100, // 100 audit entries per batch
    maxQueueSize: 1000, // 1000 entries in queue
  },
};

// Performance Monitoring Configuration
const performanceMonitoring = {
  // Real-time monitoring
  realTimeMonitoring: {
    enabled: true,
    sampleRate: 0.1, // 10% of requests
    alertThresholds: {
      loadTime: 2000, // 2 seconds
      responseTime: 500, // 500ms
      bundleSize: 1000000, // 1MB
    },
  },
  
  // Healthcare-specific metrics
  healthcareMetrics: {
    emergencyLoadTime: 1000, // 1 second for emergency features
    criticalDataLoadTime: 1500, // 1.5 seconds for critical data
    mobileLoadTime: 3000, // 3 seconds for mobile
    accessibilityLoadTime: 2500, // 2.5 seconds for accessibility
  },
  
  // LGPD compliance metrics
  lgpdMetrics: {
    dataTransferRate: 1000, // 1MB/s minimum transfer rate
    encryptionOverhead: 5, // 5% max overhead for encryption
    complianceCheckTime: 500, // 500ms max for compliance checks
  },
};

// Bundle Analysis Configuration
const bundleAnalysisConfig = {
  analyzerMode: 'static',
  analyzerPort: 8888,
  openAnalyzer: false,
  generateStatsFile: true,
  statsFilename: 'bundle-stats.json',
  defaultSizes: 'gzip',
  
  // Healthcare-specific analysis
  healthcareAnalysis: {
    enabled: true,
    checkPerformanceBudgets: true,
    checkLGPDCompliance: true,
    checkAccessibilityCompliance: true,
    
    // Performance budget checks
    budgets: performanceBudgets,
    featureBudgets: featureBudgets,
    
    // Compliance checks
    compliance: {
      lgpd: lgpdPerformanceRequirements,
      accessibility: {
        maxAccessibilityBundleSize: 300 * 1024, // 300KB max for accessibility features
        minAccessibilityScore: 90, // 90% minimum accessibility score
      },
      healthcare: {
        maxEmergencyLoadTime: 1000, // 1 second max emergency load time
        minSecurityScore: 95, // 95% minimum security score
      },
    },
  },
  
  // Report configuration
  reports: {
    generateReport: true,
    reportFilename: 'bundle-analysis-report.html',
    includeHealthcareMetrics: true,
    includeComplianceMetrics: true,
    includePerformanceRecommendations: true,
  },
  
  // Alerting configuration
  alerts: {
    enabled: true,
    channels: ['console', 'file'],
    alertFile: 'bundle-analysis-alerts.log',
    
    // Budget violation alerts
    budgetViolations: {
      critical: {
        enabled: true,
        notify: true,
        action: 'fail', // Fail build on critical budget violations
      },
      warning: {
        enabled: true,
        notify: true,
        action: 'warn', // Warn on budget warnings
      },
    },
    
    // Compliance violation alerts
    complianceViolations: {
      lgpd: {
        enabled: true,
        notify: true,
        action: 'fail', // Fail build on LGPD violations
      },
      accessibility: {
        enabled: true,
        notify: true,
        action: 'warn', // Warn on accessibility violations
      },
      healthcare: {
        enabled: true,
        notify: true,
        action: 'fail', // Fail build on healthcare compliance violations
      },
    },
  },
};

// Optimization Recommendations
const optimizationRecommendations = {
  // Code splitting recommendations
  codeSplitting: {
    enabled: true,
    strategies: [
      {
        name: 'route-based',
        description: 'Split bundles by application routes',
        priority: 'high',
      },
      {
        name: 'feature-based',
        description: 'Split bundles by healthcare features',
        priority: 'high',
      },
      {
        name: 'vendor-based',
        description: 'Split vendor libraries into separate chunks',
        priority: 'medium',
      },
    ],
  },
  
  // Lazy loading recommendations
  lazyLoading: {
    enabled: true,
    recommendations: [
      {
        pattern: 'telemedicine',
        description: 'Lazy load telemedicine features',
        priority: 'high',
      },
      {
        pattern: 'admin',
        description: 'Lazy load admin features',
        priority: 'medium',
      },
      {
        pattern: 'reporting',
        description: 'Lazy load reporting features',
        priority: 'medium',
      },
    ],
  },
  
  // Compression recommendations
  compression: {
    enabled: true,
    strategies: [
      {
        name: 'gzip',
        description: 'Enable gzip compression',
        priority: 'high',
      },
      {
        name: 'brotli',
        description: 'Enable Brotli compression',
        priority: 'high',
      },
      {
        name: 'image-optimization',
        description: 'Optimize medical images with WebP/AVIF',
        priority: 'medium',
      },
    ],
  },
  
  // Caching recommendations
  caching: {
    enabled: true,
    strategies: [
      {
        name: 'static-assets',
        description: 'Cache static assets with long TTL',
        priority: 'high',
      },
      {
        name: 'api-responses',
        description: 'Cache API responses with healthcare context',
        priority: 'medium',
      },
      {
        name: 'patient-data',
        description: 'Cache patient data with privacy controls',
        priority: 'low',
      },
    ],
  },
};

// Healthcare Performance Budget Plugin
class HealthcarePerformanceBudgetPlugin {
  constructor(options = {}) {
    this.options = {
      ...bundleAnalysisConfig,
      ...options,
    };
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('HealthcarePerformanceBudgetPlugin', (compilation, callback) => {
      const violations = [];
      const warnings = [];
      
      // Check performance budgets
      Object.keys(compilation.assets).forEach(assetName => {
        const asset = compilation.assets[assetName];
        const size = asset.size();
        
        // Check against budgets
        Object.entries(this.options.healthcareAnalysis.budgets).forEach(([budgetName, budget]) => {
          if (size > budget.maxSize) {
            violations.push({
              type: 'budget',
              severity: 'critical',
              budget: budgetName,
              asset: assetName,
              size: size,
              maxSize: budget.maxSize,
              message: `Asset ${assetName} (${size} bytes) exceeds ${budgetName} budget (${budget.maxSize} bytes)`,
            });
          } else if (size > budget.warningSize) {
            warnings.push({
              type: 'budget',
              severity: 'warning',
              budget: budgetName,
              asset: assetName,
              size: size,
              warningSize: budget.warningSize,
              message: `Asset ${assetName} (${size} bytes) approaches ${budgetName} budget warning (${budget.warningSize} bytes)`,
            });
          }
        });
        
        // Check LGPD compliance
        if (assetName.includes('patient') || assetName.includes('healthcare')) {
          if (size > this.options.healthcareAnalysis.compliance.lgpd.maxDataTransferSize) {
            violations.push({
              type: 'lgpd',
              severity: 'critical',
              asset: assetName,
              size: size,
              maxSize: this.options.healthcareAnalysis.compliance.lgpd.maxDataTransferSize,
              message: `Patient data asset ${assetName} (${size} bytes) exceeds LGPD compliance limit`,
            });
          }
        }
      });
      
      // Log violations and warnings
      if (violations.length > 0) {
        const message = violations.map(v => v.message).join('\n');
        if (this.options.alerts.budgetViolations.critical.action === 'fail') {
          compilation.errors.push(new Error(message));
        } else {
          compilation.warnings.push(new Error(message));
        }
      }
      
      if (warnings.length > 0) {
        const message = warnings.map(w => w.message).join('\n');
        compilation.warnings.push(new Error(message));
      }
      
      // Generate compliance report
      const report = {
        timestamp: new Date().toISOString(),
        violations,
        warnings,
        budgets: this.options.healthcareAnalysis.budgets,
        compliance: this.options.healthcareAnalysis.compliance,
        recommendations: optimizationRecommendations,
      };
      
      compilation.assets['healthcare-performance-report.json'] = {
        source: JSON.stringify(report, null, 2),
        size: Buffer.byteLength(JSON.stringify(report, null, 2)),
      };
      
      callback();
    });
  }
}

// Webpack Configuration for Bundle Analysis
const webpackConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  
  // Performance budget configuration
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    maxEntrypointSize: 800 * 1024, // 800KB
    maxAssetSize: 200 * 1024, // 200KB
    assetFilter: function(assetFilename) {
      // Exclude certain assets from performance checks
      return !assetFilename.endsWith('.map') && 
             !assetFilename.endsWith('.txt') && 
             !assetFilename.endsWith('.json');
    },
  },
  
  // Bundle analyzer plugin
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: bundleAnalysisConfig.analyzerMode,
      analyzerPort: bundleAnalysisConfig.analyzerPort,
      openAnalyzer: bundleAnalysisConfig.openAnalyzer,
      generateStatsFile: bundleAnalysisConfig.generateStatsFile,
      statsFilename: bundleAnalysisConfig.statsFilename,
      defaultSizes: bundleAnalysisConfig.defaultSizes,
    }),
    
    new HealthcarePerformanceBudgetPlugin(bundleAnalysisConfig),
  ],
  
  // Optimization settings
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20 * 1024, // 20KB
      maxSize: 250 * 1024, // 250KB
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '~',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};

module.exports = webpackConfig;

// Export configuration for other tools
module.exports.performanceBudgets = performanceBudgets;
module.exports.featureBudgets = featureBudgets;
module.exports.lgpdPerformanceRequirements = lgpdPerformanceRequirements;
module.exports.performanceMonitoring = performanceMonitoring;
module.exports.bundleAnalysisConfig = bundleAnalysisConfig;
module.exports.optimizationRecommendations = optimizationRecommendations;
module.exports.HealthcarePerformanceBudgetPlugin = HealthcarePerformanceBudgetPlugin;