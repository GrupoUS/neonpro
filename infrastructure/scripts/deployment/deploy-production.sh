#!/bin/bash

# NeonPro AI Services - Production Deployment Script
# Comprehensive deployment automation with safety checks and rollback capabilities
# Author: NeonPro Development Team
# Version: 1.0.0

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# =============================================================================
# CONFIGURATION AND VARIABLES
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
INFRASTRUCTURE_DIR="$PROJECT_ROOT/infrastructure"
ENV_DIR="$INFRASTRUCTURE_DIR/environments"

# Deployment configuration
DEPLOYMENT_ENV="${DEPLOYMENT_ENV:-production}"
VERSION="${VERSION:-$(git rev-parse --short HEAD)}"
BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
VCS_REF="$(git rev-parse HEAD)"

# Docker configuration
DOCKER_REGISTRY="${DOCKER_REGISTRY:-neonpro}"
IMAGE_NAME="${IMAGE_NAME:-ai-services}"
DOCKER_TAG="${DOCKER_TAG:-${VERSION}}"
DOCKER_BUILDX_ENABLED="${DOCKER_BUILDX_ENABLED:-true}"

# Deployment targets
DEPLOY_WEB="${DEPLOY_WEB:-true}"
DEPLOY_MONITORING="${DEPLOY_MONITORING:-true}"
DEPLOY_CACHE="${DEPLOY_CACHE:-true}"
DEPLOY_BACKUP="${DEPLOY_BACKUP:-true}"

# Safety configuration
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-60}"
ROLLBACK_ON_FAILURE="${ROLLBACK_ON_FAILURE:-true}"
BACKUP_BEFORE_DEPLOY="${BACKUP_BEFORE_DEPLOY:-true}"
SMOKE_TEST_TIMEOUT="${SMOKE_TEST_TIMEOUT:-120}"

# Notification configuration
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
EMAIL_NOTIFICATIONS="${EMAIL_NOTIFICATIONS:-false}"
NOTIFICATION_CHANNEL="${NOTIFICATION_CHANNEL:-#deployments}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

send_notification() {
    local message="$1"
    local status="${2:-info}"
    local emoji="ℹ️"
    
    case $status in
        "success") emoji="✅" ;;
        "warning") emoji="⚠️" ;;
        "error") emoji="❌" ;;
        "start") emoji="🚀" ;;
        "rollback") emoji="🔄" ;;
    esac
    
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"channel\":\"$NOTIFICATION_CHANNEL\",\"text\":\"$emoji NeonPro Deployment: $message\"}" \
            "$SLACK_WEBHOOK_URL" > /dev/null 2>&1 || true
    fi
    
    if [[ "$EMAIL_NOTIFICATIONS" == "true" ]]; then
        # Implementation for email notifications would go here
        log "Email notification: $message"
    fi
}

check_prerequisites() {
    log "Checking deployment prerequisites..."
    
    # Check required tools
    local required_tools=("docker" "docker-compose" "git" "curl" "jq")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "$tool is required but not installed"
            exit 1
        fi
    done
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    # Check environment files
    if [[ ! -f "$ENV_DIR/production.env" ]]; then
        log_error "Production environment file not found: $ENV_DIR/production.env"
        exit 1
    fi
    
    # Check git repository status
    if [[ $(git status --porcelain) ]]; then
        log_warning "Working directory is not clean. Uncommitted changes detected."
        read -p "Continue with deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Deployment cancelled by user"
            exit 1
        fi
    fi
    
    log_success "Prerequisites check passed"
}

