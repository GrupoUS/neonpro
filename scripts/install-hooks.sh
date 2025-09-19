#!/bin/bash

# Install Pre-commit Hooks for NeonPro Healthcare Platform
# LGPD, ANVISA, and CFM compliance automation

set -e

echo "🏥 Installing NeonPro Healthcare Compliance Hooks..."

# Check if pre-commit is installed
if ! command -v pre-commit &> /dev/null; then
    echo "📦 Installing pre-commit..."
    if command -v pip &> /dev/null; then
        pip install pre-commit
    elif command -v brew &> /dev/null; then
        brew install pre-commit
    else
        echo "❌ Error: Please install pre-commit manually"
        echo "Visit: https://pre-commit.com/#installation"
        exit 1
    fi
fi

# Install the hooks
echo "🔧 Installing pre-commit hooks..."
pre-commit install --install-hooks

# Install additional hook types
pre-commit install --hook-type pre-push

echo "✅ Healthcare compliance hooks installed successfully!"
echo ""
echo "🔍 The following validations will run on each commit:"
echo "  • LGPD personal data protection checks"
echo "  • ANVISA protocol format validation"
echo "  • CFM license format validation"
echo "  • Healthcare secrets detection"
echo "  • Patient data encryption verification"
echo "  • Audit trail validation"
echo "  • Test coverage for critical healthcare functions"
echo "  • Healthcare documentation requirements"
echo ""
echo "🚀 To run hooks manually: pre-commit run --all-files"
echo "🔧 To update hooks: pre-commit autoupdate"