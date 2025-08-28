#!/bin/bash

# CI/CD Test Automation Script
# Executes comprehensive test suite with quality gates

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COVERAGE_THRESHOLD=80
MAX_RETRIES=3
TEST_TIMEOUT=300  # 5 minutes

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Error handler
error_handler() {
    log_error "Script failed at line $1"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    log_error "pnpm is not installed. Please install pnpm first."
    exit 1
fi

# Main execution
main() {
    log "Starting CI/CD Test Pipeline"
    
    # Step 1: Install dependencies
    log "Installing dependencies..."
    pnpm install --frozen-lockfile
    
    # Step 2: Type checking
    log "Running TypeScript type checking..."
    pnpm run type-check
    log_success "Type checking passed"
    
    # Step 3: Linting
    log "Running OXC Oxlint..."
    pnpm run lint
    log_success "Linting passed"
    
    # Step 4: Code formatting check
    log "Checking code formatting with Dprint..."
    pnpm run format:check
    log_success "Code formatting check passed"
    
    # Step 5: Unit tests with coverage
    log "Running unit tests with coverage..."
    pnpm run test:unit:coverage
    
    # Check coverage threshold
    if [ -f "coverage/coverage-summary.json" ]; then
        COVERAGE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json')).total.lines.pct)")
        if (( $(echo "$COVERAGE < $COVERAGE_THRESHOLD" | bc -l) )); then
            log_error "Coverage $COVERAGE% is below threshold $COVERAGE_THRESHOLD%"
            exit 1
        fi
        log_success "Coverage $COVERAGE% meets threshold"
    fi
    
    # Step 6: Integration tests
    log "Running integration tests..."
    pnpm run test:integration
    log_success "Integration tests passed"
    
    # Step 7: E2E tests with retries
    log "Running E2E tests..."
    for i in $(seq 1 $MAX_RETRIES); do
        if timeout $TEST_TIMEOUT pnpm run test:e2e; then
            log_success "E2E tests passed"
            break
        else
            if [ $i -eq $MAX_RETRIES ]; then
                log_error "E2E tests failed after $MAX_RETRIES attempts"
                exit 1
            else
                log_warning "E2E tests failed, retrying... ($i/$MAX_RETRIES)"
                sleep 10
            fi
        fi
    done
    
    # Step 8: Build verification
    log "Running build verification..."
    pnpm run build
    log_success "Build verification passed"
    
    # Step 9: Generate test reports
    log "Generating test reports..."
    generate_reports
    
    log_success "All CI/CD checks passed successfully!"
}

# Generate comprehensive test reports
generate_reports() {
    mkdir -p reports
    
    # Combine coverage reports
    if [ -d "coverage" ]; then
        cp -r coverage reports/
        log "Coverage report available at reports/coverage/index.html"
    fi
    
    # Copy Playwright reports
    if [ -d "playwright-report" ]; then
        cp -r playwright-report reports/
        log "Playwright report available at reports/playwright-report/index.html"
    fi
    
    # Copy test results
    if [ -d "test-results" ]; then
        cp -r test-results reports/
    fi
    
    # Generate summary report
    cat > reports/summary.md << EOF
# Test Execution Summary

**Date:** $(date)
**Branch:** ${GITHUB_REF_NAME:-$(git branch --show-current)}
**Commit:** ${GITHUB_SHA:-$(git rev-parse HEAD)}

## Test Results

- ✅ Type Checking: Passed
- ✅ Linting: Passed
- ✅ Formatting: Passed
- ✅ Unit Tests: Passed
- ✅ Integration Tests: Passed
- ✅ E2E Tests: Passed
- ✅ Build: Passed

## Coverage

Coverage threshold: $COVERAGE_THRESHOLD%
Actual coverage: ${COVERAGE:-"N/A"}%

## Reports

- [Coverage Report](./coverage/index.html)
- [Playwright Report](./playwright-report/index.html)
EOF
    
    log_success "Test summary generated at reports/summary.md"
}

# Cleanup function
cleanup() {
    log "Cleaning up..."
    # Kill any remaining processes
    pkill -f "vite" || true
    pkill -f "playwright" || true
}

# Set up cleanup trap
trap cleanup EXIT

# Execute main function
main "$@"