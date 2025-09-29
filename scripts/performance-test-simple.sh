#!/bin/bash

# Performance Validation Script - Fase 6 (Simplified)
# Testa as métricas de performance usando ferramentas disponíveis

set -e

echo "🚀 NeonPro Performance Validation - Fase 6 (Simplified)"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Performance thresholds from specification
EDGE_TTFB_THRESHOLD=150  # ms
BUILD_THRESHOLD=10000     # ms (10s)
INSTALL_THRESHOLD=30000   # ms (30s)

echo "📊 Performance Targets:"
echo "  • Edge TTFB: ≤${EDGE_TTFB_THRESHOLD}ms"
echo "  • Build Time: ≤$(($BUILD_THRESHOLD/1000))s"
echo "  • Install Time: ≤$(($INSTALL_THRESHOLD/1000))s"
echo ""

# Function to measure time in milliseconds
measure_time() {
    echo $(date +%s%3N)
}

# Test 1: Build Performance
echo "🏗️  Testing Build Performance..."
echo "================================"

BUILD_START=$(measure_time)
echo "Running: pnpm turbo build --filter=@neonpro/types --filter=@neonpro/database --filter=@neonpro/core"

if pnpm turbo build --filter=@neonpro/types --filter=@neonpro/database --filter=@neonpro/core; then
    BUILD_END=$(measure_time)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    
    echo "Build Time: ${BUILD_TIME}ms ($(echo "scale=2; $BUILD_TIME/1000" | bc)s)"
    
    if [ $BUILD_TIME -lt $BUILD_THRESHOLD ]; then
        echo -e "${GREEN}✅ Build Performance: EXCELLENT (<$(($BUILD_THRESHOLD/1000))s)${NC}"
        BUILD_STATUS="PASS"
    else
        echo -e "${YELLOW}⚠️  Build Performance: NEEDS OPTIMIZATION (>$(($BUILD_THRESHOLD/1000))s)${NC}"
        BUILD_STATUS="WARN"
    fi
else
    echo -e "${RED}❌ Build failed${NC}"
    BUILD_STATUS="FAIL"
    BUILD_TIME="N/A"
fi

echo ""

# Test 2: Package Installation Performance  
echo "💾 Testing Install Performance..."
echo "================================="

# Create a clean test to measure install time
INSTALL_START=$(measure_time)
echo "Running: pnpm install --frozen-lockfile"

if pnpm install --frozen-lockfile > /dev/null 2>&1; then
    INSTALL_END=$(measure_time)
    INSTALL_TIME=$((INSTALL_END - INSTALL_START))
    
    echo "Install Time: ${INSTALL_TIME}ms ($(echo "scale=2; $INSTALL_TIME/1000" | bc)s)"
    
    if [ $INSTALL_TIME -lt $INSTALL_THRESHOLD ]; then
        echo -e "${GREEN}✅ Install Performance: EXCELLENT (<$(($INSTALL_THRESHOLD/1000))s)${NC}"
        INSTALL_STATUS="PASS"
    else
        echo -e "${YELLOW}⚠️  Install Performance: NEEDS OPTIMIZATION (>$(($INSTALL_THRESHOLD/1000))s)${NC}"
        INSTALL_STATUS="WARN"
    fi
else
    echo -e "${RED}❌ Install failed${NC}"
    INSTALL_STATUS="FAIL"
    INSTALL_TIME="N/A"
fi

echo ""

# Test 3: Package Size Analysis
echo "📦 Testing Package Sizes..."
echo "==========================="

