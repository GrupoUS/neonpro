# TypeScript Errors Fix Script
# Fixes the 1918 TypeScript errors in NeonPro

Write-Host "🔧 Starting TypeScript Error Fix Process..." -ForegroundColor Cyan

# Define the main app directory
$AppDir = "apps/neonpro-web/src"

# Function to fix UTF-8 encoding issues
function Fix-EncodingIssues {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Fix common encoding issues
        $content = $content -replace '["""]', '"'  # Fix smart quotes
        $content = $content -replace '[''']', "'"  # Fix smart apostrophes
        $content = $content -replace '–', '-'      # Fix en-dash
        $content = $content -replace '—', '--'     # Fix em-dash
        $content = $content -replace '…', '...'    # Fix ellipsis
        $content = $content -replace '​', ''        # Remove zero-width space
        $content = $content -replace '‌', ''       # Remove zero-width non-joiner
        $content = $content -replace '‍', ''       # Remove zero-width joiner
        
        # Save with proper UTF-8 encoding
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "   Fixed encoding: $filePath" -ForegroundColor Green
    }
}

# Function to fix JSX syntax issues
function Fix-JSXSyntax {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Fix common JSX issues
        $content = $content -replace 'className="([^"]*)"([^>]*)"', 'className="$1"$2'
        $content = $content -replace '>\s*"([^"]*)"([^<]*)<', '>$1$2<'
        $content = $content -replace 'return\s*<div>([^<]*)"([^<]*)</div>', 'return <div>$1$2</div>'
        $content = $content -replace '"([^"]*)\s*>\s*([^<]*)"', '"$1">$2'
        
        # Fix unterminated string literals in JSX
        $content = $content -replace '=\s*"([^"]*)\n', '="$1" '
        $content = $content -replace '>\s*([^<"]*)"([^<]*)<', '>$1$2<'
        
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "   Fixed JSX syntax: $filePath" -ForegroundColor Green
    }
}

# Function to fix object syntax issues
function Fix-ObjectSyntax {
    param($filePath)
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Fix missing commas in objects
        $content = $content -replace '(\w+):\s*([^,}\n]+)\n\s*(\w+):', '$1: $2,$3:'
        $content = $content -replace '(\w+):\s*([^,}\n]+)\s*}', '$1: $2 }'
        
        # Fix array syntax
        $content = $content -replace '\[\s*([^,\]]+)\s*([^,\]]+)\s*\]', '[$1, $2]'
        
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "   Fixed object syntax: $filePath" -ForegroundColor Green
    }
}

# Step 1: Fix the most critical files with high error counts

Write-Host "📝 Step 1: Fixing notification files..." -ForegroundColor Yellow

# Fix notification-dashboard.tsx (274 errors)
$notificationDashboard = "$AppDir/components/dashboard/notifications/notification-dashboard.tsx"
Fix-EncodingIssues $notificationDashboard
Fix-JSXSyntax $notificationDashboard

# Fix notification-sender.tsx (286 errors)  
$notificationSender = "$AppDir/components/dashboard/notifications/notification-sender.tsx"
Fix-EncodingIssues $notificationSender
Fix-JSXSyntax $notificationSender

Write-Host "📊 Step 2: Fixing analytics files..." -ForegroundColor Yellow

# Fix communication-analytics/analytics-engine.ts (483 errors)
$analyticsEngine = "$AppDir/lib/communication-analytics/analytics-engine.ts"
Fix-EncodingIssues $analyticsEngine
Fix-ObjectSyntax $analyticsEngine

Write-Host "🔐 Step 3: Fixing auth files..." -ForegroundColor Yellow

# Fix auth/mfa.ts (335 errors)
$authMfa = "$AppDir/lib/auth/mfa.ts"
Fix-EncodingIssues $authMfa
Fix-ObjectSyntax $authMfa

# Fix approval-service.ts (291 errors)
$approvalService = "$AppDir/lib/services/approval-service.ts"
Fix-EncodingIssues $approvalService
Fix-ObjectSyntax $approvalService

Write-Host "💾 Step 4: Fixing storage files..." -ForegroundColor Yellow

# Fix supabase-storage.ts (168 errors)
$supabaseStorage = "$AppDir/lib/supabase-storage.ts"
Fix-EncodingIssues $supabaseStorage
Fix-ObjectSyntax $supabaseStorage

Write-Host "🔧 Step 5: Fixing remaining critical files..." -ForegroundColor Yellow

# Fix other critical files
$criticalFiles = @(
    "$AppDir/app/lib/auth/permissions/use-permissions.ts",
    "$AppDir/components/dashboard/no-show-prediction/overview.tsx",
    "$AppDir/components/financial/kpi-dashboard/index.ts",
    "$AppDir/components/predictions/prediction-analytics.tsx",
    "$AppDir/hooks/auth/index.ts",
    "$AppDir/hooks/auth/useSessionActivity.ts",
    "$AppDir/hooks/use-global-state.ts",
    "$AppDir/hooks/use-permissions.ts",
    "$AppDir/lib/ai/health-monitoring.ts",
    "$AppDir/lib/analytics/intervention-engine.ts",
    "$AppDir/lib/analytics/no-show-prediction.ts",
    "$AppDir/lib/analytics/risk-scoring.ts",
    "$AppDir/lib/auth-advanced/middleware/auth-middleware.ts",
    "$AppDir/lib/auth/utils/session-utils.ts",
    "$AppDir/lib/conflict-resolution/conflict-detector.ts",
    "$AppDir/lib/conflict-resolution/resolution-engine.ts",
    "$AppDir/lib/inventory/config.ts",
    "$AppDir/lib/inventory/consumption-analytics.ts",
    "$AppDir/lib/inventory/fifo-management.ts",
    "$AppDir/lib/inventory/stock-output-management.ts",
    "$AppDir/lib/lgpd/automation/example.ts"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Fix-EncodingIssues $file
        if ($file -match "\.(tsx|jsx)$") {
            Fix-JSXSyntax $file
        }
        if ($file -match "\.(ts|js)$") {
            Fix-ObjectSyntax $file
        }
    }
}

# Fix the Supabase function
$supabaseFunction = "supabase/functions/stock-alerts-processor/index.ts"
if (Test-Path $supabaseFunction) {
    Fix-EncodingIssues $supabaseFunction
    Fix-ObjectSyntax $supabaseFunction
}

# Fix test file
$testFile = "__tests__/api/tax/declarations.test.ts"
if (Test-Path $testFile) {
    Fix-EncodingIssues $testFile
    Fix-ObjectSyntax $testFile
}

Write-Host "✅ Step 6: Running type check..." -ForegroundColor Yellow
pnpm tsc --noEmit

Write-Host "🎉 TypeScript error fix process completed!" -ForegroundColor Green
Write-Host "Please review the remaining errors and run 'pnpm tsc' to verify fixes." -ForegroundColor Cyan