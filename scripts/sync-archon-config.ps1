# Archon Sync Configuration and Automation Setup
# Creates automated sync tasks and monitoring

param(
    [ValidateSet("Setup", "Enable", "Disable", "Status", "RunNow")]
    [string]$Action = "Setup",
    [int]$SyncIntervalHours = 6
)

$ErrorActionPreference = "Stop"
$ScriptPath = "D:\neonpro\scripts\sync-archon.ps1"
$TaskName = "ArchonAutoSync"
$LogPath = "D:\neonpro\logs\archon-sync-automation.log"

function Write-Log {
    param($Message, $Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    Add-Content -Path $LogPath -Value $logEntry -ErrorAction SilentlyContinue
}

function Show-Header {
    Write-Host ""
    Write-Host "⚙️  ARCHON SYNC AUTOMATION MANAGER" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════" -ForegroundColor Magenta
    Write-Host ""
}

function Test-AdminRights {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Setup-SyncAutomation {
    Write-Log "Setting up Archon sync automation..."
    
    # Check if running as administrator for scheduled task creation
    if (-not (Test-AdminRights)) {
        Write-Host "⚠️  Administrator rights required for scheduled task setup" -ForegroundColor Yellow
        Write-Host "Run as Administrator or use manual sync: .\sync-archon.ps1" -ForegroundColor Yellow
        return $false
    }
    
    # Create scheduled task for automatic sync
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ScriptPath`""
    $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(5) -RepetitionInterval (New-TimeSpan -Hours $SyncIntervalHours) -RepetitionDuration (New-TimeSpan -Days 365)
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    
    $task = New-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Automatic Archon repository synchronization"
    
    try {
        Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force
        Write-Log "Scheduled task '$TaskName' created successfully"
        Write-Host "✅ Automated sync enabled (every $SyncIntervalHours hours)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Log "Failed to create scheduled task: $($_.Exception.Message)" -Level "ERROR"
        Write-Host "❌ Failed to create scheduled task" -ForegroundColor Red
        return $false
    }
}

function Enable-AutoSync {
    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Enable-ScheduledTask -TaskName $TaskName
        Write-Log "Auto-sync enabled"
        Write-Host "✅ Auto-sync enabled" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Scheduled task not found. Run with -Action Setup first" -ForegroundColor Yellow
    }
}

function Disable-AutoSync {
    if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
        Disable-ScheduledTask -TaskName $TaskName
        Write-Log "Auto-sync disabled"
        Write-Host "🛑 Auto-sync disabled" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  Scheduled task not found" -ForegroundColor Yellow
    }
}

function Show-Status {
    Write-Host "📊 ARCHON SYNC STATUS" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    
    # Check scheduled task status
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($task) {
        Write-Host "📅 Scheduled Task: $($task.State)" -ForegroundColor $(if ($task.State -eq "Ready") { "Green" } else { "Yellow" })
        Write-Host "⏰ Next Run: $((Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo).NextRunTime)" -ForegroundColor Cyan
        Write-Host "🕐 Last Run: $((Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo).LastRunTime)" -ForegroundColor Cyan
        Write-Host "📊 Last Result: $((Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo).LastTaskResult)" -ForegroundColor Cyan
    } else {
        Write-Host "📅 Scheduled Task: Not configured" -ForegroundColor Red
    }
    
    # Check Git status
    try {
        Set-Location "D:\neonpro\archon"
        $behindCount = git rev-list --count HEAD..origin/main 2>$null
        if ($LASTEXITCODE -eq 0) {
            if ([int]$behindCount -gt 0) {
                Write-Host "🔄 Repository: $behindCount commits behind" -ForegroundColor Yellow
            } else {
                Write-Host "✅ Repository: Up to date" -ForegroundColor Green
            }
        } else {
            Write-Host "⚠️  Repository: Cannot check status" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "❌ Repository: Error checking status" -ForegroundColor Red
    }
    
    # Show recent sync logs
    if (Test-Path $LogPath) {
        $recentLogs = Get-Content $LogPath -Tail 5 -ErrorAction SilentlyContinue
        if ($recentLogs) {
            Write-Host ""
            Write-Host "📝 Recent Log Entries:" -ForegroundColor Gray
            $recentLogs | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        }
    }
    
    Write-Host ""
}

function Run-SyncNow {
    Write-Host "🚀 Running manual sync..." -ForegroundColor Yellow
    
    if (Test-Path $ScriptPath) {
        & $ScriptPath
        Write-Log "Manual sync completed"
    } else {
        Write-Host "❌ Sync script not found: $ScriptPath" -ForegroundColor Red
        Write-Log "Sync script not found: $ScriptPath" -Level "ERROR"
    }
}

function Show-Help {
    Write-Host "USAGE:" -ForegroundColor Cyan
    Write-Host "  .\sync-archon-config.ps1 -Action <Action> [-SyncIntervalHours <Hours>]" -ForegroundColor White
    Write-Host ""
    Write-Host "ACTIONS:" -ForegroundColor Cyan
    Write-Host "  Setup     - Create automated sync task (requires admin)" -ForegroundColor White
    Write-Host "  Enable    - Enable automatic synchronization" -ForegroundColor White
    Write-Host "  Disable   - Disable automatic synchronization" -ForegroundColor White
    Write-Host "  Status    - Show current sync status" -ForegroundColor White
    Write-Host "  RunNow    - Run manual sync immediately" -ForegroundColor White
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor Cyan
    Write-Host "  -SyncIntervalHours <Hours>  - Sync interval (default: 6 hours)" -ForegroundColor White
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Cyan
    Write-Host "  .\sync-archon-config.ps1 -Action Setup" -ForegroundColor Gray
    Write-Host "  .\sync-archon-config.ps1 -Action Setup -SyncIntervalHours 12" -ForegroundColor Gray
    Write-Host "  .\sync-archon-config.ps1 -Action Status" -ForegroundColor Gray
    Write-Host "  .\sync-archon-config.ps1 -Action RunNow" -ForegroundColor Gray
    Write-Host ""
}

function Main {
    Show-Header
    
    # Ensure log directory exists
    New-Item -ItemType Directory -Force -Path (Split-Path $LogPath) | Out-Null
    
    switch ($Action) {
        "Setup" {
            Write-Log "Starting automation setup with $SyncIntervalHours hour interval"
            Setup-SyncAutomation
        }
        "Enable" {
            Enable-AutoSync
        }
        "Disable" {
            Disable-AutoSync
        }
        "Status" {
            Show-Status
        }
        "RunNow" {
            Run-SyncNow
        }
        default {
            Show-Help
        }
    }
}

# Run main function
Main