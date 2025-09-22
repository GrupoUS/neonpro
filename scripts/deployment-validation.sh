#!/bin/bash

# 🏥 NeonPro Healthcare Platform - Deployment Validation Script
# Comprehensive validation for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-"production"}
DEPLOYMENT_URL=${2:-"https://neonpro.healthcare"}
VALIDATION_REPORT="deployment-validation-$(date +%Y%m%d-%H%M%S).json"

echo -e "${BLUE}🏥 NeonPro Healthcare Platform - Deployment Validation${NC}"
echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}Deployment URL: $DEPLOYMENT_URL${NC}"
echo -e "${BLUE}Validation Report: $VALIDATION_REPORT${NC}"
echo ""

# Initialize validation report
init_report() {
    cat > "$VALIDATION_REPORT" << EOF
{
  "validation_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$ENVIRONMENT",
  "deployment_url": "$DEPLOYMENT_URL",
  "validation_results": {
    "security": {},
    "compliance": {},
    "performance": {},
    "functionality": {},
    "healthcare": {}
  },
  "overall_status": "pending",
  "critical_issues": [],
  "warnings": [],
  "recommendations": []
}
EOF
}

# Add validation result to report
add_validation_result() {
    local category="$1"
    local check="$2"
    local status="$3"
    local message="$4"
    local severity="$5"
    
    # Update report
    jq ".validation_results.$category += {\"$check\": {\"status\": \"$status\", \"message\": \"$message\", \"severity\": \"$severity\"}}" "$VALIDATION_REPORT" > temp.json && mv temp.json "$VALIDATION_REPORT"
    
    # Add to issues if not success
    if [ "$status" != "success" ]; then
        if [ "$severity" = "critical" ]; then
            jq ".critical_issues += [{\"category\": \"$category\", \"check\": \"$check\", \"message\": \"$message\"}]" "$VALIDATION_REPORT" > temp.json && mv temp.json "$VALIDATION_REPORT"
        else
            jq ".warnings += [{\"category\": \"$category\", \"check\": \"$check\", \"message\": \"$message\"}]" "$VALIDATION_REPORT" > temp.json && mv temp.json "$VALIDATION_REPORT"
        fi
    fi
}

# Function to validate security
validate_security() {
    echo -e "${YELLOW}🔒 Validating security configuration...${NC}"
    
    # Check security headers
    headers=$(curl -s -I --max-time 30 "$DEPLOYMENT_URL" || echo "")
    
    # X-Content-Type-Options
    if echo "$headers" | grep -q "X-Content-Type-Options: nosniff"; then
        echo -e "${GREEN}✅ X-Content-Type-Options: nosniff${NC}"
        add_validation_result "security" "x_content_type_options" "success" "X-Content-Type-Options header is properly configured" "medium"
    else
        echo -e "${RED}❌ Missing X-Content-Type-Options header${NC}"
        add_validation_result "security" "x_content_type_options" "failed" "X-Content-Type-Options header is missing" "critical"
    fi
    
    # X-Frame-Options
    if echo "$headers" | grep -q "X-Frame-Options: DENY"; then
        echo -e "${GREEN}✅ X-Frame-Options: DENY${NC}"
        add_validation_result "security" "x_frame_options" "success" "X-Frame-Options header is properly configured" "medium"
    else
        echo -e "${RED}❌ Missing X-Frame-Options header${NC}"
        add_validation_result "security" "x_frame_options" "failed" "X-Frame-Options header is missing" "critical"
    fi
    
    # Content-Security-Policy
    if echo "$headers" | grep -q "Content-Security-Policy:"; then
        echo -e "${GREEN}✅ Content-Security-Policy header present${NC}"
        add_validation_result "security" "content_security_policy" "success" "Content-Security-Policy header is present" "medium"
    else
        echo -e "${RED}❌ Missing Content-Security-Policy header${NC}"
        add_validation_result "security" "content_security_policy" "failed" "Content-Security-Policy header is missing" "critical"
    fi
    
    # HTTPS enforcement
    if echo "$headers" | grep -q "Strict-Transport-Security:"; then
        echo -e "${GREEN}✅ HSTS header present${NC}"
        add_validation_result "security" "hsts" "success" "HSTS header is present" "medium"
    else
        echo -e "${YELLOW}⚠️  Missing HSTS header${NC}"
        add_validation_result "security" "hsts" "warning" "HSTS header is missing" "medium"
    fi
}

