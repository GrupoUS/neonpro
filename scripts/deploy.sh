#!/bin/bash

# NeonPro Deployment Script
# This script handles the deployment process for the NeonPro application

set -e  # Exit on any error

echo "🚀 Starting NeonPro deployment..."

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

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    print_success "All required environment variables are set"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    npm run test:ci
    print_success "All tests passed"
}

# Type checking
type_check() {
    print_status "Running type check..."
    npm run type-check
    print_success "Type check passed"
}

# Linting
lint_code() {
    print_status "Running linter..."
    npm run lint
    print_success "Linting passed"
}

# Build application
build_app() {
    print_status "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Run database migrations (if using Supabase CLI)
run_migrations() {
    print_status "Checking for database migrations..."
    
    if command -v supabase &> /dev/null; then
        print_status "Running database migrations..."
        supabase db push
        print_success "Database migrations completed"
    else
        print_warning "Supabase CLI not found. Skipping migrations."
        print_warning "Make sure to run migrations manually if needed."
    fi
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        vercel --prod
        print_success "Deployed to Vercel successfully"
    else
        print_error "Vercel CLI not found. Please install it with: npm i -g vercel"
        exit 1
    fi
}

# Deploy to other platforms
deploy_other() {
    print_status "Deploying to production..."
    
    # Add your deployment commands here
    # Examples:
    # - Docker build and push
    # - Upload to server
    # - Run deployment scripts
    
    print_success "Deployment completed"
}

# Main deployment function
main() {
    echo "🌟 NeonPro - Sistema de Gestão para Clínicas Estéticas"
    echo "=================================================="
    
    # Parse command line arguments
    PLATFORM=${1:-"vercel"}
    SKIP_TESTS=${2:-"false"}
    
    print_status "Deployment platform: $PLATFORM"
    print_status "Skip tests: $SKIP_TESTS"
    
    # Check environment
    check_env_vars
    
    # Install dependencies
    install_dependencies
    
    # Run quality checks
    if [ "$SKIP_TESTS" != "true" ]; then
        type_check
        lint_code
        run_tests
    else
        print_warning "Skipping tests as requested"
    fi
    
    # Build application
    build_app
    
    # Run migrations
    run_migrations
    
    # Deploy based on platform
    case $PLATFORM in
        "vercel")
            deploy_vercel
            ;;
        "docker")
            print_status "Docker deployment not implemented yet"
            exit 1
            ;;
        "manual")
            deploy_other
            ;;
        *)
            print_error "Unknown platform: $PLATFORM"
            print_error "Supported platforms: vercel, docker, manual"
            exit 1
            ;;
    esac
    
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Verify the application is running correctly"
    echo "2. Run smoke tests on the deployed environment"
    echo "3. Monitor logs for any issues"
    echo ""
    echo "Happy coding! 🚀"
}

# Show help
show_help() {
    echo "NeonPro Deployment Script"
    echo ""
    echo "Usage: $0 [platform] [skip_tests]"
    echo ""
    echo "Parameters:"
    echo "  platform    Deployment platform (vercel|docker|manual) [default: vercel]"
    echo "  skip_tests  Skip running tests (true|false) [default: false]"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy to Vercel with tests"
    echo "  $0 vercel true        # Deploy to Vercel without tests"
    echo "  $0 manual false       # Manual deployment with tests"
    echo ""
    echo "Environment variables required:"
    echo "  NEXT_PUBLIC_SUPABASE_URL"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  SUPABASE_SERVICE_ROLE_KEY"
}

# Handle command line arguments
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# Run main function
main "$@"
