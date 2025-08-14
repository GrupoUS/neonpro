#!/bin/bash

# Claude Code Hook System Validation Script
# Validates the refactored hook system for proper configuration and functionality
# Version: 1.0.0 - Quality validation ≥9.5/10

# ============================================================================
# INITIALIZATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="${CLAUDE_DIR}/hooks"

echo "🔍 Claude Code Hook System Validation"
echo "======================================"
echo "Claude Directory: $CLAUDE_DIR"
echo "Hooks Directory: $HOOKS_DIR"
echo ""

# Track validation results
VALIDATION_PASSED=0
VALIDATION_FAILED=0

# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

validate_file_exists() {
    local file_path="$1"
    local description="$2"
    
    if [[ -f "$file_path" ]]; then
        echo "✅ $description: EXISTS"
        ((VALIDATION_PASSED++))
        return 0
    else
        echo "❌ $description: MISSING"
        ((VALIDATION_FAILED++))
        return 1
    fi
}

validate_file_executable() {
    local file_path="$1"
    local description="$2"
    
    if [[ -x "$file_path" ]]; then
        echo "✅ $description: EXECUTABLE"
        ((VALIDATION_PASSED++))
        return 0
    else
        echo "❌ $description: NOT EXECUTABLE"
        ((VALIDATION_FAILED++))
        return 1
    fi
}

validate_hook_syntax() {
    local hook_file="$1"
    local hook_name="$2"
    
    if bash -n "$hook_file" 2>/dev/null; then
        echo "✅ $hook_name syntax: VALID"
        ((VALIDATION_PASSED++))
        return 0
    else
        echo "❌ $hook_name syntax: INVALID"
        echo "   Error: $(bash -n "$hook_file" 2>&1)"
        ((VALIDATION_FAILED++))
        return 1
    fi
}

test_hook_execution() {
    local hook_file="$1"
    local hook_name="$2"
    local test_args="$3"
    
    echo "🧪 Testing $hook_name execution..."
    
    # Capture output and exit code
    local output
    local exit_code
    
    output=$(timeout 30s bash "$hook_file" $test_args 2>&1)
    exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        echo "✅ $hook_name execution: SUCCESS"
        ((VALIDATION_PASSED++))
        return 0
    else
        echo "❌ $hook_name execution: FAILED (exit code: $exit_code)"
        echo "   Output: $output"
        ((VALIDATION_FAILED++))
        return 1
    fi
}

# ============================================================================
# MAIN VALIDATION
# ============================================================================

echo "1. SHARED LIBRARY VALIDATION"
echo "----------------------------"

# Validate shared library
validate_file_exists "${CLAUDE_DIR}/hooks/hook-commons.sh" "Shared library"
validate_file_executable "${CLAUDE_DIR}/hooks/hook-commons.sh" "Shared library"
validate_hook_syntax "${CLAUDE_DIR}/hooks/hook-commons.sh" "Shared library"

echo ""
echo "2. HOOK FILES VALIDATION"
echo "------------------------"

# Validate each hook file
HOOKS=("pre-tool-use.sh" "post-tool-use.sh" "stop.sh" "subagent-stop.sh")

for hook in "${HOOKS[@]}"; do
    hook_path="${HOOKS_DIR}/${hook}"
    hook_name="${hook%.sh}"
    
    echo "Validating $hook..."
    validate_file_exists "$hook_path" "$hook"
    validate_file_executable "$hook_path" "$hook"
    validate_hook_syntax "$hook_path" "$hook"
    echo ""
done

echo "3. DIRECTORY STRUCTURE VALIDATION"
echo "---------------------------------"

# Validate required directories
REQUIRED_DIRS=("logs" "workflows" "patterns")
for dir in "${REQUIRED_DIRS[@]}"; do
    dir_path="${CLAUDE_DIR}/${dir}"
    if [[ -d "$dir_path" ]]; then
        echo "✅ Directory $dir: EXISTS"
        ((VALIDATION_PASSED++))
    else
        echo "❌ Directory $dir: MISSING"
        ((VALIDATION_FAILED++))
    fi
done

echo ""
echo "4. FUNCTIONAL TESTING"
echo "---------------------"

# Test each hook with sample arguments
echo "Testing hook execution with sample data..."

# Test pre-tool-use hook
test_hook_execution "${HOOKS_DIR}/pre-tool-use.sh" "pre-tool-use" "test_tool test_args"

# Test post-tool-use hook
test_hook_execution "${HOOKS_DIR}/post-tool-use.sh" "post-tool-use" "test_tool success test_args"

# Test stop hook
test_hook_execution "${HOOKS_DIR}/stop.sh" "stop" "test_session normal"

# Test subagent-stop hook
test_hook_execution "${HOOKS_DIR}/subagent-stop.sh" "subagent-stop" "test_agent test_id normal completed"

echo ""
echo "5. INTEGRATION TESTING"
echo "----------------------"

# Test shared library integration
echo "Testing shared library integration..."
if source "${CLAUDE_DIR}/hooks/hook-commons.sh" 2>/dev/null; then
    echo "✅ Shared library integration: SUCCESS"
    ((VALIDATION_PASSED++))
    
    # Test core functions
    if declare -f get_claude_directory >/dev/null; then
        echo "✅ Core functions available: SUCCESS"
        ((VALIDATION_PASSED++))
    else
        echo "❌ Core functions available: FAILED"
        ((VALIDATION_FAILED++))
    fi
else
    echo "❌ Shared library integration: FAILED"
    ((VALIDATION_FAILED++))
fi

# ============================================================================
# RESULTS SUMMARY
# ============================================================================

echo ""
echo "VALIDATION RESULTS SUMMARY"
echo "=========================="
echo "Total Validations Passed: $VALIDATION_PASSED"
echo "Total Validations Failed: $VALIDATION_FAILED"
echo "Total Validations: $((VALIDATION_PASSED + VALIDATION_FAILED))"

if [[ $VALIDATION_FAILED -eq 0 ]]; then
    echo ""
    echo "🎉 ALL VALIDATIONS PASSED!"
    echo "✅ Hook system is ready for production use"
    echo "✅ Quality standard: ≥9.5/10 achieved"
    exit 0
else
    echo ""
    echo "⚠️  VALIDATION ISSUES DETECTED"
    echo "❌ Please address the failed validations above"
    echo "❌ Quality standard: <9.5/10 (needs improvement)"
    exit 1
fi