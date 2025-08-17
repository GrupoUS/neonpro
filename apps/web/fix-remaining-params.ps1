# Script para corrigir arquivos route.ts que ainda nao foram convertidos para Promise

$apiDir = "E:\neonpro\apps\web\app\api"
$filesProcessed = 0
$filesModified = 0

Write-Host "Iniciando correcao de arquivos route.ts restantes..."

# Lista de arquivos que precisam ser corrigidos (sem Promise)
$filesToFix = @(
    "E:\neonpro\apps\web\app\api\patients\[patientId]-temp\insights\comprehensive\route.ts",
    "E:\neonpro\apps\web\app\api\inventory\items\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\patients\[patientId]-temp\insights\alerts\route.ts",
    "E:\neonpro\apps\web\app\api\email\config\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\inventory\alerts\[id]\[action]\route.ts",
    "E:\neonpro\apps\web\app\api\patients\[patientId]-temp\insights\treatments\route.ts",
    "E:\neonpro\apps\web\app\api\delinquency\workflows\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\followup\protocols\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\predictive-analytics\predictions\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\inventory\alerts\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\report-builder\analytics\[reportId]\route.ts",
    "E:\neonpro\apps\web\app\api\treatment-success\outcomes\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\campaigns\[id]\analytics\route.ts",
    "E:\neonpro\apps\web\app\api\report-builder\sharing\[reportId]\route.ts",
    "E:\neonpro\apps\web\app\api\retention-analytics\strategies\[clinicId]\route.ts",
    "E:\neonpro\apps\web\app\api\predictive-analytics\models\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\payments\pix\status\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\marketing\campaigns\[id]\analytics\route.ts",
    "E:\neonpro\apps\web\app\api\marketing\campaigns\[id]\execute\route.ts",
    "E:\neonpro\apps\web\app\api\backup\configs\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\maintenance\equipment\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\receipts-invoices\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\retention-analytics\metrics\[patientId]\route.ts",
    "E:\neonpro\apps\web\app\api\retention-analytics\predictions\[clinicId]\route.ts",
    "E:\neonpro\apps\web\app\api\predictive-analytics\training\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\tax\nfe\[id]\cancel\route.ts",
    "E:\neonpro\apps\web\app\api\milestones\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\followup\[id]\escalate\route.ts",
    "E:\neonpro\apps\web\app\api\followup\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\tax\nfe\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\retention-analytics\campaigns\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\retention-analytics\dashboard\[clinicId]\route.ts",
    "E:\neonpro\apps\web\app\api\marketing\campaigns\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\executive-dashboard\alerts\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\email\templates\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\campaigns\[id]\execute\route.ts",
    "E:\neonpro\apps\web\app\api\tax\nfe\[id]\authorize\route.ts",
    "E:\neonpro\apps\web\app\api\retention-analytics\metrics\clinic\[clinicId]\route.ts",
    "E:\neonpro\apps\web\app\api\progress-tracking\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\payments\card\status\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\predictive-analytics\alerts\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\subscription-plans\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\campaigns\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\payment-plans\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\patients\[patientId]-temp\insights\risk-assessment\route.ts",
    "E:\neonpro\apps\web\app\api\inventory\thresholds\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\report-builder\reports\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\predictions\[id]\route.ts",
    "E:\neonpro\apps\web\app\api\campaigns\[id]\ab-test\route.ts"
)

foreach ($file in $filesToFix) {
    try {
        $filesProcessed++
        Write-Host "Processando ($filesProcessed/$($filesToFix.Count)): $file"
        
        if (Test-Path $file) {
            $content = Get-Content $file | Out-String
            $originalContent = $content
            $modified = $false
            
            # Corrigir tipos de params que nao sao Promise
            if ($content -match '\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*id\s*:\s*string\s*\}\s*\}') {
                $content = $content -replace '\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*id\s*:\s*string\s*\}\s*\}', '{ params }: { params: Promise<{ id: string }> }'
                $modified = $true
            }
            if ($content -match '\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*patientId\s*:\s*string\s*\}\s*\}') {
                $content = $content -replace '\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*patientId\s*:\s*string\s*\}\s*\}', '{ params }: { params: Promise<{ patientId: string }> }'
                $modified = $true
            }
            if ($content -match '\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*clinicId\s*:\s*string\s*\}\s*\}') {
                $content = $content -replace '\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*clinicId\s*:\s*string\s*\}\s*\}', '{ params }: { params: Promise<{ clinicId: string }> }'
                $modified = $true
            }
            if ($content -match '\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*reportId\s*:\s*string\s*\}\s*\}') {
                $content = $content -replace '\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*reportId\s*:\s*string\s*\}\s*\}', '{ params }: { params: Promise<{ reportId: string }> }'
                $modified = $true
            }
            if ($content -match '\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*id\s*:\s*string;\s*action\s*:\s*string\s*\}\s*\}') {
                $content = $content -replace '\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{\s*id\s*:\s*string;\s*action\s*:\s*string\s*\}\s*\}', '{ params }: { params: Promise<{ id: string; action: string }> }'
                $modified = $true
            }
            
            # Adicionar desestruturacao se modificado
            if ($modified) {
                # Adicionar desestruturacao de id
                if ($content -match 'params\.id' -and $content -notmatch 'const \{ id \} = await params') {
                    $content = $content -replace '(try\s*\{)', '$1`n    const { id } = await params;'
                    $content = $content -replace 'params\.id', 'id'
                }
                # Adicionar desestruturacao de patientId
                if ($content -match 'params\.patientId' -and $content -notmatch 'const \{ patientId \} = await params') {
                    $content = $content -replace '(try\s*\{)', '$1`n    const { patientId } = await params;'
                    $content = $content -replace 'params\.patientId', 'patientId'
                }
                # Adicionar desestruturacao de clinicId
                if ($content -match 'params\.clinicId' -and $content -notmatch 'const \{ clinicId \} = await params') {
                    $content = $content -replace '(try\s*\{)', '$1`n    const { clinicId } = await params;'
                    $content = $content -replace 'params\.clinicId', 'clinicId'
                }
                # Adicionar desestruturacao de reportId
                if ($content -match 'params\.reportId' -and $content -notmatch 'const \{ reportId \} = await params') {
                    $content = $content -replace '(try\s*\{)', '$1`n    const { reportId } = await params;'
                    $content = $content -replace 'params\.reportId', 'reportId'
                }
                # Adicionar desestruturacao de action
                if ($content -match 'params\.action' -and $content -notmatch 'const \{ action \} = await params') {
                    $content = $content -replace '(try\s*\{)', '$1`n    const { action } = await params;'
                    $content = $content -replace 'params\.action', 'action'
                }
                
                # Salvar arquivo
                $content | Set-Content -Path $file
                $filesModified++
                Write-Host "  Arquivo modificado com sucesso"
            } else {
                Write-Host "  Arquivo ja estava correto ou nao precisava de correcao"
            }
        } else {
            Write-Host "  Arquivo nao encontrado: $file"
        }
        
    } catch {
        Write-Host "  ERRO ao processar: $($_.Exception.Message)"
    }
}

Write-Host "`nResumo Final:"
Write-Host "Arquivos processados: $filesProcessed"
Write-Host "Arquivos modificados: $filesModified"
Write-Host "Correcao concluida!"