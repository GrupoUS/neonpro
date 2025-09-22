#!/bin/bash

# 🏥 NeonPro Healthcare Platform - Healthcare Compliance Validation Script
# Validates LGPD, ANVISA, and CFM compliance requirements

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_URL=${1:-"https://neonpro.healthcare"}
COMPLIANCE_REPORT="healthcare-compliance-$(date +%Y%m%d-%H%M%S).json"
ENVIRONMENT=${2:-"production"}

echo -e "${BLUE}🏥 NeonPro Healthcare Platform - Compliance Validation${NC}"
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}Deployment URL: $DEPLOYMENT_URL${NC}"
echo -e "${BLUE}Compliance Report: $COMPLIANCE_REPORT${NC}"
echo ""

# Initialize compliance report
init_report() {
    cat > "$COMPLIANCE_REPORT" << EOF
{
  "validation_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$ENVIRONMENT",
  "deployment_url": "$DEPLOYMENT_URL",
  "compliance_results": {
    "lgpd": {},
    "anvisa": {},
    "cfm": {},
    "data_security": {},
    "privacy_controls": {}
  },
  "overall_compliance": "pending",
  "critical_violations": [],
  "recommendations": [],
  "certification_readiness": false
}
EOF
}

# Add compliance result to report
add_compliance_result() {
    local category="$1"
    local requirement="$2"
    local status="$3"
    local message="$4"
    local evidence="$5"
    local severity="$6"
    
    # Update report
    jq ".compliance_results.$category += {\"$requirement\": {\"status\": \"$status\", \"message\": \"$message\", \"evidence\": \"$evidence\", \"severity\": \"$severity\"}}" "$COMPLIANCE_REPORT" > temp.json && mv temp.json "$COMPLIANCE_REPORT"
    
    # Add to violations if not compliant
    if [ "$status" != "compliant" ]; then
        if [ "$severity" = "critical" ]; then
            jq ".critical_violations += [{\"category\": \"$category\", \"requirement\": \"$requirement\", \"message\": \"$message\", \"severity\": \"$severity\"}]" "$COMPLIANCE_REPORT" > temp.json && mv temp.json "$COMPLIANCE_REPORT"
        fi
        jq ".recommendations += [{\"category\": \"$category\", \"requirement\": \"$requirement\", \"recommendation\": \"$message\"}]" "$COMPLIANCE_REPORT" > temp.json && mv temp.json "$COMPLIANCE_REPORT"
    fi
}

