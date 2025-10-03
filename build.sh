#!/bin/bash
set -e

echo "🚀 NeonPro Simplified Build - Starting..."

# Install dependencies with Bun
echo "📥 Installing dependencies with Bun..."
bun install

# Apply tRPC v11 patch to ALL files that import isObject
echo "🔧 Applying tRPC v11 compatibility patch..."
find node_modules/@trpc -name "*.mjs" -type f -exec grep -l 'from "@trpc/server/unstable-core-do-not-import"' {} \; | while read -r file; do
    echo "Patching: $file"
    sed -i '/from "@trpc\/server\/unstable-core-do-not-import"/d' "$file"
    sed -i '2a\\n// Inline isObject function\nfunction isObject(value) {\n  return value !== null && typeof value === "object";\n}' "$file"
done
echo "✅ tRPC patches applied to all files"

# Build only the frontend web app
echo "🏗️ Building frontend web app..."
cd apps/web
bunx vite build
cd ../..

# Validate output
if [ ! -d "apps/web/dist" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

