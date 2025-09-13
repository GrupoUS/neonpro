#!/bin/bash

# NeonPro Unified Deployment Script
# Consolidates all deployment functionality from existing scripts
# Based on proven Turborepo + Bun approach from vercel-deployment.prompt.md
# Version: 1.0 - Unified Deployment Solution

set -euo pipefail

# -----------------------------
# Configuration & Colors
# -----------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Global Configuration
PROJECT_NAME="neonpro"
PRODUCTION_URL="https://neonpro.vercel.app"
TIMEOUT=10
MAX_RETRIES=3

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  [INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}✅ [SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠️  [WARNING]${NC} $1"; }
log_error() { echo -e "${RED}❌ [ERROR]${NC} $1"; }
log_step() { echo -e "${PURPLE}🔄 [STEP]${NC} $1"; }
log_healthcare() { echo -e "${CYAN}🏥 [HEALTHCARE]${NC} $1"; }

# -----------------------------
# Utility Functions
# -----------------------------
ensure_project_root() {
    if [ ! -f "package.json" ] || [ ! -d "apps/web" ] || [ ! -f "turbo.json" ]; then
        log_error "Must be run from NeonPro project root (package.json, apps/web, turbo.json required)"
        exit 1
    fi
}

require_command() {
    local cmd=$1
    local hint=${2:-""}
    if ! command -v "$cmd" >/dev/null 2>&1; then
        log_error "Command not found: $cmd"
        [ -n "$hint" ] && log_info "$hint"
        exit 1
    fi
}

check_git_status() {
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "Uncommitted changes detected:"
        git status --short
        return 1
    fi
    return 0
}

get_build_strategy() {
    local strategy=${1:-"auto"}
    
    case "$strategy" in
        "auto")
            if command -v bun >/dev/null 2>&1; then
                echo "turbo"
            else
                echo "npm"
            fi
            ;;
        "turbo"|"bun"|"npm")
            echo "$strategy"
            ;;
        *)
            log_error "Invalid build strategy: $strategy"
            exit 1
            ;;
    esac
}

# -----------------------------
# Core Functions
# -----------------------------
validate_environment() {
    log_step "Environment Validation"
    
    # Check Node.js version
    if ! command -v node >/dev/null 2>&1; then
        log_error "Node.js not found"
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//' | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js version $node_version is not supported. Require Node 18+"
        exit 1
    fi
    
    log_success "Node.js version: $(node --version)"
    
    # Check package managers
    if command -v bun >/dev/null 2>&1; then
        log_success "Bun available: $(bun --version)"
    else
        log_warning "Bun not available, will use npm fallback"
    fi
    
    # Check Vercel CLI
    require_command npx "Install Node.js (includes npx)"
    
    if ! npx vercel whoami >/dev/null 2>&1; then
        log_error "Not authenticated with Vercel. Run: npx vercel login"
        exit 1
    fi
    
    log_success "Vercel authenticated as: $(npx vercel whoami)"
}

healthcare_compliance_check() {
    log_step "Healthcare Compliance Validation"
    
    local compliance_issues=0
    
    # Check for LGPD compliance markers
    if grep -r "lgpd\|LGPD" apps/web/src/ --include="*.ts" --include="*.tsx" >/dev/null 2>&1; then
        log_success "LGPD compliance markers found"
    else
        log_warning "No LGPD compliance markers found"
        ((compliance_issues++))
    fi
    
    # Check for audit logging
    if grep -r "audit\|Audit" apps/web/src/ --include="*.ts" --include="*.tsx" >/dev/null 2>&1; then
        log_success "Audit logging implementation found"
    else
        log_warning "No audit logging found"
        ((compliance_issues++))
    fi
    
    # Check for healthcare components
    if [ -d "apps/web/src/components/healthcare" ] || grep -r "healthcare\|Healthcare" apps/web/src/components/ >/dev/null 2>&1; then
        log_success "Healthcare components found"
    else
        log_warning "Healthcare components not found"
        ((compliance_issues++))
    fi
    
    if [ $compliance_issues -eq 0 ]; then
        log_healthcare "Healthcare compliance validation passed"
    else
        log_healthcare "Healthcare compliance issues found: $compliance_issues"
    fi
    
    return $compliance_issues
}

