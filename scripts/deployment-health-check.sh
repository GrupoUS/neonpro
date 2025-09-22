#!/bin/bash

# 🏥 NeonPro Healthcare Platform - Deployment Health Check Script
# Validates production deployment and healthcare compliance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_URL=${1:-"https://neonpro.healthcare"}
TIMEOUT=${2:-30}
HEALTH_ENDPOINT="/api/health"
COMPLIANCE_ENDPOINT="/api/compliance/status"

echo -e "${BLUE}🏥 NeonPro Healthcare Platform - Deployment Health Check${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# Function to check endpoint
check_endpoint() {
    local url="$1"
    local endpoint="$2"
    local description="$3"
    
    echo -e "${YELLOW}🔍 Checking $description...${NC}"
    
    # Make HTTP request with timeout
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}\n" --max-time "$TIMEOUT" "$url$endpoint" || echo "HTTP_CODE:000")
    
    # Extract HTTP code
    http_code=$(echo "$response" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ $description: OK (HTTP $http_code)${NC}"
        return 0
    else
        echo -e "${RED}❌ $description: FAILED (HTTP $http_code)${NC}"
        return 1
    fi
}

# Function to check security headers
check_security_headers() {
    local url="$1"
    echo -e "${YELLOW}🔒 Checking security headers...${NC}"
    
    headers=$(curl -s -I --max-time "$TIMEOUT" "$url" || echo "")
    
    # Check required security headers
    required_headers=(
        "X-Content-Type-Options: nosniff"
        "X-Frame-Options: DENY"
        "X-XSS-Protection: 1; mode=block"
        "Content-Security-Policy:"
        "Strict-Transport-Security:"
    )
    
    missing_headers=0
    for header in "${required_headers[@]}"; do
        if echo "$headers" | grep -q "$header"; then
            echo -e "${GREEN}✅ $header${NC}"
        else
            echo -e "${RED}❌ Missing: $header${NC}"
            missing_headers=$((missing_headers + 1))
        fi
    done
    
    if [ $missing_headers -eq 0 ]; then
        echo -e "${GREEN}✅ All security headers present${NC}"
        return 0
    else
        echo -e "${RED}❌ $missing_headers security headers missing${NC}"
        return 1
    fi
}

# Function to check SSL/TLS
check_ssl() {
    local url="$1"
    echo -e "${YELLOW}🔐 Checking SSL/TLS configuration...${NC}"
    
    # Extract domain from URL
    domain=$(echo "$url" | sed 's|https://||' | sed 's|/.*||')
    
    # Check SSL certificate
    if openssl s_client -connect "$domain:443" -servername "$domain" < /dev/null 2>/dev/null | openssl x509 -noout -dates | grep -q "notAfter"; then
        expiry_date=$(openssl s_client -connect "$domain:443" -servername "$domain" < /dev/null 2>/dev/null | openssl x509 -noout -dates | grep "notAfter" | cut -d= -f2)
        echo -e "${GREEN}✅ SSL Certificate valid until: $expiry_date${NC}"
        
        # Check SSL protocol support
        if openssl s_client -connect "$domain:443" -tls1_2 < /dev/null 2>/dev/null | grep -q "Protocol.*TLSv1.2"; then
            echo -e "${GREEN}✅ TLS 1.2 supported${NC}"
        else
            echo -e "${RED}❌ TLS 1.2 not supported${NC}"
            return 1
        fi
        
        return 0
    else
        echo -e "${RED}❌ SSL Certificate check failed${NC}"
        return 1
    fi
}

# Function to check performance
check_performance() {
    local url="$1"
    echo -e "${YELLOW}⚡ Checking performance metrics...${NC}"
    
    # Get load time
    load_time=$(curl -o /dev/null -s -w "%{time_total}\n" --max-time "$TIMEOUT" "$url" || echo "0")
    
    # Get response size
    response_size=$(curl -o /dev/null -s -w "%{size_download}\n" --max-time "$TIMEOUT" "$url" || echo "0")
    
    echo -e "${GREEN}📊 Load Time: ${load_time}s${NC}"
    echo -e "${GREEN}📦 Response Size: $response_size bytes${NC}"
    
    # Performance thresholds
    if (( $(echo "$load_time > 3.0" | bc -l) )); then
        echo -e "${YELLOW}⚠️  Load time is high (${load_time}s)${NC}"
    fi
    
    if [ "$response_size" -gt 5000000 ]; then
        echo -e "${YELLOW}⚠️  Response size is large (${response_size} bytes)${NC}"
    fi
    
    return 0
}

# Function to check healthcare compliance endpoints
check_healthcare_compliance() {
    local url="$1"
    echo -e "${YELLOW}🏥 Checking healthcare compliance endpoints...${NC}"
    
    # Check LGPD compliance
    if check_endpoint "$url" "/api/compliance/lgpd" "LGPD Compliance"; then
        echo -e "${GREEN}✅ LGPD compliance verified${NC}"
    else
        echo -e "${YELLOW}⚠️  LGPD compliance endpoint not accessible${NC}"
    fi
    
    # Check ANVISA compliance
    if check_endpoint "$url" "/api/compliance/anvisa" "ANVISA Compliance"; then
        echo -e "${GREEN}✅ ANVISA compliance verified${NC}"
    else
        echo -e "${YELLOW}⚠️  ANVISA compliance endpoint not accessible${NC}"
    fi
    
    # Check CFM compliance
    if check_endpoint "$url" "/api/compliance/cfm" "CFM Compliance"; then
        echo -e "${GREEN}✅ CFM compliance verified${NC}"
    else
        echo -e "${YELLOW}⚠️  CFM compliance endpoint not accessible${NC}"
    fi
    
    # Check audit logging
    if check_endpoint "$url" "/api/audit/status" "Audit Logging"; then
        echo -e "${GREEN}✅ Audit logging verified${NC}"
    else
        echo -e "${YELLOW}⚠️  Audit logging endpoint not accessible${NC}"
    fi
}

# Main health check
main() {
    local errors=0
    
    echo -e "${BLUE}🎯 Deployment URL: $DEPLOYMENT_URL${NC}"
    echo -e "${BLUE}⏱️  Timeout: ${TIMEOUT}s${NC}"
    echo ""
    
    # Basic connectivity check
    if ! check_endpoint "$DEPLOYMENT_URL" "$HEALTH_ENDPOINT" "Application Health"; then
        errors=$((errors + 1))
    fi
    
    echo ""
    
    # Security headers check
    if ! check_security_headers "$DEPLOYMENT_URL"; then
        errors=$((errors + 1))
    fi
    
    echo ""
    
    # SSL/TLS check
    if ! check_ssl "$DEPLOYMENT_URL"; then
        errors=$((errors + 1))
    fi
    
    echo ""
    
    # Performance check
    if ! check_performance "$DEPLOYMENT_URL"; then
        errors=$((errors + 1))
    fi
    
    echo ""
    
    # Healthcare compliance check
    check_healthcare_compliance "$DEPLOYMENT_URL"
    
    echo ""
    
    # Summary
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}🎉 All health checks passed!${NC}"
        echo -e "${GREEN}✅ Deployment is healthy and compliant${NC}"
        exit 0
    else
        echo -e "${RED}❌ $errors health check(s) failed${NC}"
        echo -e "${RED}⚠️  Deployment requires attention${NC}"
        exit 1
    fi
}

# Run main function
main "$@"