# Function to validate LGPD compliance
validate_lgpd() {
    echo -e "${YELLOW}📋 Validating LGPD (Lei Geral de Proteção de Dados) Compliance...${NC}"
    
    # Check for privacy policy
    privacy_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/privacy" 2>/dev/null || echo "")
    if echo "$privacy_response" | grep -qi "LGPD\|lei geral\|proteção de dados"; then
        echo -e "${GREEN}✅ Privacy policy mentions LGPD${NC}"
        add_compliance_result "lgpd" "privacy_policy" "compliant" "Privacy policy includes LGPD information" "privacy_policy_content" "critical"
    else
        echo -e "${RED}❌ Privacy policy missing LGPD information${NC}"
        add_compliance_result "lgpd" "privacy_policy" "non_compliant" "Privacy policy does not mention LGPD" "missing_lgpd_references" "critical"
    fi
    
    # Check data processing notice
    processing_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/privacy/data-processing" 2>/dev/null || echo "")
    if echo "$processing_response" | grep -q '"processing_notice": true'; then
        echo -e "${GREEN}✅ Data processing notice available${NC}"
        add_compliance_result "lgpd" "data_processing_notice" "compliant" "Data processing notice is available" "api_response" "critical"
    else
        echo -e "${YELLOW}⚠️  Data processing notice not accessible${NC}"
        add_compliance_result "lgpd" "data_processing_notice" "non_compliant" "Data processing notice not accessible" "missing_endpoint" "critical"
    fi
    
    # Check consent management
    consent_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/consent/status" 2>/dev/null || echo "")
    if echo "$consent_response" | grep -q '"consent_management": true'; then
        echo -e "${GREEN}✅ Consent management system in place${NC}"
        add_compliance_result "lgpd" "consent_management" "compliant" "Consent management system is operational" "api_response" "critical"
    else
        echo -e "${RED}❌ Consent management system not found${NC}"
        add_compliance_result "lgpd" "consent_management" "non_compliant" "Consent management system not operational" "missing_consent_system" "critical"
    fi
    
    # Check data subject rights
    rights_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/privacy/rights" 2>/dev/null || echo "")
    if echo "$rights_response" | grep -q '"rights_available": true'; then
        echo -e "${GREEN}✅ Data subject rights implemented${NC}"
        add_compliance_result "lgpd" "data_subject_rights" "compliant" "Data subject rights are implemented" "api_response" "high"
    else
        echo -e "${YELLOW}⚠️  Data subject rights not fully implemented${NC}"
        add_compliance_result "lgpd" "data_subject_rights" "partial" "Data subject rights partially implemented" "incomplete_implementation" "high"
    fi
    
    # Check data breach notification
    breach_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/security/breach-notification" 2>/dev/null || echo "")
    if echo "$breach_response" | grep -q '"breach_notification": true'; then
        echo -e "${GREEN}✅ Data breach notification system in place${NC}"
        add_compliance_result "lgpd" "breach_notification" "compliant" "Data breach notification system is operational" "api_response" "critical"
    else
        echo -e "${RED}❌ Data breach notification system missing${NC}"
        add_compliance_result "lgpd" "breach_notification" "non_compliant" "Data breach notification system not operational" "missing_breach_system" "critical"
    fi
    
    # Check data retention policy
    retention_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/privacy/retention" 2>/dev/null || echo "")
    if echo "$retention_response" | grep -q '"retention_policy": true'; then
        echo -e "${GREEN}✅ Data retention policy in place${NC}"
        add_compliance_result "lgpd" "data_retention" "compliant" "Data retention policy is implemented" "api_response" "high"
    else
        echo -e "${YELLOW}⚠️  Data retention policy not accessible${NC}"
        add_compliance_result "lgpd" "data_retention" "non_compliant" "Data retention policy not accessible" "missing_retention_policy" "high"
    fi
}

# Function to validate ANVISA compliance
validate_anvisa() {
    echo -e "${YELLOW}🏥 Validating ANVISA Compliance...${NC}"
    
    # Check medical device classification
    device_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/compliance/medical-device" 2>/dev/null || echo "")
    if echo "$device_response" | grep -q '"classification": "Class IIa"'; then
        echo -e "${GREEN}✅ Medical device classification documented${NC}"
        add_compliance_result "anvisa" "medical_device_classification" "compliant" "Medical device properly classified as Class IIa" "api_response" "critical"
    else
        echo -e "${YELLOW}⚠️  Medical device classification not documented${NC}"
        add_compliance_result "anvisa" "medical_device_classification" "non_compliant" "Medical device classification not documented" "missing_classification" "critical"
    fi
    
    # Check risk management system
    risk_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/compliance/risk-management" 2>/dev/null || echo "")
    if echo "$risk_response" | grep -q '"risk_management": true'; then
        echo -e "${GREEN}✅ Risk management system in place${NC}"
        add_compliance_result "anvisa" "risk_management" "compliant" "Risk management system is operational" "api_response" "high"
    else
        echo -e "${YELLOW}⚠️  Risk management system not accessible${NC}"
        add_compliance_result "anvisa" "risk_management" "non_compliant" "Risk management system not operational" "missing_risk_system" "high"
    fi
    
    # Check quality management system
    quality_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/compliance/quality-management" 2>/dev/null || echo "")
    if echo "$quality_response" | grep -q '"quality_management": true'; then
        echo -e "${GREEN}✅ Quality management system in place${NC}"
        add_compliance_result "anvisa" "quality_management" "compliant" "Quality management system is operational" "api_response" "high"
    else
        echo -e "${YELLOW}⚠️  Quality management system not accessible${NC}"
        add_compliance_result "anvisa" "quality_management" "non_compliant" "Quality management system not operational" "missing_quality_system" "high"
    fi
    
    # Check post-market surveillance
    surveillance_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/compliance/post-market" 2>/dev/null || echo "")
    if echo "$surveillance_response" | grep -q '"surveillance": true'; then
        echo -e "${GREEN}✅ Post-market surveillance in place${NC}"
        add_compliance_result "anvisa" "post_market_surveillance" "compliant" "Post-market surveillance is operational" "api_response" "medium"
    else
        echo -e "${YELLOW}⚠️  Post-market surveillance not accessible${NC}"
        add_compliance_result "anvisa" "post_market_surveillance" "non_compliant" "Post-market surveillance not operational" "missing_surveillance" "medium"
    fi
    
    # Check labeling and instructions
    labeling_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/compliance/labeling" 2>/dev/null || echo "")
    if echo "$labeling_response" | grep -q '"labeling": true'; then
        echo -e "${GREEN}✅ Medical device labeling in place${NC}"
        add_compliance_result "anvisa" "labeling" "compliant" "Medical device labeling is implemented" "api_response" "medium"
    else
        echo -e "${YELLOW}⚠️  Medical device labeling not accessible${NC}"
        add_compliance_result "anvisa" "labeling" "non_compliant" "Medical device labeling not accessible" "missing_labeling" "medium"
    fi
}

