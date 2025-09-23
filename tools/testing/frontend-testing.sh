#!/bin/bash
# Comprehensive Frontend Testing Script - NeonPro Aesthetic Clinic Platform
# Multi-agent TDD orchestration with MCP Playwright integration

set -e

# Configuration
TEST_ENVIRONMENT="${TEST_ENVIRONMENT:-e2e}"
BASE_URL="${BASE_URL:-http://localhost:8080}"
TEST_WORKSPACE="/home/vibecode/neonpro"
LOG_DIR="$TEST_WORKSPACE/test-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEST_SESSION_ID="${TEST_SESSION_ID:-frontend_test_$TIMESTAMP}"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PHASE_EXECUTORS_DIR="$SCRIPT_DIR/phase-executors"

# Parse command line arguments
PHASE=""
WORKFLOW=""
ENVIRONMENT=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --phase)
            PHASE="$2"
            shift 2
            ;;
        --workflow)
            WORKFLOW="$2"
            shift 2
            ;;
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --phase PHASE         Run specific phase (red, green, aesthetic-clinic, refactor, quality, report)"
            echo "  --workflow WORKFLOW  Run specific workflow (patient-management, appointment-scheduling, whatsapp-integration)"
            echo "  --env ENV           Set environment (dev, staging, prod)"
            echo "  --help              Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Initialize test environment
initialize_test_environment() {
    echo "🚀 Initializing Test Environment"
    echo "================================="
    echo "Session ID: $TEST_SESSION_ID"
    echo "Base URL: $BASE_URL"
    echo "Environment: $ENVIRONMENT"
    echo "Workspace: $TEST_WORKSPACE"
    
    # Create log directory
    mkdir -p "$LOG_DIR"
    
    # Initialize session log
    cat > "$LOG_DIR/session_$TEST_SESSION_ID.log" << EOF
NeonPro Frontend Testing Session
=================================
Session ID: $TEST_SESSION_ID
Timestamp: $(date)
Base URL: $BASE_URL
Environment: $ENVIRONMENT
Test Phase: $PHASE
Workflow: $WORKFLOW
EOF
    
    # Verify dependencies
    echo "🔍 Verifying dependencies..."
    if command -v node &> /dev/null; then
        echo "✅ Node.js: $(node --version)"
    else
        echo "❌ Node.js not found"
        exit 1
    fi
    
    if command -v bun &> /dev/null; then
        echo "✅ bun: $(bun --version)"
    else
        echo "❌ bun not found"
        exit 1
    fi
    
    echo "✅ Test environment initialized successfully"
}

# RED Phase
red_phase_test_definition() {
    if [[ -n "$PHASE" && "$PHASE" != "red" ]]; then
        return 0
    fi
    
    echo ""
    bash "$PHASE_EXECUTORS_DIR/red-phase.sh"
}

# GREEN Phase
green_phase_execution() {
    if [[ -n "$PHASE" && "$PHASE" != "green" ]]; then
        return 0
    fi
    
    echo ""
    bash "$PHASE_EXECUTORS_DIR/green-phase.sh"
}

# Aesthetic Clinic Testing
aesthetic_clinic_testing() {
    if [[ -n "$PHASE" && "$PHASE" != "aesthetic-clinic" ]]; then
        return 0
    fi
    
    echo ""
    bash "$PHASE_EXECUTORS_DIR/aesthetic-clinic-phase.sh"
}

# REFACTOR Phase
refactor_phase_optimization() {
    if [[ -n "$PHASE" && "$PHASE" != "refactor" ]]; then
        return 0
    fi
    
    echo ""
    bash "$PHASE_EXECUTORS_DIR/refactor-phase.sh"
}

# Quality Gate Validation
quality_gate_validation() {
    if [[ -n "$PHASE" && "$PHASE" != "quality" ]]; then
        return 0
    fi
    
    echo ""
    bash "$PHASE_EXECUTORS_DIR/quality-gate-phase.sh"
}

# Comprehensive Reporting
comprehensive_reporting() {
    if [[ -n "$PHASE" && "$PHASE" != "report" ]]; then
        return 0
    fi
    
    echo ""
    bash "$PHASE_EXECUTORS_DIR/reporting-phase.sh"
}

# Main execution function
main() {
    echo "🧪 NeonPro Comprehensive Frontend Testing"
    echo "========================================="
    
    # Export environment variables for phase scripts
    export LOG_DIR
    export TEST_SESSION_ID
    export BASE_URL
    export TEST_ENVIRONMENT
    export PHASE
    export WORKFLOW
    export ENVIRONMENT
    
    # Execute workflow
    initialize_test_environment
    
    # Run specific phase or all phases
    if [[ -z "$PHASE" ]]; then
        red_phase_test_definition
        green_phase_execution
        aesthetic_clinic_testing
        refactor_phase_optimization
        quality_gate_validation
        comprehensive_reporting
    else
        case "$PHASE" in
            "red")
                red_phase_test_definition
                ;;
            "green")
                green_phase_execution
                ;;
            "aesthetic-clinic")
                aesthetic_clinic_testing
                ;;
            "refactor")
                refactor_phase_optimization
                ;;
            "quality")
                quality_gate_validation
                ;;
            "report")
                comprehensive_reporting
                ;;
            *)
                echo "❌ Unknown phase: $PHASE"
                echo "Available phases: red, green, aesthetic-clinic, refactor, quality, report"
                exit 1
                ;;
        esac
    fi
    
    echo ""
    echo "🎉 Testing completed successfully!"
    echo "📁 Results available in: $LOG_DIR"
    echo "📋 Session log: $LOG_DIR/session_$TEST_SESSION_ID.log"
}

# Handle errors
error_handler() {
    echo "❌ Error occurred at line $1"
    echo "📋 Check session log: $LOG_DIR/session_$TEST_SESSION_ID.log"
    exit 1
}

# Set error trap
trap 'error_handler $LINENO' ERR

# Execute main function
main "$@"