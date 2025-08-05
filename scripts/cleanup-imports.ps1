#!/usr/bin/env pwsh

# Import Cleanup Script V2.0
# Comprehensive import analysis and cleanup for NeonPro

param(
    [string]$Target = "web",  # web, api, packages, all
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

Write-Host "🔧 NeonPro Import Cleanup V2.0" -ForegroundColor Cyan
Write-Host "Target: $Target | Dry Run: $DryRun | Verbose: $Verbose" -ForegroundColor Gray

$BaseDir = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro"
Set-Location $BaseDir

# Common problematic import patterns
$ProblematicPatterns = @(
    @{ Pattern = 'from [''"]@/(?!types|components|lib|utils|hooks|contexts|app|server|styles)'; Reason = 'Invalid alias path' },
    @{ Pattern = 'import.*from [''"]\.\.\/\.\.\/\.\.\/'; Reason = 'Deep relative imports (use aliases)' },
    @{ Pattern = 'import.*from [''"][^''"]*/index[''"]'; Reason = 'Explicit index imports (unnecessary)' },
    @{ Pattern = 'import \* as \w+ from [''"]react[''"]'; Reason = 'Inefficient React import' },
    @{ Pattern = 'import.*from [''"]next/dist/'; Reason = 'Internal Next.js imports' },
    @{ Pattern = 'import.*from [''"]@/types(?!/index)[''"]'; Reason = 'Direct type file import (use index)' }
)

# Type import patterns that should use 'import type'
$TypeOnlyPatterns = @(
    'Interface\w+',
    'Type\w+',
    '\w+Props',
    '\w+Config',
    '\w+Options'
)

function Find-ProblematicImports {
    param([string]$Directory)
    
    Write-Host "`n🔍 Analyzing imports in: $Directory" -ForegroundColor Yellow
    
    $issues = @()
    
    # Find TypeScript/TSX files
    $files = Get-ChildItem -Path $Directory -Include "*.ts", "*.tsx" -Recurse | 
        Where-Object { 
            $_.FullName -notmatch "node_modules" -and
            $_.FullName -notmatch "\.next" -and
            $_.FullName -notmatch "dist" -and
            $_.FullName -notmatch "__tests__" -and
            $_.FullName -notmatch "\.d\.ts"
        }
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw
        $relativePath = $file.FullName.Replace($BaseDir, "").Replace("\", "/")
        
        # Check each problematic pattern
        foreach ($pattern in $ProblematicPatterns) {
            if ($content -match $pattern.Pattern) {
                $matches = [regex]::Matches($content, $pattern.Pattern)
                foreach ($match in $matches) {
                    $issues += @{
                        File = $relativePath
                        Line = ($content.Substring(0, $match.Index) -split "`n").Count
                        Issue = $pattern.Reason
                        Match = $match.Value
                        Type = "ImportPattern"
                    }
                }
            }
        }
        
        # Check for missing 'import type'
        $importLines = $content -split "`n" | Where-Object { $_ -match '^import\s+(?!type).*from' }
        foreach ($importLine in $importLines) {
            foreach ($typePattern in $TypeOnlyPatterns) {
                if ($importLine -match $typePattern -and $importLine -notmatch 'import type') {
                    $lineNumber = ($content -split "`n").IndexOf($importLine) + 1
                    $issues += @{
                        File = $relativePath
                        Line = $lineNumber
                        Issue = "Should use 'import type' for type-only import"
                        Match = $importLine.Trim()
                        Type = "TypeImport"
                    }
                }
            }
        }
        
        # Check for circular imports (basic detection)
        $imports = [regex]::Matches($content, 'from [''"]([^''"]+)[''"]') | ForEach-Object { $_.Groups[1].Value }
        foreach ($import in $imports) {
            if ($import -match '^\.' -and $import.Contains($file.BaseName)) {
                $issues += @{
                    File = $relativePath
                    Line = 0
                    Issue = "Potential circular import"
                    Match = $import
                    Type = "Circular"
                }
            }
        }
    }
    
    return $issues
}

function Show-IssueReport {
    param([array]$Issues)
    
    if ($Issues.Count -eq 0) {
        Write-Host "✅ No import issues found!" -ForegroundColor Green
        return
    }
    
    Write-Host "`n📊 Import Issues Report" -ForegroundColor Red
    Write-Host "Found $($Issues.Count) issues:" -ForegroundColor Red
    
    # Group by type
    $groupedIssues = $Issues | Group-Object Type
    
    foreach ($group in $groupedIssues) {
        Write-Host "`n🔸 $($group.Name) Issues: $($group.Count)" -ForegroundColor Yellow
        
        foreach ($issue in $group.Group | Sort-Object File, Line) {
            Write-Host "  📁 $($issue.File):$($issue.Line)" -ForegroundColor Gray
            Write-Host "     🔸 $($issue.Issue)" -ForegroundColor Yellow
            Write-Host "     💡 $($issue.Match)" -ForegroundColor Cyan
            if ($Verbose) {
                Write-Host ""
            }
        }
    }
}

function Fix-CommonImportIssues {
    param([array]$Issues, [bool]$Execute = $true)
    
    if (-not $Execute) {
        Write-Host "`n🔍 DRY RUN - Would fix the following issues:" -ForegroundColor Yellow
        Show-IssueReport $Issues
        return
    }
    
    Write-Host "`n🔧 Fixing import issues..." -ForegroundColor Green
    
    $fixedCount = 0
    $groupedByFile = $Issues | Group-Object File
    
    foreach ($fileGroup in $groupedByFile) {
        $filePath = Join-Path $BaseDir $fileGroup.Name
        
        if (-not (Test-Path $filePath)) {
            Write-Host "⚠️  File not found: $filePath" -ForegroundColor Yellow
            continue
        }
        
        $content = Get-Content $filePath -Raw
        $originalContent = $content
        
        # Fix type imports
        $typeIssues = $fileGroup.Group | Where-Object { $_.Type -eq "TypeImport" }
        foreach ($issue in $typeIssues) {
            $oldImport = $issue.Match
            $newImport = $oldImport -replace '^import\s+', 'import type '
            $content = $content -replace [regex]::Escape($oldImport), $newImport
            $fixedCount++
        }
        
        # Fix alias paths (basic fixes)
        $aliasIssues = $fileGroup.Group | Where-Object { $_.Type -eq "ImportPattern" }
        foreach ($issue in $aliasIssues) {
            if ($issue.Issue -eq "Explicit index imports (unnecessary)") {
                $oldImport = $issue.Match
                $newImport = $oldImport -replace '/index[''"]', '"'
                $content = $content -replace [regex]::Escape($oldImport), $newImport
                $fixedCount++
            }
        }
        
        # Save if changes were made
        if ($content -ne $originalContent) {
            Set-Content -Path $filePath -Value $content -Encoding UTF8
            Write-Host "✅ Fixed: $($fileGroup.Name)" -ForegroundColor Green
        }
    }
    
    Write-Host "`n🎉 Fixed $fixedCount import issues!" -ForegroundColor Green
}

# Main execution
$targetDirs = switch ($Target) {
    "web" { @("apps/neonpro-web/src") }
    "api" { @("apps/neonpro-api/src") }
    "packages" { @("packages") }
    "all" { @("apps", "packages") }
    default { @("apps/neonpro-web/src") }
}

$allIssues = @()

foreach ($dir in $targetDirs) {
    $dirPath = Join-Path $BaseDir $dir
    if (Test-Path $dirPath) {
        $issues = Find-ProblematicImports $dirPath
        $allIssues += $issues
    } else {
        Write-Host "⚠️  Directory not found: $dirPath" -ForegroundColor Yellow
    }
}

# Show report
Show-IssueReport $allIssues

# Fix issues if not dry run
if ($allIssues.Count -gt 0) {
    if ($DryRun) {
        Write-Host "`n💡 Run without -DryRun to fix these issues automatically" -ForegroundColor Cyan
    } else {
        Fix-CommonImportIssues $allIssues $true
    }
}

Write-Host "`n✨ Import cleanup complete!" -ForegroundColor Cyan