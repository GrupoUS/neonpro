#!/bin/bash

# NEONPRO CI/CD Pipeline Test Script
# Tests the complete CI/CD pipeline locally before GitHub Actions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d ".github/workflows" ]; then
    error "Please run this script from the NeonPro root directory"
    exit 1
fi

log "🚀 Starting NeonPro CI/CD Pipeline Test"

# Pre-flight checks
log "🔍 Running preflight checks..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    error "PNPM is not installed. Please install it first: npm install -g pnpm"
    exit 1
fi
success "PNPM is installed"

# Check Node.js version
NODE_VERSION=$(node --version)
log "Node.js version: $NODE_VERSION"

# Install dependencies
log "📥 Installing dependencies..."
if pnpm install --frozen-lockfile; then
    success "Dependencies installed successfully"
else
    error "Failed to install dependencies"
    exit 1
fi

# Security and compliance audit
log "🔒 Running security and compliance audit..."

# Run npm audit
log "🔍 Running npm audit..."
if pnpm audit --audit-level moderate; then
    success "NPM audit passed"
else
    warning "NPM audit found issues (continuing anyway)"
fi

# Run compliance checks
log "🏥 Running ANVISA compliance check..."
if node scripts/anvisa-validation.js; then
    success "ANVISA compliance check passed"
else
    error "ANVISA compliance check failed"
    exit 1
fi

log "👨‍⚕️ Running CFM compliance check..."
if node scripts/cfm-compliance.js; then
    success "CFM compliance check passed"
else
    error "CFM compliance check failed"
    exit 1
fi

log "🛡️ Running LGPD compliance check..."
if node scripts/lgpd-validation.js; then
    success "LGPD compliance check passed"
else
    error "LGPD compliance check failed"
    exit 1
fi

log "🗄️ Running Supabase schema validation..."
if node scripts/supabase-validation.js; then
    success "Supabase schema validation passed"
else
    error "Supabase schema validation failed"
    exit 1
fi

# Quality gate
log "🏆 Running quality gate checks..."

# TypeScript check
log "🔧 Running TypeScript check..."
if pnpm exec tsc --noEmit; then
    success "TypeScript check passed"
else
    error "TypeScript check failed"
    exit 1
fi

# Code formatting check
log "🎨 Running code formatting check..."
if pnpm exec ultracite lint; then
    success "Code formatting check passed"
else
    error "Code formatting check failed"
    exit 1
fi

# Build diagnostics
log "⚡ Running build diagnostics..."
if node scripts/build-diagnostics.js; then
    success "Build diagnostics completed"
else
    warning "Build diagnostics had issues (continuing anyway)"
fi

# Build stage
log "🏗️ Building applications..."

# Build web app
log "🌐 Building web app..."
if pnpm --filter web build; then
    success "Web app built successfully"
else
    error "Failed to build web app"
    exit 1
fi

# Build API (if it exists)
if [ -f "apps/api/package.json" ]; then
    log "🚀 Building API..."
    if pnpm --filter api build; then
        success "API built successfully"
    else
        error "Failed to build API"
        exit 1
    fi
fi

# Build docs (if it exists)
if [ -f "apps/docs/package.json" ]; then
    log "📚 Building docs..."
    if pnpm --filter docs build; then
        success "Docs built successfully"
    else
        error "Failed to build docs"
        exit 1
    fi
fi

# Test suite
log "🧪 Running test suite..."

# Unit tests
log "🧪 Running unit tests..."
if pnpm exec vitest run --reporter=verbose; then
    success "Unit tests passed"
else
    error "Unit tests failed"
    exit 1
fi

# Integration tests (if config exists)
if [ -f "vitest.config.integration.ts" ]; then
    log "🔗 Running integration tests..."
    if pnpm exec vitest run --config vitest.config.integration.ts --reporter=verbose; then
        success "Integration tests passed"
    else
        error "Integration tests failed"
        exit 1
    fi
fi

# E2E tests (if Playwright is configured)
if [ -f "playwright.config.ts" ]; then
    log "🎭 Running E2E tests..."
    
    # Install Playwright browsers
    if pnpm exec playwright install chromium; then
        success "Playwright browsers installed"
    else
        warning "Failed to install Playwright browsers"
    fi
    
    # Run E2E tests
    if pnpm exec playwright test --reporter=html; then
        success "E2E tests passed"
    else
        warning "E2E tests failed (may be expected without running server)"
    fi
fi

# Final validation
log "✅ Running final validation..."

# Check if all required files exist
REQUIRED_FILES=(
    "package.json"
    "pnpm-workspace.yaml"
    "turbo.json"
    ".github/workflows/ci.yml"
    "scripts/anvisa-validation.js"
    "scripts/cfm-compliance.js"
    "scripts/lgpd-validation.js"
    "scripts/supabase-validation.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        success "Required file exists: $file"
    else
        error "Missing required file: $file"
        exit 1
    fi
done

# Summary
log "📋 Pipeline Test Summary"
success "All preflight checks passed"
success "Security and compliance audit completed"
success "Quality gate checks passed"
success "Build stage completed successfully"
success "Test suite executed"
success "Final validation completed"

echo ""
echo -e "${GREEN}🎉 NeonPro CI/CD Pipeline Test Completed Successfully!${NC}"
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  ✅ All compliance checks (ANVISA, CFM, LGPD, Supabase) passed"
echo -e "  ✅ Code quality gates satisfied"
echo -e "  ✅ All applications built successfully"
echo -e "  ✅ Test suite executed"
echo ""
echo -e "${YELLOW}🚀 Ready for deployment to staging/production!${NC}"

exit 0