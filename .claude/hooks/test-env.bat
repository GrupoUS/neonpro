@echo off
REM Test environment variables script

echo === Claude Code Environment Test === >> "%~dp0claude-hooks.log"
echo %date% %time% >> "%~dp0claude-hooks.log"
echo CLAUDE_PROJECT_DIR=%CLAUDE_PROJECT_DIR% >> "%~dp0claude-hooks.log"
echo Current Directory: %CD% >> "%~dp0claude-hooks.log"
echo Script Location: %~dp0 >> "%~dp0claude-hooks.log"
echo === End Environment Test === >> "%~dp0claude-hooks.log"

exit /b 0