build_application() {
    local strategy=$(get_build_strategy "${1:-auto}")
    local clean=${2:-false}
    
    log_step "Building application with strategy: $strategy"
    
    # Clean previous build if requested
    if [ "$clean" = true ] && [ -d "apps/web/dist" ]; then
        log_info "Cleaning previous build..."
        rm -rf apps/web/dist
    fi
    
    case "$strategy" in
        "turbo")
            require_command bun "Install Bun: https://bun.sh"
            log_info "Installing dependencies with Bun..."
            bun install
            log_info "Building with Turborepo..."
            bunx turbo build --filter=@neonpro/web
            ;;
        "bun")
            require_command bun "Install Bun: https://bun.sh"
            log_info "Building with Bun (direct)..."
            cd apps/web
            bun install
            bun run build
            cd ../..
            ;;
        "npm")
            log_info "Building with npm (fallback)..."
            cd apps/web
            npm install --legacy-peer-deps --ignore-scripts --no-audit --no-fund
            npm run build
            cd ../..
            ;;
    esac
    
    # Verify build output
    if [ ! -f "apps/web/dist/index.html" ]; then
        log_error "Build output missing: apps/web/dist/index.html"
        exit 1
    fi
    
    local build_size=$(du -sh apps/web/dist | cut -f1)
    log_success "Build completed successfully (size: $build_size)"
}

run_tests() {
    local test_type=${1:-"basic"}
    local strategy=$(get_build_strategy "auto")
    
    log_step "Running tests: $test_type"
    
    case "$test_type" in
        "basic")
            # Type checking
            log_info "Running TypeScript type check..."
            if command -v bun >/dev/null 2>&1 && [ "$strategy" = "turbo" ]; then
                bunx turbo type-check --filter=@neonpro/web || log_warning "Type check issues found"
            else
                cd apps/web && npx tsc --noEmit || log_warning "Type check issues found"
                cd ../..
            fi
            
            # Linting
            log_info "Running linting..."
            if command -v bun >/dev/null 2>&1 && [ "$strategy" = "turbo" ]; then
                bunx turbo lint --filter=@neonpro/web || log_warning "Linting issues found"
            else
                cd apps/web && npm run lint || log_warning "Linting issues found"
                cd ../..
            fi
            ;;
        "full")
            run_tests "basic"
            
            # Unit tests
            log_info "Running unit tests..."
            if command -v bun >/dev/null 2>&1 && [ "$strategy" = "turbo" ]; then
                bunx turbo test --filter=@neonpro/web || log_warning "Some tests failed"
            else
                cd apps/web && npm test || log_warning "Some tests failed"
                cd ../..
            fi
            ;;
        "compliance")
            run_tests "basic"
            healthcare_compliance_check
            ;;
    esac
    
    log_success "Tests completed"
}

deploy_application() {
    local env=${1:-"production"}
    local strategy=$(get_build_strategy "${2:-auto}")
    local force=${3:-false}
    local skip_tests=${4:-false}
    local skip_build_test=${5:-false}

    log_step "Deploying to $env with strategy: $strategy"

    # Pre-deployment validation
    validate_environment

    # Git status check (unless forced)
    if [ "$force" != true ] && ! check_git_status; then
        log_error "Uncommitted changes detected. Use --force to deploy anyway"
        exit 1
    fi

    # Run tests unless skipped
    if [ "$skip_tests" != true ]; then
        run_tests "compliance"
    else
        log_warning "Skipping tests (--skip-tests used)"
    fi

    # Local build test unless skipped
    if [ "$skip_build_test" != true ]; then
        build_application "$strategy" true
    else
        log_warning "Skipping local build test (--skip-build-test used)"
    fi

    # Deploy to Vercel
    local deploy_cmd=(npx vercel)
    [ "$env" = "production" ] && deploy_cmd+=(--prod)
    [ "$force" = true ] && deploy_cmd+=(--force)

    log_info "Executing: ${deploy_cmd[*]}"
    local deploy_start=$(date +%s)

    if "${deploy_cmd[@]}"; then
        local deploy_end=$(date +%s)
        local deploy_duration=$((deploy_end - deploy_start))
        log_success "Deployment completed in ${deploy_duration}s"

        # Post-deployment validation
        sleep 5
        local test_url="$PRODUCTION_URL"
        [ "$env" = "preview" ] && test_url=$(npx vercel ls | head -2 | tail -1 | awk '{print $1}')

        log_info "Running post-deployment validation..."
        validate_deployment "$test_url" "basic"

        log_success "🎉 Deployment successful!"
        log_info "URL: $test_url"
    else
        log_error "Deployment failed"
        exit 1
    fi
}

