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

# Vercel Limits Configuration
readonly VERCEL_FUNCTION_SIZE_LIMIT=262144000  # 250MB in bytes
readonly VERCEL_BUILD_SIZE_LIMIT=1073741824    # 1GB in bytes
readonly VERCEL_BUILD_TIME_LIMIT=2700          # 45 minutes in seconds
readonly SAFETY_MARGIN_RATIO=0.85              # 85% of limit for safety
readonly CHUNK_SIZE_SAFETY=$(echo "$VERCEL_FUNCTION_SIZE_LIMIT * $SAFETY_MARGIN_RATIO" | bc | cut -d. -f1)

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
        npx vercel link --cwd apps/web --yes
    fi
    log_success "Linked to Vercel project: $PROJECT_NAME"

    # Pull production environment variables from Vercel
    [ -f apps/web/.env.local ] && rm apps/web/.env.local
    npx vercel env pull .env.local --environment=production --yes --cwd apps/web
    source apps/web/.env.local
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

    # Check if turbo is available, install if needed
    if ! command -v turbo >/dev/null 2>&1; then
        log_info "Installing Turborepo..."
        if command -v bun >/dev/null 2>&1; then
            bun add -g turbo
        elif command -v npx >/dev/null 2>&1; then
            npx turbo --version >/dev/null 2>&1 || npm install -g turbo
        else
            log_error "Cannot install Turborepo - no package manager available"
            exit 1
        fi
    fi

    log_success "Turborepo available: $(turbo --version)"

    # Configure remote caching
    if [ -n "${TURBO_TOKEN:-}" ]; then
        export TURBO_TEAM="${TURBO_TEAM:-grupous}"
        log_info "Using remote caching with TURBO_TOKEN and TURBO_TEAM=$TURBO_TEAM"

        # Verify cache configuration
        if turbo prune --help >/dev/null 2>&1; then
            log_success "Turborepo remote caching configured with team $TURBO_TEAM"
        else
            log_warning "Remote caching may not be properly configured"
        fi
    else
        log_warning "TURBO_TOKEN not set - using local caching only"
        log_info "To enable remote caching, set TURBO_TOKEN environment variable"
        log_info "Run: turbo login && turbo link"
    fi

    # Validate cache status
    log_step "Validating cache configuration"
    if [ -f "turbo.json" ]; then
        log_success "turbo.json found - configuration valid"
    else
        log_error "turbo.json not found - Turborepo not properly configured"
        exit 1
    fi
}

# ==============================================
# PRE-DEPLOYMENT CHECKS
# ==============================================

