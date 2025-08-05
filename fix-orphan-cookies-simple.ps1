# Fix Orphan cookies() calls - Simple version
$ErrorActionPreference = "Stop"

Write-Host "FIXING ORPHAN cookies() CALLS..." -ForegroundColor Yellow

$targetPath = "apps\neonpro-web\src"
$fixedCount = 0

if (Test-Path $targetPath) {
    $files = Get-ChildItem -Path $targetPath -Recurse -Include "*.ts", "*.tsx"
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName
        $hasOrphan = $false
        
        foreach ($line in $content) {
            if ($line -match '^\s*cookies\(\)\s*$') {
                $hasOrphan = $true
                break
            }
        }
        
        if ($hasOrphan) {
            Write-Host "Fixing: $($file.Name)" -ForegroundColor Yellow
            
            # Filter out orphan cookies() lines
            $newContent = @()
            foreach ($line in $content) {
                if ($line -notmatch '^\s*cookies\(\)\s*$') {
                    $newContent += $line
                }
            }
            
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
            $fixedCount++
        }
    }
}

Write-Host "Fixed $fixedCount files" -ForegroundColor Green