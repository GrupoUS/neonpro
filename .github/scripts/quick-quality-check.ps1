Write-Host '🔍 Running Quick Quality Check...' -ForegroundColor Yellow
Write-Host ''

$start = Get-Date
Set-Location 'E:\neonpro'

# Check format without fixing
pnpm format:check
$formatResult = $LASTEXITCODE

# Lint with limited diagnostics  
pnpm lint:biome
$lintResult = $LASTEXITCODE

$end = Get-Date
$duration = ($end - $start).TotalSeconds

Write-Host ''
Write-Host '📊 QUICK QUALITY CHECK RESULTS' -ForegroundColor Green
Write-Host '═══════════════════════════════════════' -ForegroundColor Green

if ($formatResult -eq 0) {
    Write-Host '✅ Format Check: PASSED' -ForegroundColor Green
} else {
    Write-Host '❌ Format Check: FAILED - Run pnpm format to fix' -ForegroundColor Red
}

if ($lintResult -eq 0) {
    Write-Host '✅ Lint Check: PASSED' -ForegroundColor Green  
} else {
    Write-Host '⚠️ Lint Check: Issues Found - Run pnpm check:fix to auto-fix' -ForegroundColor Yellow
}

Write-Host "⏱️ Duration: $duration seconds" -ForegroundColor Cyan
Write-Host ''

if ($formatResult -eq 0 -and $lintResult -eq 0) {
    Write-Host '🎯 All checks passed! Code is ready.' -ForegroundColor Green
} else {
    Write-Host '🔧 Run Complete Quality Validation to fix all issues.' -ForegroundColor Yellow
}

Write-Host '═══════════════════════════════════════' -ForegroundColor Green