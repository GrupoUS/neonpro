#!/bin/bash
# Deployment Smoke Test Runner for NeonPro
# 
# This script runs comprehensive post-deployment validation tests
# and provides colored output with proper exit codes for CI integration.
#
# Usage:
#   ./tools/testing/smoke-test.sh [base-url]
#   
# Examples:
#   ./tools/testing/smoke-test.sh https://neonpro.vercel.app
#   ./tools/testing/smoke-test.sh http://localhost:3000
#   ./tools/testing/smoke-test.sh  # defaults to localhost:3000

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default URL
BASE_URL=${1:-"http://localhost:3000"}

echo -e "${BLUE}🧪 NeonPro Deployment Smoke Test${NC}"
echo -e "${BLUE}📍 Target URL: ${BASE_URL}${NC}"
echo ""

# Check if tsx is available
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ Error: npx is not available. Please install Node.js and npm.${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "tools/testing/deployment-smoke-test.ts" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory.${NC}"
    exit 1
fi

# Run the smoke tests
echo -e "${YELLOW}🚀 Starting smoke tests...${NC}"
echo ""

if npx tsx tools/testing/deployment-smoke-test.ts "$BASE_URL"; then
    echo ""
    echo -e "${GREEN}✅ All smoke tests passed!${NC}"
    echo -e "${GREEN}🎉 Deployment is healthy and ready for production.${NC}"
    
    # Check if report file exists and show summary
    if [ -f "tools/testing/smoke-test-results.json" ]; then
        echo ""
        echo -e "${BLUE}📊 Test report saved to: tools/testing/smoke-test-results.json${NC}"
        
        # Extract key metrics from the report using basic tools
        if command -v jq &> /dev/null; then
            PASSED=$(jq -r '.passed' tools/testing/smoke-test-results.json)
            TOTAL=$(jq -r '.totalTests' tools/testing/smoke-test-results.json)
            DURATION=$(jq -r '.duration' tools/testing/smoke-test-results.json)
            
            echo -e "${GREEN}📈 Summary: ${PASSED}/${TOTAL} tests passed in ${DURATION}ms${NC}"
        fi
    fi
    
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some smoke tests failed!${NC}"
    echo -e "${RED}🚨 Deployment may have issues that need attention.${NC}"
    
    # Show report location for debugging
    if [ -f "tools/testing/smoke-test-results.json" ]; then
        echo ""
        echo -e "${YELLOW}🔍 Check the detailed report: tools/testing/smoke-test-results.json${NC}"
        
        # Show failed tests if jq is available
        if command -v jq &> /dev/null; then
            echo -e "${YELLOW}❌ Failed tests:${NC}"
            jq -r '.tests[] | select(.status == "fail") | "  - \(.name): \(.error)"' tools/testing/smoke-test-results.json
        fi
    fi
    
    exit 1
fi
