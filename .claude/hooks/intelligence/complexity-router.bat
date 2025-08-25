@echo off
REM ===================================================================
REM COMPLEXITY ROUTER - FIXED VERSION (No Infinite Loop)
REM Routes operations to appropriate MCP chains and quality standards
REM ===================================================================

setlocal EnableDelayedExpansion
set "HOOK_NAME=complexity-router"
set "PROJECT_ROOT=%~dp0..\..\.."

echo [%HOOK_NAME%] Starting intelligent complexity routing...

REM ===================================================================
REM LOAD CONTEXT FROM DETECTOR
REM ===================================================================

set "CACHE_DIR=%PROJECT_ROOT%\.claude\.cache"
set "CONTEXT_FILE=%CACHE_DIR%\context.tmp"

if not exist "%CACHE_DIR%" mkdir "%CACHE_DIR%"

if not exist "%CONTEXT_FILE%" (
    echo [%time%] [WARNING] [%HOOK_NAME%] No context cache found, using defaults
    set "COMPLEXITY_LEVEL=L3-L4"
    set "COMPLEXITY_SCORE=4"
    set "QUALITY_TARGET=9.2"
    goto :route_complexity
)

REM Load context variables safely
for /f "tokens=1,2 delims==" %%a in ('type "%CONTEXT_FILE%" 2^>nul') do (
    set "%%a=%%b"
)

echo [%time%] [INFO] [%HOOK_NAME%] Loaded context: !COMPLEXITY_LEVEL! (Score: !COMPLEXITY_SCORE!, Quality: !QUALITY_TARGET!)

REM ===================================================================
REM SIMPLE ROUTING LOGIC (FIXED)
REM ===================================================================

:route_complexity
echo [%time%] [INFO] [%HOOK_NAME%] Routing based on complexity level: !COMPLEXITY_LEVEL!

REM Simple routing without recursive calls
if "!COMPLEXITY_LEVEL!"=="L1-L2" (
    set "MCP_CHAIN=desktop-commander"
    set "THINKING_LEVEL=basic"
    set "VALIDATION_LEVEL=basic"
) else if "!COMPLEXITY_LEVEL!"=="L3-L4" (
    set "MCP_CHAIN=context7,desktop-commander"
    set "THINKING_LEVEL=standard"
    set "VALIDATION_LEVEL=enhanced"
) else if "!COMPLEXITY_LEVEL!"=="L5-L6" (
    set "MCP_CHAIN=context7,tavily,sequential-thinking,desktop-commander"
    set "THINKING_LEVEL=deep"
    set "VALIDATION_LEVEL=comprehensive"
) else if "!COMPLEXITY_LEVEL!"=="L7-L8" (
    set "MCP_CHAIN=context7,tavily,exa,sequential-thinking,desktop-commander"
    set "THINKING_LEVEL=ultra"
    set "VALIDATION_LEVEL=enterprise"
) else if "!COMPLEXITY_LEVEL!"=="L9-L10" (
    set "MCP_CHAIN=context7,tavily,exa,sequential-thinking,supabase-mcp,desktop-commander"
    set "THINKING_LEVEL=ultra"
    set "VALIDATION_LEVEL=critical"
) else (
    echo [%time%] [WARNING] [%HOOK_NAME%] Unknown complexity level, defaulting to L3-L4
    set "MCP_CHAIN=context7,desktop-commander"
    set "THINKING_LEVEL=standard"
    set "VALIDATION_LEVEL=enhanced"
    set "COMPLEXITY_LEVEL=L3-L4"
)

REM ===================================================================
REM QUALITY GATES SETUP (SIMPLIFIED)
REM ===================================================================

echo [%time%] [INFO] [%HOOK_NAME%] Setting up quality gates for !QUALITY_TARGET!/10

if "!QUALITY_TARGET!" geq "9.5" (
    set "LINT_STRICT=true"
    set "TYPE_CHECKING=strict"
    set "TEST_COVERAGE=90"
    set "SECURITY_SCAN=comprehensive"
    set "PERFORMANCE_BUDGET=strict"
) else if "!QUALITY_TARGET!" geq "9.2" (
    set "LINT_STRICT=true"
    set "TYPE_CHECKING=standard"
    set "TEST_COVERAGE=80"
    set "SECURITY_SCAN=standard"
    set "PERFORMANCE_BUDGET=moderate"
) else (
    set "LINT_STRICT=false"
    set "TYPE_CHECKING=basic"
    set "TEST_COVERAGE=70"
    set "SECURITY_SCAN=basic"
    set "PERFORMANCE_BUDGET=relaxed"
)

echo [%time%] [INFO] [%HOOK_NAME%] Code quality gates: Lint=!LINT_STRICT!, Types=!TYPE_CHECKING!, Coverage=!TEST_COVERAGE!
echo [%time%] [INFO] [%HOOK_NAME%] Security gates: Scan=!SECURITY_SCAN!, Tolerance=medium
echo [%time%] [INFO] [%HOOK_NAME%] Performance gates: Budget=!PERFORMANCE_BUDGET!, Bundle=500kb
echo [%time%] [INFO] [%HOOK_NAME%] Documentation gates: Level=basic, API=optional

REM ===================================================================
REM SAVE ROUTING CONFIGURATION
REM ===================================================================

set "ROUTING_FILE=%CACHE_DIR%\routing.tmp"

echo MCP_CHAIN=!MCP_CHAIN! > "%ROUTING_FILE%"
echo THINKING_LEVEL=!THINKING_LEVEL! >> "%ROUTING_FILE%"
echo VALIDATION_LEVEL=!VALIDATION_LEVEL! >> "%ROUTING_FILE%"
echo QUALITY_TARGET=!QUALITY_TARGET! >> "%ROUTING_FILE%"
echo COMPLEXITY_LEVEL=!COMPLEXITY_LEVEL! >> "%ROUTING_FILE%"
echo LINT_STRICT=!LINT_STRICT! >> "%ROUTING_FILE%"
echo TYPE_CHECKING=!TYPE_CHECKING! >> "%ROUTING_FILE%"
echo TEST_COVERAGE=!TEST_COVERAGE! >> "%ROUTING_FILE%"
echo SECURITY_SCAN=!SECURITY_SCAN! >> "%ROUTING_FILE%"
echo PERFORMANCE_BUDGET=!PERFORMANCE_BUDGET! >> "%ROUTING_FILE%"

REM Create routing summary
echo [%time%] Routing Summary: > "%CACHE_DIR%\routing-summary.log"
echo   Complexity: !COMPLEXITY_LEVEL! (Score: !COMPLEXITY_SCORE!) >> "%CACHE_DIR%\routing-summary.log"
echo   MCP Chain: !MCP_CHAIN! >> "%CACHE_DIR%\routing-summary.log"
echo   Quality Target: !QUALITY_TARGET!/10 >> "%CACHE_DIR%\routing-summary.log"
echo   Thinking Level: !THINKING_LEVEL! >> "%CACHE_DIR%\routing-summary.log"
echo   Validation: !VALIDATION_LEVEL! >> "%CACHE_DIR%\routing-summary.log"

echo [%time%] [SUCCESS] [%HOOK_NAME%] Complexity routing completed
echo [%time%] [INFO] [%HOOK_NAME%] Route: !COMPLEXITY_LEVEL! -> !MCP_CHAIN! (Quality: !QUALITY_TARGET!/10)

exit /b 0