# PowerShell script to fix cookies usage in API routes

Write-Host "🔧 Fixing cookies usage in API routes..." -ForegroundColor Yellow

# Get all route.ts files in api directories
$routeFiles = Get-ChildItem -Path "apps\neonpro-web\src\app\api*" -Name "route.ts" -Recurse

Write-Host "Found $($routeFiles.Count) API route files" -ForegroundColor Green

foreach ($file in $routeFiles) {
    $fullPath = "apps\neonpro-web\src\app\$file"
    Write-Host "Processing: $file" -ForegroundColor Cyan
    
    # Read file content
    $content = Get-Content $fullPath -Raw
    
    # Check if file contains problematic imports
    if ($content -match "createRouteHandlerClient.*cookies" -or $content -match "import.*cookies.*from.*next/headers") {
        Write-Host "  - Fixing cookies usage in $file" -ForegroundColor Yellow
        
        # Replace import statements
        $content = $content -replace "import \{ createRouteHandlerClient \} from '@supabase/auth-helpers-nextjs'", ""
        $content = $content -replace "import \{ cookies \} from 'next/headers'", ""
        $content = $content -replace "import \{ NextRequest, NextResponse \} from 'next/server'", "import { NextRequest, NextResponse } from 'next/server';`nimport { createClient } from '@/app/utils/supabase/server';"
        
        # Replace createRouteHandlerClient usage
        $content = $content -replace "createRouteHandlerClient\(\s*\{\s*cookies\s*\}\s*\)", "await createClient()"
        
        # Clean up empty lines
        $content = $content -replace "(?m)^\s*$", ""
        $content = $content -replace "\n{3,}", "`n`n"
        
        # Write back to file
        $content | Set-Content $fullPath -NoNewline
        Write-Host "  ✅ Fixed: $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚪ No changes needed: $file" -ForegroundColor Gray
    }
}

Write-Host "🎉 Cookies usage fixed in API routes!" -ForegroundColor Green