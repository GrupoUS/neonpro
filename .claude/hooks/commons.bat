@echo off
REM Claude Code Hooks - Essential Shared Utilities

REM Global variables
set "HOOK_DIR=%~dp0"
set "CLAUDE_DIR=%HOOK_DIR%.."
set "LOG_FILE=%HOOK_DIR%claude-hooks.log"
set "CACHE_DIR=%CLAUDE_DIR%\.cache"

REM Create cache directory if needed
if not exist "%CACHE_DIR%" mkdir "%CACHE_DIR%" 2>nul

REM Essential logging functions
:log_info
    echo [%date% %time%] [INFO] [%1] %~2 >> "%LOG_FILE%" 2>nul
    goto :eof

:log_error
    echo [%date% %time%] [ERROR] [%1] %~2 >> "%LOG_FILE%" 2>nul
    goto :eof

REM Basic command execution
:execute_command
    set "cmd=%~1"
    set "args=%~2"
    
    call :log_info "EXEC" "Running: %cmd% %args%"
    %cmd% %args%
    set "result=%errorlevel%"
    
    if %result%==0 (
        call :log_info "EXEC" "Success: %cmd%"
    ) else (
        call :log_error "EXEC" "Failed: %cmd% (exit code %result%)"
    )
    
    exit /b %result%

REM Cleanup function
:cleanup_temp_files
    del "%CACHE_DIR%\*.tmp" >nul 2>&1
    goto :eof