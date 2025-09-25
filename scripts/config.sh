#!/bin/bash

# NEONPRO - Centralized Configuration for Scripts
# Externalizes all hardcoded values for maintainability and security

set -euo pipefail

# ==============================================
# SYSTEM REQUIREMENTS
# ==============================================

# Node.js requirements
MINIMUM_NODE_VERSION="20.0.0"
REQUIRED_NODE_VERSION_MAJOR="20"

# Memory requirements (GB)
REQUIRED_MEMORY_GB=8
MINIMUM_MEMORY_GB=4

# Disk space requirements (GB)
MINIMUM_DISK_SPACE_GB=10

# ==============================================
# DATABASE CONFIGURATION
# ==============================================

# Connection settings
DB_TIMEOUT=${DB_TIMEOUT:-30}
DB_CONNECTION_ATTEMPTS=${DB_CONNECTION_ATTEMPTS:-3}
DB_MAX_CONNECTIONS=${DB_MAX_CONNECTIONS:-10}
DB_POOL_TIMEOUT=${DB_POOL_TIMEOUT:-15}

# ==============================================
# PERFORMANCE & TIMEOUT SETTINGS
# ==============================================

# Build timeouts (seconds)
BUILD_TIMEOUT=60
LINT_TIMEOUT=30
AUDIT_TIMEOUT=30

# Deployment timeouts (seconds)
DEPLOYMENT_TIMEOUT=10
HEALTH_CHECK_TIMEOUT=30
CURL_TIMEOUT=30

# Response time thresholds (ms)
MAX_RESPONSE_TIME_MS=3000
MAX_RESPONSE_TIME_HEALTHCARE_MS=100

# ==============================================
# AUDIT & QUALITY THRESHOLDS
# ==============================================

# Bundle size thresholds (MB)
MAX_BUNDLE_SIZE_MB=15
OPTIMAL_BUNDLE_SIZE_MB=10
OPTIMAL_BUILD_SIZE_MB=10

# Compliance thresholds (%)
MIN_COMPLIANCE_PERCENTAGE=80
EXCELLENT_AUDIT_SCORE=90
GOOD_AUDIT_SCORE=80
ACCEPTABLE_AUDIT_SCORE=70

# Healthcare limits
HEALTHCARE_BUNDLE_SIZE_LIMIT_KB=250
HEALTHCARE_RESPONSE_TIME_LIMIT_MS=100

# ==============================================
# HEALTHCARE COMPLIANCE SETTINGS
# ==============================================

# Compliance flags (default to true for healthcare platform)
HEALTHCARE_MODE=${HEALTHCARE_MODE:-true}
LGPD_COMPLIANCE=${LGPD_COMPLIANCE:-true}
ANVISA_COMPLIANCE=${ANVISA_COMPLIANCE:-true}
CFM_COMPLIANCE=${CFM_COMPLIANCE:-true}

# ==============================================
# SERVER & ENDPOINT CONFIGURATION
# ==============================================

# Local development server
LOCAL_DEVELOPMENT_PORT=3000
LOCAL_DEVELOPMENT_HOST="http://localhost:3000"

# Alternative development ports
VITE_DEV_PORT=5173
API_PORT=3001

# ==============================================
# MONITORING & LOGGING
# ==============================================

# Monitoring intervals (seconds)
MONITORING_INTERVAL=60
HEALTH_CHECK_INTERVAL=60

# Performance monitoring
PERFORMANCE_SAMPLE_SIZE=100
PERFORMANCE_THRESHOLD_MS=200

# ==============================================
# SECURITY CONFIGURATION
# ==============================================

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_LOGIN_REQUESTS=5

# Session security
SESSION_TIMEOUT_HOURS=1
JWT_EXPIRY_SECONDS=3600
MIN_SECRET_LENGTH=32

# File permissions
SAFE_FILE_PERMS="644"
SAFE_EXEC_PERMS="755"
RESTRICTED_PERMS="600"

# ==============================================
# BUILD & DEPLOYMENT CONFIGURATION
# ==============================================

# Build optimization
BUILD_PARALLEL_JOBS=$(nproc)
BUILD_CACHE_ENABLED=true
BUILD_MINIFY=true

# Deployment strategy
DEPLOYMENT_STRATEGY="blue-green"
ROLLBACK_CHECK_INTERVAL=30
MAX_ROLLBACK_ATTEMPTS=3

# ==============================================
# BACKUP & DISASTER RECOVERY
# ==============================================

# Backup retention (days)
DAILY_BACKUP_RETENTION=30
WEEKLY_BACKUP_RETENTION=90
MONTHLY_BACKUP_RETENTION=365

# Recovery objectives (minutes)
RPO_MINUTES=15  # Recovery Point Objective
RTO_MINUTES=60  # Recovery Time Objective

# ==============================================
# NOTIFICATION CONFIGURATION
# ==============================================

# PagerDuty (if configured)
PAGERDUTY_ENDPOINT="https://events.pagerduty.com/generic/2010-04-15/create_event.json"

# Email notifications
NOTIFICATION_EMAIL_FROM="noreply@neonpro.health"
NOTIFICATION_EMAIL_ADMIN="admin@neonpro.health"

# ==============================================
# VALIDATION FUNCTIONS
# ==============================================

# Validate configuration values
validate_config() {
    local errors=0
    
    # Validate numeric values
    if ! [[ "$DB_TIMEOUT" =~ ^[0-9]+$ ]]; then
        echo "ERROR: Invalid DB_TIMEOUT: must be a number" >&2
        errors=$((errors + 1))
    fi
    
    if ! [[ "$REQUIRED_MEMORY_GB" =~ ^[0-9]+$ ]]; then
        echo "ERROR: Invalid REQUIRED_MEMORY_GB: must be a number" >&2
        errors=$((errors + 1))
    fi
    
    # Validate percentage values
    if ! [[ "$MIN_COMPLIANCE_PERCENTAGE" =~ ^[0-9]+$ ]] || \
       [ "$MIN_COMPLIANCE_PERCENTAGE" -lt 0 ] || \
       [ "$MIN_COMPLIANCE_PERCENTAGE" -gt 100 ]; then
        echo "ERROR: Invalid MIN_COMPLIANCE_PERCENTAGE: must be 0-100" >&2
        errors=$((errors + 1))
    fi
    
    # Validate port numbers
    if ! [[ "$LOCAL_DEVELOPMENT_PORT" =~ ^[0-9]+$ ]] || \
       [ "$LOCAL_DEVELOPMENT_PORT" -lt 1024 ] || \
       [ "$LOCAL_DEVELOPMENT_PORT" -gt 65535 ]; then
        echo "ERROR: Invalid LOCAL_DEVELOPMENT_PORT: must be 1024-65535" >&2
        errors=$((errors + 1))
    fi
    
    # Validate URLs
    if [[ ! "$LOCAL_DEVELOPMENT_HOST" =~ ^https?:// ]]; then
        echo "ERROR: Invalid LOCAL_DEVELOPMENT_HOST: must start with http:// or https://" >&2
        errors=$((errors + 1))
    fi
    
    if [ $errors -gt 0 ]; then
        echo "Configuration validation failed with $errors errors" >&2
        return 1
    fi
    
    echo "Configuration validation passed"
    return 0
}

# Load environment-specific overrides
load_environment_config() {
    local env="${1:-${NODE_ENV:-development}}"
    
    case "$env" in
        "production")
            # Production overrides
            BUILD_MINIFY=true
            BUILD_CACHE_ENABLED=false
            HEALTHCARE_MODE=true
            ;;
        "staging")
            # Staging overrides
            BUILD_MINIFY=true
            BUILD_CACHE_ENABLED=true
            ;;
        "development")
            # Development overrides
            BUILD_MINIFY=false
            BUILD_CACHE_ENABLED=true
            ;;
        "test")
            # Test overrides
            BUILD_MINIFY=false
            BUILD_CACHE_ENABLED=false
            ;;
    esac
}

# Export all configuration variables
export_config() {
    # System requirements
    export MINIMUM_NODE_VERSION
    export REQUIRED_NODE_VERSION_MAJOR
    export REQUIRED_MEMORY_GB
    export MINIMUM_MEMORY_GB
    export MINIMUM_DISK_SPACE_GB
    
    # Database configuration
    export DB_TIMEOUT
    export DB_CONNECTION_ATTEMPTS
    export DB_MAX_CONNECTIONS
    export DB_POOL_TIMEOUT
    
    # Performance settings
    export BUILD_TIMEOUT
    export LINT_TIMEOUT
    export AUDIT_TIMEOUT
    export DEPLOYMENT_TIMEOUT
    export HEALTH_CHECK_TIMEOUT
    export CURL_TIMEOUT
    export MAX_RESPONSE_TIME_MS
    export MAX_RESPONSE_TIME_HEALTHCARE_MS
    
    # Audit thresholds
    export MAX_BUNDLE_SIZE_MB
    export OPTIMAL_BUNDLE_SIZE_MB
    export OPTIMAL_BUILD_SIZE_MB
    export MIN_COMPLIANCE_PERCENTAGE
    export EXCELLENT_AUDIT_SCORE
    export GOOD_AUDIT_SCORE
    export ACCEPTABLE_AUDIT_SCORE
    export HEALTHCARE_BUNDLE_SIZE_LIMIT_KB
    export HEALTHCARE_RESPONSE_TIME_LIMIT_MS
    
    # Healthcare compliance
    export HEALTHCARE_MODE
    export LGPD_COMPLIANCE
    export ANVISA_COMPLIANCE
    export CFM_COMPLIANCE
    
    # Server configuration
    export LOCAL_DEVELOPMENT_PORT
    export LOCAL_DEVELOPMENT_HOST
    export VITE_DEV_PORT
    export API_PORT
    
    # Monitoring
    export MONITORING_INTERVAL
    export HEALTH_CHECK_INTERVAL
    export PERFORMANCE_SAMPLE_SIZE
    export PERFORMANCE_THRESHOLD_MS
    
    # Security
    export RATE_LIMIT_WINDOW_MS
    export RATE_LIMIT_MAX_REQUESTS
    export RATE_LIMIT_LOGIN_REQUESTS
    export SESSION_TIMEOUT_HOURS
    export JWT_EXPIRY_SECONDS
    export MIN_SECRET_LENGTH
    export SAFE_FILE_PERMS
    export SAFE_EXEC_PERMS
    export RESTRICTED_PERMS
    
    # Build & deployment
    export BUILD_PARALLEL_JOBS
    export BUILD_CACHE_ENABLED
    export BUILD_MINIFY
    export DEPLOYMENT_STRATEGY
    export ROLLBACK_CHECK_INTERVAL
    export MAX_ROLLBACK_ATTEMPTS
    
    # Backup & recovery
    export DAILY_BACKUP_RETENTION
    export WEEKLY_BACKUP_RETENTION
    export MONTHLY_BACKUP_RETENTION
    export RPO_MINUTES
    export RTO_MINUTES
    
    # Notifications
    export PAGERDUTY_ENDPOINT
    export NOTIFICATION_EMAIL_FROM
    export NOTIFICATION_EMAIL_ADMIN
}

# Auto-initialize when sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Script is being executed directly
    validate_config
    load_environment_config
    export_config
    echo "Configuration loaded and exported successfully"
else
    # Script is being sourced
    load_environment_config
    export_config
fi

# ==============================================
# SUPABASE MIGRATION CONFIGURATION
# ==============================================

# Supabase default ports and configuration
SUPABASE_PORT=${SUPABASE_PORT:-54321}
SUPABASE_MAX_ROWS=${SUPABASE_MAX_ROWS:-1000}
SUPABASE_JWT_EXPIRY=${SUPABASE_JWT_EXPIRY:-3600}
SUPABASE_STUDIO_PORT=${SUPABASE_STUDIO_PORT:-54322}
SUPABASE_SHADOW_PORT=${SUPABASE_SHADOW_PORT:-54320}
SUPABASE_PG_META_PORT=${SUPABASE_PG_META_PORT:-54323}
SUPABASE_MAJOR_VERSION=${SUPABASE_MAJOR_VERSION:-15}
SUPABASE_CONFIG_DIR=${SUPABASE_CONFIG_DIR:-"supabase"}

# Node Package Configuration
PACKAGE_VERSION=${PACKAGE_VERSION:-"0.1.0"}
SUPABASE_JS_VERSION=${SUPABASE_JS_VERSION:-"^2.57.4"}
TYPES_NODE_VERSION=${TYPES_NODE_VERSION:-"^20.19.13"}
TYPESCRIPT_VERSION=${TYPESCRIPT_VERSION:-"^5.9.2"}
SUPABASE_CLI_VERSION=${SUPABASE_CLI_VERSION:-"^1.210.0"}
POSTGRES_JS_VERSION=${POSTGRES_JS_VERSION:-"^3.4.4"}

# Database Query Configuration
DB_QUERY_TIMEOUT=${DB_QUERY_TIMEOUT:-10}
DB_MAX_ACTIVE_CONNECTIONS=${DB_MAX_ACTIVE_CONNECTIONS:-5}

# Export Supabase configuration
export_supabase_config() {
    export SUPABASE_PORT SUPABASE_MAX_ROWS SUPABASE_JWT_EXPIRY
    export SUPABASE_STUDIO_PORT SUPABASE_SHADOW_PORT SUPABASE_PG_META_PORT
    export SUPABASE_MAJOR_VERSION SUPABASE_CONFIG_DIR
    export PACKAGE_VERSION SUPABASE_JS_VERSION TYPES_NODE_VERSION
    export TYPESCRIPT_VERSION SUPABASE_CLI_VERSION POSTGRES_JS_VERSION
    export DB_QUERY_TIMEOUT DB_MAX_ACTIVE_CONNECTIONS
}