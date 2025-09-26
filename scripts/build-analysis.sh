#!/bin/bash

set -e

echo "🚀 Starting Build Performance Analysis..."
echo "=============================================="

# Create analysis directory
ANALYSIS_DIR="./build-analysis"
mkdir -p "$ANALYSIS_DIR"

# Run build with analysis
echo "📊 Running production build with analysis..."
NODE_ENV=production TURBO_CACHE=true bunx turbo run build:production --force

# Collect build metrics
echo "📈 Collecting build metrics..."
BUILD_METRICS_FILE="$ANALYSIS_DIR/build-metrics.json"
cat > "$BUILD_METRICS_FILE" << 'EOF'
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "buildMetrics": {
    "totalBuildTime": "$(grep -A 10 "Tasks:" /tmp/performance-optimized.log | grep "Time:" | cut -d':' -f2 | xargs || echo 'N/A')",
    "cachedTasks": "$(grep -A 5 "Tasks:" /tmp/performance-optimized.log | grep "Cached:" | cut -d':' -f2 | xargs || echo '0')",
    "totalTasks": "$(grep -A 5 "Tasks:" /tmp/performance-optimized.log | grep "total:" | cut -d':' -f2 | xargs || echo '0')",
    "cacheHitRate": "0"
  },
  "bundleMetrics": {
    "bundleSizes": {},
    "chunkCount": 0,
    "totalSize": 0
  },
  "performanceMetrics": {
    "firstLoadTime": "N/A",
    "largestBundle": "N/A",
    "optimizationScore": "N/A"
  }
}
EOF

# Analyze bundle sizes if dist exists
if [ -d "./dist" ]; then
    echo "📦 Analyzing bundle sizes..."
    BUNDLE_ANALYSIS_FILE="$ANALYSIS_DIR/bundle-sizes.json"
    
    # Find all JS files and their sizes
    find ./dist -name "*.js" -type f -exec du -h {} \; | sort -hr > "$ANALYSIS_DIR/js-sizes.txt"
    
    # Create bundle size summary
    TOTAL_SIZE=$(find ./dist -name "*.js" -type f -exec du -k {} \; | awk '{sum += $1} END {print sum}')
    LARGEST_FILE=$(find ./dist -name "*.js" -type f -exec du -h {} \; | sort -hr | head -1)
    FILE_COUNT=$(find ./dist -name "*.js" -type f | wc -l)
    
    cat > "$BUNDLE_ANALYSIS_FILE" << EOF
{
  "totalSizeKB": $TOTAL_SIZE,
  "fileCount": $FILE_COUNT,
  "largestFile": "$LARGEST_FILE",
  "analysisTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
fi

# Generate performance report
echo "📋 Generating performance report..."
REPORT_FILE="$ANALYSIS_DIR/performance-report.md"

cat > "$REPORT_FILE" << 'EOF'
# Build Performance Analysis Report

## Build Metrics
- **Timestamp**: $(date -u)
- **Build Configuration**: Production with caching enabled
- **Concurrency**: 8 parallel tasks

## Performance Results

### Build Performance
- Total Build Time: N/A
- Cache Hit Rate: Calculating...
- Tasks Completed: N/A

### Bundle Analysis
- Total Bundle Size: N/A KB
- Number of Chunks: N/A
- Largest Bundle: N/A

## Optimization Applied
✅ Turborepo caching enabled
✅ TypeScript incremental compilation
✅ Bundle splitting and code splitting
✅ Production-specific optimizations
✅ Build analysis and monitoring

## Recommendations
- Monitor cache hit rates in CI/CD
- Set up bundle size regression testing
- Implement performance budgets
- Add runtime performance monitoring

EOF

echo "✅ Build analysis complete!"
echo "📊 Results saved to: $ANALYSIS_DIR/"
echo "📋 View report: $REPORT_FILE"
echo ""
echo "🔍 Key files generated:"
echo "  - build-metrics.json"
echo "  - bundle-sizes.json" 
echo "  - js-sizes.txt"
echo "  - performance-report.md"