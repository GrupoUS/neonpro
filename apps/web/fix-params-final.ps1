# Script para corrigir tipos de parametros em arquivos de rota Next.js

# Lista de arquivos encontrados pela busca regex
$files = @(
    'E:\neonpro\apps\web\app\api\followup\protocols\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\tax\nfe\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\executive-dashboard\alerts\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\milestones\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\subscription-plans\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\tax\nfe\[id]\authorize\route.ts',
    'E:\neonpro\apps\web\app\api\patients\[id]\insights\route.ts',
    'E:\neonpro\apps\web\app\api\inventory\thresholds\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\email\templates\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\campaigns\[id]\ab-test\route.ts',
    'E:\neonpro\apps\web\app\api\treatment-success\outcomes\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\payments\pix\status\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\marketing\campaigns\[id]\execute\route.ts',
    'E:\neonpro\apps\web\app\api\payments\card\status\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\delinquency\workflows\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\campaigns\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\subscriptions\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\marketing\campaigns\[id]\analytics\route.ts',
    'E:\neonpro\apps\web\app\api\predictive-analytics\predictions\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\followup\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\followup\[id]\escalate\route.ts',
    'E:\neonpro\apps\web\app\api\email\config\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\inventory\alerts\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\progress-tracking\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\receipts-invoices\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\predictive-analytics\alerts\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\predictions\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\marketing\campaigns\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\inventory\items\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\payment-plans\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\retention-analytics\campaigns\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\backup\configs\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\maintenance\equipment\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\campaigns\[id]\analytics\route.ts',
    'E:\neonpro\apps\web\app\api\predictive-analytics\training\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\predictive-analytics\models\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\tax\nfe\[id]\cancel\route.ts',
    'E:\neonpro\apps\web\app\api\report-builder\reports\[id]\route.ts',
    'E:\neonpro\apps\web\app\api\campaigns\[id]\execute\route.ts'
)

$totalFiles = $files.Count
$modifiedFiles = 0

Write-Host "Iniciando correcao de tipos de parametros em $totalFiles arquivos..."
Write-Host ""

for ($i = 0; $i -lt $totalFiles; $i++) {
    $file = $files[$i]
    $fileNumber = $i + 1
    
    Write-Host "[$fileNumber/$totalFiles] Processando: $file"
    
    if (Test-Path $file) {
        try {
            $content = Get-Content $file -Raw -Encoding UTF8
            $originalContent = $content
            
            # Substituir tipo de parametro
            $content = $content -replace '\{ params \}: \{ params: \{ id: string \} \}', '{ params }: { params: Promise<{ id: string }> }'
            
            # Substituir desestruturacao do id
            $content = $content -replace 'const \{ id \} = params;', 'const { id } = await params;'
            
            if ($content -ne $originalContent) {
                Set-Content -Path $file -Value $content -Encoding UTF8
                Write-Host "  Arquivo modificado com sucesso!"
                $modifiedFiles++
            } else {
                Write-Host "  Nenhuma alteracao necessaria"
            }
        }
        catch {
            Write-Host "  Erro ao processar arquivo: $($_.Exception.Message)"
        }
    } else {
        Write-Host "  Arquivo nao encontrado"
    }
}

Write-Host ""
Write-Host "Resumo:"
Write-Host "- Arquivos processados: $totalFiles"
Write-Host "- Arquivos modificados: $modifiedFiles"
Write-Host "- Correcao concluida!"