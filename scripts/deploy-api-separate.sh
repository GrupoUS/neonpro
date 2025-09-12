#!/bin/bash

# Deploy API Separately to Vercel
# This script creates a separate Vercel project for the API to avoid framework conflicts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$PROJECT_ROOT/apps/api"
TEMP_DIR="/tmp/neonpro-api-deploy"

echo -e "${BLUE}🚀 NeonPro API Separate Deployment${NC}"
echo -e "${BLUE}📍 Project Root: $PROJECT_ROOT${NC}"
echo ""

# Function to print status
print_status() {
    local status=$1
    local message=$2
    case $status in
        "info")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
    esac
}

# Check if Vercel CLI is installed
if ! command -v vercel >/dev/null 2>&1; then
    print_status "error" "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

print_status "info" "Creating temporary deployment directory..."

# Clean up any existing temp directory
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy API files to temp directory
print_status "info" "Copying API files..."
cp -r "$API_DIR"/* "$TEMP_DIR/"
cp "$PROJECT_ROOT/api"/* "$TEMP_DIR/api/" 2>/dev/null || true

# Copy configuration files
cp "$PROJECT_ROOT/api-vercel.json" "$TEMP_DIR/vercel.json"
cp "$PROJECT_ROOT/package.json.vercel" "$TEMP_DIR/package.json"

# Create a simple package.json for the API
cat > "$TEMP_DIR/package.json" << EOF
{
  "name": "neonpro-api",
  "version": "1.0.0",
  "private": true,
  "description": "NeonPro API - Separate Deployment",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.8.2"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "@types/node": "^20.11.5"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
EOF

print_status "info" "Changing to temporary directory..."
cd "$TEMP_DIR"

print_status "info" "Deploying API to Vercel..."

# Deploy to Vercel
if vercel --prod --yes; then
    print_status "success" "🎉 API deployed successfully!"
    print_status "info" "The API should now be accessible at the provided URL"
    print_status "info" "Update your web app environment variables to point to the new API URL"
else
    print_status "error" "Deployment failed"
    exit 1
fi

# Clean up
print_status "info" "Cleaning up temporary files..."
cd "$PROJECT_ROOT"
rm -rf "$TEMP_DIR"

print_status "success" "✨ Deployment process completed!"
echo ""
print_status "info" "Next steps:"
print_status "info" "1. Update web app environment variables to use the new API URL"
print_status "info" "2. Test the API endpoints on the new deployment"
print_status "info" "3. Update CORS configuration if needed"