# Function to validate CFM compliance
validate_cfm() {
    echo -e "${YELLOW}👨‍⚕️ Validating CFM (Conselho Federal de Medicina) Compliance...${NC}"
    
    # Check telemedicine compliance
    telemedicine_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/compliance/telemedicine" 2>/dev/null || echo "")
    if echo "$telemedicine_response" | grep -q '"resolution_2266": true'; then
        echo -e "${GREEN}✅ Telemedicine compliance verified${NC}"
        add_compliance_result "cfm" "telemedicine" "compliant" "Telemedicine follows CFM resolution 2266" "api_response" "critical"
    else
        echo -e "${YELLOW}⚠️  Telemedicine compliance not verified${NC}"
        add_compliance_result "cfm" "telemedicine" "non_compliant" "Telemedicine compliance not verified" "missing_telemedicine_compliance" "critical"
    fi
    
    # Check professional standards
    standards_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/compliance/professional-standards" 2>/dev/null || echo "")
    if echo "$standards_response" | grep -q '"professional_standards": true'; then
        echo -e "${GREEN}✅ Professional standards implemented${NC}"
        add_compliance_result "cfm" "professional_standards" "compliant" "Professional standards are implemented" "api_response" "high"
    else
        echo -e "${YELLOW}⚠️  Professional standards not accessible${NC}"
        add_compliance_result "cfm" "professional_standards" "non_compliant" "Professional standards not accessible" "missing_standards" "high"
    fi
    
    # Check ethical guidelines
    ethics_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/compliance/ethics" 2>/dev/null || echo "")
    if echo "$ethics_response" | grep -q '"ethical_guidelines": true'; then
        echo -e "${GREEN}✅ Ethical guidelines implemented${NC}"
        add_compliance_result "cfm" "ethical_guidelines" "compliant" "Ethical guidelines are implemented" "api_response" "high"
    else
        echo -e "${YELLOW}⚠️  Ethical guidelines not accessible${NC}"
        add_compliance_result "cfm" "ethical_guidelines" "non_compliant" "Ethical guidelines not accessible" "missing_ethics" "high"
    fi
    
    # Check electronic prescription
    prescription_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/compliance/prescription" 2>/dev/null || echo "")
    if echo "$prescription_response" | grep -q '"electronic_prescribing": true'; then
        echo -e "${GREEN}✅ Electronic prescription system in place${NC}"
        add_compliance_result "cfm" "electronic_prescription" "compliant" "Electronic prescription system is operational" "api_response" "critical"
    else
        echo -e "${YELLOW}⚠️  Electronic prescription system not accessible${NC}"
        add_compliance_result "cfm" "electronic_prescription" "non_compliant" "Electronic prescription system not operational" "missing_prescription_system" "critical"
    fi
    
    # Check patient confidentiality
    confidentiality_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/compliance/confidentiality" 2>/dev/null || echo "")
    if echo "$confidentiality_response" | grep -q '"confidentiality": true'; then
        echo -e "${GREEN}✅ Patient confidentiality measures in place${NC}"
        add_compliance_result "cfm" "patient_confidentiality" "compliant" "Patient confidentiality measures are implemented" "api_response" "critical"
    else
        echo -e "${RED}❌ Patient confidentiality measures missing${NC}"
        add_compliance_result "cfm" "patient_confidentiality" "non_compliant" "Patient confidentiality measures not implemented" "missing_confidentiality" "critical"
    fi
}

