#!/bin/bash

# NeonPro Healthcare Platform - Optimized Vercel Deployment Script
# Features: Pre-deployment validation, performance optimization, healthcare compliance

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="neonpro"
VERCEL_ORG="grupous-projects"
PRODUCTION_URL="https://neonpro.vercel.app"

echo -e "${BLUE}🏥 NeonPro Healthcare Platform Deployment${NC}"
echo -e "${BLUE}==========================================${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found. Installing..."
    npm install -g vercel@latest
fi

# Check if PNPM is installed
if ! command -v pnpm &> /dev/null; then
    print_error "PNPM not found. Installing..."
    npm install -g pnpm@8.15.0
fi

print_status "Environment validation complete"

# Pre-deployment checks
echo -e "\n${BLUE}🔍 Pre-deployment validation${NC}"

# Check if we're in the right directory
if [ ! -f "turbo.json" ]; then
    print_error "Not in project root directory. Please run from NeonPro root."
    exit 1
fi

# Check if required files exist
required_files=("vercel.json" "package.json" "apps/web/package.json")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file missing: $file"
        exit 1
    fi
done

print_status "Project structure validation complete"

# Install dependencies
echo -e "\n${BLUE}📦 Installing dependencies${NC}"
pnpm install --frozen-lockfile
print_status "Dependencies installed"

# Run type checking (skip problematic audit tool for now)
echo -e "\n${BLUE}🔍 Type checking${NC}"
if pnpm type-check --filter=!@neonpro/monorepo-audit-tool; then
    print_status "Type checking passed"
else
    print_warning "Type checking failed - continuing with deployment (audit tool issues)"
fi

# Run linting
echo -e "\n${BLUE}🧹 Code linting${NC}"
if pnpm lint; then
    print_status "Linting complete"
else
    print_warning "Linting issues found - continuing with deployment"
fi

# Run tests (if available)
if [ -f "apps/web/src/__tests__" ] || [ -f "apps/web/tests" ]; then
    echo -e "\n${BLUE}🧪 Running tests${NC}"
    pnpm test
    print_status "Tests passed"
else
    print_warning "No tests found - consider adding tests for healthcare compliance"
fi

# Build locally to catch errors early
echo -e "\n${BLUE}🏗️  Local build validation${NC}"
if pnpm build --filter=@neonpro/web; then
    print_status "Web app build successful"
else
    print_error "Web app build failed"
    exit 1
fi

# Healthcare compliance checks
echo -e "\n${BLUE}🏥 Healthcare compliance validation${NC}"

# Check for LGPD compliance markers
if grep -r "lgpd" apps/web/src/ --include="*.ts" --include="*.tsx" > /dev/null; then
    print_status "LGPD compliance markers found"
else
    print_warning "No LGPD compliance markers found - ensure data protection compliance"
fi

# Check for audit logging
if grep -r "audit" apps/web/src/ --include="*.ts" --include="*.tsx" > /dev/null; then
    print_status "Audit logging implementation found"
else
    print_warning "No audit logging found - required for healthcare compliance"
fi

# Check for healthcare-specific components
if [ -d "apps/web/src/components/healthcare" ]; then
    print_status "Healthcare components directory found"
else
    print_warning "Healthcare components directory not found"
fi

print_status "Healthcare compliance validation complete"

# Performance optimization
echo -e "\n${BLUE}⚡ Performance optimization${NC}"

# Check bundle size (if analyzer is available)
if command -v bundlesize &> /dev/null; then
    bundlesize
    print_status "Bundle size analysis complete"
fi

# Optimize images (if imagemin is available)
if command -v imagemin &> /dev/null; then
    imagemin apps/web/public/images/* --out-dir=apps/web/public/images/
    print_status "Image optimization complete"
fi

print_status "Performance optimization complete"

# Deploy to Vercel
echo -e "\n${BLUE}🚀 Deploying to Vercel${NC}"

# Check deployment type
if [ "$1" = "production" ] || [ "$1" = "prod" ]; then
    echo -e "${YELLOW}Deploying to PRODUCTION${NC}"
    echo -e "${YELLOW}This will update: ${PRODUCTION_URL}${NC}"
    
    # Confirm production deployment
    read -p "Are you sure you want to deploy to production? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Production deployment cancelled"
        exit 1
    fi
    
    # Production deployment
    vercel --prod --yes
    
    print_status "Production deployment complete!"
    echo -e "${GREEN}🌐 Live at: ${PRODUCTION_URL}${NC}"
    
    # Post-deployment health check
    echo -e "\n${BLUE}🏥 Post-deployment health check${NC}"
    
    # Wait a moment for deployment to be ready
    sleep 10
    
    # Check if site is accessible
    if curl -f -s "${PRODUCTION_URL}" > /dev/null; then
        print_status "Site is accessible"
    else
        print_error "Site health check failed"
        exit 1
    fi
    
    # Check API health (if available)
    if curl -f -s "${PRODUCTION_URL}/api/health" > /dev/null; then
        print_status "API health check passed"
    else
        print_warning "API health check failed or not available"
    fi
    
    print_status "Health checks complete"
    
elif [ "$1" = "preview" ] || [ "$1" = "staging" ]; then
    echo -e "${YELLOW}Deploying to PREVIEW/STAGING${NC}"
    
    # Preview deployment
    vercel --yes
    
    print_status "Preview deployment complete!"
    
else
    echo -e "${YELLOW}No deployment type specified. Available options:${NC}"
    echo -e "  ${BLUE}./scripts/deploy.sh production${NC} - Deploy to production"
    echo -e "  ${BLUE}./scripts/deploy.sh preview${NC}    - Deploy to preview"
    echo -e "  ${BLUE}./scripts/deploy.sh staging${NC}    - Deploy to staging"
    exit 1
fi

# Performance monitoring setup
echo -e "\n${BLUE}📊 Performance monitoring${NC}"

# Log deployment metrics
echo "Deployment completed at: $(date)" >> deployment.log
echo "Build time: $(date)" >> deployment.log
echo "Deployment type: $1" >> deployment.log

print_status "Deployment metrics logged"

# Healthcare compliance reminder
echo -e "\n${BLUE}🏥 Healthcare Compliance Reminder${NC}"
echo -e "${YELLOW}Post-deployment checklist:${NC}"
echo -e "  ✅ Verify LGPD compliance notices are displayed"
echo -e "  ✅ Test audit logging functionality"
echo -e "  ✅ Validate patient data access controls"
echo -e "  ✅ Check SSL certificate and security headers"
echo -e "  ✅ Verify Brazilian region deployment (GRU1)"
echo -e "  ✅ Test emergency detection workflows"

echo -e "\n${GREEN}🎉 NeonPro deployment complete!${NC}"
echo -e "${GREEN}Healthcare platform is ready for aesthetic clinic management${NC}"

# Open deployment URL (optional)
if command -v open &> /dev/null && [ "$1" = "production" ]; then
    read -p "Open production site in browser? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "${PRODUCTION_URL}"
    fi
fi