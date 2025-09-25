#!/bin/bash

# NeonPro Consolidated Deployment Script
# Consolidated from deploy-unified.sh, deployment-health-check.sh, deployment-validation.sh
# Incorporates Turborepo remote caching and Vercel best practices

set -euo pipefail

# Configuration & Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

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

# Utility functions
ensure_project_root() {
    if [ ! -f "package.json" ] || [ ! -d "apps/web" ] || [ ! -f "turbo.json" ]; then
        log_error "Must be run from NeonPro project root"
        exit 1
    fi
}

require_command() {
    local cmd=$1
    if ! command -v "$cmd" >/dev/null 2>&1; then
        log_error "Command not found: $cmd"
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

# Validate environment
validate_environment() {
    log_step "Environment Validation"
    require_command node
    require_command npx
    log_step "Linking to Vercel project"
    npx vercel link --project "$PROJECT_NAME" --yes
    log_step "Pulling production environment variables from Vercel"
    [ -f .env.local ] && rm .env.local
    npx vercel env pull .env.local --environment=production
    source .env.local
    log_success "Environment variables loaded"
    local node_version=$(node --version | cut -d. -f1 | tr -d 'v')
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js 18+ required"
        exit 1
    fi
    if ! npx vercel whoami >/dev/null 2>&1; then
        log_error "Vercel login required"
        exit 1
    fi
    required_vars=("DATABASE_URL" "SUPABASE_SERVICE_ROLE_KEY" "SUPABASE_ANON_KEY" "NEXTAUTH_SECRET" "NEXTAUTH_URL" "VERCEL_ORG_ID" "VERCEL_PROJECT_ID")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Missing $var"
            exit 1
        fi
    done
    log_success "Environment validated"
}

# Turborepo remote caching setup
setup_turbo_caching() {
    log_step "Configuring Turborepo remote caching"
    require_command turbo
    if [ -z "${TURBO_TOKEN:-}" ]; then
        log_warning "TURBO_TOKEN not set. Attempting to link to Vercel (may require interaction)"
        npx turbo login
        npx turbo link
    else
        log_success "TURBO_TOKEN set"
    fi
}

# Build application
build_application() {
    log_step "Building application with Turborepo"
    bun install || { log_warning "Bun not available, using npm"; npm install; }
    turbo run build --filter=@neonpro/web
    if [ ! -d "apps/web/.next" ]; then
        log_error "Build failed - .next directory missing"
        exit 1
    fi
    log_success "Build completed"
}

# Deploy to Vercel
deploy_application() {
    log_step "Deploying to Vercel project $PROJECT_NAME"
    npx vercel deploy --prod --project "$PROJECT_NAME"
    DEPLOY_URL=$(npx vercel ls | grep -m1 "$PROJECT_NAME" | awk '{print $2}')
    log_success "Deployed to $DEPLOY_URL"
}

# Health check functions
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
        log_warning "High load time"
    fi
}

check_healthcare_compliance() {
    local url="$1"
    log_step "Checking healthcare compliance"
    for endpoint in "/api/compliance/lgpd" "/api/compliance/anvisa" "/api/compliance/cfm" "/api/audit/status"; do
        check_endpoint "$url" "$endpoint" "Compliance $endpoint"
    done
}

# Validation functions (simplified)
validate_security() {
    log_step "Validating security"
    check_security_headers "$DEPLOY_URL"
}

validate_healthcare() {
    check_healthcare_compliance "$DEPLOY_URL"
}

validate_performance() {
    check_performance "$DEPLOY_URL"
}

validate_functionality() {
    log_step "Validating functionality"
    check_endpoint "$DEPLOY_URL" "/api/health" "Health"
    check_endpoint "$DEPLOY_URL" "/api/system/info" "API Info"
    check_endpoint "$DEPLOY_URL" "/assets/favicon.ico" "Static Asset"
}

validate_compliance() {
    log_step "Validating compliance"
    check_endpoint "$DEPLOY_URL" "/privacy" "Privacy Policy"
    check_endpoint "$DEPLOY_URL" "/terms" "Terms of Service"
    check_endpoint "$DEPLOY_URL" "/cookies" "Cookie Policy"
}

# Main function
main() {
    ensure_project_root
    validate_environment
    setup_turbo_caching
    if ! check_git_status; then
        log_warning "Proceeding with uncommitted changes"
    fi
    build_application
    deploy_application
    check_endpoint "$DEPLOY_URL" "/" "Homepage"
    validate_security
    validate_healthcare
    validate_performance
    validate_functionality
    validate_compliance
    log_success "Deployment, health check, and validation completed"
}

main "$@"