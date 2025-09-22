#!/bin/bash

# =============================================================================
# NeonPro Healthcare Platform - Production Health Check Script
# =============================================================================
# This script performs comprehensive health checks for the healthcare platform
# ensuring all systems are operational and compliant with healthcare regulations.
#
# Author: NeonPro DevOps Team
# Version: 1.0.0
# Compliance: LGPD, ANVISA, CFM
# =============================================================================

set -euo pipefail

# Configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
readonly LOG_FILE="/var/log/neonpro/health-check.log"
readonly ALERT_THRESHOLD=3
readonly HEALTH_CHECK_TIMEOUT=30

# Health check endpoints (configure for your environment)
readonly WEB_HEALTH_URL="https://api.neonpro.healthcare/health"
readonly API_HEALTH_URL="https://api.neonpro.healthcare/api/health"
readonly DATABASE_HEALTH_URL="https://api.neonpro.healthcare/api/health/database"
readonly COMPLIANCE_HEALTH_URL="https://api.neonpro.healthcare/api/health/compliance"

# Color codes for output
readonly RED='\033[0;31m'
readonly YELLOW='\033[1;33m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Health check status tracking
declare -i FAILED_CHECKS=0
declare -a FAILED_SERVICES=()

# Logging function
log() {
    local level="$1"
    local message="$2"
    echo -e "${TIMESTAMP} [${level}] ${message}" | tee -a "$LOG_FILE"
}

# HTTP health check function
check_http_endpoint() {
    local service_name="$1"
    local url="$2"
    local expected_code="${3:-200}"
    local timeout="$HEALTH_CHECK_TIMEOUT"
    
    log "INFO" "Checking ${service_name} health at ${url}"
    
    local response_code
    local response_time
    local response_body
    
    if ! response=$(curl -s -w "%{http_code}%{time_total}" --max-time "$timeout" "$url" 2>/dev/null); then
        log "ERROR" "${service_name}: Connection failed"
        ((FAILED_CHECKS++))
        FAILED_SERVICES+=("$service_name")
        return 1
    fi
    
    response_code="${response: -6:3}"
    response_time="${response:0:-6}"
    
    if [[ "$response_code" != "$expected_code" ]]; then
        log "ERROR" "${service_name}: HTTP ${response_code} (expected ${expected_code})"
        ((FAILED_CHECKS++))
        FAILED_SERVICES+=("$service_name")
        return 1
    fi
    
    # Check response time (alert if > 5 seconds)
    if (( $(echo "$response_time > 5.0" | bc -l) )); then
        log "WARNING" "${service_name}: Slow response time ${response_time}s"
    fi
    
    log "INFO" "${service_name}: OK (${response_time}s)"
    return 0
}

# Database connectivity check
check_database() {
    log "INFO" "Checking database connectivity"
    
    # Check if database is accessible via application
    if ! check_http_endpoint "Database" "$DATABASE_HEALTH_URL" "200"; then
        return 1
    fi
    
    # Additional database-specific checks
    local db_check_result
    if ! db_check_result=$(curl -s --max-time "$HEALTH_CHECK_TIMEOUT" "$DATABASE_HEALTH_URL" 2>/dev/null); then
        log "ERROR" "Database: Detailed health check failed"
        ((FAILED_CHECKS++))
        FAILED_SERVICES+=("Database")
        return 1
    fi
    
    # Parse JSON response for database metrics
    local connection_count
    local max_connections
    local active_connections
    
    connection_count=$(echo "$db_check_result" | jq -r '.connection_count // 0' 2>/dev/null || echo "0")
    max_connections=$(echo "$db_check_result" | jq -r '.max_connections // 100' 2>/dev/null || echo "100")
    active_connections=$(echo "$db_check_result" | jq -r '.active_connections // 0' 2>/dev/null || echo "0")
    
    # Check connection pool usage
    local usage_percent
    usage_percent=$(echo "scale=2; $connection_count * 100 / $max_connections" | bc -l 2>/dev/null || echo "0")
    
    if (( $(echo "$usage_percent > 80" | bc -l) )); then
        log "WARNING" "Database: High connection usage (${usage_percent}%)"
    fi
    
    log "INFO" "Database: ${active_connections} active connections, ${usage_percent}% usage"
}

