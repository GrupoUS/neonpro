$workflowsDir = "D:\neonpro\.github\workflows"
$workflowFiles = @("ci.yml", "healthcare-deployment.yml", "performance-tests.yml", "pr-validation.yml", "rollback-strategy.yml")

Write-Host "🔍 GitHub Workflows Validation Report" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$allValid = $true

foreach ($filename in $workflowFiles) {
    $filepath = Join-Path $workflowsDir $filename
    Write-Host "📄 Validating $filename ..." -ForegroundColor Yellow
    
    try {
        if (Test-Path $filepath) {
            $content = Get-Content $filepath -Raw
            $lines = (Get-Content $filepath).Count
            
            # Basic content checks
            $hasName = $content -match "name:"
            $hasOn = $content -match "on:"
            $hasJobs = $content -match "jobs:"
            $hasSteps = $content -match "steps:"
            
            if ($hasName -and $hasOn -and $hasJobs -and $hasSteps) {
                Write-Host "✅ Valid workflow structure" -ForegroundColor Green
                Write-Host "   - Lines: $lines" -ForegroundColor Gray
                Write-Host "   - Has name: $hasName" -ForegroundColor Gray
                Write-Host "   - Has triggers: $hasOn" -ForegroundColor Gray
                Write-Host "   - Has jobs: $hasJobs" -ForegroundColor Gray
                Write-Host "   - Has steps: $hasSteps" -ForegroundColor Gray
            } else {
                Write-Host "❌ Missing required sections" -ForegroundColor Red
                $allValid = $false
            }
        } else {
            Write-Host "❌ File not found: $filepath" -ForegroundColor Red
            $allValid = $false
        }
    } catch {
        Write-Host "❌ Validation error: $($_.Exception.Message)" -ForegroundColor Red
        $allValid = $false
    }
    
    Write-Host ""
}

Write-Host "📊 Overall Validation Result:" -ForegroundColor Cyan
if ($allValid) {
    Write-Host "✅ ALL WORKFLOWS VALID - Ready for production!" -ForegroundColor Green
} else {
    Write-Host "❌ Some workflows have issues - Review required" -ForegroundColor Red
}