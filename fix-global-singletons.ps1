# Fix Global Singletons to Prevent createClient() Calls Outside Request Context

# Get all .ts files that might have singleton exports with createClient calls
$files = Get-ChildItem -Path "apps\neonpro-web\src" -Recurse -Filter "*.ts" | 
    Where-Object { $_.Name -notmatch "\.d\.ts$" -and $_.Name -notmatch "test|spec" }

$problematicSingletons = @()
$fixedFiles = @()

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Check if file has both singleton export and createClient usage
    if ($content -match "export const \w+ = new \w+\(\)" -and $content -match "createClient\(\)") {
        $problematicSingletons += $file.FullName
        Write-Host "Found problematic singleton in: $($file.FullName)" -ForegroundColor Yellow
        
        # Replace singleton exports with factory functions
        $newContent = $content -replace "export const (\w+) = new (\w+)\(\)", "export const create`$1 = () => new `$2()"
        
        if ($newContent -ne $content) {
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
            $fixedFiles += $file.FullName
            Write-Host "Fixed singleton export in: $($file.FullName)" -ForegroundColor Green
        }
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Problematic singletons found: $($problematicSingletons.Count)" -ForegroundColor Yellow
Write-Host "Files fixed: $($fixedFiles.Count)" -ForegroundColor Green

if ($fixedFiles.Count -gt 0) {
    Write-Host "`nFixed files:" -ForegroundColor Green
    $fixedFiles | ForEach-Object { Write-Host "  - $_" }
}

if ($problematicSingletons.Count -gt 0) {
    Write-Host "`nNote: You will need to update imports that use these singletons to call the factory functions instead." -ForegroundColor Yellow
}