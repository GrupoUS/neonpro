# Fix Orphan cookies() calls that cause build failures
# Run from neonpro directory

$ErrorActionPreference = "Stop"

Write-Host "FIXING ORPHAN cookies() CALLS..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow

# Target paths
$targetPaths = @(
    "apps\neonpro-web\src\app",
    "apps\neonpro-web\src\lib", 
    "apps\neonpro-web\src\server",
    "apps\neonpro-web\src\utils"
)

$orphanPattern = '^\s*cookies\(\)\s*$'
$fixedCount = 0

foreach ($targetPath in $targetPaths) {
    if (Test-Path $targetPath) {
        Write-Host "Checking $targetPath..." -ForegroundColor Cyan
        
        Get-ChildItem -Path $targetPath -Recurse -Include "*.ts", "*.tsx" | ForEach-Object {
            $file = $_
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            
            if ($content -and $content -match $orphanPattern) {
                Write-Host "Fixing orphan cookies() in: $($file.Name)" -ForegroundColor Yellow
                
                # Remove orphan cookies() lines
                $lines = Get-Content $file.FullName
                $newLines = @()
                
                foreach ($line in $lines) {
                    # Skip lines that only contain cookies()
                    if ($line -notmatch '^\s*cookies\(\)\s*$') {
                        $newLines += $line
                    }
                }
                
                # Write back the corrected content
                Set-Content -Path $file.FullName -Value $newLines -Encoding UTF8
                $fixedCount++
            }
        }
    }
}

Write-Host "================================================" -ForegroundColor Yellow
Write-Host "ORPHAN cookies() CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "Fixed $fixedCount files" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Yellow