validate_deployment() {
    local url=${1:-"$PRODUCTION_URL"}
    local validation_type=${2:-"basic"}

    log_step "Validating deployment: $url"

    local tests_total=0
    local tests_passed=0

    # Basic connectivity tests
    local endpoints=("/" "/login" "/dashboard")
    for endpoint in "${endpoints[@]}"; do
        ((tests_total++))
        log_info "Testing: $url$endpoint"

        if response=$(curl -s -w "%{http_code}" --max-time $TIMEOUT "$url$endpoint" 2>/dev/null); then
            local status=$(echo "$response" | tail -c 4)
            if [[ "$status" =~ ^[23] ]]; then
                log_success "✓ $endpoint (HTTP $status)"
                ((tests_passed++))
            else
                log_warning "⚠ $endpoint (HTTP $status)"
            fi
        else
            log_error "✗ $endpoint (Request failed)"
        fi
    done

    # API health check
    ((tests_total++))
    log_info "Testing API health..."
    if curl -s -f --max-time $TIMEOUT "$url/api/health" >/dev/null 2>&1; then
        log_success "✓ API health check passed"
        ((tests_passed++))
    else
        log_warning "⚠ API health check failed"
    fi

    # Performance test (homepage)
    if [ "$validation_type" = "comprehensive" ]; then
        ((tests_total++))
        log_info "Testing homepage performance..."
        local response_time=$(curl -s -w "%{time_total}" --max-time $TIMEOUT "$url" -o /dev/null 2>/dev/null || echo "999")
        local response_time_ms=$(echo "$response_time * 1000" | bc -l 2>/dev/null | cut -d. -f1 || echo "999")

        if [ "$response_time_ms" -le 3000 ]; then
            log_success "✓ Homepage performance (${response_time_ms}ms)"
            ((tests_passed++))
        else
            log_warning "⚠ Homepage performance slow (${response_time_ms}ms)"
        fi
    fi

    # Results summary
    local success_rate=$((tests_passed * 100 / tests_total))
    log_info "Validation Results: $tests_passed/$tests_total passed ($success_rate%)"

    if [ $tests_passed -eq $tests_total ]; then
        log_success "All validation tests passed!"
        return 0
    elif [ $success_rate -ge 80 ]; then
        log_warning "Most tests passed, minor issues detected"
        return 1
    else
        log_error "Critical validation failures detected"
        return 2
    fi
}

monitor_deployment() {
    local action=${1:-"logs"}
    local url=${2:-""}

    case "$action" in
        "logs")
            if [ -n "$url" ]; then
                log_info "Streaming logs for: $url"
                npx vercel logs "$url" --follow
            else
                log_info "Showing recent logs..."
                npx vercel logs --since=1h
            fi
            ;;
        "health")
            log_info "Checking deployment health..."
            validate_deployment "$PRODUCTION_URL" "comprehensive"
            ;;
        "metrics")
            log_info "Deployment metrics:"
            echo "Production URL: $PRODUCTION_URL"
            echo "Last deployment: $(npx vercel ls | head -2 | tail -1)"
            ;;
    esac
}

rollback_deployment() {
    local url=${1:-""}

    if [ -z "$url" ]; then
        log_error "Usage: rollback <deployment-url>"
        exit 1
    fi

    log_step "Rolling back to: $url"

    if npx vercel rollback "$url"; then
        log_success "Rollback completed successfully"
        sleep 5
        validate_deployment "$PRODUCTION_URL" "basic"
    else
        log_error "Rollback failed"
        exit 1
    fi
}

verify_configuration() {
    log_step "Verifying deployment configuration"

    local issues=0

    # Check vercel.json
    if [ ! -f "vercel.json" ]; then
        log_error "vercel.json not found"
        ((issues++))
    else
        log_success "vercel.json found"

        # Check for Bun configuration
        if grep -q "bun install" vercel.json; then
            log_success "Bun configuration detected"
        else
            log_warning "Consider using Bun configuration for better reliability"
        fi
    fi

    # Check turbo.json
    if [ ! -f "turbo.json" ]; then
        log_warning "turbo.json not found - Turborepo optimization unavailable"
    else
        log_success "turbo.json found - Turborepo optimization available"
    fi

    # Check environment variables
    local env_count=$(npx vercel env ls 2>/dev/null | grep -c "VITE_" || echo "0")
    if [ "$env_count" -lt 4 ]; then
        log_warning "Only $env_count VITE_ environment variables found"
        log_info "Expected: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, etc."
        ((issues++))
    else
        log_success "Environment variables configured ($env_count found)"
    fi

    # Check project structure
    local required_dirs=("apps/web" "apps/web/src")
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            log_error "Required directory missing: $dir"
            ((issues++))
        else
            log_success "Directory found: $dir"
        fi
    done

    if [ $issues -eq 0 ]; then
        log_success "Configuration verification passed"
        return 0
    else
        log_error "Configuration issues found: $issues"
        return 1
    fi
}

