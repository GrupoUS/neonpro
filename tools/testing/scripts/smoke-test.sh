#!/bin/bash
# =============================================================================
# NeonPro Deployment Smoke Test Script
# =============================================================================
# Comprehensive post-deployment validation for Vercel deployments
# Usage: ./smoke-test.sh <base-url>
# Example: ./smoke-test.sh https://your-app.vercel.app

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================
BASE_URL="${1:-}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-10}"
RETRY_COUNT="${RETRY_COUNT:-3}"
VERBOSE="${VERBOSE:-false}"
OUTPUT_FILE="tools/testing/smoke-test-results.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# Helper Functions
# =============================================================================
log() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${BLUE}[INFO]${NC} $1"
    fi
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# HTTP request with retry logic
http_request() {
    local url="$1"
    local expected_code="${2:-200}"
    local retry_count="$RETRY_COUNT"
    
    while [[ $retry_count -gt 0 ]]; do
        if response=$(curl -s -w "%{http_code}|%{time_total}|%{size_download}" \
                          --max-time "$TIMEOUT_SECONDS" \
                          --connect-timeout 5 \
                          -H "User-Agent: NeonPro-SmokeTest/1.0" \
                          "$url" 2>/dev/null); then
            
            local body=$(echo "$response" | sed '$d')
            local metrics=$(echo "$response" | tail -1)
            local http_code=$(echo "$metrics" | cut -d'|' -f1)
            local response_time=$(echo "$metrics" | cut -d'|' -f2)
            local size=$(echo "$metrics" | cut -d'|' -f3)
            
            if [[ "$http_code" == "$expected_code" ]]; then
                echo "SUCCESS|$http_code|$response_time|$size|$body"
                return 0
            else
                log "HTTP $http_code (expected $expected_code), retrying..."
            fi
        else
            log "Request failed, retrying..."
        fi
        
        ((retry_count--))
        sleep 1
    done
    
    echo "FAILED|000|0|0|Request failed after $RETRY_COUNT attempts"
    return 1
}

# =============================================================================
# Test Cases
# =============================================================================
test_homepage() {
    log "Testing homepage accessibility..."
    
    if result=$(http_request "$BASE_URL" 200); then
        local response_time=$(echo "$result" | cut -d'|' -f3)
        local size=$(echo "$result" | cut -d'|' -f4)
        
        if (( $(echo "$response_time < 3.0" | bc -l) )); then
            success "Homepage loads successfully (${response_time}s, ${size} bytes)"
            return 0
        else
            warning "Homepage loads but slowly (${response_time}s)"
            return 1
        fi
    else
        error "Homepage failed to load"
        return 1
    fi
}

test_api_health() {
    log "Testing API health endpoint..."
    
    if result=$(http_request "$BASE_URL/api/health" 200); then
        local body=$(echo "$result" | cut -d'|' -f5)
        
        if echo "$body" | grep -q '"status".*"ok"'; then
            success "API health endpoint responds correctly"
            return 0
        else
            error "API health endpoint returns invalid response: $body"
            return 1
        fi
    else
        error "API health endpoint failed"
        return 1
    fi
}

test_api_v1_health() {
    log "Testing API v1 health endpoint..."
    
    if result=$(http_request "$BASE_URL/api/v1/health" 200); then
        local body=$(echo "$result" | cut -d'|' -f5)
        
        if echo "$body" | grep -q '"status".*"healthy"' && echo "$body" | grep -q '"version".*"v1"'; then
            success "API v1 health endpoint responds correctly"
            return 0
        else
            error "API v1 health endpoint returns invalid response: $body"
            return 1
        fi
    else
        error "API v1 health endpoint failed"
        return 1
    fi
}

test_openapi_spec() {
    log "Testing OpenAPI specification endpoint..."
    
    if result=$(http_request "$BASE_URL/api/openapi.json" 200); then
        local body=$(echo "$result" | cut -d'|' -f5)
        
        if echo "$body" | grep -q '"openapi".*"3\\.1\\.0"' && echo "$body" | grep -q '"title".*"NeonPro API"'; then
            success "OpenAPI specification endpoint responds correctly"
            return 0
        else
            error "OpenAPI specification endpoint returns invalid response"
            return 1
        fi
    else
        error "OpenAPI specification endpoint failed"
        return 1
    fi
}

test_static_assets() {
    log "Testing static asset delivery..."
    
    if result=$(http_request "$BASE_URL/favicon.ico" 200); then
        success "Static assets are accessible"
        return 0
    else
        warning "Static assets may not be properly configured"
        return 1
    fi
}

