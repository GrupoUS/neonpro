@echo off
REM Claude Code Post-Tool Hook - Simplified
setlocal EnableDelayedExpansion EnableExtensions

REM Set up core variables
set "LOG_FILE=%~dp0claude-hooks.log"
set "CACHE_DIR=%~dp0..\..\.cache"

REM Create cache directory if needed
if not exist "%CACHE_DIR%" mkdir "%CACHE_DIR%" 2>nul

REM Initialize variables
set "TOOL_NAME=%CLAUDE_TOOL_NAME%"
set "TOOL_RESULT=%CLAUDE_TOOL_RESULT%"
if "%TOOL_NAME%"=="" set "TOOL_NAME=unknown"
if "%TOOL_RESULT%"=="" set "TOOL_RESULT=success"

REM Set environment variables
set "CLAUDE_HOOK_PHASE=post_tool_use"
set "CLAUDE_CURRENT_TOOL=%TOOL_NAME%"
set "CLAUDE_TOOL_RESULT=%TOOL_RESULT%"

REM Log execution
echo [%date% %time%] [INFO] Post-tool hook: %TOOL_NAME% (%TOOL_RESULT%) >> "%LOG_FILE%" 2>nul

exit /b 0