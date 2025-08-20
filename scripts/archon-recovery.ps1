# Archon Recovery and Cleanup Tool
$ArchonPath = "D:\neonpro\archon"

Write-Host ""
Write-Host "ARCHON RECOVERY TOOL" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $ArchonPath

Write-Host "Fixing Git repository state..." -ForegroundColor Yellow

# Remove git lock files if they exist
if (Test-Path ".git/index.lock") {
    Remove-Item ".git/index.lock" -Force
    Write-Host "Removed index.lock file" -ForegroundColor Green
}

if (Test-Path ".git/HEAD.lock") {
    Remove-Item ".git/HEAD.lock" -Force
    Write-Host "Removed HEAD.lock file" -ForegroundColor Green
}

# Reset the git index
Write-Host "Resetting git index..." -ForegroundColor Yellow
git reset --mixed HEAD

# Clean up untracked files (but preserve critical directories)
Write-Host "Cleaning repository..." -ForegroundColor Yellow
git clean -fd -e ".mcp.json" -e ".env" -e "PRPs/" -e "migration/" -e "original_archon/"

# Refresh repository status
Write-Host "Checking repository status..." -ForegroundColor Yellow
git status --porcelain

Write-Host ""
Write-Host "Recovery complete!" -ForegroundColor Green
Write-Host "You can now run sync again if needed." -ForegroundColor Cyan
Write-Host ""