# Script de Consolidação de Pastas Legacy
# Fase 2 - Limpeza e Consolidação

Write-Host "🧹 Iniciando consolidação de pastas legacy..." -ForegroundColor Green

$appsPath = "C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro\apps\neonpro-web\src"

# Lista de pastas legacy para processar
$legacyFolders = @(
    "analytics-legacy",
    "dashboard-legacy", 
    "notifications-legacy",
    "patient-portal-legacy",
    "portal-legacy"
)

foreach ($folder in $legacyFolders) {
    $legacyPath = Join-Path $appsPath "components\$folder"
    $modernPath = Join-Path $appsPath "components\$($folder -replace '-legacy', '')"
    
    Write-Host "📁 Processando: $folder" -ForegroundColor Yellow
    
    if (Test-Path $legacyPath) {
        $files = Get-ChildItem $legacyPath -File
        
        if ($files.Count -eq 0) {
            Write-Host "   ❌ Pasta vazia - removendo" -ForegroundColor Red
            Remove-Item $legacyPath -Recurse -Force
        }
        elseif ($files.Count -eq 1 -and $files[0].Name -eq "index.ts") {
            # Se só tem index.ts, verificar se é só exports
            $content = Get-Content $files[0].FullName | Select-Object -First 5
            if ($content -match "export.*from") {
                Write-Host "   📤 Apenas exports - removendo" -ForegroundColor Red
                Remove-Item $legacyPath -Recurse -Force
            }
        }
        else {
            Write-Host "   📋 $($files.Count) arquivos encontrados - mantendo para análise manual" -ForegroundColor Cyan
        }
    }
}

# Verificar pastas lib legacy
$libLegacyFolders = @(
    "ai-legacy",
    "audit-legacy", 
    "auth-legacy",
    "communication-legacy",
    "compliance-legacy",
    "dashboard-legacy",
    "lgpd-legacy",
    "notifications-legacy",
    "resources-legacy",
    "services-legacy",
    "types-legacy",
    "utils-legacy"
)

foreach ($folder in $libLegacyFolders) {
    $legacyPath = Join-Path $appsPath "lib\$folder"
    
    Write-Host "📚 Processando lib: $folder" -ForegroundColor Yellow
    
    if (Test-Path $legacyPath) {
        $items = Get-ChildItem $legacyPath -Recurse
        Write-Host "   📋 $($items.Count) itens encontrados - mantendo para consolidação" -ForegroundColor Cyan
    }
}

Write-Host "✅ Consolidação automática concluída!" -ForegroundColor Green
Write-Host "📝 Próximo: Análise manual das pastas legacy restantes" -ForegroundColor Blue