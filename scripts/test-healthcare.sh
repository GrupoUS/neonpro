#!/bin/bash

# 🏥 NeonPro Healthcare Platform - Simplified Testing Script
# This script provides easy access to the simplified testing configurations
# that are integrated with the CI/CD pipelines.

set -e

echo "🏥 NeonPro Healthcare Platform - Testing Suite"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if we're in the right directory
check_directory() {
    if [[ ! -f "package.json" ]] || [[ ! -d "tools/testing" ]]; then
        print_status $RED "❌ Error: This script must be run from the NeonPro project root directory"
        exit 1
    fi
}

# Function to install dependencies if needed
ensure_dependencies() {
    print_status $BLUE "📦 Ensuring dependencies are installed..."
    
    if [[ ! -d "node_modules" ]]; then
        print_status $YELLOW "⚡ Installing root dependencies..."
        pnpm install --frozen-lockfile
    fi
    
    if [[ ! -d "tools/testing/node_modules" ]]; then
        print_status $YELLOW "⚡ Installing testing dependencies..."
        cd tools/testing
        pnpm install
        cd ../..
    fi
    
    print_status $GREEN "✅ Dependencies ready"
}

# Function to run quality checks
run_quality_checks() {
    print_status $BLUE "🎯 Running Healthcare Quality Checks..."
    
    echo "📊 Format check (Biome + Ultracite)..."
    pnpm format:check
    
    echo "🔍 Lint check (Biome + Ultracite)..."
    pnpm lint:biome
    
    echo "🔧 TypeScript validation..."
    pnpm type-check
    
    print_status $GREEN "✅ Quality checks passed"
}

# Function to run unit tests
run_unit_tests() {
    print_status $BLUE "🧪 Running Healthcare Unit Tests (Simplified Vitest)..."
    
    cd tools/testing
    pnpm vitest --reporter=verbose --config vitest.simple.config.ts
    cd ../..
    
    print_status $GREEN "✅ Healthcare unit tests completed"
}

# Function to run unit tests with coverage
run_unit_tests_with_coverage() {
    print_status $BLUE "📊 Running Healthcare Unit Tests with Coverage..."
    
    cd tools/testing
    pnpm coverage
    cd ../..
    
    print_status $GREEN "✅ Coverage report generated at tools/testing/coverage/"
}

# Function to run E2E tests
run_e2e_tests() {
    print_status $BLUE "🎭 Running Healthcare E2E Tests (Simplified Playwright)..."
    
    cd tools/testing
    
    # Install Playwright browsers if not already installed
    if [[ ! -d "$HOME/.cache/ms-playwright" ]] && [[ ! -d "~/Library/Caches/ms-playwright" ]]; then
        print_status $YELLOW "📦 Installing Playwright browsers..."
        pnpm exec playwright install --with-deps
    fi
    
    pnpm test:playwright
    cd ../..
    
    print_status $GREEN "✅ Healthcare E2E tests completed"
}

# Function to run security audit
run_security_audit() {
    print_status $BLUE "🔒 Running Healthcare Security Audit..."
    
    echo "🔍 Dependency security audit..."
    pnpm audit --audit-level moderate
    
    echo "🏥 LGPD compliance check..."
    if grep -r "cpf.*=.*[0-9]\{11\}" --include="*.ts" --include="*.tsx" . 2>/dev/null; then
        print_status $YELLOW "⚠️ Potential CPF data found - please review"
    else
        print_status $GREEN "✅ No hardcoded sensitive data detected"
    fi
    
    print_status $GREEN "✅ Security audit completed"
}

# Function to run build validation
run_build_validation() {
    print_status $BLUE "🏗️ Running Healthcare Build Validation..."
    
    pnpm build
    
    print_status $GREEN "✅ Healthcare platform build successful"
}

# Function to display help
show_help() {
    echo "🏥 NeonPro Healthcare Platform - Testing Commands"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  quality          Run quality checks (format, lint, type-check)"
    echo "  unit            Run healthcare unit tests (simplified vitest)"
    echo "  unit-coverage   Run unit tests with coverage report"
    echo "  e2e             Run healthcare E2E tests (simplified playwright)"
    echo "  security        Run security and compliance audit"
    echo "  build           Run build validation"
    echo "  all             Run all tests and checks (CI simulation)"
    echo "  ci              Run full CI validation locally"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 quality       # Run quality checks only"
    echo "  $0 unit         # Run unit tests only"
    echo "  $0 all          # Run everything (like CI)"
    echo ""
    echo "🔧 Simplified Testing Configuration:"
    echo "  - Uses tools/testing/vitest.simple.config.ts (no Prisma conflicts)"
    echo "  - Uses tools/testing/playwright.simple.config.ts (healthcare optimized)"
    echo "  - Includes 21 auth tests + 5 patient validation tests"
    echo "  - LGPD, ANVISA, and CFM compliance validation"
    echo ""
}

# Main script logic
main() {
    case "${1:-help}" in
        "quality")
            check_directory
            ensure_dependencies
            run_quality_checks
            ;;
        "unit")
            check_directory
            ensure_dependencies
            run_unit_tests
            ;;
        "unit-coverage")
            check_directory
            ensure_dependencies
            run_unit_tests_with_coverage
            ;;
        "e2e")
            check_directory
            ensure_dependencies
            run_e2e_tests
            ;;
        "security")
            check_directory
            ensure_dependencies
            run_security_audit
            ;;
        "build")
            check_directory
            ensure_dependencies
            run_build_validation
            ;;
        "all"|"ci")
            check_directory
            ensure_dependencies
            print_status $BLUE "🚀 Running Full Healthcare CI Validation..."
            
            run_quality_checks
            run_unit_tests_with_coverage
            run_e2e_tests
            run_security_audit
            run_build_validation
            
            print_status $GREEN "🎉 All healthcare validations passed!"
            print_status $GREEN "🏥 Platform ready for deployment"
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"