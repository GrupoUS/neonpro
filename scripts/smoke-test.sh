#!/bin/bash
# 🚀 NeonPro Production Smoke Test Script
# Validates critical endpoints and provides rollback capabilities
#
# Usage: ./smoke-test.sh [DEPLOYMENT_URL] [VERBOSE]
# Example: ./smoke-test.sh https://neonpro.vercel.app true

set -euo pipefail

# Configuration
DEPLOYMENT_URL="${1:-https://neonpro.vercel.app}"
VERBOSE="${2:-false}"
TIMEOUT=10
MAX_RETRIES=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Verbose logging
log_verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${BLUE}[DEBUG]${NC} $1"
    fi
}

# Test execution function
run_test() {
    local test_name="$1"
    local url="$2"
    local expected_status="$3"
    local expected_content="$4"
    
    ((TOTAL_TESTS++))
    log_info "Testing: $test_name"
    log_verbose "URL: $url"
    log_verbose "Expected Status: $expected_status"
    
    local retry=0
    while [ $retry -lt $MAX_RETRIES ]; do
        # Make request with timeout
        if response=$(curl -s -w "\n%{http_code}\n%{time_total}" --max-time $TIMEOUT "$url" 2>/dev/null); then
            # Parse response
            body=$(echo "$response" | head -n -2)
            status=$(echo "$response" | tail -n 2 | head -n 1)
            time_total=$(echo "$response" | tail -n 1)
            
            log_verbose "Response Status: $status"
            log_verbose "Response Time: ${time_total}s"
            
            # Check status code
            if [[ "$status" == "$expected_status" ]]; then
                # Check content if provided
                if [[ -n "$expected_content" ]]; then
                    if echo "$body" | grep -q "$expected_content"; then
                        log_success "$test_name (${time_total}s, ${status})"
                        log_verbose "Response Body: $body"
                        return 0
                    else
                        log_error "$test_name - Content mismatch (expected: $expected_content)"
                        log_verbose "Actual Body: $body"
                        return 1
                    fi
                else
                    log_success "$test_name (${time_total}s, ${status})"
                    log_verbose "Response Body: $body"
                    return 0
                fi
            else
                log_error "$test_name - Status mismatch (expected: $expected_status, got: $status)"
                log_verbose "Response Body: $body"
                
                # Retry logic
                ((retry++))
                if [ $retry -lt $MAX_RETRIES ]; then
                    log_warning "Retrying in 2 seconds... (attempt $((retry + 1))/$MAX_RETRIES)"
                    sleep 2
                    continue
                fi
                return 1
            fi
        else
            # Request failed
            log_error "$test_name - Request failed (timeout or network error)"
            
            # Retry logic
            ((retry++))
            if [ $retry -lt $MAX_RETRIES ]; then
                log_warning "Retrying in 2 seconds... (attempt $((retry + 1))/$MAX_RETRIES)"
                sleep 2
                continue
            fi
            return 1
        fi
    done
}

# Advanced test with response validation
run_advanced_test() {
    local test_name="$1"
    local url="$2"
    local validation_function="$3"
    
    ((TOTAL_TESTS++))
    log_info "Testing: $test_name"
    log_verbose "URL: $url"
    
    if response=$(curl -s -w "\n%{http_code}\n%{time_total}" --max-time $TIMEOUT "$url" 2>/dev/null); then
        body=$(echo "$response" | head -n -2)
        status=$(echo "$response" | tail -n 2 | head -n 1)
        time_total=$(echo "$response" | tail -n 1)
        
        log_verbose "Response Status: $status"
        log_verbose "Response Time: ${time_total}s"
        
        # Call validation function
        if $validation_function "$body" "$status" "$time_total"; then
            log_success "$test_name (${time_total}s, ${status})"
            return 0
        else
            log_error "$test_name - Validation failed"
            log_verbose "Response Body: $body"
            return 1
        fi
    else
        log_error "$test_name - Request failed"
        return 1
    fi
}

# Validation functions
validate_homepage() {
    local body="$1"
    local status="$2"
    local time="$3"
    
    # Check status code
    [[ "$status" == "200" ]] || return 1
    
    # Check for HTML content
    echo "$body" | grep -q "<!DOCTYPE html" || return 1
    
    # Check for title or expected content
    echo "$body" | grep -qi "neonpro\|aesthetic\|clinic" || return 1
    
    # Performance check (< 3 seconds)
    (( $(echo "$time < 3.0" | bc -l) )) || return 1
    
    return 0
}

validate_api_health() {
    local body="$1"
    local status="$2"
    local time="$3"
    
    # Check status code
    [[ "$status" == "200" ]] || return 1
    
    # Check for JSON response
    echo "$body" | jq . >/dev/null 2>&1 || return 1
    
    # Check for status field
    echo "$body" | jq -e '.status' >/dev/null 2>&1 || return 1
    
    # Performance check (< 1 second)
    (( $(echo "$time < 1.0" | bc -l) )) || return 1
    
    return 0
}

