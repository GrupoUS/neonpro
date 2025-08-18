# PowerShell script to batch-fix Supabase mock patterns in professionals test

$filePath = "E:\neonpro\tools\testing\__tests__\lib\professionals.test.ts"
$content = Get-Content $filePath -Raw

# Pattern 1: Replace simple mockResolvedValue patterns
$content = $content -replace 'mockSupabaseClient\s*\n\s*\.from\(\)\s*\n\s*\..*\n\s*\.mockResolvedValue\(([^)]+)\);', 'setupMockResponse($1);'

# Pattern 2: Replace multi-line chained mockResolvedValue patterns
$content = $content -replace '(?s)mockSupabaseClient\s*\.from\(\).*?\.mockResolvedValue\(([^)]+)\);', 'setupMockResponse($1);'

# Pattern 3: Replace single-line chained patterns
$content = $content -replace 'mockSupabaseClient\.from\(\)\..*?\.mockResolvedValue\(([^)]+)\);', 'setupMockResponse($1);'

# Write the updated content back
Set-Content $filePath $content -Encoding UTF8

Write-Host "Mock patterns updated in professionals test file"