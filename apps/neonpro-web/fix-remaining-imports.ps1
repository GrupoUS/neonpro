# Script para Corrigir Imports Restantes - Fase 3B
Write-Host "FASE 3B - Correção de Imports Restantes" -ForegroundColor Cyan

$fixes = @{
    "@/app/types/demand-forecasting" = "@/types/demand-forecasting"
    "@/lib/services/patient-portal-auth" = "@/lib/auth-advanced/patient-portal-auth" 
    "@/lib/utils/pwa-config" = "@/lib/auth-advanced/pwa-config"
    "@/lib/utils/patient-portal-validation" = "@/lib/auth-advanced/patient-portal-validation"
    "@/lib/utils/supabase/server" = "@/app/utils/supabase/server"
}

$srcPath = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src"
$totalFixes = 0

# Buscar todos os arquivos TypeScript
$allFiles = Get-ChildItem -Path $srcPath -Recurse -Include "*.ts", "*.tsx" | Where-Object { $_.FullName -notlike "*node_modules*" }

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    $originalContent = $content
    
    if ($content) {
        # Aplicar todas as correções
        foreach ($oldPath in $fixes.Keys) {
            $newPath = $fixes[$oldPath]
            $content = $content -replace [regex]::Escape($oldPath), $newPath
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            Write-Host "Corrigido: $($file.Name)" -ForegroundColor Green
            $totalFixes++
        }
    }
}

Write-Host "Total de arquivos corrigidos: $totalFixes" -ForegroundColor Green