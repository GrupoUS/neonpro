@echo off
REM Claude Code Session Intelligence Hook
REM Version: 5.0.2 - Self-Contained

setlocal EnableDelayedExpansion EnableExtensions

REM Set up logging variables
set "LOG_FILE=%~dp0claude-hooks.log"
set "HOOK_DIR=%~dp0"
set "CACHE_DIR=%~dp0..\..\.cache"

REM Create cache directory if needed
if not exist "%CACHE_DIR%" mkdir "%CACHE_DIR%" 2>nul

REM Initialize session variables
set "SESSION_ID=%1"
set "SESSION_ACTION=%2"
if "%SESSION_ID%"=="" set "SESSION_ID=session_%RANDOM%"
if "%SESSION_ACTION%"=="" set "SESSION_ACTION=monitor"

REM Log execution
echo [%date% %time%] [INFO] [SESSION_HOOK] Session intelligence hook executing - ID: %SESSION_ID%, Action: %SESSION_ACTION% >> "%LOG_FILE%" 2>nul

REM Set environment variables
set "CLAUDE_SESSION_ID=%SESSION_ID%"
set "CLAUDE_SESSION_ACTION=%SESSION_ACTION%"

REM Log success and exit
echo [%date% %time%] [SUCCESS] [SESSION_HOOK] Session intelligence hook completed successfully >> "%LOG_FILE%" 2>nul
exit /b 0