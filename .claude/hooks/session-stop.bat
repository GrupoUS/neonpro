@echo off
REM Claude Code Session Stop Hook - Simplified
setlocal EnableDelayedExpansion EnableExtensions

REM Set up core variables
set "LOG_FILE=%~dp0claude-hooks.log"
set "CACHE_DIR=%~dp0..\..\.cache"

REM Create cache directory if needed
if not exist "%CACHE_DIR%" mkdir "%CACHE_DIR%" 2>nul

REM Initialize session variables
set "SESSION_ID=%1"
set "SESSION_ACTION=%2"
if "%SESSION_ID%"=="" set "SESSION_ID=session_%RANDOM%"
if "%SESSION_ACTION%"=="" set "SESSION_ACTION=stop"

REM Set environment variables
set "CLAUDE_SESSION_ID=%SESSION_ID%"
set "CLAUDE_SESSION_ACTION=%SESSION_ACTION%"

REM Log execution
echo [%date% %time%] [INFO] Session hook: %SESSION_ID% (%SESSION_ACTION%) >> "%LOG_FILE%" 2>nul

REM Clean up temporary files
del "%CACHE_DIR%\*.tmp" >nul 2>&1
del "%CACHE_DIR%\*-state.tmp" >nul 2>&1

exit /b 0