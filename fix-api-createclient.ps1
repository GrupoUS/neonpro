# Fix all 'await createClient' in API routes
$basePath = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api"

Write-Host "🔧 Corrigindo chamadas 'await createClient' em API routes..." -ForegroundColor Yellow

$fixedFiles = 0
$errors = @()

function Fix-CreateClientUsage {
    param([string]$filePath)
    
    try {
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        
        # Fix: await createClient() → createClient()
        $originalContent = $content
        $content = $content -replace '(\s+)const\s+supabase\s*=\s*await\s+createClient\s*\(\s*\)', '$1const supabase = createClient()'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  ✅ Fixed: $($filePath | Split-Path -Leaf)" -ForegroundColor Green
            return $true
        }
        return $false
    }
    catch {
        $script:errors += "Error processing $filePath`: $($_.Exception.Message)"
        return $false
    }
}

# Process all TypeScript files in API routes
Get-ChildItem -Path $basePath -Recurse -Filter "*.ts" -ErrorAction SilentlyContinue | ForEach-Object {
    if (Fix-CreateClientUsage -filePath $_.FullName) {
        $fixedFiles++
    }
}

Write-Host "`n✅ Processamento concluído!" -ForegroundColor Green
Write-Host "   📁 Arquivos corrigidos: $fixedFiles" -ForegroundColor Cyan

if ($errors.Count -gt 0) {
    Write-Host "`n❌ Erros encontrados:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
}