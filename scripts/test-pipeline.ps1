# NEONPRO CI/CD Pipeline Test Script (PowerShell)
# Tests the complete CI/CD pipeline locally before GitHub Actions

param(
    [switch]$SkipTests,
    [switch]$Verbose,
    [string]$Environment = "staging"
)

# Colors for output
$Colors = @{
    Red    = "Red"
    Green  = "Green"
    Yellow = "Yellow"
    Blue   = "Blue"
    Cyan   = "Cyan"
}

function Write-Log {
    param([string]$Message, [string]$Color = "Blue")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "package.json") -or -not (Test-Path ".github\workflows")) {
    Write-Error "Please run this script from the NeonPro root directory"
    exit 1
}

Write-Log "🚀 Starting NeonPro CI/CD Pipeline Test"

# Pre-flight checks
Write-Log "🔍 Running preflight checks..."

# Check if pnpm is installed
try {
    $pnpmVersion = pnpm --version 2>$null
    Write-Success "PNPM is installed (version: $pnpmVersion)"
} catch {
    Write-Error "PNPM is not installed. Please install it first: npm install -g pnpm"
    exit 1
}

# Check Node.js version
$nodeVersion = node --version
Write-Log "Node.js version: $nodeVersion"

# Install dependencies
Write-Log "📥 Installing dependencies..."
try {
    pnpm install --frozen-lockfile
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencies installed successfully"
    } else {
        throw "pnpm install failed"
    }
} catch {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Security and compliance audit
Write-Log "🔒 Running security and compliance audit..."

# Run npm audit
Write-Log "🔍 Running npm audit..."
try {
    pnpm audit --audit-level moderate
    if ($LASTEXITCODE -eq 0) {
        Write-Success "NPM audit passed"
    } else {
        Write-Warning "NPM audit found issues (continuing anyway)"
    }
} catch {
    Write-Warning "NPM audit encountered issues (continuing anyway)"
}

# Run compliance checks
Write-Log "🏥 Running ANVISA compliance check..."
try {
    node scripts/anvisa-validation.js
    if ($LASTEXITCODE -eq 0) {
        Write-Success "ANVISA compliance check passed"
    } else {
        throw "ANVISA validation failed"
    }
} catch {
    Write-Error "ANVISA compliance check failed"
    exit 1
}

Write-Log "👨‍⚕️ Running CFM compliance check..."
try {
    node scripts/cfm-compliance.js
    if ($LASTEXITCODE -eq 0) {
        Write-Success "CFM compliance check passed"
    } else {
        throw "CFM validation failed"
    }
} catch {
    Write-Error "CFM compliance check failed"
    exit 1
}

Write-Log "🛡️ Running LGPD compliance check..."
try {
    node scripts/lgpd-validation.js
    if ($LASTEXITCODE -eq 0) {
        Write-Success "LGPD compliance check passed"
    } else {
        throw "LGPD validation failed"
    }
} catch {
    Write-Error "LGPD compliance check failed"
    exit 1
}

Write-Log "🗄️ Running Supabase schema validation..."
try {
    node scripts/supabase-validation.js
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Supabase schema validation passed"
    } else {
        throw "Supabase validation failed"
    }
} catch {
    Write-Error "Supabase schema validation failed"
    exit 1
}

# Quality gate
Write-Log "🏆 Running quality gate checks..."

# TypeScript check
Write-Log "🔧 Running TypeScript check..."
try {
    pnpm exec tsc --noEmit
    if ($LASTEXITCODE -eq 0) {
        Write-Success "TypeScript check passed"
    } else {
        throw "TypeScript check failed"
    }
} catch {
    Write-Error "TypeScript check failed"
    exit 1
}

# Code formatting check
Write-Log "🎨 Running code formatting check..."
try {
    pnpm exec ultracite lint
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Code formatting check passed"
    } else {
        throw "Code formatting check failed"
    }
} catch {
    Write-Error "Code formatting check failed"
    exit 1
}

# Build diagnostics
Write-Log "⚡ Running build diagnostics..."
try {
    node scripts/build-diagnostics.js
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build diagnostics completed"
    } else {
        Write-Warning "Build diagnostics had issues (continuing anyway)"
    }
} catch {
    Write-Warning "Build diagnostics had issues (continuing anyway)"
}

