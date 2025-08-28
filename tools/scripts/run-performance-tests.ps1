#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Executa testes de performance E2E para o NeonPro Healthcare System

.DESCRIPTION
    Script PowerShell para executar testes de performance com Playwright,
    gerar relatórios e validar métricas contra budgets definidos.

.PARAMETER Environment
    Ambiente de teste (development, staging, production)

.PARAMETER Browser
    Browser para executar os testes (chromium, firefox, webkit, all)

.PARAMETER Headless
    Executar testes em modo headless

.PARAMETER Workers
    Número de workers paralelos

.PARAMETER ReportOnly
    Apenas gerar relatórios dos resultados existentes

.PARAMETER Verbose
    Saída detalhada

.EXAMPLE
    .\run-performance-tests.ps1 -Environment development -Browser chromium
    
.EXAMPLE
    .\run-performance-tests.ps1 -Environment staging -Browser all -Workers 2
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'development',
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('chromium', 'firefox', 'webkit', 'all')]
    [string]$Browser = 'chromium',
    
    [Parameter(Mandatory=$false)]
    [switch]$Headless = $true,
    
    [Parameter(Mandatory=$false)]
    [int]$Workers = 1,
    
    [Parameter(Mandatory=$false)]
    [switch]$ReportOnly,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Configurações
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Cores para output
$Colors = @{
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Cyan'
    Header = 'Magenta'
}

# Função para log colorido
function Write-ColorLog {
    param(
        [string]$Message,
        [string]$Color = 'White',
        [switch]$NoNewline
    )
    
    $timestamp = Get-Date -Format 'HH:mm:ss'
    $fullMessage = "[$timestamp] $Message"
    
    if ($NoNewline) {
        Write-Host $fullMessage -ForegroundColor $Color -NoNewline
    } else {
        Write-Host $fullMessage -ForegroundColor $Color
    }
}

# Função para verificar pré-requisitos
function Test-Prerequisites {
    Write-ColorLog "🔍 Verificando pré-requisitos..." -Color $Colors.Info
    
    # Verificar se estamos no diretório correto
    if (-not (Test-Path 'package.json')) {
        throw "❌ Execute o script a partir do diretório raiz do projeto"
    }
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version
        Write-ColorLog "✅ Node.js: $nodeVersion" -Color $Colors.Success
    } catch {
        throw "❌ Node.js não encontrado. Instale Node.js 18+"
    }
    
    # Verificar pnpm
    try {
        $pnpmVersion = pnpm --version
        Write-ColorLog "✅ pnpm: $pnpmVersion" -Color $Colors.Success
    } catch {
        throw "❌ pnpm não encontrado. Execute: npm install -g pnpm"
    }
    
    # Verificar Playwright
    if (-not (Test-Path 'node_modules/@playwright')) {
        Write-ColorLog "⚠️ Playwright não encontrado. Instalando..." -Color $Colors.Warning
        pnpm install
        pnpm exec playwright install
    }
    
    Write-ColorLog "✅ Todos os pré-requisitos atendidos" -Color $Colors.Success
}

# Função para configurar ambiente
function Set-TestEnvironment {
    param([string]$Env)
    
    Write-ColorLog "🔧 Configurando ambiente: $Env" -Color $Colors.Info
    
    # URLs por ambiente
    $urls = @{
        'development' = 'http://localhost:3000'
        'staging' = 'https://staging.neonpro.health'
        'production' = 'https://app.neonpro.health'
    }
    
    $baseUrl = $urls[$Env]
    
    # Configurar variáveis de ambiente
    $env:PLAYWRIGHT_BASE_URL = $baseUrl
    $env:TEST_ENVIRONMENT = $Env
    $env:PERFORMANCE_TESTING = 'true'
    
    Write-ColorLog "🌐 Base URL: $baseUrl" -Color $Colors.Info
    
    # Verificar se o servidor está rodando (apenas para development)
    if ($Env -eq 'development') {
        try {
            $response = Invoke-WebRequest -Uri $baseUrl -Method Head -TimeoutSec 5 -ErrorAction Stop
            Write-ColorLog "✅ Servidor de desenvolvimento está rodando" -Color $Colors.Success
        } catch {
            Write-ColorLog "⚠️ Servidor de desenvolvimento não está rodando" -Color $Colors.Warning
            Write-ColorLog "💡 Execute: pnpm dev" -Color $Colors.Info
            
            $continue = Read-Host "Continuar mesmo assim? (y/N)"
            if ($continue -ne 'y' -and $continue -ne 'Y') {
                exit 1
            }
        }
    }
}

