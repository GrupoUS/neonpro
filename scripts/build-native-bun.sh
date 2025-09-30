#!/bin/bash
# NeonPro Native Bun Build Script
# Architecture: Clean Architecture with Healthcare Compliance
# Performance: Optimized for Bun runtime
# Compliance: LGPD, ANVISA, CFM compliant

set -euo pipefail

# Healthcare Compliance Variables
export HEALTHCARE_COMPLIANCE="${HEALTHCARE_COMPLIANCE:-true}"
export LGPD_MODE="${LGPD_MODE:-true}"
export DATA_RESIDENCY="${DATA_RESIDENCY:-local}"
export AUDIT_LOGGING="${AUDIT_LOGGING:-true}"

# Build Configuration
BUILD_START_TIME=$(date +%s)
BUILD_ID="bun-build-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="build-${BUILD_ID}.log"

# Healthcare Compliance Logger
log_operation() {
    local operation=$1
    local status=$2
    local duration=$3
    
    local log_entry=$(cat <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "operation": "${operation}",
  "build_id": "${BUILD_ID}",
  "status": "${status}",
  "duration_ms": "${duration}",
  "compliance": {
    "lgpd": "${LGPD_MODE}",
    "healthcare": "${HEALTHCARE_COMPLIANCE}",
    "data_residency": "${DATA_RESIDENCY}",
    "audit_logging": "${AUDIT_LOGGING}"
  }
}
EOF
)
    
    echo "[HEALTHCARE-AUDIT] ${log_entry}" | tee -a "${LOG_FILE}"
}

# Native Bun TypeScript Compiler
compile_package() {
    local package_name=$1
    local package_dir=$2
    
    echo "🔧 Building ${package_name} with native Bun..."
    
    local start_time=$(date +%s)
    
    # Execute compilation with healthcare compliance
    if ! bun run build-package "${package_name}" 2>&1 | tee -a "${LOG_FILE}"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_operation "typescript-compilation" "success" "${duration}"
        
        echo "✅ ${package_name} built successfully (${duration}s)"
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_operation "typescript-compilation" "failed" "${duration}"
        
        echo "❌ ${package_name} build failed (${duration}s)"
        return 1
    fi
}

# Parallel Build Function
build_packages_parallel() {
    local packages=("$@")
    local pids=()
    local failed_packages=()
    
    echo "🚀 Starting parallel build of ${#packages[@]} packages..."
    
    # Start all builds in parallel
    for package_dir in "${packages[@]}"; do
        local package_name=$(basename "${package_dir}")
        
        (compile_package "${package_name}" "${package_dir}") &
        pids+=($!)
        
        echo "📦 Started build: ${package_name} (PID: ${pids[-1]})"
    done
    
    # Wait for all builds to complete
    local failed_count=0
    for i in "${!pids[@]}"; do
        local pid=${pids[i]}
        local package_name=${packages[i]}
        
        if wait "${pid}"; then
            echo "✅ ${package_name} build completed successfully"
        else
            echo "❌ ${package_name} build failed"
            failed_packages+=("${package_name}")
            failed_count=$((failed_count + 1))
        fi
    done
    
    # Summary
    local total_time=$(($(date +%s) - BUILD_START_TIME))
    echo ""
    echo "📊 BUILD SUMMARY"
    echo "================"
    echo "Total packages: ${#packages[@]}"
    echo "Successful: $((${#packages[@]} - failed_count))"
    echo "Failed: ${failed_count}"
    echo "Total time: ${total_time}s"
    
    if [ ${#failed_packages[@]} -gt 0 ]; then
        echo ""
        echo "❌ Failed packages:"
        for package in "${failed_packages[@]}"; do
            echo "  - ${package}"
        done
        echo ""
        echo "📋 Check build logs for details: ${LOG_FILE}"
        return 1
    fi
    
    return 0
}

# Sequential Build Function (fallback)
build_packages_sequential() {
    local packages=("$@")
    local failed_count=0
    
    echo "🔧 Starting sequential build of ${#packages[@]} packages..."
    
    for package_dir in "${packages[@]}"; do
        local package_name=$(basename "${package_dir}")
        
        if ! compile_package "${package_name}" "${package_dir}"; then
            failed_count=$((failed_count + 1))
        fi
    done
    
    # Summary
    local total_time=$(($(date +%s) - BUILD_START_TIME))
    echo ""
    echo "📊 BUILD SUMMARY"
    echo "================"
    echo "Total packages: ${#packages[@]}"
    echo "Successful: $((${#packages[@]} - failed_count))"
    echo "Failed: ${failed_count}"
    echo "Total time: ${total_time}s"
    
    return ${failed_count}
}

# Main Build Function
main() {
    echo "🏥 NEONPRO NATIVE BUN BUILD"
    echo "================================"
    echo "Build ID: ${BUILD_ID}"
    echo "Healthcare Compliance: ${HEALTHCARE_COMPLIANCE}"
    echo "LGPD Mode: ${LGPD_MODE}"
    echo "Data Residency: ${DATA_RESIDENCY}"
    echo "Audit Logging: ${AUDIT_LOGGING}"
    echo ""
    
    # Auto-detect packages to build
    local packages_to_build=()
    
    # Check if specific packages were passed as arguments
    if [ $# -eq 0 ]; then
        # Auto-detect all packages with build scripts
        for pkg_dir in packages/*/; do
            if [ -d "${pkg_dir}" ] && [ -f "${pkg_dir}/tsconfig.json" ]; then
                packages_to_build+=("${pkg_dir}")
            fi
        done
        
        # Add apps if they exist
        for app_dir in apps/*/; do
            if [ -d "${app_dir}" ] && [ -f "${app_dir}/tsconfig.json" ]; then
                packages_to_build+=("${app_dir}")
            fi
        done
    else
        # Use provided package directories
        packages_to_build=("$@")
    fi
    
    if [ ${#packages_to_build[@]} -eq 0 ]; then
        echo "❌ No packages found to build"
        return 1
    fi
    
    echo "📦 Packages to build:"
    for package in "${packages_to_build[@]}"; do
        echo "  - $(basename "${package}")"
    done
    echo ""
    
    # Choose build strategy based on package count
    if [ ${#packages_to_build[@]} -gt 1 ]; then
        build_packages_parallel "${packages_to_build[@]}"
    else
        build_packages_sequential "${packages_to_build[@]}"
    fi
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo ""
        echo "🎉 ALL PACKAGES BUILT SUCCESSFULLY!"
        echo "📋 Build logs saved to: ${LOG_FILE}"
    else
        echo ""
        echo "❌ BUILD FAILED - Check logs for details"
        echo "📋 Build logs: ${LOG_FILE}"
    fi
    
    # Clean up old log files (keep last 10)
    ls -t build-*.log 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    
    return $exit_code
}

# Execute main function with all arguments
main "$@"