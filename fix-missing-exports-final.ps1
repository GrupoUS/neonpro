# PowerShell script to fix missing exports from batch processing

$ErrorActionPreference = "Continue"

# Define corrections needed based on build output
$corrections = @{
    '@/lib/auth/webauthn-service' = @{
        # File likely has createWebAuthnService but import expects createwebAuthnService  
        'createwebAuthnService' = 'createWebAuthnService'
        'webAuthnService' = 'webAuthnService'
    }
    '@/app/lib/services/treatment-followup-service' = @{
        'treatmentFollowupService' = 'treatmentFollowupService'
    }
    '@/app/lib/services/patient-segmentation-service' = @{
        'patientSegmentationService' = 'patientSegmentationService'
    }
    '@/lib/analytics/vision-analytics' = @{
        'VisionAnalyticsEngine' = 'VisionAnalyticsEngine'
        'visionAnalyticsEngine' = 'visionAnalyticsEngine'
    }
    '@/lib/analytics/performance-monitoring' = @{
        'PerformanceMonitoringEngine' = 'PerformanceMonitoringEngine'
        'performanceMonitoringEngine' = 'performanceMonitoringEngine'
    }
    '@/lib/analytics/predictive-analytics' = @{
        'PredictiveAnalyticsEngine' = 'PredictiveAnalyticsEngine'
        'predictiveAnalyticsEngine' = 'predictiveAnalyticsEngine'
    }
}

Write-Host "🔧 Fixing missing exports..." -ForegroundColor Yellow

# Fix webauthn service exports
$webauthnFile = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\lib\auth\webauthn-service.ts"
if (Test-Path $webauthnFile) {
    Write-Host "Fixing webauthn service exports..." -ForegroundColor Cyan
    $content = Get-Content $webauthnFile -Raw
    
    # Add missing exports if they don't exist
    if ($content -notmatch "export.*createwebAuthnService") {
        $content = $content -replace "(export.*createWebAuthnService)", "export { createWebAuthnService as createwebAuthnService };`n`$1"
    }
    
    if ($content -notmatch "export.*webAuthnService") {
        $content += "`nexport const webAuthnService = createWebAuthnService();"
    }
    
    Set-Content $webauthnFile $content -Encoding UTF8
    Write-Host "✅ Fixed webauthn service" -ForegroundColor Green
}

# Fix treatment followup service
$followupFile = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\treatment-followup-service.ts"
if (Test-Path $followupFile) {
    Write-Host "Fixing treatment followup service exports..." -ForegroundColor Cyan
    $content = Get-Content $followupFile -Raw
    
    if ($content -notmatch "export.*treatmentFollowupService") {
        $content += "`nexport const treatmentFollowupService = createTreatmentFollowupService();"
    }
    
    Set-Content $followupFile $content -Encoding UTF8
    Write-Host "✅ Fixed treatment followup service" -ForegroundColor Green
}

# Fix patient segmentation service
$segmentationFile = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\patient-segmentation-service.ts"
if (Test-Path $segmentationFile) {
    Write-Host "Fixing patient segmentation service exports..." -ForegroundColor Cyan
    $content = Get-Content $segmentationFile -Raw
    
    if ($content -notmatch "export.*patientSegmentationService") {
        $content += "`nexport const patientSegmentationService = createPatientSegmentationService();"
    }
    
    Set-Content $segmentationFile $content -Encoding UTF8
    Write-Host "✅ Fixed patient segmentation service" -ForegroundColor Green
}

# Fix analytics exports
$analyticsFiles = @(
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\lib\analytics\vision-analytics.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\lib\analytics\performance-monitoring.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\lib\analytics\predictive-analytics.ts"
)

foreach ($file in $analyticsFiles) {
    if (Test-Path $file) {
        $serviceName = [System.IO.Path]::GetFileNameWithoutExtension($file)
        Write-Host "Fixing $serviceName exports..." -ForegroundColor Cyan
        
        $content = Get-Content $file -Raw
        
        # Add class and instance exports based on the service name
        switch ($serviceName) {
            "vision-analytics" {
                if ($content -notmatch "export.*VisionAnalyticsEngine") {
                    $content += "`nexport class VisionAnalyticsEngine extends createvisionAnalyticsEngine() {}"
                    $content += "`nexport const visionAnalyticsEngine = new VisionAnalyticsEngine();"
                }
            }
            "performance-monitoring" {
                if ($content -notmatch "export.*PerformanceMonitoringEngine") {
                    $content += "`nexport class PerformanceMonitoringEngine extends createperformanceMonitoringEngine() {}"
                    $content += "`nexport const performanceMonitoringEngine = new PerformanceMonitoringEngine();"
                }
            }
            "predictive-analytics" {
                if ($content -notmatch "export.*PredictiveAnalyticsEngine") {
                    $content += "`nexport class PredictiveAnalyticsEngine extends createpredictiveAnalyticsEngine() {}"
                    $content += "`nexport const predictiveAnalyticsEngine = new PredictiveAnalyticsEngine();"
                }
            }
        }
        
        Set-Content $file $content -Encoding UTF8
        Write-Host "✅ Fixed $serviceName" -ForegroundColor Green
    }
}

# Fix stock alerts service - the main error source
$stockAlertsService = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\stock-alerts-service.ts"
if (Test-Path $stockAlertsService) {
    Write-Host "Fixing stock alerts service - main error source..." -ForegroundColor Red
    $content = Get-Content $stockAlertsService -Raw
    
    # Replace any usage of 'u.omit' with proper lodash omit
    $content = $content -replace "u\.omit", "omit"
    $content = $content -replace "I\.omit", "omit"
    
    # Ensure lodash is imported
    if ($content -notmatch "import.*omit.*from.*lodash") {
        $content = "import { omit } from 'lodash';`n" + $content
    }
    
    Set-Content $stockAlertsService $content -Encoding UTF8
    Write-Host "✅ Fixed stock alerts service" -ForegroundColor Green
}

# Also check API routes that use stock alerts
$stockApiFiles = @(
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\stock\alerts\route.ts",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\stock\alerts\resolve\route.ts"
)

foreach ($file in $stockApiFiles) {
    if (Test-Path $file) {
        Write-Host "Checking stock API file: $file" -ForegroundColor Cyan
        $content = Get-Content $file -Raw
        
        # Replace any usage of 'u.omit' or 'I.omit' with proper omit
        if ($content -match "[uI]\.omit") {
            $content = $content -replace "[uI]\.omit", "omit"
            
            # Ensure lodash is imported
            if ($content -notmatch "import.*omit.*from.*lodash") {
                $content = "import { omit } from 'lodash';`n" + $content
            }
            
            Set-Content $file $content -Encoding UTF8
            Write-Host "✅ Fixed omit usage in $file" -ForegroundColor Green
        }
    }
}

Write-Host "🎉 Export fixes completed!" -ForegroundColor Green