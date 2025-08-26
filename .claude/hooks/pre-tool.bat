@echo off
REM Claude Code Pre-Tool Hook - Simplified
setlocal EnableDelayedExpansion EnableExtensions

REM Set up core variables
set "LOG_FILE=%~dp0claude-hooks.log"
set "CACHE_DIR=%~dp0..\..\.cache"

REM Create cache directory if needed
if not exist "%CACHE_DIR%" mkdir "%CACHE_DIR%" 2>nul

REM Initialize variables
set "TOOL_NAME=%CLAUDE_TOOL_NAME%"
if "%TOOL_NAME%"=="" set "TOOL_NAME=unknown"

REM Set environment variables
set "CLAUDE_HOOK_PHASE=pre_tool_use"
set "CLAUDE_CURRENT_TOOL=%TOOL_NAME%"

REM Log execution
echo [%date% %time%] [INFO] Pre-tool hook: %TOOL_NAME% >> "%LOG_FILE%" 2>nul

exit /b 0