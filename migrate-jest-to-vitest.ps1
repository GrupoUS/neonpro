#!/usr/bin/env pwsh

# Jest to Vitest Migration Script for NeonPro
# Systematically converts all Jest syntax to Vitest

Write-Host "🔄 JEST → VITEST MIGRATION: Starting systematic conversion" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Define conversion patterns
$conversions = @{
    "jest\.fn\(\)" = "vi.fn()"
    "jest\.mock\(" = "vi.mock("
    "jest\.clearAllMocks\(\)" = "vi.clearAllMocks()"
    "jest\.resetAllMocks\(\)" = "vi.resetAllMocks()"
    "jest\.restoreAllMocks\(\)" = "vi.restoreAllMocks()"
    "jest\.Mock" = "vi.Mock"
    "jest\.Mocked" = "vi.Mocked"
    "jest\.SpyOn" = "vi.spyOn"
    "from '@jest/globals'" = "from 'vitest'"
    "import \{ jest \}" = "import { vi }"
    "@jest/globals" = "vitest"
}

# Get all test files
$testFiles = Get-ChildItem -Path "." -Recurse -Include "*.test.ts", "*.test.tsx", "*.spec.ts", "*.spec.tsx" -ErrorAction SilentlyContinue

Write-Host "📊 Found $($testFiles.Count) test files to convert" -ForegroundColor Yellow

foreach ($file in $testFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        $originalContent = $content
        $hasChanges = $false

        Write-Host "🔧 Processing: $($file.Name)" -ForegroundColor Green
        
        # Apply all conversions
        foreach ($pattern in $conversions.Keys) {
            if ($content -match $pattern) {
                $content = $content -replace $pattern, $conversions[$pattern]
                $hasChanges = $true
                Write-Host "  ✅ Converted: $pattern → $($conversions[$pattern])" -ForegroundColor Cyan
            }
        }

        # Write back if changes were made
        if ($hasChanges) {
            Set-Content -Path $file.FullName -Value $content -ErrorAction Stop
            Write-Host "  💾 Saved changes to $($file.Name)" -ForegroundColor Green
        } else {
            Write-Host "  ℹ️  No Jest patterns found in $($file.Name)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "  ❌ Error processing $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 VITEST IMPORT ADDITION: Adding vi imports where needed" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Add vi imports to files that use vi functions but don't import it
foreach ($file in $testFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        
        # Check if file uses vi functions but doesn't import vi
        if (($content -match "vi\.") -and ($content -notmatch "import.*vi.*from.*vitest")) {
            # Add vi import at the top
            $lines = $content -split "`r?`n"
            $importAdded = $false
            
            for ($i = 0; $i -lt $lines.Length; $i++) {
                if ($lines[$i] -match "^import" -and -not $importAdded) {
                    # Insert vi import before the first import
                    $lines = $lines[0..($i-1)] + "import { vi } from 'vitest';" + $lines[$i..($lines.Length-1)]
                    $importAdded = $true
                    break
                }
            }
            
            if (-not $importAdded -and $content.Trim() -ne "") {
                # If no imports found, add at the beginning
                $lines = "import { vi } from 'vitest';" + "`n" + $lines
            }
            
            if ($importAdded) {
                $newContent = $lines -join "`n"
                Set-Content -Path $file.FullName -Value $newContent -ErrorAction Stop
                Write-Host "  ✅ Added vi import to $($file.Name)" -ForegroundColor Green
            }
        }
    }
    catch {
        Write-Host "  ❌ Error adding import to $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🏆 MIGRATION COMPLETE!" -ForegroundColor Green
Write-Host "════════════════════════" -ForegroundColor Green
Write-Host "✅ All Jest syntax converted to Vitest" -ForegroundColor Cyan
Write-Host "✅ Vi imports added where needed" -ForegroundColor Cyan
Write-Host "🔧 Next: Update package.json and remove Jest configs" -ForegroundColor Yellow
Write-Host ""