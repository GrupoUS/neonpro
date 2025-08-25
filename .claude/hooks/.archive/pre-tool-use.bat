@echo off
REM Claude Code Proactive Hooks - Optimized Pre-Tool-Use Hook
REM Version: 2.0.0 - Performance Optimized

REM Load shared utilities
call "%~dp0hook-commons.bat"

REM Parse environment variables
set "TOOL_NAME=%CLAUDE_TOOL_NAME%"
set "TOOL_ARGS=%CLAUDE_TOOL_ARGS%"
if "%TOOL_NAME%"=="" set "TOOL_NAME=unknown"

REM Track tool execution start
call :track_performance "PRE_START:%TOOL_NAME%"

REM Detect plan initialization and prepare environment
:main_execution
    call :detect_plan_signals
    call :prepare_environment
    goto :cleanup_and_exit

:detect_plan_signals
    REM Handle specific tool types
    if /i "%TOOL_NAME%"=="TodoWrite" (
        if not exist "%STATE_FILE%" call :init_plan_state
        call :update_plan_state "TodoWrite_detected"
    ) else if /i "%TOOL_NAME%"=="ExitPlanMode" (
        call :update_plan_state "ExitPlanMode_detected" 
    ) else if /i "%TOOL_NAME%"=="Task" (
        call :update_plan_state "Task_detected"
    )
    goto :eof

:prepare_environment
    REM Ensure cache directory exists
    if not exist "%CACHE_DIR%" mkdir "%CACHE_DIR%" 2>nul
    
    REM Set up environment variables
    set "CLAUDE_HOOK_PHASE=pre_tool_use"
    set "CLAUDE_CURRENT_TOOL=%TOOL_NAME%"
    
    REM Check system readiness
    call :check_system_readiness
    goto :eof

:check_system_readiness
    REM Basic system checks
    where npm >nul 2>&1 && set "NPM_AVAILABLE=true"
    where git >nul 2>&1 && set "GIT_AVAILABLE=true"
    goto :eof

:cleanup_and_exit
    call :track_performance "PRE_COMPLETE:%TOOL_NAME%"
    exit /b 0