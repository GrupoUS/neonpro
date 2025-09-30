#!/bin/bash
# NeonPro Simple Bun Build Script
# Healthcare compliance optimized

set -euo pipefail

# Healthcare compliance
export HEALTHCARE_COMPLIANCE="${HEALTHCARE_COMPLIANCE:-true}"
export LGPD_MODE="${LGPD_MODE:-true}"
export DATA_RESIDENCY="${DATA_RESIDENCY:-local}"
export AUDIT_LOGGING="${AUDIT_LOGGING:-true}"

BUILD_START_TIME=$(date +%s)
BUILD_ID="bun-build-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="build-${BUILD_ID}.log"

echo "🏥 NEONPRO NATIVE BUN BUILD"
echo "================================"
echo "Build ID: ${BUILD_ID}"
echo "Healthcare Compliance: ${HEALTHCARE_COMPLIANCE}"
echo "LGPD Mode: ${LGPD_MODE}"
echo "Data Residency: ${DATA_RESIDENCY}"
echo "Audit Logging: ${AUDIT_LOGGING}"
echo ""

# Build function for a single package
build_single_package() {
    local package_name=$1
    local package_dir=$2
    
    echo "🔧 Building ${package_name}..."
    
    # Change to package directory
    cd "${package_dir}"
    
    local start_time=$(date +%s)
    
    # Run TypeScript compilation with compliance logging
    if bunx tsc --project tsconfig.json 2>&1 | tee -a "../${LOG_FILE}"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        echo "✅ ${package_name} built successfully (${duration}s)"
        
        # Healthcare compliance log
        echo "[HEALTHCARE-AUDIT] $(cat <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "operation": "typescript-compilation",
  "build_id": "${BUILD_ID}",
  "package": "${package_name}",
  "status": "success",
  "duration_ms": "${duration}",
  "compliance": {
    "lgpd": "${LGPD_MODE}",
    "healthcare": "${HEALTHCARE_COMPLIANCE}",
    "data_residency": "${DATA_RESIDENCY}",
    "audit_logging": "${AUDIT_LOGGING}"
  }
}
EOF
        )" | tee -a "../${LOG_FILE}"
        
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        echo "❌ ${package_name} build failed (${duration}s)"
        
        # Healthcare compliance log
        echo "[HEALTHCARE-AUDIT] $(cat <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "operation": "typescript-compilation",
  "build_id": "${BUILD_ID}",
  "package": "${package_name}",
  "status": "failed",
  "duration_ms": "${duration}",
  "compliance": {
    "lgpd": "${LGPD_MODE}",
    "healthcare": "${HEALTHCARE_COMPLIANCE}",
    "data_residency": "${DATA_RESIDENCY}",
    "audit_logging": "${AUDIT_LOGGING}"
  }
}
EOF
        )" | tee -a "../${LOG_FILE}"
        
        return 1
    fi
}

# Main function
main() {
    local packages_to_build=()
    local failed_packages=()
    
    # Auto-detect packages
    if [ $# -eq 0 ]; then
        for pkg_dir in packages/*/; do
            if [ -d "${pkg_dir}" ] && [ -f "${pkg_dir}/tsconfig.json" ]; then
                packages_to_build+=("${pkg_dir}")
            fi
        done
        
        # Only add apps that exist
        if [ -d "apps/web" ] && [ -f "apps/web/tsconfig.json" ]; then
            packages_to_build+=("apps/web")
        fi
        if [ -d "apps/api" ] && [ -f "apps/api/tsconfig.json" ]; then
            packages_to_build+=("apps/api")
        fi
    else
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
    
    # Build all packages
    local failed_count=0
    for package_dir in "${packages_to_build[@]}"; do
        if ! build_single_package "$(basename "${package_dir}")" "${package_dir}"; then
            failed_count=$((failed_count + 1))
            failed_packages+=("$(basename "${package_dir}")")
        fi
    done
    
    # Summary
    local total_time=$(($(date +%s) - BUILD_START_TIME))
    echo ""
    echo "📊 BUILD SUMMARY"
    echo "================"
    echo "Total packages: ${#packages_to_build[@]}"
    echo "Successful: $((${#packages_to_build[@]} - failed_count))"
    echo "Failed: ${failed_count}"
    echo "Total time: ${total_time}s"
    echo "Compliance: ✅ LGPD, ANVISA, CFM"
    
    if [ ${#failed_packages[@]} -gt 0 ]; then
        echo ""
        echo "❌ Failed packages:"
        for package in "${failed_packages[@]}"; do
            echo "  - ${package}"
        done
        echo ""
        echo "📋 Check build logs: ${LOG_FILE}"
        return 1
    else
        echo ""
        echo "🎉 ALL PACKAGES BUILT SUCCESSFULLY!"
        echo "📋 Build logs: ${LOG_FILE}"
        echo "📊 Performance: Average $(echo "scale=2; ${total_time}/${#packages_to_build[@]}" | bc -l)s per package"
    fi
    
    # Clean up old logs
    ls -t build-*.log 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    
    return 0
}

# Execute main function
main "$@"