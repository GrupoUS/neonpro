@echo off
REM Claude Code Proactive Hooks - Optimized Shared Utilities
REM Version: 2.0.0 - Performance Optimized

REM Global variables
set "HOOK_DIR=%~dp0"
set "CLAUDE_DIR=%HOOK_DIR%.."
set "CONFIG_FILE=%HOOK_DIR%hook-config.json"
set "LOG_FILE=%HOOK_DIR%claude-hooks.log"
set "STATE_FILE=%CLAUDE_DIR%\.cache\current-plan-state.json"
set "CACHE_DIR=%CLAUDE_DIR%\.cache"

REM Create cache directory if needed
if not exist "%CACHE_DIR%" mkdir "%CACHE_DIR%" 2>nul

REM Environment variables
set "CLAUDE_PROJECT_ROOT=%CD%"
set "CLAUDE_TIMESTAMP=%date% %time%"

REM Optimized logging functions
:log_info
    if "%HOOK_DEBUG%"=="1" echo [INFO] [%1] %~2
    echo [%date% %time%] [INFO] [%1] %~2 >> "%LOG_FILE%" 2>nul
    goto :eof

:log_success  
    if "%HOOK_DEBUG%"=="1" echo [SUCCESS] [%1] %~2
    echo [%date% %time%] [SUCCESS] [%1] %~2 >> "%LOG_FILE%" 2>nul
    goto :eof

:log_warning
    if "%HOOK_DEBUG%"=="1" echo [WARNING] [%1] %~2
    echo [%date% %time%] [WARNING] [%1] %~2 >> "%LOG_FILE%" 2>nul
    goto :eof

:log_error
    if "%HOOK_DEBUG%"=="1" echo [ERROR] [%1] %~2
    echo [%date% %time%] [ERROR] [%1] %~2 >> "%LOG_FILE%" 2>nul
    goto :eof

REM Configuration checks
:config_exists
    if exist "%CONFIG_FILE%" exit /b 0
    exit /b 1

:check_package_json
    if exist "package.json" exit /b 0
    exit /b 1

:check_npm_script
    if exist "package.json" (
        findstr /i "%~1" package.json >nul 2>&1
        if %errorlevel%==0 exit /b 0
    )
    exit /b 1

REM Streamlined command execution
:execute_command
    set "cmd=%~1"
    set "args=%~2"
    set "timeout_val=%~3"
    
    if "%timeout_val%"=="" set "timeout_val=30"
    
    call :log_info "EXEC" "Running: %cmd% %args%"
    
    %cmd% %args%
    set "result=%errorlevel%"
    
    if %result%==0 (
        call :log_success "EXEC" "Success: %cmd%"
    ) else (
        call :log_error "EXEC" "Failed: %cmd% (exit code %result%)"
    )
    
    exit /b %result%

:execute_command_with_retry
    set "cmd=%~1"
    set "args=%~2"
    set "retries=%~3"
    set "delay=%~4"
    
    if "%retries%"=="" set "retries=3"
    if "%delay%"=="" set "delay=1"
    
    :retry_loop
    call :execute_command "%cmd%" "%args%"
    if %errorlevel%==0 exit /b 0
    
    set /a retries-=1
    if %retries% LEQ 0 exit /b 1
    
    timeout /t %delay% /nobreak >nul 2>&1
    goto :retry_loop

REM Plan state management
:init_plan_state
    (
        echo {"planId":"%RANDOM%","startTime":"%CLAUDE_TIMESTAMP%","status":"active"}
    ) > "%STATE_FILE%" 2>nul
    goto :eof

:update_plan_state
    echo [%date% %time%] %~1 >> "%CACHE_DIR%\plan-activity.log" 2>nul
    goto :eof

:finalize_plan_state
    echo [%date% %time%] Plan completed >> "%CACHE_DIR%\plan-activity.log" 2>nul
    goto :eof

REM Cleanup functions
:cleanup_temp_files
    del "%CACHE_DIR%\*.tmp" >nul 2>&1
    del "%CACHE_DIR%\*-state.tmp" >nul 2>&1
    goto :eof

REM Performance monitoring
:track_performance
    echo [%date% %time%] PERF: %~1 >> "%CACHE_DIR%\performance.log" 2>nul
    goto :eof