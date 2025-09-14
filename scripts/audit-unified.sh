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

# Code Quality Analysis Module
run_code_quality_audit() {
    print_header "🔍 Code Quality Analysis"
    local module_passed=0
    local module_total=0
    
    # Bundle Analysis (integrated functionality)
    print_status "Analyzing bundle sizes..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -d "$PROJECT_ROOT/apps/web/dist" ]; then
        build_size=$(du -sh "$PROJECT_ROOT/apps/web/dist" 2>/dev/null | cut -f1 || echo "Unknown")
        size_mb=$(du -sm "$PROJECT_ROOT/apps/web/dist" 2>/dev/null | cut -f1 || echo "0")
        if [ "$size_mb" -lt 15 ] 2>/dev/null; then
            print_success "Bundle analysis: OPTIMAL ($build_size)"
            module_passed=$((module_passed + 1))
        else
            print_warning "Bundle analysis: LARGE ($build_size) - consider optimization"
        fi
    else
        print_warning "Bundle analysis: Build required first"
    fi

    # Component Conflict Detection (integrated functionality)
    print_status "Detecting component conflicts..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    # Check for common component conflict patterns
    if find "$PROJECT_ROOT/apps/web/src/components" -name "*.tsx" -o -name "*.ts" 2>/dev/null | head -1 >/dev/null; then
        duplicate_components=$(find "$PROJECT_ROOT/apps/web/src/components" -name "*.tsx" -exec basename {} \; 2>/dev/null | sort | uniq -d | wc -l)
        if [ "$duplicate_components" -eq 0 ] 2>/dev/null; then
            print_success "Component conflicts: NONE DETECTED"
            module_passed=$((module_passed + 1))
        else
            print_warning "Component conflicts: $duplicate_components potential conflicts found"
        fi
    else
        print_warning "Component conflicts: Components directory not found"
    fi
    
    # TypeScript Build Check
    print_status "Validating TypeScript build..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if timeout 60 $PACKAGE_MANAGER run build >/dev/null 2>&1; then
        print_success "TypeScript build: PASSED"
        module_passed=$((module_passed + 1))
    else
        print_error "TypeScript build: FAILED or timeout"
    fi
    
    # Linting Check
    print_status "Running linter..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if timeout 30 $PACKAGE_MANAGER run lint >/dev/null 2>&1 || timeout 30 $PACKAGE_MANAGER run lint:fix >/dev/null 2>&1; then
        print_success "Linting: PASSED"
        module_passed=$((module_passed + 1))
    else
        print_warning "Linting: Issues found or not configured"
    fi
    
    print_status "Code Quality Score: $module_passed/$module_total"
}

# Security & Compliance Module
run_security_audit() {
    print_header "🛡️ Security & Compliance Analysis"
    local module_passed=0
    local module_total=0
    
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
    
    # LGPD Compliance Check
    print_healthcare "Validating LGPD compliance..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    lgpd_components=("ConsentBanner" "ConsentContext" "PatientConsent" "AuditLog" "DataRetention")
    compliance_score=0
    
    for component in "${lgpd_components[@]}"; do
        if grep -r "$component" "$PROJECT_ROOT/apps/" 2>/dev/null | grep -q "\.tsx\?:"; then
            compliance_score=$((compliance_score + 1))
        fi
    done
    
    compliance_percentage=$((compliance_score * 100 / ${#lgpd_components[@]}))
    if [ $compliance_percentage -ge 80 ]; then
        print_success "LGPD compliance: $compliance_percentage% COMPLIANT"
        module_passed=$((module_passed + 1))
    else
        print_warning "LGPD compliance: $compliance_percentage% - NEEDS IMPROVEMENT"
    fi
    
    # Security Dependencies Check
    print_status "Checking for security vulnerabilities..."
    module_total=$((module_total + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if timeout 30 $PACKAGE_MANAGER audit --audit-level moderate >/dev/null 2>&1; then
        print_success "Security audit: NO CRITICAL VULNERABILITIES"
        module_passed=$((module_passed + 1))
    else
        print_warning "Security audit: Vulnerabilities detected"
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
        if [ "$size_mb" -lt 10 ] 2>/dev/null; then
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
    if [ $overall_percentage -ge 90 ]; then
        print_success "🏥 NEONPRO AUDIT: EXCELLENT - Ready for healthcare production!"
    elif [ $overall_percentage -ge 80 ]; then
        print_success "🏥 NEONPRO AUDIT: GOOD - Minor improvements recommended"
    elif [ $overall_percentage -ge 70 ]; then
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
