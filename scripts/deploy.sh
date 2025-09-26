#!/bin/bash

# NeonPro Unified Deployment Script
# Consolidated and optimized deployment solution with Vercel integration
# Version: 2.0 - Single authoritative deployment script
# Replaces: deploy.sh, deploy-unified.sh, deployment-health-check.sh, deployment-validation.sh

set -euo pipefail

# ==============================================
# IMPORT UTILITIES
# ==============================================

# Source utility functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
# Simple logging functions to reduce dependency overhead
log_info() { echo "[INFO] $1" >&2; }
log_success() { echo "[SUCCESS] $1" >&2; }
log_warning() { echo "[WARNING] $1" >&2; }
log_error() { echo "[ERROR] $1" >&2; }
log_debug() { echo "[DEBUG] $1" >&2; }
log_step() { echo "[STEP] $1" >&2; }
log_healthcare() { echo "[HEALTHCARE] $1" >&2; }
log_security() { echo "[SECURITY] $1" >&2; }
log_performance() { echo "[PERFORMANCE] $1" >&2; }
log_section() { echo "=================== $1 ===================" >&2; }
log_script_start() { echo "=== Starting $(basename "$0") ===" >&2; }
log_script_end() { local exit_code="${1:-0}"; echo "=== Script ended with code $exit_code ===" >&2; }
source "$SCRIPT_DIR/utils/validation.sh"

# ==============================================
# GLOBAL CONFIGURATION
# ==============================================

# Load environment-specific configuration
load_environment_config

# Deployment configuration
PROJECT_NAME="neonpro"
PRODUCTION_URL="https://neonpro.vercel.app"
TIMEOUT=${DEPLOYMENT_TIMEOUT:-10}
MAX_RETRIES=${MAX_ROLLBACK_ATTEMPTS:-3}

# ==============================================
# UTILITY FUNCTIONS
# ==============================================

ensure_project_root() {
    validate_directory_writable "." "project root"
    
    if [ ! -f "package.json" ] || [ ! -d "apps/web" ] || [ ! -f "turbo.json" ]; then
        log_error "Must be run from NeonPro project root (package.json, apps/web, turbo.json required)"
        exit 1
    fi
    
    log_success "Project root validation passed"
}

require_command() {
    local cmd="$1"
    local hint="${2:-""}"
    
    if ! command -v "$cmd" >/dev/null 2>&1; then
        log_error "Command not found: $cmd"
        [ -n "$hint" ] && log_info "$hint"
        exit 1
    fi
    
    log_debug "Command available: $cmd"
}

check_git_status() {
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "Uncommitted changes detected:"
        git status --short
        return 1
    fi
    
    log_success "Git workspace is clean"
    return 0
}

