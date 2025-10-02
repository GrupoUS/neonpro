#!/bin/bash

# NeonPro Fixed Deployment Script
# Simplified deployment script that works with the current project structure

set -euo pipefail

# Logging functions
log_info() { echo "[INFO] $1" >&2; }
log_success() { echo "[SUCCESS] $1" >&2; }
log_warning() { echo "[WARNING] $1" >&2; }
log_error() { echo "[ERROR] $1" >&2; }
log_step() { echo "[STEP] $1" >&2; }

# Configuration
PROJECT_NAME="neonpro"
TIMEOUT=30

# Load environment variables
if [ -f ".env" ]; then
    log_info "Loading environment variables from .env"
    export $(grep -v '^#' .env | xargs)
else
    log_error ".env file not found"
    exit 1
fi

# Check required commands
require_command() {
    local cmd="$1"
    if ! command -v "$cmd" >/dev/null 2>&1; then
        log_error "Command not found: $cmd"
        exit 1
    fi
}

# Validate project structure
validate_project() {
    log_step "Validating project structure"
    
    if [ ! -f "package.json" ]; then
        log_error "package.json not found"
        exit 1
    fi
    
    if [ ! -d "apps/api" ]; then
        log_error "apps/api directory not found"
        exit 1
    fi
    
    if [ ! -d "supabase/functions" ]; then
        log_error "supabase/functions directory not found"
        exit 1
    fi
    
    log_success "Project structure validation passed"
}

# Deploy to Vercel
deploy_vercel() {
    log_step "Deploying to Vercel"
    
    require_command "vercel"
    
    # Check if Vercel is logged in
    if ! vercel whoami >/dev/null 2>&1; then
        log_error "Vercel is not logged in. Run 'vercel login' first."
        exit 1
    fi
    
    # Deploy to Vercel
    log_info "Running Vercel deployment..."
    if ! vercel --prod; then
        log_error "Vercel deployment failed"
        exit 1
    fi
    
    log_success "Vercel deployment completed"
}

# Deploy Supabase Functions
deploy_supabase_functions() {
    log_step "Deploying Supabase Functions"
    
    require_command "supabase"
    
    # Check if Supabase is linked
    if ! supabase projects list 2>/dev/null | grep -q "$SUPABASE_PROJECT_REF"; then
        log_info "Linking to Supabase project"
        if ! supabase link --project-ref "$SUPABASE_PROJECT_REF"; then
            log_error "Failed to link to Supabase project"
            exit 1
        fi
    fi
    
    # Deploy Edge Functions
    log_info "Deploying Edge Functions"
    if ! supabase functions deploy edge-reads --project-ref "$SUPABASE_PROJECT_REF"; then
        log_error "Failed to deploy edge-reads function"
        exit 1
    fi
    
    # Deploy Node Functions
    log_info "Deploying Node Functions"
    if ! supabase functions deploy node-writes --project-ref "$SUPABASE_PROJECT_REF"; then
        log_error "Failed to deploy node-writes function"
        exit 1
    fi
    
    log_success "Supabase Functions deployment completed"
}

# Health checks
health_checks() {
    log_step "Running health checks"
    
    # Get the deployed URL from Vercel
    DEPLOY_URL=$(vercel ls --scope "$PROJECT_NAME" 2>/dev/null | grep -E "^\s*https://" | head -1 | awk '{print $1}')
    
    if [ -z "$DEPLOY_URL" ]; then
        log_warning "Could not determine deployed URL"
        return 0
    fi
    
    log_info "Checking health of deployed application at $DEPLOY_URL"
    
    # Check main endpoint
    if curl -s --max-time "$TIMEOUT" "$DEPLOY_URL" >/dev/null; then
        log_success "Main endpoint is healthy"
    else
        log_warning "Main endpoint health check failed"
    fi
    
    # Check API endpoint
    if curl -s --max-time "$TIMEOUT" "$DEPLOY_URL/api/health" >/dev/null; then
        log_success "API endpoint is healthy"
    else
        log_warning "API endpoint health check failed"
    fi
    
    log_success "Health checks completed"
}

# Main function
main() {
    log_info "Starting NeonPro deployment"
    
    # Validate project structure
    validate_project
    
    # Deploy to Vercel
    deploy_vercel
    
    # Deploy Supabase Functions
    deploy_supabase_functions
    
    # Run health checks
    health_checks
    
    log_success "Deployment completed successfully"
}

# Run main function
main "$@"
