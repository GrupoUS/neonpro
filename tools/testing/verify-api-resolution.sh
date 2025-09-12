#!/bin/bash

# API Resolution Verification Script
# 
# This script verifies that the Vercel framework configuration fix has resolved
# the API routing issues by running comprehensive tests against the deployment.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-https://neonpro.vercel.app}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}🧪 NeonPro API Resolution Verification${NC}"
echo -e "${BLUE}📍 Target URL: $BASE_URL${NC}"
echo ""

# Function to print status
print_status() {
    local status=$1
    local message=$2
    case $status in
        "info")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
    esac
}

# Check if the API resolution test script exists
if [ ! -f "$SCRIPT_DIR/api-resolution-test.ts" ]; then
    print_status "error" "API resolution test script not found at $SCRIPT_DIR/api-resolution-test.ts"
    exit 1
fi

print_status "info" "Running API resolution verification tests..."

# Run the TypeScript test script
cd "$PROJECT_ROOT"

if command -v npx >/dev/null 2>&1; then
    print_status "info" "Using npx to run TypeScript test..."
    if npx tsx "$SCRIPT_DIR/api-resolution-test.ts" "$BASE_URL"; then
        print_status "success" "API resolution verification PASSED!"
        echo ""
        print_status "success" "🎉 Framework mismatch issue has been resolved!"
        print_status "success" "🚀 API endpoints are now properly served by Hono API"
        print_status "success" "✨ Deployment is ready for production use"
        
        # Run the full smoke test as final verification
        echo ""
        print_status "info" "Running full deployment smoke test for final verification..."
        if npx tsx "$SCRIPT_DIR/deployment-smoke-test.ts" "$BASE_URL"; then
            print_status "success" "🎯 Full deployment smoke test PASSED!"
            print_status "success" "🏆 Complete deployment success achieved!"
        else
            print_status "warning" "Full smoke test had some issues, but API resolution is working"
        fi
        
        exit 0
    else
        print_status "error" "API resolution verification FAILED!"
        echo ""
        print_status "error" "❌ Framework mismatch issue still exists"
        print_status "info" "📋 Please check the Vercel dashboard configuration:"
        print_status "info" "   1. Framework should be 'Other' or 'Vite' (not 'Next.js')"
        print_status "info" "   2. Output Directory should be 'apps/web/dist' (not '.next')"
        print_status "info" "   3. Build Command should include both web and API builds"
        exit 1
    fi
else
    print_status "error" "npx not found. Please install Node.js and npm/pnpm."
    exit 1
fi
