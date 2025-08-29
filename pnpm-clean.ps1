# PNPM Wrapper Script - Elimina warnings NPM para NeonPro Healthcare
# Uso: .\pnpm-clean.ps1 <comando>

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

# Configurar variáveis de ambiente para eliminar warnings
$env:NPM_CONFIG_FUND = "false"
$env:NPM_CONFIG_LOGLEVEL = "silent"
$env:NPM_CONFIG_UPDATE_NOTIFIER = "false"
$env:NPM_CONFIG_AUDIT_LEVEL = "none"

# Executar PNPM via NPX
if ($Arguments.Length -eq 0) {
    Write-Host "🚀 PNPM Wrapper para NeonPro Healthcare" -ForegroundColor Green
    Write-Host "Uso: .\pnpm-clean.ps1 <comando>" -ForegroundColor Yellow
    Write-Host "Exemplos:" -ForegroundColor Cyan
    Write-Host "  .\pnpm-clean.ps1 install" -ForegroundColor White
    Write-Host "  .\pnpm-clean.ps1 build" -ForegroundColor White
    Write-Host "  .\pnpm-clean.ps1 type-check" -ForegroundColor White
} else {
    npx pnpm@latest @Arguments
}
