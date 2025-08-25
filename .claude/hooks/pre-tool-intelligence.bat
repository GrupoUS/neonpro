@echo off
REM Claude Code Pre-Tool Intelligence Hook
REM Version: 5.0.2 - Self-Contained

setlocal EnableDelayedExpansion EnableExtensions

REM Set up logging variables
set "LOG_FILE=%~dp0claude-hooks.log"
set "HOOK_DIR=%~dp0"
set "CACHE_DIR=%~dp0..\..\.cache"

REM Create cache directory if needed
if not exist "%CACHE_DIR%" mkdir "%CACHE_DIR%" 2>nul

REM Initialize core variables
set "TOOL_NAME=%CLAUDE_TOOL_NAME%"
set "TOOL_ARGS=%CLAUDE_TOOL_ARGS%"
set "SESSION_ID=%CLAUDE_SESSION_ID%"
if "%TOOL_NAME%"=="" set "TOOL_NAME=unknown"
if "%SESSION_ID%"=="" set "SESSION_ID=%RANDOM%"

REM Log execution
echo [%date% %time%] [INFO] [PRE_TOOL_HOOK] Pre-tool intelligence hook executing for tool: %TOOL_NAME% >> "%LOG_FILE%" 2>nul

REM Set basic environment variables
set "CLAUDE_HOOK_PHASE=pre_tool_use"
set "CLAUDE_CURRENT_TOOL=%TOOL_NAME%"

REM Log success and exit
echo [%date% %time%] [SUCCESS] [PRE_TOOL_HOOK] Pre-tool intelligence hook completed successfully >> "%LOG_FILE%" 2>nul
exit /b 0