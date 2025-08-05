# Fix createClient() calls that need await
$ErrorActionPreference = 'Continue'

# Find all .ts files that use createClient() without await
$files = Get-ChildItem -Path "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web" -Filter "*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    
    if ($content -and $content -match "createClient\(\)") {
        Write-Host "Checking: $($file.FullName)"
        
        # Check if the function containing createClient is already async
        if ($content -match "createClient\(\)" -and $content -notmatch "await createClient\(\)") {
            Write-Host "  Found createClient() without await"
            
            # Pattern 1: const supabase = createClient()
            $content = $content -replace 'const supabase = createClient\(\)', 'const supabase = await createClient()'
            
            # Pattern 2: Functions that use createClient need to be async
            # Mark function as needing async if it contains createClient
            if ($content -match "createClient\(\)" -and $content -notmatch "async function|async \(") {
                # This is complex pattern matching, let's handle manually for now
                Write-Host "  File needs manual review for async function: $($file.FullName)"
            }
            
            Set-Content $file.FullName -Value $content -Encoding UTF8 -ErrorAction SilentlyContinue
            Write-Host "  Updated file"
        }
    }
}

Write-Host "Completed createClient() fixes. Some files may need manual async function conversion."