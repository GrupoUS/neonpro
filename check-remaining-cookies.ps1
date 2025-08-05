# Script para verificar ocorrências restantes de cookies()
Write-Host "=== VERIFICANDO COOKIES() RESTANTES ==="

# Buscar por cookies() em todos os arquivos TS/TSX/JS/JSX
$files = Get-ChildItem -Path . -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" | Where-Object { $_.FullName -notmatch "node_modules|\.git|dist|build" }

$foundCookies = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Encoding UTF8
    $lineNumber = 0
    
    foreach ($line in $content) {
        $lineNumber++
        if ($line -match "cookies\(\)") {
            $foundCookies += [PSCustomObject]@{
                File = $file.FullName
                Line = $lineNumber
                Content = $line.Trim()
            }
        }
    }
}

if ($foundCookies.Count -eq 0) {
    Write-Host "✅ Nenhuma ocorrência de cookies() encontrada!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Encontradas $($foundCookies.Count) ocorrências de cookies():" -ForegroundColor Yellow
    foreach ($cookie in $foundCookies) {
        Write-Host "📁 $($cookie.File):$($cookie.Line)" -ForegroundColor Cyan
        Write-Host "   $($cookie.Content)" -ForegroundColor White
    }
}

Write-Host "=== VERIFICAÇÃO COMPLETA ==="