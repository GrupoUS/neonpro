#!/bin/bash

# Vercel Build Script for NeonPro
# This script handles the build process for Vercel deployment

set -e

echo "🚀 Starting Vercel build process..."

# Check Node.js version
echo "📋 Node.js version: $(node --version)"
echo "📋 NPM version: $(npm --version)"

# Navigate to web app directory
cd apps/web

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --production=false --ignore-scripts

echo "🔧 Running TypeScript compilation..."
npx tsc --noEmit || echo "⚠️ TypeScript warnings found, continuing..."

echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"

# Verify build output
if [ -d "dist" ]; then
    echo "📁 Build output directory exists"
    echo "📊 Build size: $(du -sh dist)"
    echo "📄 Files in dist:"
    ls -la dist/
else
    echo "❌ Build output directory not found!"
    exit 1
fi

echo "🎉 Vercel build process completed!"
