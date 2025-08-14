@echo off
REM Claude Code Pre-Tool-Use Hook
REM Este arquivo é executado antes de cada uso de ferramenta

REM Exemplo: Log da ferramenta sendo usada
echo [%date% %time%] Pre-Tool-Use: %CLAUDE_TOOL_NAME% >> .claude\hooks\claude-hooks.log

REM Exit sem erro
exit /b 0