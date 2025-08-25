@echo off
REM Claude Code Post-Tool Intelligence Hook
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
set "TOOL_RESULT=%CLAUDE_TOOL_RESULT%"
set "SESSION_ID=%CLAUDE_SESSION_ID%"
if "%TOOL_NAME%"=="" set "TOOL_NAME=unknown"
if "%TOOL_RESULT%"=="" set "TOOL_RESULT=success"
if "%SESSION_ID%"=="" set "SESSION_ID=%RANDOM%"

REM Log execution
echo [%date% %time%] [INFO] [POST_TOOL_HOOK] Post-tool intelligence hook executing for tool: %TOOL_NAME% (result: %TOOL_RESULT%) >> "%LOG_FILE%" 2>nul

REM Set environment variables
set "CLAUDE_HOOK_PHASE=post_tool_use"
set "CLAUDE_CURRENT_TOOL=%TOOL_NAME%"
set "CLAUDE_TOOL_RESULT=%TOOL_RESULT%"

REM Log success and exit
echo [%date% %time%] [SUCCESS] [POST_TOOL_HOOK] Post-tool intelligence hook completed successfully >> "%LOG_FILE%" 2>nul
exit /b 0