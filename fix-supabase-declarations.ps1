# Fix malformed supabase = await createClient declarations
# This script fixes lines that incorrectly declare supabase as a global variable

param(
    [string]$RootPath = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src"
)

Write-Host "🔧 Fixing malformed supabase declarations..." -ForegroundColor Green

# Find all TypeScript and JavaScript files
$files = Get-ChildItem -Path $RootPath -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" | Where-Object { 
    $_.FullName -notmatch "node_modules|\.git|dist|build" 
}

$totalFixed = 0
$filesModified = @()

foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        
        # Fix pattern: supabase = await createClient -> const supabase = await createClient()
        $content = $content -replace 'supabase\s*=\s*await\s+createClient\s*(?!\()', 'const supabase = await createClient()'
        
        # Fix pattern: supabase = createClient -> const supabase = createClient(
        $content = $content -replace '(?<!const\s+)supabase\s*=\s*createClient\s*(?!\()', 'const supabase = createClient('
        
        # Fix malformed lines that have incomplete createClient calls
        $content = $content -replace 'supabase\s*=\s*createClient\s*$', 'const supabase = await createClient()'
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $filesModified += $file.FullName
            $totalFixed++
            Write-Host "✅ Fixed: $($file.FullName)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "❌ Error processing $($file.FullName): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "Files checked: $($files.Count)" -ForegroundColor White
Write-Host "Files modified: $totalFixed" -ForegroundColor Green

if ($totalFixed -gt 0) {
    Write-Host "`n🔧 Modified files:" -ForegroundColor Yellow
    $filesModified | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
}

Write-Host "`n✅ Supabase declaration fixes completed!" -ForegroundColor Green