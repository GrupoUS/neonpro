@echo off
REM ===================================================================
REM CONTEXT DETECTOR - Core Intelligence Hook
REM Universal project context detection and automatic command activation
REM ===================================================================

setlocal EnableDelayedExpansion
set "HOOK_NAME=context-detector"
set "PROJECT_ROOT=%~dp0..\..\.."

REM Source common utilities
call "%~dp0..\hook-commons.sh" 2>nul || call "%PROJECT_ROOT%\.claude\hooks\hook-commons.sh"

echo [%HOOK_NAME%] Starting intelligent context detection...

REM ===================================================================
REM PROJECT CONTEXT DETECTION ENGINE
REM ===================================================================

:detect_project_type
call :log_info "Detecting project type and structure..."

REM Check for package.json (Node.js ecosystem)
if exist "%PROJECT_ROOT%\package.json" (
    set "PROJECT_TYPE=nodejs"
    call :detect_nodejs_framework
    goto :complexity_assessment
)

REM Check for requirements.txt or pyproject.toml (Python)
if exist "%PROJECT_ROOT%\requirements.txt" (
    set "PROJECT_TYPE=python"
    call :detect_python_framework
    goto :complexity_assessment
)

if exist "%PROJECT_ROOT%\pyproject.toml" (
    set "PROJECT_TYPE=python"
    call :detect_python_framework
    goto :complexity_assessment
)

REM Check for pom.xml (Java/Maven)
if exist "%PROJECT_ROOT%\pom.xml" (
    set "PROJECT_TYPE=java"
    set "FRAMEWORK=maven"
    goto :complexity_assessment
)

REM Check for Cargo.toml (Rust)
if exist "%PROJECT_ROOT%\Cargo.toml" (
    set "PROJECT_TYPE=rust"
    set "FRAMEWORK=cargo"
    goto :complexity_assessment
)

REM Check for composer.json (PHP)
if exist "%PROJECT_ROOT%\composer.json" (
    set "PROJECT_TYPE=php"
    call :detect_php_framework
    goto :complexity_assessment
)

REM Default to generic project
set "PROJECT_TYPE=generic"
set "FRAMEWORK=unknown"

goto :complexity_assessment

REM ===================================================================
REM FRAMEWORK DETECTION FUNCTIONS
REM ===================================================================

:detect_nodejs_framework
call :log_info "Analyzing Node.js project structure..."

REM Check for Next.js
if exist "%PROJECT_ROOT%\next.config.js" (
    set "FRAMEWORK=nextjs"
    exit /b
)
if exist "%PROJECT_ROOT%\next.config.ts" (
    set "FRAMEWORK=nextjs"
    exit /b
)

REM Check for React
findstr /i "react" "%PROJECT_ROOT%\package.json" >nul 2>&1
if !errorlevel! equ 0 (
    set "FRAMEWORK=react"
    exit /b
)

REM Check for Vue
findstr /i "vue" "%PROJECT_ROOT%\package.json" >nul 2>&1
if !errorlevel! equ 0 (
    set "FRAMEWORK=vue"
    exit /b
)

REM Check for Express/Node backend
findstr /i "express" "%PROJECT_ROOT%\package.json" >nul 2>&1
if !errorlevel! equ 0 (
    set "FRAMEWORK=express"
    exit /b
)

REM Default Node.js
set "FRAMEWORK=nodejs"
exit /b

:detect_python_framework
call :log_info "Analyzing Python project structure..."

REM Check for Django
if exist "%PROJECT_ROOT%\manage.py" (
    set "FRAMEWORK=django"
    exit /b
)

REM Check for Flask
findstr /i "flask" "%PROJECT_ROOT%\requirements.txt" >nul 2>&1
if !errorlevel! equ 0 (
    set "FRAMEWORK=flask"
    exit /b
)

REM Check for FastAPI
findstr /i "fastapi" "%PROJECT_ROOT%\requirements.txt" >nul 2>&1
if !errorlevel! equ 0 (
    set "FRAMEWORK=fastapi"
    exit /b
)

REM Default Python
set "FRAMEWORK=python"
exit /b

:detect_php_framework
call :log_info "Analyzing PHP project structure..."

REM Check for Laravel
if exist "%PROJECT_ROOT%\artisan" (
    set "FRAMEWORK=laravel"
    exit /b
)

REM Default PHP
set "FRAMEWORK=php"
exit /b