if [ -d "node_modules" ]; then
    NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "N/A")
    echo "Node modules size: $NODE_MODULES_SIZE"
    
    # Check individual package sizes
    for package in packages/*/; do
        if [ -d "$package" ]; then
            PACKAGE_NAME=$(basename "$package")
            PACKAGE_SIZE=$(du -sh "$package" 2>/dev/null | cut -f1 || echo "N/A")
            echo "  - $PACKAGE_NAME: $PACKAGE_SIZE"
        fi
    done
    
    echo -e "${GREEN}✅ Package size analysis completed${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules not found${NC}"
fi

echo ""

# Test 4: TypeScript Compilation Performance
echo "🔧 Testing TypeScript Performance..."
echo "===================================="

TS_START=$(measure_time)
echo "Running: pnpm turbo type-check"

if pnpm turbo type-check > /dev/null 2>&1; then
    TS_END=$(measure_time)
    TS_TIME=$((TS_END - TS_START))
    
    echo "Type Check Time: ${TS_TIME}ms ($(echo "scale=2; $TS_TIME/1000" | bc)s)"
    
    if [ $TS_TIME -lt 5000 ]; then
        echo -e "${GREEN}✅ TypeScript Performance: EXCELLENT (<5s)${NC}"
        TS_STATUS="PASS"
    else
        echo -e "${YELLOW}⚠️  TypeScript Performance: NEEDS OPTIMIZATION (>5s)${NC}"
        TS_STATUS="WARN"
    fi
else
    echo -e "${RED}❌ Type check failed${NC}"
    TS_STATUS="FAIL"
    TS_TIME="N/A"
fi

echo ""

# Test 5: Test Execution Performance
echo "🧪 Testing Test Performance..."
echo "============================="

TEST_START=$(measure_time)
echo "Running: pnpm turbo test --filter=@neonpro/types"

if pnpm turbo test --filter=@neonpro/types > /dev/null 2>&1; then
    TEST_END=$(measure_time)
    TEST_TIME=$((TEST_END - TEST_START))
    
    echo "Test Execution Time: ${TEST_TIME}ms ($(echo "scale=2; $TEST_TIME/1000" | bc)s)"
    
    if [ $TEST_TIME -lt 3000 ]; then
        echo -e "${GREEN}✅ Test Performance: EXCELLENT (<3s)${NC}"
        TEST_STATUS="PASS"
    else
        echo -e "${YELLOW}⚠️  Test Performance: NEEDS OPTIMIZATION (>3s)${NC}"
        TEST_STATUS="WARN"
    fi
else
    echo -e "${RED}❌ Tests failed${NC}"
    TEST_STATUS="FAIL"
    TEST_TIME="N/A"
fi

echo ""

# Generate Performance Report
echo "📊 Performance Summary Report"
echo "=============================="
echo "Date: $(date)"
echo "Project: NeonPro Monorepo"
echo "Architecture: Consolidated 5-package structure"
echo ""
echo "Results:"
echo "--------"
echo "Build Performance:     $BUILD_STATUS ($BUILD_TIME ms)"
echo "Install Performance:   $INSTALL_STATUS ($INSTALL_TIME ms)"
echo "TypeScript Performance: $TS_STATUS ($TS_TIME ms)"
echo "Test Performance:      $TEST_STATUS ($TEST_TIME ms)"
echo ""

# Count results
PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

for status in "$BUILD_STATUS" "$INSTALL_STATUS" "$TS_STATUS" "$TEST_STATUS"; do
    case $status in
        "PASS") ((PASS_COUNT++));;
        "WARN") ((WARN_COUNT++));;
        "FAIL") ((FAIL_COUNT++));;
    esac
done

echo "Summary: $PASS_COUNT passed, $WARN_COUNT warnings, $FAIL_COUNT failed"

if [ $FAIL_COUNT -eq 0 ] && [ $WARN_COUNT -le 1 ]; then
    echo -e "${GREEN}🎉 Overall Performance: EXCELLENT${NC}"
    echo -e "${GREEN}✅ Ready for staging deployment${NC}"
    exit 0
elif [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Overall Performance: GOOD (with minor optimizations needed)${NC}"
    echo -e "${YELLOW}✅ Ready for staging deployment with monitoring${NC}"
    exit 0
else
    echo -e "${RED}❌ Overall Performance: NEEDS ATTENTION${NC}"
    echo -e "${RED}🚫 Fix issues before staging deployment${NC}"
    exit 1
fi