#!/bin/bash

# Vercel Build Script for NeonPro Healthcare Platform
# Production-optimized build with healthcare compliance validation

set -e

echo "🏥 Starting NeonPro Healthcare Production Build..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Script must be run from project root."
    exit 1
fi

# Verify this is the NeonPro project
if ! grep -q '"name": "neonpro"' package.json; then
    echo "❌ Error: This script must be run from the NeonPro root directory."
    exit 1
fi

echo "✅ Verified NeonPro project structure"

# Healthcare Critical: Validate environment variables
echo "🔒 Validating healthcare production environment..."
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Required healthcare database environment variables missing"
    exit 1
fi
echo "✅ Healthcare database configuration validated"

# Clean any existing build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf apps/web/.next
rm -rf apps/web/.turbo
rm -rf .turbo

# Install dependencies with production optimization
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile --production=false

# Healthcare Critical: TypeScript validation for patient safety
echo "🛡️ Validating TypeScript for patient safety..."
pnpm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Error: TypeScript validation failed - Patient safety requirement"
    exit 1
fi
echo "✅ TypeScript validation passed"

# Healthcare Critical: Code quality validation
echo "📋 Validating code quality for healthcare compliance..."
pnpm run lint:biome
echo "✅ Code quality validation passed"

# Build workspace packages first
echo "🔨 Building workspace packages..."
pnpm run build --filter=!@neonpro/web

# Build the web application with production optimization
echo "🌐 Building production web application..."
cd apps/web
NODE_ENV=production pnpm run build

echo "🏥 ✅ NeonPro Healthcare Production Build Completed Successfully!"
echo "🔍 Build artifacts ready for healthcare deployment"