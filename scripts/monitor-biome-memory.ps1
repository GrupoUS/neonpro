# 🧠 Biome Extension Memory Monitor
# PowerShell script to track VS Code extension memory usage

param(
    [int]$IntervalSeconds = 30,
    [int]$DurationMinutes = 60,
    [string]$LogFile = "biome-memory-monitor.log"
)

Write-Host "🧠 Starting Biome Extension Memory Monitor" -ForegroundColor Green
Write-Host "⏰ Monitoring for $DurationMinutes minutes, checking every $IntervalSeconds seconds" -ForegroundColor Yellow
Write-Host "📝 Log file: $LogFile" -ForegroundColor Cyan

# Initialize log file
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"=== Biome Memory Monitor Started at $timestamp ===" | Out-File $LogFile -Encoding UTF8

$endTime = (Get-Date).AddMinutes($DurationMinutes)
$iteration = 0

while ((Get-Date) -lt $endTime) {
    $iteration++
    $currentTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    try {
        # Get VS Code processes
        $vscodeProcesses = Get-Process -Name "Code*" -ErrorAction SilentlyContinue
        
        if ($vscodeProcesses) {
            $totalMemoryMB = 0
            $biomeMemoryMB = 0
            
            foreach ($process in $vscodeProcesses) {
                $memoryMB = [math]::Round($process.WorkingSet64 / 1MB, 2)
                $totalMemoryMB += $memoryMB
                
                # Check if this is likely the Biome extension process
                $windowTitle = $process.MainWindowTitle
                if ($windowTitle -like "*biome*" -or $process.ProcessName -like "*biome*") {
                    $biomeMemoryMB += $memoryMB
                }
            }
            
            # Log current memory usage
            $logEntry = "[$currentTime] Iteration $iteration | VS Code Total: ${totalMemoryMB}MB | Biome-related: ${biomeMemoryMB}MB"
            Write-Host $logEntry -ForegroundColor $(if ($totalMemoryMB -gt 1000) { "Red" } elseif ($totalMemoryMB -gt 500) { "Yellow" } else { "Green" })
            
            $logEntry | Out-File $LogFile -Append -Encoding UTF8
            
            # Alert if memory usage is high
            if ($totalMemoryMB -gt 2000) {
                Write-Host "⚠️  HIGH MEMORY USAGE DETECTED! VS Code using ${totalMemoryMB}MB" -ForegroundColor Red
                "⚠️  HIGH MEMORY USAGE: ${totalMemoryMB}MB at $currentTime" | Out-File $LogFile -Append -Encoding UTF8
            }
            
            if ($biomeMemoryMB -gt 200) {
                Write-Host "🔴 BIOME MEMORY TARGET EXCEEDED! Using ${biomeMemoryMB}MB (Target: <200MB)" -ForegroundColor Red
                "🔴 BIOME MEMORY EXCEEDED: ${biomeMemoryMB}MB at $currentTime" | Out-File $LogFile -Append -Encoding UTF8
            }
            
        } else {
            Write-Host "[$currentTime] VS Code not running" -ForegroundColor Gray
            "[$currentTime] VS Code not running" | Out-File $LogFile -Append -Encoding UTF8
        }
        
    } catch {
        $errorMsg = "[$currentTime] Error monitoring memory: $($_.Exception.Message)"
        Write-Host $errorMsg -ForegroundColor Red
        $errorMsg | Out-File $LogFile -Append -Encoding UTF8
    }
    
    Start-Sleep -Seconds $IntervalSeconds
}

$endTimestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "✅ Memory monitoring completed at $endTimestamp" -ForegroundColor Green
"=== Biome Memory Monitor Ended at $endTimestamp ===" | Out-File $LogFile -Append -Encoding UTF8

# Generate summary report
Write-Host "📊 Generating summary report..." -ForegroundColor Cyan
$logContent = Get-Content $LogFile
$memoryReadings = $logContent | Where-Object { $_ -match "Iteration \d+" } | ForEach-Object {
    if ($_ -match "VS Code Total: ([\d.]+)MB") {
        [double]$matches[1]
    }
}

if ($memoryReadings.Count -gt 0) {
    $avgMemory = [math]::Round(($memoryReadings | Measure-Object -Average).Average, 2)
    $maxMemory = [math]::Round(($memoryReadings | Measure-Object -Maximum).Maximum, 2)
    $minMemory = [math]::Round(($memoryReadings | Measure-Object -Minimum).Minimum, 2)
    
    $summary = @"

📊 MEMORY USAGE SUMMARY
======================
Monitoring Duration: $DurationMinutes minutes
Total Readings: $($memoryReadings.Count)
Average Memory: ${avgMemory}MB
Peak Memory: ${maxMemory}MB
Minimum Memory: ${minMemory}MB
Target Met: $(if ($maxMemory -lt 200) { "✅ YES" } else { "❌ NO - Peak was ${maxMemory}MB" })

"@
    
    Write-Host $summary -ForegroundColor Green
    $summary | Out-File $LogFile -Append -Encoding UTF8
}

Write-Host "📝 Complete log saved to: $LogFile" -ForegroundColor Cyan