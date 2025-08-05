# Script final para corrigir encoding UTF-8

$ErrorActionPreference = "Continue"

Write-Host "=== CORREÇÃO FINAL DE ENCODING ===" -ForegroundColor Yellow

$directory = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services"

Get-ChildItem -Path $directory -Filter "*.ts" | ForEach-Object {
    try {
        Write-Host "Processando: $($_.Name)" -ForegroundColor Blue
        
        $content = Get-Content $_.FullName -Raw -Encoding UTF8
        
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($_.FullName, $content, $utf8NoBom)
        
        Write-Host "✅ Corrigido: $($_.Name)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro: $($_.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "✅ Correção completa!" -ForegroundColor Green