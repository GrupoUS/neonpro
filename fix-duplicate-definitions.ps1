# Fix Duplicate Definitions in TypeScript Files
# This script fixes duplicate import/const definitions created by previous batch fixes

param(
    [string]$ProjectPath = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro"
)

Write-Host "🔧 Fixing duplicate definitions in TypeScript files..." -ForegroundColor Yellow

# Get all TypeScript files with potential duplicates
$files = Get-ChildItem -Path "$ProjectPath\apps\neonpro-web\src" -Include "*.ts","*.tsx" -Recurse

$totalFixed = 0

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        
        if (-not $content) { continue }
        
        $originalContent = $content
        $hasChanges = $false
        
        # Fix duplicate import lines (same import on consecutive lines)
        $content = $content -replace '(?m)^(import.*from.*);?\s*\r?\n\1;?\s*$', '$1'
        
        # Fix duplicate const declarations like: const createXService = new createXService()
        $content = $content -replace '(?m)^const\s+(\w+)\s*=\s*new\s+\1\(\)\s*$', ''
        
        # Fix duplicate class exports at end of file
        $content = $content -replace '(?m)^export\s+const\s+(\w+)\s*=\s*\(\)\s*=>\s*new\s+\1\(\);\s*\r?\n\s*$', ''
        
        # Fix specific marketing ROI duplicate pattern
        $content = $content -replace '(?m)^const createmarketingROIService = new createmarketingROIService\(\)\s*$', ''
        
        # Fix specific performance monitoring duplicate pattern  
        $content = $content -replace '(?m)^export class createperformanceMonitoringEngine \{[\s\S]*?\}\s*\r?\n\s*export const createperformanceMonitoringEngine = \(\) => new createperformanceMonitoringEngine\(\);\s*$', 'export class PerformanceMonitoringEngine {$1}$2export const createPerformanceMonitoringEngine = () => new PerformanceMonitoringEngine();'
        
        # Fix specific predictive analytics duplicate pattern
        $content = $content -replace '(?m)^export const createpredictiveAnalyticsEngine = \(\) => new createpredictiveAnalyticsEngine\(\);\s*$', ''
        
        # Remove any trailing duplicate export lines
        $content = $content -replace '(?m)\r?\n\s*\r?\n\s*export const create\w+ = \(\) => new create\w+\(\);\s*$', ''
        
        # Clean up extra newlines
        $content = $content -replace '\r?\n\s*\r?\n\s*\r?\n', "`n`n"
        
        if ($content -ne $originalContent) {
            $content | Set-Content -Path $file.FullName -Encoding UTF8 -NoNewline
            Write-Host "  ✅ Fixed duplicates: $($file.Name)" -ForegroundColor Green
            $totalFixed++
            $hasChanges = $true
        }
        
    } catch {
        Write-Host "  ❌ Error processing $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Fixed duplicate definitions in $totalFixed files" -ForegroundColor Green
Write-Host ""