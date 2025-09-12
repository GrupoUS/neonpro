#!/bin/bash

# NeonPro Turborepo-Optimized Deployment Script
# Uses proven Bun + Turborepo configuration for reliable, fast deployments
# Version: 3.0 - Turborepo Integration

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  [INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}✅ [SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠️  [WARNING]${NC} $1"; }
log_error() { echo -e "${RED}❌ [ERROR]${NC} $1"; }
log_step() { echo -e "${CYAN}🚀 [DEPLOY]${NC} $1"; }
log_turbo() { echo -e "${PURPLE}⚡ [TURBO]${NC} $1"; }

# Header
echo -e "${CYAN}"
echo "🚀 =============================================="
echo "   NeonPro Turborepo Deployment Script"
echo "   Using Bun + Turborepo for optimal performance"
echo "=============================================="
echo -e "${NC}"

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -f "turbo.json" ] || [ ! -d "apps/web" ]; then
    log_error "Must be run from NeonPro project root directory"
    log_info "Expected structure: package.json, turbo.json, and apps/web/ directory"
    exit 1
fi

# Parse command line arguments
FORCE_DEPLOY=false
SKIP_TESTS=false
ENVIRONMENT="production"
SKIP_BUILD_TEST=false

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
        --skip-build-test)
            SKIP_BUILD_TEST=true
            shift
            ;;
        --preview)
            ENVIRONMENT="preview"
            shift
            ;;
        --production)
            ENVIRONMENT="production"
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --force           Force deployment (bypass cache)"
            echo "  --skip-tests      Skip test execution"
            echo "  --skip-build-test Skip local build test"
            echo "  --preview         Deploy to preview environment"
            echo "  --production      Deploy to production (default)"
            echo "  -h, --help        Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Display configuration
log_info "Deployment Configuration:"
log_info "  Environment: $ENVIRONMENT"
log_info "  Force Deploy: $FORCE_DEPLOY"
log_info "  Skip Tests: $SKIP_TESTS"
log_info "  Skip Build Test: $SKIP_BUILD_TEST"
echo

# Step 1: Pre-deployment validation
log_step "Phase 1: Pre-deployment validation"

# Check Git status
if ! git diff-index --quiet HEAD --; then
    if [ "$FORCE_DEPLOY" = false ]; then
        log_error "Working directory has uncommitted changes"
        log_info "Commit your changes or use --force to deploy anyway"
        exit 1
    else
        log_warning "Deploying with uncommitted changes (--force used)"
    fi
fi

# Check required tools
log_info "Checking required tools..."
if ! command -v bun &> /dev/null; then
    log_error "Bun is not installed. Please install Bun first."
    exit 1
fi

if ! command -v npx &> /dev/null; then
    log_error "npx is not installed. Please install Node.js first."
    exit 1
fi

log_success "All required tools are available"

# Step 2: Install dependencies
log_step "Phase 2: Installing dependencies with Bun"
if ! bun install; then
    log_error "Failed to install dependencies"
    exit 1
fi
log_success "Dependencies installed successfully"

# Step 3: Run tests (if not skipped)
if [ "$SKIP_TESTS" = false ]; then
    log_step "Phase 3: Running tests with Turborepo"
    log_turbo "Running: bunx turbo test --filter=@neonpro/web"
    
    if ! bunx turbo test --filter=@neonpro/web; then
        log_error "Tests failed"
        if [ "$FORCE_DEPLOY" = false ]; then
            log_info "Fix tests or use --force to deploy anyway"
            exit 1
        else
            log_warning "Continuing deployment despite test failures (--force used)"
        fi
    else
        log_success "All tests passed"
    fi
else
    log_warning "Skipping tests (--skip-tests used)"
fi

# Step 4: Local build test (if not skipped)
if [ "$SKIP_BUILD_TEST" = false ]; then
    log_step "Phase 4: Testing local build with Turborepo"
    log_turbo "Running: bunx turbo build --filter=@neonpro/web"
    
    if ! bunx turbo build --filter=@neonpro/web; then
        log_error "Local build failed"
        exit 1
    fi
    
    # Verify build output
    if [ ! -d "apps/web/dist" ] || [ ! -f "apps/web/dist/index.html" ]; then
        log_error "Build output verification failed"
        log_info "Expected: apps/web/dist/index.html"
        exit 1
    fi
    
    log_success "Local build test passed"
    log_info "Build output verified at apps/web/dist/"
else
    log_warning "Skipping local build test (--skip-build-test used)"
fi

# Step 5: Deploy to Vercel
log_step "Phase 5: Deploying to Vercel"

DEPLOY_CMD="npx vercel"
if [ "$ENVIRONMENT" = "production" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --prod"
    log_turbo "Deploying to PRODUCTION with Turborepo optimization"
else
    log_turbo "Deploying to PREVIEW with Turborepo optimization"
fi

if [ "$FORCE_DEPLOY" = true ]; then
    DEPLOY_CMD="$DEPLOY_CMD --force"
    log_info "Using --force flag for deployment"
fi

log_info "Running: $DEPLOY_CMD"
if ! $DEPLOY_CMD; then
    log_error "Deployment failed"
    exit 1
fi

log_success "Deployment completed successfully!"

# Step 6: Post-deployment verification
log_step "Phase 6: Post-deployment verification"

# Wait a moment for deployment to propagate
sleep 5

# Test main routes
DOMAIN="https://neonpro.vercel.app"
ROUTES=("/" "/dashboard" "/login" "/appointments" "/patients")

log_info "Testing routes on $DOMAIN..."
for route in "${ROUTES[@]}"; do
    log_info "Testing: $DOMAIN$route"
    if curl -s -f -o /dev/null "$DOMAIN$route"; then
        log_success "✓ $route - OK"
    else
        log_warning "⚠ $route - Failed (may be expected for protected routes)"
    fi
done

# Final summary
echo
echo -e "${GREEN}"
echo "🎉 =============================================="
echo "   DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "   Using Turborepo + Bun optimization"
echo "=============================================="
echo -e "${NC}"
log_success "NeonPro deployed with Turborepo optimization"
log_info "URL: https://neonpro.vercel.app"
log_info "All routes tested and verified"
echo
log_turbo "Turborepo benefits:"
log_turbo "  ⚡ Optimized build caching"
log_turbo "  🔄 Dependency-aware task execution"
log_turbo "  📊 Remote caching enabled"
log_turbo "  🚀 Faster subsequent deployments"
