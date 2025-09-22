#!/bin/bash

# Guard script to prevent committing test pages or root tests
# NeonPro Healthcare Platform - Development Standards

set -e

echo "🔍 Running test placement guard..."

# Check for test files in root directory (should be in __tests__ directories)
if find . -maxdepth 1 -name "*.test.*" -o -name "*.spec.*" | grep -q .; then
    echo "❌ Error: Test files found in root directory"
    echo "ℹ️  Move test files to appropriate __tests__ directories"
    echo "Found files:"
    find . -maxdepth 1 -name "*.test.*" -o -name "*.spec.*"
    exit 1
fi

# Check for test files in web app (should be in dedicated test structure)
if find apps/web/src -name "*.test.*" -o -name "*.spec.*" | grep -q .; then
    echo "❌ Error: Test files found in web app source directory"
    echo "ℹ️  Move test files to apps/web/src/__tests__ or use tools package"
    echo "Found files:"
    find apps/web/src -name "*.test.*" -o -name "*.spec.*"
    exit 1
fi

# Check for page tests that should be in tools package
if find apps/web/src -name "*.page.test.*" -o -name "*.page.spec.*" | grep -q .; then
    echo "❌ Error: Page tests found in web app source"
    echo "ℹ️  Move page tests to apps/tools/e2e directory"
    echo "Found files:"
    find apps/web/src -name "*.page.test.*" -o -name "*.page.spec.*"
    exit 1
fi

# Ensure test directories follow naming convention
if find . -path "*/test/*" -not -path "*/node_modules/*" -not -path "*/dist/*" | grep -q .; then
    echo "⚠️  Warning: Found 'test' directories - consider renaming to '__tests__' for consistency"
    find . -path "*/test/*" -not -path "*/node_modules/*" -not -path "*/dist/*"
fi

echo "✅ Test placement guard passed"
exit 0