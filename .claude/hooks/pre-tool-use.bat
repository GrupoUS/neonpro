@echo off
REM Compatibility wrapper for pre-tool-intelligence.bat
REM Redirects to the new consolidated hook

call "%~dp0pre-tool-intelligence.bat" %*
exit /b %errorlevel%