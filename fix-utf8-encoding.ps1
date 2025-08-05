# Script para corrigir encoding UTF-8 dos arquivos problemáticos

$ErrorActionPreference = "Continue"

Write-Host "=== CORREÇÃO DE ENCODING UTF-8 ===" -ForegroundColor Yellow

$files = @(
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\predictive-analytics.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\purchase-order-service.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\sms-service.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\stock-alert.service.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\stock-alerts.service.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        try {
            Write-Host "Corrigindo encoding: $(Split-Path $file -Leaf)" -ForegroundColor Blue
            
            # Ler com diferentes encodings e converter para UTF-8
            $content = $null
            try {
                $content = Get-Content $file -Raw -Encoding UTF8
            } catch {
                try {
                    $content = Get-Content $file -Raw -Encoding Default
                } catch {
                    $content = Get-Content $file -Raw -Encoding ASCII
                }
            }
            
            if ($content) {
                # Salvar em UTF-8 sem BOM
                $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                [System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
                Write-Host "✅ Corrigido: $(Split-Path $file -Leaf)" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ Erro: $(Split-Path $file -Leaf) - $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ Não encontrado: $(Split-Path $file -Leaf)" -ForegroundColor Yellow
    }
}

Write-Host "✅ Correção de encoding concluída!" -ForegroundColor Green