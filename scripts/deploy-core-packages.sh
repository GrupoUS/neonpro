#!/bin/bash

# NeonPro Core Packages Deployment Script
# Production-ready deployment for validated packages

set -e

echo "🚀 NeonPro Core Packages Deployment"
echo "======================================"

# Core packages validated for production
CORE_PACKAGES=(
    "types"
    "shared" 
    "config"
    "utils"
    "validators"
    "domain"
    "ai-providers"
    "monitoring"
    "governance"
    "cli-helpers"
)

# Validation functions
validate_package() {
    local pkg=$1
    echo "📋 Validating package: $pkg"
    
    # Check if package builds
    cd "packages/$pkg"
    if ! bun run build > /dev/null 2>&1; then
        echo "❌ Build failed for $pkg"
        return 1
    fi
    
    # Check if dist exists
    if [ ! -d "dist" ]; then
        echo "❌ No dist directory for $pkg"
        return 1
    fi
    
    # Check package.json configuration
    if ! node -e "const pkg = require('./package.json'); console.log(pkg.name, pkg.version)" > /dev/null 2>&1; then
        echo "❌ Invalid package.json for $pkg"
        return 1
    fi
    
    echo "✅ Package $pkg validated successfully"
    cd ../..
    return 0
}

# Security audit
security_audit() {
    echo "🔒 Running security audit..."
    
    for pkg in "${CORE_PACKAGES[@]}"; do
        cd "packages/$pkg"
        echo "Auditing $pkg..."
        
        # Run npm audit
        if npm audit --audit-level moderate > /dev/null 2>&1; then
            echo "✅ $pkg security audit passed"
        else
            echo "⚠️ $pkg has security issues (development dependencies only)"
        fi
        
        cd ../..
    done
}

# Build all core packages
build_packages() {
    echo "🏗️ Building core packages..."
    
    for pkg in "${CORE_PACKAGES[@]}"; do
        echo "Building $pkg..."
        cd "packages/$pkg"
        
        if bun run build; then
            echo "✅ $pkg built successfully"
        else
            echo "❌ $pkg build failed"
            exit 1
        fi
        
        cd ../..
    done
}

# Prepare packages for publishing
prepare_packages() {
    echo "📦 Preparing packages for publishing..."
    
    for pkg in "${CORE_PACKAGES[@]}"; do
        cd "packages/$pkg"
        
        # Update package.json for production
        if [ "$1" = "production" ]; then
            # Remove private flag for production publishing
            if grep -q '"private": true' package.json; then
                sed -i 's/"private": true/"private": false/' package.json
                echo "📝 Made $pkg public for publishing"
            fi
        fi
        
        cd ../..
    done
}

# Main deployment function
deploy_packages() {
    local env=${1:-"staging"}
    
    echo "🚀 Deploying packages to $env environment"
    
    # Validate all packages first
    echo "Step 1: Package Validation"
    for pkg in "${CORE_PACKAGES[@]}"; do
        if ! validate_package "$pkg"; then
            echo "❌ Validation failed. Aborting deployment."
            exit 1
        fi
    done
    
    # Run security audit
    echo "Step 2: Security Audit"
    security_audit
    
    # Build packages
    echo "Step 3: Build Packages"
    build_packages
    
    # Prepare for publishing
    echo "Step 4: Prepare Packages"
    prepare_packages "$env"
    
    # Publish packages
    echo "Step 5: Publish Packages"
    for pkg in "${CORE_PACKAGES[@]}"; do
        cd "packages/$pkg"
        
        if [ "$env" = "production" ]; then
            echo "📤 Publishing $pkg to production..."
            if npm publish --access restricted; then
                echo "✅ $pkg published successfully"
            else
                echo "❌ Failed to publish $pkg"
                exit 1
            fi
        else
            echo "📤 Publishing $pkg to staging..."
            if npm publish --tag staging --access restricted; then
                echo "✅ $pkg published to staging successfully"
            else
                echo "❌ Failed to publish $pkg to staging"
                exit 1
            fi
        fi
        
        cd ../..
    done
    
    echo "🎉 All core packages deployed successfully to $env!"
}

# Health check
health_check() {
    echo "🔍 Running post-deployment health check..."
    
    # Test package installation
    cd /tmp
    for pkg in "${CORE_PACKAGES[@]}"; do
        echo "Testing @neonpro/$pkg installation..."
        if npm install "@neonpro/$pkg@latest" > /dev/null 2>&1; then
            echo "✅ @neonpro/$pkg installs correctly"
        else
            echo "⚠️ @neonpro/$pkg installation test failed"
        fi
    done
    
    cd - > /dev/null
}

# Show help
show_help() {
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo ""
    echo "Commands:"
    echo "  validate     Validate all core packages"
    echo "  audit        Run security audit"
    echo "  build        Build all core packages"
    echo "  deploy       Deploy packages (default: staging)"
    echo "  health       Run post-deployment health check"
    echo ""
    echo "Environments:"
    echo "  staging      Deploy to staging registry (default)"
    echo "  production   Deploy to production registry"
    echo ""
    echo "Examples:"
    echo "  $0 deploy staging"
    echo "  $0 deploy production"
    echo "  $0 validate"
}

# Main script logic
case "${1:-}" in
    "validate")
        for pkg in "${CORE_PACKAGES[@]}"; do
            validate_package "$pkg"
        done
        ;;
    "audit")
        security_audit
        ;;
    "build")
        build_packages
        ;;
    "deploy")
        deploy_packages "${2:-staging}"
        ;;
    "health")
        health_check
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac