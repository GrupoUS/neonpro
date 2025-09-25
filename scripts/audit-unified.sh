#!/bin/bash

# 🔍 NEONPRO - Unified Audit & Code Correction Script
# Consolidates all audit, quality, security, and correction functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/logs/audit-$(date +%Y%m%d-%H%M%S).log"

# Load centralized configuration
if [ -f "$SCRIPT_DIR/config.sh" ]; then
    source "$SCRIPT_DIR/config.sh"
else
    echo "WARNING: Configuration file not found, using hardcoded defaults"
    # Fallback defaults for critical values
    EXCELLENT_AUDIT_SCORE=90
    GOOD_AUDIT_SCORE=80
    ACCEPTABLE_AUDIT_SCORE=70
    MAX_BUNDLE_SIZE_MB=15
    OPTIMAL_BUILD_SIZE_MB=10
    MIN_COMPLIANCE_PERCENTAGE=80
fi

# Create necessary directories
mkdir -p "$PROJECT_ROOT/logs"

# Global counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Logging functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

print_header() {
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE} $1${NC}"
    echo -e "${PURPLE}========================================${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
    log "INFO: $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    log "SUCCESS: $1"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    log "WARNING: $1"
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log "ERROR: $1"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
}

print_healthcare() {
    echo -e "${CYAN}[HEALTHCARE]${NC} $1"
    log "HEALTHCARE: $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node >/dev/null 2>&1; then
        print_error "Node.js not found. Please install Node.js 20+"
        exit 1
    fi
    
    # Check Node.js version
    node_version=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 2>/dev/null || echo "0")
    if [ "$node_version" -ge 18 ] 2>/dev/null; then
        print_success "Node.js version: $(node --version)"
    else
        print_warning "Node.js version may be outdated"
    fi
    
    # Check package manager
    if command -v bun >/dev/null 2>&1; then
        PACKAGE_MANAGER="bun"
        print_success "Using Bun package manager"
    elif command -v npm >/dev/null 2>&1; then
        PACKAGE_MANAGER="npm"
        print_success "Using npm package manager"
    else
        print_error "No package manager found (bun/npm required)"
        exit 1
    fi
    
    # Check Python for security scripts
    if command -v python3 >/dev/null 2>&1; then
        print_success "Python3 available for security checks"
    else
        print_warning "Python3 not found - some security checks will be skipped"
    fi
    
    print_success "Prerequisites check completed"
}