backup_current_state() {
    if [[ "$BACKUP_BEFORE_DEPLOY" != "true" ]]; then
        return 0
    fi
    
    log "Creating backup of current state..."
    
    local backup_dir="/opt/neonpro/backups/pre-deploy-$(date +'%Y%m%d-%H%M%S')"
    mkdir -p "$backup_dir"
    
    # Backup Redis data
    if docker ps --format "table {{.Names}}" | grep -q "neonpro-redis-prod"; then
        docker exec neonpro-redis-prod redis-cli --rdb /data/backup.rdb || true
        docker cp neonpro-redis-prod:/data/backup.rdb "$backup_dir/redis-backup.rdb" || true
    fi
    
    # Backup application logs
    if [[ -d "/opt/neonpro/logs" ]]; then
        cp -r "/opt/neonpro/logs" "$backup_dir/" || true
    fi
    
    # Save current docker-compose state
    docker-compose -f "$ENV_DIR/docker-compose.production.yml" config > "$backup_dir/docker-compose-backup.yml" || true
    
    # Save current environment
    cp "$ENV_DIR/production.env" "$backup_dir/production.env.backup" || true
    
    log_success "Backup created at $backup_dir"
    echo "$backup_dir" > /tmp/neonpro-backup-path
}

build_images() {
    log "Building Docker images..."
    
    cd "$PROJECT_ROOT"
    
    if [[ "$DOCKER_BUILDX_ENABLED" == "true" ]]; then
        # Multi-platform build with buildx
        docker buildx create --use --name neonpro-builder || true
        docker buildx build \
            --platform linux/amd64,linux/arm64 \
            --file "$INFRASTRUCTURE_DIR/docker/Dockerfile.production" \
            --target production \
            --build-arg VERSION="$VERSION" \
            --build-arg BUILD_DATE="$BUILD_DATE" \
            --build-arg VCS_REF="$VCS_REF" \
            --tag "$DOCKER_REGISTRY/$IMAGE_NAME:$DOCKER_TAG" \
            --tag "$DOCKER_REGISTRY/$IMAGE_NAME:latest" \
            --push \
            .
    else
        # Standard build
        docker build \
            --file "$INFRASTRUCTURE_DIR/docker/Dockerfile.production" \
            --target production \
            --build-arg VERSION="$VERSION" \
            --build-arg BUILD_DATE="$BUILD_DATE" \
            --build-arg VCS_REF="$VCS_REF" \
            --tag "$DOCKER_REGISTRY/$IMAGE_NAME:$DOCKER_TAG" \
            --tag "$DOCKER_REGISTRY/$IMAGE_NAME:latest" \
            .
    fi
    
    log_success "Docker images built successfully"
}

run_security_scan() {
    log "Running security scan on built images..."
    
    # Scan the built image for vulnerabilities
    docker run --rm \
        -v /var/run/docker.sock:/var/run/docker.sock \
        aquasec/trivy:latest \
        image --exit-code 0 --severity HIGH,CRITICAL \
        "$DOCKER_REGISTRY/$IMAGE_NAME:$DOCKER_TAG" || {
        log_warning "Security vulnerabilities found in image"
        read -p "Continue with deployment despite security issues? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Deployment cancelled due to security concerns"
            exit 1
        fi
    }
    
    log_success "Security scan completed"
}

deploy_services() {
    log "Deploying services to production..."
    
    cd "$ENV_DIR"
    
    # Set environment variables for docker-compose
    export VERSION="$DOCKER_TAG"
    export DOCKER_REGISTRY="$DOCKER_REGISTRY"
    export IMAGE_NAME="$IMAGE_NAME"
    
    # Deploy services with zero-downtime strategy
    if [[ "$DEPLOY_WEB" == "true" ]]; then
        log "Deploying web application..."
        docker-compose -f docker-compose.production.yml up -d --no-deps web
    fi
    
    if [[ "$DEPLOY_CACHE" == "true" ]]; then
        log "Deploying cache services..."
        docker-compose -f docker-compose.production.yml up -d --no-deps redis
    fi
    
    if [[ "$DEPLOY_MONITORING" == "true" ]]; then
        log "Deploying monitoring stack..."
        docker-compose -f docker-compose.production.yml up -d --no-deps monitoring grafana
    fi
    
    if [[ "$DEPLOY_BACKUP" == "true" ]]; then
        log "Deploying backup service..."
        docker-compose -f docker-compose.production.yml up -d --no-deps backup
    fi
    
    # Deploy supporting services
    docker-compose -f docker-compose.production.yml up -d traefik log-aggregator
    
    log_success "Services deployed successfully"
}

