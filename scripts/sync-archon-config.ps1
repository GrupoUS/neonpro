# Archon Sync Configuration Manager (User-level)
param(
    [Parameter(Position=0)]
    [string]$Action = "status"
)

$SyncScript = "D:\neonpro\scripts\sync-archon.ps1"
$TaskName = "ArchonSync"

Write-Host ""
Write-Host "ARCHON SYNC CONFIGURATION" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

switch ($Action.ToLower()) {
    "setup" {
        Write-Host "Setting up sync automation (User-level)..." -ForegroundColor Yellow
        
        try {
            # Create scheduled task for current user only
            $TaskAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$SyncScript`""
            $TaskTrigger = New-ScheduledTaskTrigger -Daily -At "08:00"
            $TaskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
            
            Register-ScheduledTask -TaskName $TaskName -Action $TaskAction -Trigger $TaskTrigger -Settings $TaskSettings -Force
            
            Write-Host "Scheduled task created successfully: Runs daily at 8:00 AM" -ForegroundColor Green
        }
        catch {
            Write-Host "Failed to create scheduled task: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Try running as Administrator or use manual sync" -ForegroundColor Yellow
        }
    }
    
    "enable" {
        try {
            Enable-ScheduledTask -TaskName $TaskName
            Write-Host "Sync automation enabled" -ForegroundColor Green
        }
        catch {
            Write-Host "Failed to enable task: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "disable" {
        try {
            Disable-ScheduledTask -TaskName $TaskName
            Write-Host "Sync automation disabled" -ForegroundColor Yellow
        }
        catch {
            Write-Host "Failed to disable task: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "remove" {
        try {
            Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
            Write-Host "Sync automation removed" -ForegroundColor Red
        }
        catch {
            Write-Host "Failed to remove task: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "run" {
        Write-Host "Running sync now..." -ForegroundColor Yellow
        & $SyncScript
    }
    
    "manual" {
        Write-Host "Creating manual sync shortcut..." -ForegroundColor Yellow
        $ShortcutPath = "D:\neonpro\scripts\Manual-Archon-Sync.bat"
        $BatchContent = "@echo off`npowershell -ExecutionPolicy Bypass -File `"$SyncScript`"`npause"
        Set-Content -Path $ShortcutPath -Value $BatchContent
        Write-Host "Manual sync shortcut created: $ShortcutPath" -ForegroundColor Green
    }
    
    "status" {
        try {
            $Task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
            if ($Task) {
                Write-Host "Task Status: $($Task.State)" -ForegroundColor Green
                Write-Host "Last Run: $($Task.LastRunTime)" -ForegroundColor Cyan
                Write-Host "Next Run: $($Task.NextRunTime)" -ForegroundColor Cyan
            } else {
                Write-Host "No scheduled task found" -ForegroundColor Yellow
                Write-Host "Alternative: Use 'manual' to create batch file for easy sync" -ForegroundColor Cyan
            }
        }
        catch {
            Write-Host "Could not check scheduled task status" -ForegroundColor Yellow
            Write-Host "Alternative: Use 'manual' to create batch file for easy sync" -ForegroundColor Cyan
        }
    }
    
    default {
        Write-Host "USAGE:" -ForegroundColor White
        Write-Host "  .\sync-archon-config.ps1 setup    - Create scheduled task (requires admin)"
        Write-Host "  .\sync-archon-config.ps1 enable   - Enable automation"
        Write-Host "  .\sync-archon-config.ps1 disable  - Disable automation" 
        Write-Host "  .\sync-archon-config.ps1 remove   - Remove automation"
        Write-Host "  .\sync-archon-config.ps1 run      - Run sync now"
        Write-Host "  .\sync-archon-config.ps1 manual   - Create manual sync shortcut"
        Write-Host "  .\sync-archon-config.ps1 status   - Show current status"
        Write-Host ""
        Write-Host "If 'setup' fails due to permissions, use 'manual' for easy sync access" -ForegroundColor Yellow
    }
}

Write-Host ""