# Function to validate healthcare compliance
validate_healthcare_compliance() {
    echo -e "${YELLOW}🏥 Validating healthcare compliance...${NC}"
    
    # Check LGPD compliance
    lgpd_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/compliance/lgpd" 2>/dev/null || echo "")
    if echo "$lgpd_response" | grep -q '"compliant": true'; then
        echo -e "${GREEN}✅ LGPD compliance verified${NC}"
        add_validation_result "healthcare" "lgpd" "success" "LGPD compliance requirements are met" "critical"
    else
        echo -e "${RED}❌ LGPD compliance check failed${NC}"
        add_validation_result "healthcare" "lgpd" "failed" "LGPD compliance requirements are not met" "critical"
    fi
    
    # Check ANVISA compliance
    anvisa_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/compliance/anvisa" 2>/dev/null || echo "")
    if echo "$anvisa_response" | grep -q '"compliant": true'; then
        echo -e "${GREEN}✅ ANVISA compliance verified${NC}"
        add_validation_result "healthcare" "anvisa" "success" "ANVISA compliance requirements are met" "critical"
    else
        echo -e "${YELLOW}⚠️  ANVISA compliance endpoint not accessible${NC}"
        add_validation_result "healthcare" "anvisa" "warning" "ANVISA compliance endpoint not accessible" "critical"
    fi
    
    # Check CFM compliance
    cfm_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/compliance/cfm" 2>/dev/null || echo "")
    if echo "$cfm_response" | grep -q '"compliant": true'; then
        echo -e "${GREEN}✅ CFM compliance verified${NC}"
        add_validation_result "healthcare" "cfm" "success" "CFM compliance requirements are met" "critical"
    else
        echo -e "${YELLOW}⚠️  CFM compliance endpoint not accessible${NC}"
        add_validation_result "healthcare" "cfm" "warning" "CFM compliance endpoint not accessible" "critical"
    fi
    
    # Check audit logging
    audit_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/audit/status" 2>/dev/null || echo "")
    if echo "$audit_response" | grep -q '"logging": true'; then
        echo -e "${GREEN}✅ Audit logging enabled${NC}"
        add_validation_result "healthcare" "audit_logging" "success" "Audit logging is properly configured" "critical"
    else
        echo -e "${RED}❌ Audit logging not enabled${NC}"
        add_validation_result "healthcare" "audit_logging" "failed" "Audit logging is not enabled" "critical"
    fi
}

# Function to validate performance
validate_performance() {
    echo -e "${YELLOW}⚡ Validating performance...${NC}"
    
    # Check load time
    load_time=$(curl -o /dev/null -s -w "%{time_total}\n" --max-time 30 "$DEPLOYMENT_URL" || echo "0")
    if (( $(echo "$load_time < 3.0" | bc -l) )); then
        echo -e "${GREEN}✅ Load time: ${load_time}s${NC}"
        add_validation_result "performance" "load_time" "success" "Load time is acceptable (${load_time}s)" "medium"
    else
        echo -e "${YELLOW}⚠️  Load time is high: ${load_time}s${NC}"
        add_validation_result "performance" "load_time" "warning" "Load time is high (${load_time}s)" "medium"
    fi
    
    # Check response size
    response_size=$(curl -o /dev/null -s -w "%{size_download}\n" --max-time 30 "$DEPLOYMENT_URL" || echo "0")
    if [ "$response_size" -lt 2000000 ]; then
        echo -e "${GREEN}✅ Response size: $response_size bytes${NC}"
        add_validation_result "performance" "response_size" "success" "Response size is acceptable ($response_size bytes)" "medium"
    else
        echo -e "${YELLOW}⚠️  Response size is large: $response_size bytes${NC}"
        add_validation_result "performance" "response_size" "warning" "Response size is large ($response_size bytes)" "medium"
    fi
    
    # Check TTFB (Time to First Byte)
    ttfb=$(curl -o /dev/null -s -w "%{time_starttransfer}\n" --max-time 30 "$DEPLOYMENT_URL" || echo "0")
    if (( $(echo "$ttfb < 1.0" | bc -l) )); then
        echo -e "${GREEN}✅ TTFB: ${ttfb}s${NC}"
        add_validation_result "performance" "ttfb" "success" "TTFB is acceptable (${ttfb}s)" "medium"
    else
        echo -e "${YELLOW}⚠️  TTFB is high: ${ttfb}s${NC}"
        add_validation_result "performance" "ttfb" "warning" "TTFB is high (${ttfb}s)" "medium"
    fi
}

# Function to validate functionality
validate_functionality() {
    echo -e "${YELLOW}🔧 Validating core functionality...${NC}"
    
    # Check health endpoint
    health_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/health" 2>/dev/null || echo "")
    if echo "$health_response" | grep -q '"status": "healthy"'; then
        echo -e "${GREEN}✅ Health endpoint responding${NC}"
        add_validation_result "functionality" "health_endpoint" "success" "Health endpoint is responding" "critical"
    else
        echo -e "${RED}❌ Health endpoint not responding${NC}"
        add_validation_result "functionality" "health_endpoint" "failed" "Health endpoint is not responding" "critical"
    fi
    
    # Check API accessibility
    api_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/api/system/info" 2>/dev/null || echo "")
    if echo "$api_response" | grep -q '"version"'; then
        echo -e "${GREEN}✅ API endpoint accessible${NC}"
        add_validation_result "functionality" "api_accessibility" "success" "API endpoint is accessible" "critical"
    else
        echo -e "${YELLOW}⚠️  API endpoint not accessible${NC}"
        add_validation_result "functionality" "api_accessibility" "warning" "API endpoint not accessible" "critical"
    fi
    
    # Check static assets
    static_response=$(curl -s -I --max-time 30 "$DEPLOYMENT_URL/assets/favicon.ico" 2>/dev/null || echo "")
    if echo "$static_response" | grep -q "200"; then
        echo -e "${GREEN}✅ Static assets serving${NC}"
        add_validation_result "functionality" "static_assets" "success" "Static assets are serving properly" "medium"
    else
        echo -e "${RED}❌ Static assets not serving${NC}"
        add_validation_result "functionality" "static_assets" "failed" "Static assets are not serving properly" "medium"
    fi
}

