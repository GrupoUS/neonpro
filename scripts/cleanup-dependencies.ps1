# 🧹 SCRIPT DE AUTOMAÇÃO - LIMPEZA DE DEPENDÊNCIAS PNPM
# Arquivo: scripts/cleanup-dependencies.ps1
# Uso: .\scripts\cleanup-dependencies.ps1 [-BackupOnly] [-DryRun] [-Verbose]

param(
    [switch]$BackupOnly,
    [switch]$DryRun,
    [switch]$Verbose
)

# Configurações
$ScriptName = "NEONPRO Dependency Cleanup Automation"
$BackupDir = "backup-dependencies"
$LogFile = "logs/dependency-cleanup-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# Função de logging
function Write-Log {
    param($Message, $Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    
    if ($Verbose -or $Level -eq "ERROR") {
        Write-Host $LogMessage -ForegroundColor $(
            switch ($Level) {
                "INFO" { "White" }
                "SUCCESS" { "Green" }
                "WARNING" { "Yellow" }
                "ERROR" { "Red" }
                default { "White" }
            }
        )
    }
    
    # Criar diretório de logs se não existir
    if (!(Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" -Force | Out-Null
    }
    
    Add-Content -Path $LogFile -Value $LogMessage
}

# Função para verificar se PNPM está disponível
function Test-PnpmAvailable {
    try {
        $pnpmVersion = pnpm --version 2>$null
        if ($pnpmVersion) {
            Write-Log "PNPM versão $pnpmVersion detectado" "SUCCESS"
            return $true
        }
    }
    catch {
        Write-Log "PNPM não encontrado. Instale PNPM primeiro." "ERROR"
        return $false
    }
    return $false
}

# Função para criar backup
function New-DependencyBackup {
    Write-Log "Iniciando processo de backup..."
    
    if (!(Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        Write-Log "Diretório de backup criado: $BackupDir" "SUCCESS"
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    
    try {
        # Backup do package.json
        if (Test-Path "package.json") {
            Copy-Item "package.json" "$BackupDir/package.json.backup-$timestamp"
            Write-Log "Backup do package.json criado" "SUCCESS"
        }
        
        # Backup do pnpm-lock.yaml
        if (Test-Path "pnpm-lock.yaml") {
            Copy-Item "pnpm-lock.yaml" "$BackupDir/pnpm-lock.yaml.backup-$timestamp"
            Write-Log "Backup do pnpm-lock.yaml criado" "SUCCESS"
        }
        
        # Backup do .npmrc se existir
        if (Test-Path ".npmrc") {
            Copy-Item ".npmrc" "$BackupDir/.npmrc.backup-$timestamp"
            Write-Log "Backup do .npmrc criado" "SUCCESS"
        }
        
        Write-Log "Backup concluído com sucesso!" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "Erro durante backup: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Função para obter métricas antes da limpeza
function Get-PreCleanupMetrics {
    Write-Log "Coletando métricas antes da limpeza..."
    
    $metrics = @{}
    
    try {
        if (Test-Path "node_modules") {
            $nodeModulesSize = (Get-ChildItem "node_modules" -Recurse -File | Measure-Object -Property Length -Sum).Sum
            $nodeModulesFiles = (Get-ChildItem "node_modules" -Recurse -File).Count
            
            $metrics.SizeBefore = [math]::Round($nodeModulesSize / 1GB, 2)
            $metrics.FilesBefore = $nodeModulesFiles
            
            Write-Log "Tamanho node_modules: $($metrics.SizeBefore) GB" "INFO"
            Write-Log "Arquivos node_modules: $($metrics.FilesBefore)" "INFO"
        }
        else {
            Write-Log "node_modules não encontrado" "WARNING"
            $metrics.SizeBefore = 0
            $metrics.FilesBefore = 0
        }
    }
    catch {
        Write-Log "Erro ao coletar métricas: $($_.Exception.Message)" "WARNING"
        $metrics.SizeBefore = 0
        $metrics.FilesBefore = 0
    }
    
    return $metrics
}

# Função principal de limpeza
function Invoke-DependencyCleanup {
    param($Metrics)
    
    Write-Log "Iniciando limpeza de dependências..."
    
    if ($DryRun) {
        Write-Log "MODO DRY RUN - Nenhuma alteração será feita" "WARNING"
        return $true
    }
    
    try {
        # 1. PNPM Prune
        Write-Log "Executando pnpm prune..."
        $pruneResult = pnpm prune 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Log "pnpm prune executado com sucesso" "SUCCESS"
        } else {
            Write-Log "pnpm prune com avisos (código $LASTEXITCODE)" "WARNING"
        }
        
        # 2. PNPM Store Prune
        Write-Log "Executando pnpm store prune..."
        $storePruneResult = pnpm store prune 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Log "pnpm store prune executado com sucesso" "SUCCESS"
        } else {
            Write-Log "pnpm store prune falhou (código $LASTEXITCODE)" "ERROR"
            return $false
        }
        
        # 3. PNPM Dedupe
        Write-Log "Executando pnpm dedupe..."
        $dedupeResult = pnpm dedupe 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Log "pnpm dedupe executado com sucesso" "SUCCESS"
        } else {
            Write-Log "pnpm dedupe falhou (código $LASTEXITCODE)" "ERROR"
            return $false
        }
        
        # 4. Reinstalação limpa
        Write-Log "Executando instalação limpa..."
        $installResult = pnpm install --ignore-scripts --include=optional 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Log "pnpm install executado com sucesso" "SUCCESS"
        } else {
            Write-Log "pnpm install falhou (código $LASTEXITCODE)" "ERROR"
            return $false
        }
        
        return $true
    }
    catch {
        Write-Log "Erro durante limpeza: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Função de validação pós-limpeza
function Test-PostCleanupValidation {
    Write-Log "Executando validação pós-limpeza..."
    
    try {
        # Type check
        Write-Log "Executando type-check..."
        $typeCheckResult = pnpm type-check 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Type-check passou com sucesso" "SUCCESS"
        } else {
            Write-Log "Type-check falhou (código $LASTEXITCODE)" "ERROR"
            return $false
        }
        
        # Verificar se package.json ainda existe
        if (!(Test-Path "package.json")) {
            Write-Log "package.json não encontrado!" "ERROR"
            return $false
        }
        
        # Verificar se node_modules foi recriado
        if (!(Test-Path "node_modules")) {
            Write-Log "node_modules não foi recriado!" "ERROR"
            return $false
        }
        
        Write-Log "Validação pós-limpeza concluída com sucesso!" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "Erro durante validação: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Função para gerar relatório final
function New-CleanupReport {
    param($MetricsBefore, $MetricsAfter, $Success)
    
    Write-Log "Gerando relatório de limpeza..."
    
    $reportFile = "DEPENDENCY-CLEANUP-REPORT-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
    
    $report = @"
# 📋 RELATÓRIO DE LIMPEZA AUTOMÁTICA - DEPENDÊNCIAS PNPM
**Data:** $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
**Script:** $ScriptName
**Status:** $(if ($Success) { "✅ SUCESSO" } else { "❌ FALHOU" })

## 📊 MÉTRICAS

| Métrica | ANTES | DEPOIS | DIFERENÇA |
|---------|-------|--------|-----------|
| **Tamanho** | $($MetricsBefore.SizeBefore) GB | $($MetricsAfter.SizeAfter) GB | $(if ($MetricsAfter.SizeAfter) { [math]::Round($MetricsAfter.SizeAfter - $MetricsBefore.SizeBefore, 2) } else { "N/A" }) GB |
| **Arquivos** | $($MetricsBefore.FilesBefore) | $($MetricsAfter.FilesAfter) | $(if ($MetricsAfter.FilesAfter) { $MetricsAfter.FilesAfter - $MetricsBefore.FilesBefore } else { "N/A" }) |

## 📝 LOG COMPLETO
Consulte: $LogFile

## 🔄 BACKUP DISPONÍVEL
Localização: $BackupDir/

$(if (!$Success) {
"## ⚠️ ROLLBACK NECESSÁRIO
Execute os comandos:
``````
cp $BackupDir/package.json.backup-* package.json
cp $BackupDir/pnpm-lock.yaml.backup-* pnpm-lock.yaml
pnpm install --frozen-lockfile
``````"
})
"@

    $report | Out-File -FilePath $reportFile -Encoding UTF8
    Write-Log "Relatório salvo em: $reportFile" "SUCCESS"
}

# SCRIPT PRINCIPAL
Write-Log "🚀 Iniciando $ScriptName" "SUCCESS"
Write-Log "Parâmetros: BackupOnly=$BackupOnly, DryRun=$DryRun, Verbose=$Verbose" "INFO"

# Verificar PNPM
if (!(Test-PnpmAvailable)) {
    exit 1
}

# Coletar métricas iniciais
$metricsBefore = Get-PreCleanupMetrics

# Criar backup
$backupSuccess = New-DependencyBackup
if (!$backupSuccess) {
    Write-Log "Falha no backup. Abortando." "ERROR"
    exit 1
}

if ($BackupOnly) {
    Write-Log "Modo BackupOnly ativado. Backup concluído." "SUCCESS"
    exit 0
}

# Executar limpeza
$cleanupSuccess = Invoke-DependencyCleanup -Metrics $metricsBefore
if (!$cleanupSuccess) {
    Write-Log "Falha na limpeza. Consulte os logs." "ERROR"
    exit 1
}

# Validação pós-limpeza
$validationSuccess = Test-PostCleanupValidation
if (!$validationSuccess) {
    Write-Log "Falha na validação pós-limpeza." "ERROR"
    exit 1
}

# Coletar métricas finais
$metricsAfter = Get-PreCleanupMetrics
$metricsAfter.SizeAfter = $metricsAfter.SizeBefore
$metricsAfter.FilesAfter = $metricsAfter.FilesBefore

# Gerar relatório
New-CleanupReport -MetricsBefore $metricsBefore -MetricsAfter $metricsAfter -Success $true

Write-Log "🎉 Limpeza automática concluída com sucesso!" "SUCCESS"
exit 0