REM ===================================================================
REM COMPLEXITY ASSESSMENT ENGINE (L1-L10)
REM ===================================================================

:complexity_assessment
call :log_info "Assessing project complexity..."

set /a COMPLEXITY_SCORE=1
set "COMPLEXITY_FACTORS="

REM Factor 1: Project size and structure
REM Simplified assessment - avoid complex parsing
set /a COMPLEXITY_SCORE+=2
set "COMPLEXITY_FACTORS=monorepo healthcare-project"

REM Factor 2: Dependencies complexity
if exist "%PROJECT_ROOT%\node_modules" (
    set /a COMPLEXITY_SCORE+=1
    set "COMPLEXITY_FACTORS=!COMPLEXITY_FACTORS! dependencies"
)

REM Factor 3: Architecture patterns
if exist "%PROJECT_ROOT%\apps" (
    set /a COMPLEXITY_SCORE+=2
    set "COMPLEXITY_FACTORS=!COMPLEXITY_FACTORS! monorepo"
)

REM Factor 4: Technology stack complexity
if exist "%PROJECT_ROOT%\tsconfig.json" (
    set /a COMPLEXITY_SCORE+=1
    set "COMPLEXITY_FACTORS=!COMPLEXITY_FACTORS! typescript"
)

REM Determine complexity level
if !COMPLEXITY_SCORE! leq 3 (
    set "COMPLEXITY_LEVEL=L1-L2"
    set "QUALITY_TARGET=9.0"
) else if !COMPLEXITY_SCORE! leq 5 (
    set "COMPLEXITY_LEVEL=L3-L4" 
    set "QUALITY_TARGET=9.2"
) else if !COMPLEXITY_SCORE! leq 7 (
    set "COMPLEXITY_LEVEL=L5-L6"
    set "QUALITY_TARGET=9.5"
) else if !COMPLEXITY_SCORE! leq 8 (
    set "COMPLEXITY_LEVEL=L7-L8"
    set "QUALITY_TARGET=9.7"
) else (
    set "COMPLEXITY_LEVEL=L9-L10"
    set "QUALITY_TARGET=9.9"
)

call :log_info "Detected complexity: !COMPLEXITY_LEVEL! (Score: !COMPLEXITY_SCORE!/10, Quality: !QUALITY_TARGET!/10)"

goto :context_analysis

REM ===================================================================
REM COMPLEXITY ASSESSMENT FUNCTIONS
REM ===================================================================

:assess_dependencies
REM Check dependency count and complexity
if "%PROJECT_TYPE%"=="nodejs" (
    if exist "%PROJECT_ROOT%\package.json" (
        findstr /c:"\"dependencies\":" "%PROJECT_ROOT%\package.json" >nul 2>&1
        if !errorlevel! equ 0 (
            set /a COMPLEXITY_SCORE+=1
            set "COMPLEXITY_FACTORS=!COMPLEXITY_FACTORS! dependencies"
        )
    )
)

if exist "%PROJECT_ROOT%\node_modules" (
    set /a COMPLEXITY_SCORE+=1
    set "COMPLEXITY_FACTORS=!COMPLEXITY_FACTORS! node-modules"
)
exit /b

:assess_architecture
REM Check for architectural patterns
if exist "%PROJECT_ROOT%\apps" (
    set /a COMPLEXITY_SCORE+=2
    set "COMPLEXITY_FACTORS=!COMPLEXITY_FACTORS! monorepo"
)

if exist "%PROJECT_ROOT%\packages" (
    set /a COMPLEXITY_SCORE+=2  
    set "COMPLEXITY_FACTORS=!COMPLEXITY_FACTORS! multi-package"
)

if exist "%PROJECT_ROOT%\docker-compose.yml" (
    set /a COMPLEXITY_SCORE+=1
    set "COMPLEXITY_FACTORS=!COMPLEXITY_FACTORS! containerized"
)

if exist "%PROJECT_ROOT%\.github\workflows" (
    set /a COMPLEXITY_SCORE+=1
    set "COMPLEXITY_FACTORS=!COMPLEXITY_FACTORS! ci-cd"
)
exit /b

:assess_technology_stack
REM Assess framework complexity
if "%FRAMEWORK%"=="nextjs" (
    set /a COMPLEXITY_SCORE+=2
    set "COMPLEXITY_FACTORS=!COMPLEXITY_FACTORS! nextjs-framework"
) else if "%FRAMEWORK%"=="react" (
    set /a COMPLEXITY_SCORE+=1
    set "COMPLEXITY_FACTORS=!COMPLEXITY_FACTORS! react-framework"
)