# Função para executar testes de performance
function Invoke-PerformanceTests {
    param(
        [string]$Browser,
        [bool]$Headless,
        [int]$Workers
    )
    
    Write-ColorLog "🚀 Iniciando testes de performance..." -Color $Colors.Header
    
    # Criar diretório de resultados
    $resultsDir = "test-results/performance"
    if (Test-Path $resultsDir) {
        Remove-Item $resultsDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $resultsDir -Force | Out-Null
    
    # Configurar argumentos do Playwright
    $playwrightArgs = @(
        'test',
        'tools/e2e/tests/performance',
        '--config=tools/e2e/playwright.config.ts',
        "--workers=$Workers",
        '--reporter=html,json,junit'
    )
    
    if ($Headless) {
        $playwrightArgs += '--headed=false'
    } else {
        $playwrightArgs += '--headed=true'
    }
    
    if ($Browser -ne 'all') {
        $playwrightArgs += "--project=$Browser"
    }
    
    if ($Verbose) {
        $playwrightArgs += '--verbose'
    }
    
    # Executar testes
    Write-ColorLog "🎭 Executando: pnpm exec playwright $($playwrightArgs -join ' ')" -Color $Colors.Info
    
    try {
        $testStart = Get-Date
        & pnpm exec playwright @playwrightArgs
        $testEnd = Get-Date
        $testDuration = $testEnd - $testStart
        
        Write-ColorLog "✅ Testes concluídos em $($testDuration.TotalMinutes.ToString('F1')) minutos" -Color $Colors.Success
        return $true
    } catch {
        Write-ColorLog "❌ Falha na execução dos testes: $($_.Exception.Message)" -Color $Colors.Error
        return $false
    }
}

# Função para gerar relatório consolidado
function New-ConsolidatedReport {
    Write-ColorLog "📊 Gerando relatório consolidado..." -Color $Colors.Info
    
    $reportScript = @'
const fs = require('fs');
const path = require('path');

// Função para encontrar arquivos JSON de performance
function findPerformanceReports(dir) {
    const reports = [];
    
    function scanDir(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scanDir(fullPath);
            } else if (item.includes('performance') && item.endsWith('.json')) {
                try {
                    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                    if (Array.isArray(content) && content.length > 0) {
                        reports.push(...content);
                    }
                } catch (e) {
                    console.warn(`Erro ao ler ${fullPath}:`, e.message);
                }
            }
        }
    }
    
    scanDir(dir);
    return reports;
}

// Função para calcular estatísticas
function calculateStats(metrics) {
    if (metrics.length === 0) return null;
    
    const stats = {};
    const keys = ['lcp', 'fid', 'cls', 'fcp', 'ttfb', 'patientDataLoadTime', 'formSubmissionTime', 'navigationTime', 'searchResponseTime'];
    
    keys.forEach(key => {
        const values = metrics.map(m => m[key]).filter(v => typeof v === 'number' && !isNaN(v));
        if (values.length > 0) {
            values.sort((a, b) => a - b);
            stats[key] = {
                min: values[0],
                max: values[values.length - 1],
                avg: values.reduce((sum, v) => sum + v, 0) / values.length,
                median: values[Math.floor(values.length / 2)],
                p95: values[Math.floor(values.length * 0.95)],
                count: values.length
            };
        }
    });
    
    return stats;
}

// Gerar relatório
const reportsDir = 'test-results/performance';
const reports = findPerformanceReports(reportsDir);

if (reports.length === 0) {
    console.log('Nenhum relatório de performance encontrado.');
    process.exit(0);
}

const stats = calculateStats(reports);
const summary = {
    timestamp: new Date().toISOString(),
    totalTests: reports.length,
    environment: process.env.TEST_ENVIRONMENT || 'unknown',
    browser: process.env.PLAYWRIGHT_BROWSER || 'unknown',
    statistics: stats,
    rawData: reports
};

// Salvar relatório consolidado
const outputPath = path.join(reportsDir, 'consolidated-report.json');
fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));

console.log(`Relatório consolidado salvo em: ${outputPath}`);
console.log(`Total de testes: ${reports.length}`);

// Exibir estatísticas principais
if (stats.lcp) {
    console.log('\n📈 Estatísticas Principais:');
    console.log(`LCP - Avg: ${stats.lcp.avg.toFixed(0)}ms, P95: ${stats.lcp.p95.toFixed(0)}ms`);
    console.log(`FID - Avg: ${stats.fid.avg.toFixed(0)}ms, P95: ${stats.fid.p95.toFixed(0)}ms`);
    console.log(`CLS - Avg: ${stats.cls.avg.toFixed(3)}, P95: ${stats.cls.p95.toFixed(3)}`);
    
    if (stats.patientDataLoadTime) {
        console.log(`Patient Data Load - Avg: ${stats.patientDataLoadTime.avg.toFixed(0)}ms, P95: ${stats.patientDataLoadTime.p95.toFixed(0)}ms`);
    }
}
'@
    
    # Salvar e executar script Node.js
    $scriptPath = "test-results/performance/generate-report.js"
    $reportScript | Out-File -FilePath $scriptPath -Encoding UTF8
    
    try {
        node $scriptPath
        Remove-Item $scriptPath -Force
        Write-ColorLog "✅ Relatório consolidado gerado" -Color $Colors.Success
    } catch {
        Write-ColorLog "⚠️ Erro ao gerar relatório consolidado: $($_.Exception.Message)" -Color $Colors.Warning
    }
}

