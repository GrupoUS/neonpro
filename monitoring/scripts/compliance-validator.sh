#!/bin/bash

# =============================================================================
# NeonPro Healthcare Platform - Compliance Validation Script
# =============================================================================
# This script validates healthcare compliance requirements for LGPD, ANVISA, and CFM
# ensuring the platform meets all regulatory requirements for operation.
#
# Author: NeonPro Compliance Team
# Version: 1.0.0
# Compliance: LGPD (Lei Geral de Proteção de Dados), ANVISA, CFM
# =============================================================================

set -euo pipefail

# Configuration
readonly SCRIPT_NAME="$(basename "$0")"
readonly TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
readonly LOG_FILE="/var/log/neonpro/compliance-validation.log"
readonly COMPLIANCE_REPORT="/var/log/neonpro/compliance-report-${TIMESTAMP}.json"
readonly API_BASE_URL="https://api.neonpro.healthcare"

# Color codes for output
readonly RED='\033[0;31m'
readonly YELLOW='\033[1;33m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Compliance tracking
declare -i COMPLIANCE_SCORE=100
declare -i LGPD_VIOLATIONS=0
declare -i ANVISA_VIOLATIONS=0
declare -i CFM_VIOLATIONS=0
declare -a VIOLATION_DETAILS=()

# Logging function
log() {
    local level="$1"
    local message="$2"
    echo -e "${TIMESTAMP} [${level}] ${message}" | tee -a "$LOG_FILE"
}

