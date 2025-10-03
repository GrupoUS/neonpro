#!/bin/bash
set -e

echo "🚀 NeonPro Build Script - Starting..."
echo "📦 Using Bun for package management"

# Verify Bun is available
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed!"
    exit 1
fi

echo "✅ Bun version: $(bun --version)"

# Install dependencies with Bun
echo "📥 Installing dependencies with Bun..."
bun install

# Apply manual patch to fix tRPC v11 import issue
echo "🔧 Applying manual patch to fix tRPC v11 import issue..."
sed -i 's|from "@trpc/server/unstable-core-do-not-import"|from "@trpc/server"|g' node_modules/@trpc/react-query/dist/getQueryKey-BY58RNzP.mjs
echo "✅ Patch applied successfully"

# Build the frontend web app
echo "🏗️  Building frontend web app..."
cd apps/web
bun run build

echo "✅ Build completed successfully!"
echo "🎉 NeonPro frontend is ready for deployment!"

