#!/bin/bash

# Comprehensive validation script for TDD GREEN phase fixes
# Validates all implemented fixes from the TDD cycle

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Load centralized configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/config.sh" ]; then
    source "$SCRIPT_DIR/config.sh"
else
    echo -e "${RED}❌ ERROR: Centralized configuration not found${NC}"
    exit 1
fi

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✅ SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠️  WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[❌ ERROR]${NC} $1"
}

log_validation() {
    echo -e "${PURPLE}[🔍 VALIDATION]${NC} $1"
}

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_validation "Running: $test_name"
    
    if eval "$test_command" >/dev/null 2>&1; then
        log_success "✅ $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        log_error "❌ $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Function to test file permissions
test_shell_script_permissions() {
    log_info "Testing shell script permissions..."
    
    local scripts=($(find "$SCRIPT_DIR" -name "*.sh" -type f))
    local failed_count=0
    
    for script in "${scripts[@]}"; do
        if [ -x "$script" ]; then
            log_success "✅ $(basename "$script") has execute permissions"
        else
            log_error "❌ $(basename "$script") lacks execute permissions"
            failed_count=$((failed_count + 1))
        fi
    done
    
    if [ $failed_count -eq 0 ]; then
        log_success "All shell scripts have proper execute permissions"
        return 0
    else
        log_error "$failed_count shell scripts lack execute permissions"
        return 1
    fi
}

# Function to test configuration loading
test_configuration_loading() {
    log_info "Testing configuration loading..."
    
    # Test if config.sh loads without errors
    if [ -f "$SCRIPT_DIR/config.sh" ]; then
        # Test config loading in a subshell to avoid variable conflicts
        if (source "$SCRIPT_DIR/config.sh" && [ -n "$MINIMUM_NODE_VERSION" ] && [ -n "$REQUIRED_MEMORY_GB" ]); then
            log_success "✅ Configuration loads successfully"
            return 0
        else
            log_error "❌ Configuration loading failed"
            return 1
        fi
    else
        log_error "❌ Configuration file not found"
        return 1
    fi
}

# Function to test environment validation
test_environment_validation() {
    log_info "Testing environment validation functions..."
    
    # Create test environment variables
    export TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/testdb"
    export TEST_JWT_SECRET="test-jwt-secret-with-minimum-length"
    export TEST_API_URL="https://api.test.com"
    
    # Test environment validation in deploy-unified.sh
    if [ -f "$SCRIPT_DIR/deploy-unified.sh" ]; then
        # Extract and test validation functions
        if grep -q "validate_required_env_vars" "$SCRIPT_DIR/deploy-unified.sh"; then
            log_success "✅ Environment validation functions found in deploy-unified.sh"
            return 0
        else
            log_error "❌ Environment validation functions not found"
            return 1
        fi
    else
        log_error "❌ deploy-unified.sh not found"
        return 1
    fi
}

