@echo off
rem Claude Code Optimized PowerShell Launcher
rem Based on research from official PowerShell docs and Claude Code optimization guides

rem Set Claude Code valid environment variables
rem MAX_THINKING_TOKENS options based on official Claude Code levels:
rem   31999 = HIGHEST (ultrathink) - Best for complex tasks & planning
rem   10000 = MIDDLE (think hard) - Balanced performance/cost  
rem   4000 = BASIC (think) - Light tasks, faster responses
set "MAX_THINKING_TOKENS=31999"
set "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1"
set "MCP_TIMEOUT=30000"
set "MCP_TOOL_TIMEOUT=10000"

rem Launch optimized PowerShell 7+ with Claude Code
start "Claude Code - Optimized PowerShell" pwsh -NoExit -Command ^
"Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force; ^
$PSStyle.Progress.View = 'Minimal'; ^
$PSStyle.Progress.MaxWidth = 120; ^
$PSStyle.Formatting.FormatAccent = \"`e[32m\"; ^
$PSStyle.Formatting.TableHeader = \"`e[32m\"; ^
$PSStyle.Formatting.ErrorAccent = \"`e[36m\"; ^
$PSStyle.Formatting.Error = \"`e[31m\"; ^
$PSStyle.Formatting.Warning = \"`e[33m\"; ^
$PSStyle.Formatting.Verbose = \"`e[33m\"; ^
$PSStyle.Formatting.Debug = \"`e[33m\"; ^
Write-Host 'Claude Code Environment Optimized' -ForegroundColor Green; ^
Write-Host 'PowerShell Version:' $PSVersionTable.PSVersion -ForegroundColor Cyan; ^
Write-Host 'Working Directory:' (Get-Location) -ForegroundColor Yellow; ^
cd 'd:\neonpro'; ^
claude"