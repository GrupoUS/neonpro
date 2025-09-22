#!/bin/bash

# NeonPro Package Manager Fallback Script
# Prioritizes Bun while supporting PNPM and NPM as fallbacks

set -e

# Color codes for output
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get package manager version
get_pm_version() {
    local pm=$1
    case $pm in
        "bun") command_exists bun && bun --version | head -n1 ;;
        "pnpm") command_exists pnpm && pnpm --version ;;
        "npm") command_exists npm && npm --version ;;
        *) echo "unknown" ;;
    esac
}

# Function to detect best available package manager
detect_package_manager() {
    # Priority: Bun > PNPM > NPM
    if command_exists bun; then
        echo "bun"
    elif command_exists pnpm; then
        echo "pnpm"
    elif command_exists npm; then
        echo "npm"
    else
        print_error "No package manager found. Please install Bun, PNPM, or NPM."
        exit 1
    fi
}

# Function to run command with fallback
run_with_fallback() {
    local cmd=$1
    local args="${@:2}"
    local primary_pm="bun"
    local fallback_pm1="pnpm"
    local fallback_pm2="npm"
    
    print_status "Attempting to run: $cmd $args"
    
    # Try primary package manager first
    if command_exists $primary_pm; then
        print_status "Using $primary_pm (primary)..."
        if $primary_pm $cmd $args; then
            print_success "Command completed successfully with $primary_pm"
            return 0
        else
            print_warning "$primary_pm failed, trying $fallback_pm1..."
        fi
    fi
    
    # Try first fallback
    if command_exists $fallback_pm1; then
        print_status "Using $fallback_pm1 (fallback 1)..."
        if $fallback_pm1 $cmd $args; then
            print_success "Command completed successfully with $fallback_pm1"
            return 0
        else
            print_warning "$fallback_pm1 failed, trying $fallback_pm2..."
        fi
    fi
    
    # Try second fallback
    if command_exists $fallback_pm2; then
        print_status "Using $fallback_pm2 (fallback 2)..."
        if $fallback_pm2 $cmd $args; then
            print_success "Command completed successfully with $fallback_pm2"
            return 0
        fi
    fi
    
    print_error "All package managers failed to execute: $cmd $args"
    return 1
}

# Function to install dependencies
install_deps() {
    print_status "Installing dependencies..."
    run_with_fallback "install"
}

# Function to run development server
dev_server() {
    local package=${1:-"web"}
    print_status "Starting development server for $package..."
    run_with_fallback "run" "dev:web"
}

# Function to run tests
run_tests() {
    local test_type=${1:-"all"}
    print_status "Running $test_type tests..."
    run_with_fallback "test:$test_type"
}

# Function to build project
build_project() {
    print_status "Building project..."
    run_with_fallback "build"
}

# Function to check available package managers
check_pms() {
    print_status "Checking available package managers:"
    
    if command_exists bun; then
        local bun_version=$(get_pm_version "bun")
        print_success "Bun: $bun_version (PRIMARY)"
    else
        print_warning "Bun: Not found"
    fi
    
    if command_exists pnpm; then
        local pnpm_version=$(get_pm_version "pnpm")
        print_success "PNPM: $pnpm_version (FALLBACK 1)"
    else
        print_warning "PNPM: Not found"
    fi
    
    if command_exists npm; then
        local npm_version=$(get_pm_version "npm")
        print_success "NPM: $npm_version (FALLBACK 2)"
    else
        print_warning "NPM: Not found"
    fi
}

# Main script logic
case "${1:-check}" in
    "check")
        check_pms
        ;;
    "install")
        install_deps
        ;;
    "dev")
        dev_server "$2"
        ;;
    "test")
        run_tests "$2"
        ;;
    "build")
        build_project
        ;;
    "fallback")
        shift
        run_with_fallback "$@"
        ;;
    "detect")
        detected=$(detect_package_manager)
        print_success "Detected package manager: $detected"
        ;;
    *)
        echo "NeonPro Package Manager Fallback Script"
        echo ""
        echo "Usage:"
        echo "  $0 check              - Check available package managers"
        echo "  $0 install            - Install dependencies"
        echo "  $0 dev [package]      - Start development server"
        echo "  $0 test [type]        - Run tests"
        echo "  $0 build              - Build project"
        echo "  $0 fallback <cmd>     - Run command with fallback"
        echo "  $0 detect             - Detect best available package manager"
        echo ""
        echo "Priority: Bun > PNPM > NPM"
        exit 1
        ;;
esac