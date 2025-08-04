# Script para Corrigir Imports Quebrados - Fase 3
Write-Host "FASE 3 - Correção de Imports Quebrados" -ForegroundColor Cyan

$srcPath = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src"
$totalCorrections = 0

# Lista de arquivos com imports problemáticos identificados
$filesToFix = @(
    "hooks\use-communication-realtime.ts",
    "components\dashboard\forecasting\forecasting-dashboard.tsx",
    "components\communication\staff-chat.tsx",
    "components\communication\template-manager.tsx",
    "components\communication\consent-manager.tsx",
    "components\communication\communication-dashboard.tsx",
    "app\dashboard-legacy\forecasting\page.tsx",
    "app\api\executive-dashboard\route.ts",
    "app\api\executive-dashboard\kpis\route.ts",
    "app\api\executive-dashboard\reports\route.ts",
    "app\api\executive-dashboard\alerts\route.ts",
    "app\api\executive-dashboard\kpis\comparison\route.ts",
    "app\api\executive-dashboard\widgets\route.ts"
)

Write-Host "Processando arquivos identificados..." -ForegroundColor Yellow

foreach ($file in $filesToFix) {
    $fullPath = Join-Path $srcPath $file
    Write-Host "Processando: $file" -ForegroundColor White
    
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $originalContent = $content
        
        # Corrigir imports que referenciam @/src/
        $content = $content -replace '@/src/', '@/'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $fullPath -Value $content -NoNewline
            Write-Host "  Corrigido: $(Split-Path $fullPath -Leaf)" -ForegroundColor Green
            $totalCorrections++
        } else {
            Write-Host "  Nenhuma correção necessária: $(Split-Path $fullPath -Leaf)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  Arquivo não encontrado: $fullPath" -ForegroundColor Red
    }
}

Write-Host "Total de correções: $totalCorrections" -ForegroundColor Green
Write-Host "Próximo passo: Executar validação do build" -ForegroundColor Yellow