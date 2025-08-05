#!/usr/bin/env pwsh

# Fix TypeScript errors - Targeted approach for critical files

Write-Host "🔧 Fixing critical TypeScript errors..." -ForegroundColor Cyan

# Function to fix escaped quotes in JSX
function Fix-EscapedQuotes {
    param($filePath)
    
    if (Test-Path $filePath) {
        Write-Host "Fixing escaped quotes in: $filePath" -ForegroundColor Yellow
        
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Fix escaped quotes in className and other attributes
        $content = $content -replace 'className=\\"', 'className="'
        $content = $content -replace '\\"', '"'
        
        # Save with UTF-8 encoding
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        
        Write-Host "   ✅ Fixed: $filePath" -ForegroundColor Green
    } else {
        Write-Host "   ❌ File not found: $filePath" -ForegroundColor Red
    }
}

# Fix the notification files first (highest error count)
Write-Host "`n📧 Fixing notification files..." -ForegroundColor Yellow

$notificationFiles = @(
    "apps/neonpro-web/src/components/dashboard/notifications/notification-dashboard.tsx",
    "apps/neonpro-web/src/components/dashboard/notifications/notification-sender.tsx"
)

foreach ($file in $notificationFiles) {
    Fix-EscapedQuotes $file
}

Write-Host "`n🔍 Running basic syntax check..." -ForegroundColor Yellow
try {
    & pnpm tsc --noEmit 2>&1 | Select-String "error TS" | Select-Object -First 10
} catch {
    Write-Host "Type check failed, but we'll continue with more fixes..." -ForegroundColor Yellow
}

Write-Host "`n✅ Initial fixes completed!" -ForegroundColor Green