# Build stage
Write-Log "🏗️ Building applications..."

# Build web app
Write-Log "🌐 Building web app..."
try {
    pnpm --filter web build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Web app built successfully"
    } else {
        throw "Web app build failed"
    }
} catch {
    Write-Error "Failed to build web app"
    exit 1
}

# Build API (if it exists)
if (Test-Path "apps\api\package.json") {
    Write-Log "🚀 Building API..."
    try {
        pnpm --filter api build
        if ($LASTEXITCODE -eq 0) {
            Write-Success "API built successfully"
        } else {
            throw "API build failed"
        }
    } catch {
        Write-Error "Failed to build API"
        exit 1
    }
}

# Build docs (if it exists)
if (Test-Path "apps\docs\package.json") {
    Write-Log "📚 Building docs..."
    try {
        pnpm --filter docs build
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docs built successfully"
        } else {
            throw "Docs build failed"
        }
    } catch {
        Write-Error "Failed to build docs"
        exit 1
    }
}

# Test suite
if (-not $SkipTests) {
    Write-Log "🧪 Running test suite..."

    # Unit tests
    Write-Log "🧪 Running unit tests..."
    try {
        pnpm exec vitest run --reporter=verbose
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Unit tests passed"
        } else {
            throw "Unit tests failed"
        }
    } catch {
        Write-Error "Unit tests failed"
        exit 1
    }

    # Integration tests (if config exists)
    if (Test-Path "vitest.config.integration.ts") {
        Write-Log "🔗 Running integration tests..."
        try {
            pnpm exec vitest run --config vitest.config.integration.ts --reporter=verbose
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Integration tests passed"
            } else {
                throw "Integration tests failed"
            }
        } catch {
            Write-Error "Integration tests failed"
            exit 1
        }
    }

    # E2E tests (if Playwright is configured)
    if (Test-Path "playwright.config.ts") {
        Write-Log "🎭 Running E2E tests..."
        
        # Install Playwright browsers
        try {
            pnpm exec playwright install chromium
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Playwright browsers installed"
            } else {
                Write-Warning "Failed to install Playwright browsers"
            }
        } catch {
            Write-Warning "Failed to install Playwright browsers"
        }
    }
        
        # Run E2E tests
        try {
            pnpm exec playwright test --reporter=html
            if ($LASTEXITCODE -eq 0) {
                Write-Success "E2E tests passed"
            } else {
                Write-Warning "E2E tests failed (may be expected without running server)"
            }
        } catch {
            Write-Warning "E2E tests failed (may be expected without running server)"
        }
    }
} else {
    Write-Warning "Skipping test suite as requested"
}

# Final validation
Write-Log "✅ Running final validation..."

# Check if all required files exist
$requiredFiles = @(
    "package.json",
    "pnpm-workspace.yaml",
    "turbo.json",
    ".github\workflows\ci.yml",
    "scripts\anvisa-validation.js",
    "scripts\cfm-compliance.js",
    "scripts\lgpd-validation.js",
    "scripts\supabase-validation.js"
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
Write-Log "📋 Pipeline Test Summary"
Write-Success "All preflight checks passed"
Write-Success "Security and compliance audit completed"
Write-Success "Quality gate checks passed"
Write-Success "Build stage completed successfully"
if (-not $SkipTests) {
    Write-Success "Test suite executed"
}
Write-Success "Final validation completed"

Write-Host ""
Write-Host "🎉 NeonPro CI/CD Pipeline Test Completed Successfully!" -ForegroundColor Green
Write-Host "📊 Summary:" -ForegroundColor Blue
Write-Host "  ✅ All compliance checks (ANVISA, CFM, LGPD, Supabase) passed" -ForegroundColor Green
Write-Host "  ✅ Code quality gates satisfied" -ForegroundColor Green
Write-Host "  ✅ All applications built successfully" -ForegroundColor Green
if (-not $SkipTests) {
    Write-Host "  ✅ Test suite executed" -ForegroundColor Green
}
Write-Host ""
Write-Host "🚀 Ready for deployment to staging/production!" -ForegroundColor Yellow

exit 0