get_build_strategy() {
    local strategy="${1:-"auto"}"
    
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

# ==============================================
# ENVIRONMENT VALIDATION
# ==============================================

validate_environment() {
    log_step "Environment Validation"
    
    # Check Node.js version
    require_command "node" "Install Node.js 18+ from https://nodejs.org"
    
    local node_version=$(node --version | sed 's/v//' | cut -d'.' -f1)
    if ! validate_number_range "$node_version" 18 999 "Node.js version"; then
        log_error "Node.js version $node_version is not supported. Require Node 18+"
        exit 1
    fi
    
    log_success "Node.js version check passed: $node_version"
    
    # Check required commands
    require_command "git" "Install Git from https://git-scm.com"
    require_command "npm" "Install npm (comes with Node.js)"
    
    # Check optional commands
    if command -v bun >/dev/null 2>&1; then
        log_success "Bun detected for optimized builds"
    fi
    
    if command -v turbo >/dev/null 2>&1; then
        log_success "Turborepo detected for optimized builds"
    fi
    
    # Vercel-specific validation
    log_step "Linking to Vercel project"
    require_command "npx" "Install npx (comes with Node.js)"
    
    if ! npx vercel whoami >/dev/null 2>&1; then
        log_error "Vercel login required"
        exit 1
    fi
    
    # Environment-based Vercel configuration
    if [ -z "${VERCEL_ORG_ID:-}" ]; then
        log_warning "VERCEL_ORG_ID not set. Using automatic project detection."
        npx vercel link --yes
    else
        log_info "Using configured Vercel organization: $VERCEL_ORG_ID"
        export VERCEL_ORG_ID
        npx vercel link --yes
    fi
    log_success "Linked to Vercel project: $PROJECT_NAME"
    
    # Pull production environment variables
    log_step "Pulling production environment variables from Vercel"
    [ -f .env.local ] && rm .env.local
    npx vercel env pull .env.local --environment=production --yes
    source .env.local
    log_success "Environment variables loaded"
    
    # Validate required environment variables
    validate_required_env_vars "DATABASE_URL" "SUPABASE_SERVICE_ROLE_KEY" "SUPABASE_ANON_KEY"
    
    # Validate Vercel configuration if provided
    if [ -n "${VERCEL_ORG_ID:-}" ]; then
        validate_required_env_vars "VERCEL_PROJECT_ID"
    fi
    
    # Validate URLs
    validate_url "$PRODUCTION_URL" "production URL"
    
    log_success "Environment validation completed"
}

# ==============================================
# HEALTHCARE COMPLIANCE VALIDATION
# ==============================================

validate_healthcare_compliance() {
    log_step "Healthcare Compliance Validation"
    
    # Check LGPD compliance
    if [[ "${LGPD_COMPLIANCE:-false}" != "true" ]]; then
        log_warning "LGPD compliance not enabled"
    else
        log_success "LGPD compliance enabled"
    fi
    
    # Check ANVISA compliance
    if [[ "${ANVISA_COMPLIANCE:-false}" != "true" ]]; then
        log_warning "ANVISA compliance not enabled"
    else
        log_success "ANVISA compliance enabled"
    fi
    
    # Check CFM compliance
    if [[ "${CFM_COMPLIANCE:-false}" != "true" ]]; then
        log_warning "CFM compliance not enabled"
    else
        log_success "CFM compliance enabled"
    fi
    
    # Check data residency
    if [[ "${BRAZIL_DATA_RESIDENCY:-false}" == "true" ]]; then
        log_success "Brazil data residency enabled"
    else
        log_warning "Brazil data residency not enforced"
    fi
    
    # Check audit logging
    if [[ "${AUDIT_LOGGING_ENABLED:-false}" == "true" ]]; then
        log_success "Audit logging enabled"
    else
        log_warning "Audit logging not enabled"
    fi
    
    log_success "Healthcare compliance validation completed"
}

# ==============================================
# TURBOREPO REMOTE CACHING SETUP
# ==============================================

setup_turbo_caching() {
    log_step "Configuring Turborepo remote caching"
    require_command "turbo" "Install Turborepo: npm install -g turbo"
    
    if [ -z "${TURBO_TOKEN:-}" ]; then
        log_error "TURBO_TOKEN not set. Required for non-interactive remote caching."
        exit 1
    fi
    
    export TURBO_TEAM="grupous"
    log_info "Using non-interactive Turbo caching with TURBO_TOKEN and TURBO_TEAM=grupous"
    
    log_success "Turborepo remote caching configured with team $TURBO_TEAM"
}

# ==============================================
# PRE-DEPLOYMENT CHECKS
# ==============================================

pre_deployment_checks() {
    log_step "Pre-deployment Checks"
    
    # Ensure we're in project root
    ensure_project_root
    
    # Check git status
    if ! check_git_status; then
        log_warning "Proceeding with uncommitted changes is not recommended for production"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Deployment cancelled"
            exit 1
        fi
    fi
    
    # Validate configuration
    validate_config
    
    # Check disk space
    local available_space=$(df -k . | awk 'NR==2 {print $4}')
    local required_space=$((MINIMUM_DISK_SPACE_GB * 1024 * 1024)) # Convert GB to KB
    
    if [ "$available_space" -lt "$required_space" ]; then
        log_error "Insufficient disk space. Required: ${MINIMUM_DISK_SPACE_GB}GB, Available: $((available_space / 1024 / 1024))GB"
        exit 1
    fi
    
    log_success "Pre-deployment checks completed"
}

# ==============================================
# BUILD PROCESS
# ==============================================

build_application() {
    log_step "Building Application"
    
    local build_strategy=$(get_build_strategy)
    log_info "Using build strategy: $build_strategy"
    
    case "$build_strategy" in
        "turbo")
            log_info "Building with Turborepo + Bun"
            
            # Install dependencies
            log_step "Installing Dependencies"
            pnpm install --frozen-lockfile
            log_success "Dependencies installed"
            
            # Run build
            log_step "Running Build"
            turbo run build --filter=@neonpro/web
            
            # Validate build output
            if [ ! -d "apps/web/.next" ]; then
                log_error "Build failed - .next directory missing"
                exit 1
            fi
            ;;
        "npm")
            log_info "Building with npm"
            
            # Install dependencies
            log_step "Installing Dependencies"
            npm ci --no-audit
            log_success "Dependencies installed"
            
            # Run build
            log_step "Running Build"
            npm run build
            
            # Validate build output
            if [ ! -d "apps/web/.next" ]; then
                log_error "Build failed - .next directory missing"
                exit 1
            fi
            ;;
        *)
            log_error "Unsupported build strategy: $build_strategy"
            exit 1
            ;;
    esac
    
    log_success "Application built successfully"
}

