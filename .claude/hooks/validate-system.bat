@echo off
REM Simple System Validation for Claude Code Proactive Hooks
REM Tests core functionality without complex parameter handling

echo ========================================
echo Claude Code Proactive Hooks Validation
echo ========================================
echo.

set "VALIDATION_LOG=.claude\hooks\validation-results.log"
echo [%date% %time%] Starting system validation > "%VALIDATION_LOG%"

REM Test 1: File Existence
echo [1/8] Checking file existence...
set "FILES_OK=true"

if not exist ".claude\hooks\hook-commons.bat" (
    echo   ❌ Missing: hook-commons.bat
    set "FILES_OK=false"
) else (
    echo   ✅ Found: hook-commons.bat
)

if not exist ".claude\hooks\subagent-stop.bat" (
    echo   ❌ Missing: subagent-stop.bat
    set "FILES_OK=false"
) else (
    echo   ✅ Found: subagent-stop.bat
)

if not exist ".claude\hooks\post-tool-use.bat" (
    echo   ❌ Missing: post-tool-use.bat
    set "FILES_OK=false"
) else (
    echo   ✅ Found: post-tool-use.bat
)

if not exist ".claude\hooks\hook-config.json" (
    echo   ❌ Missing: hook-config.json
    if exist ".claude\hooks\examples\simple-workflow.json" (
        copy ".claude\hooks\examples\simple-workflow.json" ".claude\hooks\hook-config.json" >nul 2>&1
        echo   ✅ Copied simple-workflow.json as hook-config.json
    ) else (
        echo   ❌ No configuration available
        set "FILES_OK=false"
    )
) else (
    echo   ✅ Found: hook-config.json
)

if "%FILES_OK%"=="true" (
    echo   ✅ All required files present
) else (
    echo   ❌ Some files are missing
)

echo.

REM Test 2: Node.js Availability
echo [2/8] Checking Node.js availability...
where node >nul 2>&1
if %errorlevel%==0 (
    echo   ✅ Node.js is available
    set "NODEJS_OK=true"
) else (
    echo   ⚠️ Node.js not available - using fallback mode
    set "NODEJS_OK=false"
)

echo.

REM Test 3: Plan State Manager
echo [3/8] Testing plan state management...
if "%NODEJS_OK%"=="true" (
    if exist ".claude\hooks\plan-state-manager.js" (
        node .claude\hooks\plan-state-manager.js init >nul 2>&1
        if %errorlevel%==0 (
            echo   ✅ Plan state manager initialization works
            node .claude\hooks\plan-state-manager.js summary >nul 2>&1
            if %errorlevel%==0 (
                echo   ✅ Plan state manager summary works
            ) else (
                echo   ❌ Plan state manager summary failed
            )
        ) else (
            echo   ❌ Plan state manager initialization failed
        )
    ) else (
        echo   ❌ Plan state manager script not found
    )
) else (
    echo   ⚠️ Skipping (Node.js not available)
)

echo.

REM Test 4: Hook Execution
echo [4/8] Testing hook execution...
set "CLAUDE_TOOL_NAME=ValidationTest"
set "CLAUDE_TOOL_RESULT=success"

call .claude\hooks\subagent-stop.bat TestAgent success validation-001 >nul 2>&1
if %errorlevel% LEQ 1 (
    echo   ✅ Subagent-stop hook executes
) else (
    echo   ❌ Subagent-stop hook failed
)

call .claude\hooks\post-tool-use.bat >nul 2>&1
if %errorlevel% LEQ 1 (
    echo   ✅ Post-tool-use hook executes
) else (
    echo   ❌ Post-tool-use hook failed
)

echo.

REM Test 5: Configuration Loading
echo [5/8] Testing configuration loading...
if exist ".claude\hooks\hook-config.json" (
    findstr "taskCompletionCommands" .claude\hooks\hook-config.json >nul 2>&1
    if %errorlevel%==0 (
        echo   ✅ Configuration has valid structure
    ) else (
        echo   ❌ Configuration structure invalid
    )
) else (
    echo   ❌ No configuration file found
)

echo.

REM Test 6: Settings Integration
echo [6/8] Testing settings integration...
if exist ".claude\settings.local.json" (
    findstr "SubagentStop" .claude\settings.local.json >nul 2>&1
    if %errorlevel%==0 (
        echo   ✅ Settings configured for hooks
    ) else (
        echo   ❌ Settings not configured for hooks
    )
) else (
    echo   ❌ Settings file not found
)

echo.

REM Test 7: Logging
echo [7/8] Testing logging system...
if exist ".claude\hooks\claude-hooks.log" (
    echo   ✅ Log file exists
) else (
    echo   ⚠️ Log file not yet created
)

echo.

REM Test 8: Examples
echo [8/8] Checking example workflows...

set "EXAMPLES_FOUND="
if exist ".claude\hooks\examples\simple-workflow.json" set "EXAMPLES_FOUND=yes"
if exist ".claude\hooks\examples\development-workflow.json" set "EXAMPLES_FOUND=yes"
if exist ".claude\hooks\examples\deployment-workflow.json" set "EXAMPLES_FOUND=yes"
if exist ".claude\hooks\examples\testing-workflow.json" set "EXAMPLES_FOUND=yes"

if defined EXAMPLES_FOUND (
    echo   ✅ Example workflows found
) else (
    echo   ⚠️ No example workflows found
)

echo.

REM Summary
echo ========================================
echo VALIDATION SUMMARY
echo ========================================
echo.

if "%FILES_OK%"=="true" (
    echo ✅ CORE SYSTEM: Ready
    echo.
    echo The Claude Code Proactive Hook System appears to be
    echo properly installed and configured.
    echo.
    echo NEXT STEPS:
    echo 1. Choose a workflow from .claude\hooks\examples\
    echo 2. Copy it to .claude\hooks\hook-config.json
    echo 3. Start using Claude Code with proactive automation!
    echo.
    echo For detailed documentation, see:
    echo - .claude\hooks\README-PROACTIVE.md
    echo - .claude\hooks\examples\README.md
    echo.
    echo ========================================
    echo 🚀 READY FOR PROACTIVE AUTOMATION! 🚀
    echo ========================================
    
    echo [%date% %time%] Validation completed successfully >> "%VALIDATION_LOG%"
    exit /b 0
) else (
    echo ❌ CORE SYSTEM: Issues detected
    echo.
    echo Some required files are missing. Please ensure all
    echo hook files are present and properly configured.
    echo.
    echo Check the following files:
    echo - .claude\hooks\hook-commons.bat
    echo - .claude\hooks\subagent-stop.bat  
    echo - .claude\hooks\post-tool-use.bat
    echo - .claude\hooks\hook-config.json
    echo.
    echo ========================================
    echo ⚠️ SETUP REQUIRED BEFORE USE ⚠️
    echo ========================================
    
    echo [%date% %time%] Validation completed with issues >> "%VALIDATION_LOG%"
    exit /b 1
)

REM Cleanup
set "CLAUDE_TOOL_NAME="
set "CLAUDE_TOOL_RESULT="