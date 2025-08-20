# Archon Sync Configuration Manager
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
        Write-Host "Setting up sync automation..." -ForegroundColor Yellow
        
        # Create scheduled task
        $TaskAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File $SyncScript"
        $TaskTrigger = New-ScheduledTaskTrigger -Daily -At "08:00"
        $TaskPrincipal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest
        $TaskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
        
        Register-ScheduledTask -TaskName $TaskName -Action $TaskAction -Trigger $TaskTrigger -Principal $TaskPrincipal -Settings $TaskSettings -Force
        
        Write-Host "Scheduled task created: Runs daily at 8:00 AM" -ForegroundColor Green
    }
    
    "enable" {
        Enable-ScheduledTask -TaskName $TaskName
        Write-Host "Sync automation enabled" -ForegroundColor Green
    }
    
    "disable" {
        Disable-ScheduledTask -TaskName $TaskName
        Write-Host "Sync automation disabled" -ForegroundColor Yellow
    }
    
    "remove" {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "Sync automation removed" -ForegroundColor Red
    }
    
    "run" {
        Write-Host "Running sync now..." -ForegroundColor Yellow
        & $SyncScript
    }
    
    "status" {
        $Task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        if ($Task) {
            Write-Host "Task Status: $($Task.State)" -ForegroundColor Green
            Write-Host "Last Run: $($Task.LastRunTime)" -ForegroundColor Cyan
            Write-Host "Next Run: $($Task.NextRunTime)" -ForegroundColor Cyan
        } else {
            Write-Host "No scheduled task found - use 'setup' to create" -ForegroundColor Yellow
        }
    }
    
    default {
        Write-Host "USAGE:" -ForegroundColor White
        Write-Host "  .\sync-archon-config.ps1 setup    - Create scheduled task"
        Write-Host "  .\sync-archon-config.ps1 enable   - Enable automation"
        Write-Host "  .\sync-archon-config.ps1 disable  - Disable automation" 
        Write-Host "  .\sync-archon-config.ps1 remove   - Remove automation"
        Write-Host "  .\sync-archon-config.ps1 run      - Run sync now"
        Write-Host "  .\sync-archon-config.ps1 status   - Show current status"
    }
}

Write-Host ""