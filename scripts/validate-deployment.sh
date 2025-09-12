#!/bin/bash

# NeonPro Deployment Validation Script
# Comprehensive testing of deployed application functionality

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  [INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}✅ [PASS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠️  [WARN]${NC} $1"; }
log_error() { echo -e "${RED}❌ [FAIL]${NC} $1"; }
log_test() { echo -e "${CYAN}🧪 [TEST]${NC} $1"; }

# Test counters
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    log_test "Testing: $test_name"
    
    if eval "$test_command"; then
        if [ -n "$expected_result" ]; then
            log_success "$test_name - $expected_result"
        else
            log_success "$test_name"
        fi
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "$test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# HTTP test function
http_test() {
    local url="$1"
    local expected_code="$2"
    local description="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    log_test "HTTP Test: $description"
    
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response_code" = "$expected_code" ]; then
        log_success "$description (HTTP $response_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "$description (Expected: $expected_code, Got: $response_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Content test function
content_test() {
    local url="$1"
    local expected_content="$2"
    local description="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    log_test "Content Test: $description"
    
    local content=$(curl -s "$url" || echo "")
    
    if echo "$content" | grep -q "$expected_content"; then
        log_success "$description"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "$description - Expected content not found"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Performance test function
performance_test() {
    local url="$1"
    local max_time="$2"
    local description="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    log_test "Performance Test: $description"
    
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url" || echo "999")
    local response_time_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)
    local max_time_ms=$(echo "$max_time * 1000" | bc -l | cut -d. -f1)
    
    if [ "$response_time_ms" -le "$max_time_ms" ]; then
        log_success "$description (${response_time_ms}ms)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "$description (${response_time_ms}ms > ${max_time_ms}ms)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Header
echo -e "${CYAN}"
echo "🧪 =============================================="
echo "   NeonPro Deployment Validation"
echo "   Comprehensive functionality testing"
echo "=============================================="
echo -e "${NC}"

# Get deployment URL
if [ -n "$1" ]; then
    BASE_URL="$1"
else
    BASE_URL="https://neonpro.vercel.app"
fi

log_info "Testing deployment: $BASE_URL"
log_info "Started at: $(date)"

# Test Suite 1: Basic Connectivity
echo ""
log_info "🌐 Test Suite 1: Basic Connectivity"
echo "=================================="

http_test "$BASE_URL" "200" "Homepage accessibility"
http_test "$BASE_URL/login" "200" "Login page accessibility"
http_test "$BASE_URL/dashboard" "200" "Dashboard accessibility (may redirect if not authenticated)"
http_test "$BASE_URL/nonexistent-page" "200" "404 handling (SPA routing)"

# Test Suite 2: Static Assets
echo ""
log_info "📦 Test Suite 2: Static Assets"
echo "==============================="

# Test if assets directory is accessible
http_test "$BASE_URL/assets/" "404" "Assets directory (should not be directly browsable)"

# Test for common asset patterns
content_test "$BASE_URL" "assets/" "Assets referenced in HTML"
content_test "$BASE_URL" "<!DOCTYPE html>" "Valid HTML structure"
content_test "$BASE_URL" "<div id=\"root\">" "React root element"

# Test Suite 3: Application Structure
echo ""
log_info "⚛️  Test Suite 3: Application Structure"
echo "======================================="

content_test "$BASE_URL" "NeonPro" "Application branding"
content_test "$BASE_URL" "vite" "Vite build artifacts"

# Check for critical JavaScript files
content_test "$BASE_URL" "type=\"module\"" "ES modules support"

# Test Suite 4: Performance
echo ""
log_info "⚡ Test Suite 4: Performance"
echo "============================"

performance_test "$BASE_URL" "3.0" "Homepage load time (<3s)"
performance_test "$BASE_URL/login" "2.0" "Login page load time (<2s)"

# Test Suite 5: Security Headers
echo ""
log_info "🔒 Test Suite 5: Security Headers"
echo "=================================="

# Test security headers
TESTS_TOTAL=$((TESTS_TOTAL + 1))
log_test "Security headers check"

HEADERS=$(curl -s -I "$BASE_URL" || echo "")

if echo "$HEADERS" | grep -q "X-Frame-Options"; then
    log_success "X-Frame-Options header present"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_warning "X-Frame-Options header missing"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test Suite 6: NeonPro Specific Features
echo ""
log_info "🏥 Test Suite 6: NeonPro Features"
echo "=================================="

# Test for chatbot component (should be in protected pages)
content_test "$BASE_URL" "MessageCircle\\|chat" "Chatbot components referenced"

# Test for NeonPro branding colors
content_test "$BASE_URL" "#294359\\|#AC9469" "NeonPro brand colors"

# Test for Supabase integration
content_test "$BASE_URL" "supabase" "Supabase integration"

# Test Suite 7: Mobile Responsiveness
echo ""
log_info "📱 Test Suite 7: Mobile Responsiveness"
echo "======================================"

# Test viewport meta tag
content_test "$BASE_URL" "viewport" "Mobile viewport configuration"

# Test responsive design indicators
content_test "$BASE_URL" "responsive\\|mobile\\|md:\\|lg:" "Responsive design classes"

# Test Suite 8: Error Handling
echo ""
log_info "🚨 Test Suite 8: Error Handling"
echo "==============================="

# Test various error scenarios
http_test "$BASE_URL/api/nonexistent" "404" "API 404 handling"

# Test Suite 9: Deployment Verification
echo ""
log_info "🚀 Test Suite 9: Deployment Verification"
echo "========================================"

# Check deployment timestamp and version
TESTS_TOTAL=$((TESTS_TOTAL + 1))
log_test "Deployment freshness check"

# Get last modified header
LAST_MODIFIED=$(curl -s -I "$BASE_URL" | grep -i "last-modified" | cut -d' ' -f2- || echo "")

if [ -n "$LAST_MODIFIED" ]; then
    log_success "Deployment timestamp: $LAST_MODIFIED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_warning "No deployment timestamp found"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Check for build artifacts
content_test "$BASE_URL" "index-.*\\.js" "Vite build artifacts present"

# Final Results
echo ""
echo -e "${CYAN}📊 Test Results Summary${NC}"
echo "========================"
echo "Total Tests: $TESTS_TOTAL"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Deployment is healthy.${NC}"
    SUCCESS_RATE="100%"
    EXIT_CODE=0
else
    SUCCESS_RATE=$(echo "scale=1; $TESTS_PASSED * 100 / $TESTS_TOTAL" | bc -l)
    echo -e "${YELLOW}⚠️  Some tests failed. Success rate: ${SUCCESS_RATE}%${NC}"
    
    if [ $TESTS_FAILED -gt $((TESTS_TOTAL / 2)) ]; then
        echo -e "${RED}❌ Critical: More than 50% of tests failed!${NC}"
        EXIT_CODE=2
    else
        echo -e "${YELLOW}⚠️  Warning: Some tests failed but deployment may be functional${NC}"
        EXIT_CODE=1
    fi
fi

echo ""
log_info "Validation completed at: $(date)"
log_info "Deployment URL: $BASE_URL"
log_info "Success Rate: ${SUCCESS_RATE}%"

# Recommendations
if [ $TESTS_FAILED -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}🔧 Recommendations:${NC}"
    echo "1. Check deployment logs: npx vercel logs"
    echo "2. Verify environment variables: npx vercel env ls"
    echo "3. Test locally: cd apps/web && bun run build"
    echo "4. Review troubleshooting guide: .github/prompts/vercel-deployment-guide.md"
fi

exit $EXIT_CODE