REM Check for TypeScript
if exist "%PROJECT_ROOT%\tsconfig.json" (
    set /a COMPLEXITY_SCORE+=1
    set "COMPLEXITY_FACTORS=!COMPLEXITY_FACTORS! typescript"
)
exit /b

REM ===================================================================
REM CONTEXT ANALYSIS & COMMAND ACTIVATION
REM ===================================================================

:context_analysis
call :log_info "Analyzing current development context..."

set "ACTIVE_COMMANDS="
set "SUGGESTED_COMMANDS="

REM Check recent git activity
call :check_git_context

REM Check file changes
call :check_file_changes

REM Check for common development scenarios
call :check_development_scenarios

REM Check for healthcare testing scenarios
call :check_healthcare_testing_scenarios

goto :activate_commands

:check_git_context
REM Analyze git status and recent commits
git status --porcelain >nul 2>&1
if !errorlevel! equ 0 (
    REM Check for new branch
    for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"
    
    if "!CURRENT_BRANCH!"=="main" (
        set "ACTIVE_COMMANDS=!ACTIVE_COMMANDS! /dev/deploy"
    ) else if "!CURRENT_BRANCH!"=="develop" (
        set "ACTIVE_COMMANDS=!ACTIVE_COMMANDS! /dev/feature"
    ) else (
        echo !CURRENT_BRANCH! | findstr /i "feature" >nul
        if !errorlevel! equ 0 (
            set "ACTIVE_COMMANDS=!ACTIVE_COMMANDS! /dev/feature"
        )
        
        echo !CURRENT_BRANCH! | findstr /i "fix" >nul
        if !errorlevel! equ 0 (
            set "ACTIVE_COMMANDS=!ACTIVE_COMMANDS! /dev/debug"
        )
    )
)
exit /b

:check_file_changes
REM Check for specific file patterns that indicate context
if exist "%PROJECT_ROOT%\error.log" (
    set "ACTIVE_COMMANDS=!ACTIVE_COMMANDS! /dev/debug"
)

if exist "%PROJECT_ROOT%\test" (
    set "SUGGESTED_COMMANDS=!SUGGESTED_COMMANDS! /validate-quality"
)

if exist "%PROJECT_ROOT%\next.config.js" (
    set "SUGGESTED_COMMANDS=!SUGGESTED_COMMANDS! /audit-architecture"
)
exit /b

:check_development_scenarios
REM Check for common development scenarios

REM New project initialization
if not exist "%PROJECT_ROOT%\README.md" (
    if not exist "%PROJECT_ROOT%\.git" (
        set "ACTIVE_COMMANDS=!ACTIVE_COMMANDS! /dev/init-project"
    )
)

REM Package manager changes
if exist "%PROJECT_ROOT%\package-lock.json.bak" (
    set "SUGGESTED_COMMANDS=!SUGGESTED_COMMANDS! /validate-quality"
)

REM Performance issues (large bundles, slow builds)
if exist "%PROJECT_ROOT%\build" (
    for %%f in ("%PROJECT_ROOT%\build\*") do (
        if %%~zf gtr 10485760 (
            set "SUGGESTED_COMMANDS=!SUGGESTED_COMMANDS! /qa/performance-test"
        )
    )
)
exit /b

:check_healthcare_testing_scenarios
REM NeonPro Healthcare Testing Context Detection
call :log_info "Analyzing healthcare testing context..."

REM Check for test-related file changes
git diff --name-only HEAD~1 2>nul | findstr /i "test\|spec" >nul
if !errorlevel! equ 0 (
    set "SUGGESTED_COMMANDS=!SUGGESTED_COMMANDS! /test"
)

REM Check for healthcare-specific changes
git diff --name-only HEAD~1 2>nul | findstr /i "patient\|lgpd\|anvisa\|cfm\|healthcare\|clinic\|medical" >nul
if !errorlevel! equ 0 (
    set "ACTIVE_COMMANDS=!ACTIVE_COMMANDS! /qa/healthcare-compliance"
    set "SUGGESTED_COMMANDS=!SUGGESTED_COMMANDS! /qa/patient-data-security"
)