wait_for_health_check() {
    log "Waiting for services to become healthy..."
    
    local start_time=$(date +%s)
    local timeout=$HEALTH_CHECK_TIMEOUT
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [[ $elapsed -gt $timeout ]]; then
            log_error "Health check timeout after ${timeout}s"
            return 1
        fi
        
        # Check web service health
        if curl -f -s "http://localhost:3000/api/health" > /dev/null; then
            log_success "Web service is healthy"
            break
        fi
        
        log "Waiting for services to start... (${elapsed}s/${timeout}s)"
        sleep 5
    done
    
    # Additional health checks
    local services=("web" "redis" "monitoring")
    for service in "${services[@]}"; do
        if ! docker-compose -f "$ENV_DIR/docker-compose.production.yml" ps "$service" | grep -q "Up (healthy)"; then
            log_warning "Service $service may not be fully healthy"
        fi
    done
}

run_smoke_tests() {
    log "Running smoke tests..."
    
    local start_time=$(date +%s)
    local timeout=$SMOKE_TEST_TIMEOUT
    local tests_passed=0
    local total_tests=5
    
    # Test 1: Health endpoint
    if curl -f -s "http://localhost:3000/api/health" | jq -e '.status == "healthy"' > /dev/null 2>&1; then
        log_success "✓ Health endpoint test passed"
        ((tests_passed++))
    else
        log_error "✗ Health endpoint test failed"
    fi
    
    # Test 2: AI Chat API
    if curl -f -s "http://localhost:3000/api/ai/universal-chat" | jq -e '.status == "operational"' > /dev/null 2>&1; then
        log_success "✓ AI Chat API test passed"
        ((tests_passed++))
    else
        log_error "✗ AI Chat API test failed"
    fi
    
    # Test 3: Redis connectivity
    if docker exec neonpro-redis-prod redis-cli ping | grep -q "PONG"; then
        log_success "✓ Redis connectivity test passed"
        ((tests_passed++))
    else
        log_error "✗ Redis connectivity test failed"
    fi
    
    # Test 4: Database connectivity (via health check)
    if curl -f -s "http://localhost:3000/api/health" | jq -e '.checks.database == "healthy"' > /dev/null 2>&1; then
        log_success "✓ Database connectivity test passed"
        ((tests_passed++))
    else
        log_error "✗ Database connectivity test failed"
    fi
    
    # Test 5: Monitoring endpoints
    if curl -f -s "http://localhost:9090/-/healthy" > /dev/null 2>&1; then
        log_success "✓ Monitoring health test passed"
        ((tests_passed++))
    else
        log_error "✗ Monitoring health test failed"
    fi
    
    local success_rate=$((tests_passed * 100 / total_tests))
    log "Smoke tests completed: $tests_passed/$total_tests passed ($success_rate%)"
    
    if [[ $tests_passed -lt $total_tests ]]; then
        log_warning "Some smoke tests failed"
        if [[ $success_rate -lt 80 ]]; then
            log_error "Critical failure rate detected (success rate: $success_rate%)"
            return 1
        fi
    fi
    
    return 0
}

