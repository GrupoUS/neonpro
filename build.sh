#!/bin/bash
set -e

echo "🚀 NeonPro Simplified Build - Starting..."

# Install dependencies
echo "📥 Installing dependencies with Bun..."
bun install

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

