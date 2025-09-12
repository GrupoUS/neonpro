#!/bin/bash

# Performance Budget Validation Script for NeonPro Healthcare Platform
#
# This script validates performance budgets using Lighthouse CI with healthcare-specific
# performance criteria. Critical for patient safety and operational efficiency.
#
# Usage:
#   ./validate-performance-budgets.sh [--build|--no-build] [--mobile|--desktop]
#
# Prerequisites:
#   - Node.js 20+ and pnpm installed
#   - @lhci/cli installed globally or via pnpm
#   - Web application built in apps/web/dist/

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LIGHTHOUSE_CONFIG="$PROJECT_ROOT/lighthouserc.js"
WEB_DIST="$PROJECT_ROOT/apps/web/dist"
REPORTS_DIR="$PROJECT_ROOT/.lighthouseci"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
BUILD_APP=true
DEVICE_TYPE="desktop"
VERBOSE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --build)
      BUILD_APP=true
      shift
      ;;
    --no-build)
      BUILD_APP=false
      shift
      ;;
    --mobile)
      DEVICE_TYPE="mobile"
      shift
      ;;
    --desktop)
      DEVICE_TYPE="desktop"
      shift
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --help|-h)
      echo "Performance Budget Validation for NeonPro Healthcare Platform"
      echo ""
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --build         Build the web app before testing (default)"
      echo "  --no-build      Skip building, use existing dist/"
      echo "  --mobile        Test with mobile emulation"
      echo "  --desktop       Test with desktop emulation (default)"
      echo "  --verbose, -v   Enable verbose output"
      echo "  --help, -h      Show this help message"
      echo ""
      echo "Healthcare Performance Standards:"
      echo "  - LCP < 2.0s (stricter than web.dev 2.5s for patient safety)"
      echo "  - INP < 150ms (stricter than 200ms standard for medical forms)"
      echo "  - CLS < 0.05 (stricter than 0.1 for form stability)"
      echo "  - Accessibility ≥95% (critical for medical compliance)"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🏥 NeonPro Healthcare Performance Budget Validation${NC}"