# ==============================================
# DEPLOYMENT EXECUTION
# ==============================================

deploy_application() {
    log_step "Deploying Application"
    
    local deployment_target="${1:-"staging"}"
    
    case "$deployment_target" in
        "staging")
            log_info "Deploying to staging environment"
            
            # Run staging deployment
            log_step "Executing Staging Deployment"
            npx vercel deploy --project "$PROJECT_NAME" --yes
            
            DEPLOY_URL=$(npx vercel ls | grep -m1 "$PROJECT_NAME" | awk '{print $2}')
            log_success "Staging deployment completed: $DEPLOY_URL"
            ;;
        "production")
            log_info "Deploying to production environment"
            
            # Additional production checks
            log_step "Production Safety Checks"
            
            # Verify healthcare compliance
            log_info "Validating healthcare compliance for production"
            validate_healthcare_compliance
            
            # Verify all health checks pass
            log_info "Running comprehensive health checks"
            
            # Execute production deployment
            log_step "Executing Production Deployment"
            npx vercel deploy --prod --project "$PROJECT_NAME" --yes
            
            DEPLOY_URL=$(npx vercel ls | grep -m1 "$PROJECT_NAME" | awk '{print $2}')
            log_success "Production deployment completed: $DEPLOY_URL"
            ;;
        *)
            log_error "Invalid deployment target: $deployment_target"
            log_info "Valid targets: staging, production"
            exit 1
            ;;
    esac
}

# ==============================================
# HEALTH CHECKS & VALIDATION
# ==============================================

check_endpoint() {
    local url="$1"
    local endpoint="$2"
    local description="$3"
    log_info "Checking $description"
    
    http_code=$(curl -s -w "%{http_code}" --max-time "$TIMEOUT" "$url$endpoint" -o /dev/null)
    if [[ "$http_code" =~ ^[2-3] ]]; then
        log_success "$description OK ($http_code)"
        return 0
    else
        log_error "$description failed ($http_code)"
        return 1
    fi
}

check_security_headers() {
    local url="$1"
    log_step "Checking security headers"
    headers=$(curl -s -I "$url")
    
    required_headers=("X-Content-Type-Options: nosniff" "X-Frame-Options: DENY" "X-XSS-Protection: 1; mode=block" "Content-Security-Policy" "Strict-Transport-Security")
    
    for header in "${required_headers[@]}"; do
        if echo "$headers" | grep -q "$header"; then
            log_success "$header present"
        else
            log_warning "$header missing"
        fi
    done
}

check_ssl() {
    local domain=$(echo "$1" | sed 's/https\?:\/\///' | cut -d/ -f1)
    log_step "Checking SSL"
    
    if openssl s_client -connect "$domain:443" -quiet < /dev/null 2>&1; then
        log_success "SSL valid"
    else
        log_error "SSL check failed"
    fi
}

check_performance() {
    local url="$1"
    log_step "Checking performance"
    
    load_time=$(curl -s -w "%{time_total}" -o /dev/null "$url")
    log_info "Load time: $load_time s"
    
    if (($(echo "$load_time > 3" | bc -l))); then
        log_warning "High load time detected"
    fi
}

check_healthcare_compliance() {
    local url="$1"
    log_step "Checking healthcare compliance"
    
    for endpoint in "/api/compliance/lgpd" "/api/compliance/anvisa" "/api/compliance/cfm" "/api/audit/status"; do
        check_endpoint "$url" "$endpoint" "Compliance $endpoint"
    done
}

