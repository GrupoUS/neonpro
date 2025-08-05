# Comprehensive Service Pattern Analysis and Fix

$ErrorActionPreference = "Continue"
$servicesPath = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src\app\lib\services"

Write-Host "Comprehensive service analysis and fix..." -ForegroundColor Yellow

# Get all service files
$serviceFiles = Get-ChildItem -Path $servicesPath -Filter "*.ts" -Recurse | Where-Object { $_.Name -notlike "*.test.ts" }

$issuesFound = @()

foreach ($file in $serviceFiles) {
    Write-Host "Analyzing: $($file.Name)" -ForegroundColor Cyan
    
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        $hasIssues = $false
        
        # Check for problematic patterns
        if ($content -match "supabase\s*=" -and $content -notmatch "const supabase = await createClient\(\)") {
            Write-Host "  Issue: Incorrect supabase assignment" -ForegroundColor Red
            $hasIssues = $true
        }
        
        if ($content -match "this\.supabase") {
            Write-Host "  Issue: Uses this.supabase" -ForegroundColor Red
            $hasIssues = $true
            # Fix this.supabase usage
            $content = $content -replace "this\.supabase", "supabase"
        }
        
        if ($content -match "supabase\s*;" -and $content -notmatch "const supabase") {
            Write-Host "  Issue: Naked supabase reference" -ForegroundColor Red
            $hasIssues = $true
        }
        
        # Add createClient imports if missing
        if ($content -notmatch "import.*createClient" -and $content -match "createClient\(\)") {
            Write-Host "  Adding missing createClient import" -ForegroundColor Yellow
            $content = $content -replace "(import[^;]+;)", "`$1`nimport { createClient } from '@/app/utils/supabase/server';"
        }
        
        # Fix async methods without supabase declaration
        $methodPattern = "(async\s+\w+[^{]+\{[^}]*?)(\s*)((?:const\s+\{\s*data[^}]+\}\s*=\s*)?await\s+supabase)"
        $content = [regex]::Replace($content, $methodPattern, {
            param($match)
            $methodStart = $match.Groups[1].Value
            $whitespace = $match.Groups[2].Value
            $supabaseCall = $match.Groups[3].Value
            
            if ($methodStart -notmatch "const supabase = await createClient\(\)") {
                return "$methodStart`n    const supabase = await createClient();$whitespace$supabaseCall"
            }
            return $match.Value
        })
        
        # Clean up malformed lines
        $content = $content -replace "(?m)^\s*supabase\s*$", ""
        $content = $content -replace "(?m)^\s*Supabase\s*$", ""
        
        # Clean up excess newlines
        $content = $content -replace "\n\s*\n\s*\n", "`n`n"
        
        if ($hasIssues) {
            $issuesFound += $file.Name
        }
        
        # Save only if changed
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            Write-Host "  Fixed service issues" -ForegroundColor Green
        } else {
            Write-Host "  No issues found" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "  Error processing $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Analysis completed!" -ForegroundColor Green
if ($issuesFound.Count -gt 0) {
    Write-Host "Files with issues found:" -ForegroundColor Yellow
    $issuesFound | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
} else {
    Write-Host "No issues detected!" -ForegroundColor Green
}