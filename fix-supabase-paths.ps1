# Fix Supabase imports
Write-Host "=== FIXING SUPABASE IMPORT PATHS ==="

$supabaseFiles = @(
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\security\audit\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\treatment-prediction\analytics\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\treatment-prediction\batch\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\treatment-prediction\feedback\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\treatment-prediction\models\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\treatment-prediction\performance\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\treatment-prediction\predictions\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\treatment-prediction\training\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\treatment-prediction.ts"
)

foreach ($file in $supabaseFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Write-Host "Corrigindo: $fileName"
        
        $content = Get-Content $file -Raw -Encoding UTF8
        $content = $content -replace "from '@/lib/supabase'", "from '@/lib/supabase/server'"
        $content | Out-File -FilePath $file -Encoding UTF8 -NoNewline
        
        Write-Host "OK: $fileName"
    }
}

Write-Host "`n=== CORRECAO COMPLETA! ==="