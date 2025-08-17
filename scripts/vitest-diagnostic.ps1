#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Diagnóstico e correção dos problemas do Vitest no VS Code

.DESCRIPTION
    Script para diagnosticar e corrigir problemas comuns do Vitest:
    - Múltiplas configurações conflitantes
    - Erros da extensão VS Code
    - Problemas de workspace

.EXAMPLE
    .\vitest-diagnostic.ps1
#>

Write-Host "🔍 VITEST DIAGNOSTIC & FIX SCRIPT" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Função para verificar arquivos de configuração
function Test-VitestConfigs {
    Write-Host "📋 Verificando configurações Vitest..." -ForegroundColor Yellow
    
    $configs = @(
        "vitest.config.ts",
        "vitest.config.mjs", 
        "vitest.workspace.ts",
        "tools/testing/vitest.config.ts",
        "tools/testing/vitest.config.mjs",
        "packages/ui/vitest.config.mjs"
    )
    
    $found = @()
    foreach ($config in $configs) {
        if (Test-Path $config) {
            $found += $config
            Write-Host "  ✅ Encontrado: $config" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Não encontrado: $config" -ForegroundColor Red
        }
    }
    
    Write-Host "📊 Total de configurações encontradas: $($found.Count)" -ForegroundColor Cyan
    return $found
}

# Função para verificar status da extensão Vitest
function Test-VitestExtension {
    Write-Host ""
    Write-Host "🔌 Verificando extensão Vitest..." -ForegroundColor Yellow
    
    $vscodePath = "$env:USERPROFILE\.vscode\extensions"
    $vitestExtensions = Get-ChildItem -Path $vscodePath -Filter "*vitest*" -Directory -ErrorAction SilentlyContinue
    
    if ($vitestExtensions) {
        foreach ($ext in $vitestExtensions) {
            Write-Host "  📦 Extensão encontrada: $($ext.Name)" -ForegroundColor Green
        }
    } else {
        Write-Host "  ❌ Extensão Vitest não encontrada" -ForegroundColor Red
    }
}

# Função para limpar cache
function Clear-VitestCache {
    Write-Host ""
    Write-Host "🧹 Limpando cache do Vitest..." -ForegroundColor Yellow
    
    $cachePaths = @(
        "node_modules/.vitest",
        ".vitest",
        "coverage",
        "test-results"
    )
    
    foreach ($path in $cachePaths) {
        if (Test-Path $path) {
            Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  🗑️ Removido: $path" -ForegroundColor Green
        }
    }
}

# Função para verificar Node.js e dependências
function Test-Dependencies {
    Write-Host ""
    Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version
        Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Node.js não encontrado" -ForegroundColor Red
    }
    
    # Verificar PNPM
    try {
        $pnpmVersion = pnpm --version
        Write-Host "  ✅ PNPM: $pnpmVersion" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ PNPM não encontrado" -ForegroundColor Red
    }
    
    # Verificar Vitest
    if (Test-Path "node_modules/vitest") {
        Write-Host "  ✅ Vitest instalado" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Vitest não instalado" -ForegroundColor Red
    }
}

# Função para executar testes de validação
function Test-VitestRun {
    Write-Host ""
    Write-Host "🧪 Testando execução do Vitest..." -ForegroundColor Yellow
    
    try {
        Write-Host "  Executando: pnpm vitest --run --reporter=basic" -ForegroundColor Gray
        $result = pnpm vitest --run --reporter=basic 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Vitest executou com sucesso" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Vitest executou com warnings/erros" -ForegroundColor Yellow
            Write-Host "  $result" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ❌ Erro ao executar Vitest: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Função principal
function Main {
    Write-Host "🚀 Iniciando diagnóstico..." -ForegroundColor Cyan
    Write-Host ""
    
    # Verificar se estamos no diretório correto
    if (-not (Test-Path "package.json")) {
        Write-Host "❌ Execute este script na raiz do projeto (onde está o package.json)" -ForegroundColor Red
        exit 1
    }
    
    # Executar diagnósticos
    $configs = Test-VitestConfigs
    Test-VitestExtension
    Test-Dependencies
    Clear-VitestCache
    Test-VitestRun
    
    # Recomendações
    Write-Host ""
    Write-Host "💡 RECOMENDAÇÕES:" -ForegroundColor Cyan
    Write-Host "==================" -ForegroundColor Cyan
    
    if ($configs.Count -gt 3) {
        Write-Host "⚠️ Muitas configurações Vitest encontradas ($($configs.Count))" -ForegroundColor Yellow
        Write-Host "   Considere usar vitest.workspace.ts para consolidar" -ForegroundColor Yellow
    }
    
    if (Test-Path "vitest.workspace.ts") {
        Write-Host "✅ vitest.workspace.ts encontrado - configuração de workspace ativa" -ForegroundColor Green
    } else {
        Write-Host "💡 Crie vitest.workspace.ts para melhor organização em monorepo" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🔄 Para corrigir problemas da extensão VS Code:" -ForegroundColor Cyan
    Write-Host "   1. Recarregue a janela do VS Code (Ctrl+Shift+P > Reload Window)" -ForegroundColor White
    Write-Host "   2. Desative e reative a extensão Vitest" -ForegroundColor White
    Write-Host "   3. Verifique o Output do VS Code (View > Output > Vitest)" -ForegroundColor White
    
    Write-Host ""
    Write-Host "✅ Diagnóstico concluído!" -ForegroundColor Green
}

# Executar script principal
Main