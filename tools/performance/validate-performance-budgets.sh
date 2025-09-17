#!/bin/bash

# Healthcare Performance Budget Validation Script
# Ensures patient safety through strict performance monitoring
# LGPD/ANVISA compliance for medical data access times

set -e

echo "🏥 Healthcare Performance Budget Validation"
echo "=========================================="
echo "Validating performance budgets for patient safety..."
echo "LGPD/ANVISA compliance requirements active"
echo ""

# Check if lighthouse CI is installed
if ! command -v lhci &> /dev/null; then
    echo "❌ Lighthouse CI not found. Installing..."
    npm install -g @lhci/cli
fi

# Check if budget file exists
if [ ! -f "lighthouse-budget.json" ]; then
    echo "❌ lighthouse-budget.json not found!"
    exit 1
fi

echo "✅ Budget configuration found"
echo "📊 Running performance audit..."

# Run lighthouse CI with healthcare-specific settings
lhci autorun --config=lighthouserc.js

echo ""
echo "🔍 Performance Budget Summary:"
echo "- LCP Target: ≤2000ms (patient safety)"
echo "- FCP Target: ≤1500ms (data access)"
echo "- CLS Target: ≤0.05 (form stability)"
echo "- TBT Target: ≤300ms (workflow efficiency)"
echo ""
echo "✅ Healthcare performance validation complete"