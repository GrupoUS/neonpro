# ========================================================================
# COMPREHENSIVE DUPLICATE FILE ANALYSIS
# Performance-optimized two-stage approach with user interaction
# ========================================================================

Write-Host "Starting comprehensive duplicate analysis..." -ForegroundColor Green
$startTime = Get-Date

# Stage 1: Group by size (fast operation)
Write-Host "Stage 1: Grouping files by size..." -ForegroundColor Yellow
$allFiles = Get-ChildItem -Path "$neonproPath" -Recurse -File -ErrorAction SilentlyContinue
$filesBySize = $allFiles | Group-Object -Property Length | Where-Object { $_.Count -gt 1 }

Write-Host "Found $($filesBySize.Count) size groups with potential duplicates"

# Stage 2: Hash comparison for files with identical sizes
Write-Host "Stage 2: Calculating content hashes..." -ForegroundColor Yellow
$duplicateGroups = @()

foreach ($sizeGroup in $filesBySize) {
    Write-Progress -Activity "Analyzing duplicates" -Status "Processing size group $($sizeGroup.Name) bytes" -PercentComplete (($duplicateGroups.Count / $filesBySize.Count) * 100)
    
    $hashGroups = $sizeGroup.Group | Get-FileHash -Algorithm MD5 | Group-Object -Property Hash | Where-Object { $_.Count -gt 1 }
    
    if ($hashGroups) {
        foreach ($hashGroup in $hashGroups) {
            $duplicateGroups += [PSCustomObject]@{
                Hash = $hashGroup.Name
                Size = $sizeGroup.Name
                Files = $hashGroup.Group.Path
                Count = $hashGroup.Count
            }
        }
    }
}

Write-Progress -Activity "Analyzing duplicates" -Completed

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host "`nAnalysis Complete!" -ForegroundColor Green
Write-Host "Processing time: $([math]::Round($duration, 2)) seconds"
Write-Host "Duplicate groups found: $($duplicateGroups.Count)"

if ($duplicateGroups.Count -gt 0) {
    # Interactive selection using Out-GridView
    $selectedFiles = $duplicateGroups | 
        ForEach-Object { 
            $group = $_
            $group.Files | ForEach-Object {
                [PSCustomObject]@{
                    Path = $_
                    Hash = $group.Hash
                    SizeBytes = $group.Size
                    SizeMB = [math]::Round([int64]$group.Size / 1MB, 2)
                    GroupSize = $group.Count
                }
            }
        } |
        Out-GridView -Title "Select duplicate files to DELETE (Ctrl+Click for multiple)" -OutputMode Multiple -PassThru

    if ($selectedFiles) {
        Write-Host "`nSelected $($selectedFiles.Count) files for cleanup"
        
        # Show summary before action
        $totalSize = ($selectedFiles | Measure-Object -Property SizeBytes -Sum).Sum
        Write-Host "Total space recovery: $([math]::Round($totalSize / 1MB, 2)) MB"
        
        $confirmation = Read-Host "Proceed with cleanup? (y/N)"
        if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
            # Create backup directory
            $backupDir = "$neonproPath\DUPLICATE_CLEANUP_BACKUP_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
            New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
            
            foreach ($file in $selectedFiles) {
                $relativePath = $file.Path.Replace("$neonproPath\", "")
                $backupPath = Join-Path $backupDir $relativePath
                $backupParent = Split-Path $backupPath -Parent
                
                if (-not (Test-Path $backupParent)) {
                    New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
                }
                
                # Move to backup instead of delete for safety
                Move-Item $file.Path $backupPath -Force
                Write-Host "Moved to backup: $relativePath"
            }
            
            Write-Host "`nCleanup completed! Files moved to: $backupDir" -ForegroundColor Green
        }
    }
}
