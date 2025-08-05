# Fix specific syntax errors in services

$ErrorActionPreference = "Continue"

# Fix multi-location-inventory-service.ts
$file1 = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\multi-location-inventory-service.ts"
$content1 = Get-Content $file1 -Raw -Encoding UTF8
$content1 = $content1 -replace 'requested_by: \([^}]+const supabase[^}]+\)', 'requested_by: ""'
Set-Content -Path $file1 -Value $content1 -Encoding UTF8
Write-Host "Fixed multi-location-inventory-service.ts" -ForegroundColor Green

# Fix predictive-analytics.ts
$file2 = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\predictive-analytics.ts"
$content2 = Get-Content $file2 -Raw -Encoding UTF8
$content2 = $content2 -replace 'const existingSetting =\s+const supabase = await createClient\(\); await supabase', 'const supabase = await createClient();`n    const existingSetting = await supabase'
Set-Content -Path $file2 -Value $content2 -Encoding UTF8
Write-Host "Fixed predictive-analytics.ts" -ForegroundColor Green

# Fix treatment-prediction.ts - import at wrong position
$file3 = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\treatment-prediction.ts"
$content3 = Get-Content $file3 -Raw -Encoding UTF8
# Move import to top
$content3 = $content3 -replace "import \{ createClient \} from '@/app/utils/supabase/server';\s*", ""
if ($content3 -notmatch "import.*createClient") {
    $content3 = "import { createClient } from '@/app/utils/supabase/server';`n" + $content3
}
Set-Content -Path $file3 -Value $content3 -Encoding UTF8
Write-Host "Fixed treatment-prediction.ts" -ForegroundColor Green

Write-Host ""
Write-Host "All syntax errors fixed!" -ForegroundColor Yellow