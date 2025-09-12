#!/bin/bash

# Cold Start Measurement Script for NeonPro Hono API
# Measures cold start performance in Edge Runtime simulation

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 NeonPro Cold Start Measurement${NC}"
echo "================================================"

# Change to project root
cd "$(dirname "$0")/../.."

# Ensure tools/performance exists
mkdir -p tools/performance

# Check if API is already running (kill if needed)
if pgrep -f "dev:api" > /dev/null; then
    echo -e "${YELLOW}⚠️  Stopping existing API server...${NC}"
    pkill -f "dev:api" || true
    sleep 2
fi

# Check if measurement tool exists
if [ ! -f "tools/performance/cold-start-measurement.ts" ]; then
    echo -e "${RED}❌ Cold start measurement tool not found!${NC}"
    exit 1
fi

# Verify API can start
echo -e "${BLUE}🔍 Verifying API configuration...${NC}"

# Check if package.json has dev:api script
if ! grep -q '"dev:api"' apps/api/package.json; then
    echo -e "${YELLOW}⚠️  Creating dev:api script...${NC}"
    # Add dev:api script to package.json if not exists
    cd apps/api
    npm pkg set scripts.dev:api="NODE_ENV=development PORT=3004 tsx src/index.ts"
    cd ../..
fi

# Run the measurement
echo -e "${BLUE}🎯 Starting cold start measurement...${NC}"
echo "This will:"
echo "  1. Start/stop the API server multiple times"
echo "  2. Measure first request (cold start) vs warm requests"
echo "  3. Generate performance reports"
echo ""

# Execute measurement using tsx for TypeScript support
if command -v bun >/dev/null 2>&1; then
    echo -e "${GREEN}Using Bun for faster execution...${NC}"
    bun run tools/performance/cold-start-measurement.ts
elif command -v tsx >/dev/null 2>&1; then
    echo -e "${GREEN}Using TSX for TypeScript execution...${NC}"
    npx tsx tools/performance/cold-start-measurement.ts
else
    echo -e "${RED}❌ Neither Bun nor TSX found. Installing tsx...${NC}"
    npm install -g tsx
    npx tsx tools/performance/cold-start-measurement.ts
fi

# Check results
if [ -f "docs/performance/cold-start-performance-report.md" ]; then
    echo -e "${GREEN}✅ Measurement completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📊 Results available at:${NC}"
    echo "  - JSON: docs/performance/cold-start-metrics.json"
    echo "  - Report: docs/performance/cold-start-performance-report.md"
    echo ""
    
    # Display quick summary
    echo -e "${BLUE}📈 Quick Summary:${NC}"
    if command -v grep >/dev/null 2>&1; then
        grep -A 10 "## Performance Summary" docs/performance/cold-start-performance-report.md || true
    fi
else
    echo -e "${RED}❌ Measurement failed - no results generated${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Cold start measurement complete!${NC}"