REM Check for UI/component changes (trigger E2E testing)
git diff --name-only HEAD~1 2>nul | findstr /i "component\|page\|layout\|portal" >nul
if !errorlevel! equ 0 (
    set "SUGGESTED_COMMANDS=!SUGGESTED_COMMANDS! /qa/playwright-e2e-healthcare"
)

REM Check for code quality issues (trigger Biome check)
git diff --name-only HEAD~1 2>nul | findstr /i "\.ts\|\.tsx\|\.js\|\.jsx" >nul
if !errorlevel! equ 0 (
    set "SUGGESTED_COMMANDS=!SUGGESTED_COMMANDS! /qa/biome-quality-check"
)

REM Check for database/API changes (trigger integration testing)
git diff --name-only HEAD~1 2>nul | findstr /i "api\|route\|schema\|migration\|supabase" >nul
if !errorlevel! equ 0 (
    set "ACTIVE_COMMANDS=!ACTIVE_COMMANDS! /dev/test"
    set "SUGGESTED_COMMANDS=!SUGGESTED_COMMANDS! /qa/patient-data-security"
)

REM Check for compliance-specific file patterns
if exist "%PROJECT_ROOT%\test\compliance\" (
    set "ACTIVE_COMMANDS=!ACTIVE_COMMANDS! /qa/healthcare-compliance"
)

if exist "%PROJECT_ROOT%\tools\testing\e2e\" (
    set "SUGGESTED_COMMANDS=!SUGGESTED_COMMANDS! /qa/playwright-e2e-healthcare"
)

REM Check for pre-commit context
if "%CONTEXT_TRIGGER%"=="pre-commit" (
    set "ACTIVE_COMMANDS=!ACTIVE_COMMANDS! /qa/biome-quality-check"
    set "SUGGESTED_COMMANDS=!SUGGESTED_COMMANDS! /dev/test"
)

REM Check for pre-push context
if "%CONTEXT_TRIGGER%"=="pre-push" (
    set "ACTIVE_COMMANDS=!ACTIVE_COMMANDS! /qa/healthcare-compliance"
    set "SUGGESTED_COMMANDS=!SUGGESTED_COMMANDS! /qa/playwright-e2e-healthcare"
)

call :log_info "Healthcare testing context analysis completed"
exit /b

REM ===================================================================
REM COMMAND ACTIVATION ENGINE
REM ===================================================================

:activate_commands
call :log_info "Activating intelligent commands..."

if not "%ACTIVE_COMMANDS%"=="" (
    call :log_success "Auto-activating commands: !ACTIVE_COMMANDS!"
    
    for %%c in (!ACTIVE_COMMANDS!) do (
        call :activate_command "%%c"
    )
)

if not "%SUGGESTED_COMMANDS%"=="" (
    call :log_info "Suggested commands available: !SUGGESTED_COMMANDS!"
)

REM Save context for other hooks - simplified for stability
set "CACHE_DIR=%PROJECT_ROOT%\.claude\.cache"
if not exist "%CACHE_DIR%" mkdir "%CACHE_DIR%"
echo COMPLEXITY_LEVEL=!COMPLEXITY_LEVEL! > "%CACHE_DIR%\context.tmp"

goto :end

:activate_command
set "COMMAND=%~1"
call :log_info "Activating command: !COMMAND!"

REM Check if command exists - fix path construction
set "COMMAND_FILE=%PROJECT_ROOT%\.claude\commands!COMMAND!.md"
if exist "!COMMAND_FILE!" (
    call :log_success "Command !COMMAND! is available"
    REM Mark as activated in context
    echo !COMMAND! >> "%PROJECT_ROOT%\.claude\.cache\active_commands.tmp"
) else (
    call :log_warning "Command !COMMAND! not found at !COMMAND_FILE!"
)
exit /b

REM ===================================================================
REM UTILITY FUNCTIONS
REM ===================================================================

:log_info
echo [%time%] [INFO] [%HOOK_NAME%] %~1
exit /b

:log_success
echo [%time%] [SUCCESS] [%HOOK_NAME%] %~1
exit /b

:log_warning
echo [%time%] [WARNING] [%HOOK_NAME%] %~1
exit /b

:log_error
echo [%time%] [ERROR] [%HOOK_NAME%] %~1
exit /b

:end
call :log_success "Context detection completed"
call :log_info "Project: !PROJECT_TYPE!/!FRAMEWORK!"

exit /b 0