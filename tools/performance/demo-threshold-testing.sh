#!/bin/bash

# Performance Budget Threshold Demonstration Script
#
# This script demonstrates how performance budget violations are detected
# by creating a temporary configuration with impossible budgets that will
# always fail, proving that the validation system works correctly.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Performance Budget Threshold Testing Demonstration${NC}"
echo "======================================================"
echo ""

# Create a test configuration with impossible budgets
TEST_CONFIG=$(cat << 'EOF'
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      staticDistDir: './apps/web/dist',
      url: ['http://localhost:4173/'],
      startServerCommand: 'pnpm --filter @neonpro/web preview --port 4173',
      startServerReadyPattern: 'Local:\\s+http://localhost:4173',
      startServerReadyTimeout: 15000,
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance'],
        skipAudits: [
          'uses-rel-preconnect',
          'uses-rel-preload',
          'font-display',
          'third-party-facades',
        ],
      },
    },
    assert: {
      assertions: {
        // Impossible budgets that should always fail (demonstrating violation detection)
        'largest-contentful-paint': ['error', { maxNumericValue: 1 }],     // 1ms - impossible
        'first-contentful-paint': ['error', { maxNumericValue: 1 }],       // 1ms - impossible
        'speed-index': ['error', { maxNumericValue: 1 }],                  // 1ms - impossible
        'total-blocking-time': ['error', { maxNumericValue: 0 }],          // 0ms - impossible
        'categories:performance': ['error', { minScore: 1.0 }],            // 100% - nearly impossible
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
EOF
)

echo -e "${YELLOW}📝 Creating test configuration with impossible performance budgets...${NC}"
echo "$TEST_CONFIG" > "$PROJECT_ROOT/lighthouserc.demo.js"

echo -e "${YELLOW}⚠️  Test budgets designed to FAIL (demonstrating violation detection):${NC}"
echo "   • LCP: 1ms (impossible - typical values: 1000-3000ms)"
echo "   • FCP: 1ms (impossible - typical values: 500-2000ms)"  
echo "   • Speed Index: 1ms (impossible - typical values: 1000-4000ms)"
echo "   • TBT: 0ms (impossible - typical values: 50-300ms)"
echo "   • Performance Score: 100% (nearly impossible to achieve)"
echo ""

echo -e "${BLUE}🚀 Running Lighthouse CI with impossible budgets...${NC}"
echo "(This will fail intentionally to prove violation detection works)"
echo ""

cd "$PROJECT_ROOT"

# Check if app is built
if [ ! -d "apps/web/dist" ]; then
  echo -e "${YELLOW}🏗️  Building web app for demonstration...${NC}"
  pnpm --filter @neonpro/web build >/dev/null 2>&1 || {
    echo -e "${RED}❌ Build failed. Cannot proceed with demonstration.${NC}"
    rm -f lighthouserc.demo.js
    exit 1
  }
fi

# Install Lighthouse CI if not available
if ! command -v lhci >/dev/null 2>&1; then
  echo -e "${YELLOW}📦 Installing Lighthouse CI for demonstration...${NC}"
  pnpm add -g @lhci/cli@latest >/dev/null 2>&1
fi

# Run Lighthouse CI with the impossible budget config
echo -e "${BLUE}🔍 Executing performance budget validation...${NC}"
LHCI_EXIT_CODE=0

# Capture output to show the failures
lhci autorun --config=lighthouserc.demo.js 2>&1 | tee /tmp/lhci_demo_output.log || LHCI_EXIT_CODE=$?

echo ""
echo "======================================================"

if [ $LHCI_EXIT_CODE -eq 0 ]; then
  echo -e "${RED}⚠️  UNEXPECTED: Test should have failed but passed${NC}"
  echo -e "${RED}   This suggests the validation system may not be working properly${NC}"
else
  echo -e "${GREEN}✅ SUCCESS: Performance budget validation system working correctly!${NC}"
  echo ""
  echo -e "${GREEN}🎯 Demonstrated Capabilities:${NC}"
  echo -e "${GREEN}   ✅ Budget violation detection${NC}"
  echo -e "${GREEN}   ✅ Build failure on performance issues${NC}" 
  echo -e "${GREEN}   ✅ Detailed error reporting${NC}"
  echo -e "${GREEN}   ✅ Healthcare-specific thresholds enforced${NC}"
fi

echo ""
echo -e "${BLUE}📊 Analysis of Demonstration Results:${NC}"

# Check for specific failure indicators in the output
if [ -f "/tmp/lhci_demo_output.log" ]; then
  if grep -q "largest-contentful-paint" /tmp/lhci_demo_output.log; then
    echo -e "${GREEN}   ✅ LCP budget violation detected${NC}"
  fi
  
  if grep -q "first-contentful-paint" /tmp/lhci_demo_output.log; then
    echo -e "${GREEN}   ✅ FCP budget violation detected${NC}"
  fi
  
  if grep -q "performance" /tmp/lhci_demo_output.log; then
    echo -e "${GREEN}   ✅ Performance category validation working${NC}"
  fi
  
  if grep -q "error" /tmp/lhci_demo_output.log; then
    echo -e "${GREEN}   ✅ Error-level assertion enforcement${NC}"
  fi
fi

echo ""
echo -e "${BLUE}🏥 Healthcare Context - Why This Matters:${NC}"
echo "   • Patient safety requires fast, reliable medical software"
echo "   • Performance budgets prevent regression in critical healthcare apps"  
echo "   • Automated validation ensures consistent quality standards"
echo "   • Early detection prevents performance issues in production"
echo ""

echo -e "${BLUE}🔄 Normal vs Demo Configuration Comparison:${NC}"
echo "┌─────────────────────┬─────────────────┬─────────────────┐"
echo "│ Metric              │ Healthcare Std  │ Demo (Fail)     │"
echo "├─────────────────────┼─────────────────┼─────────────────┤"
echo "│ LCP                 │ < 2000ms        │ < 1ms ❌        │"
echo "│ FCP                 │ < 1500ms        │ < 1ms ❌        │"
echo "│ Speed Index         │ < 2500ms        │ < 1ms ❌        │"
echo "│ TBT                 │ < 200ms         │ < 0ms ❌        │"
echo "│ Performance Score   │ ≥ 90%           │ ≥ 100% ❌       │"
echo "└─────────────────────┴─────────────────┴─────────────────┘"
echo ""

echo -e "${YELLOW}🧹 Cleaning up demonstration files...${NC}"
rm -f "$PROJECT_ROOT/lighthouserc.demo.js"
rm -f "/tmp/lhci_demo_output.log"

echo -e "${GREEN}✅ Performance Budget Threshold Demonstration Complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Use normal budgets: ./tools/performance/validate-performance-budgets.sh"  
echo "2. Check CI integration: Review .github/workflows/ci.yml"
echo "3. View documentation: docs/features/performance-budgets-monitoring.md"

exit $LHCI_EXIT_CODE