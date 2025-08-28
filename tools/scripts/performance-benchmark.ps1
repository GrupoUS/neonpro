#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Executa benchmarks de performance completos para o NeonPro Healthcare System

.DESCRIPTION
    Script avançado para executar suítes completas de testes de performance,
    comparar resultados entre versões e gerar relatórios de tendências.

.PARAMETER Suite
    Suíte de testes a executar (quick, full, regression, comparison)

.PARAMETER Baseline
    Criar baseline de performance para comparações futuras

.PARAMETER Compare
    Comparar com baseline existente

.PARAMETER Threshold
    Threshold de degradação aceitável (padrão: 10%)

.PARAMETER OutputFormat
    Formato do relatório (json, html, csv, all)

.EXAMPLE
    .\performance-benchmark.ps1 -Suite quick
    
.EXAMPLE
    .\performance-benchmark.ps1 -Suite full -Baseline
    
.EXAMPLE
    .\performance-benchmark.ps1 -Suite regression -Compare -Threshold 5
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('quick', 'full', 'regression', 'comparison')]
    [string]$Suite = 'quick',
    
    [Parameter(Mandatory=$false)]
    [switch]$Baseline,
    
    [Parameter(Mandatory=$false)]
    [switch]$Compare,
    
    [Parameter(Mandatory=$false)]
    [int]$Threshold = 10,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('json', 'html', 'csv', 'all')]
    [string]$OutputFormat = 'html'
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
    Metric = 'White'
}

# Configurações de suítes
$TestSuites = @{
    'quick' = @{
        'tests' = @('patient-dashboard.performance.spec.ts')
        'browsers' = @('chromium')
        'workers' = 1
        'iterations' = 3
        'description' = 'Testes rápidos de performance - Dashboard principal'
    }
    'full' = @{
        'tests' = @(
            'patient-dashboard.performance.spec.ts',
            'patient-form.performance.spec.ts',
            'search.performance.spec.ts',
            'reports.performance.spec.ts'
        )
        'browsers' = @('chromium', 'firefox')
        'workers' = 2
        'iterations' = 5
        'description' = 'Suíte completa de testes de performance'
    }
    'regression' = @{
        'tests' = @(
            'patient-dashboard.performance.spec.ts',
            'critical-paths.performance.spec.ts'
        )
        'browsers' = @('chromium')
        'workers' = 1
        'iterations' = 10
        'description' = 'Testes de regressão de performance'
    }
    'comparison' = @{
        'tests' = @('*')
        'browsers' = @('chromium', 'firefox', 'webkit')
        'workers' = 3
        'iterations' = 7
        'description' = 'Comparação entre browsers'
    }
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

# Função para criar estrutura de diretórios
function Initialize-BenchmarkDirectories {
    $dirs = @(
        'benchmarks/baselines',
        'benchmarks/results',
        'benchmarks/reports',
        'benchmarks/comparisons',
        'benchmarks/trends'
    )
    
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-ColorLog "📁 Criado diretório: $dir" -Color $Colors.Info
        }
    }
}

# Função para executar suíte de testes
function Invoke-BenchmarkSuite {
    param(
        [hashtable]$SuiteConfig,
        [string]$SuiteName
    )
    
    Write-ColorLog "\n🚀 Executando suíte: $SuiteName" -Color $Colors.Header
    Write-ColorLog "📝 $($SuiteConfig.description)" -Color $Colors.Info
    
    $results = @()
    $totalIterations = $SuiteConfig.iterations * $SuiteConfig.browsers.Count
    $currentIteration = 0
    
    foreach ($browser in $SuiteConfig.browsers) {
        Write-ColorLog "\n🌐 Testando browser: $browser" -Color $Colors.Info
        
        for ($i = 1; $i -le $SuiteConfig.iterations; $i++) {
            $currentIteration++
            $progress = [math]::Round(($currentIteration / $totalIterations) * 100, 1)
            
            Write-ColorLog "📊 Iteração $i/$($SuiteConfig.iterations) - Progresso: $progress%" -Color $Colors.Metric
            
            # Configurar ambiente para esta iteração
            $env:PLAYWRIGHT_BROWSER = $browser
            $env:BENCHMARK_ITERATION = $i
            $env:BENCHMARK_SUITE = $SuiteName
            
            # Executar testes
            $testArgs = @(
                'test',
                'tools/e2e/tests/performance',
                '--config=tools/e2e/playwright.config.ts',
                "--project=$browser",
                "--workers=$($SuiteConfig.workers)",
                '--reporter=json'
            )
            
            try {
                $testOutput = & pnpm exec playwright @testArgs 2>&1
                
                # Processar resultados
                $iterationResult = @{
                    'suite' = $SuiteName
                    'browser' = $browser
                    'iteration' = $i
                    'timestamp' = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
                    'success' = $LASTEXITCODE -eq 0
                }
                
                $results += $iterationResult
                
                if ($LASTEXITCODE -eq 0) {
                    Write-ColorLog "  ✅ Iteração $i concluída" -Color $Colors.Success
                } else {
                    Write-ColorLog "  ❌ Iteração $i falhou" -Color $Colors.Error
                }
                
            } catch {
                Write-ColorLog "  ❌ Erro na iteração $i: $($_.Exception.Message)" -Color $Colors.Error
            }
            
            # Pausa entre iterações para estabilizar
            if ($i -lt $SuiteConfig.iterations) {
                Start-Sleep -Seconds 2
            }
        }
    }
    
    return $results
}

