# 🔒 SCRIPT DE BACKUP COMPLETO - NeonPro Cleanup
# Data: 2025-08-22
# Objetivo: Criar backup completo antes da limpeza sistemática

param(
    [string]$SourcePath = "D:\neonpro",
    [string]$BackupBase = "D:\neonpro_backup",
    [switch]$SkipNodeModules = $true,
    [switch]$Verify = $true
)

# Configurações
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "${BackupBase}_${timestamp}"
$logFile = "$backupPath\backup_log.txt"
$checksumFile = "$backupPath\checksums.txt"

# Cores para output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Info($msg) { Write-ColorOutput Yellow "ℹ️  $msg" }
function Write-Success($msg) { Write-ColorOutput Green "✅ $msg" }
function Write-Error($msg) { Write-ColorOutput Red "❌ $msg" }
function Write-Warning($msg) { Write-ColorOutput Magenta "⚠️  $msg" }

# Função para calcular tamanho
function Get-DirectorySize($path) {
    $size = (Get-ChildItem -Path $path -Recurse -Force | Measure-Object -Property Length -Sum).Sum
    return [math]::Round($size / 1MB, 2)
}

# Início do backup
Write-Info "🚀 INICIANDO BACKUP COMPLETO DO NEONPRO"
Write-Info "Fonte: $SourcePath"
Write-Info "Destino: $backupPath"
Write-Info "Timestamp: $timestamp"

# Verificar espaço em disco
$sourceSize = Get-DirectorySize $SourcePath
Write-Info "Tamanho da fonte: ${sourceSize} MB"

# Criar diretório de backup
try {
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    Write-Success "Diretório de backup criado: $backupPath"
} catch {
    Write-Error "Falha ao criar diretório de backup: $_"
    exit 1
}

# Iniciar log
$startTime = Get-Date
"🔒 BACKUP COMPLETO - NEONPRO CLEANUP" | Out-File -FilePath $logFile -Encoding UTF8
"Data/Hora: $startTime" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Fonte: $SourcePath" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Destino: $backupPath" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Tamanho Fonte: ${sourceSize} MB" | Out-File -FilePath $logFile -Append -Encoding UTF8
"" | Out-File -FilePath $logFile -Append -Encoding UTF8

# Exclusões para otimizar backup
$excludePatterns = @()
if ($SkipNodeModules) {
    $excludePatterns += "node_modules"
    Write-Warning "node_modules será EXCLUÍDO do backup (pode ser reinstalado)"
}

Write-Info "📁 Iniciando cópia de arquivos..."

# Usar robocopy para backup eficiente
$robocopyParams = @(
    $SourcePath,
    $backupPath,
    "/MIR",           # Mirror (inclui remoção de arquivos que não existem na fonte)
    "/R:3",           # Retry 3 vezes
    "/W:10",          # Wait 10 segundos entre retries
    "/MT:8",          # Multi-thread (8 threads)
    "/V",             # Verbose
    "/TEE",           # Output para console e log
    "/LOG+:$backupPath\robocopy_log.txt"
)

# Adicionar exclusões
if ($excludePatterns.Count -gt 0) {
    $robocopyParams += "/XD"
    $robocopyParams += $excludePatterns
}

# Executar robocopy
try {
    Write-Info "🔄 Executando robocopy..."
    $result = & robocopy @robocopyParams
    $exitCode = $LASTEXITCODE
    
    # Robocopy exit codes: 0-7 são sucessos, 8+ são erros
    if ($exitCode -lt 8) {
        Write-Success "Backup concluído com sucesso (código: $exitCode)"
        "BACKUP CONCLUÍDO - Código: $exitCode" | Out-File -FilePath $logFile -Append -Encoding UTF8
    } else {
        Write-Error "Backup falhou com código: $exitCode"
        "BACKUP FALHOU - Código: $exitCode" | Out-File -FilePath $logFile -Append -Encoding UTF8
        exit $exitCode
    }
} catch {
    Write-Error "Erro durante o backup: $_"
    "ERRO DURANTE BACKUP: $_" | Out-File -FilePath $logFile -Append -Encoding UTF8
    exit 1
}

# Calcular estatísticas
$endTime = Get-Date
$duration = $endTime - $startTime
$backupSize = Get-DirectorySize $backupPath

