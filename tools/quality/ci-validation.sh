#!/bin/bash

# CI/CD Integration Validation Script
# Validates integration of new quality tools with existing CI/CD pipeline

set -e

echo "🔍 Validating CI/CD integration for quality tools..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log results
log_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    if [ "$status" = "success" ]; then
        echo -e "${GREEN}✅ $test_name: $message${NC}"
    else
        echo -e "${RED}❌ $test_name: $message${NC}"
    fi
}

# Function to log warnings
log_warning() {
    local test_name="$1"
    local message="$2"
    echo -e "${YELLOW}⚠️  $test_name: $message${NC}"
}

# Test 1: Check if quality tools are installed
test_tools_installed() {
    echo "📦 Testing tool installation..."
    
    # Check oxlint
    if command -v oxlint &> /dev/null; then
        log_result "Oxlint Installation" "success" "oxlint is installed"
    else
        log_result "Oxlint Installation" "failed" "oxlint is not installed"
        return 1
    fi
    
    # Check dprint
    if command -v dprint &> /dev/null; then
        log_result "dprint Installation" "success" "dprint is installed"
    else
        log_result "dprint Installation" "failed" "dprint is not installed"
        return 1
    fi
    
    # Check bun
    if command -v bun &> /dev/null; then
        log_result "Bun Installation" "success" "bun is installed"
    else
        log_result "Bun Installation" "failed" "bun is not installed"
        return 1
    fi
    
    return 0
}

# Test 2: Validate configuration files
test_config_files() {
    echo "⚙️  Testing configuration files..."
    
    # Check oxlint config
    if [ -f "tools/quality/oxlint.config.mjs" ]; then
        log_result "Oxlint Config" "success" "tools/quality/oxlint.config.mjs exists"
    else
        log_result "Oxlint Config" "failed" "tools/quality/oxlint.config.mjs not found"
        return 1
    fi
    
    # Check dprint config
    if [ -f "tools/quality/dprint.json" ]; then
        log_result "dprint Config" "success" "tools/quality/dprint.json exists"
    else
        log_result "dprint Config" "failed" "tools/quality/dprint.json not found"
        return 1
    fi
    
    # Check parallel script
    if [ -f "tools/quality/parallel-quality-check.sh" ]; then
        log_result "Parallel Script" "success" "tools/quality/parallel-quality-check.sh exists"
    else
        log_result "Parallel Script" "failed" "tools/quality/parallel-quality-check.sh not found"
        return 1
    fi
    
    return 0
}

# Test 3: Validate package.json scripts
test_package_scripts() {
    echo "📜 Testing package.json scripts..."
    
    # Check if required scripts exist
    local required_scripts=(
        "lint:oxlint"
        "lint:oxlint:fix"
        "format:dprint"
        "format:dprint:fix"
        "test:quality"
        "test:quality:parallel"
    )
    
    for script in "${required_scripts[@]}"; do
        if bun run --silent | grep -q "$script"; then
            log_result "Script $script" "success" "Found in package.json"
        else
            log_result "Script $script" "failed" "Not found in package.json"
            return 1
        fi
    done
    
    return 0
}

# Test 4: Test tool functionality
test_tool_functionality() {
    echo "🔧 Testing tool functionality..."
    
    # Test oxlint configuration parsing
    if oxlint --config tools/quality/oxlint.config.mjs --help &> /dev/null; then
        log_result "Oxlint Config" "success" "Configuration is valid"
    else
        log_result "Oxlint Config" "failed" "Configuration is invalid"
        return 1
    fi
    
    # Test dprint configuration parsing
    if dprint check --config tools/quality/dprint.json --help &> /dev/null; then
        log_result "dprint Config" "success" "Configuration is valid"
    else
        log_result "dprint Config" "failed" "Configuration is invalid"
        return 1
    fi
    
    return 0
}

# Test 5: Test CI/CD workflow compatibility
test_ci_compatibility() {
    echo "🔄 Testing CI/CD workflow compatibility..."
    
    # Check GitHub workflows
    if [ -d ".github/workflows" ]; then
        log_result "GitHub Workflows" "success" "Workflows directory exists"
        
        # Check if CI workflows exist
        if ls .github/workflows/ci*.yml 1> /dev/null 2>&1; then
            log_result "CI Files" "success" "CI workflow files found"
            
            # Check for potential issues
            local workflow_files=$(find .github/workflows -name "ci*.yml")
            for file in $workflow_files; do
                if grep -q "pnpm" "$file"; then
                    log_warning "Workflow $file" "Uses pnpm instead of bun - may need update"
                fi
                if grep -q "npm" "$file"; then
                    log_warning "Workflow $file" "Uses npm instead of bun - may need update"
                fi
            done
        else
            log_result "CI Files" "failed" "No CI workflow files found"
            return 1
        fi
    else
        log_result "GitHub Workflows" "failed" "No workflows directory"
        return 1
    fi
    
    return 0
}

# Test 6: Test documentation
test_documentation() {
    echo "📚 Testing documentation..."
    
    # Check if README exists
    if [ -f "tools/quality/README.md" ]; then
        log_result "Documentation" "success" "tools/quality/README.md exists"
        
        # Check key sections
        local required_sections=(
            "Oxlint"
            "dprint"
            "Healthcare Compliance"
            "CI/CD"
        )
        
        for section in "${required_sections[@]}"; do
            if grep -q "$section" tools/quality/README.md; then
                log_result "Section $section" "success" "Found in documentation"
            else
                log_warning "Section $section" "Not found in documentation"
            fi
        done
    else
        log_result "Documentation" "failed" "tools/quality/README.md not found"
        return 1
    fi
    
    return 0
}

# Main validation function
main() {
    echo "🚀 Starting CI/CD integration validation..."
    echo "=========================================="
    
    local overall_success=true
    
    # Run all tests
    test_tools_installed || overall_success=false
    test_config_files || overall_success=false
    test_package_scripts || overall_success=false
    test_tool_functionality || overall_success=false
    test_ci_compatibility || overall_success=false
    test_documentation || overall_success=false
    
    echo "=========================================="
    
    if [ "$overall_success" = true ]; then
        echo -e "${GREEN}🎉 All validations passed! Quality tools are ready for CI/CD.${NC}"
        echo ""
        echo "📋 Next steps:"
        echo "1. Run 'bun run test:quality:parallel' to test locally"
        echo "2. Update CI workflows to use bun instead of pnpm"
        echo "3. Add quality gates to your CI pipeline"
        exit 0
    else
        echo -e "${RED}💥 Some validations failed. Please fix the issues above.${NC}"
        echo ""
        echo "🔧 Troubleshooting:"
        echo "1. Install missing tools: bun install oxlint dprint"
        echo "2. Check configuration files in tools/quality/"
        echo "3. Verify package.json scripts"
        exit 1
    fi
}

# Run main function
main "$@"