# Function to validate data security
validate_data_security() {
    echo -e "${YELLOW}🔐 Validating Data Security Controls...${NC}"
    
    # Check encryption at rest
    encryption_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/security/encryption" 2>/dev/null || echo "")
    if echo "$encryption_response" | grep -q '"encryption_at_rest": true'; then
        echo -e "${GREEN}✅ Encryption at rest enabled${NC}"
        add_compliance_result "data_security" "encryption_at_rest" "compliant" "Data encryption at rest is enabled" "api_response" "critical"
    else
        echo -e "${RED}❌ Encryption at rest not verified${NC}"
        add_compliance_result "data_security" "encryption_at_rest" "non_compliant" "Encryption at rest not verified" "missing_encryption" "critical"
    fi
    
    # Check encryption in transit
    transit_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/security/encryption-transit" 2>/dev/null || echo "")
    if echo "$transit_response" | grep -q '"encryption_in_transit": true'; then
        echo -e "${GREEN}✅ Encryption in transit enabled${NC}"
        add_compliance_result "data_security" "encryption_in_transit" "compliant" "Data encryption in transit is enabled" "api_response" "critical"
    else
        echo -e "${YELLOW}⚠️  Encryption in transit not verified${NC}"
        add_compliance_result "data_security" "encryption_in_transit" "non_compliant" "Encryption in transit not verified" "missing_transit_encryption" "critical"
    fi
    
    # Check access controls
    access_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/security/access-control" 2>/dev/null || echo "")
    if echo "$access_response" | grep -q '"access_controls": true'; then
        echo -e "${GREEN}✅ Access controls implemented${NC}"
        add_compliance_result "data_security" "access_controls" "compliant" "Access controls are implemented" "api_response" "critical"
    else
        echo -e "${RED}❌ Access controls not verified${NC}"
        add_compliance_result "data_security" "access_controls" "non_compliant" "Access controls not verified" "missing_access_controls" "critical"
    fi
    
    # Check audit logging
    audit_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/audit/status" 2>/dev/null || echo "")
    if echo "$audit_response" | grep -q '"audit_logging": true'; then
        echo -e "${GREEN}✅ Audit logging enabled${NC}"
        add_compliance_result "data_security" "audit_logging" "compliant" "Audit logging is enabled" "api_response" "critical"
    else
        echo -e "${RED}❌ Audit logging not enabled${NC}"
        add_compliance_result "data_security" "audit_logging" "non_compliant" "Audit logging not enabled" "missing_audit_logging" "critical"
    fi
    
    # Check backup and recovery
    backup_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/security/backup" 2>/dev/null || echo "")
    if echo "$backup_response" | grep -q '"backup_enabled": true'; then
        echo -e "${GREEN}✅ Backup and recovery in place${NC}"
        add_compliance_result "data_security" "backup_recovery" "compliant" "Backup and recovery systems are operational" "api_response" "high"
    else
        echo -e "${YELLOW}⚠️  Backup and recovery not verified${NC}"
        add_compliance_result "data_security" "backup_recovery" "non_compliant" "Backup and recovery not verified" "missing_backup" "high"
    fi
}