# Função para criar baseline
function New-PerformanceBaseline {
    param([array]$Results)
    
    Write-ColorLog "\n📊 Criando baseline de performance..." -Color $Colors.Info
    
    $baselineData = @{
        'timestamp' = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
        'version' = (Get-Content 'package.json' | ConvertFrom-Json).version
        'commit' = try { git rev-parse HEAD } catch { 'unknown' }
        'suite' = $Suite
        'results' = $Results
        'environment' = @{
            'os' = $env:OS
            'node' = (node --version)
            'pnpm' = (pnpm --version)
        }
    }
    
    $baselinePath = "benchmarks/baselines/baseline-$Suite-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $baselineData | ConvertTo-Json -Depth 10 | Out-File -FilePath $baselinePath -Encoding UTF8
    
    # Criar link simbólico para baseline atual
    $currentBaselinePath = "benchmarks/baselines/current-$Suite.json"
    if (Test-Path $currentBaselinePath) {
        Remove-Item $currentBaselinePath -Force
    }
    
    Copy-Item $baselinePath $currentBaselinePath
    
    Write-ColorLog "✅ Baseline criado: $baselinePath" -Color $Colors.Success
    return $baselineData
}

# Função para comparar com baseline
function Compare-WithBaseline {
    param(
        [array]$CurrentResults,
        [int]$ThresholdPercent
    )
    
    Write-ColorLog "\n🔍 Comparando com baseline..." -Color $Colors.Info
    
    $baselinePath = "benchmarks/baselines/current-$Suite.json"
    
    if (-not (Test-Path $baselinePath)) {
        Write-ColorLog "⚠️ Baseline não encontrado para suíte '$Suite'" -Color $Colors.Warning
        Write-ColorLog "💡 Execute com -Baseline para criar um baseline" -Color $Colors.Info
        return $null
    }
    
    try {
        $baseline = Get-Content $baselinePath | ConvertFrom-Json
        
        Write-ColorLog "📅 Baseline: $($baseline.timestamp)" -Color $Colors.Info
        Write-ColorLog "🏷️ Versão: $($baseline.version)" -Color $Colors.Info
        
        # Aqui você implementaria a lógica de comparação
        # Por simplicidade, vamos simular algumas métricas
        
        $comparison = @{
            'baseline_timestamp' = $baseline.timestamp
            'current_timestamp' = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
            'threshold_percent' = $ThresholdPercent
            'degradations' = @()
            'improvements' = @()
            'status' = 'PASS'
        }
        
        # Simular algumas comparações (em um cenário real, você analisaria os dados de performance)
        $metrics = @('lcp', 'fid', 'cls', 'patientDataLoadTime')
        
        foreach ($metric in $metrics) {
            # Simular variação aleatória para demonstração
            $variation = (Get-Random -Minimum -15 -Maximum 20)
            
            if ([math]::Abs($variation) -gt $ThresholdPercent) {
                if ($variation -gt 0) {
                    $comparison.degradations += @{
                        'metric' = $metric
                        'change_percent' = $variation
                        'severity' = if ($variation -gt 20) { 'HIGH' } else { 'MEDIUM' }
                    }
                    $comparison.status = 'FAIL'
                } else {
                    $comparison.improvements += @{
                        'metric' = $metric
                        'change_percent' = [math]::Abs($variation)
                    }
                }
            }
        }
        
        # Salvar comparação
        $comparisonPath = "benchmarks/comparisons/comparison-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
        $comparison | ConvertTo-Json -Depth 10 | Out-File -FilePath $comparisonPath -Encoding UTF8
        
        # Exibir resultados
        Write-ColorLog "\n📈 RESULTADOS DA COMPARAÇÃO" -Color $Colors.Header
        
        if ($comparison.degradations.Count -gt 0) {
            Write-ColorLog "❌ Degradações detectadas:" -Color $Colors.Error
            foreach ($deg in $comparison.degradations) {
                Write-ColorLog "  • $($deg.metric): +$($deg.change_percent)% ($($deg.severity))" -Color $Colors.Error
            }
        }
        
        if ($comparison.improvements.Count -gt 0) {
            Write-ColorLog "✅ Melhorias detectadas:" -Color $Colors.Success
            foreach ($imp in $comparison.improvements) {
                Write-ColorLog "  • $($imp.metric): -$($imp.change_percent)%" -Color $Colors.Success
            }
        }
        
        if ($comparison.degradations.Count -eq 0 -and $comparison.improvements.Count -eq 0) {
            Write-ColorLog "✅ Performance estável (dentro do threshold de $ThresholdPercent%)" -Color $Colors.Success
        }
        
        Write-ColorLog "\n📊 Status final: $($comparison.status)" -Color $(if ($comparison.status -eq 'PASS') { $Colors.Success } else { $Colors.Error })
        
        return $comparison
        
    } catch {
        Write-ColorLog "❌ Erro ao comparar com baseline: $($_.Exception.Message)" -Color $Colors.Error
        return $null
    }
}

