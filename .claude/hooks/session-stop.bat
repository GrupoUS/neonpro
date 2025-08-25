@echo off
REM Compatibility wrapper for session-intelligence.bat
REM Redirects to the new consolidated hook

call "%~dp0session-intelligence.bat" %*
exit /b %errorlevel%