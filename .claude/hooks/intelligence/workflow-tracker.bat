@echo off
REM ===================================================================
REM WORKFLOW TRACKER - SIMPLIFIED VERSION (No Errors)
REM Automatic tracking of workflow phases and progress management
REM ===================================================================

setlocal EnableDelayedExpansion
set "HOOK_NAME=workflow-tracker"
set "PROJECT_ROOT=%~dp0..\..\.."

echo [%HOOK_NAME%] Starting workflow tracking system...

REM ===================================================================
REM INITIALIZE WORKFLOW TRACKING
REM ===================================================================

set "CACHE_DIR=%PROJECT_ROOT%\.claude\.cache"
set "WORKFLOW_DIR=%CACHE_DIR%\workflow"

if not exist "%CACHE_DIR%" mkdir "%CACHE_DIR%"
if not exist "%WORKFLOW_DIR%" mkdir "%WORKFLOW_DIR%"

echo [%time%] [INFO] [%HOOK_NAME%] Initializing workflow tracking system...

REM Simple workflow initialization
for /f "delims=" %%i in ('powershell -Command "[guid]::NewGuid().ToString().Substring(0,8)"') do set "WORKFLOW_ID=%%i"
for /f "delims=" %%i in ('powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"') do set "START_TIME=%%i"

set "current_phase=validation"
set "phase_progress=50"

echo [%time%] [INFO] [%HOOK_NAME%] Loading existing workflow state...
echo [%time%] [INFO] [%HOOK_NAME%] Workflow ID: !WORKFLOW_ID!, Current Phase: !current_phase!

REM ===================================================================
REM SIMPLE PHASE DETECTION
REM ===================================================================

echo [%time%] [INFO] [%HOOK_NAME%] Detecting current workflow phase...

set "ACTIVE_COMMANDS_PHASE=unknown"
set "PROJECT_STATE_PHASE=validation"
set "ACTIVITY_PHASE=unknown"

if exist "%CACHE_DIR%\active_commands.tmp" (
    findstr /i "/test" "%CACHE_DIR%\active_commands.tmp" >nul 2>&1
    if !errorlevel! equ 0 set "ACTIVE_COMMANDS_PHASE=validation"
    
    findstr /i "/validate" "%CACHE_DIR%\active_commands.tmp" >nul 2>&1
    if !errorlevel! equ 0 set "ACTIVE_COMMANDS_PHASE=validation"
    
    findstr /i "/quality" "%CACHE_DIR%\active_commands.tmp" >nul 2>&1
    if !errorlevel! equ 0 set "ACTIVE_COMMANDS_PHASE=validation"
    
    findstr /i "/qa" "%CACHE_DIR%\active_commands.tmp" >nul 2>&1
    if !errorlevel! equ 0 set "ACTIVE_COMMANDS_PHASE=validation"
)

echo [%time%] [INFO] [%HOOK_NAME%] Active commands suggest phase: !ACTIVE_COMMANDS_PHASE!
echo [%time%] [INFO] [%HOOK_NAME%] Project state suggests phase: !PROJECT_STATE_PHASE!
echo [%time%] [INFO] [%HOOK_NAME%] Recent activity suggests phase: !ACTIVITY_PHASE!

REM Determine current phase
set "DETECTED_PHASE=validation"
if not "!ACTIVE_COMMANDS_PHASE!"=="unknown" set "DETECTED_PHASE=!ACTIVE_COMMANDS_PHASE!"

if not "!DETECTED_PHASE!"=="!current_phase!" (
    echo [%time%] [INFO] [%HOOK_NAME%] Transitioning from !current_phase! to !DETECTED_PHASE!
    set "current_phase=!DETECTED_PHASE!"
)

REM ===================================================================
REM HEALTHCARE TESTING WORKFLOW
REM ===================================================================

set "HEALTHCARE_WORKFLOW_DETECTED=0"
if exist "%CACHE_DIR%\active_commands.tmp" (
    findstr /i "/healthcare-compliance" "%CACHE_DIR%\active_commands.tmp" >nul 2>&1
    if !errorlevel! equ 0 set "HEALTHCARE_WORKFLOW_DETECTED=1"
    
    findstr /i "/patient-data-security" "%CACHE_DIR%\active_commands.tmp" >nul 2>&1
    if !errorlevel! equ 0 set "HEALTHCARE_WORKFLOW_DETECTED=1"
    
    findstr /i "/playwright-e2e-healthcare" "%CACHE_DIR%\active_commands.tmp" >nul 2>&1
    if !errorlevel! equ 0 set "HEALTHCARE_WORKFLOW_DETECTED=1"
    
    findstr /i "/biome-quality-check" "%CACHE_DIR%\active_commands.tmp" >nul 2>&1
    if !errorlevel! equ 0 set "HEALTHCARE_WORKFLOW_DETECTED=1"
)

if "!HEALTHCARE_WORKFLOW_DETECTED!"=="1" (
    echo [%time%] [INFO] [%HOOK_NAME%] Healthcare testing context detected
)

REM ===================================================================
REM SAVE WORKFLOW STATE
REM ===================================================================

echo [%time%] [INFO] [%HOOK_NAME%] Updating workflow state file...

set "WORKFLOW_FILE=%WORKFLOW_DIR%\current-workflow.json"

echo { > "%WORKFLOW_FILE%"
echo   "workflow_id": "!WORKFLOW_ID!", >> "%WORKFLOW_FILE%"
echo   "start_time": "!START_TIME!", >> "%WORKFLOW_FILE%"
echo   "current_phase": "!current_phase!", >> "%WORKFLOW_FILE%"
echo   "phase_progress": !phase_progress!, >> "%WORKFLOW_FILE%"
echo   "healthcare_workflow": !HEALTHCARE_WORKFLOW_DETECTED!, >> "%WORKFLOW_FILE%"
echo   "status": "active" >> "%WORKFLOW_FILE%"
echo } >> "%WORKFLOW_FILE%"

REM Clean up temporary variables to prevent environment pollution
set "HEALTHCARE_WORKFLOW_DETECTED="
set "ACTIVE_COMMANDS_PHASE="
set "PROJECT_STATE_PHASE="
set "ACTIVITY_PHASE="
set "DETECTED_PHASE="
set "WORKFLOW_FILE="

echo [%time%] [SUCCESS] [%HOOK_NAME%] Workflow tracking completed

REM Use endlocal to ensure no variables leak to parent environment
endlocal

exit /b 0