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

# Export environment variables for Vite build
echo "🔧 Setting up environment variables..."
export VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-https://ownkoxryswokcdanrdgj.supabase.co}"
export VITE_SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY}"
export VITE_APP_ENV="${VITE_APP_ENV:-production}"
export VITE_API_URL="${VITE_API_URL:-https://neonpro-bun.vercel.app/api}"
export VITE_SITE_URL="${VITE_SITE_URL:-https://neonpro-bun.vercel.app}"

echo "✅ Environment variables configured"
echo "   VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}"
echo "   VITE_APP_ENV: ${VITE_APP_ENV}"

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

