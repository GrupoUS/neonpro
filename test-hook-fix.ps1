Write-Host "Testing pre-commit hook fixes..." -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Environment Information:" -ForegroundColor Cyan
Write-Host "  System: Windows" -ForegroundColor White
Write-Host "  PowerShell: $($PSVersionTable.PSVersion)" -ForegroundColor White
Write-Host "  Directory: $(Get-Location)" -ForegroundColor White

Write-Host ""
Write-Host "Testing available commands:" -ForegroundColor Cyan

$commands = @('node', 'npm', 'npx', 'pnpm')
foreach ($cmd in $commands) {
    try {
        $null = Get-Command $cmd -ErrorAction Stop
        Write-Host "  OK $cmd : Available" -ForegroundColor Green
    }
    catch {
        Write-Host "  FAIL $cmd : Not found" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Checking configurations:" -ForegroundColor Cyan

# Check package.json
if (Test-Path "package.json") {
    Write-Host "  OK package.json: Found" -ForegroundColor Green
    
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.'lint-staged') {
        Write-Host "  OK lint-staged: Configured" -ForegroundColor Green
    } else {
        Write-Host "  WARN lint-staged: Not configured" -ForegroundColor Yellow
    }
} else {
    Write-Host "  FAIL package.json: Not found" -ForegroundColor Red
}

# Check husky hooks
if (Test-Path ".husky") {
    Write-Host "  OK .husky: Directory found" -ForegroundColor Green
    
    if (Test-Path ".husky/pre-commit") {
        Write-Host "  OK pre-commit hook: Found" -ForegroundColor Green
    } else {
        Write-Host "  FAIL pre-commit hook: Not found" -ForegroundColor Red
    }
    
    if (Test-Path ".husky/common.sh") {
        Write-Host "  OK common.sh: Found" -ForegroundColor Green
    } else {
        Write-Host "  FAIL common.sh: Not found" -ForegroundColor Red
    }
} else {
    Write-Host "  FAIL .husky: Directory not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To test the complete hook, run:" -ForegroundColor Cyan
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m 'test: verify pre-commit fixes'" -ForegroundColor White
Write-Host ""