@echo off
REM Claude Code Subagent Stop Hook
REM Este arquivo é executado quando um subagente para

REM Exemplo: Log do subagent stop
echo [%date% %time%] Subagent Stop >> .claude\hooks\claude-hooks.log

REM Exit sem erro
exit /b 0