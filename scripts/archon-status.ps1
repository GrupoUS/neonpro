# Archon Status Check
$ArchonPath = "D:\neonpro\archon"

Write-Host ""
Write-Host "ARCHON SYNC STATUS" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if directory exists
if (-not (Test-Path $ArchonPath)) {
    Write-Host "ERROR: Archon directory not found: $ArchonPath" -ForegroundColor Red
    exit 1
}

# Check Git status
Set-Location $ArchonPath

# Check behind count
git fetch origin main --quiet
$behindCount = git rev-list --count HEAD..origin/main
if ($behindCount -gt 0) {
    Write-Host "Repository: $behindCount commits behind origin/main" -ForegroundColor Yellow
} else {
    Write-Host "Repository: Up to date with origin/main" -ForegroundColor Green
}

# Check local changes
$status = git status --porcelain
if ($status) {
    $changedFiles = ($status | Measure-Object).Count
    Write-Host "Local Changes: $changedFiles files modified" -ForegroundColor Yellow
} else {
    Write-Host "Working Directory: Clean" -ForegroundColor Green
}

# Check stashes
$stashes = git stash list
if ($stashes) {
    $stashCount = ($stashes | Measure-Object).Count
    Write-Host "Git Stashes: $stashCount available" -ForegroundColor Yellow
} else {
    Write-Host "Git Stashes: None" -ForegroundColor Green
}

Write-Host ""
Write-Host "CRITICAL FILES STATUS" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Check critical files
if (Test-Path ".mcp.json") { Write-Host "MCP Config: Present" -ForegroundColor Green } else { Write-Host "MCP Config: Missing" -ForegroundColor Red }
if (Test-Path ".env") { Write-Host "Environment: Present" -ForegroundColor Green } else { Write-Host "Environment: Missing" -ForegroundColor Red }
if (Test-Path "PRPs") { Write-Host "PRPs: Present" -ForegroundColor Green } else { Write-Host "PRPs: Missing" -ForegroundColor Red }
if (Test-Path "migration") { Write-Host "Migration: Present" -ForegroundColor Green } else { Write-Host "Migration: Missing" -ForegroundColor Red }

Write-Host ""
Write-Host "COMMANDS" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Manual Sync: powershell -ExecutionPolicy Bypass -File D:\neonpro\scripts\sync-archon.ps1"
Write-Host "View Stashes: git stash list"
Write-Host "Apply Stash: git stash pop"
Write-Host ""