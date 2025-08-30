#!/bin/bash
# /* 2>nul
@echo off
setlocal EnableDelayedExpansion EnableExtensions

:: Windows Batch portion
set "HOOK_DIR=%~dp0"
set "CLAUDE_DIR=%HOOK_DIR%.."
set "LOG_FILE=%HOOK_DIR%claude-hooks.log"
set "CACHE_DIR=%CLAUDE_DIR%\.cache"

:: Create cache directory if needed
if not exist "%CACHE_DIR%" mkdir "%CACHE_DIR%" 2>nul

:: Detect if we're running in WSL or native Windows
if exist "/mnt/c" (
    set "IS_WSL=1"
) else (
    set "IS_WSL=0"
)

goto :batch_functions

:log_info
    echo [%date% %time%] [INFO] [%1] %~2 >> "%LOG_FILE%" 2>nul
    goto :eof

:log_error
    echo [%date% %time%] [ERROR] [%1] %~2 >> "%LOG_FILE%" 2>nul
    goto :eof

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

:cleanup_temp_files
    del "%CACHE_DIR%\*.tmp" >nul 2>&1
    goto :eof

:batch_functions
:: End of batch section, exit for Windows
exit /b 0
*/

# Bash/Shell portion starts here
# This section will only execute on Unix-like systems

# Get script directory
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${HOOK_DIR}/.."
LOG_FILE="${HOOK_DIR}/claude-hooks.log"
CACHE_DIR="${CLAUDE_DIR}/.cache"

# Create cache directory if needed
mkdir -p "$CACHE_DIR" 2>/dev/null

# Detect environment
if [[ -f /proc/version ]] && grep -q Microsoft /proc/version; then
    export IS_WSL=1
else
    export IS_WSL=0
fi

# Logging functions
log_info() {
    local context="$1"
    local message="$2"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] [$context] $message" >> "$LOG_FILE" 2>/dev/null
}

log_error() {
    local context="$1"
    local message="$2"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] [$context] $message" >> "$LOG_FILE" 2>/dev/null
}

# Command execution function
execute_command() {
    local cmd="$1"
    local args="$2"
    
    log_info "EXEC" "Running: $cmd $args"
    $cmd $args
    local result=$?
    
    if [ $result -eq 0 ]; then
        log_info "EXEC" "Success: $cmd"
    else
        log_error "EXEC" "Failed: $cmd (exit code $result)"
    fi
    
    return $result
}

# Cleanup function
cleanup_temp_files() {
    rm -f "$CACHE_DIR"/*.tmp 2>/dev/null
}

# Export functions for sourcing
export -f log_info log_error execute_command cleanup_temp_files