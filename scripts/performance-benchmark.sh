#!/bin/bash

set -e

# Helper function for calculating averages
avg_time() {
    if [ -f "$1" ]; then
        local avg=$(awk -F',' '{sum += $1; count++} END {if (count > 0) print sum/count}' "$1")
        echo "- **Average Time**: ${avg}s"
        echo "- **Success Rate**: $(awk -F',' '{success += ($2 == "0") ? 1 : 0; count++} END {if (count > 0) print (success/count)*100"%"}' "$1")"
        echo "- **Cache Hits**: $(awk -F',' '{cache += $3; count++} END {if (count > 0) print cache/count}' "$1")"
    else
        echo "- No data available"
    fi
}

echo "🎯 Performance Benchmarking Suite"
echo "================================="

# Configuration
ITERATIONS=3
BUILD_TYPE=${1:-"production"}
OUTPUT_DIR="./performance-benchmarks"
mkdir -p "$OUTPUT_DIR"

# Function to time builds
time_build() {
    local build_cmd="$1"
    local build_name="$2"
    local iteration="$3"
    
    echo "🏃 Running $build_name - Iteration $iteration..."
    
    # Clean cache between iterations for accurate measurement
    if [ "$build_name" != "cached" ]; then
        rm -rf .turbo/cache
        rm -rf .tsbuildinfo
        rm -rf node_modules/.cache
    fi
    
    # Time the build
    start_time=$(date +%s.%N)
    eval "$build_cmd" 2>&1 | tee "/tmp/build-$build_name-$iteration.log"
    end_time=$(date +%s.%N)

    duration=$(echo "$end_time - $start_time" | bc)
    echo "⏱️  Duration: $duration seconds"
    
    # Extract metrics
    local success=$?
    local cached=$(grep -c "cache hit" "/tmp/build-$build_name-$iteration.log" || echo "0")
    local tasks=$(grep -A 5 "Tasks:" "/tmp/build-$build_name-$iteration.log" | grep "total:" | cut -d':' -f2 | xargs || echo "0")
    
    echo "$duration,$success,$cached,$tasks" >> "$OUTPUT_DIR/$build_name-metrics.csv"
}

# Benchmark scenarios
echo "📊 Running benchmark scenarios..."

echo ""
echo "🚀 Scenario 1: Clean Build (No Cache)"
for i in $(seq 1 $ITERATIONS); do
    time_build "bunx turbo run build --force" "clean-build" $i
done

echo ""
echo "⚡ Scenario 2: Cached Build"
for i in $(seq 1 $ITERATIONS); do
    time_build "bunx turbo run build" "cached-build" $i
done

echo ""
echo "🎯 Scenario 3: Production Build"
for i in $(seq 1 $ITERATIONS); do
    time_build "bunx turbo run build:production" "production-build" $i
done

echo ""
echo "🔍 Scenario 4: Type Check Only"
for i in $(seq 1 $ITERATIONS); do
    time_build "bunx turbo run type-check" "type-check" $i
done

echo ""
echo "📊 Scenario 5: Parallel Build (Max Concurrency)"
for i in $(seq 1 $ITERATIONS); do
    time_build "bunx turbo run build --concurrency=16" "parallel-build" $i
done

# Generate benchmark report
echo ""
echo "📋 Generating benchmark report..."

cat > "$OUTPUT_DIR/benchmark-report.md" << EOF
# Performance Benchmark Report

## Test Configuration
- **Iterations**: $ITERATIONS per scenario
- **Build Type**: $BUILD_TYPE
- **Test Date**: $(date -u)
- **Environment**: $(node --version) / $(bun --version)

## Benchmark Results

### Clean Build (No Cache)
$(avg_time "$OUTPUT_DIR/clean-build-metrics.csv")

### Cached Build
$(avg_time "$OUTPUT_DIR/cached-build-metrics.csv")

### Production Build
$(avg_time "$OUTPUT_DIR/production-build-metrics.csv")

### Type Check Only
$(avg_time "$OUTPUT_DIR/type-check-metrics.csv")

### Parallel Build (Max Concurrency)
$(avg_time "$OUTPUT_DIR/parallel-build-metrics.csv")

## Performance Insights

### Cache Effectiveness
- Cache Hit Rate: Calculating...
- Build Time Reduction: Calculating...

### Optimization Impact
- Production vs Development: Calculating...
- Parallel Processing Benefit: Calculating...

## Recommendations
1. **Cache Strategy**: [Based on results]
2. **Concurrency**: [Based on results]
3. **Build Pipeline**: [Based on results]

EOF

echo "✅ Benchmarking complete!"
echo "📊 Results saved to: $OUTPUT_DIR/"
echo "📋 View full report: $OUTPUT_DIR/benchmark-report.md"
echo ""
echo "🔍 Generated files:"
ls -la "$OUTPUT_DIR/"