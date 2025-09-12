#!/bin/bash

# NeonPro Optimized Vercel Build Script
# Based on successful Bun deployment experience that resolved npm/pnpm monorepo issues
# Version: 2.0 - Optimized for reliability and performance

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  [INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ [SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️  [WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}❌ [ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}🔄 [STEP]${NC} $1"
}

# Error handling function
handle_error() {
    local exit_code=$?
    log_error "Build failed at line $1 with exit code $exit_code"
    log_error "Last command: $BASH_COMMAND"
    
    # Cleanup on error
    log_step "Performing cleanup..."
    
    # Show recent logs for debugging
    if [ -f "build.log" ]; then
        log_info "Last 20 lines of build log:"
        tail -20 build.log
    fi
    
    exit $exit_code
}

# Set error trap
trap 'handle_error $LINENO' ERR

# Start build process
echo -e "${CYAN}"
echo "🚀 =============================================="
echo "   NeonPro Optimized Vercel Build Process"
echo "   Using proven Bun package manager approach"
echo "=============================================="
echo -e "${NC}"

# Create build log
exec 1> >(tee -a build.log)
exec 2> >(tee -a build.log >&2)

log_info "Build started at: $(date)"
log_info "Build environment: ${VERCEL_ENV:-local}"
log_info "Git commit: ${VERCEL_GIT_COMMIT_SHA:-unknown}"

# Phase 1: Environment Validation
log_step "Phase 1: Environment Validation"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found in current directory: $(pwd)"
    log_info "Expected to be in project root. Attempting to navigate..."
    
    if [ -f "../../package.json" ]; then
        cd ../..
        log_info "Navigated to project root: $(pwd)"
    else
        log_error "Could not find project root with package.json"
        exit 1
    fi
fi

# Verify monorepo structure
if [ ! -d "apps/web" ]; then
    log_error "Monorepo structure invalid: apps/web directory not found"
    exit 1
fi

log_success "Monorepo structure validated"

# Check Bun availability (primary package manager)
if command -v bun &> /dev/null; then
    BUN_VERSION=$(bun --version)
    log_success "Bun available: v$BUN_VERSION"
    PACKAGE_MANAGER="bun"
    INSTALL_CMD="bun install"
    BUILD_CMD="bun run build"
else
    log_warning "Bun not available, falling back to npm"
    PACKAGE_MANAGER="npm"
    INSTALL_CMD="npm install --legacy-peer-deps --ignore-scripts --no-audit --no-fund"
    BUILD_CMD="npm run build"
fi

# Check Node.js version
NODE_VERSION=$(node --version)
log_info "Node.js version: $NODE_VERSION"

# Verify Node.js version compatibility (require Node 18+)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -lt 18 ]; then
    log_error "Node.js version $NODE_VERSION is not supported. Require Node 18+"
    exit 1
fi

log_success "Node.js version compatible"

# Phase 2: Pre-build Validation
log_step "Phase 2: Pre-build Validation"

# Navigate to web app directory
cd apps/web

# Verify package.json exists in web app
if [ ! -f "package.json" ]; then
    log_error "package.json not found in apps/web directory"
    exit 1
fi

# Check for required build script
if ! grep -q '"build"' package.json; then
    log_error "Build script not found in package.json"
    exit 1
fi

log_success "Web app structure validated"

# Phase 3: Dependency Installation
log_step "Phase 3: Dependency Installation ($PACKAGE_MANAGER)"

log_info "Installing dependencies with: $INSTALL_CMD"
start_time=$(date +%s)

if [ "$PACKAGE_MANAGER" = "bun" ]; then
    # Bun installation (proven working approach)
    bun install
else
    # npm fallback with optimized flags
    npm install --legacy-peer-deps --ignore-scripts --no-audit --no-fund --production=false
fi

end_time=$(date +%s)
install_duration=$((end_time - start_time))
log_success "Dependencies installed in ${install_duration}s"

# Verify node_modules exists
if [ ! -d "node_modules" ]; then
    log_error "node_modules directory not created after installation"
    exit 1
fi

# Phase 4: Pre-build Checks
log_step "Phase 4: Pre-build Checks"

# Check TypeScript compilation (non-blocking)
log_info "Running TypeScript type check..."
if command -v tsc &> /dev/null; then
    if npx tsc --noEmit; then
        log_success "TypeScript compilation successful"
    else
        log_warning "TypeScript warnings found, continuing build..."
    fi
else
    log_warning "TypeScript not available, skipping type check"
fi

# Check for critical files
CRITICAL_FILES=("src/main.tsx" "index.html" "vite.config.ts")
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        log_error "Critical file missing: $file"
        exit 1
    fi
done

log_success "Pre-build checks completed"

# Phase 5: Build Process
log_step "Phase 5: Build Process ($PACKAGE_MANAGER)"

log_info "Starting build with: $BUILD_CMD"
build_start_time=$(date +%s)

# Clean previous build
if [ -d "dist" ]; then
    log_info "Cleaning previous build..."
    rm -rf dist
fi

# Run build command
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun run build
else
    npm run build
fi

build_end_time=$(date +%s)
build_duration=$((build_end_time - build_start_time))
log_success "Build completed in ${build_duration}s"

# Phase 6: Build Validation
log_step "Phase 6: Build Validation"

# Verify build output directory
if [ ! -d "dist" ]; then
    log_error "Build output directory 'dist' not found!"
    log_error "Expected build output in: $(pwd)/dist"
    exit 1
fi

# Check for essential build files
ESSENTIAL_FILES=("dist/index.html")
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        log_error "Essential build file missing: $file"
        exit 1
    fi
done

# Calculate build size
BUILD_SIZE=$(du -sh dist | cut -f1)
FILE_COUNT=$(find dist -type f | wc -l)

log_success "Build output validated"
log_info "Build size: $BUILD_SIZE"
log_info "File count: $FILE_COUNT"

# Show build contents (first level only)
log_info "Build contents:"
ls -la dist/ | head -20

# Phase 7: Performance Analysis
log_step "Phase 7: Performance Analysis"

# Check for large files (>1MB)
LARGE_FILES=$(find dist -type f -size +1M 2>/dev/null || true)
if [ -n "$LARGE_FILES" ]; then
    log_warning "Large files detected (>1MB):"
    echo "$LARGE_FILES" | while read -r file; do
        size=$(du -h "$file" | cut -f1)
        log_warning "  $file ($size)"
    done
fi

# Check main bundle size
MAIN_JS=$(find dist/assets -name "index-*.js" | head -1)
if [ -n "$MAIN_JS" ] && [ -f "$MAIN_JS" ]; then
    MAIN_SIZE=$(du -h "$MAIN_JS" | cut -f1)
    log_info "Main bundle size: $MAIN_SIZE"
    
    # Warn if main bundle is very large (>1MB)
    MAIN_SIZE_BYTES=$(du -b "$MAIN_JS" | cut -f1)
    if [ "$MAIN_SIZE_BYTES" -gt 1048576 ]; then
        log_warning "Main bundle is large (>1MB). Consider code splitting."
    fi
fi

# Phase 8: Final Validation
log_step "Phase 8: Final Validation"

# Verify critical assets exist
CRITICAL_ASSETS=("dist/index.html" "dist/assets")
for asset in "${CRITICAL_ASSETS[@]}"; do
    if [ ! -e "$asset" ]; then
        log_error "Critical asset missing: $asset"
        exit 1
    fi
done

# Check if index.html has proper structure
if ! grep -q "<div id=\"root\">" dist/index.html; then
    log_warning "index.html may not have proper React root element"
fi

# Calculate total build time
total_end_time=$(date +%s)
total_duration=$((total_end_time - start_time))

# Build summary
echo -e "${CYAN}"
echo "🎉 =============================================="
echo "   Build Summary"
echo "=============================================="
echo -e "${NC}"

log_success "Build completed successfully!"
log_info "Package Manager: $PACKAGE_MANAGER"
log_info "Total Build Time: ${total_duration}s"
log_info "Install Time: ${install_duration}s"
log_info "Build Time: ${build_duration}s"
log_info "Output Size: $BUILD_SIZE"
log_info "File Count: $FILE_COUNT"
log_info "Build completed at: $(date)"

# Environment-specific actions
if [ "${VERCEL_ENV:-}" = "production" ]; then
    log_info "Production deployment detected"
    log_info "Deployment URL will be available at: https://neonpro.vercel.app"
elif [ "${VERCEL_ENV:-}" = "preview" ]; then
    log_info "Preview deployment detected"
    log_info "Preview URL will be generated by Vercel"
fi

# Success exit
log_success "NeonPro build process completed successfully! 🚀"
exit 0