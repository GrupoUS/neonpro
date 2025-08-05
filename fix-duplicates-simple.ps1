# Fix Duplicate Definitions
param([string]$ProjectPath = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro")

Write-Host "Fixing duplicate definitions..."

$files = Get-ChildItem -Path "$ProjectPath\apps\neonpro-web\src" -Include "*.ts","*.tsx" -Recurse
$totalFixed = 0

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        if (-not $content) { continue }
        
        $originalContent = $content
        
        # Fix duplicate const declarations like: const createXService = new createXService()
        $content = $content -replace '(?m)^const\s+(\w+)\s*=\s*new\s+\1\(\)\s*$', ''
        
        # Fix duplicate export lines at end
        $content = $content -replace '(?m)^export\s+const\s+(\w+)\s*=\s*\(\)\s*=>\s*new\s+\1\(\);\s*\r?\n\s*$', ''
        
        # Clean up extra newlines
        $content = $content -replace '\r?\n\s*\r?\n\s*\r?\n', "`n`n"
        
        if ($content -ne $originalContent) {
            $content | Set-Content -Path $file.FullName -Encoding UTF8 -NoNewline
            Write-Host "Fixed: $($file.Name)"
            $totalFixed++
        }
        
    } catch {
        Write-Host "Error: $($file.Name) - $($_.Exception.Message)"
    }
}

Write-Host "Fixed $totalFixed files"