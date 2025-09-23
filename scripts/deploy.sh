#!/bin/bash

# NeonPro Deployment Script
# For aesthetic clinic management platform

set -e

echo "🚀 Starting NeonPro deployment..."

# Environment setup
ENVIRONMENT=${1:-preview}
echo "📋 Deployment environment: $ENVIRONMENT"

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Build the application
echo "🔨 Building application..."
bun run vercel-build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
if [ "$ENVIRONMENT" = "production" ]; then
    vercel deploy --prod --scope grupous-projects --yes
elif [ "$ENVIRONMENT" = "staging" ]; then
    vercel deploy --scope grupous-projects --yes
else
    vercel deploy --scope grupous-projects --yes
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Check your Vercel dashboard for the deployment URL"