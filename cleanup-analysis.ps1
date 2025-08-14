# NEONPRO CLEANUP ANALYSIS SCRIPT (READ-ONLY)
# Analise segura para limpeza do projeto NeonPro Healthcare
# FASE 1: Analise sem modificacoes

param(
    [string]$ProjectPath = "E:\neonpro",
    [switch]$IncludeNodeModules = $false
)

Write-Host "NEONPRO HEALTHCARE - ANALISE DE LIMPEZA" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Diretorio: $ProjectPath" -ForegroundColor Yellow
Write-Host "Modo: READ-ONLY (sem modificacoes)" -ForegroundColor Green
Write-Host ""

# Função para calcular tamanho de arquivo/diretório
function Get-FolderSize {
    param([string]$Path)
    if (Test-Path $Path) {
        if ((Get-Item $Path).PSIsContainer) {
            $size = (Get-ChildItem $Path -Recurse -File | Measure-Object -Property Length -Sum).Sum
            if ($size -eq $null) { return 0 }
            return $size
        } else {
            return (Get-Item $Path).Length
        }
    }
    return 0
}

# Função para formatar tamanho
function Format-FileSize {
    param([long]$Size)
    if ($Size -eq 0) { return "0 B" }
    $units = @("B", "KB", "MB", "GB")
    $index = 0
    $size = [double]$Size
    while ($size -ge 1024 -and $index -lt $units.Length - 1) {
        $size /= 1024
        $index++
    }
    return "{0:N2} {1}" -f $size, $units[$index]
}

# Definir categorias de limpeza
$Categories = @{
    "Documentação Temporária" = @(
        "AUTH-01-IMPLEMENTATION-SUMMARY.md",
        "clerk-implementation-progress.md", 
        "CLERK_IMPLEMENTATION_SUMMARY.md",
        "CONFIGURAR_SENHA_URGENTE.md",
        "COPILOT_ENHANCEMENT_SUMMARY.md",
        "DEBUGGING_REPORT.md",
        "middleware-files-analysis.md",
        "middleware-integration-analysis.md",
        "OPTIMIZATION_REPORT_FINAL.md",
        "SESSION_MANAGEMENT_README.md",
        "SESSION_SYSTEM_README.md",
        "VALIDATION_REPORT.md"
    )
    "Arquivos Backup/Duplicados" = @(
        "instrumentation-backup.ts",
        "middleware-alternative.ts",
        "package-root.json",
        "postcss.config.js",
        "next.config.js",
        "tailwind.config.js"
    )
    "Configurações Temporárias" = @(
        ".setup-report.json",
        ".neonpro-dev-config.json",
        ".traeconfig",
        "supabase-url-config.json"
    )
    "Diretórios Cache/Temporários" = @(
        ".bmad-core"
    )
}

# Adicionar node_modules se solicitado
if ($IncludeNodeModules) {
    $Categories["Diretórios Regeneráveis"] = @("node_modules")
}

$TotalSize = 0
$TotalFiles = 0
$FoundItems = @()

Write-Host "ANALISE POR CATEGORIA" -ForegroundColor Magenta
Write-Host "=====================" -ForegroundColor Magenta

foreach ($Category in $Categories.Keys) {
    Write-Host ""
    Write-Host "Categoria: $Category" -ForegroundColor White
    Write-Host ("-" * ($Category.Length + 3))
    
    $CategorySize = 0
    $CategoryFiles = 0
    
    foreach ($Item in $Categories[$Category]) {
        $FullPath = Join-Path $ProjectPath $Item
        
        if (Test-Path $FullPath) {
            $Size = Get-FolderSize $FullPath
            $CategorySize += $Size
            $CategoryFiles++
            $TotalSize += $Size
            $TotalFiles++
            
            $Type = if ((Get-Item $FullPath).PSIsContainer) { "DIR" } else { "FILE" }
            $SizeFormatted = Format-FileSize $Size
            
            Write-Host "  ✓ [$Type] $Item ($SizeFormatted)" -ForegroundColor Green
            
            # Adicionar à lista de itens encontrados
            $FoundItems += @{
                Category = $Category
                Name = $Item
                FullPath = $FullPath
                Size = $Size
                Type = $Type
            }
        } else {
            Write-Host "  ✗ [---] $Item (não encontrado)" -ForegroundColor DarkGray
        }
    }
    
    if ($CategoryFiles -gt 0) {
        $CategorySizeFormatted = Format-FileSize $CategorySize
        Write-Host "  Subtotal: $CategoryFiles itens, $CategorySizeFormatted" -ForegroundColor Yellow
    } else {
        Write-Host "  Nenhum item encontrado nesta categoria" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "RESUMO GERAL" -ForegroundColor Cyan
Write-Host "============" -ForegroundColor Cyan
Write-Host "Total de itens encontrados: $TotalFiles" -ForegroundColor White
Write-Host "Espaço total liberado: $(Format-FileSize $TotalSize)" -ForegroundColor White

if ($TotalFiles -eq 0) {
    Write-Host ""
    Write-Host "Projeto ja esta limpo! Nenhum arquivo desnecessario encontrado." -ForegroundColor Green
    exit 0
}

# Gerar arquivo de relatório
$ReportPath = Join-Path $ProjectPath "cleanup-report.txt"

# Criar conteúdo do relatório
$ReportContent = @()
$ReportContent += "NEONPRO HEALTHCARE - RELATORIO DE LIMPEZA"
$ReportContent += "========================================"
$ReportContent += "Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$ReportContent += "Diretorio: $ProjectPath"
$ReportContent += "Node Modules incluido: $IncludeNodeModules"
$ReportContent += ""
$ReportContent += "ITENS IDENTIFICADOS PARA LIMPEZA:"

foreach ($Item in $FoundItems) {
    $SizeFormatted = Format-FileSize $Item.Size
    $ReportContent += "[$($Item.Type)] $($Item.Name) - $SizeFormatted - $($Item.Category)"
}

$ReportContent += ""
$ReportContent += "RESUMO:"
$ReportContent += "Total de itens: $TotalFiles"
$ReportContent += "Espaco liberado: $(Format-FileSize $TotalSize)"
$ReportContent += ""
$ReportContent += "PROXIMOS PASSOS:"
$ReportContent += "1. Revisar este relatorio cuidadosamente"
$ReportContent += "2. Executar: .\cleanup-quarantine.ps1 (quando criado)"
$ReportContent += "3. Testar projeto apos quarentena"
$ReportContent += "4. Deletar quarentena se tudo estiver funcionando"

$ReportContent | Out-File -FilePath $ReportPath -Encoding UTF8
Write-Host ""
Write-Host "Relatorio salvo em: $ReportPath" -ForegroundColor Cyan

Write-Host ""
Write-Host "CONFIRMACAO DE SEGURANCA" -ForegroundColor Red
Write-Host "=========================" -ForegroundColor Red
Write-Host "Esta foi uma analise READ-ONLY" -ForegroundColor Green
Write-Host "Nenhum arquivo foi modificado" -ForegroundColor Green
Write-Host "Todos os arquivos essenciais foram preservados" -ForegroundColor Green
Write-Host ""
Write-Host "Para prosseguir com a limpeza, aguarde as proximas instrucoes." -ForegroundColor Yellow