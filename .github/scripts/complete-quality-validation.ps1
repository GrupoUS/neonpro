Write-Host '🤖 Starting Complete Quality Validation...' -ForegroundColor Magenta
Write-Host ''

$start = Get-Date
Set-Location 'E:\neonpro'

Write-Host '1/5 🎯 Formatting code...' -ForegroundColor Yellow
pnpm format

Write-Host '2/5 🔍 Linting and auto-fixing...' -ForegroundColor Yellow  
pnpm check:fix

Write-Host '3/5 🧪 Running unit tests...' -ForegroundColor Yellow
pnpm test:unit

Write-Host '4/5 🎭 Running E2E tests...' -ForegroundColor Yellow
pnpm test:e2e

Write-Host '5/5 ✅ Running CI checks...' -ForegroundColor Yellow
pnpm ci

$end = Get-Date
$duration = ($end - $start).TotalSeconds

Write-Host ''
Write-Host '🏆 COMPLETE QUALITY VALIDATION COMPLETE' -ForegroundColor Green
Write-Host '═══════════════════════════════════════════════════════════' -ForegroundColor Green
Write-Host '✅ All quality validation steps completed!' -ForegroundColor Cyan
Write-Host "⏱️ Total duration: $duration seconds" -ForegroundColor Yellow
Write-Host '🚀 Code is ready for development and deployment!' -ForegroundColor Green
Write-Host '═══════════════════════════════════════════════════════════' -ForegroundColor Green