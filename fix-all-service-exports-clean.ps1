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
            $className = $exportName.Replace('Service', '').Replace('create', '').Replace('Stock', 'StockAlert')
            $content += "`n`n// Export service instance`nexport const $exportName = new ${className}Service();`n"
        }
        
        # Save with UTF-8 encoding
        $content | Out-File -FilePath $fullPath -Encoding UTF8 -NoNewline
        Write-Host "OK Corrigido: $exportName"
    } else {
        Write-Host "ERRO Arquivo nao encontrado: $serviceFile"
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
        $fileName = Split-Path $file -Leaf
        Write-Host "Corrigindo Supabase import: $fileName"
        
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Fix import path
        $content = $content -replace "from '@/lib/supabase/server'", "from '@/lib/supabase'"
        
        # Save with UTF-8 encoding
        $content | Out-File -FilePath $file -Encoding UTF8 -NoNewline
        Write-Host "OK Corrigido import Supabase"
    }
}

Write-Host "`n=== CORRECAO COMPLETA! ==="
Write-Host "Todos os exports de servicos foram adicionados"
Write-Host "Todos os imports do Supabase foram corrigidos"