# Apply Biome fixes to security package
Set-Location "E:\neonpro"

Write-Host "Running Biome check for security package..." -ForegroundColor Green
npx @biomejs/biome check packages/security/src --verbose

Write-Host "`nApplying Biome auto-fixes..." -ForegroundColor Yellow
npx @biomejs/biome check packages/security/src --apply

Write-Host "`nFinal check after fixes..." -ForegroundColor Green
npx @biomejs/biome check packages/security/src --verbose

Write-Host "`nBiome fixes completed!" -ForegroundColor Cyan