rollback_deployment() {
    log_error "Rolling back deployment..."
    send_notification "Deployment failed, initiating rollback" "rollback"
    
    # Get backup path
    local backup_path
    if [[ -f "/tmp/neonpro-backup-path" ]]; then
        backup_path=$(cat /tmp/neonpro-backup-path)
    else
        log_error "No backup path found, cannot perform automatic rollback"
        return 1
    fi
    
    # Stop current services
    docker-compose -f "$ENV_DIR/docker-compose.production.yml" down
    
    # Restore Redis data
    if [[ -f "$backup_path/redis-backup.rdb" ]]; then
        docker cp "$backup_path/redis-backup.rdb" neonpro-redis-prod:/data/dump.rdb || true
    fi
    
    # Restore environment
    if [[ -f "$backup_path/production.env.backup" ]]; then
        cp "$backup_path/production.env.backup" "$ENV_DIR/production.env"
    fi
    
    # Restart services with previous configuration
    if [[ -f "$backup_path/docker-compose-backup.yml" ]]; then
        docker-compose -f "$backup_path/docker-compose-backup.yml" up -d
    else
        docker-compose -f "$ENV_DIR/docker-compose.production.yml" up -d
    fi
    
    log_success "Rollback completed"
    send_notification "Deployment rollback completed" "success"
}

cleanup_deployment() {
    log "Cleaning up deployment artifacts..."
    
    # Remove unused Docker images
    docker image prune -f || true
    
    # Remove buildx builder if created
    docker buildx rm neonpro-builder || true
    
    # Clean up temporary files
    rm -f /tmp/neonpro-backup-path
    
    log_success "Cleanup completed"
}

show_deployment_status() {
    log "=== DEPLOYMENT STATUS ==="
    echo
    log "Version: $VERSION"
    log "Build Date: $BUILD_DATE"
    log "VCS Ref: $VCS_REF"
    echo
    
    log "=== SERVICE STATUS ==="
    docker-compose -f "$ENV_DIR/docker-compose.production.yml" ps
    echo
    
    log "=== RESOURCE USAGE ==="
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" || true
    echo
    
    log "=== HEALTH CHECKS ==="
    curl -s "http://localhost:3000/api/health" | jq '.' || echo "Health check failed"
    echo
}

main() {
    log "🚀 Starting NeonPro AI Services Production Deployment"
    log "Version: $VERSION"
    log "Environment: $DEPLOYMENT_ENV"
    echo
    
    send_notification "Starting deployment of version $VERSION" "start"
    
    # Deployment pipeline
    check_prerequisites
    backup_current_state
    build_images
    run_security_scan
    deploy_services
    
    # Health validation
    if ! wait_for_health_check; then
        if [[ "$ROLLBACK_ON_FAILURE" == "true" ]]; then
            rollback_deployment
            exit 1
        else
            log_error "Health checks failed but rollback is disabled"
            exit 1
        fi
    fi
    
    # Smoke testing
    if ! run_smoke_tests; then
        if [[ "$ROLLBACK_ON_FAILURE" == "true" ]]; then
            rollback_deployment
            exit 1
        else
            log_warning "Smoke tests failed but rollback is disabled"
        fi
    fi
    
    # Success
    cleanup_deployment
    show_deployment_status
    
    log_success "🎉 Deployment completed successfully!"
    send_notification "Deployment of version $VERSION completed successfully" "success"
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "rollback")
        rollback_deployment
        ;;
    "status")
        show_deployment_status
        ;;
    "cleanup")
        cleanup_deployment
        ;;
    "help"|"--help"|"-h")
        echo "NeonPro AI Services Production Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy    - Deploy services to production (default)"
        echo "  rollback  - Rollback to previous version"
        echo "  status    - Show deployment status"
        echo "  cleanup   - Clean up deployment artifacts"
        echo "  help      - Show this help message"
        echo ""
        echo "Environment Variables:"
        echo "  VERSION                   - Version to deploy (default: git short hash)"
        echo "  DEPLOYMENT_ENV           - Target environment (default: production)"
        echo "  ROLLBACK_ON_FAILURE      - Auto rollback on failure (default: true)"
        echo "  HEALTH_CHECK_TIMEOUT     - Health check timeout in seconds (default: 60)"
        echo "  SMOKE_TEST_TIMEOUT       - Smoke test timeout in seconds (default: 120)"
        echo ""
        exit 0
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac