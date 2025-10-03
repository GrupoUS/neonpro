#!/bin/bash
set -e

echo "🚀 NeonPro Simplified Build - Starting..."

# Install dependencies
echo "📥 Installing dependencies with Bun..."
bun install

# Apply tRPC v11 patch
echo "🔧 Applying tRPC v11 compatibility patch..."
TRPC_FILE="node_modules/@trpc/react-query/dist/getQueryKey-BY58RNzP.mjs"
if [ -f "$TRPC_FILE" ]; then
    sed -i '/from "@trpc\/server\/unstable-core-do-not-import"/d' "$TRPC_FILE"
    sed -i '2a\\n// Inline isObject function\nfunction isObject(value) {\n  return value !== null && typeof value === "object";\n}' "$TRPC_FILE"
    echo "✅ tRPC patch applied"
else
    echo "⚠️ tRPC file not found, skipping patch"
fi

# Build only the frontend web app
echo "🏗️ Building frontend web app..."
cd apps/web
bun run build
cd ../..

# Validate output
if [ ! -d "apps/web/dist" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