# API call function
call_api() {
    local endpoint="$1"
    local method="${2:-GET}"
    local data="$3"
    
    local url="${API_BASE_URL}${endpoint}"
    local response
    local http_code
    
    if [[ "$method" == "GET" ]]; then
        response=$(curl -s -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    else
        response=$(curl -s -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url" 2>/dev/null || echo "000")
    fi
    
    http_code="${response: -3}"
    response_body="${response%???}"
    
    if [[ "$http_code" != "200" ]]; then
        log "ERROR" "API call failed: ${method} ${endpoint} - HTTP ${http_code}"
        echo ""
    fi
    
    echo "$response_body"
}

# LGPD Compliance Validation
validate_lgpd() {
    log "INFO" "Validating LGPD compliance"
    
    echo -e "\n${BLUE}🇧🇷 LGPD COMPLIANCE VALIDATION${NC}"
    echo -e "${BLUE}=================================${NC}"
    
    # Check data processing consent
    local consent_result
    consent_result=$(call_api "/api/compliance/lgpd/consent-status")
    
    if [[ -n "$consent_result" ]]; then
        local consent_rate
        consent_rate=$(echo "$consent_result" | jq -r '.consent_rate // 0' 2>/dev/null || echo "0")
        
        if (( $(echo "$consent_rate < 95" | bc -l) )); then
            log "WARNING" "LGPD: Low consent rate (${consent_rate}%)"
            echo -e "${YELLOW}⚠ Low data processing consent rate: ${consent_rate}%${NC}"
            ((LGPD_VIOLATIONS++))
            VIOLATION_DETAILS+=("LGPD: Low consent rate (${consent_rate}%)")
            ((COMPLIANCE_SCORE-=5))
        else
            echo -e "${GREEN}✓ Data processing consent rate: ${consent_rate}%${NC}"
        fi
    fi
    
    # Check data retention policies
    local retention_result
    retention_result=$(call_api "/api/compliance/lgpd/retention-status")
    
    if [[ -n "$retention_result" ]]; then
        local retention_compliant
        retention_compliant=$(echo "$retention_result" | jq -r '.compliant // false' 2>/dev/null || echo "false")
        
        if [[ "$retention_compliant" != "true" ]]; then
            log "ERROR" "LGPD: Data retention policy violations"
            echo -e "${RED}✗ Data retention policy violations detected${NC}"
            ((LGPD_VIOLATIONS++))
            VIOLATION_DETAILS+=("LGPD: Data retention policy violations")
            ((COMPLIANCE_SCORE-=10))
        else
            echo -e "${GREEN}✓ Data retention policies compliant${NC}"
        fi
    fi
    
    # Check data breach notification procedures
    local breach_result
    breach_result=$(call_api "/api/compliance/lgpd/breach-procedures")
    
    if [[ -n "$breach_result" ]]; then
        local procedures_active
        procedures_active=$(echo "$breach_result" | jq -r '.procedures_active // false' 2>/dev/null || echo "false")
        
        if [[ "$procedures_active" != "true" ]]; then
            log "ERROR" "LGPD: Data breach notification procedures not active"
            echo -e "${RED}✗ Data breach notification procedures not active${NC}"
            ((LGPD_VIOLATIONS++))
            VIOLATION_DETAILS+=("LGPD: Data breach notification procedures not active")
            ((COMPLIANCE_SCORE-=15))
        else
            echo -e "${GREEN}✓ Data breach notification procedures active${NC}"
        fi
    fi
    
    # Check data portability
    local portability_result
    portability_result=$(call_api "/api/compliance/lgpd/portability")
    
    if [[ -n "$portability_result" ]]; then
        local portability_enabled
        portability_enabled=$(echo "$portability_result" | jq -r '.portability_enabled // false' 2>/dev/null || echo "false")
        
        if [[ "$portability_enabled" != "true" ]]; then
            log "WARNING" "LGPD: Data portability not fully enabled"
            echo -e "${YELLOW}⚠ Data portability not fully enabled${NC}"
            ((LGPD_VIOLATIONS++))
            VIOLATION_DETAILS+=("LGPD: Data portability not fully enabled")
            ((COMPLIANCE_SCORE-=5))
        else
            echo -e "${GREEN}✓ Data portability enabled${NC}"
        fi
    fi
    
    echo -e "${BLUE}LGPD Violations: ${LGPD_VIOLATIONS}${NC}"
}

# ANVISA Compliance Validation
validate_anvisa() {
    log "INFO" "Validating ANVISA compliance"
    
    echo -e "\n${BLUE}🏥 ANVISA COMPLIANCE VALIDATION${NC}"
    echo -e "${BLUE}================================${NC}"
    
    # Check medical device registration
    local registration_result
    registration_result=$(call_api "/api/compliance/anvisa/registration")
    
    if [[ -n "$registration_result" ]]; then
        local registration_valid
        registration_valid=$(echo "$registration_result" | jq -r '.valid // false' 2>/dev/null || echo "false")
        
        if [[ "$registration_valid" != "true" ]]; then
            log "ERROR" "ANVISA: Medical device registration invalid"
            echo -e "${RED}✗ Medical device registration invalid or expired${NC}"
            ((ANVISA_VIOLATIONS++))
            VIOLATION_DETAILS+=("ANVISA: Medical device registration invalid")
            ((COMPLIANCE_SCORE-=20))
        else
            echo -e "${GREEN}✓ Medical device registration valid${NC}"
        fi
    fi
    
    # Check quality management system
    local qms_result
    qms_result=$(call_api "/api/compliance/anvisa/qms")
    
    if [[ -n "$qms_result" ]]; then
        local qms_compliant
        qms_compliant=$(echo "$qms_result" | jq -r '.compliant // false' 2>/dev/null || echo "false")
        
        if [[ "$qms_compliant" != "true" ]]; then
            log "ERROR" "ANVISA: Quality Management System not compliant"
            echo -e "${RED}✗ Quality Management System not compliant${NC}"
            ((ANVISA_VIOLATIONS++))
            VIOLATION_DETAILS+=("ANVISA: Quality Management System not compliant")
            ((COMPLIANCE_SCORE-=15))
        else
            echo -e "${GREEN}✓ Quality Management System compliant${NC}"
        fi
    fi
    
    # Check risk management
    local risk_result
    risk_result=$(call_api "/api/compliance/anvisa/risk-management")
    
    if [[ -n "$risk_result" ]]; then
        local risk_active
        risk_active=$(echo "$risk_result" | jq -r '.risk_management_active // false' 2>/dev/null || echo "false")
        
        if [[ "$risk_active" != "true" ]]; then
            log "ERROR" "ANVISA: Risk management system not active"
            echo -e "${RED}✗ Risk management system not active${NC}"
            ((ANVISA_VIOLATIONS++))
            VIOLATION_DETAILS+=("ANVISA: Risk management system not active")
            ((COMPLIANCE_SCORE-=15))
        else
            echo -e "${GREEN}✓ Risk management system active${NC}"
        fi
    fi
    
    # Check vigilance system
    local vigilance_result
    vigilance_result=$(call_api "/api/compliance/anvisa/vigilance")
    
    if [[ -n "$vigilance_result" ]]; then
        local vigilance_active
        vigilance_active=$(echo "$vigilance_result" | jq -r '.vigilance_active // false' 2>/dev/null || echo "false")
        
        if [[ "$vigilance_active" != "true" ]]; then
            log "WARNING" "ANVISA: Vigilance system not fully active"
            echo -e "${YELLOW}⚠ Vigilance system not fully active${NC}"
            ((ANVISA_VIOLATIONS++))
            VIOLATION_DETAILS+=("ANVISA: Vigilance system not fully active")
            ((COMPLIANCE_SCORE-=10))
        else
            echo -e "${GREEN}✓ Vigilance system active${NC}"
        fi
    fi
    
    echo -e "${BLUE}ANVISA Violations: ${ANVISA_VIOLATIONS}${NC}"
}

# CFM Compliance Validation
validate_cfm() {
    log "INFO" "Validating CFM compliance"
    
    echo -e "\n${BLUE}👨‍⚕️ CFM COMPLIANCE VALIDATION${NC}"
    echo -e "${BLUE}==============================${NC}"
    
    # Check professional standards
    local standards_result
    standards_result=$(call_api "/api/compliance/cfm/professional-standards")
    
    if [[ -n "$standards_result" ]]; then
        local standards_compliant
        standards_compliant=$(echo "$standards_result" | jq -r '.compliant // false' 2>/dev/null || echo "false")
        
        if [[ "$standards_compliant" != "true" ]]; then
            log "ERROR" "CFM: Professional standards not compliant"
            echo -e "${RED}✗ Professional standards not compliant${NC}"
            ((CFM_VIOLATIONS++))
            VIOLATION_DETAILS+=("CFM: Professional standards not compliant")
            ((COMPLIANCE_SCORE-=15))
        else
            echo -e "${GREEN}✓ Professional standards compliant${NC}"
        fi
    fi
    
    # Check ethical guidelines
    local ethics_result
    ethics_result=$(call_api "/api/compliance/cfm/ethical-guidelines")
    
    if [[ -n "$ethics_result" ]]; then
        local ethics_compliant
        ethics_compliant=$(echo "$ethics_result" | jq -r '.compliant // false' 2>/dev/null || echo "false")
        
        if [[ "$ethics_compliant" != "true" ]]; then
            log "ERROR" "CFM: Ethical guidelines not compliant"
            echo -e "${RED}✗ Ethical guidelines not compliant${NC}"
            ((CFM_VIOLATIONS++))
            VIOLATION_DETAILS+=("CFM: Ethical guidelines not compliant")
            ((COMPLIANCE_SCORE-=15))
        else
            echo -e "${GREEN}✓ Ethical guidelines compliant${NC}"
        fi
    fi
    
    # Check continuing education
    local education_result
    education_result=$(call_api "/api/compliance/cfm/continuing-education")
    
    if [[ -n "$education_result" ]]; then
        local education_active
        education_active=$(echo "$education_result" | jq -r '.education_active // false' 2>/dev/null || echo "false")
        
        if [[ "$education_active" != "true" ]]; then
            log "WARNING" "CFM: Continuing education system not active"
            echo -e "${YELLOW}⚠ Continuing education system not active${NC}"
            ((CFM_VIOLATIONS++))
            VIOLATION_DETAILS+=("CFM: Continuing education system not active")
            ((COMPLIANCE_SCORE-=10))
        else
            echo -e "${GREEN}✓ Continuing education system active${NC}"
        fi
    fi
    
    # Check licensure verification
    local licensure_result
    licensure_result=$(call_api "/api/compliance/cfm/licensure")
    
    if [[ -n "$licensure_result" ]]; then
        local licensure_valid
        licensure_valid=$(echo "$licensure_result" | jq -r '.all_valid // false' 2>/dev/null || echo "false")
        
        if [[ "$licensure_valid" != "true" ]]; then
            log "ERROR" "CFM: Licensure verification issues"
            echo -e "${RED}✗ Licensure verification issues detected${NC}"
            ((CFM_VIOLATIONS++))
            VIOLATION_DETAILS+=("CFM: Licensure verification issues")
            ((COMPLIANCE_SCORE-=20))
        else
            echo -e "${GREEN}✓ All professional licenses verified${NC}"
        fi
    fi
    
    echo -e "${BLUE}CFM Violations: ${CFM_VIOLATIONS}${NC}"
}

# Security Compliance Validation
validate_security() {
    log "INFO" "Validating security compliance"
    
    echo -e "\n${BLUE}🔒 SECURITY COMPLIANCE VALIDATION${NC}"
    echo -e "${BLUE}=================================${NC}"
    
    # Check encryption status
    local encryption_result
    encryption_result=$(call_api "/api/security/encryption-status")
    
    if [[ -n "$encryption_result" ]]; then
        local encryption_compliant
        encryption_compliant=$(echo "$encryption_result" | jq -r '.compliant // false' 2>/dev/null || echo "false")
        
        if [[ "$encryption_compliant" != "true" ]]; then
            log "ERROR" "Security: Encryption not compliant"
            echo -e "${RED}✗ Encryption not compliant with healthcare standards${NC}"
            ((COMPLIANCE_SCORE-=25))
            VIOLATION_DETAILS+=("Security: Encryption not compliant")
        else
            echo -e "${GREEN}✓ Encryption compliant with healthcare standards${NC}"
        fi
    fi
    
    # Check access controls
    local access_result
    access_result=$(call_api "/api/security/access-controls")
    
    if [[ -n "$access_result" ]]; then
        local access_compliant
        access_compliant=$(echo "$access_result" | jq -r '.compliant // false' 2>/dev/null || echo "false")
        
        if [[ "$access_compliant" != "true" ]]; then
            log "ERROR" "Security: Access controls not compliant"
            echo -e "${RED}✗ Access controls not compliant with healthcare standards${NC}"
            ((COMPLIANCE_SCORE-=20))
            VIOLATION_DETAILS+=("Security: Access controls not compliant")
        else
            echo -e "${GREEN}✓ Access controls compliant with healthcare standards${NC}"
        fi
    fi
    
    # Check audit logging
    local audit_result
    audit_result=$(call_api "/api/security/audit-status")
    
    if [[ -n "$audit_result" ]]; then
        local audit_active
        audit_active=$(echo "$audit_result" | jq -r '.audit_active // false' 2>/dev/null || echo "false")
        
        if [[ "$audit_active" != "true" ]]; then
            log "ERROR" "Security: Audit logging not active"
            echo -e "${RED}✗ Audit logging not active${NC}"
            ((COMPLIANCE_SCORE-=15))
            VIOLATION_DETAILS+=("Security: Audit logging not active")
        else
            echo -e "${GREEN}✓ Audit logging active and compliant${NC}"
        fi
    fi
}

# Generate Compliance Report
generate_report() {
    log "INFO" "Generating compliance report"
    
    local total_violations=$((LGPD_VIOLATIONS + ANVISA_VIOLATIONS + CFM_VIOLATIONS))
    
    cat > "$COMPLIANCE_REPORT" << EOF
{
  "timestamp": "$TIMESTAMP",
  "compliance_score": $COMPLIANCE_SCORE,
  "total_violations": $total_violations,
  "violations": {
    "lgpd": $LGPD_VIOLATIONS,
    "anvisa": $ANVISA_VIOLATIONS,
    "cfm": $CFM_VIOLATIONS
  },
  "status": "$([[ $COMPLIANCE_SCORE -ge 90 ]] && echo "COMPLIANT" || echo "NON_COMPLIANT")",
  "violation_details": [
$(IFS=','; printf '    "%s"\n' "${VIOLATION_DETAILS[@]}" | sed 's/^/    /' | sed 's/, *$//')
  ],
  "recommendations": [
    "Implement all required compliance measures",
    "Schedule regular compliance audits",
    "Maintain updated documentation",
    "Train staff on compliance requirements"
  ]
}
EOF
    
    echo -e "\n${BLUE}📊 COMPLIANCE REPORT GENERATED${NC}"
    echo -e "${BLUE}Report saved to: ${COMPLIANCE_REPORT}${NC}"
}

# Main validation function
main() {
    log "INFO" "Starting NeonPro Healthcare Platform compliance validation"
    
    echo -e "${BLUE}===========================================================${NC}"
    echo -e "${BLUE}  NEONPRO HEALTHCARE PLATFORM - COMPLIANCE VALIDATION     ${NC}"
    echo -e "${BLUE}  Timestamp: ${TIMESTAMP}                                  ${NC}"
    echo -e "${BLUE}  Regulations: LGPD, ANVISA, CFM                           ${NC}"
    echo -e "${BLUE}===========================================================${NC}"
    
    # Execute all compliance validations
    validate_lgpd
    validate_anvisa
    validate_cfm
    validate_security
    
    # Generate report
    generate_report
    
    # Final summary
    echo -e "\n${BLUE}===========================================================${NC}"
    echo -e "${BLUE}                    COMPLIANCE SUMMARY                      ${NC}"
    echo -e "${BLUE}===========================================================${NC}"
    
    local total_violations=$((LGPD_VIOLATIONS + ANVISA_VIOLATIONS + CFM_VIOLATIONS))
    
    echo -e "Overall Compliance Score: ${COMPLIANCE_SCORE}%"
    echo -e "Total Violations: ${total_violations}"
    echo -e "  - LGPD: ${LGPD_VIOLATIONS}"
    echo -e "  - ANVISA: ${ANVISA_VIOLATIONS}"
    echo -e "  - CFM: ${CFM_VIOLATIONS}"
    
    if [[ $COMPLIANCE_SCORE -ge 90 ]]; then
        echo -e "\n${GREEN}✓ PLATFORM COMPLIANT${NC}"
        echo -e "${GREEN}  All healthcare regulations satisfied${NC}"
        log "INFO" "Compliance validation passed - score ${COMPLIANCE_SCORE}%"
        exit 0
    elif [[ $COMPLIANCE_SCORE -ge 70 ]]; then
        echo -e "\n${YELLOW}⚠ PARTIALLY COMPLIANT${NC}"
        echo -e "${YELLOW}  Some violations require attention${NC}"
        log "WARNING" "Compliance validation partial - score ${COMPLIANCE_SCORE}%"
        exit 1
    else
        echo -e "\n${RED}✗ NON-COMPLIANT${NC}"
        echo -e "${RED}  Immediate action required for compliance${NC}"
        log "ERROR" "Compliance validation failed - score ${COMPLIANCE_SCORE}%"
        exit 1
    fi
}

# Execute main function
main "$@"