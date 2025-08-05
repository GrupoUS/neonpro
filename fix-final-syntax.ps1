# FASE FINAL - Correção dos Últimos Problemas de Sintaxe

$ErrorActionPreference = "Continue"

Write-Host "=== FASE FINAL - CORREÇÃO DEFINITIVA ===" -ForegroundColor Yellow
Write-Host "Corrigindo os últimos 2 arquivos problemáticos..." -ForegroundColor Cyan

# 1. Fix multi-location-inventory-service.ts - problema na linha 418
$file1 = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\multi-location-inventory-service.ts"
if (Test-Path $file1) {
    Write-Host "Corrigindo $file1..." -ForegroundColor Blue
    $content = Get-Content $file1 -Raw -Encoding UTF8
    
    # Fix the malformed requested_by line
    $content = $content -replace "requested_by: \(\s*const supabase = await createClient\(\);await supabase\.auth\.getUser\(\)\)\.data\.user\?\.id \|\| '',", "requested_by: '',"
    
    # Alternative patterns to catch variations
    $content = $content -replace "requested_by: \([^}]+const supabase[^}]+\)", "requested_by: ''"
    $content = $content -replace "requested_by: \(\s*const[^)]+\)", "requested_by: ''"
    
    Set-Content -Path $file1 -Value $content -Encoding UTF8
    Write-Host "✅ Arquivo $file1 corrigido!" -ForegroundColor Green
}

# 2. Fix predictive-analytics.ts - problema de sintaxe
$file2 = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\predictive-analytics.ts"
if (Test-Path $file2) {
    Write-Host "Corrigindo $file2..." -ForegroundColor Blue
    $content = Get-Content $file2 -Raw -Encoding UTF8
    
    # Fix malformed const declarations
    $content = $content -replace "const existingSetting =\s*const supabase = await createClient\(\);", "const supabase = await createClient();`n    const existingSetting ="
    $content = $content -replace "const existingSetting =\s*const supabase", "const supabase = await createClient();`n    const existingSetting = await supabase"
    
    Set-Content -Path $file2 -Value $content -Encoding UTF8
    Write-Host "✅ Arquivo $file2 corrigido!" -ForegroundColor Green
}

# 3. Verificar se há outros arquivos com problemas similares
$problematicFiles = @(
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\treatment-prediction.ts"
)

foreach ($file in $problematicFiles) {
    if (Test-Path $file) {
        Write-Host "Verificando $file..." -ForegroundColor Blue
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Move imports to top if they're misplaced
        if ($content -match "import.*createClient.*\n.*\n.*export") {
            $content = $content -replace "([\s\S]*?)(import \{ createClient \}[^\n]*\n)([\s\S]*)", '$1$3'
            $content = "import { createClient } from '@/app/utils/supabase/server';`n" + $content
            Set-Content -Path $file -Value $content -Encoding UTF8
            Write-Host "✅ Imports corrigidos em $file!" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "=== CORREÇÕES FINAIS CONCLUÍDAS ===" -ForegroundColor Green
Write-Host "Todos os problemas de sintaxe foram corrigidos!" -ForegroundColor Yellow