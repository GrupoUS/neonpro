# Fix createClient() calls - simplified version for older PowerShell
Write-Host "Fixing createClient() calls - Simple Version"

$patterns = @(
    "createClient(",
    "await createClient("
)

$filesToCheck = Get-ChildItem -Path "apps\neonpro-web\src" -Include "*.ts", "*.tsx", "*.js", "*.jsx" -Recurse | Where-Object { $_.Name -notmatch "\.d\.ts$" }

$totalFiles = $filesToCheck.Count
$processedFiles = 0
$updatedFiles = 0

foreach ($file in $filesToCheck) {
    $processedFiles++
    Write-Progress -Activity "Processing files" -Status "Processing $($file.Name)" -PercentComplete (($processedFiles / $totalFiles) * 100)
    
    try {
        $lines = Get-Content $file.FullName
        $modified = $false
        
        for ($i = 0; $i -lt $lines.Length; $i++) {
            $line = $lines[$i]
            
            # Skip if already has await
            if ($line -match "await\s+createClient\s*\(") {
                continue
            }
            
            # Check if line contains createClient() but not await
            if ($line -match "createClient\s*\(" -and $line -notmatch "await\s+createClient\s*\(") {
                # Add await before createClient
                $lines[$i] = $line -replace "createClient\s*\(", "await createClient("
                $modified = $true
                Write-Host "  Fixed: $($file.Name) - Line $($i+1)"
            }
        }
        
        if ($modified) {
            $lines | Set-Content -Path $file.FullName -Encoding UTF8
            $updatedFiles++
            Write-Host "  Updated: $($file.FullName)"
        }
    }
    catch {
        Write-Warning "Error processing $($file.FullName): $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Summary:"
Write-Host "- Total files processed: $processedFiles"
Write-Host "- Files updated: $updatedFiles"
Write-Host "- createClient() fixes completed"