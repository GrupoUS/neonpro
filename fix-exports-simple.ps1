# Simple script to fix missing exports

$ErrorActionPreference = "Continue"

Write-Host "Fixing missing exports..." -ForegroundColor Yellow

# Fix webauthn service exports
$webauthnFile = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\lib\auth\webauthn-service.ts"
if (Test-Path $webauthnFile) {
    Write-Host "Fixing webauthn service exports..." -ForegroundColor Cyan
    $content = Get-Content $webauthnFile -Raw
    
    # Add missing exports
    if ($content -notmatch "export.*webAuthnService") {
        $content += "`n`nexport const webAuthnService = createWebAuthnService();"
    }
    
    Set-Content $webauthnFile $content -Encoding UTF8
    Write-Host "Fixed webauthn service" -ForegroundColor Green
}

# Fix treatment followup service
$followupFile = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\treatment-followup-service.ts"
if (Test-Path $followupFile) {
    Write-Host "Fixing treatment followup service exports..." -ForegroundColor Cyan
    $content = Get-Content $followupFile -Raw
    
    if ($content -notmatch "export.*treatmentFollowupService") {
        $content += "`n`nexport const treatmentFollowupService = createTreatmentFollowupService();"
    }
    
    Set-Content $followupFile $content -Encoding UTF8
    Write-Host "Fixed treatment followup service" -ForegroundColor Green
}

# Fix patient segmentation service
$segmentationFile = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services\patient-segmentation-service.ts"
if (Test-Path $segmentationFile) {
    Write-Host "Fixing patient segmentation service exports..." -ForegroundColor Cyan
    $content = Get-Content $segmentationFile -Raw
    
    if ($content -notmatch "export.*patientSegmentationService") {
        $content += "`n`nexport const patientSegmentationService = createPatientSegmentationService();"
    }
    
    Set-Content $segmentationFile $content -Encoding UTF8
    Write-Host "Fixed patient segmentation service" -ForegroundColor Green
}

Write-Host "Export fixes completed!" -ForegroundColor Green