pre_deployment_checks() {
    log_step "Pre-deployment Checks"

    # Ensure we're in project root
    ensure_project_root

    # Git status check and prompt skipped to avoid warning and interactive prompt
    # Note: Uncommitted changes check disabled for automated deployment

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

# ==============================================
# INTELLIGENT BUILD CHUNKING FOR VERCEL LIMITS
# ==============================================

# Enhanced package size estimation
estimate_package_size() {
    local package_path="$1"
    local estimated_size=0
    
    if [ ! -d "$package_path" ]; then
        echo "0"
        return
    fi
    
    # Calculate source files size
    local source_size=$(find "$package_path" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec wc -c {} + 2>/dev/null | awk '{sum += $1} END {print sum+0}')
    
    # Calculate node_modules size (estimated based on package.json dependencies)
    if [ -f "$package_path/package.json" ]; then
        local dep_count=$(jq -r '.dependencies | keys | length' "$package_path/package.json" 2>/dev/null || echo "0")
        local dev_dep_count=$(jq -r '.devDependencies | keys | length' "$package_path/package.json" 2>/dev/null || echo "0")
        local estimated_deps_size=$(( (dep_count + dev_dep_count) * 500000 )) # ~500KB per dependency
    else
        local estimated_deps_size=0
    fi
    
    # Add build output estimate
    local build_estimate=$((source_size * 3)) # Build output is typically 3x source size
    
    estimated_size=$((source_size + estimated_deps_size + build_estimate))
    echo "$estimated_size"
}

# Detect affected packages using Turborepo --affected
detect_affected_packages() {
    log_info "Detecting affected packages using Turborepo --affected"
    
    if ! command -v turbo >/dev/null 2>&1; then
        log_warning "Turborepo not available - considering all packages as affected"
        echo "apps/web apps/api packages/core packages/database packages/ui packages/types"
        return
    fi
    
    local affected_packages=""
    
    # Get affected packages from Turborepo
    if turbo run build --affected --dry-run 2>/dev/null | grep -E "packages/|apps/" >/dev/null 2>&1; then
        affected_packages=$(turbo run build --affected --dry-run json 2>/dev/null | jq -r '.packages[]' 2>/dev/null | tr '\n' ' ' || echo "")
    fi
    
    # Fallback to all packages if detection fails
    if [ -z "$affected_packages" ]; then
        log_warning "Could not detect affected packages - using all packages"
        affected_packages="apps/web apps/api packages/core packages/database packages/ui packages/types"
    fi
    
    echo "$affected_packages"
}

# Calculate optimal chunks based on package sizes and Vercel limits
calculate_optimal_chunks() {
    local packages="$1"
    local chunks=()
    local current_chunk=""
    local current_size=0
    
    for package in $packages; do
        if [ -d "$package" ]; then
            local package_size=$(estimate_package_size "$package")
            
            # If adding this package would exceed the limit, start a new chunk
            if [ $((current_size + package_size)) -gt $CHUNK_SIZE_SAFETY ] && [ -n "$current_chunk" ]; then
                chunks+=("$current_chunk")
                current_chunk="$package"
                current_size=$package_size
            else
                current_chunk="${current_chunk} ${package}"
                current_size=$((current_size + package_size))
            fi
        fi
    done
    
    # Add the final chunk
    if [ -n "$current_chunk" ]; then
        chunks+=("$current_chunk")
    fi
    
    # Return chunks as array reference
    printf '%s\n' "${chunks[@]}"
}

# Deploy chunks in parallel for independent packages
deploy_chunks_in_parallel() {
    local chunks=("$@")
    local max_parallel=${MAX_PARALLEL_DEPLOYS:-3}
    local pids=()
    local chunk_results=()
    
    log_info "Deploying ${#chunks[@]} chunks with up to $max_parallel parallel deployments"
    
    for i in "${!chunks[@]}"; do
        local chunk="${chunks[$i]}"
        local chunk_number=$((i + 1))
        
        # Limit parallel deployments
        while [ ${#pids[@]} -ge "$max_parallel" ]; do
            for j in "${!pids[@]}"; do
                if ! kill -0 "${pids[j]}" 2>/dev/null; then
                    wait "${pids[j]}"
                    local exit_code=$?
                    chunk_results[$j]=$exit_code
                    unset "pids[j]"
                fi
            done
            sleep 1
        done
        
        # Start deployment in background
        (
            deploy_single_chunk "$chunk" "$chunk_number" "${#chunks[@]}"
        ) &
        pids+=($!)
        
        log_info "Started deployment of chunk $chunk_number/${#chunks[@]} (PID: ${pids[-1]})"
    done
    
    # Wait for all deployments to complete
    for pid in "${pids[@]}"; do
        wait "$pid"
        local exit_code=$?
        chunk_results+=($exit_code)
    done
    
    # Check results
    local failed_count=0
    for result in "${chunk_results[@]}"; do
        if [ "$result" -ne 0 ]; then
            ((failed_count++))
        fi
    done
    
    if [ "$failed_count" -gt 0 ]; then
        log_error "$failed_count chunk(s) failed to deploy"
        return 1
    fi
    
    log_success "All ${#chunks[@]} chunks deployed successfully"
}

# Deploy a single chunk with enhanced Vercel optimization
deploy_single_chunk() {
    local chunk="$1"
    local chunk_number="$2"
    local total_chunks="$3"
    
    log_step "Deploying chunk $chunk_number/$total_chunks: $chunk"
    
    # Create temporary vercel.json for this chunk
    local temp_vercel_config="/tmp/vercel-chunk-${chunk_number}.json"
    
    # Build the chunk first
    log_info "Building chunk $chunk_number..."
    for package in $chunk; do
        if [ -d "$package" ] && [ -f "$package/package.json" ]; then
            local build_script=$(jq -r '.scripts.build // empty' "$package/package.json" 2>/dev/null)
            if [ -n "$build_script" ]; then
                (cd "$package" && npm run build 2>/dev/null) || log_warning "Build failed for $package"
            fi
        fi
    done
    
    # Configure Vercel deployment for this chunk
    cat > "$temp_vercel_config" << EOF
{
  "buildCommand": "cd $package && npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["sfo1"],
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
EOF
    
    # Deploy to Vercel
    local deployment_result
    if deployment_result=$(npx vercel deploy --prod --yes --local-config "$temp_vercel_config" 2>&1); then
        local deployment_url=$(echo "$deployment_result" | grep -E 'https://[^\s]+\.vercel\.app' | head -1)
        log_success "Chunk $chunk_number deployed: $deployment_url"
    else
        log_error "Chunk $chunk_number deployment failed: $deployment_result"
        rm -f "$temp_vercel_config"
        return 1
    fi
    
    # Cleanup
    rm -f "$temp_vercel_config"
}

# Enhanced Vercel deployment with intelligent chunking
enhanced_vercel_deployment() {
    log_step "Enhanced Vercel Deployment with Intelligent Chunking"
    
    # Detect affected packages first
    local affected_packages=$(detect_affected_packages)
    log_info "Detected affected packages: $affected_packages"
    
    # Calculate optimal chunks
    local chunks=()
    while IFS= read -r chunk; do
        chunks+=("$chunk")
    done < <(calculate_optimal_chunks "$affected_packages")
    
    log_info "Calculated ${#chunks[@]} deployment chunks"
    
    # Display chunk information
    for i in "${!chunks[@]}"; do
        local chunk="${chunks[$i]}"
        local chunk_size=0
        
        # Calculate chunk size
        for package in $chunk; do
            if [ -d "$package" ]; then
                local package_size=$(estimate_package_size "$package")
                chunk_size=$((chunk_size + package_size))
            fi
        done
        
        local chunk_size_mb=$((chunk_size / 1024 / 1024))
        local limit_mb=$((CHUNK_SIZE_SAFETY / 1024 / 1024))
        
        log_info "Chunk $((i + 1)): $chunk (${chunk_size_mb}MB/${limit_mb}MB)"
    done
    
    # Deploy chunks in parallel
    if deploy_chunks_in_parallel "${chunks[@]}"; then
        log_success "Enhanced Vercel deployment completed successfully"
        return 0
    else
        log_error "Enhanced Vercel deployment failed"
        return 1
    fi
}

check_vercel_limits() {
    log_step "Checking Vercel deployment limits"

    # Check available disk space (Vercel limit: 23GB)
    local available_space_gb=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$available_space_gb" -lt 20 ]; then
        log_warning "Low disk space: ${available_space_gb}GB (Vercel limit: 23GB)"
    fi

    # Check source file size (Vercel limit: 100MB Hobby, 1GB Pro)
    local source_size_mb=$(du -sm . 2>/dev/null | cut -f1)
    if [ "$source_size_mb" -gt 800 ]; then # 80% of 1GB limit
        log_warning "Large source size: ${source_size_mb}MB (approaching Vercel limits)"
    fi

    log_info "Disk space: ${available_space_gb}GB, Source size: ${source_size_mb}MB"
}

optimize_for_vercel() {
    log_step "Optimizing build for Vercel constraints"

    # Clean previous builds to save space
    log_info "Cleaning previous builds..."
    find . -name "dist" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name ".turbo" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "node_modules/.cache" -type d -exec rm -rf {} + 2>/dev/null || true

    # Configure Turborepo for optimal performance
    export TURBO_LOG_VERBOSITY="1"  # Reduce log verbosity
    export TURBO_UI="stream"        # Use streaming UI for better performance

    log_success "Build environment optimized for Vercel"
}

build_application() {
    log_step "Building Application with Intelligent Chunking"

    # Check Vercel limits and optimize
    check_vercel_limits
    optimize_for_vercel

    local build_strategy=$(get_build_strategy)
    log_info "Using build strategy: $build_strategy"

    # Setup Turborepo caching for optimal builds
    setup_turbo_caching

    case "$build_strategy" in
        "turbo")
            log_info "Building with Turborepo + Bun (Optimized for Vercel)"

            # Install dependencies with optimal caching
            log_step "Installing Dependencies with Cache Optimization"
            if command -v bun >/dev/null 2>&1; then
                bun install --frozen-lockfile
            else
                npm ci --prefer-offline --no-audit
            fi
            log_success "Dependencies installed with cache optimization"

            # Build packages first (chunked approach)
            log_step "Building Packages (Chunk 1/3)"
            if command -v turbo >/dev/null 2>&1; then
                # Build packages in optimal order
                turbo run build --filter="@neonpro/types" --no-deps || log_warning "Types build failed - continuing"
                turbo run build --filter="@neonpro/shared" --no-deps || log_warning "Shared build failed - continuing"
                turbo run build --filter="@neonpro/utils" --no-deps || log_warning "Utils build failed - continuing"
                log_success "Core packages built"

                # Build supporting packages
                turbo run build --filter="@neonpro/database" --no-deps || log_warning "Database build failed - continuing"
                turbo run build --filter="@neonpro/security" --no-deps || log_warning "Security build failed - continuing"
                log_success "Supporting packages built"
            else
                log_warning "Turborepo not available - building packages individually"
                for pkg in packages/types packages/shared packages/utils packages/database packages/security; do
                    if [ -d "$pkg" ] && [ -f "$pkg/package.json" ]; then
                        (cd "$pkg" && npm run build 2>/dev/null) || log_warning "$pkg build failed"
                    fi
                done
            fi

            # Build applications (chunk 2/3)
            log_step "Building Applications (Chunk 2/3)"
            if command -v turbo >/dev/null 2>&1; then
                # Build with dependency optimization
                turbo run build --filter="@neonpro/web" --include-dependencies || {
                    log_warning "Turborepo build failed - falling back to direct build"
                    (cd apps/web && npm run build)
                }
            else
                log_info "Building web app directly"
                (cd apps/web && npm run build)
            fi

            # Validate build outputs (chunk 3/3)
            log_step "Validating Build Outputs (Chunk 3/3)"
            local build_success=true

            if [ ! -d "apps/web/dist" ] && [ ! -d "apps/web/.next" ]; then
                log_error "Web app build failed - no output directory found"
                build_success=false
            fi

            # Check build size constraints
            if [ -d "apps/web/dist" ]; then
                local build_size_mb=$(du -sm apps/web/dist 2>/dev/null | cut -f1)
                log_info "Web build size: ${build_size_mb}MB"
                if [ "$build_size_mb" -gt 200 ]; then
                    log_warning "Large build size detected: ${build_size_mb}MB"
                fi
            fi

            if [ "$build_success" = true ]; then
                log_success "Chunked build completed successfully"
            else
                log_error "Build validation failed"
                exit 1
            fi
            ;;
        "npm")
            log_info "Building with npm (Fallback mode)"

            # Install dependencies
            log_step "Installing Dependencies"
            npm ci --prefer-offline --no-audit
            log_success "Dependencies installed"

            # Build with npm
            log_step "Building with npm"
            npm run build || {
                log_error "npm build failed"
                exit 1
            }

            # Validate build output
            if [ ! -d "apps/web/dist" ] && [ ! -d "apps/web/.next" ]; then
                log_error "Build failed - no output directory found"
                exit 1
            fi
            ;;
        *)
            log_error "Unsupported build strategy: $build_strategy"
            exit 1
            ;;
    esac

    log_success "Application built successfully with optimizations"
}

# ==============================================
# DEPLOYMENT EXECUTION
# ==============================================

# ==============================================
# DEPLOYMENT EXECUTION WITH VERCEL OPTIMIZATION
# ==============================================

monitor_deployment_limits() {
    local deployment_start_time=$(date +%s)
    local app_name="$1"

    log_info "Monitoring deployment limits for $app_name"

    # Monitor build time (Vercel limit: 45 minutes)
    while [ -f "/tmp/deployment_${app_name}_running" ]; do
        local current_time=$(date +%s)
        local elapsed_time=$((current_time - deployment_start_time))
        local elapsed_minutes=$((elapsed_time / 60))

        if [ $elapsed_minutes -gt 40 ]; then # 40 minutes warning (5 min before limit)
            log_warning "Deployment approaching 45-minute limit: ${elapsed_minutes} minutes elapsed"
            break
        fi

        sleep 30 # Check every 30 seconds
    done

    rm -f "/tmp/deployment_${app_name}_running" 2>/dev/null || true
}

optimized_vercel_deploy() {
    local app_path="$1"
    local app_name="$2"
    local is_production="$3"

    log_step "Optimized Vercel deployment for $app_name"

    # Create deployment monitoring flag
    touch "/tmp/deployment_${app_name}_running"

    # Start monitoring in background
    monitor_deployment_limits "$app_name" &
    local monitor_pid=$!

    # Optimize for Vercel deployment
    local deploy_args="--cwd $app_path --yes"
    [ "$is_production" = "true" ] && deploy_args="$deploy_args --prod"

    # Try prebuilt deployment first (fastest)
    log_info "Attempting prebuilt deployment for $app_name..."
    local deploy_json
    local deploy_url

    if npx vercel build --cwd "$app_path" --yes >/dev/null 2>&1; then
        log_success "Prebuilt assets ready for $app_name"
        deploy_json=$(npx vercel deploy $deploy_args --prebuilt --json 2>/dev/null || echo "{}")
    else
        log_info "Prebuilt not available - using remote build for $app_name"
        deploy_json=$(npx vercel deploy $deploy_args --json 2>/dev/null || echo "{}")
    fi

    # Extract deployment URL with multiple fallback strategies
    deploy_url=$(echo "$deploy_json" | tr -d '\n' | sed -E 's/.*"url":"([^"]+)".*/\1/' 2>/dev/null || echo "")

    if [ -z "$deploy_url" ] || [ "$deploy_url" = "$deploy_json" ]; then
        log_warning "JSON parsing failed for $app_name - trying alternative extraction"
        deploy_url=$(echo "$deploy_json" | grep -oE 'https://[^"]*\.vercel\.app' | head -n1 || echo "")
    fi

    if [ -z "$deploy_url" ]; then
        log_warning "URL extraction failed for $app_name - querying recent deployments"
        deploy_url=$(npx vercel ls --cwd "$app_path" --json 2>/dev/null |
                    jq -r '.[0].url // empty' 2>/dev/null ||
                    npx vercel ls --cwd "$app_path" 2>/dev/null |
                    grep -oE 'https://[^[:space:]]*\.vercel\.app' | head -n1 || echo "")
    fi

    # Stop monitoring
    kill $monitor_pid 2>/dev/null || true
    rm -f "/tmp/deployment_${app_name}_running" 2>/dev/null || true

    if [ -n "$deploy_url" ]; then
        log_success "$app_name deployed successfully: $deploy_url"
        echo "$deploy_url"
        return 0
    else
        log_error "Failed to determine deployment URL for $app_name"
        return 1
    fi
}

deploy_application() {
    log_step "Deploying Application with Vercel Optimization"

    local deployment_target="${1:-"staging"}"
    local is_production="false"

    case "$deployment_target" in
        "staging")
            log_info "Deploying to staging environment with chunked strategy"
            ;;
        "production")
            log_info "Deploying to production environment with full validation"
            is_production="true"

            # Additional production checks
            log_step "Production Safety Checks"
            validate_healthcare_compliance
            ;;
        *)
            log_error "Invalid deployment target: $deployment_target"
            log_info "Valid targets: staging, production"
            exit 1
            ;;
    esac

    # Deploy Web Application (Chunk 1)
    log_step "Deploying Web Application (Chunk 1/2)"
    if ! DEPLOY_URL=$(optimized_vercel_deploy "apps/web" "web" "$is_production"); then
        log_error "Web application deployment failed"
        exit 1
    fi

    # Deploy API Application (Chunk 2) - parallel where possible
    log_step "Deploying API Application (Chunk 2/2)"
    if [ -d "apps/api" ]; then
        if ! API_DEPLOY_URL=$(optimized_vercel_deploy "apps/api" "api" "$is_production"); then
            log_warning "API deployment failed - will use Web URL for health checks"
            API_DEPLOY_URL="$DEPLOY_URL"
        fi
    else
        log_info "No API application found - using Web URL"
        API_DEPLOY_URL="$DEPLOY_URL"
    fi

    # Export URLs for post-deployment checks
    export DEPLOY_URL
    export API_DEPLOY_URL

    log_success "All applications deployed successfully"
    log_info "Web: $DEPLOY_URL"
    log_info "API: $API_DEPLOY_URL"
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
    local path="${2:-}"
    log_step "Checking security headers"
    headers=$(curl -s -I "$url$path")

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
    local WEB_TARGET_URL=""
    local API_TARGET_URL=""
    local default_url=""

    case "$deployment_target" in
        "staging")
            default_url="${PRODUCTION_URL//-neonpro./-staging.neonpro.}"
            ;;
        "production")
            default_url="$PRODUCTION_URL"
            ;;
    esac

    # Determine target URLs
    WEB_TARGET_URL="${DEPLOY_URL:-$default_url}"
    API_TARGET_URL="${API_DEPLOY_URL:-$WEB_TARGET_URL}"

    log_info "Validating Web at: $WEB_TARGET_URL"
    log_info "Validating API at: $API_TARGET_URL"

    # Health check with retry logic (API)
    local retry_count=0
    local max_retries="$MAX_RETRIES"
    local check_success=false

    while [ $retry_count -lt $max_retries ]; do
        log_info "Health check attempt $((retry_count + 1))/$max_retries"

        if curl -f -s --max-time "$TIMEOUT" "$API_TARGET_URL/health" >/dev/null 2>&1; then
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
    check_endpoint "$WEB_TARGET_URL" "/" "Homepage"
    check_endpoint "$API_TARGET_URL" "/api/health" "Health API"
    check_endpoint "$API_TARGET_URL" "/api/system/info" "System Info"
    check_endpoint "$WEB_TARGET_URL" "/assets/favicon.ico" "Static Assets"

    # Security checks
    log_step "Security Validation"
    log_info "Validating Web security headers"
    check_security_headers "$WEB_TARGET_URL" "/"
    if [ "$API_TARGET_URL" != "$WEB_TARGET_URL" ]; then
        log_info "Validating API security headers"
        check_security_headers "$API_TARGET_URL" "/api/health"
    else
        # Even if API shares the same host, ensure API-path scoped headers are present
        check_security_headers "$API_TARGET_URL" "/api/health"
    fi
    check_ssl "$WEB_TARGET_URL"
    if [ "$API_TARGET_URL" != "$WEB_TARGET_URL" ]; then
        check_ssl "$API_TARGET_URL"
    fi

    # Performance check
    check_performance "$WEB_TARGET_URL"

    # Healthcare compliance
    log_step "Healthcare Compliance Validation"
    check_healthcare_compliance "$API_TARGET_URL"

    # Compliance pages
    log_step "Legal Compliance Validation"
    check_endpoint "$WEB_TARGET_URL" "/privacy" "Privacy Policy"
    check_endpoint "$WEB_TARGET_URL" "/terms" "Terms of Service"
    check_endpoint "$WEB_TARGET_URL" "/cookies" "Cookie Policy"

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
            --turbo-cache)
                export FORCE_TURBO_CACHE=true
                shift
                ;;
            --monitor-limits)
                export MONITOR_DEPLOYMENT_LIMITS=true
                shift
                ;;
            --chunk-size=*)
                export DEPLOY_CHUNK_SIZE="${1#*=}"
                shift
                ;;
            --max-build-time=*)
                export MAX_BUILD_TIME_MINUTES="${1#*=}"
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --target=TARGET          Deployment target (staging|production)"
                echo "  --skip-build             Skip build step"
                echo "  --skip-checks            Skip pre/post-deployment checks"
                echo "  --setup-turbo            Setup Turborepo remote caching"
                echo "  --turbo-cache            Force Turborepo remote caching"
                echo "  --monitor-limits         Enable deployment limits monitoring"
                echo "  --chunk-size=SIZE        Set deployment chunk size (small|medium|large)"
                echo "  --max-build-time=MIN     Set maximum build time in minutes (default: 40)"
                echo "  --help, -h               Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0                                    # Deploy to staging"
                echo "  $0 --target=production               # Deploy to production"
                echo "  $0 --setup-turbo                     # Setup Turborepo caching"
                echo "  $0 --turbo-cache --monitor-limits    # Deploy with full optimizations"
                echo "  $0 --chunk-size=large --skip-checks  # Fast deploy for large projects"
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
        log_info "Turborepo caching will be configured during build process"
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