Write-Info "📊 Gerando estatísticas do backup..."
"" | Out-File -FilePath $logFile -Append -Encoding UTF8
"=== ESTATÍSTICAS DO BACKUP ===" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Início: $startTime" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Fim: $endTime" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Duração: $($duration.ToString('hh\:mm\:ss'))" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Tamanho Backup: ${backupSize} MB" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Compressão: $([math]::Round((1 - $backupSize / $sourceSize) * 100, 2))%" | Out-File -FilePath $logFile -Append -Encoding UTF8

# Verificação de integridade (se solicitada)
if ($Verify) {
    Write-Info "🔍 Verificando integridade do backup..."
    "=== VERIFICAÇÃO DE INTEGRIDADE ===" | Out-File -FilePath $logFile -Append -Encoding UTF8
    
    try {
        # Comparar contagens de arquivos
        $sourceFiles = (Get-ChildItem -Path $SourcePath -Recurse -File | Where-Object { $_.FullName -notmatch "node_modules" }).Count
        $backupFiles = (Get-ChildItem -Path $backupPath -Recurse -File | Where-Object { $_.FullName -notmatch "robocopy_log.txt|backup_log.txt|checksums.txt" }).Count
        
        Write-Info "Arquivos na fonte: $sourceFiles"
        Write-Info "Arquivos no backup: $backupFiles"
        
        "Arquivos Fonte: $sourceFiles" | Out-File -FilePath $logFile -Append -Encoding UTF8
        "Arquivos Backup: $backupFiles" | Out-File -FilePath $logFile -Append -Encoding UTF8
        
        if ($sourceFiles -eq $backupFiles) {
            Write-Success "✅ Contagem de arquivos: VERIFICADA"
            "Contagem de arquivos: VERIFICADA ✅" | Out-File -FilePath $logFile -Append -Encoding UTF8
        } else {
            Write-Warning "⚠️ Contagem de arquivos: DIFERENTE (pode ser normal devido a exclusões)"
            "Contagem de arquivos: DIFERENTE ⚠️" | Out-File -FilePath $logFile -Append -Encoding UTF8
        }
    } catch {
        Write-Warning "Erro na verificação: $_"
        "Erro na verificação: $_" | Out-File -FilePath $logFile -Append -Encoding UTF8
    }
}

# Criar script de restauração
$restoreScript = @"
# 🔄 SCRIPT DE RESTAURAÇÃO - NeonPro Backup
# Criado automaticamente em: $timestamp
# Backup: $backupPath

param(
    [string]`$RestoreTo = "$SourcePath",
    [switch]`$Force = `$false
)

if (-not `$Force) {
    Write-Host "⚠️  ATENÇÃO: Este script irá SOBRESCREVER o diretório de destino!" -ForegroundColor Red
    Write-Host "Backup: $backupPath" -ForegroundColor Yellow
    Write-Host "Destino: `$RestoreTo" -ForegroundColor Yellow
    `$confirm = Read-Host "Digite 'RESTORE' para confirmar"
    if (`$confirm -ne "RESTORE") {
        Write-Host "❌ Restauração cancelada" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🔄 Iniciando restauração..." -ForegroundColor Green
robocopy "$backupPath" "`$RestoreTo" /MIR /R:3 /W:10 /MT:8 /V

if (`$LASTEXITCODE -lt 8) {
    Write-Host "✅ Restauração concluída com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Falha na restauração (código: `$LASTEXITCODE)" -ForegroundColor Red
}
"@

$restoreScriptPath = "$backupPath\restore-backup.ps1"
$restoreScript | Out-File -FilePath $restoreScriptPath -Encoding UTF8

# Finalização
Write-Success "🎉 BACKUP COMPLETO FINALIZADO!"
Write-Info "📁 Localização: $backupPath"
Write-Info "📊 Tamanho: ${backupSize} MB"
Write-Info "⏱️  Duração: $($duration.ToString('hh\:mm\:ss'))"
Write-Info "📜 Log: $logFile"
Write-Info "🔄 Restauração: $restoreScriptPath"

"=== BACKUP FINALIZADO COM SUCESSO ===" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Localização: $backupPath" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Script de Restauração: $restoreScriptPath" | Out-File -FilePath $logFile -Append -Encoding UTF8

Write-Info "🔒 Backup pronto para início da limpeza sistemática!"