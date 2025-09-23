#!/bin/bash

# Parallel Quality Check Script for NeonPro
# Runs Oxlint and dprint in parallel for maximum performance

set -e

echo "🚀 Starting parallel quality checks..."

# Function to run oxlint
run_oxlint() {
    echo "🔍 Running Oxlint (50x faster than ESLint)..."
    if oxlint --config tools/quality/oxlint.config.mjs .; then
        echo "✅ Oxlint passed"
        return 0
    else
        echo "❌ Oxlint failed"
        return 1
    fi
}

# Function to run dprint
run_dprint() {
    echo "🎨 Running dprint formatting check..."
    if dprint check --config tools/quality/dprint.json; then
        echo "✅ dprint formatting passed"
        return 0
    else
        echo "❌ dprint formatting failed"
        return 1
    fi
}

# Function to run type checking
run_typecheck() {
    echo "🔬 Running TypeScript type checking..."
    if turbo type-check; then
        echo "✅ TypeScript type checking passed"
        return 0
    else
        echo "❌ TypeScript type checking failed"
        return 1
    fi
}

# Run checks in parallel
export -f run_oxlint
export -f run_dprint
export -f run_typecheck

# Start parallel execution
echo "⚡ Running checks in parallel..."

# Use GNU parallel for maximum efficiency
if command -v parallel &> /dev/null; then
    parallel -j 3 ::: run_oxlint run_dprint run_typecheck
else
    # Fallback to background processes
    run_oxlint &
    OXLINT_PID=$!
    
    run_dprint &
    DPRINT_PID=$!
    
    run_typecheck &
    TYPECHECK_PID=$!
    
    # Wait for all processes
    wait $OXLINT_PID
    OXLINT_EXIT=$?
    
    wait $DPRINT_PID
    DPRINT_EXIT=$?
    
    wait $TYPECHECK_PID
    TYPECHECK_EXIT=$?
    
    # Check results
    if [ $OXLINT_EXIT -eq 0 ] && [ $DPRINT_EXIT -eq 0 ] && [ $TYPECHECK_EXIT -eq 0 ]; then
        echo "🎉 All quality checks passed!"
        exit 0
    else
        echo "💥 Some quality checks failed!"
        exit 1
    fi
fi