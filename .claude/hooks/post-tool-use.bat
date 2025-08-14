@echo off
REM Claude Code Post-Tool-Use Hook
REM Este arquivo é executado após cada uso de ferramenta

REM Exemplo: Log da conclusão da ferramenta
echo [%date% %time%] Post-Tool-Use: %CLAUDE_TOOL_NAME% completed >> .claude\hooks\claude-hooks.log

REM Exit sem erro
exit /b 0