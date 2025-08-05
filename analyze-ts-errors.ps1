# Análise de Erros TypeScript - NeonPro V1
# Script otimizado para heap limitado

Write-Host "🔍 Analisando erros TypeScript..." -ForegroundColor Cyan

$env:NODE_OPTIONS = '--max-old-space-size=8192'

# Executar TypeScript e capturar erros
Write-Host "🔄 Executando validação TypeScript..." -ForegroundColor Yellow
$tsOutput = pnpm exec tsc --noEmit --skipLibCheck --project tsconfig.validation.json 2>&1

# Extrair códigos de erro únicos
Write-Host "📊 Analisando códigos de erro..." -ForegroundColor Yellow
$errorCodes = $tsOutput | Select-String -Pattern "error TS(\d+)" | ForEach-Object {
    $_.Matches[0].Groups[1].Value
} | Sort-Object -Unique

# Contar ocorrências de cada código
Write-Host "📈 Contando ocorrências..." -ForegroundColor Yellow
$errorStats = @{}
foreach ($line in $tsOutput) {
    if ($line -match "error TS(\d+)") {
        $code = $matches[1]
        if ($errorStats.ContainsKey($code)) {
            $errorStats[$code]++
        } else {
            $errorStats[$code] = 1
        }
    }
}

# Top 20 erros mais comuns
Write-Host "`n🏆 TOP 20 ERROS MAIS COMUNS:" -ForegroundColor Green
$errorStats.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 20 | ForEach-Object {
    Write-Host "  TS$($_.Key): $($_.Value) ocorrências" -ForegroundColor White
}

# Estatísticas gerais
Write-Host "`n📊 ESTATÍSTICAS GERAIS:" -ForegroundColor Green
Write-Host "  • Total de tipos únicos de erro: $($errorCodes.Count)" -ForegroundColor White
Write-Host "  • Total de ocorrências: $($errorStats.Values | Measure-Object -Sum | Select-Object -ExpandProperty Sum)" -ForegroundColor White

# Categorização básica por tipo de erro
$importErrors = $errorStats.Keys | Where-Object { $_ -in @('2307', '2322', '2339', '2345') }
$typeErrors = $errorStats.Keys | Where-Object { $_ -in @('2322', '2339', '2345', '2515', '2741', '2345') }
$moduleErrors = $errorStats.Keys | Where-Object { $_ -in @('2307', '2345') }

Write-Host "`n🎯 CATEGORIZAÇÃO:" -ForegroundColor Green
Write-Host "  • Erros de Import/Module: $($importErrors.Count) tipos" -ForegroundColor White
Write-Host "  • Erros de Type: $($typeErrors.Count) tipos" -ForegroundColor White
Write-Host "  • Erros de Module Resolution: $($moduleErrors.Count) tipos" -ForegroundColor White

Write-Host "`n✅ Análise completa!" -ForegroundColor Green