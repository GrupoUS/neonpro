# Fix service export issues with correct class names
Write-Host "=== FIXING SERVICE CLASS NAMES AND EXPORTS ==="

# Map of service files to correct content
$serviceFiles = @{
    "stock-alert.service.ts" = "export const createStockAlertService = new StockAlertService();"
    "demand-forecasting-service.ts" = "export const demandForecastingService = new DemandForecastingService();"
    "purchase-order-service.ts" = "export const purchaseOrderService = new PurchaseOrderService();"
    "equipment-maintenance-service.ts" = "export const equipmentMaintenanceService = new EquipmentMaintenanceService();"
    "marketing-campaigns-service.ts" = "export const marketingCampaignsService = new MarketingCampaignsService();"
    "sms-service.ts" = "export const smsService = new SmsService();"
    "barcode-service.ts" = "export const barcodeService = new BarcodeService();"
}

$servicePath = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services"

# Fix each service file
foreach ($serviceFile in $serviceFiles.Keys) {
    $fullPath = Join-Path $servicePath $serviceFile
    $correctExport = $serviceFiles[$serviceFile]
    
    if (Test-Path $fullPath) {
        Write-Host "Corrigindo: $serviceFile"
        
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        
        # Remove any incorrect exports
        $content = $content -replace "export const .* = new .*Service\(\);", ""
        
        # Add correct export at the end
        $content = $content.TrimEnd() + "`n`n// Export service instance`n$correctExport`n"
        
        # Save with UTF-8 encoding
        $content | Out-File -FilePath $fullPath -Encoding UTF8 -NoNewline
        Write-Host "OK: $serviceFile"
    }
}

# Also need to fix the import issue with createServerClient
Write-Host "`n=== FIXING SUPABASE createServerClient IMPORT ==="

$supabaseServerFile = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\lib\supabase\server.ts"

if (Test-Path $supabaseServerFile) {
    Write-Host "Verificando arquivo server.ts do Supabase..."
    $content = Get-Content $supabaseServerFile -Raw -Encoding UTF8
    
    # Check if createServerClient is exported
    if ($content -match "export.*createServerClient") {
        Write-Host "createServerClient já está exportado"
    } else {
        Write-Host "Adicionando export para createServerClient"
        $content += "`n`n// Ensure createServerClient is exported`nexport { createClient as createServerClient } from './client';`n"
        $content | Out-File -FilePath $supabaseServerFile -Encoding UTF8 -NoNewline
    }
}

Write-Host "`n=== CORRECAO COMPLETA! ==="