# CI/CD Test Automation Script for Windows PowerShell
# Executes comprehensive test suite with quality gates

param(
    [int]$CoverageThreshold = 80,
    [int]$MaxRetries = 3,
    [int]$TestTimeout = 300,
    [switch]$SkipE2E,
    [switch]$Verbose
)

# Error handling
$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    $originalColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Output $Message
    $Host.UI.RawUI.ForegroundColor = $originalColor
}

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput "[$timestamp] $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "[SUCCESS] $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "[WARNING] $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" "Red"
}

# Check if pnpm is available
function Test-PnpmAvailable {
    try {
        pnpm --version | Out-Null
        return $true
    }
    catch {
        Write-Error "pnpm is not installed. Please install pnpm first."
        exit 1
    }
}

# Execute command with timeout
function Invoke-CommandWithTimeout {
    param(
        [string]$Command,
        [int]$TimeoutSeconds = 300
    )
    
    $job = Start-Job -ScriptBlock {
        param($cmd)
        Invoke-Expression $cmd
    } -ArgumentList $Command
    
    if (Wait-Job $job -Timeout $TimeoutSeconds) {
        $result = Receive-Job $job
        Remove-Job $job
        return $result
    }
    else {
        Remove-Job $job -Force
        throw "Command timed out after $TimeoutSeconds seconds"
    }
}

# Main execution function
function Start-CITestPipeline {
    Write-Log "Starting CI/CD Test Pipeline"
    
    try {
        # Step 1: Check prerequisites
        Test-PnpmAvailable
        
        # Step 2: Install dependencies
        Write-Log "Installing dependencies..."
        pnpm install --frozen-lockfile
        if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed" }
        
        # Step 3: Type checking
        Write-Log "Running TypeScript type checking..."
        pnpm run type-check
        if ($LASTEXITCODE -ne 0) { throw "Type checking failed" }
        Write-Success "Type checking passed"
        
        # Step 4: Linting
        Write-Log "Running OXC Oxlint..."
        pnpm run lint
        if ($LASTEXITCODE -ne 0) { throw "Linting failed" }
        Write-Success "Linting passed"
        
        # Step 5: Code formatting check
        Write-Log "Checking code formatting with Dprint..."
        pnpm run format:check
        if ($LASTEXITCODE -ne 0) { throw "Code formatting check failed" }
        Write-Success "Code formatting check passed"
        
        # Step 6: Unit tests with coverage
        Write-Log "Running unit tests with coverage..."
        pnpm run test:unit:coverage
        if ($LASTEXITCODE -ne 0) { throw "Unit tests failed" }
        
        # Check coverage threshold
        Test-CoverageThreshold
        
        # Step 7: Integration tests
        Write-Log "Running integration tests..."
        pnpm run test:integration
        if ($LASTEXITCODE -ne 0) { throw "Integration tests failed" }
        Write-Success "Integration tests passed"
        
        # Step 8: E2E tests with retries (if not skipped)
        if (-not $SkipE2E) {
            Start-E2ETestsWithRetry
        }
        else {
            Write-Warning "E2E tests skipped"
        }
        
        # Step 9: Build verification
        Write-Log "Running build verification..."
        pnpm run build
        if ($LASTEXITCODE -ne 0) { throw "Build verification failed" }
        Write-Success "Build verification passed"
        
        # Step 10: Generate test reports
        Write-Log "Generating test reports..."
        New-TestReports
        
        Write-Success "All CI/CD checks passed successfully!"
    }
    catch {
        Write-Error "CI/CD Pipeline failed: $($_.Exception.Message)"
        exit 1
    }
}

# Test coverage threshold
function Test-CoverageThreshold {
    $coverageFile = "coverage/coverage-summary.json"
    
    if (Test-Path $coverageFile) {
        $coverage = Get-Content $coverageFile | ConvertFrom-Json
        $actualCoverage = $coverage.total.lines.pct
        
        if ($actualCoverage -lt $CoverageThreshold) {
            throw "Coverage $actualCoverage% is below threshold $CoverageThreshold%"
        }
        
        Write-Success "Coverage $actualCoverage% meets threshold"
        return $actualCoverage
    }
    else {
        Write-Warning "Coverage file not found, skipping coverage check"
        return $null
    }
}

