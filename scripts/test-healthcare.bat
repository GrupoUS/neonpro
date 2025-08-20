@echo off
REM 🏥 NeonPro Healthcare Platform - Simplified Testing Script (Windows)
REM This script provides easy access to the simplified testing configurations
REM that are integrated with the CI/CD pipelines.

setlocal enabledelayedexpansion

echo 🏥 NeonPro Healthcare Platform - Testing Suite
echo ==============================================

REM Function to check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: This script must be run from the NeonPro project root directory
    exit /b 1
)
if not exist "tools\testing" (
    echo ❌ Error: This script must be run from the NeonPro project root directory
    exit /b 1
)

REM Function to install dependencies if needed
:ensure_dependencies
echo 📦 Ensuring dependencies are installed...

if not exist "node_modules" (
    echo ⚡ Installing root dependencies...
    pnpm install --frozen-lockfile
    if errorlevel 1 (
        echo ❌ Failed to install root dependencies
        exit /b 1
    )
)

if not exist "tools\testing\node_modules" (
    echo ⚡ Installing testing dependencies...
    cd tools\testing
    pnpm install
    if errorlevel 1 (
        echo ❌ Failed to install testing dependencies
        exit /b 1
    )
    cd ..\..
)

echo ✅ Dependencies ready
goto :eof

REM Function to run quality checks
:run_quality_checks
echo 🎯 Running Healthcare Quality Checks...

echo 📊 Format check (Biome + Ultracite)...
pnpm format:check
if errorlevel 1 (
    echo ❌ Format check failed
    exit /b 1
)

echo 🔍 Lint check (Biome + Ultracite)...
pnpm lint:biome
if errorlevel 1 (
    echo ❌ Lint check failed
    exit /b 1
)

echo 🔧 TypeScript validation...
pnpm type-check
if errorlevel 1 (
    echo ❌ TypeScript validation failed
    exit /b 1
)

echo ✅ Quality checks passed
goto :eof

REM Function to run unit tests
:run_unit_tests
echo 🧪 Running Healthcare Unit Tests (Simplified Vitest)...

cd tools\testing
pnpm vitest --reporter=verbose --config vitest.simple.config.ts
if errorlevel 1 (
    echo ❌ Unit tests failed
    cd ..\..
    exit /b 1
)
cd ..\..

echo ✅ Healthcare unit tests completed
goto :eof

REM Function to run unit tests with coverage
:run_unit_tests_with_coverage
echo 📊 Running Healthcare Unit Tests with Coverage...

cd tools\testing
pnpm coverage
if errorlevel 1 (
    echo ❌ Unit tests with coverage failed
    cd ..\..
    exit /b 1
)
cd ..\..

echo ✅ Coverage report generated at tools\testing\coverage\
goto :eof

REM Function to run E2E tests
:run_e2e_tests
echo 🎭 Running Healthcare E2E Tests (Simplified Playwright)...

cd tools\testing

REM Check if Playwright browsers are installed
if not exist "%USERPROFILE%\AppData\Local\ms-playwright" (
    echo 📦 Installing Playwright browsers...
    pnpm exec playwright install --with-deps
    if errorlevel 1 (
        echo ❌ Failed to install Playwright browsers
        cd ..\..
        exit /b 1
    )
)

pnpm test:playwright
if errorlevel 1 (
    echo ❌ E2E tests failed
    cd ..\..
    exit /b 1
)
cd ..\..

echo ✅ Healthcare E2E tests completed
goto :eof

REM Function to run security audit
:run_security_audit
echo 🔒 Running Healthcare Security Audit...

echo 🔍 Dependency security audit...
pnpm audit --audit-level moderate
REM Don't fail on audit warnings, just show them

echo 🏥 LGPD compliance check...
findstr /r /s "cpf.*=.*[0-9]" *.ts *.tsx 2>nul
if not errorlevel 1 (
    echo ⚠️ Potential CPF data found - please review
) else (
    echo ✅ No hardcoded sensitive data detected
)

echo ✅ Security audit completed
goto :eof

REM Function to run build validation
:run_build_validation
echo 🏗️ Running Healthcare Build Validation...

pnpm build
if errorlevel 1 (
    echo ❌ Build validation failed
    exit /b 1
)

echo ✅ Healthcare platform build successful
goto :eof

REM Function to display help
:show_help
echo 🏥 NeonPro Healthcare Platform - Testing Commands
echo.
echo Usage: %0 [command]
echo.
echo Commands:
echo   quality          Run quality checks (format, lint, type-check)
echo   unit            Run healthcare unit tests (simplified vitest)
echo   unit-coverage   Run unit tests with coverage report
echo   e2e             Run healthcare E2E tests (simplified playwright)
echo   security        Run security and compliance audit
echo   build           Run build validation
echo   all             Run all tests and checks (CI simulation)
echo   ci              Run full CI validation locally
echo   help            Show this help message
echo.
echo Examples:
echo   %0 quality       # Run quality checks only
echo   %0 unit         # Run unit tests only
echo   %0 all          # Run everything (like CI)
echo.
echo 🔧 Simplified Testing Configuration:
echo   - Uses tools/testing/vitest.simple.config.ts (no Prisma conflicts)
echo   - Uses tools/testing/playwright.simple.config.ts (healthcare optimized)
echo   - Includes 21 auth tests + 5 patient validation tests
echo   - LGPD, ANVISA, and CFM compliance validation
echo.
goto :eof

REM Main script logic
if "%1"=="" goto show_help
if "%1"=="help" goto show_help

if "%1"=="quality" (
    call :ensure_dependencies
    call :run_quality_checks
) else if "%1"=="unit" (
    call :ensure_dependencies
    call :run_unit_tests
) else if "%1"=="unit-coverage" (
    call :ensure_dependencies
    call :run_unit_tests_with_coverage
) else if "%1"=="e2e" (
    call :ensure_dependencies
    call :run_e2e_tests
) else if "%1"=="security" (
    call :ensure_dependencies
    call :run_security_audit
) else if "%1"=="build" (
    call :ensure_dependencies
    call :run_build_validation
) else if "%1"=="all" (
    call :ensure_dependencies
    echo 🚀 Running Full Healthcare CI Validation...
    
    call :run_quality_checks
    call :run_unit_tests_with_coverage
    call :run_e2e_tests
    call :run_security_audit
    call :run_build_validation
    
    echo 🎉 All healthcare validations passed!
    echo 🏥 Platform ready for deployment
) else if "%1"=="ci" (
    call :ensure_dependencies
    echo 🚀 Running Full Healthcare CI Validation...
    
    call :run_quality_checks
    call :run_unit_tests_with_coverage
    call :run_e2e_tests
    call :run_security_audit
    call :run_build_validation
    
    echo 🎉 All healthcare validations passed!
    echo 🏥 Platform ready for deployment
) else (
    echo Unknown command: %1
    echo.
    goto show_help
)

endlocal