# Function to validate privacy controls
validate_privacy_controls() {
    echo -e "${YELLOW}🔒 Validating Privacy Controls...${NC}"
    
    # Check privacy by design
    pbd_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/privacy/by-design" 2>/dev/null || echo "")
    if echo "$pbd_response" | grep -q '"privacy_by_design": true'; then
        echo -e "${GREEN}✅ Privacy by design implemented${NC}"
        add_compliance_result "privacy_controls" "privacy_by_design" "compliant" "Privacy by design principles implemented" "api_response" "high"
    else
        echo -e "${YELLOW}⚠️  Privacy by design not verified${NC}"
        add_compliance_result "privacy_controls" "privacy_by_design" "non_compliant" "Privacy by design not verified" "missing_pbd" "high"
    fi
    
    # Check data minimization
    minimization_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/privacy/minimization" 2>/dev/null || echo "")
    if echo "$minimization_response" | grep -q '"data_minimization": true'; then
        echo -e "${GREEN}✅ Data minimization implemented${NC}"
        add_compliance_result "privacy_controls" "data_minimization" "compliant" "Data minimization principles implemented" "api_response" "high"
    else
        echo -e "${YELLOW}⚠️  Data minimization not verified${NC}"
        add_compliance_result "privacy_controls" "data_minimization" "non_compliant" "Data minimization not verified" "missing_minimization" "high"
    fi
    
    # Check user access controls
    user_access_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/privacy/user-access" 2>/dev/null || echo "")
    if echo "$user_access_response" | grep -q '"user_access_controls": true'; then
        echo -e "${GREEN}✅ User access controls implemented${NC}"
        add_compliance_result "privacy_controls" "user_access_controls" "compliant" "User access controls are implemented" "api_response" "critical"
    else
        echo -e "${RED}❌ User access controls not verified${NC}"
        add_compliance_result "privacy_controls" "user_access_controls" "non_compliant" "User access controls not verified" "missing_user_access" "critical"
    fi
    
    # Check data portability
    portability_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/privacy/portability" 2>/dev/null || echo "")
    if echo "$portability_response" | grep -q '"data_portability": true'; then
        echo -e "${GREEN}✅ Data portability implemented${NC}"
        add_compliance_result "privacy_controls" "data_portability" "compliant" "Data portability features implemented" "api_response" "medium"
    else
        echo -e "${YELLOW}⚠️  Data portability not verified${NC}"
        add_compliance_result "privacy_controls" "data_portability" "non_compliant" "Data portability not verified" "missing_portability" "medium"
    fi
}

# Generate final compliance report
generate_report() {
    # Calculate overall compliance
    critical_violations=$(jq '.critical_violations | length' "$COMPLIANCE_REPORT")
    recommendations=$(jq '.recommendations | length' "$COMPLIANCE_REPORT")
    
    if [ "$critical_violations" -eq 0 ]; then
        if [ "$recommendations" -eq 0 ]; then
            overall_compliance="fully_compliant"
            certification_readiness=true
        else
            overall_compliance="substantially_compliant"
            certification_readiness=true
        fi
    else
        overall_compliance="non_compliant"
        certification_readiness=false
    fi
    
    jq --arg compliance "$overall_compliance" --arg readiness "$certification_readiness" \
       '.overall_compliance = $compliance | .certification_readiness = ($readiness == "true")' \
       "$COMPLIANCE_REPORT" > temp.json && mv temp.json "$COMPLIANCE_REPORT"
    
    echo ""
    echo -e "${BLUE}📊 Compliance Summary${NC}"
    echo -e "${BLUE}====================${NC}"
    echo -e "Critical Violations: ${RED}$critical_violations${NC}"
    echo -e "Recommendations: ${YELLOW}$recommendations${NC}"
    echo -e "Overall Compliance: $([ "$overall_compliance" = "fully_compliant" ] && echo "${GREEN}$overall_compliance${NC}" || [ "$overall_compliance" = "substantially_compliant" ] && echo "${YELLOW}$overall_compliance${NC}" || echo "${RED}$overall_compliance${NC}")"
    echo -e "Certification Ready: $([ "$certification_readiness" = "true" ] && echo "${GREEN}Yes${NC}" || echo "${RED}No${NC}")"
    echo ""
    echo -e "${BLUE}📄 Detailed compliance report saved to: $COMPLIANCE_REPORT${NC}"
}

# Main validation process
main() {
    init_report
    
    validate_lgpd
    echo ""
    
    validate_anvisa
    echo ""
    
    validate_cfm
    echo ""
    
    validate_data_security
    echo ""
    
    validate_privacy_controls
    echo ""
    
    generate_report
    
    # Exit with appropriate code
    overall_compliance=$(jq -r '.overall_compliance' "$COMPLIANCE_REPORT")
    case "$overall_compliance" in
        "fully_compliant")
            echo -e "${GREEN}🎉 Healthcare compliance validation completed successfully!${NC}"
            exit 0
            ;;
        "substantially_compliant")
            echo -e "${YELLOW}⚠️  Healthcare compliance validation completed with minor issues${NC}"
            exit 0
            ;;
        "non_compliant")
            echo -e "${RED}❌ Healthcare compliance validation failed - critical violations found${NC}"
            exit 1
            ;;
    esac
}

# Check dependencies
check_dependencies() {
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl is required but not installed${NC}"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ jq is required but not installed${NC}"
        exit 1
    fi
}

# Run main function
check_dependencies
main "$@"