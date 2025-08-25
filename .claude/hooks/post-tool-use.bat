@echo off
REM Compatibility wrapper for post-tool-intelligence.bat
REM Redirects to the new consolidated hook

call "%~dp0post-tool-intelligence.bat" %*
exit /b %errorlevel%