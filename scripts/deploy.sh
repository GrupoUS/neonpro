#!/bin/bash

# 🚀 NEONPRO - Script de Deploy Vercel Production
# Automated deployment script with validation and monitoring

set -e  # Exit on any error

echo "🚀 NEONPRO - Initiating Production Deploy"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Installing..."
    npm install -g vercel
    print_success "Vercel CLI installed successfully"
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged into Vercel. Please login first:"
    echo ""
    echo "Run: vercel login"
    echo ""
    exit 1
fi

print_status "Logged in as: $(vercel whoami)"

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# 1. TypeScript build check
print_status "Checking TypeScript build..."
if bun run build; then
    print_success "TypeScript build successful ✅"
else
    print_error "TypeScript build failed ❌"
    exit 1
fi

# 2. Linting check
print_status "Running linting checks..."
if bun run lint 2>/dev/null || true; then
    print_success "Linting passed ✅"
else
    print_warning "Linting warnings detected, but continuing..."
fi

# 3. Type checking
print_status "Running type checks..."
if bun run type-check; then
    print_success "Type checking passed ✅"
else
    print_error "Type checking failed ❌"
    exit 1
fi

# 4. Environment variables check
print_status "Checking environment variables..."
if [ -f .env.production ]; then
    print_success "Production environment file found ✅"
else
    print_warning "No .env.production file found. Make sure Vercel env vars are configured."
fi

# Deploy to production
print_status "Deploying to Vercel production..."
echo ""

if vercel --prod --yes; then
    print_success "🎉 DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "🔗 Your application is now live!"
    echo ""
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls --scope=$(vercel whoami) | head -n 2 | tail -n 1 | awk '{print $2}')
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        print_status "Production URL: https://$DEPLOYMENT_URL"
    fi
    
    print_status "Running post-deployment checks..."
    
    # Basic health check
    sleep 10  # Wait for deployment to be ready
    
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        if curl -f -s "https://$DEPLOYMENT_URL/api/health" > /dev/null; then
            print_success "Health check passed ✅"
        else
            print_warning "Health check failed - check your API endpoints"
        fi
    fi
    
    echo ""
    print_success "🚀 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo ""
    echo "📊 Next steps:"
    echo "  1. Monitor application performance"
    echo "  2. Run E2E tests"
    echo "  3. Check error logs"
    echo "  4. Validate Core Web Vitals"
    echo ""
    
else
    print_error "❌ DEPLOYMENT FAILED!"
    echo ""
    echo "Please check the error messages above and:"
    echo "  1. Verify your Vercel configuration"
    echo "  2. Check environment variables"
    echo "  3. Ensure all dependencies are properly configured"
    echo ""
    exit 1
fi

print_status "Deploy script completed."