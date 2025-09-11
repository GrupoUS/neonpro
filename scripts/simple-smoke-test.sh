#!/bin/bash
# 🚀 NeonPro Simple Smoke Test Script
# Quick validation of critical endpoints

set -e

# Configuration
DEPLOYMENT_URL="${1:-https://neonpro.vercel.app}"
TIMEOUT=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test Results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    FAILED_TESTS=$((FAILED_TESTS + 1))
}

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_info "Testing: $name"
    
    if response=$(curl -s -w "\n%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null); then
        status=$(echo "$response" | tail -n 1)
        body=$(echo "$response" | head -n -1)
        
        if [[ "$status" == "$expected_status" ]]; then
            log_success "$name (Status: $status)"
            return 0
        else
            log_error "$name - Status: $status (expected: $expected_status)"
            return 1
        fi
    else
        log_error "$name - Request failed"
        return 1
    fi
}

# Main execution
echo "🚀 NeonPro Production Smoke Test"
echo "================================="
echo "Target: $DEPLOYMENT_URL"
echo ""

# Core Tests
log_info "🧪 Running Core Health Tests..."
echo ""

# 1. Homepage Test
test_endpoint "Homepage" "$DEPLOYMENT_URL" "200"

# 2. API Health Test
test_endpoint "API Health" "$DEPLOYMENT_URL/api/health" "200"

# 3. API v1 Health Test 
test_endpoint "API v1 Health" "$DEPLOYMENT_URL/api/v1/health" "200"

# 4. OpenAPI Documentation
test_endpoint "OpenAPI Spec" "$DEPLOYMENT_URL/api/openapi.json" "200"

# 5. Test Endpoint
test_endpoint "Test Endpoint" "$DEPLOYMENT_URL/api/test" "200"

echo ""
log_info "🔍 Testing Error Handling..."
echo ""

# 6. 404 Tests
test_endpoint "404 Handling" "$DEPLOYMENT_URL/nonexistent" "404"
test_endpoint "API 404" "$DEPLOYMENT_URL/api/nonexistent" "404"

# Results Summary
echo ""
echo "📊 Test Results Summary"
echo "======================"
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [[ $TOTAL_TESTS -gt 0 ]]; then
    success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "Success Rate: $success_rate%"
else
    success_rate=0
fi

echo ""

# Exit with appropriate code
if [[ $FAILED_TESTS -eq 0 ]]; then
    log_success "🎉 All tests passed! Deployment is healthy."
    exit 0
elif [[ $success_rate -ge 80 ]]; then
    echo -e "${YELLOW}[WARN]${NC} ⚠️ Most tests passed, but some issues detected."
    echo ""
    echo "🔧 RECOMMENDED ACTIONS:"
    echo "1. Review failed tests above"
    echo "2. Check deployment logs: vercel logs"
    echo "3. Consider rollback if critical functionality affected"
    exit 1
else
    log_error "🚨 Critical issues detected! Immediate action required."
    echo ""
    echo "🆘 EMERGENCY ACTIONS:"
    echo "1. Immediate rollback recommended"
    echo "2. Review deployment configuration"
    echo "3. Check Vercel function logs"
    exit 2
fi