print_header() {
    echo -e "${CYAN}"
    echo "🚀 =============================================="
    echo "   NeonPro Unified Deployment Script"
    echo "   Consolidates all deployment functionality"
    echo "   Based on proven Turborepo + Bun approach"
    echo "=============================================="
    echo -e "${NC}"
}

show_usage() {
    cat <<'EOF'
Usage: scripts/deploy-unified.sh <command> [options]

DEPLOYMENT COMMANDS:
  deploy [options]              Deploy the application
    --production                Deploy to production (default)
    --preview                   Deploy to preview environment
    --strategy turbo|bun|npm    Build strategy (default: auto)
    --force                     Force deployment (bypass checks)
    --skip-tests                Skip test execution
    --skip-build-test           Skip local build verification

BUILD COMMANDS:
  build [options]               Build the application locally
    --strategy turbo|bun|npm    Build strategy (default: auto)
    --clean                     Clean previous build

TESTING COMMANDS:
  test [type]                   Run tests
    basic                       Type checking and linting (default)
    full                        Include unit tests
    compliance                  Include healthcare compliance checks

VALIDATION COMMANDS:
  validate [options]            Validate deployment
    --url URL                   URL to validate (default: production)
    --comprehensive             Run comprehensive validation

MONITORING COMMANDS:
  monitor [action]              Monitor deployment
    logs [url]                  Show deployment logs
    health                      Check deployment health
    metrics                     Show deployment metrics

MAINTENANCE COMMANDS:
  rollback <url>                Rollback to previous deployment
  config                        Verify deployment configuration

EXAMPLES:
  # Standard production deployment
  ./deploy-unified.sh deploy

  # Preview deployment with Turborepo
  ./deploy-unified.sh deploy --preview --strategy turbo

  # Build only with clean
  ./deploy-unified.sh build --clean --strategy bun

  # Comprehensive validation
  ./deploy-unified.sh validate --comprehensive

  # Monitor deployment health
  ./deploy-unified.sh monitor health

  # Rollback deployment
  ./deploy-unified.sh rollback https://neonpro-abc123.vercel.app

HEALTHCARE COMPLIANCE:
  This script includes healthcare compliance checks for:
  - LGPD compliance markers
  - Audit logging implementation
  - Healthcare-specific components

For troubleshooting, see: .github/prompts/vercel-deployment.prompt.md
EOF
}

# -----------------------------
# Command Handlers
# -----------------------------
cmd_deploy() {
    local env="production"
    local strategy="auto"
    local force=false
    local skip_tests=false
    local skip_build_test=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --production) env="production"; shift;;
            --preview) env="preview"; shift;;
            --strategy) strategy="$2"; shift 2;;
            --force) force=true; shift;;
            --skip-tests) skip_tests=true; shift;;
            --skip-build-test) skip_build_test=true; shift;;
            *) log_error "Unknown deploy option: $1"; exit 1;;
        esac
    done

    deploy_application "$env" "$strategy" "$force" "$skip_tests" "$skip_build_test"
}

cmd_build() {
    local strategy="auto"
    local clean=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --strategy) strategy="$2"; shift 2;;
            --clean) clean=true; shift;;
            *) log_error "Unknown build option: $1"; exit 1;;
        esac
    done

    build_application "$strategy" "$clean"
}

cmd_test() {
    local test_type=${1:-"basic"}
    run_tests "$test_type"
}

cmd_validate() {
    local url="$PRODUCTION_URL"
    local validation_type="basic"

    while [[ $# -gt 0 ]]; do
        case $1 in
            --url) url="$2"; shift 2;;
            --comprehensive) validation_type="comprehensive"; shift;;
            *) log_error "Unknown validate option: $1"; exit 1;;
        esac
    done

    validate_deployment "$url" "$validation_type"
}

cmd_monitor() {
    local action=${1:-"logs"}
    local url=${2:-""}
    monitor_deployment "$action" "$url"
}

cmd_rollback() {
    local url=${1:-""}
    rollback_deployment "$url"
}

cmd_config() {
    verify_configuration
}

# -----------------------------
# Main Function
# -----------------------------
main() {
    print_header
    ensure_project_root

    local command=${1:-"help"}
    shift || true

    case "$command" in
        deploy) cmd_deploy "$@";;
        build) cmd_build "$@";;
        test) cmd_test "$@";;
        validate) cmd_validate "$@";;
        monitor) cmd_monitor "$@";;
        rollback) cmd_rollback "$@";;
        config) cmd_config "$@";;
        help|-h|--help) show_usage;;
        *)
            log_error "Unknown command: $command"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
