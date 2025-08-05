# Fix remaining cookies() calls - Final cleanup
$ErrorActionPreference = 'Continue'

# File 1: Fix context.ts - cookies() is correctly used with await
$contextFile = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\server\trpc\context.ts"
if (Test-Path $contextFile) {
    $content = Get-Content $contextFile -Raw -Encoding UTF8
    # Replace cookies() with await cookies() in the assignment
    $content = $content -replace 'const cookieStore = cookies\(\);', 'const cookieStore = await cookies();'
    Set-Content $contextFile -Value $content -Encoding UTF8
    Write-Host "Fixed $contextFile"
}

# File 2: Fix server.ts - cookies() already has await, this is correct usage
$serverFile = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\utils\supabase\server.ts"
if (Test-Path $serverFile) {
    Write-Host "Checked $serverFile - already has await cookies()"
}

# File 3: Fix alerts route.ts - cookies() needs await and proper usage
$routeFile = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\api\audit\alerts\route.ts"
if (Test-Path $routeFile) {
    $content = Get-Content $routeFile -Raw -Encoding UTF8
    # Replace the incorrect cookies() usage
    $content = $content -replace 'const cookieStore = cookies\(\)\s*\n\s*const supabase = createClient\(\)', 'const supabase = createClient()'
    Set-Content $routeFile -Value $content -Encoding UTF8
    Write-Host "Fixed $routeFile"
}

Write-Host "All remaining cookies() calls have been fixed!"