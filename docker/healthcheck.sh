#!/bin/sh
# NEONPRO Health Check Script
# GRUPO US VIBECODE SYSTEM V5.0 - Phase 8 Production Monitoring
# 
# Comprehensive health check for production deployment
# Validates application, monitoring, and observability endpoints

set -e

# Configuration
HOST=${HOSTNAME:-localhost}
PORT=${PORT:-3000}
TIMEOUT=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [HEALTHCHECK] $1"
}

# Check if application is responding
check_app_health() {
    log "Checking application health..."
    
    if curl -f -s --max-time $TIMEOUT "http://${HOST}:${PORT}/api/health" > /dev/null 2>&1; then
        log "${GREEN}✅ Application health check passed${NC}"
        return 0
    else
        log "${RED}❌ Application health check failed${NC}"
        return 1
    fi
}

# Check monitoring endpoints
check_monitoring_health() {
    log "Checking monitoring endpoints..."
    
    # Check if monitoring dashboard is accessible
    if curl -f -s --max-time $TIMEOUT "http://${HOST}:${PORT}/dashboard/monitoring" > /dev/null 2>&1; then
        log "${GREEN}✅ Monitoring dashboard accessible${NC}"
    else
        log "${YELLOW}⚠️ Monitoring dashboard not accessible${NC}"
        return 1
    fi
    
    return 0
}

# Check observability endpoints
check_observability_health() {
    log "Checking observability integration..."
    
    # Check if observability is initialized (this would be a custom endpoint)
    if curl -f -s --max-time $TIMEOUT "http://${HOST}:${PORT}/api/observability/status" > /dev/null 2>&1; then
        log "${GREEN}✅ Observability integration active${NC}"
    else
        log "${YELLOW}⚠️ Observability status endpoint not available${NC}"
        # Don't fail on observability check as it might not have a dedicated endpoint
    fi
    
    return 0
}

# Check database connectivity (if applicable)
check_database_health() {
    log "Checking database connectivity..."
    
    # This would check database connection through an API endpoint
    if curl -f -s --max-time $TIMEOUT "http://${HOST}:${PORT}/api/db/health" > /dev/null 2>&1; then
        log "${GREEN}✅ Database connectivity verified${NC}"
    else
        log "${YELLOW}⚠️ Database health endpoint not available${NC}"
        # Don't fail on database check as endpoint might not exist
    fi
    
    return 0
}

# Main health check function
main() {
    log "Starting NEONPRO health check..."
    
    # Critical checks (must pass)
    if ! check_app_health; then
        log "${RED}❌ Critical health check failed${NC}"
        exit 1
    fi
    
    # Non-critical checks (warnings only)
    check_monitoring_health || true
    check_observability_health || true
    check_database_health || true
    
    log "${GREEN}✅ Health check completed successfully${NC}"
    exit 0
}

# Run health check
main "$@"