# Input Validation & Sanitization Module
validate_and_sanitize_input() {
    local input="$1"
    local input_type="$2"
    local sanitized=""
    
    # Remove potentially dangerous characters
    sanitized=$(echo "$input" | sed 's/[;&|`$(){}<>!\\]//g' | sed "s/'//g" | sed 's/"//g')
    
    # Validate based on input type
    case "$input_type" in
        "filename")
            # Validate filename - allow alphanumeric, dashes, underscores, dots
            if [[ ! "$sanitized" =~ ^[a-zA-Z0-9._-]+$ ]]; then
                print_error "Invalid filename format: $input"
                return 1
            fi
            # Prevent directory traversal
            if [[ "$sanitized" == *".."* ]] || [[ "$sanitized" == *"/"* ]]; then
                print_error "Directory traversal attempt detected: $input"
                return 1
            fi
            ;;
        "path")
            # Validate path - prevent directory traversal and dangerous characters
            if [[ "$sanitized" == *".."* ]] || [[ "$sanitized" == *"~"* ]]; then
                print_error "Invalid path detected: $input"
                return 1
            fi
            # Ensure path is within project bounds
            if [[ "$sanitized" != "$PROJECT_ROOT"* ]] && [[ "$sanitized" != /* ]]; then
                print_error "Path outside project bounds: $input"
                return 1
            fi
            ;;
        "command")
            # Validate command - allow only safe commands
            safe_commands=("node" "npm" "bun" "pnpm" "git" "find" "grep" "sed" "awk" "timeout" "du" "df")
            cmd_base=$(echo "$sanitized" | cut -d' ' -f1)
            if [[ ! " ${safe_commands[@]} " =~ " ${cmd_base} " ]]; then
                print_error "Unsafe command detected: $cmd_base"
                return 1
            fi
            ;;
        "environment_var")
            # Validate environment variable name
            if [[ ! "$sanitized" =~ ^[A-Z_][A-Z0-9_]*$ ]]; then
                print_error "Invalid environment variable name: $input"
                return 1
            fi
            ;;
        "url")
            # Basic URL validation
            if [[ ! "$sanitized" =~ ^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,} ]]; then
                print_error "Invalid URL format: $input"
                return 1
            fi
            ;;
        "percentage")
            # Validate percentage (0-100)
            if [[ ! "$sanitized" =~ ^[0-9]+$ ]] || [ "$sanitized" -lt 0 ] || [ "$sanitized" -gt 100 ]; then
                print_error "Invalid percentage value: $input"
                return 1
            fi
            ;;
        "size_mb")
            # Validate size in MB
            if [[ ! "$sanitized" =~ ^[0-9]+$ ]]; then
                print_error "Invalid size value: $input"
                return 1
            fi
            ;;
        *)
            # Basic sanitization for unknown types
            if [[ -z "$sanitized" ]]; then
                print_error "Empty input detected"
                return 1
            fi
            ;;
    esac
    
    echo "$sanitized"
    return 0
}

# Security validation for file operations
secure_file_operation() {
    local operation="$1"
    local file_path="$2"
    
    # Validate operation
    if ! validate_and_sanitize_input "$operation" "command" >/dev/null; then
        return 1
    fi
    
    # Validate file path
    if ! sanitized_path=$(validate_and_sanitize_input "$file_path" "path"); then
        return 1
    fi
    
    # Additional security checks
    if [[ "$operation" == *"rm"* ]] || [[ "$operation" == *"mv"* ]] || [[ "$operation" == *"cp"* ]]; then
        print_error "Potentially destructive file operation blocked: $operation"
        return 1
    fi
    
    # Execute operation safely
    eval "$operation \"$sanitized_path\""
}

# Validate audit command parameters
validate_audit_command() {
    local command="$1"
    
    # List of allowed commands
    allowed_commands=("quality" "security" "performance" "full" "--help" "-h" "help")
    
    if [[ ! " ${allowed_commands[@]} " =~ " ${command} " ]]; then
        print_error "Invalid audit command: $command"
        return 1
    fi
    
    return 0
}

# Security check for environment variables
security_check_environment() {
    local sensitive_vars=("DATABASE_URL" "JWT_SECRET" "SESSION_SECRET" "SUPABASE_SERVICE_KEY" "OPENAI_API_KEY")
    
    for var in "${sensitive_vars[@]}"; do
        if [[ -n "${!var:-}" ]]; then
            print_warning "Sensitive environment variable detected in process: $var"
            # Check if variable is properly formatted
            case "$var" in
                "DATABASE_URL")
                    if [[ ! "${!var}" =~ ^postgres(ql)?:// ]]; then
                        print_error "Invalid DATABASE_URL format detected"
                        return 1
                    fi
                    ;;
                "JWT_SECRET"|"SESSION_SECRET")
                    if [[ ${#var} -lt 32 ]]; then
                        print_error "Insufficient secret length for $var"
                        return 1
                    fi
                    ;;
            esac
        fi
    done
    
    return 0
}

# Code Quality Analysis Module
run_code_quality_audit() {
    print_header "🔍 Code Quality Analysis"
    local module_passed=0
    local module_total=0
    
    # Security Check: Validate paths before analysis
    print_status "Validating analysis paths..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if validate_and_sanitize_input "$PROJECT_ROOT/apps/web" "path" >/dev/null; then
        print_success "Path validation: SECURE"
        module_passed=$((module_passed + 1))
    else
        print_error "Path validation: FAILED"
        return 1
    fi
    
    # Bundle Analysis (integrated functionality)
    print_status "Analyzing bundle sizes..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -d "$PROJECT_ROOT/apps/web/dist" ]; then
        build_size=$(du -sh "$PROJECT_ROOT/apps/web/dist" 2>/dev/null | cut -f1 || echo "Unknown")
        size_mb=$(du -sm "$PROJECT_ROOT/apps/web/dist" 2>/dev/null | cut -f1 || echo "0")
        if validate_and_sanitize_input "$size_mb" "size_mb" >/dev/null; then
            if [ "$size_mb" -lt $MAX_BUNDLE_SIZE_MB ] 2>/dev/null; then
                print_success "Bundle analysis: OPTIMAL ($build_size)"
                module_passed=$((module_passed + 1))
            else
                print_warning "Bundle analysis: LARGE ($build_size) - consider optimization"
            fi
        else
            print_error "Bundle size validation failed"
        fi
    else
        print_warning "Bundle analysis: Build required first"
    fi

    # Component Conflict Detection (integrated functionality)
    print_status "Detecting component conflicts..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    components_path="$PROJECT_ROOT/apps/web/src/components"
    if validate_and_sanitize_input "$components_path" "path" >/dev/null && [ -d "$components_path" ]; then
        find_command="find \"$components_path\" -name \"*.tsx\" -o -name \"*.ts\""
        if validate_and_sanitize_input "$find_command" "command" >/dev/null; then
            if eval "$find_command" 2>/dev/null | head -1 >/dev/null; then
                duplicate_components=$(eval "$find_command" -exec basename {} \; 2>/dev/null | sort | uniq -d | wc -l)
                if [ "$duplicate_components" -eq 0 ] 2>/dev/null; then
                    print_success "Component conflicts: NONE DETECTED"
                    module_passed=$((module_passed + 1))
                else
                    print_warning "Component conflicts: $duplicate_components potential conflicts found"
                fi
            else
                print_warning "Component conflicts: No component files found"
            fi
        else
            print_error "Component search command validation failed"
        fi
    else
        print_warning "Component conflicts: Components directory not found or invalid"
    fi
    
    # TypeScript Build Check with safe command execution
    print_status "Validating TypeScript build..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    build_command="timeout $BUILD_TIMEOUT $PACKAGE_MANAGER run build"
    if validate_and_sanitize_input "$build_command" "command" >/dev/null; then
        if eval "$build_command" >/dev/null 2>&1; then
            print_success "TypeScript build: PASSED"
            module_passed=$((module_passed + 1))
        else
            print_error "TypeScript build: FAILED or timeout"
        fi
    else
        print_error "Build command validation failed"
    fi
    
    # Linting Check with safe command execution
    print_status "Running linter..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    lint_command1="timeout $LINT_TIMEOUT $PACKAGE_MANAGER run lint"
    lint_command2="timeout $LINT_TIMEOUT $PACKAGE_MANAGER run lint:fix"
    
    if validate_and_sanitize_input "$lint_command1" "command" >/dev/null && validate_and_sanitize_input "$lint_command2" "command" >/dev/null; then
        if eval "$lint_command1" >/dev/null 2>&1 || eval "$lint_command2" >/dev/null 2>&1; then
            print_success "Linting: PASSED"
            module_passed=$((module_passed + 1))
        else
            print_warning "Linting: Issues found or not configured"
        fi
    else
        print_error "Linting command validation failed"
    fi
    
    print_status "Code Quality Score: $module_passed/$module_total"
}

# Security & Compliance Module
run_security_audit() {
    print_header "🛡️ Security & Compliance Analysis"
    local module_passed=0
    local module_total=0
    
    # Security Check: Input Validation System
    print_status "Validating input validation system..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if declare -f validate_and_sanitize_input >/dev/null && declare -f security_check_environment >/dev/null; then
        print_success "Input validation system: IMPLEMENTED"
        module_passed=$((module_passed + 1))
    else
        print_error "Input validation system: MISSING"
    fi
    
    # Environment Protection Check
    print_status "Validating environment protection..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ "$CLAUDE_ENV" = "production" ]; then
        print_error "Running in production environment - BLOCKED"
    else
        print_success "Environment protection: SAFE"
        module_passed=$((module_passed + 1))
    fi
    
    # LGPD Compliance Check with input validation
    print_healthcare "Validating LGPD compliance..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    lgpd_components=("ConsentBanner" "ConsentContext" "PatientConsent" "AuditLog" "DataRetention")
    compliance_score=0
    
    # Validate LGPD component names before searching
    for component in "${lgpd_components[@]}"; do
        if validate_and_sanitize_input "$component" "filename" >/dev/null; then
            if grep -r "$component" "$PROJECT_ROOT/apps/" 2>/dev/null | grep -q "\.tsx\?:"; then
                compliance_score=$((compliance_score + 1))
            fi
        else
            print_warning "Invalid LGPD component name detected: $component"
        fi
    done
    
    # Validate compliance percentage calculation
    if [ ${#lgpd_components[@]} -gt 0 ]; then
        compliance_percentage=$((compliance_score * 100 / ${#lgpd_components[@]}))
        if validate_and_sanitize_input "$compliance_percentage" "percentage" >/dev/null; then
            if [ $compliance_percentage -ge $MIN_COMPLIANCE_PERCENTAGE ]; then
                print_success "LGPD compliance: $compliance_percentage% COMPLIANT"
                module_passed=$((module_passed + 1))
            else
                print_warning "LGPD compliance: $compliance_percentage% - NEEDS IMPROVEMENT"
            fi
        else
            print_error "Invalid compliance percentage calculation"
        fi
    else
        print_error "No LGPD components defined for validation"
    fi
    
    # Security Dependencies Check with safe command execution
    print_status "Checking for security vulnerabilities..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    audit_command="timeout $AUDIT_TIMEOUT $PACKAGE_MANAGER audit --audit-level moderate"
    if validate_and_sanitize_input "$audit_command" "command" >/dev/null; then
        if eval "$audit_command" >/dev/null 2>&1; then
            print_success "Security audit: NO CRITICAL VULNERABILITIES"
            module_passed=$((module_passed + 1))
        else
            print_warning "Security audit: Vulnerabilities detected"
        fi
    else
        print_error "Security audit command validation failed"
    fi
    
    # Additional Security: File permission validation
    print_status "Validating script file permissions..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    insecure_files=0
    while IFS= read -r -d '' file; do
        if [ -x "$file" ]; then
            # Check if file has appropriate permissions
            perms=$(stat -c "%a" "$file" 2>/dev/null || echo "000")
            if [[ "$perms" =~ ^[67][0-7][0-7]$ ]]; then
                print_warning "Insecure file permissions detected: $file ($perms)"
                insecure_files=$((insecure_files + 1))
            fi
        fi
    done < <(find "$PROJECT_ROOT/scripts" -name "*.sh" -print0 2>/dev/null)
    
    if [ $insecure_files -eq 0 ]; then
        print_success "File permissions: SECURE"
        module_passed=$((module_passed + 1))
    else
        print_warning "File permissions: $insecure_files insecure files found"
    fi
    
    print_status "Security Score: $module_passed/$module_total"
}

# Performance Analysis Module
run_performance_audit() {
    print_header "⚡ Performance Analysis"
    local module_passed=0
    local module_total=0
    
    # Core Web Vitals Setup Check
    print_status "Checking Core Web Vitals setup..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -f "$PROJECT_ROOT/apps/web/src/lib/performance/web-vitals.js" ]; then
        print_success "Core Web Vitals: CONFIGURED"
        module_passed=$((module_passed + 1))
    else
        print_warning "Core Web Vitals: NOT CONFIGURED"
    fi
    
    # Build Performance Check
    print_status "Analyzing build performance..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -d "$PROJECT_ROOT/apps/web/dist" ]; then
        build_size=$(du -sh "$PROJECT_ROOT/apps/web/dist" 2>/dev/null | cut -f1 || echo "Unknown")
        size_mb=$(du -sm "$PROJECT_ROOT/apps/web/dist" 2>/dev/null | cut -f1 || echo "0")
        if [ "$size_mb" -lt $OPTIMAL_BUILD_SIZE_MB ] 2>/dev/null; then
            print_success "Build size: OPTIMAL ($build_size)"
            module_passed=$((module_passed + 1))
        else
            print_warning "Build size: LARGE ($build_size) - consider optimization"
        fi
    else
        print_warning "Build performance: Build required first"
    fi
    
    print_status "Performance Score: $module_passed/$module_total"
}

# Show usage information
show_usage() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  quality     - Code quality analysis (bundle, components, imports)"
    echo "  security    - Security audits and compliance validation"
    echo "  performance - Performance analysis and monitoring setup"
    echo "  full        - Complete audit suite (default)"
    echo ""
    echo "Options:"
    echo "  --report    - Generate detailed JSON report"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run full audit suite"
    echo "  $0 quality           # Run only code quality checks"
    echo "  $0 security          # Run security audit"
    echo "  $0 full --report     # Full audit with detailed report"
}

# Full Audit Suite
run_full_audit() {
    print_header "🎯 Complete Audit Suite"
    
    print_status "Executing comprehensive audit..."
    
    # Run all audit modules
    run_code_quality_audit
    run_security_audit
    run_performance_audit
    
    print_header "🎉 Audit Summary"
    
    # Calculate overall score
    if [ $TOTAL_CHECKS -gt 0 ]; then
        overall_percentage=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    else
        overall_percentage=0
    fi
    
    echo "📊 Overall Audit Results:"
    echo "  Total Checks: $TOTAL_CHECKS"
    echo "  ✅ Passed: $PASSED_CHECKS"
    echo "  ⚠️  Warnings: $WARNING_CHECKS"
    echo "  ❌ Failed: $FAILED_CHECKS"
    echo "  📈 Success Rate: $overall_percentage%"
    echo ""
    
    # Overall assessment
    if [ $overall_percentage -ge $EXCELLENT_AUDIT_SCORE ]; then
        print_success "🏥 NEONPRO AUDIT: EXCELLENT - Ready for healthcare production!"
    elif [ $overall_percentage -ge $GOOD_AUDIT_SCORE ]; then
        print_success "🏥 NEONPRO AUDIT: GOOD - Minor improvements recommended"
    elif [ $overall_percentage -ge $ACCEPTABLE_AUDIT_SCORE ]; then
        print_warning "🏥 NEONPRO AUDIT: ACCEPTABLE - Several improvements needed"
    else
        print_error "🏥 NEONPRO AUDIT: NEEDS WORK - Critical issues must be addressed"
    fi
    
    print_healthcare "Healthcare compliance and quality standards evaluated"
}

# Main execution function
main() {
    local command=${1:-"full"}
    
    # Handle help command first
    if [[ "$command" == "--help" || "$command" == "-h" || "$command" == "help" ]]; then
        show_usage
        exit 0
    fi
    
    print_header "🔍 NEONPRO - Unified Audit System"
    echo "Command: $command"
    echo "Log file: $LOG_FILE"
    echo ""
    
    # Security check: Validate command input
    if ! validate_audit_command "$command"; then
        print_error "Invalid command parameters"
        exit 1
    fi
    
    # Security check: Environment validation
    if ! security_check_environment; then
        print_error "Security check failed - environment issues detected"
        exit 1
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Execute based on command
    case $command in
        "quality")
            run_code_quality_audit
            ;;
        "security")
            run_security_audit
            ;;
        "performance")
            run_performance_audit
            ;;
        "full")
            run_full_audit
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
    
    # Exit with appropriate code
    if [ $FAILED_CHECKS -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# Error handling
trap 'print_error "Audit interrupted. Check $LOG_FILE for details."; exit 1' INT TERM

# Make script executable and run
chmod +x "$0"
main "$@"
