# SCRIPT DE BACKUP COMPLETO - NeonPro Cleanup
# Data: 2025-08-22

param(
    [string]$SourcePath = "D:\neonpro",
    [string]$BackupBase = "D:\neonpro_backup",
    [switch]$SkipNodeModules = $true
)

# Configuracoes
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "${BackupBase}_${timestamp}"
$logFile = "$backupPath\backup_log.txt"

Write-Host "Iniciando backup completo do NeonPro..." -ForegroundColor Green
Write-Host "Fonte: $SourcePath" -ForegroundColor Yellow
Write-Host "Destino: $backupPath" -ForegroundColor Yellow
Write-Host "Timestamp: $timestamp" -ForegroundColor Yellow

# Verificar se fonte existe
if (-not (Test-Path $SourcePath)) {
    Write-Host "ERRO: Diretorio fonte nao encontrado: $SourcePath" -ForegroundColor Red
    exit 1
}

# Criar diretorio de backup
try {
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    Write-Host "Diretorio de backup criado: $backupPath" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Falha ao criar diretorio de backup: $_" -ForegroundColor Red
    exit 1
}

# Iniciar log
$startTime = Get-Date
"BACKUP COMPLETO - NEONPRO CLEANUP" | Out-File -FilePath $logFile -Encoding UTF8
"Data/Hora: $startTime" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Fonte: $SourcePath" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Destino: $backupPath" | Out-File -FilePath $logFile -Append -Encoding UTF8
"" | Out-File -FilePath $logFile -Append -Encoding UTF8

Write-Host "Iniciando copia de arquivos..." -ForegroundColor Green

# Usar robocopy para backup
$robocopyParams = @(
    $SourcePath,
    $backupPath,
    "/MIR",
    "/R:3",
    "/W:10", 
    "/MT:4",
    "/V",
    "/LOG+:$backupPath\robocopy_log.txt"
)

# Excluir node_modules se solicitado
if ($SkipNodeModules) {
    $robocopyParams += "/XD"
    $robocopyParams += "node_modules"
    Write-Host "node_modules sera EXCLUIDO do backup" -ForegroundColor Yellow
}

# Executar robocopy
try {
    Write-Host "Executando robocopy..." -ForegroundColor Cyan
    $result = & robocopy @robocopyParams
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -lt 8) {
        Write-Host "Backup concluido com sucesso (codigo: $exitCode)" -ForegroundColor Green
        "BACKUP CONCLUIDO - Codigo: $exitCode" | Out-File -FilePath $logFile -Append -Encoding UTF8
    } else {
        Write-Host "Backup falhou com codigo: $exitCode" -ForegroundColor Red
        "BACKUP FALHOU - Codigo: $exitCode" | Out-File -FilePath $logFile -Append -Encoding UTF8
        exit $exitCode
    }
} catch {
    Write-Host "Erro durante o backup: $_" -ForegroundColor Red
    "ERRO DURANTE BACKUP: $_" | Out-File -FilePath $logFile -Append -Encoding UTF8
    exit 1
}

# Estatisticas
$endTime = Get-Date
$duration = $endTime - $startTime

"" | Out-File -FilePath $logFile -Append -Encoding UTF8
"=== ESTATISTICAS DO BACKUP ===" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Inicio: $startTime" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Fim: $endTime" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Duracao: $($duration.ToString('hh\:mm\:ss'))" | Out-File -FilePath $logFile -Append -Encoding UTF8

# Criar script de restauracao simples
$restoreScript = @"
# SCRIPT DE RESTAURACAO - NeonPro Backup
# Criado em: $timestamp
# Backup: $backupPath

Write-Host "ATENCAO: Este script ira SOBRESCREVER o diretorio de destino!" -ForegroundColor Red
Write-Host "Backup: $backupPath" -ForegroundColor Yellow
Write-Host "Destino: D:\neonpro" -ForegroundColor Yellow

`$confirm = Read-Host "Digite RESTORE para confirmar"
if (`$confirm -ne "RESTORE") {
    Write-Host "Restauracao cancelada" -ForegroundColor Red
    exit 1
}

Write-Host "Iniciando restauracao..." -ForegroundColor Green
robocopy "$backupPath" "D:\neonpro" /MIR /R:3 /W:10 /MT:4 /V

if (`$LASTEXITCODE -lt 8) {
    Write-Host "Restauracao concluida com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Falha na restauracao (codigo: `$LASTEXITCODE)" -ForegroundColor Red
}
"@

$restoreScriptPath = "$backupPath\restore-backup.ps1"
$restoreScript | Out-File -FilePath $restoreScriptPath -Encoding UTF8

# Finalizacao
Write-Host ""
Write-Host "BACKUP COMPLETO FINALIZADO!" -ForegroundColor Green
Write-Host "Localizacao: $backupPath" -ForegroundColor Yellow
Write-Host "Duracao: $($duration.ToString('hh\:mm\:ss'))" -ForegroundColor Yellow
Write-Host "Log: $logFile" -ForegroundColor Yellow
Write-Host "Restauracao: $restoreScriptPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backup pronto para inicio da limpeza sistematica!" -ForegroundColor Green

"=== BACKUP FINALIZADO COM SUCESSO ===" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Localizacao: $backupPath" | Out-File -FilePath $logFile -Append -Encoding UTF8
"Script de Restauracao: $restoreScriptPath" | Out-File -FilePath $logFile -Append -Encoding UTF8