# Healthcare compliance check
check_compliance() {
    log "INFO" "Checking healthcare compliance status"
    
    local compliance_result
    if ! compliance_result=$(curl -s --max-time "$HEALTH_CHECK_TIMEOUT" "$COMPLIANCE_HEALTH_URL" 2>/dev/null); then
        log "ERROR" "Compliance: Health check failed"
        ((FAILED_CHECKS++))
        FAILED_SERVICES+=("Compliance")
        return 1
    fi
    
    # Check compliance status for each regulation
    local lgpd_status
    local anvisa_status
    local cfm_status
    
    lgpd_status=$(echo "$compliance_result" | jq -r '.compliance.lgpd.status // "unknown"' 2>/dev/null || echo "unknown")
    anvisa_status=$(echo "$compliance_result" | jq -r '.compliance.anvisa.status // "unknown"' 2>/dev/null || echo "unknown")
    cfm_status=$(echo "$compliance_result" | jq -r '.compliance.cfm.status // "unknown"' 2>/dev/null || echo "unknown")
    
    # Check if any compliance check failed
    if [[ "$lgpd_status" != "compliant" ]]; then
        log "ERROR" "Compliance: LGPD non-compliant (${lgpd_status})"
        ((FAILED_CHECKS++))
        FAILED_SERVICES+=("LGPD Compliance")
    fi
    
    if [[ "$anvisa_status" != "compliant" ]]; then
        log "ERROR" "Compliance: ANVISA non-compliant (${anvisa_status})"
        ((FAILED_CHECKS++))
        FAILED_SERVICES+=("ANVISA Compliance")
    fi
    
    if [[ "$cfm_status" != "compliant" ]]; then
        log "ERROR" "Compliance: CFM non-compliant (${cfm_status})"
        ((FAILED_CHECKS++))
        FAILED_SERVICES+=("CFM Compliance")
    fi
    
    log "INFO" "Compliance: LGPD=${lgpd_status}, ANVISA=${anvisa_status}, CFM=${cfm_status}"
}

# Security monitoring check
check_security() {
    log "INFO" "Checking security monitoring"
    
    # Check if security endpoints are responding
    if ! check_http_endpoint "Security Monitoring" "https://api.neonpro.healthcare/api/security/status" "200"; then
        return 1
    fi
    
    # Check for recent security incidents
    local security_result
    if ! security_result=$(curl -s --max-time "$HEALTH_CHECK_TIMEOUT" "https://api.neonpro.healthcare/api/security/incidents/recent" 2>/dev/null); then
        log "WARNING" "Security: Unable to fetch incident data"
        return 0
    fi
    
    local incident_count
    incident_count=$(echo "$security_result" | jq -r '.incidents | length' 2>/dev/null || echo "0")
    
    if [[ "$incident_count" -gt 0 ]]; then
        log "WARNING" "Security: ${incident_count} recent incidents detected"
        # Don't fail health check for incidents, just warn
    fi
    
    log "INFO" "Security: Monitoring active, ${incident_count} recent incidents"
}

# Performance metrics check
check_performance() {
    log "INFO" "Checking performance metrics"
    
    # Check system metrics
    local metrics_result
    if ! metrics_result=$(curl -s --max-time "$HEALTH_CHECK_TIMEOUT" "https://api.neonpro.healthcare/api/metrics" 2>/dev/null); then
        log "WARNING" "Performance: Unable to fetch metrics"
        return 0
    fi
    
    # Check memory usage
    local memory_usage
    memory_usage=$(echo "$metrics_result" | jq -r '.memory.usage_percent // 0' 2>/dev/null || echo "0")
    
    if (( $(echo "$memory_usage > 90" | bc -l) )); then
        log "WARNING" "Performance: High memory usage (${memory_usage}%)"
    fi
    
    # Check CPU usage
    local cpu_usage
    cpu_usage=$(echo "$metrics_result" | jq -r '.cpu.usage_percent // 0' 2>/dev/null || echo "0")
    
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        log "WARNING" "Performance: High CPU usage (${cpu_usage}%)"
    fi
    
    log "INFO" "Performance: CPU ${cpu_usage}%, Memory ${memory_usage}%"
}

