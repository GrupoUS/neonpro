#!/bin/bash
# NEONPRO Production Deployment Script
# GRUPO US VIBECODE SYSTEM V5.0 - Phase 8 Production Monitoring
# 
# Comprehensive deployment script with monitoring integration
# Handles staging and production deployments with health checks

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_DIR/docker"

# Default values
ENVIRONMENT="${1:-staging}"
IMAGE_TAG="${2:-latest}"
SKIP_TESTS="${SKIP_TESTS:-false}"
SKIP_BACKUP="${SKIP_BACKUP:-false}"
DRY_RUN="${DRY_RUN:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') [DEPLOY] $1"
}

log_info() {
    log "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    log "${GREEN}✅ $1${NC}"
}

log_warning() {
    log "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    log "${RED}❌ $1${NC}"
}

# Error handling
error_exit() {
    log_error "$1"
    exit 1
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    # Add cleanup logic here
}

# Set trap for cleanup
trap cleanup EXIT

# Validate environment
validate_environment() {
    log_info "Validating deployment environment: $ENVIRONMENT"
    
    case "$ENVIRONMENT" in
        staging|production)
            log_success "Environment '$ENVIRONMENT' is valid"
            ;;
        *)
            error_exit "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error_exit "Docker is not installed"
    fi
    
    if ! docker info &> /dev/null; then
        error_exit "Docker is not running"
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error_exit "Docker Compose is not available"
    fi
    
    # Check if required files exist
    local required_files=(
        "$DOCKER_DIR/docker-compose.production.yml"
        "$PROJECT_DIR/.env.production"
        "$DOCKER_DIR/Dockerfile"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            error_exit "Required file not found: $file"
        fi
    done
    
    log_success "All prerequisites met"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        log_warning "Skipping tests (SKIP_TESTS=true)"
        return 0
    fi
    
    log_info "Running tests before deployment..."
    
    cd "$PROJECT_DIR"
    
    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        log_info "Installing dependencies..."
        npm ci
    fi
    
    # Run unit tests
    log_info "Running unit tests..."
    npm run test:coverage
    
    # Run E2E tests for staging
    if [[ "$ENVIRONMENT" == "staging" ]]; then
        log_info "Running E2E tests..."
        npm run test:e2e
    fi
    
    log_success "All tests passed"
}

# Create backup
create_backup() {
    if [[ "$SKIP_BACKUP" == "true" ]]; then
        log_warning "Skipping backup (SKIP_BACKUP=true)"
        return 0
    fi
    
    log_info "Creating backup before deployment..."
    
    local backup_dir="$PROJECT_DIR/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup database
    if docker ps | grep -q "neonpro-postgres"; then
        log_info "Backing up database..."
        docker exec neonpro-postgres pg_dump -U neonpro neonpro_production > "$backup_dir/database.sql"
    fi
    
    # Backup volumes
    log_info "Backing up application data..."
    docker run --rm -v neonpro-app-logs:/data -v "$backup_dir":/backup alpine tar czf /backup/app-logs.tar.gz -C /data .
    
    log_success "Backup created at $backup_dir"
}

# Build and push image
build_image() {
    log_info "Building Docker image..."
    
    cd "$PROJECT_DIR"
    
    local image_name="ghcr.io/grupous/neonpro:$IMAGE_TAG"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would build image $image_name"
        return 0
    fi
    
    # Build image
    docker build \
        -f "$DOCKER_DIR/Dockerfile" \
        -t "$image_name" \
        --build-arg NODE_VERSION=20 \
        --build-arg MONITORING_ENABLED=true \
        --build-arg OBSERVABILITY_ENABLED=true \
        .
    
    # Push image (if not local deployment)
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_info "Pushing image to registry..."
        docker push "$image_name"
    fi
    
    log_success "Image built successfully: $image_name"
}

# Deploy application
deploy_application() {
    log_info "Deploying NEONPRO to $ENVIRONMENT..."
    
    cd "$DOCKER_DIR"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would deploy to $ENVIRONMENT"
        return 0
    fi
    
    # Set environment-specific variables
    export COMPOSE_PROJECT_NAME="neonpro-$ENVIRONMENT"
    export IMAGE_TAG="$IMAGE_TAG"
    
    # Deploy with Docker Compose
    docker-compose -f docker-compose.production.yml down --remove-orphans
    docker-compose -f docker-compose.production.yml pull
    docker-compose -f docker-compose.production.yml up -d
    
    log_success "Deployment completed"
}

# Health checks
run_health_checks() {
    log_info "Running post-deployment health checks..."
    
    local max_attempts=30
    local attempt=1
    local health_url="http://localhost:3000/api/health"
    
    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt $attempt/$max_attempts..."
        
        if curl -f -s --max-time 10 "$health_url" > /dev/null 2>&1; then
            log_success "Application is healthy"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            error_exit "Health checks failed after $max_attempts attempts"
        fi
        
        sleep 10
        ((attempt++))
    done
    
    # Additional health checks
    log_info "Running comprehensive health checks..."
    
    # Check monitoring dashboard
    if curl -f -s --max-time 10 "http://localhost:3000/dashboard/monitoring" > /dev/null 2>&1; then
        log_success "Monitoring dashboard is accessible"
    else
        log_warning "Monitoring dashboard is not accessible"
    fi
    
    # Check Jaeger
    if curl -f -s --max-time 10 "http://localhost:16686/" > /dev/null 2>&1; then
        log_success "Jaeger tracing is accessible"
    else
        log_warning "Jaeger tracing is not accessible"
    fi
    
    # Check Grafana
    if curl -f -s --max-time 10 "http://localhost:3001/" > /dev/null 2>&1; then
        log_success "Grafana monitoring is accessible"
    else
        log_warning "Grafana monitoring is not accessible"
    fi
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    cd "$DOCKER_DIR"
    
    # Stop current deployment
    docker-compose -f docker-compose.production.yml down
    
    # Restore from backup (simplified)
    log_info "Restore from backup would be implemented here"
    
    log_success "Rollback completed"
}

# Main deployment function
main() {
    log_info "Starting NEONPRO deployment to $ENVIRONMENT"
    log_info "Image tag: $IMAGE_TAG"
    log_info "Dry run: $DRY_RUN"
    
    # Validate inputs
    validate_environment
    
    # Check prerequisites
    check_prerequisites
    
    # Run tests
    run_tests
    
    # Create backup
    create_backup
    
    # Build image
    build_image
    
    # Deploy application
    deploy_application
    
    # Run health checks
    run_health_checks
    
    log_success "🎉 NEONPRO deployment to $ENVIRONMENT completed successfully!"
    log_info "📊 Monitoring: http://localhost:3000/dashboard/monitoring"
    log_info "🔍 Tracing: http://localhost:16686"
    log_info "📈 Grafana: http://localhost:3001"
}

# Help function
show_help() {
    cat << EOF
NEONPRO Production Deployment Script

Usage: $0 [ENVIRONMENT] [IMAGE_TAG]

Arguments:
  ENVIRONMENT    Deployment environment (staging|production) [default: staging]
  IMAGE_TAG      Docker image tag [default: latest]

Environment Variables:
  SKIP_TESTS     Skip running tests [default: false]
  SKIP_BACKUP    Skip creating backup [default: false]
  DRY_RUN        Show what would be done without executing [default: false]

Examples:
  $0 staging
  $0 production v1.2.3
  SKIP_TESTS=true $0 staging
  DRY_RUN=true $0 production

EOF
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
