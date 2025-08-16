# Script para corrigir todos os erros de tipo params no Next.js 15 - arquivos reais encontrados

$files = @(
    "E:\neonpro\apps\web\app\api\predictive-analytics\alerts\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\tax\nfe\[id]\cancel\route.ts",
    "E:\neonpro\apps\web\app\api\predictions\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\patients\[id]\insights\route.ts",
    "E:\neonpro\apps\web\app\api\inventory\alerts\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\payment-plans\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\followup\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\email\config\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\campaigns\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\marketing\campaigns\[id]\analytics\route.ts",
    "E:\neonpro\apps\web\app\api\predictive-analytics\predictions\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\followup\protocols\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\delinquency\workflows\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\payments\pix\status\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\inventory\items\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\backup\configs\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\retention-analytics\campaigns\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\treatment-success\outcomes\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\campaigns\[id]\analytics\route.ts",
    "E:\neonpro\apps\web\app\api\email\templates\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\progress-tracking\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\subscriptions\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\executive-dashboard\alerts\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\receipts-invoices\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\tax\nfe\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\payments\card\status\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\followup\[id]\escalate\route.ts",
    "E:\neonpro\apps\web\app\api\inventory\thresholds\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\predictive-analytics\training\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\tax\nfe\[id]\authorize\route.ts",
    "E:\neonpro\apps\web\app\api\marketing\campaigns\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\subscription-plans\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\maintenance\equipment\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\marketing\campaigns\[id]\execute\route.ts",
    "E:\neonpro\apps\web\app\api\milestones\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\campaigns\[id]\execute\route.ts",
    "E:\neonpro\apps\web\app\api\report-builder\reports\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\predictive-analytics\models\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\campaigns\[id]\ab-test\route.ts"
)

$totalFiles = $files.Count
$processedFiles = 0
$modifiedFiles = 0

Write-Host "Iniciando correcao de $totalFiles arquivos..." -ForegroundColor Green

foreach ($file in $files) {
    $processedFiles++
    Write-Host "[$processedFiles/$totalFiles] Processando: $file" -ForegroundColor Yellow
    
    if (Test-Path $file) {
        try {
            $content = Get-Content $file -Raw -Encoding UTF8
            $originalContent = $content
            
            # Substituir tipo de parametro
            $content = $content -replace '\{ params \}: \{ params: \{ id: string \} \}', '{ params }: { params: Promise<{ id: string }> }'
            
            # Substituir desestruturacao
            $content = $content -replace 'const \{ id \} = params;', 'const { id } = await params;'
            
            if ($content -ne $originalContent) {
                Set-Content $file -Value $content -Encoding UTF8
                $modifiedFiles++
                Write-Host "  Arquivo modificado com sucesso" -ForegroundColor Green
            } else {
                Write-Host "  Nenhuma alteracao necessaria" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "  Erro ao processar arquivo: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  Arquivo nao encontrado" -ForegroundColor Red
    }
}

Write-Host "`nResumo:" -ForegroundColor Cyan
Write-Host "- Arquivos processados: $processedFiles" -ForegroundColor White
Write-Host "- Arquivos modificados: $modifiedFiles" -ForegroundColor Green
Write-Host "- Correcao concluida!" -ForegroundColor Green