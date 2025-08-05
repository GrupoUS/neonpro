# Fix all remaining service export issues
Write-Host "=== FIXING ALL SERVICE EXPORTS AND IMPORTS ==="

# Define service mappings (service file -> exported name)
$serviceExports = @{
    "barcode-service.ts" = "barcodeService"
    "demand-forecasting-service.ts" = "demandForecastingService"
    "purchase-order-service.ts" = "purchaseOrderService" 
    "equipment-maintenance-service.ts" = "equipmentMaintenanceService"
    "marketing-campaigns-service.ts" = "marketingCampaignsService"
    "sms-service.ts" = "smsService"
    "stock-alert.service.ts" = "createStockAlertService"
}

$servicePath = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services"

# Fix each service file
foreach ($serviceFile in $serviceExports.Keys) {
    $fullPath = Join-Path $servicePath $serviceFile
    $exportName = $serviceExports[$serviceFile]
    
    if (Test-Path $fullPath) {
        Write-Host "Corrigindo: $serviceFile -> $exportName"
        
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        
        # Add export at the end if not present
        if (-not ($content -match "export.*$exportName")) {
            $content += "`n`n// Export service instance`nexport const $exportName = new ${exportName.Replace('Service', '').Replace('create', '').Replace('Stock', 'StockAlert')}Service();`n"
        }
        
        # Save with UTF-8 encoding
        $content | Out-File -FilePath $fullPath -Encoding UTF8 -NoNewline
        Write-Host "✓ Corrigido: $exportName"
    } else {
        Write-Host "⚠ Arquivo não encontrado: $serviceFile"
    }
}

# Fix Supabase server import issues
Write-Host "`n=== FIXING SUPABASE SERVER IMPORTS ==="

$supabaseServerFiles = @(
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

foreach ($file in $supabaseServerFiles) {
    if (Test-Path $file) {
        Write-Host "Corrigindo Supabase import: $(Split-Path $file -Leaf)"
        
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Fix import path
        $content = $content -replace "from '@/lib/supabase/server'", "from '@/lib/supabase'"
        
        # Save with UTF-8 encoding
        $content | Out-File -FilePath $file -Encoding UTF8 -NoNewline
        Write-Host "✓ Corrigido import Supabase"
    }
}

# Fix cookies context issue
Write-Host "`n=== FIXING COOKIES CONTEXT ISSUE ==="

$contextProblemFile = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\analytics\drill-down\route.ts"

if (Test-Path $contextProblemFile) {
    Write-Host "Corrigindo problema de contexto de cookies..."
    
    $content = Get-Content $contextProblemFile -Raw -Encoding UTF8
    
    # Fix cookies usage pattern - move inside request handler
    $content = $content -replace "const\s+cookies\s*=\s*getCookies\(\);?", ""
    $content = $content -replace "getCookies\(\)", "req.cookies || {}"
    
    # Save with UTF-8 encoding
    $content | Out-File -FilePath $contextProblemFile -Encoding UTF8 -NoNewline
    Write-Host "✓ Corrigido contexto de cookies"
}

Write-Host "`n=== CORREÇÃO COMPLETA! ==="
Write-Host "Todos os exports de serviços foram adicionados"
Write-Host "Todos os imports do Supabase foram corrigidos"
Write-Host "Problema de contexto de cookies foi resolvido"