# Função para exibir resumo dos resultados
function Show-TestSummary {
    Write-ColorLog "\n📋 RESUMO DOS TESTES DE PERFORMANCE" -Color $Colors.Header
    
    $consolidatedReport = "test-results/performance/consolidated-report.json"
    
    if (Test-Path $consolidatedReport) {
        try {
            $report = Get-Content $consolidatedReport | ConvertFrom-Json
            
            Write-ColorLog "🧪 Total de Testes: $($report.totalTests)" -Color $Colors.Info
            Write-ColorLog "🌐 Ambiente: $($report.environment)" -Color $Colors.Info
            Write-ColorLog "🌍 Browser: $($report.browser)" -Color $Colors.Info
            Write-ColorLog "⏰ Timestamp: $($report.timestamp)" -Color $Colors.Info
            
            if ($report.statistics.lcp) {
                Write-ColorLog "\n📊 Core Web Vitals (Médias):" -Color $Colors.Header
                Write-ColorLog "  LCP: $([math]::Round($report.statistics.lcp.avg))ms" -Color $Colors.Success
                Write-ColorLog "  FID: $([math]::Round($report.statistics.fid.avg))ms" -Color $Colors.Success
                Write-ColorLog "  CLS: $($report.statistics.cls.avg.ToString('F3'))" -Color $Colors.Success
                Write-ColorLog "  FCP: $([math]::Round($report.statistics.fcp.avg))ms" -Color $Colors.Success
                Write-ColorLog "  TTFB: $([math]::Round($report.statistics.ttfb.avg))ms" -Color $Colors.Success
            }
            
            if ($report.statistics.patientDataLoadTime) {
                Write-ColorLog "\n🏥 Métricas Healthcare (Médias):" -Color $Colors.Header
                Write-ColorLog "  Patient Data Load: $([math]::Round($report.statistics.patientDataLoadTime.avg))ms" -Color $Colors.Success
                
                if ($report.statistics.formSubmissionTime) {
                    Write-ColorLog "  Form Submission: $([math]::Round($report.statistics.formSubmissionTime.avg))ms" -Color $Colors.Success
                }
                
                if ($report.statistics.searchResponseTime) {
                    Write-ColorLog "  Search Response: $([math]::Round($report.statistics.searchResponseTime.avg))ms" -Color $Colors.Success
                }
            }
            
        } catch {
            Write-ColorLog "⚠️ Erro ao ler relatório consolidado" -Color $Colors.Warning
        }
    }
    
    # Mostrar localização dos relatórios
    Write-ColorLog "\n📁 Relatórios disponíveis em:" -Color $Colors.Info
    Write-ColorLog "  📊 HTML: test-results/performance/*.html" -Color $Colors.Info
    Write-ColorLog "  📄 JSON: test-results/performance/*.json" -Color $Colors.Info
    Write-ColorLog "  🎭 Playwright: test-results/playwright-report/index.html" -Color $Colors.Info
}

# Função principal
function Main {
    try {
        Write-ColorLog "\n🏥 NEONPRO HEALTHCARE - TESTES DE PERFORMANCE" -Color $Colors.Header
        Write-ColorLog "================================================" -Color $Colors.Header
        
        if (-not $ReportOnly) {
            Test-Prerequisites
            Set-TestEnvironment -Env $Environment
            
            $success = Invoke-PerformanceTests -Browser $Browser -Headless $Headless -Workers $Workers
            
            if (-not $success) {
                Write-ColorLog "❌ Testes falharam" -Color $Colors.Error
                exit 1
            }
        }
        
        New-ConsolidatedReport
        Show-TestSummary
        
        Write-ColorLog "\n✅ Execução concluída com sucesso!" -Color $Colors.Success
        
    } catch {
        Write-ColorLog "❌ Erro durante a execução: $($_.Exception.Message)" -Color $Colors.Error
        Write-ColorLog "📍 Stack Trace: $($_.ScriptStackTrace)" -Color $Colors.Error
        exit 1
    }
}

# Executar função principal
Main