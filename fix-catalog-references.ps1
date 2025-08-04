# Script para corrigir catalog references
Write-Host "Corrigindo catalog references em packages..." -ForegroundColor Cyan

$packages = @(
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\packages\types\package.json",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\packages\ui\package.json",
    "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\packages\utils\package.json"
)

$fixes = @{
    '"typescript": "catalog:"' = '"typescript": "^5.4.0"'
    '"eslint": "catalog:"' = '"eslint": "^8.57.0"'
    '"eslint-config-next": "catalog:"' = '"eslint-config-next": "^14.2.0"'
    '"prettier": "catalog:"' = '"prettier": "^3.2.0"'
    '"tailwindcss": "catalog:"' = '"tailwindcss": "^3.4.0"'
    '"react": "catalog:"' = '"react": "^18.3.0"'
    '"react-dom": "catalog:"' = '"react-dom": "^18.3.0"'
    '"@types/react": "catalog:"' = '"@types/react": "^18.3.0"'
    '"@types/react-dom": "catalog:"' = '"@types/react-dom": "^18.3.0"'
    '"@types/node": "catalog:"' = '"@types/node": "^20.12.0"'
}

foreach ($packageFile in $packages) {
    Write-Host "Corrigindo: $packageFile" -ForegroundColor Yellow
    $content = Get-Content $packageFile -Raw
    
    foreach ($oldValue in $fixes.Keys) {
        $newValue = $fixes[$oldValue]
        $content = $content -replace [regex]::Escape($oldValue), $newValue
    }
    
    Set-Content -Path $packageFile -Value $content -NoNewline
    Write-Host "✓ Corrigido: $packageFile" -ForegroundColor Green
}