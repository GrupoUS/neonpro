#!/usr/bin/env pwsh
# =============================================================================
# NeonPro Cleanup Validation Script
# Verifica se a limpeza de arquivos .unused e deprecated não quebrou nada
# =============================================================================

Write-Host "🔍 VALIDAÇÃO COMPLETA DA LIMPEZA LEGACY" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0
$WarningCount = 0

# Função para logar resultados
function Log-Result {
    param($Message, $Type = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    switch ($Type) {
        "SUCCESS" { Write-Host "✅ [$timestamp] $Message" -ForegroundColor Green }
        "ERROR"   { Write-Host "❌ [$timestamp] $Message" -ForegroundColor Red; $script:ErrorCount++ }
        "WARNING" { Write-Host "⚠️  [$timestamp] $Message" -ForegroundColor Yellow; $script:WarningCount++ }
        "INFO"    { Write-Host "ℹ️  [$timestamp] $Message" -ForegroundColor White }
    }
}

# Verificar se todos os .unused files foram movidos
Log-Result "Verificando remoção de arquivos .unused..." "INFO"

$unusedFiles = @(
    "scripts/performance/bundle-analyzer.ts.unused",
    "apps/web/lib/services/api-gateway-migrated.ts.unused", 
    "apps/web/app/lib/services/stock-alert.service.ts.unused",
    "apps/web/app/lib/services/retention.ts.unused",
    "apps/web/app/lib/services/retention-new.ts.unused"
)

foreach ($file in $unusedFiles) {
    $fullPath = Join-Path $PWD $file
    if (Test-Path $fullPath) {
        Log-Result "Arquivo .unused ainda existe: $file" "ERROR"
    } else {
        Log-Result "Arquivo .unused removido com sucesso: $file" "SUCCESS"
    }
}

# Verificar se os arquivos .deleted existem
Log-Result "Verificando arquivos em .deleted..." "INFO"
$deletedFiles = Get-ChildItem -Path "*.deleted" -Recurse -ErrorAction SilentlyContinue
if ($deletedFiles.Count -gt 0) {
    Log-Result "Encontrados $($deletedFiles.Count) arquivos em .deleted (backup de segurança)" "SUCCESS"
} else {
    Log-Result "Nenhum arquivo .deleted encontrado" "WARNING"
}

# Verificar se funções deprecated foram removidas
Log-Result "Verificando remoção de funções deprecated..." "INFO"
$mcpServiceFile = "archon/archon-ui-main/src/services/mcpServerService.ts"
if (Test-Path $mcpServiceFile) {
    $content = Get-Content $mcpServiceFile -Raw
    if ($content -match "@deprecated") {
        Log-Result "Ainda existem funções @deprecated em mcpServerService.ts" "ERROR"
    } else {
        Log-Result "Todas as funções @deprecated foram removidas do mcpServerService.ts" "SUCCESS"
    }
    
    if ($content -match "getAvailableTools|callTool") {
        Log-Result "Métodos deprecated ainda existem em mcpServerService.ts" "ERROR"  
    } else {
        Log-Result "Métodos deprecated removidos com sucesso" "SUCCESS"
    }
} else {
    Log-Result "Arquivo mcpServerService.ts não encontrado" "ERROR"
}

# Verificar se mcpClientService existe (substituto moderno)
Log-Result "Verificando substituto moderno..." "INFO"
$mcpClientFile = "archon/archon-ui-main/src/services/mcpClientService.ts"
if (Test-Path $mcpClientFile) {
    $clientContent = Get-Content $mcpClientFile -Raw
    if ($clientContent -match "callTool|listTools") {
        Log-Result "mcpClientService.ts contém implementação moderna" "SUCCESS"
    } else {
        Log-Result "mcpClientService.ts pode estar incompleto" "WARNING"
    }
} else {
    Log-Result "mcpClientService.ts não encontrado - substituto crítico!" "ERROR"
}

# Verificar integridade de arquivos críticos
Log-Result "Verificando integridade de arquivos críticos..." "INFO"
$criticalFiles = @(
    "turbo.json",
    "turbo-optimized.json", 
    "package.json",
    "tsconfig.json",
    "docs/TURBOREPO_INTEGRATION_FINAL_REPORT.md"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Log-Result "Arquivo crítico presente: $file" "SUCCESS"
    } else {
        Log-Result "Arquivo crítico ausente: $file" "ERROR"
    }
}

# Verificar se não há referências órfãs aos arquivos removidos
Log-Result "Verificando referências órfãs..." "INFO"
$searchTerms = @(
    "bundle-analyzer.ts.unused",
    "api-gateway-migrated.ts.unused",
    "stock-alert.service.ts.unused", 
    "retention.ts.unused",
    "retention-new.ts.unused"
)

foreach ($term in $searchTerms) {
    $results = Select-String -Path "**/*.ts" -Pattern $term -ErrorAction SilentlyContinue
    if ($results) {
        Log-Result "Encontradas referências órfãs para: $term" "ERROR"
        $results | ForEach-Object { Log-Result "  - $($_.Filename):$($_.LineNumber)" "INFO" }
    } else {
        Log-Result "Nenhuma referência órfã encontrada para: $term" "SUCCESS"
    }
}

# Tentar compilação TypeScript rápida
Log-Result "Verificando compilação TypeScript..." "INFO"
try {
    $tscOutput = & npx tsc --noEmit --skipLibCheck 2>&1
    if ($LASTEXITCODE -eq 0) {
        Log-Result "Compilação TypeScript bem-sucedida" "SUCCESS"
    } else {
        Log-Result "Erros de compilação TypeScript detectados" "ERROR"
        Log-Result $tscOutput "INFO"
    }
} catch {
    Log-Result "Erro ao executar verificação TypeScript: $($_.Exception.Message)" "WARNING"
}

# Relatório final
Write-Host ""
Write-Host "📊 RELATÓRIO FINAL DA VALIDAÇÃO" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════" -ForegroundColor Cyan
Log-Result "Erros encontrados: $ErrorCount" $(if ($ErrorCount -eq 0) { "SUCCESS" } else { "ERROR" })
Log-Result "Avisos encontrados: $WarningCount" $(if ($WarningCount -eq 0) { "SUCCESS" } else { "WARNING" })

if ($ErrorCount -eq 0) {
    Write-Host ""
    Write-Host "🎉 LIMPEZA VALIDADA COM SUCESSO!" -ForegroundColor Green
    Write-Host "✅ Todos os arquivos legacy foram removidos"
    Write-Host "✅ Nenhuma referência órfã detectada"
    Write-Host "✅ Sistema permanece íntegro"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠️  PROBLEMAS DETECTADOS NA LIMPEZA" -ForegroundColor Red
    Write-Host "❌ $ErrorCount erro(s) precisam ser corrigidos"
    Write-Host "⚠️  $WarningCount aviso(s) para revisão"
    Write-Host ""
    exit 1
}