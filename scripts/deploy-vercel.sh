#!/bin/bash

# 🚀 NeonPro Automated Deployment Script
# Follows TDD-Orchestrator methodology: RED-GREEN-REFACTOR-VALIDATE

set -e  # Exit on any error

echo "🔄 Starting NeonPro Deployment Process..."

# RED Phase - Identify potential issues
echo "📋 RED Phase: Pre-deployment Checks"

# Check authentication
if ! vercel whoami >/dev/null 2>&1; then
    echo "❌ Vercel authentication required"
    echo "💡 Run: vercel login"
    echo "💡 Or set VERCEL_TOKEN environment variable"
    exit 1
fi

echo "✅ Vercel authentication verified"

# Check build dependencies
echo "🔍 Verifying build dependencies..."
if ! bunx turbo build --filter=@neonpro/web --dry-run >/dev/null 2>&1; then
    echo "❌ Build dependency check failed"
    echo "💡 Run: bun install"
    exit 1
fi

echo "✅ Build dependencies verified"

# GREEN Phase - Execute deployment
echo "🚀 GREEN Phase: Deployment Execution"

# Choose deployment config
if [ "$1" = "prod" ]; then
    CONFIG="vercel.json"
    DEPLOY_FLAGS="--prod"
    echo "🎯 Production deployment with enhanced security headers"
else
    CONFIG="vercel-turbo.json"
    DEPLOY_FLAGS=""
    echo "🔧 Development deployment with turbo optimization"
fi

# Execute deployment
echo "📦 Deploying with config: $CONFIG"
pnpm dlx vercel deploy --yes --local-config "$CONFIG" --archive=tgz $DEPLOY_FLAGS

# REFACTOR Phase - Post-deployment optimizations
echo "🔧 REFACTOR Phase: Post-deployment Tasks"

# Get deployment URL
DEPLOYMENT_URL=$(vercel ls --limit=1 --json | jq -r '.[0].url')
echo "🌐 Deployment URL: https://$DEPLOYMENT_URL"

# VALIDATE Phase - Confirm deployment success
echo "✅ VALIDATE Phase: Health Checks"

# Basic health check
if curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL" | grep -q "200"; then
    echo "✅ Deployment health check passed"
else
    echo "⚠️  Health check failed - manual verification required"
fi

echo "🎉 Deployment process completed!"
echo "🔗 URL: https://$DEPLOYMENT_URL"
echo ""
echo "📋 Next Steps:"
echo "  1. Test functionality manually"
echo "  2. Configure custom domain if needed"
echo "  3. Set up monitoring and alerts"