# Function to test database connection handling
test_database_connection_handling() {
    log_info "Testing database connection handling..."
    
    if [ -f "$SCRIPT_DIR/setup-supabase-migrations.sh" ]; then
        local required_functions=("validate_database_url" "test_database_connection" "execute_db_command")
        local missing_functions=()
        
        for func in "${required_functions[@]}"; do
            if ! grep -q "$func" "$SCRIPT_DIR/setup-supabase-migrations.sh"; then
                missing_functions+=("$func")
            fi
        done
        
        if [ ${#missing_functions[@]} -eq 0 ]; then
            log_success "✅ All database connection handling functions found"
            return 0
        else
            log_error "❌ Missing database functions: ${missing_functions[*]}"
            return 1
        fi
    else
        log_error "❌ setup-supabase-migrations.sh not found"
        return 1
    fi
}

# Function to test security input validation
test_security_input_validation() {
    log_info "Testing security input validation..."
    
    if [ -f "$SCRIPT_DIR/audit-unified.sh" ]; then
        local validation_functions=("validate_and_sanitize_input" "sanitize_string" "validate_path")
        local missing_functions=()
        
        for func in "${validation_functions[@]}"; do
            if ! grep -q "$func" "$SCRIPT_DIR/audit-unified.sh"; then
                missing_functions+=("$func")
            fi
        done
        
        if [ ${#missing_functions[@]} -eq 0 ]; then
            log_success "✅ All security validation functions found"
            return 0
        else
            log_error "❌ Missing security functions: ${missing_functions[*]}"
            return 1
        fi
    else
        log_error "❌ audit-unified.sh not found"
        return 1
    fi
}

# Function to test configuration externalization
test_configuration_externalization() {
    log_info "Testing configuration externalization..."
    
    # Test centralized config file
    if [ ! -f "$SCRIPT_DIR/config.sh" ]; then
        log_error "❌ Centralized config.sh not found"
        return 1
    fi
    
    # Test if scripts load configuration
    local scripts_to_test=("dev-setup.sh" "deploy-unified.sh" "emergency-rollback.sh" "audit-unified.sh" "setup-supabase-migrations.sh")
    local loading_issues=0
    
    for script in "${scripts_to_test[@]}"; do
        if [ -f "$SCRIPT_DIR/$script" ]; then
            if grep -q "config.sh" "$SCRIPT_DIR/$script"; then
                log_success "✅ $script loads centralized configuration"
            else
                log_warning "⚠️  $script may not load centralized configuration"
                loading_issues=$((loading_issues + 1))
            fi
        fi
    done
    
    # Test specific configuration variables
    local required_vars=("MINIMUM_NODE_VERSION" "REQUIRED_MEMORY_GB" "MINIMUM_DISK_SPACE_GB")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "$var" "$SCRIPT_DIR/config.sh"; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ] && [ $loading_issues -eq 0 ]; then
        log_success "✅ Configuration externalization is complete"
        return 0
    else
        log_error "❌ Configuration externalization issues found"
        [ ${#missing_vars[@]} -gt 0 ] && log_error "Missing variables: ${missing_vars[*]}"
        return 1
    fi
}

# Function to test script functionality
test_script_functionality() {
    log_info "Testing basic script functionality..."
    
    # Test if scripts are syntactically correct
    local scripts=($(find "$SCRIPT_DIR" -name "*.sh" -type f))
    local syntax_errors=0
    
    for script in "${scripts[@]}"; do
        if bash -n "$script" 2>/dev/null; then
            log_success "✅ $(basename "$script") syntax is valid"
        else
            log_error "❌ $(basename "$script") has syntax errors"
            syntax_errors=$((syntax_errors + 1))
        fi
    done
    
    if [ $syntax_errors -eq 0 ]; then
        log_success "✅ All scripts have valid syntax"
        return 0
    else
        log_error "❌ $syntax_errors scripts have syntax errors"
        return 1
    fi
}

# Main validation function
main() {
    log_info "🔍 Starting comprehensive TDD GREEN phase validation..."
    log_info "Testing all implemented fixes from the TDD cycle"
    echo ""
    
    # Run all tests
    run_test "Shell Script Permissions" "test_shell_script_permissions"
    run_test "Configuration Loading" "test_configuration_loading"
    run_test "Environment Validation" "test_environment_validation"
    run_test "Database Connection Handling" "test_database_connection_handling"
    run_test "Security Input Validation" "test_security_input_validation"
    run_test "Configuration Externalization" "test_configuration_externalization"
    run_test "Script Functionality" "test_script_functionality"
    
    # Print summary
    echo ""
    log_info "📊 Test Summary:"
    log_info "Total Tests: $TOTAL_TESTS"
    log_success "Passed: $PASSED_TESTS"
    [ $FAILED_TESTS -gt 0 ] && log_error "Failed: $FAILED_TESTS"
    
    # Calculate success rate
    if [ $TOTAL_TESTS -gt 0 ]; then
        local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
        log_info "Success Rate: ${success_rate}%"
        
        if [ $success_rate -ge 90 ]; then
            log_success "🎉 TDD GREEN phase validation completed successfully!"
            return 0
        elif [ $success_rate -ge 70 ]; then
            log_warning "⚠️  TDD GREEN phase validation mostly successful with some issues"
            return 1
        else
            log_error "❌ TDD GREEN phase validation failed - significant issues found"
            return 1
        fi
    else
        log_error "❌ No tests were executed"
        return 1
    fi
}

# Execute main function
main "$@"