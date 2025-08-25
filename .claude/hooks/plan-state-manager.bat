@echo off
REM Claude Code Proactive Hooks - Optimized Plan State Manager
REM Version: 2.0.0 - Simplified Windows-Only Implementation

set "CACHE_DIR=%~dp0..\.cache"
set "STATE_FILE=%CACHE_DIR%\current-plan-state.json"
set "LOG_FILE=%CACHE_DIR%\plan-state.log"

REM Create cache directory if needed
if not exist "%CACHE_DIR%" mkdir "%CACHE_DIR%" 2>nul

REM Parse command
set "command=%~1"
set "param1=%~2"
set "param2=%~3"

if "%command%"=="" goto :show_usage
goto :%command% 2>nul || goto :unknown_command

:init
    REM Initialize new plan state
    (
        echo {
        echo   "planId": "%RANDOM%-%date:/=-%",
        echo   "startTime": "%date% %time%",
        echo   "status": "initializing",
        echo   "phase": "planning"
        echo }
    ) > "%STATE_FILE%"
    echo [%date% %time%] Plan initialized >> "%LOG_FILE%"
    exit /b 0

:update
    REM Update plan state with activity
    echo [%date% %time%] %param1% >> "%LOG_FILE%"
    exit /b 0

:complete
    REM Mark plan as completed
    echo [%date% %time%] Plan completed: %param1% >> "%LOG_FILE%"
    exit /b 0

:status
    REM Show current plan status
    if exist "%STATE_FILE%" (
        echo Plan state file exists
        type "%STATE_FILE%" 2>nul
    ) else (
        echo No active plan
    )
    exit /b 0

:cleanup
    REM Clean up plan state
    del "%STATE_FILE%" >nul 2>&1
    del "%CACHE_DIR%\plan-*.tmp" >nul 2>&1
    echo [%date% %time%] Plan state cleaned up >> "%LOG_FILE%"
    exit /b 0

:show_usage
    echo Usage: plan-state-manager.bat [command] [parameters]
    echo Commands:
    echo   init                 - Initialize new plan
    echo   update [activity]    - Update plan with activity
    echo   complete [status]    - Complete plan
    echo   status              - Show plan status
    echo   cleanup             - Clean up plan state
    exit /b 0

:unknown_command
    echo Unknown command: %command%
    call :show_usage
    exit /b 1