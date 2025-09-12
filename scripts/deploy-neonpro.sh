#!/bin/bash

# NeonPro Quick Deployment Script
# Uses proven Bun-based configuration for reliable deployments

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  [INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}✅ [SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠️  [WARNING]${NC} $1"; }
log_error() { echo -e "${RED}❌ [ERROR]${NC} $1"; }
log_step() { echo -e "${CYAN}🚀 [DEPLOY]${NC} $1"; }

# Header
echo -e "${CYAN}"
echo "🚀 =============================================="
echo "   NeonPro Quick Deployment Script"
echo "   Using proven Bun configuration"
echo "=============================================="
echo -e "${NC}"

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -d "apps/web" ]; then
    log_error "Must be run from NeonPro project root directory"
    log_info "Expected structure: package.json and apps/web/ directory"
    exit 1
fi

# Parse command line arguments
FORCE_DEPLOY=false
SKIP_TESTS=false
ENVIRONMENT="production"

while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --preview)
            ENVIRONMENT="preview"
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --force       Force deployment (bypass cache)"
            echo "  --skip-tests  Skip pre-deployment tests"
            echo "  --preview     Deploy to preview environment"
            echo "  --help        Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Standard production deployment"
            echo "  $0 --force           # Force production deployment"
            echo "  $0 --preview         # Deploy to preview"
            echo "  $0 --skip-tests      # Skip tests and deploy"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            log_info "Use --help for usage information"
            exit 1
            ;;
    esac
done

log_info "Deployment target: $ENVIRONMENT"
log_info "Force deployment: $FORCE_DEPLOY"
log_info "Skip tests: $SKIP_TESTS"

# Step 1: Pre-deployment checks
log_step "Step 1: Pre-deployment Validation"

# Check Vercel CLI
if ! command -v npx &> /dev/null; then
    log_error "npx not found. Please install Node.js"
    exit 1
fi

# Check Vercel authentication
if ! npx vercel whoami &> /dev/null; then
    log_error "Not authenticated with Vercel. Run: npx vercel login"
    exit 1
fi

VERCEL_USER=$(npx vercel whoami)
log_success "Authenticated as: $VERCEL_USER"

# Check project linking
if ! npx vercel ls | grep -q "neonpro"; then
    log_error "Project not linked to Vercel. Run: npx vercel link"
    exit 1
fi

log_success "Project linked to Vercel"

# Step 2: Git status check
log_step "Step 2: Git Status Check"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    log_warning "Uncommitted changes detected:"
    git status --short
    
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
fi

CURRENT_BRANCH=$(git branch --show-current)
COMMIT_HASH=$(git rev-parse --short HEAD)
log_info "Current branch: $CURRENT_BRANCH"
log_info "Commit hash: $COMMIT_HASH"

# Step 3: Local build test (unless skipped)
if [ "$SKIP_TESTS" = false ]; then
    log_step "Step 3: Local Build Test"
    
    cd apps/web
    
    # Check if Bun is available
    if command -v bun &> /dev/null; then
        log_info "Testing build with Bun..."
        bun install
        bun run build
    else
        log_warning "Bun not available, testing with npm..."
        npm install --legacy-peer-deps --ignore-scripts
        npm run build
    fi
    
    # Verify build output
    if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
        log_error "Local build failed - dist/index.html not found"
        exit 1
    fi
    
    BUILD_SIZE=$(du -sh dist | cut -f1)
    log_success "Local build successful (size: $BUILD_SIZE)"
    
    cd ../..
else
    log_warning "Skipping local build test"
fi

# Step 4: Ensure correct Vercel configuration
log_step "Step 4: Vercel Configuration Check"

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    log_error "vercel.json not found"
    exit 1
fi

# Verify Bun configuration is in place
if grep -q "bun install" vercel.json; then
    log_success "Bun configuration detected in vercel.json"
elif grep -q "npm install" vercel.json; then
    log_warning "npm configuration detected - consider using Bun for better reliability"
    
    # Offer to switch to Bun config
    if [ -f "vercel-bun.json" ]; then
        read -p "Switch to proven Bun configuration? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            cp vercel-bun.json vercel.json
            log_success "Switched to Bun configuration"
        fi
    fi
else
    log_error "Invalid vercel.json configuration"
    exit 1
fi

# Step 5: Environment variables check
log_step "Step 5: Environment Variables Check"

ENV_COUNT=$(npx vercel env ls | grep -c "VITE_" || true)
if [ "$ENV_COUNT" -lt 4 ]; then
    log_warning "Only $ENV_COUNT VITE_ environment variables found"
    log_info "Expected: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_APP_ENV, etc."
    
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled - please configure environment variables"
        exit 0
    fi
else
    log_success "Environment variables configured ($ENV_COUNT found)"
fi

# Step 6: Deploy
log_step "Step 6: Deployment"

DEPLOY_CMD="npx vercel"

if [ "$ENVIRONMENT" = "production" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --prod"
fi

if [ "$FORCE_DEPLOY" = true ]; then
    DEPLOY_CMD="$DEPLOY_CMD --force"
fi

log_info "Executing: $DEPLOY_CMD"
echo ""

# Start deployment
DEPLOY_START=$(date +%s)

if $DEPLOY_CMD; then
    DEPLOY_END=$(date +%s)
    DEPLOY_DURATION=$((DEPLOY_END - DEPLOY_START))
    
    log_success "Deployment completed in ${DEPLOY_DURATION}s"
    
    # Get deployment URL
    DEPLOYMENT_URL=$(npx vercel ls | head -2 | tail -1 | awk '{print $1}')
    
    if [ "$ENVIRONMENT" = "production" ]; then
        log_success "Production URL: https://neonpro.vercel.app"
        log_info "Latest deployment: $DEPLOYMENT_URL"
    else
        log_success "Preview URL: $DEPLOYMENT_URL"
    fi
    
    # Step 7: Post-deployment verification
    log_step "Step 7: Post-deployment Verification"
    
    # Wait a moment for deployment to be ready
    sleep 5
    
    # Test main URL
    if [ "$ENVIRONMENT" = "production" ]; then
        TEST_URL="https://neonpro.vercel.app"
    else
        TEST_URL="$DEPLOYMENT_URL"
    fi
    
    log_info "Testing deployment: $TEST_URL"
    
    if curl -s -o /dev/null -w "%{http_code}" "$TEST_URL" | grep -q "200"; then
        log_success "Deployment is accessible and responding"
    else
        log_warning "Deployment may not be fully ready yet"
        log_info "Please check manually: $TEST_URL"
    fi
    
    # Show deployment summary
    echo ""
    echo -e "${CYAN}🎉 Deployment Summary${NC}"
    echo "================================"
    echo "Environment: $ENVIRONMENT"
    echo "Branch: $CURRENT_BRANCH"
    echo "Commit: $COMMIT_HASH"
    echo "Duration: ${DEPLOY_DURATION}s"
    echo "URL: $TEST_URL"
    echo ""
    
    log_success "NeonPro deployment completed successfully! 🚀"
    
else
    log_error "Deployment failed"
    log_info "Check deployment logs: npx vercel logs"
    log_info "For troubleshooting, see: .github/prompts/vercel-deployment-guide.md"
    exit 1
fi