test_404_handling() {
    log "Testing 404 error handling..."
    
    if result=$(http_request "$BASE_URL/non-existent-page" 404); then
        success "404 error handling works correctly"
        return 0
    else
        warning "404 error handling may not be properly configured"
        return 1
    fi
}

test_security_headers() {
    log "Testing security headers..."
    
    local headers
    if headers=$(curl -s -I --max-time "$TIMEOUT_SECONDS" "$BASE_URL" 2>/dev/null); then
        local score=0
        local total=5
        
        if echo "$headers" | grep -qi "x-frame-options"; then
            ((score++))
            log "✓ X-Frame-Options header present"
        fi
        
        if echo "$headers" | grep -qi "x-content-type-options"; then
            ((score++))
            log "✓ X-Content-Type-Options header present"
        fi
        
        if echo "$headers" | grep -qi "strict-transport-security"; then
            ((score++))
            log "✓ Strict-Transport-Security header present"
        fi
        
        if echo "$headers" | grep -qi "referrer-policy"; then
            ((score++))
            log "✓ Referrer-Policy header present"
        fi
        
        if echo "$headers" | grep -qi "permissions-policy"; then
            ((score++))
            log "✓ Permissions-Policy header present"
        fi
        
        if [[ $score -ge 4 ]]; then
            success "Security headers configured ($score/$total)"
            return 0
        else
            warning "Some security headers missing ($score/$total)"
            return 1
        fi
    else
        error "Could not retrieve security headers"
        return 1
    fi
}

test_cors_headers() {
    log "Testing CORS configuration..."
    
    local headers
    if headers=$(curl -s -I -H "Origin: https://example.com" \
                      -H "Access-Control-Request-Method: GET" \
                      "$BASE_URL/api/health" 2>/dev/null); then
        
        if echo "$headers" | grep -qi "access-control-allow-origin"; then
            success "CORS headers configured correctly"
            return 0
        else
            warning "CORS headers may not be properly configured"
            return 1
        fi
    else
        error "Could not test CORS configuration"
        return 1
    fi
}

# =============================================================================
# Main Execution
# =============================================================================
main() {
    if [[ -z "$BASE_URL" ]]; then
        echo "Usage: $0 <base-url>"
        echo "Example: $0 https://your-app.vercel.app"
        exit 1
    fi
    
    echo "============================================="
    echo "🚀 NeonPro Deployment Smoke Test"
    echo "============================================="
    echo "Target: $BASE_URL"
    echo "Timeout: ${TIMEOUT_SECONDS}s"
    echo "Retries: $RETRY_COUNT"
    echo "============================================="
    echo
    
    # Initialize results
    declare -a results=()
    local total_tests=0
    local passed_tests=0
    local start_time=$(date +%s)
    
    # Run all tests
    tests=(
        "test_homepage"
        "test_api_health"
        "test_api_v1_health"
        "test_openapi_spec"
        "test_static_assets"
        "test_404_handling"
        "test_security_headers"
        "test_cors_headers"
    )
    
    for test_func in "${tests[@]}"; do
        ((total_tests++))
        if $test_func; then
            ((passed_tests++))
            results+=("{\"test\": \"$test_func\", \"status\": \"pass\"}")
        else
            results+=("{\"test\": \"$test_func\", \"status\": \"fail\"}")
        fi
        echo
    done
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Generate JSON report
    mkdir -p "$(dirname "$OUTPUT_FILE")"
    cat > "$OUTPUT_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "target_url": "$BASE_URL",
  "duration_seconds": $duration,
  "total_tests": $total_tests,
  "passed_tests": $passed_tests,
  "success_rate": $(echo "scale=2; $passed_tests * 100 / $total_tests" | bc -l),
  "results": [
    $(IFS=,; echo "${results[*]}")
  ]
}
EOF
    
    # Summary
    echo "============================================="
    echo "📊 Test Results Summary"
    echo "============================================="
    echo "Passed: $passed_tests/$total_tests tests"
    echo "Success Rate: $(echo "scale=1; $passed_tests * 100 / $total_tests" | bc -l)%"
    echo "Duration: ${duration}s"
    echo "Report: $OUTPUT_FILE"
    echo "============================================="
    
    if [[ $passed_tests -eq $total_tests ]]; then
        echo -e "${GREEN}🎉 All tests passed! Deployment is healthy.${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed. Manual review required.${NC}"
        exit 1
    fi
}

# Check dependencies
if ! command -v curl &> /dev/null; then
    error "curl is required but not installed"
    exit 1
fi

if ! command -v bc &> /dev/null; then
    error "bc is required but not installed"
    exit 1
fi

# Run main function
main "$@"