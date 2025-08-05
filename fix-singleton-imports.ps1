# Fix imports to use factory functions instead of singleton exports
Write-Host "=== Fixing Singleton Imports ===" -ForegroundColor Green

# Mapping of old singleton names to new factory function names
$singletonMappings = @{
    'auditSystem' = 'createauditSystem'
    'webAuthnService' = 'createwebAuthnService'
    'automatedBeforeAfterAnalysisService' = 'createautomatedBeforeAfterAnalysisService'
    'treatmentFollowupService' = 'createtreatmentFollowupService'
    'inventoryReportsService' = 'createinventoryReportsService'
    'marketingROIService' = 'createmarketingROIService'
    'systemIntegrationManager' = 'createsystemIntegrationManager'
    'medicalTimelineService' = 'createmedicalTimelineService'
    'personalizedRecommendationsService' = 'createpersonalizedRecommendationsService'
    'revenueOptimizationEngine' = 'createrevenueOptimizationEngine'
    'unifiedSearchSystem' = 'createunifiedSearchSystem'
    'patientSegmentationService' = 'createpatientSegmentationService'
    'whatsAppService' = 'createwhatsAppService'
    'visionAnalyticsEngine' = 'createvisionAnalyticsEngine'
    'performanceMonitoringEngine' = 'createperformanceMonitoringEngine'
    'predictiveAnalyticsEngine' = 'createpredictiveAnalyticsEngine'
    'kpiCalculationService' = 'createkpiCalculationService'
}

$filesFixed = 0
$totalReplacements = 0

# Find all TypeScript files in API routes and other directories
$searchPaths = @(
    "apps\neonpro-web\src\app\api",
    "apps\neonpro-web\src\lib",
    "apps\neonpro-web\src\components"
)

foreach ($basePath in $searchPaths) {
    $fullPath = Join-Path $PWD $basePath
    if (Test-Path $fullPath) {
        Write-Host "Searching in: $fullPath" -ForegroundColor Yellow
        
        $files = Get-ChildItem -Path $fullPath -Filter "*.ts" -Recurse | Where-Object { $_.Name -notlike "*.d.ts" }
        
        foreach ($file in $files) {
            $content = Get-Content -Path $file.FullName -Encoding UTF8
            $originalContent = $content -join "`n"
            $newContent = $originalContent
            $fileChanged = $false
            
            foreach ($oldName in $singletonMappings.Keys) {
                $newName = $singletonMappings[$oldName]
                
                # Pattern 1: Direct usage like serviceName.method()
                $pattern1 = "\b$oldName\."
                $replacement1 = "$newName()."
                if ($newContent -match $pattern1) {
                    $newContent = $newContent -replace $pattern1, $replacement1
                    $fileChanged = $true
                    $totalReplacements++
                    Write-Host "  Fixed direct usage: $oldName -> $newName()" -ForegroundColor Cyan
                }
                
                # Pattern 2: Import statements
                $pattern2 = "import.*\b$oldName\b.*from"
                if ($newContent -match $pattern2) {
                    $newContent = $newContent -replace "\b$oldName\b", $newName
                    $fileChanged = $true
                    $totalReplacements++
                    Write-Host "  Fixed import: $oldName -> $newName" -ForegroundColor Cyan
                }
                
                # Pattern 3: Re-export statements
                $pattern3 = "export.*\b$oldName\b"
                if ($newContent -match $pattern3) {
                    $newContent = $newContent -replace "\b$oldName\b", $newName
                    $fileChanged = $true
                    $totalReplacements++
                    Write-Host "  Fixed export: $oldName -> $newName" -ForegroundColor Cyan
                }
            }
            
            if ($fileChanged) {
                try {
                    Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
                    Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
                    $filesFixed++
                } catch {
                    Write-Host "Error writing to: $($file.FullName) - $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Green
Write-Host "Files fixed: $filesFixed" -ForegroundColor White
Write-Host "Total replacements: $totalReplacements" -ForegroundColor White
Write-Host "Fix complete!" -ForegroundColor Green