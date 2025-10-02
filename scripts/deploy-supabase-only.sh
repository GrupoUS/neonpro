#!/bin/bash

# NeonPro Supabase Functions Deployment Script
# Simplified deployment script for Supabase Functions only

set -euo pipefail

# Logging functions
log_info() { echo "[INFO] $1" >&2; }
log_success() { echo "[SUCCESS] $1" >&2; }
log_warning() { echo "[WARNING] $1" >&2; }
log_error() { echo "[ERROR] $1" >&2; }
log_step() { echo "[STEP] $1" >&2; }

# Configuration
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
    
    if [ ! -d "supabase/functions" ]; then
        log_error "supabase/functions directory not found"
        exit 1
    fi
    
    if [ -z "${SUPABASE_PROJECT_REF:-}" ]; then
        log_error "SUPABASE_PROJECT_REF not found in environment variables"
        exit 1
    fi
    
    log_success "Project structure validation passed"
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
    
    # Get the Supabase URL
    SUPABASE_URL="https://$SUPABASE_PROJECT_REF.supabase.co"
    
    log_info "Checking health of Supabase Functions at $SUPABASE_URL"
    
    # Check Edge Function
    if curl -s --max-time "$TIMEOUT" "$SUPABASE_URL/functions/v1/edge-reads" >/dev/null; then
        log_success "Edge Function is healthy"
    else
        log_warning "Edge Function health check failed"
    fi
    
    # Check Node Function
    if curl -s --max-time "$TIMEOUT" "$SUPABASE_URL/functions/v1/node-writes/health" >/dev/null; then
        log_success "Node Function is healthy"
    else
        log_warning "Node Function health check failed"
    fi
    
    log_success "Health checks completed"
}

# Main function
main() {
    log_info "Starting NeonPro Supabase Functions deployment"
    
    # Validate project structure
    validate_project
    
    # Deploy Supabase Functions
    deploy_supabase_functions
    
    # Run health checks
    health_checks
    
    log_success "Supabase Functions deployment completed successfully"
}

# Run main function
main "$@"