# Backup system check
check_backups() {
    log "INFO" "Checking backup systems"
    
    local backup_result
    if ! backup_result=$(curl -s --max-time "$HEALTH_CHECK_TIMEOUT" "https://api.neonpro.healthcare/api/backups/status" 2>/dev/null); then
        log "ERROR" "Backups: Status check failed"
        ((FAILED_CHECKS++))
        FAILED_SERVICES+=("Backup System")
        return 1
    fi
    
    local last_backup
    local backup_status
    
    last_backup=$(echo "$backup_result" | jq -r '.last_backup // "never"' 2>/dev/null || echo "never")
    backup_status=$(echo "$backup_result" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
    
    if [[ "$backup_status" != "healthy" ]]; then
        log "ERROR" "Backups: System status ${backup_status}"
        ((FAILED_CHECKS++))
        FAILED_SERVICES+=("Backup System")
        return 1
    fi
    
    # Check if last backup was within 24 hours
    local backup_timestamp
    backup_timestamp=$(date -d "$last_backup" +%s 2>/dev/null || echo "0")
    local current_timestamp
    current_timestamp=$(date +%s)
    local hours_since_backup
    hours_since_backup=$(( (current_timestamp - backup_timestamp) / 3600 ))
    
    if [[ "$hours_since_backup" -gt 24 ]]; then
        log "WARNING" "Backups: Last backup was ${hours_since_backup} hours ago"
    fi
    
    log "INFO" "Backups: Healthy, last backup ${hours_since_backup}h ago"
}

# Main health check function
main() {
    log "INFO" "Starting NeonPro Healthcare Platform health check"
    log "INFO" "Checking critical healthcare systems and compliance"
    
    echo -e "${BLUE}===========================================================${NC}"
    echo -e "${BLUE}  NEONPRO HEALTHCARE PLATFORM - PRODUCTION HEALTH CHECK      ${NC}"
    echo -e "${BLUE}  Timestamp: ${TIMESTAMP}                                  ${NC}"
    echo -e "${BLUE}  Compliance: LGPD, ANVISA, CFM                            ${NC}"
    echo -e "${BLUE}===========================================================${NC}"
    
    # Execute all health checks
    check_http_endpoint "Web Application" "$WEB_HEALTH_URL"
    check_http_endpoint "API Gateway" "$API_HEALTH_URL"
    check_database
    check_compliance
    check_security
    check_performance
    check_backups
    
    # Summary
    echo -e "\n${BLUE}===========================================================${NC}"
    echo -e "${BLUE}                    HEALTH CHECK SUMMARY                    ${NC}"
    echo -e "${BLUE}===========================================================${NC}"
    
    if [[ $FAILED_CHECKS -eq 0 ]]; then
        echo -e "${GREEN}✓ All systems operational and compliant${NC}"
        log "INFO" "Health check completed successfully"
        exit 0
    else
        echo -e "${RED}✗ ${FAILED_CHECKS} health check(s) failed${NC}"
        echo -e "${YELLOW}Failed services:${NC}"
        for service in "${FAILED_SERVICES[@]}"; do
            echo -e "  - ${RED}${service}${NC}"
        done
        
        log "ERROR" "Health check failed with ${FAILED_CHECKS} failures"
        
        # Send alert if threshold exceeded
        if [[ $FAILED_CHECKS -ge $ALERT_THRESHOLD ]]; then
            log "CRITICAL" "Health check failure threshold exceeded. Alerting on-call team."
            # Here you would integrate with your alerting system (PagerDuty, Slack, etc.)
        fi
        
        exit 1
    fi
}

# Execute main function
main "$@"