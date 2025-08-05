# Fix Import Types V1.0
# Converts regular imports to 'import type' for type-only imports

param(
    [string]$Target = "web",
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

Write-Host "🔧 NeonPro Import Type Fixer V1.0" -ForegroundColor Cyan
Write-Host "Target: $Target | Dry Run: $DryRun | Verbose: $Verbose" -ForegroundColor Gray
Write-Host ""

# Define target directories
$targetPaths = @{
    "web" = "apps\neonpro-web\src"
    "api" = "apps\neonpro-api\src"
    "shared" = "packages\shared\src"
}

$targetPath = $targetPaths[$Target]
if (-not $targetPath) {
    Write-Host "❌ Invalid target. Use: web, api, or shared" -ForegroundColor Red
    exit 1
}

$fullPath = Join-Path $PSScriptRoot "..\$targetPath"
if (-not (Test-Path $fullPath)) {
    Write-Host "❌ Target path not found: $fullPath" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Analyzing imports in: $fullPath" -ForegroundColor Yellow

# Find TypeScript/JavaScript files
$files = Get-ChildItem $fullPath -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | Where-Object {
    $_.FullName -notmatch "node_modules" -and
    $_.FullName -notmatch "\.next" -and
    $_.FullName -notmatch "\.git" -and
    $_.FullName -notmatch "dist" -and
    $_.FullName -notmatch "build" -and
    (Test-Path $_.FullName)
}

$fixCount = 0
$fileCount = 0

foreach ($file in $files) {
    try {
        if (-not (Test-Path $file.FullName)) {
            if ($Verbose) {
                Write-Host "⚠️ Skipping non-existent file: $($file.FullName)" -ForegroundColor Yellow
            }
            continue
        }

        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $content) {
            if ($Verbose) {
                Write-Host "⚠️ Skipping empty file: $($file.FullName)" -ForegroundColor Yellow
            }
            continue
        }

        $originalContent = $content
        $localFixCount = 0

        # Pattern: import { Type1, Type2 } from "module"
        # Only convert if ALL imports appear to be types (start with uppercase or are specific type patterns)
        $typeImportPattern = 'import\s+\{\s*([^}]+)\s*\}\s+from\s+[''"]([^''"]+)[''"]'
        $matches = [regex]::Matches($content, $typeImportPattern)
        
        foreach ($match in $matches) {
            $importList = $match.Groups[1].Value.Trim()
            $module = $match.Groups[2].Value
            
            # Skip if already using 'import type'
            if ($match.Value -match 'import\s+type') {
                continue
            }
            
            # Split imports and check if they're likely types
            $imports = $importList -split ',' | ForEach-Object { $_.Trim() }
            $typeIndicators = @()
            
            foreach ($import in $imports) {
                # Remove 'type' prefix if present and extract name
                $cleanImport = $import -replace '^\s*type\s+', ''
                $importName = ($cleanImport -split '\s+as\s+')[0].Trim()
                
                # Check if it's likely a type
                $isType = $false
                
                # Common type patterns
                if ($importName -match '^[A-Z]') { $isType = $true }  # PascalCase
                if ($importName -match '(Type|Interface|Props|Config|Schema|Data|Result|Response|Request|Options|Params|Info|Status|Error|Event|Record|Entry|Item|Model)$') { $isType = $true }
                if ($importName -match '^(type|Type)') { $isType = $true }
                if ($importName -match '(Database|VariantProps|ButtonProps|DialogProps|CookieOptions|CreateNextContextOptions)') { $isType = $true }
                
                $typeIndicators += $isType
            }
            
            # Convert to 'import type' if majority are types
            $typeCount = ($typeIndicators | Where-Object { $_ }).Count
            $totalCount = $typeIndicators.Count
            
            if ($typeCount -gt 0 -and ($typeCount / $totalCount) -ge 0.5) {
                $newImport = "import type { $importList } from `"$module`""
                $content = $content.Replace($match.Value, $newImport)
                $localFixCount++
                
                if ($Verbose) {
                    $relativePath = $file.FullName.Replace($fullPath, "").TrimStart('\')
                    Write-Host "  ✅ /$relativePath" -ForegroundColor Green
                    Write-Host "     🔄 $($match.Value)" -ForegroundColor Gray
                    Write-Host "     ➡️ $newImport" -ForegroundColor Green
                }
            }
        }

        # Save changes if any were made
        if ($localFixCount -gt 0) {
            if (-not $DryRun) {
                Set-Content $file.FullName -Value $content -Encoding UTF8
            }
            $fixCount += $localFixCount
            $fileCount++
        }

    } catch {
        Write-Host "❌ Error processing file $($file.FullName): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 Import Type Fix Summary:" -ForegroundColor Cyan
Write-Host "  • Files processed: $($files.Count)" -ForegroundColor White
Write-Host "  • Files modified: $fileCount" -ForegroundColor White
Write-Host "  • Import fixes: $fixCount" -ForegroundColor White

if ($DryRun) {
    Write-Host "  • Mode: DRY RUN (no changes saved)" -ForegroundColor Yellow
    Write-Host "  • Run without -DryRun to apply fixes" -ForegroundColor Yellow
} else {
    Write-Host "  • Changes applied successfully! ✅" -ForegroundColor Green
}

Write-Host ""
Write-Host "🏆 Import type fixing complete!" -ForegroundColor Green