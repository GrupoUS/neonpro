#!/usr/bin/env bash

# NeonPro Test Verification Script
# Executes comprehensive test suite with proper error handling

set -e

echo "🚀 NeonPro Test Suite Verification"
echo "=================================="

# Change to web app directory
cd /root/neonpro/apps/web

echo ""
echo "📋 Test Environment Information:"
echo "  • Node.js: $(node --version)"
echo "  • PNPM: $(pnpm --version)"
echo "  • Working Directory: $(pwd)"

echo ""
echo "🧪 Running Unit Tests (Vitest)..."
echo "--------------------------------"

# Run Vitest with timeout
timeout 60s pnpm test || {
  echo "❌ Unit tests failed or timed out"
  exit 1
}

echo "✅ Unit tests completed successfully"

echo ""
echo "🔧 Checking TypeScript compilation..."
echo "------------------------------------"

pnpm type-check || {
  echo "❌ TypeScript compilation failed"
  exit 1
}

echo "✅ TypeScript compilation passed"

echo ""
echo "🎨 Running code formatting check..."
echo "----------------------------------"

pnpm format:check || {
  echo "❌ Code formatting check failed"
  exit 1
}

echo "✅ Code formatting check passed"

echo ""
echo "🔍 Running linting..."
echo "-------------------"

pnpm lint || {
  echo "❌ Linting failed"
  exit 1
}

echo "✅ Linting passed"

echo ""
echo "📊 Test Coverage Report..."
echo "-------------------------"

pnpm coverage 2>/dev/null || {
  echo "⚠️ Coverage report generation failed (non-critical)"
}

echo ""
echo "🎭 Playwright Setup Verification..."
echo "---------------------------------"

# Check if Playwright is properly installed
if command -v npx &> /dev/null && npx playwright --version &> /dev/null; then
  echo "✅ Playwright is installed: $(npx playwright --version)"
  
  echo ""
  echo "📁 Playwright configuration check..."
  if [ -f "playwright.config.ts" ]; then
    echo "✅ playwright.config.ts found"
  else
    echo "❌ playwright.config.ts not found"
    exit 1
  fi
  
  echo ""
  echo "📂 E2E test directory check..."
  if [ -d "e2e" ]; then
    echo "✅ e2e directory exists"
    echo "   Test files found:"
    find e2e -name "*.spec.ts" -o -name "*.test.ts" | sed 's/^/     • /'
  else
    echo "❌ e2e directory not found"
    exit 1
  fi
else
  echo "❌ Playwright not properly installed"
  exit 1
fi

echo ""
echo "🎉 Test Suite Verification Complete!"
echo "===================================="
echo "✅ All checks passed successfully"
echo ""
echo "Next steps:"
echo "  • Run E2E tests: pnpm e2e"
echo "  • Generate coverage report: pnpm coverage"
echo "  • View test UI: pnpm test:ui"