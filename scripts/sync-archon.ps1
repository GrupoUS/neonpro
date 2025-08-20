# Sync Archon Repository - Safe Synchronization Script
# Preserves local configurations and critical files while updating to latest version

param(
    [switch]$DryRun,
    [switch]$Force,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$ArchonPath = "D:\neonpro\archon"
$BackupPath = "D:\neonpro\archon\.backup-sync"
$LogFile = "D:\neonpro\logs\archon-sync-$(Get-Date -Format 'yyyy-MM-dd-HH-mm-ss').log"

# Ensure log directory exists
New-Item -ItemType Directory -Force -Path "D:\neonpro\logs" | Out-Null

function Write-Log {
    param($Message, $Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content -Path $LogFile -Value $logEntry
}

function Show-Header {
    Write-Host ""
    Write-Host "🔄 ARCHON SAFE SYNC UTILITY" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Backup-CriticalFiles {
    Write-Log "Creating backup of critical local files..."
    
    # Create backup directory with timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd-HH-mm-ss"
    $backupDir = Join-Path $BackupPath $timestamp
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    
    # Critical files to backup
    $criticalFiles = @(
        ".mcp.json",
        ".env"
    )
    
    # Critical directories to backup
    $criticalDirs = @(
        "PRPs",
        "migration", 
        "original_archon"
    )
    
    foreach ($file in $criticalFiles) {
        $sourcePath = Join-Path $ArchonPath $file
        if (Test-Path $sourcePath) {
            Copy-Item $sourcePath (Join-Path $backupDir $file) -Force
            Write-Log "Backed up: $file" -Level "DEBUG"
        }
    }
    
    foreach ($dir in $criticalDirs) {
        $sourcePath = Join-Path $ArchonPath $dir
        if (Test-Path $sourcePath) {
            Copy-Item $sourcePath (Join-Path $backupDir $dir) -Recurse -Force
            Write-Log "Backed up: $dir/" -Level "DEBUG"
        }
    }
    
    Write-Log "Backup completed: $backupDir"
    return $backupDir
}

function Test-GitRepository {
    Set-Location $ArchonPath
    try {
        $null = git status --porcelain 2>$null
        return $true
    }
    catch {
        return $false
    }
}

function Get-GitStatus {
    Set-Location $ArchonPath
    $status = @{
        HasChanges = $false
        BehindCount = 0
        UncommittedFiles = @()
        UntrackedFiles = @()
    }
    
    # Check for uncommitted changes
    $changes = git status --porcelain
    if ($changes) {
        $status.HasChanges = $true
        $status.UncommittedFiles = $changes | Where-Object { $_ -match '^[MADRCU]' }
        $status.UntrackedFiles = $changes | Where-Object { $_ -match '^\?\?' }
    }
    
    # Check how many commits behind
    try {
        git fetch origin main --quiet
        $behindCount = git rev-list --count HEAD..origin/main
        $status.BehindCount = [int]$behindCount
    }
    catch {
        Write-Log "Warning: Could not fetch from origin" -Level "WARN"
    }
    
    return $status
}

function Sync-Repository {
    param($BackupDir)
    
    Set-Location $ArchonPath
    
    Write-Log "Checking repository status..."
    $gitStatus = Get-GitStatus
    
    Write-Log "Git Status:"
    Write-Log "  - Uncommitted files: $($gitStatus.UncommittedFiles.Count)"
    Write-Log "  - Untracked files: $($gitStatus.UntrackedFiles.Count)" 
    Write-Log "  - Commits behind: $($gitStatus.BehindCount)"
    
    if ($DryRun) {
        Write-Log "DRY RUN MODE - No changes will be made" -Level "WARN"
        return $true
    }
    
    # Stash local changes if any
    if ($gitStatus.HasChanges) {
        Write-Log "Stashing local changes..."
        $stashMessage = "Auto-stash before sync - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        git stash push -m "$stashMessage" --include-untracked
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to stash changes" -Level "ERROR"
            return $false
        }
        Write-Log "Changes stashed successfully"
    }
    
    # Pull latest changes
    if ($gitStatus.BehindCount -gt 0) {
        Write-Log "Pulling $($gitStatus.BehindCount) commits from origin/main..."
        git pull origin main
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to pull changes" -Level "ERROR"
            # Try to restore stash if pull failed
            if ($gitStatus.HasChanges) {
                Write-Log "Attempting to restore stashed changes..."
                git stash pop
            }
            return $false
        }
        Write-Log "Repository updated successfully"
    } else {
        Write-Log "Repository is already up to date"
    }
    
    # Restore critical local files
    Restore-CriticalFiles -BackupDir $BackupDir
    
    # Try to apply stash if we had local changes
    if ($gitStatus.HasChanges) {
        Write-Log "Attempting to restore local changes..."
        git stash pop
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Merge conflicts detected. Stash preserved for manual resolution." -Level "WARN"
            Write-Log "Run 'git stash list' to see stashed changes" -Level "WARN"
        } else {
            Write-Log "Local changes restored successfully"
        }
    }
    
    return $true
}

function Restore-CriticalFiles {
    param($BackupDir)
    
    Write-Log "Restoring critical local configurations..."
    
    # Always restore these files to maintain local configuration
    $criticalFiles = @(
        ".mcp.json",
        ".env"
    )
    
    foreach ($file in $criticalFiles) {
        $backupFile = Join-Path $BackupDir $file
        $targetFile = Join-Path $ArchonPath $file
        
        if (Test-Path $backupFile) {
            Copy-Item $backupFile $targetFile -Force
            Write-Log "Restored: $file" -Level "DEBUG"
        }
    }
    
    Write-Log "Critical files restored"
}

function Show-Summary {
    param($Success, $BackupDir)
    
    Write-Host ""
    Write-Host "📊 SYNC SUMMARY" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════" -ForegroundColor Green
    
    if ($Success) {
        Write-Host "✅ Synchronization completed successfully!" -ForegroundColor Green
        Write-Host "🔒 Local configurations preserved" -ForegroundColor Cyan
        Write-Host "📦 Backup created: $BackupDir" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Synchronization failed!" -ForegroundColor Red
        Write-Host "🔒 Local files backed up: $BackupDir" -ForegroundColor Yellow
        Write-Host "📝 Check log: $LogFile" -ForegroundColor Yellow
    }
    
    Write-Host "📝 Full log: $LogFile" -ForegroundColor Gray
    Write-Host ""
}

function Main {
    Show-Header
    
    # Validate environment
    if (-not (Test-Path $ArchonPath)) {
        Write-Log "Archon directory not found: $ArchonPath" -Level "ERROR"
        exit 1
    }
    
    if (-not (Test-GitRepository)) {
        Write-Log "Not a valid Git repository: $ArchonPath" -Level "ERROR"
        exit 1
    }
    
    Write-Log "Starting Archon synchronization..."
    Write-Log "Archon Path: $ArchonPath"
    Write-Log "Dry Run: $DryRun"
    
    try {
        # Create backup first
        $backupDir = Backup-CriticalFiles
        
        # Perform synchronization
        $success = Sync-Repository -BackupDir $backupDir
        
        Show-Summary -Success $success -BackupDir $backupDir
        
        if (-not $success) {
            exit 1
        }
        
    } catch {
        Write-Log "Unexpected error: $($_.Exception.Message)" -Level "ERROR"
        Write-Log $_.ScriptStackTrace -Level "ERROR"
        exit 1
    }
    
    Write-Log "Synchronization completed successfully"
}

# Run main function
Main