# Final syntax fixes for critical parsing errors

$ErrorActionPreference = "Continue"

# Fix multi-location-inventory-service.ts
$file1 = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\multi-location-inventory-service.ts"
if (Test-Path $file1) {
    $content = Get-Content $file1 -Raw -Encoding UTF8
    $content = $content -replace "requested_by: \(\s*const supabase[^}]+\}", "requested_by: ''"
    Set-Content -Path $file1 -Value $content -Encoding UTF8
    Write-Host "Fixed $file1" -ForegroundColor Green
}

# Fix predictive-analytics.ts  
$file2 = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\predictive-analytics.ts"
if (Test-Path $file2) {
    $content = Get-Content $file2 -Raw -Encoding UTF8
    $content = $content -replace "const existingSetting =\s*const supabase", "const supabase = await createClient();`n    const existingSetting = await supabase"
    Set-Content -Path $file2 -Value $content -Encoding UTF8
    Write-Host "Fixed $file2" -ForegroundColor Green
}

# Fix lgpd breach-detection.ts
$file3 = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\lgpd\breach-detection\breach-detection.ts"
if (Test-Path $file3) {
    $content = Get-Content $file3 -Raw -Encoding UTF8
    # Add missing closing braces if needed
    $openBraces = ($content -split '\{').Count - 1
    $closeBraces = ($content -split '\}').Count - 1
    if ($openBraces -gt $closeBraces) {
        $diff = $openBraces - $closeBraces
        $content += "`n" + ("}" * $diff)
        Set-Content -Path $file3 -Value $content -Encoding UTF8
        Write-Host "Fixed $file3 - added missing $diff closing braces" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Critical syntax errors fixed!" -ForegroundColor Yellow