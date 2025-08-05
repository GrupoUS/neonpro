# Fix this.supabase assignments to proper createClient() calls - PowerShell 5 compatible
$rootPath = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src"
$errors = @()
$fixedCount = 0

Write-Host "Searching for incomplete this.supabase assignments..." -ForegroundColor Yellow

try {
    # Get all TypeScript and JavaScript files  
    $files = Get-ChildItem -Path $rootPath -Recurse -Include "*.ts", "*.js" | Where-Object { $_.FullName -notmatch "node_modules" }
    
    foreach ($file in $files) {
        try {
            # Read file content using encoding that works on older PowerShell
            $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
            
            # Check if file contains problematic patterns
            if ($content -match 'this\.supabase\s*=\s*(await\s+)?createClient(?![^\(\)]*\([^\)]*\))') {
                Write-Host "Processing: $($file.Name)" -ForegroundColor Cyan
                
                $originalContent = $content
                
                # Fix incomplete assignments - add () to make it a function call
                $content = $content -replace 'this\.supabase\s*=\s*createClient(?!\s*\()', 'this.supabase = createClient()'
                $content = $content -replace 'this\.supabase\s*=\s*await\s+createClient(?!\s*\()', 'this.supabase = await createClient()'
                
                # Remove duplicate 'await await' if any
                $content = $content -replace 'await\s+await\s+', 'await '
                
                # Save if changes were made
                if ($originalContent -ne $content) {
                    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
                    $fixedCount++
                    Write-Host "  ✅ Fixed: $($file.Name)" -ForegroundColor Green
                }
            }
        }
        catch {
            $errors += "Error processing $($file.FullName): $($_.Exception.Message)"
            Write-Host "  ❌ Error: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
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