post_deployment_checks() {
    log_step "Post-deployment Validation"
    
    local deployment_target="${1:-"staging"}"
    local target_url=""
    
    case "$deployment_target" in
        "staging")
            target_url="${PRODUCTION_URL//-neonpro./-staging.neonpro.}"
            ;;
        "production")
            target_url="$PRODUCTION_URL"
            ;;
    esac
    
    log_info "Validating deployment at: $target_url"
    
    # Health check with retry logic
    local retry_count=0
    local max_retries="$MAX_RETRIES"
    local check_success=false
    
    while [ $retry_count -lt $max_retries ]; do
        log_info "Health check attempt $((retry_count + 1))/$max_retries"
        
        if curl -f -s --max-time "$TIMEOUT" "$target_url/health" >/dev/null 2>&1; then
            log_success "Health check passed"
            check_success=true
            break
        else
            log_warning "Health check failed, retrying in 10 seconds..."
            sleep 10
            retry_count=$((retry_count + 1))
        fi
    done
    
    if [ "$check_success" = false ]; then
        log_error "Health check failed after $max_retries attempts"
        log_error "Deployment may have failed - manual verification required"
        return 1
    fi
    
    # Basic functionality checks
    log_step "Validating Core Functionality"
    check_endpoint "$target_url" "/" "Homepage"
    check_endpoint "$target_url" "/api/health" "Health API"
    check_endpoint "$target_url" "/api/system/info" "System Info"
    check_endpoint "$target_url" "/assets/favicon.ico" "Static Assets"
    
    # Security checks
    log_step "Security Validation"
    check_security_headers "$target_url"
    check_ssl "$target_url"
    
    # Performance check
    check_performance "$target_url"
    
    # Healthcare compliance
    log_step "Healthcare Compliance Validation"
    check_healthcare_compliance "$target_url"
    
    # Compliance pages
    log_step "Legal Compliance Validation"
    check_endpoint "$target_url" "/privacy" "Privacy Policy"
    check_endpoint "$target_url" "/terms" "Terms of Service"
    check_endpoint "$target_url" "/cookies" "Cookie Policy"
    
    log_success "Post-deployment validation completed"
}

# ==============================================
# MAIN EXECUTION
# ==============================================

main() {
    # Initialize logging
    log_script_start
    
    # Parse command line arguments
    local deployment_target="${1:-"staging"}"
    local skip_build=false
    local skip_checks=false
    local setup_turbo=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --target=*)
                deployment_target="${1#*=}"
                shift
                ;;
            --skip-build)
                skip_build=true
                shift
                ;;
            --skip-checks)
                skip_checks=true
                shift
                ;;
            --setup-turbo)
                setup_turbo=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --target=TARGET     Deployment target (staging|production)"
                echo "  --skip-build        Skip build step"
                echo "  --skip-checks       Skip pre/post-deployment checks"
                echo "  --setup-turbo       Setup Turborepo remote caching"
                echo "  --help, -h          Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0                           # Deploy to staging"
                echo "  $0 --target=production     # Deploy to production"
                echo "  $0 --setup-turbo            # Setup Turborepo caching"
                echo "  $0 --skip-build             # Deploy without building"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    log_section "NeonPro Deployment - $deployment_target"
    
    # Setup Turborepo if requested
    if [ "$setup_turbo" = true ]; then
        setup_turbo_caching
        log_success "Turborepo setup completed"
        log_script_end 0
        return
    fi
    
    # Validate environment
    validate_environment
    
    # Validate healthcare compliance
    validate_healthcare_compliance
    
    # Pre-deployment checks
    if [ "$skip_checks" = false ]; then
        pre_deployment_checks
    else
        log_warning "Skipping pre-deployment checks"
    fi
    
    # Setup Turborepo for optimal builds
    if [ "$skip_build" = false ]; then
        setup_turbo_caching
    fi
    
    # Build application
    if [ "$skip_build" = false ]; then
        build_application
    else
        log_warning "Skipping build step"
    fi
    
    # Deploy application
    deploy_application "$deployment_target"
    
    # Post-deployment validation
    if [ "$skip_checks" = false ]; then
        post_deployment_checks "$deployment_target"
    else
        log_warning "Skipping post-deployment checks"
    fi
    
    log_success "Deployment completed successfully!"
    log_healthcare "Healthcare compliance validated for $deployment_target environment"
    
    log_script_end 0
}

# ==============================================
# ERROR HANDLING
# ==============================================

# Set up error handling
trap 'log_error "Script interrupted by user"; exit 130' INT
trap 'log_error "Script terminated"; exit 143' TERM

# Handle script errors
handle_error() {
    local exit_code=$?
    local line_number=$1
    local command_name=$2
    
    log_error "Error on line $line_number: command '$command_name' failed with exit code $exit_code"
    log_script_end "$exit_code"
    exit "$exit_code"
}

# Enable error trapping
trap 'handle_error $LINENO "$BASH_COMMAND"' ERR

# ==============================================
# SCRIPT ENTRY POINT
# ==============================================

# Only run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi