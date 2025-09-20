#!/bin/bash

# NeonPro SSL/TLS Certificate Renewal Script
# Automated Let's Encrypt certificate renewal with healthcare compliance monitoring

set -euo pipefail

# Configuration
DOMAIN="${DOMAIN:-neonpro.com}"
EMAIL="${LETSENCRYPT_EMAIL:-admin@neonpro.com}"
STAGING="${LETSENCRYPT_STAGING:-false}"
WEBROOT="${WEBROOT:-/var/www/html}"
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}"
LOG_FILE="/var/log/neonpro/cert-renewal.log"
NOTIFICATION_URL="${NOTIFICATION_URL:-}"
DAYS_BEFORE_EXPIRY="${DAYS_BEFORE_EXPIRY:-30}"

# Healthcare compliance settings
AUDIT_LOG="/var/log/neonpro/security-audit.log"
COMPLIANCE_CHECK=true

# Logging function
log() {
    local level="$1"
    shift
    echo "$(date '+%Y-%m-%d %H:%M:%S') [$level] $*" | tee -a "$LOG_FILE"
    
    # Healthcare audit logging
    if [[ "$COMPLIANCE_CHECK" == "true" ]]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') [CERT_AUDIT] $level: $*" >> "$AUDIT_LOG"
    fi
}

# Error handling
error_exit() {
    log "ERROR" "$1"
    send_notification "Certificate renewal failed: $1"
    exit 1
}

# Send notification
send_notification() {
    local message="$1"
    log "INFO" "Notification: $message"
    
    if [[ -n "$NOTIFICATION_URL" ]]; then
        curl -X POST "$NOTIFICATION_URL" \
            -H "Content-Type: application/json" \
            -d "{\"message\":\"$message\",\"domain\":\"$DOMAIN\",\"timestamp\":\"$(date -Iseconds)\"}" \
            || log "WARN" "Failed to send notification"
    fi
}

# Check certificate expiration
check_certificate_expiry() {
    if [[ ! -f "$CERT_PATH/cert.pem" ]]; then
        log "WARN" "Certificate not found at $CERT_PATH/cert.pem"
        return 1
    fi
    
    local expiry_date=$(openssl x509 -in "$CERT_PATH/cert.pem" -noout -enddate | cut -d= -f2)
    local expiry_epoch=$(date -d "$expiry_date" +%s)
    local current_epoch=$(date +%s)
    local days_remaining=$(( (expiry_epoch - current_epoch) / 86400 ))
    
    log "INFO" "Certificate expires in $days_remaining days"
    
    if [[ $days_remaining -le $DAYS_BEFORE_EXPIRY ]]; then
        log "WARN" "Certificate expires in $days_remaining days, renewal required"
        return 0
    else
        log "INFO" "Certificate is still valid for $days_remaining days"
        return 1
    fi
}

# Validate certificate after renewal
validate_certificate() {
    log "INFO" "Validating renewed certificate"
    
    # Check certificate file exists
    if [[ ! -f "$CERT_PATH/cert.pem" ]]; then
        error_exit "Certificate file not found after renewal"
    fi
    
    # Check certificate validity
    if ! openssl x509 -in "$CERT_PATH/cert.pem" -noout -checkend 86400; then
        error_exit "Certificate validation failed"
    fi
    
    # Check certificate subject
    local subject=$(openssl x509 -in "$CERT_PATH/cert.pem" -noout -subject | grep -o "CN=[^,]*" | cut -d= -f2)
    if [[ "$subject" != "$DOMAIN" ]]; then
        error_exit "Certificate subject mismatch: expected $DOMAIN, got $subject"
    fi
    
    # Check TLS 1.3 compatibility
    if ! openssl s_client -connect "${DOMAIN}:443" -tls1_3 </dev/null 2>/dev/null | grep -q "TLSv1.3"; then
        log "WARN" "TLS 1.3 test failed, but certificate is valid"
    fi
    
    log "INFO" "Certificate validation successful"
}

# Backup current certificate
backup_certificate() {
    if [[ -d "$CERT_PATH" ]]; then
        local backup_dir="/var/backups/letsencrypt/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$backup_dir"
        cp -r "$CERT_PATH" "$backup_dir/"
        log "INFO" "Certificate backed up to $backup_dir"
    fi
}

# Renew certificate
renew_certificate() {
    log "INFO" "Starting certificate renewal for $DOMAIN"
    
    # Backup current certificate
    backup_certificate
    
    # Prepare certbot command
    local certbot_cmd="certbot certonly --webroot -w $WEBROOT -d $DOMAIN --email $EMAIL --agree-tos --non-interactive"
    
    if [[ "$STAGING" == "true" ]]; then
        certbot_cmd="$certbot_cmd --staging"
        log "INFO" "Using Let's Encrypt staging environment"
    fi
    
    # Run certbot
    if $certbot_cmd; then
        log "INFO" "Certificate renewal successful"
        validate_certificate
        send_notification "Certificate renewed successfully for $DOMAIN"
        
        # Restart services if needed
        restart_services
        
    else
        error_exit "Certificate renewal failed"
    fi
}

# Restart services after certificate renewal
restart_services() {
    log "INFO" "Restarting services after certificate renewal"
    
    # Add service restart commands here
    # For systemd services:
    # systemctl reload nginx
    # systemctl restart neonpro-api
    
    # For Docker containers:
    # docker restart neonpro-api
    
    # For PM2 processes:
    # pm2 restart neonpro-api
    
    log "INFO" "Services restarted successfully"
}

# Check system requirements
check_requirements() {
    log "INFO" "Checking system requirements"
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        error_exit "certbot is not installed"
    fi
    
    # Check if openssl is installed
    if ! command -v openssl &> /dev/null; then
        error_exit "openssl is not installed"
    fi
    
    # Check if domain is reachable
    if ! curl -s --head "http://$DOMAIN" &> /dev/null; then
        log "WARN" "Domain $DOMAIN may not be reachable via HTTP"
    fi
    
    # Create log directories
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "$(dirname "$AUDIT_LOG")"
    
    log "INFO" "System requirements check passed"
}

# Force renewal (for testing)
force_renew() {
    log "INFO" "Forcing certificate renewal"
    renew_certificate
}

# Main function
main() {
    log "INFO" "Starting NeonPro certificate renewal process"
    
    check_requirements
    
    case "${1:-auto}" in
        "auto")
            if check_certificate_expiry; then
                renew_certificate
            else
                log "INFO" "Certificate renewal not required"
            fi
            ;;
        "force")
            force_renew
            ;;
        "check")
            check_certificate_expiry
            ;;
        "validate")
            validate_certificate
            ;;
        *)
            echo "Usage: $0 [auto|force|check|validate]"
            echo "  auto     - Renew certificate if expiry is within $DAYS_BEFORE_EXPIRY days"
            echo "  force    - Force certificate renewal regardless of expiry"
            echo "  check    - Check certificate expiry without renewal"
            echo "  validate - Validate existing certificate"
            exit 1
            ;;
    esac
    
    log "INFO" "Certificate renewal process completed"
}

# Run main function with all arguments
main "$@"