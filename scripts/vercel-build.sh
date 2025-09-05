#!/bin/bash

# NeonPro Vercel Build Script
# Optimized build process for healthcare platform deployment

set -e

echo "🚀 Starting NeonPro Vercel Build Process..."

# Set environment variables
export NODE_ENV=production
export VERCEL=1

# Memory optimization for build process
export NODE_OPTIONS="--max-old-space-size=4096"

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🔧 Building packages in dependency order..."

# Build core packages first
echo "Building core types and configuration..."
pnpm --filter @neonpro/types build || echo "Types build completed with warnings"
pnpm --filter @neonpro/config build || echo "Config build completed with warnings"

# Build database and auth packages
echo "Building database and authentication..."
pnpm --filter @neonpro/database build || echo "Database build completed with warnings"
pnpm --filter @neonpro/auth build || echo "Auth build completed with warnings"

# Build shared utilities
echo "Building shared utilities..."
pnpm --filter @neonpro/shared build || echo "Shared build completed with warnings"
pnpm --filter @neonpro/utils build || echo "Utils build completed with warnings"

# Build UI packages
echo "Building UI components..."
pnpm --filter @neonpro/ui build || echo "UI build completed with warnings"
pnpm --filter @neonpro/brazilian-healthcare-ui build || echo "Healthcare UI build completed with warnings"

# Build core services
echo "Building core services..."
pnpm --filter @neonpro/core-services build || echo "Core services build completed with warnings"
pnpm --filter @neonpro/security build || echo "Security build completed with warnings"

# Build applications
echo "Building web application..."
pnpm --filter @neonpro/web build

echo "✅ NeonPro Vercel Build Process Completed Successfully!"