# Function to validate compliance
validate_compliance() {
    echo -e "${YELLOW}📋 Validating compliance requirements...${NC}"
    
    # Check privacy policy
    privacy_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/privacy" 2>/dev/null || echo "")
    if echo "$privacy_response" | grep -q "privacy\|policy"; then
        echo -e "${GREEN}✅ Privacy policy accessible${NC}"
        add_validation_result "compliance" "privacy_policy" "success" "Privacy policy is accessible" "critical"
    else
        echo -e "${RED}❌ Privacy policy not accessible${NC}"
        add_validation_result "compliance" "privacy_policy" "failed" "Privacy policy is not accessible" "critical"
    fi
    
    # Check terms of service
    tos_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/terms" 2>/dev/null || echo "")
    if echo "$tos_response" | grep -q "terms\|service"; then
        echo -e "${GREEN}✅ Terms of service accessible${NC}"
        add_validation_result "compliance" "terms_of_service" "success" "Terms of service is accessible" "critical"
    else
        echo -e "${RED}❌ Terms of service not accessible${NC}"
        add_validation_result "compliance" "terms_of_service" "failed" "Terms of service is not accessible" "critical"
    fi
    
    # Check cookie policy
    cookie_response=$(curl -s --max-time 30 "$DEPLOYMENT_URL/cookies" 2>/dev/null || echo "")
    if echo "$cookie_response" | grep -q "cookie"; then
        echo -e "${GREEN}✅ Cookie policy accessible${NC}"
        add_validation_result "compliance" "cookie_policy" "success" "Cookie policy is accessible" "medium"
    else
        echo -e "${YELLOW}⚠️  Cookie policy not accessible${NC}"
        add_validation_result "compliance" "cookie_policy" "warning" "Cookie policy is not accessible" "medium"
    fi
}

# Generate final report
generate_report() {
    # Calculate overall status
    critical_issues=$(jq '.critical_issues | length' "$VALIDATION_REPORT")
    warnings=$(jq '.warnings | length' "$VALIDATION_REPORT")
    
    if [ "$critical_issues" -eq 0 ]; then
        if [ "$warnings" -eq 0 ]; then
            overall_status="success"
        else
            overall_status="warning"
        fi
    else
        overall_status="failed"
    fi
    
    jq --arg status "$overall_status" '.overall_status = $status' "$VALIDATION_REPORT" > temp.json && mv temp.json "$VALIDATION_REPORT"
    
    # Add recommendations
    if [ "$critical_issues" -gt 0 ]; then
        jq '.recommendations += ["Address all critical issues before deploying to production"]' "$VALIDATION_REPORT" > temp.json && mv temp.json "$VALIDATION_REPORT"
    fi
    
    if [ "$warnings" -gt 0 ]; then
        jq '.recommendations += ["Review and address warnings to improve deployment quality"]' "$VALIDATION_REPORT" > temp.json && mv temp.json "$VALIDATION_REPORT"
    fi
    
    echo ""
    echo -e "${BLUE}📊 Validation Summary${NC}"
    echo -e "${BLUE}===================${NC}"
    echo -e "Critical Issues: ${RED}$critical_issues${NC}"
    echo -e "Warnings: ${YELLOW}$warnings${NC}"
    echo -e "Overall Status: $([ "$overall_status" = "success" ] && echo "${GREEN}$overall_status${NC}" || [ "$overall_status" = "warning" ] && echo "${YELLOW}$overall_status${NC}" || echo "${RED}$overall_status${NC}")"
    echo ""
    echo -e "${BLUE}📄 Detailed report saved to: $VALIDATION_REPORT${NC}"
}

# Main validation process
main() {
    init_report
    
    validate_security
    echo ""
    
    validate_healthcare_compliance
    echo ""
    
    validate_performance
    echo ""
    
    validate_functionality
    echo ""
    
    validate_compliance
    echo ""
    
    generate_report
    
    # Exit with appropriate code
    overall_status=$(jq -r '.overall_status' "$VALIDATION_REPORT")
    case "$overall_status" in
        "success")
            echo -e "${GREEN}🎉 Deployment validation completed successfully!${NC}"
            exit 0
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  Deployment validation completed with warnings${NC}"
            exit 1
            ;;
        "failed")
            echo -e "${RED}❌ Deployment validation failed${NC}"
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
    
    if ! command -v bc &> /dev/null; then
        echo -e "${RED}❌ bc is required but not installed${NC}"
        exit 1
    fi
}

# Run main function
check_dependencies
main "$@"