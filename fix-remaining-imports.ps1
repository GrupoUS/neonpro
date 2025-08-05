# Fix remaining incorrect Supabase import paths
# Find all TypeScript files and replace incorrect imports

$rootPath = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src"
$oldImport = '@/app/utils/supabase'
$newImport = '@/lib/supabase'

Write-Host "Fixing remaining incorrect Supabase imports..." -ForegroundColor Yellow

# Get all .ts files recursively
$files = Get-ChildItem -Path $rootPath -Recurse -Filter "*.ts" | Where-Object { !$_.PSIsContainer }

$totalFiles = $files.Count
$fixedFiles = 0

foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw
        
        if ($content -match [regex]::Escape($oldImport)) {
            $newContent = $content -replace [regex]::Escape($oldImport), $newImport
            Set-Content -Path $file.FullName -Value $newContent -NoNewline
            $fixedFiles++
            Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "Error processing $($file.FullName): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "Total files scanned: $totalFiles" -ForegroundColor White
Write-Host "Files fixed: $fixedFiles" -ForegroundColor Green
Write-Host "Import fix completed!" -ForegroundColor Yellow