# E2E tests with retry logic
function Start-E2ETestsWithRetry {
    Write-Log "Running E2E tests..."
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        try {
            $job = Start-Job -ScriptBlock {
                pnpm run test:e2e
            }
            
            if (Wait-Job $job -Timeout $TestTimeout) {
                $result = Receive-Job $job
                Remove-Job $job
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "E2E tests passed"
                    return
                }
            }
            else {
                Remove-Job $job -Force
                throw "E2E tests timed out"
            }
        }
        catch {
            if ($i -eq $MaxRetries) {
                throw "E2E tests failed after $MaxRetries attempts: $($_.Exception.Message)"
            }
            else {
                Write-Warning "E2E tests failed, retrying... ($i/$MaxRetries)"
                Start-Sleep -Seconds 10
            }
        }
    }
}

# Generate comprehensive test reports
function New-TestReports {
    $reportsDir = "reports"
    
    if (-not (Test-Path $reportsDir)) {
        New-Item -ItemType Directory -Path $reportsDir -Force | Out-Null
    }
    
    # Copy coverage reports
    if (Test-Path "coverage") {
        Copy-Item -Path "coverage" -Destination "$reportsDir/coverage" -Recurse -Force
        Write-Log "Coverage report available at $reportsDir/coverage/index.html"
    }
    
    # Copy Playwright reports
    if (Test-Path "playwright-report") {
        Copy-Item -Path "playwright-report" -Destination "$reportsDir/playwright-report" -Recurse -Force
        Write-Log "Playwright report available at $reportsDir/playwright-report/index.html"
    }
    
    # Copy test results
    if (Test-Path "test-results") {
        Copy-Item -Path "test-results" -Destination "$reportsDir/test-results" -Recurse -Force
    }
    
    # Generate summary report
    $currentBranch = try { git branch --show-current } catch { "unknown" }
    $currentCommit = try { git rev-parse HEAD } catch { "unknown" }
    $coverage = Test-CoverageThreshold
    
    $summaryContent = @"
# Test Execution Summary

**Date:** $(Get-Date)
**Branch:** $currentBranch
**Commit:** $currentCommit
**PowerShell Version:** $($PSVersionTable.PSVersion)

## Test Results

- ✅ Type Checking: Passed
- ✅ Linting: Passed
- ✅ Formatting: Passed
- ✅ Unit Tests: Passed
- ✅ Integration Tests: Passed
$(if (-not $SkipE2E) { "- ✅ E2E Tests: Passed" } else { "- ⏭️ E2E Tests: Skipped" })
- ✅ Build: Passed

## Coverage

Coverage threshold: $CoverageThreshold%
Actual coverage: $(if ($coverage) { "$coverage%" } else { "N/A" })

## Reports

- [Coverage Report](./coverage/index.html)
- [Playwright Report](./playwright-report/index.html)

## Environment

- OS: $($env:OS)
- PowerShell: $($PSVersionTable.PSVersion)
- Node.js: $(node --version)
- pnpm: $(pnpm --version)
"@
    
    $summaryContent | Out-File -FilePath "$reportsDir/summary.md" -Encoding UTF8
    Write-Success "Test summary generated at $reportsDir/summary.md"
}

# Cleanup function
function Stop-BackgroundProcesses {
    Write-Log "Cleaning up background processes..."
    
    # Kill any remaining processes
    Get-Process | Where-Object { $_.ProcessName -like "*vite*" -or $_.ProcessName -like "*playwright*" } | Stop-Process -Force -ErrorAction SilentlyContinue
}

# Main execution
try {
    Start-CITestPipeline
}
finally {
    Stop-BackgroundProcesses
}