validate_openapi_spec() {
    local body="$1"
    local status="$2"
    local time="$3"
    
    # Check status code
    [[ "$status" == "200" ]] || return 1
    
    # Check for JSON response
    echo "$body" | jq . >/dev/null 2>&1 || return 1
    
    # Check for OpenAPI fields
    echo "$body" | jq -e '.openapi' >/dev/null 2>&1 || return 1
    echo "$body" | jq -e '.info' >/dev/null 2>&1 || return 1
    echo "$body" | jq -e '.paths' >/dev/null 2>&1 || return 1
    
    return 0
}

# Performance benchmarking
benchmark_endpoint() {
    local url="$1"
    local name="$2"
    
    log_info "Benchmarking: $name"
    
    # Run multiple requests to get average
    local total_time=0
    local success_count=0
    local runs=5
    
    for i in $(seq 1 $runs); do
        if response=$(curl -s -w "%{time_total}" --max-time $TIMEOUT "$url" 2>/dev/null); then
            time_taken=$(echo "$response" | tail -n 1)
            total_time=$(echo "$total_time + $time_taken" | bc -l)
            ((success_count++))
        fi
    done
    
    if [[ $success_count -gt 0 ]]; then
        avg_time=$(echo "scale=3; $total_time / $success_count" | bc -l)
        log_info "$name - Average response time: ${avg_time}s (${success_count}/${runs} successful)"
    else
        log_error "$name - All benchmark requests failed"
    fi
}

# Main execution
main() {
    echo "🚀 NeonPro Production Smoke Test"
    echo "================================="
    echo "Target: $DEPLOYMENT_URL"
    echo "Timeout: ${TIMEOUT}s"
    echo "Max Retries: $MAX_RETRIES"
    echo ""
    
    # Check dependencies
    if ! command -v jq &> /dev/null; then
        log_warning "jq not found - JSON validation will be limited"
    fi
    
    if ! command -v bc &> /dev/null; then
        log_warning "bc not found - Performance calculations will be limited"
    fi
    
    # Core Tests
    log_info "🧪 Running Core Health Tests..."
    echo ""
    
    # 1. Homepage Test
    run_advanced_test "Homepage Accessibility" "$DEPLOYMENT_URL" "validate_homepage"
    
    # 2. API Health Test (Current Implementation)
    run_advanced_test "API Health Endpoint" "$DEPLOYMENT_URL/api/health" "validate_api_health"
    
    # 3. API v1 Health Test (Expected Implementation)
    run_test "API v1 Health Endpoint" "$DEPLOYMENT_URL/api/v1/health" "200" "status"
    
    # 4. OpenAPI Documentation
    run_advanced_test "OpenAPI Specification" "$DEPLOYMENT_URL/api/openapi.json" "validate_openapi_spec"
    
    # 5. Test Endpoint
    run_test "Test Endpoint" "$DEPLOYMENT_URL/api/test" "200" ""
    
    echo ""
    log_info "⚡ Running Performance Benchmarks..."
    echo ""
    
    # Performance tests
    benchmark_endpoint "$DEPLOYMENT_URL" "Homepage"
    benchmark_endpoint "$DEPLOYMENT_URL/api/health" "API Health"
    
    echo ""
    log_info "🔍 Running Edge Case Tests..."
    echo ""
    
    # Edge cases
    run_test "404 Handling" "$DEPLOYMENT_URL/nonexistent-path" "404" ""
    run_test "API 404 Handling" "$DEPLOYMENT_URL/api/nonexistent" "404" ""
    
    # Security headers test
    if response=$(curl -s -I --max-time $TIMEOUT "$DEPLOYMENT_URL" 2>/dev/null); then
        if echo "$response" | grep -q "x-frame-options\|x-content-type-options"; then
            log_success "Security Headers Present"
        else
            log_warning "Security Headers Missing"
        fi
    fi
    
    # Results Summary
    echo ""
    echo "📊 Test Results Summary"
    echo "======================"
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    
    success_rate=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
    echo "Success Rate: $success_rate%"
    
    echo ""
    
    # Exit with appropriate code
    if [[ $FAILED_TESTS -eq 0 ]]; then
        log_success "🎉 All tests passed! Deployment is healthy."
        exit 0
    elif [[ $success_rate -ge 80 ]]; then
        log_warning "⚠️ Most tests passed, but some issues detected."
        echo ""
        echo "🔧 RECOMMENDED ACTIONS:"
        echo "1. Review failed tests above"
        echo "2. Check deployment logs: vercel logs [deployment-url]"
        echo "3. Consider rollback if critical functionality affected"
        exit 1
    else
        log_error "🚨 Critical issues detected! Immediate action required."
        echo ""
        echo "🆘 EMERGENCY ACTIONS:"
        echo "1. Immediate rollback recommended"
        echo "2. Review deployment configuration"
        echo "3. Check Vercel function logs"
        echo "4. Verify environment variables"
        exit 2
    fi
}

# Run main function
main "$@"