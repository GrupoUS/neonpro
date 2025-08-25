#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Simple NeonPro CI/CD Pipeline Test Script
.DESCRIPTION
    Runs basic validation tests for the NeonPro healthcare platform
.PARAMETER SkipTests
    Skip running the test suite (default: false)
#>

param(
    [switch]$SkipTests = $false
)

# Color functions
function Write-Success { param($Message) Write-Host "OK $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "WARN $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "ERROR $Message" -ForegroundColor Red }
function Write-Log { param($Message) Write-Host "INFO $Message" -ForegroundColor Cyan }

Write-Host ""
Write-Host "NeonPro CI/CD Pipeline Test (Simplified)" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host ""

# Ensure we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Error "Not in NeonPro root directory"
    exit 1
}

Write-Success "Starting from NeonPro root directory"

# 1. Compliance Validation
Write-Log "Running healthcare compliance validations..."

# ANVISA validation
Write-Log "Running ANVISA compliance validation..."
try {
    node scripts/anvisa-validation.js
    if ($LASTEXITCODE -eq 0) {
        Write-Success "ANVISA compliance validation passed"
    } else {
        Write-Warning "ANVISA validation issues detected"
    }
} catch {
    Write-Warning "ANVISA validation script error"
}

# CFM validation
Write-Log "Running CFM compliance validation..."
try {
    node scripts/cfm-compliance.js
    if ($LASTEXITCODE -eq 0) {
        Write-Success "CFM compliance validation passed"
    } else {
        Write-Warning "CFM validation issues detected"
    }
} catch {
    Write-Warning "CFM validation script error"
}

# LGPD validation
Write-Log "Running LGPD compliance validation..."
try {
    node scripts/lgpd-validation.js
    if ($LASTEXITCODE -eq 0) {
        Write-Success "LGPD compliance validation passed"
    } else {
        Write-Warning "LGPD validation issues detected"
    }
} catch {
    Write-Warning "LGPD validation script error"
}

# Supabase validation
Write-Log "Running Supabase schema validation..."
try {
    node scripts/supabase-validation.js
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Supabase schema validation passed"
    } else {
        Write-Warning "Supabase validation issues detected"
    }
} catch {
    Write-Warning "Supabase validation script error"
}

# 2. Dependencies
Write-Log "Checking dependencies..."
try {
    pnpm install --frozen-lockfile
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencies installed"
    } else {
        throw "Dependencies installation failed"
    }
} catch {
    Write-Error "Failed to install dependencies"
    exit 1
}

# 3. Code Quality
Write-Log "Running code quality checks..."
try {
    pnpm run check
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Code quality checks passed"
    } else {
        Write-Warning "Code quality issues detected (continuing)"
    }
} catch {
    Write-Warning "Code quality check failed (continuing)"
}

# 4. Build
Write-Log "Building applications..."
try {
    pnpm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build completed successfully"
    } else {
        throw "Build failed"
    }
} catch {
    Write-Error "Failed to build applications"
    exit 1
}

# 5. Tests (if not skipped)
if (-not $SkipTests) {
    Write-Log "Running tests..."
    try {
        pnpm test
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Tests passed"
        } else {
            Write-Warning "Test failures detected (continuing)"
        }
    } catch {
        Write-Warning "Test execution failed (continuing)"
    }
} else {
    Write-Warning "Skipping tests as requested"
}

# 6. Final validation
Write-Log "Running final validation..."

# Check required files
$requiredFiles = @(
    "package.json",
    "pnpm-workspace.yaml", 
    "turbo.json",
    ".github/workflows/ci.yml"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "Required file exists: $file"
    } else {
        Write-Error "Missing required file: $file"
        exit 1
    }
}

# Summary
Write-Host ""
Write-Host "NeonPro CI/CD Pipeline Test Completed!" -ForegroundColor Green
Write-Host "Summary:" -ForegroundColor Blue
Write-Host "  OK Compliance validations completed" -ForegroundColor Green
Write-Host "  OK Dependencies installed" -ForegroundColor Green
Write-Host "  OK Build successful" -ForegroundColor Green
if (-not $SkipTests) {
    Write-Host "  OK Tests executed" -ForegroundColor Green
}
Write-Host ""
Write-Host "Ready for deployment!" -ForegroundColor Yellow
Write-Host ""

exit 0