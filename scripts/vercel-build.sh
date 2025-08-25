#!/bin/bash

# Vercel Build Script for NeonPro Monorepo
# Handles workspace dependencies and build optimization

set -e

echo "🚀 Starting NeonPro Vercel Build Process..."

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

# Clean any existing build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf apps/web/.next
rm -rf apps/web/.turbo
rm -rf .turbo

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile --production=false

# Build workspace packages first
echo "🔨 Building workspace packages..."
pnpm run build --filter=!@neonpro/web

# Build the web application
echo "🌐 Building web application..."
cd apps/web
pnpm run build

echo "✅ NeonPro build completed successfully!"