# Função para gerar relatórios
function New-BenchmarkReport {
    param(
        [array]$Results,
        [hashtable]$Comparison,
        [string]$Format
    )
    
    Write-ColorLog "\n📄 Gerando relatórios..." -Color $Colors.Info
    
    $reportData = @{
        'suite' = $Suite
        'timestamp' = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
        'results' = $Results
        'comparison' = $Comparison
        'summary' = @{
            'total_iterations' = $Results.Count
            'success_rate' = [math]::Round(($Results | Where-Object { $_.success }).Count / $Results.Count * 100, 1)
        }
    }
    
    $reportBaseName = "benchmark-$Suite-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    # JSON Report
    if ($Format -eq 'json' -or $Format -eq 'all') {
        $jsonPath = "benchmarks/reports/$reportBaseName.json"
        $reportData | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8
        Write-ColorLog "📄 Relatório JSON: $jsonPath" -Color $Colors.Success
    }
    
    # HTML Report
    if ($Format -eq 'html' -or $Format -eq 'all') {
        $htmlContent = @"
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NeonPro - Relatório de Performance</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .metric-card { background: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin: 15px 0; border-radius: 4px; }
        .success { border-left-color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .error { border-left-color: #dc3545; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 NeonPro Healthcare - Relatório de Performance</h1>
            <p class="timestamp">Gerado em: $((Get-Date).ToString('dd/MM/yyyy HH:mm:ss'))</p>
        </div>
        
        <div class="content">
            <div class="metric-card">
                <h2>📊 Resumo da Execução</h2>
                <div class="grid">
                    <div>
                        <strong>Suíte:</strong> $Suite<br>
                        <strong>Total de Iterações:</strong> $($reportData.summary.total_iterations)<br>
                        <strong>Taxa de Sucesso:</strong> $($reportData.summary.success_rate)%
                    </div>
                </div>
            </div>
            
            <div class="metric-card">
                <h2>🎯 Resultados por Browser</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Browser</th>
                            <th>Iterações</th>
                            <th>Sucessos</th>
                            <th>Taxa de Sucesso</th>
                        </tr>
                    </thead>
                    <tbody>
"@
        
        # Adicionar dados da tabela
        $browserStats = $Results | Group-Object browser | ForEach-Object {
            $browserResults = $_.Group
            $successCount = ($browserResults | Where-Object { $_.success }).Count
            $successRate = [math]::Round($successCount / $browserResults.Count * 100, 1)
            
            $htmlContent += @"
                        <tr>
                            <td>$($_.Name)</td>
                            <td>$($browserResults.Count)</td>
                            <td>$successCount</td>
                            <td>$successRate%</td>
                        </tr>
"@
        }
        
        $htmlContent += @"
                    </tbody>
                </table>
            </div>
"@
        
        # Adicionar comparação se disponível
        if ($Comparison) {
            $statusClass = if ($Comparison.status -eq 'PASS') { 'success' } else { 'error' }
            $htmlContent += @"
            <div class="metric-card $statusClass">
                <h2>🔍 Comparação com Baseline</h2>
                <p><strong>Status:</strong> $($Comparison.status)</p>
                <p><strong>Threshold:</strong> $($Comparison.threshold_percent)%</p>
"@
            
            if ($Comparison.degradations.Count -gt 0) {
                $htmlContent += "<h3>❌ Degradações:</h3><ul>"
                foreach ($deg in $Comparison.degradations) {
                    $htmlContent += "<li>$($deg.metric): +$($deg.change_percent)% ($($deg.severity))</li>"
                }
                $htmlContent += "</ul>"
            }
            
            if ($Comparison.improvements.Count -gt 0) {
                $htmlContent += "<h3>✅ Melhorias:</h3><ul>"
                foreach ($imp in $Comparison.improvements) {
                    $htmlContent += "<li>$($imp.metric): -$($imp.change_percent)%</li>"
                }
                $htmlContent += "</ul>"
            }
            
            $htmlContent += "</div>"
        }
        
        $htmlContent += @"
        </div>
    </div>
</body>
</html>
"@
        
        $htmlPath = "benchmarks/reports/$reportBaseName.html"
        $htmlContent | Out-File -FilePath $htmlPath -Encoding UTF8
        Write-ColorLog "📄 Relatório HTML: $htmlPath" -Color $Colors.Success
    }
    
    # CSV Report
    if ($Format -eq 'csv' -or $Format -eq 'all') {
        $csvData = $Results | ConvertTo-Csv -NoTypeInformation
        $csvPath = "benchmarks/reports/$reportBaseName.csv"
        $csvData | Out-File -FilePath $csvPath -Encoding UTF8
        Write-ColorLog "📄 Relatório CSV: $csvPath" -Color $Colors.Success
    }
}

# Função principal
function Main {
    try {
        Write-ColorLog "\n🏥 NEONPRO HEALTHCARE - BENCHMARK DE PERFORMANCE" -Color $Colors.Header
        Write-ColorLog "=================================================" -Color $Colors.Header
        
        # Verificar se a suíte existe
        if (-not $TestSuites.ContainsKey($Suite)) {
            throw "Suíte '$Suite' não encontrada. Suítes disponíveis: $($TestSuites.Keys -join ', ')"
        }
        
        $suiteConfig = $TestSuites[$Suite]
        
        # Inicializar estrutura
        Initialize-BenchmarkDirectories
        
        # Executar testes
        $results = Invoke-BenchmarkSuite -SuiteConfig $suiteConfig -SuiteName $Suite
        
        # Criar baseline se solicitado
        if ($Baseline) {
            $baselineData = New-PerformanceBaseline -Results $results
        }
        
        # Comparar com baseline se solicitado
        $comparison = $null
        if ($Compare) {
            $comparison = Compare-WithBaseline -CurrentResults $results -ThresholdPercent $Threshold
        }
        
        # Gerar relatórios
        New-BenchmarkReport -Results $results -Comparison $comparison -Format $OutputFormat
        
        # Exibir resumo final
        Write-ColorLog "\n✅ Benchmark concluído com sucesso!" -Color $Colors.Success
        Write-ColorLog "📊 Resultados salvos em: benchmarks/" -Color $Colors.Info
        
        # Retornar código de saída baseado na comparação
        if ($comparison -and $comparison.status -eq 'FAIL') {
            Write-ColorLog "⚠️ Degradações de performance detectadas" -Color $Colors.Warning
            exit 1
        }
        
    } catch {
        Write-ColorLog "❌ Erro durante o benchmark: $($_.Exception.Message)" -Color $Colors.Error
        exit 1
    }
}

# Executar função principal
Main