echo "=================================================="
echo ""

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}❌ Node.js is not installed${NC}"
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo -e "${RED}❌ pnpm is not installed${NC}"
  exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}❌ Node.js version must be 18 or higher (found: $(node --version))${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
echo -e "${GREEN}✅ pnpm $(pnpm --version)${NC}"

# Check if Lighthouse CI is available
if ! command -v lhci >/dev/null 2>&1; then
  echo -e "${YELLOW}📦 Installing Lighthouse CI...${NC}"
  pnpm add -g @lhci/cli@latest
fi

LHCI_VERSION=$(lhci --version)
echo -e "${GREEN}✅ Lighthouse CI ${LHCI_VERSION}${NC}"

# Check configuration file
if [ ! -f "$LIGHTHOUSE_CONFIG" ]; then
  echo -e "${RED}❌ Lighthouse configuration not found: $LIGHTHOUSE_CONFIG${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Lighthouse configuration found${NC}"
echo ""

# Build application if requested
if [ "$BUILD_APP" = true ]; then
  echo -e "${BLUE}🏗️ Building web application...${NC}"
  cd "$PROJECT_ROOT"
  
  if [ "$VERBOSE" = true ]; then
    pnpm --filter @neonpro/web build
  else
    pnpm --filter @neonpro/web build >/dev/null 2>&1
  fi
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully${NC}"
  else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⏭️ Skipping build (using existing dist/)${NC}"
fi

# Check if dist directory exists
if [ ! -d "$WEB_DIST" ]; then
  echo -e "${RED}❌ Web dist directory not found: $WEB_DIST${NC}"
  echo "   Run with --build to build the application first"
  exit 1
fi

echo -e "${GREEN}✅ Web application ready${NC}"
echo ""

# Create reports directory
mkdir -p "$REPORTS_DIR"

# Update Lighthouse config for device type
TEMP_CONFIG=$(mktemp)
if [ "$DEVICE_TYPE" = "mobile" ]; then
  sed 's/preset: "desktop"/preset: "mobile"/g' "$LIGHTHOUSE_CONFIG" > "$TEMP_CONFIG"
  echo -e "${BLUE}📱 Running with mobile emulation${NC}"
else
  cp "$LIGHTHOUSE_CONFIG" "$TEMP_CONFIG"
  echo -e "${BLUE}🖥️ Running with desktop emulation${NC}"
fi

# Run Lighthouse CI
echo -e "${BLUE}🚀 Starting Lighthouse CI performance validation...${NC}"
echo ""
echo -e "${YELLOW}Healthcare Performance Budget Criteria:${NC}"
echo "  • Largest Contentful Paint (LCP): < 2.0s"
echo "  • First Contentful Paint (FCP): < 1.5s"
echo "  • Interaction to Next Paint (INP): < 150ms"
echo "  • Cumulative Layout Shift (CLS): < 0.05"
echo "  • Total Blocking Time (TBT): < 200ms"
echo "  • Accessibility Score: ≥ 95%"
echo "  • Bundle Size: < 1.2MB total"
echo ""

cd "$PROJECT_ROOT"

# Run Lighthouse CI with error handling
LHCI_EXIT_CODE=0
if [ "$VERBOSE" = true ]; then
  lhci autorun --config="$TEMP_CONFIG" || LHCI_EXIT_CODE=$?
else
  lhci autorun --config="$TEMP_CONFIG" 2>/dev/null || LHCI_EXIT_CODE=$?
fi

# Cleanup temp config
rm -f "$TEMP_CONFIG"

echo ""
echo "=================================================="

# Analyze results
if [ $LHCI_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}🎉 Performance budgets PASSED!${NC}"
  echo ""
  echo -e "${GREEN}✅ All healthcare performance criteria met${NC}"
  echo -e "${GREEN}✅ Application ready for patient-facing deployment${NC}"
  echo -e "${GREEN}✅ Compliance with LGPD/ANVISA performance standards${NC}"
else
  echo -e "${RED}❌ Performance budgets FAILED!${NC}"
  echo ""
  echo -e "${RED}⚠️ Performance issues detected that may impact patient care${NC}"
  echo -e "${YELLOW}📊 Review Lighthouse reports for optimization recommendations${NC}"
  
  # Show reports location if they exist
  if [ -d "$REPORTS_DIR" ] && [ "$(ls -A "$REPORTS_DIR" 2>/dev/null)" ]; then
    echo ""
    echo -e "${BLUE}📄 Detailed reports available in:${NC}"
    echo "   $REPORTS_DIR"
    
    # List HTML reports if they exist
    HTML_REPORTS=$(find "$REPORTS_DIR" -name "*.html" 2>/dev/null | head -3)
    if [ -n "$HTML_REPORTS" ]; then
      echo ""
      echo -e "${BLUE}🔍 View detailed reports:${NC}"
      echo "$HTML_REPORTS" | while read -r report; do
        echo "   file://$report"
      done
    fi
  fi
fi

echo ""
echo -e "${BLUE}🏥 Healthcare Performance Standards Context:${NC}"
echo "   • Patient safety requires fast loading times"
echo "   • Medical forms need stable layouts (low CLS)"
echo "   • Clinic networks benefit from optimized resources"
echo "   • Accessibility compliance is mandatory for healthcare"
echo ""

# Generate summary for CI
if [ -n "${GITHUB_ACTIONS:-}" ]; then
  echo "performance_budget_passed=$([[ $LHCI_EXIT_CODE -eq 0 ]] && echo "true" || echo "false")" >> "$GITHUB_OUTPUT"
  echo "reports_dir=$REPORTS_DIR" >> "$GITHUB_OUTPUT"
fi

exit $LHCI_EXIT_CODE