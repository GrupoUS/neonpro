# Fix this.supabase assignments to proper createClient() calls
$rootPath = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src"
$errors = @()
$fixedCount = 0

# Pattern to find incomplete this.supabase = createClient assignments
$pattern = 'this\.supabase\s*=\s*(await\s+)?createClient(?![^\(\)]*\([^\)]*\))'

Write-Host "Searching for incomplete this.supabase assignments..." -ForegroundColor Yellow

try {
    # Search for files with the pattern using ripgrep
    $rgResults = rg -n $pattern $rootPath --type ts --type js 2>$null
    
    if ($rgResults) {
        $rgResults | ForEach-Object {
            $line = $_
            if ($line -match "^([^:]+):(\d+):(.+)$") {
                $filePath = $matches[1]
                $lineNumber = [int]$matches[2]
                $content = $matches[3]
                
                Write-Host "Processing: $filePath (line $lineNumber)" -ForegroundColor Cyan
                
                try {
                    # Read file content
                    $fileContent = Get-Content $filePath -Raw -Encoding UTF8
                    
                    # Fix patterns
                    $originalContent = $fileContent
                    
                    # Fix incomplete assignments - add () to make it a function call
                    $fileContent = $fileContent -replace 'this\.supabase\s*=\s*createClient(?!\s*\()', 'this.supabase = createClient()'
                    $fileContent = $fileContent -replace 'this\.supabase\s*=\s*await\s+createClient(?!\s*\()', 'this.supabase = await createClient()'
                    
                    # Remove duplicate 'await await' if any
                    $fileContent = $fileContent -replace 'await\s+await\s+', 'await '
                    
                    # Save if changes were made
                    if ($originalContent -ne $fileContent) {
                        Set-Content -Path $filePath -Value $fileContent -Encoding UTF8 -NoNewline
                        $fixedCount++
                        Write-Host "  ✅ Fixed: $filePath" -ForegroundColor Green
                    }
                }
                catch {
                    $errors += "Error processing $filePath : $($_.Exception.Message)"
                    Write-Host "  ❌ Error: $filePath - $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
    }
    
    Write-Host "`n=== SUMMARY ===" -ForegroundColor Yellow
    Write-Host "Fixed files: $fixedCount" -ForegroundColor Green
    
    if ($errors.Count -gt 0) {
        Write-Host "Errors encountered: $($errors.Count)" -ForegroundColor Red
        $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    }
}
catch {
    Write-Host "Script error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nScript completed!" -ForegroundColor Yellow