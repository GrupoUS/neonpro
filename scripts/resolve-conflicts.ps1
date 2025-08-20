# Archon Conflict Resolution Helper
$ArchonPath = "D:\neonpro\archon"

Write-Host ""
Write-Host "ARCHON CONFLICT RESOLUTION" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $ArchonPath

# Check for stashes
$stashes = git stash list
if (-not $stashes) {
    Write-Host "No conflicts found - repository is clean!" -ForegroundColor Green
    exit 0
}

Write-Host "Found stashed changes (conflicts from sync):" -ForegroundColor Yellow
git stash list

Write-Host ""
Write-Host "RESOLUTION OPTIONS:" -ForegroundColor White
Write-Host "===========================================" -ForegroundColor White
Write-Host "1. Keep local changes (your files priority)"
Write-Host "2. Accept remote changes (GitHub version)"  
Write-Host "3. Manual merge (interactive)"
Write-Host "4. View stash details"
Write-Host "5. Cancel"
Write-Host ""

$choice = Read-Host "Choose option (1-5)"

switch ($choice) {
    "1" {
        Write-Host "Keeping local changes..." -ForegroundColor Yellow
        git stash drop
        Write-Host "Local changes preserved. Sync complete!" -ForegroundColor Green
    }
    
    "2" {
        Write-Host "Accepting remote changes..." -ForegroundColor Yellow
        git reset --hard origin/main
        git stash drop
        Write-Host "Remote changes applied. Local changes discarded!" -ForegroundColor Red
    }
    
    "3" {
        Write-Host "Starting manual merge..." -ForegroundColor Yellow
        git stash pop
        Write-Host "Conflicts applied to working directory." -ForegroundColor Yellow
        Write-Host "Use 'git status' to see conflicts." -ForegroundColor Cyan
        Write-Host "After resolving, use 'git add .' and 'git commit'" -ForegroundColor Cyan
    }
    
    "4" {
        Write-Host "Stash details:" -ForegroundColor Cyan
        git stash show -p
    }
    
    default {
        Write-Host "Operation cancelled" -ForegroundColor Yellow
    }
}

Write-Host ""