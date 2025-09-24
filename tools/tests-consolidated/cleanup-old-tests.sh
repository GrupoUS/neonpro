#!/bin/bash

# Script de limpeza para remover testes duplicados
# CUIDADO: Execute apenas após validar a migração!

set -e

echo "🧹 Script de limpeza de testes duplicados"
echo "⚠️  ATENÇÃO: Este script remove arquivos permanentemente!"
echo ""

# Confirmar execução
read -p "Tem certeza que deseja continuar? (digite 'sim' para confirmar): " confirm
if [[ "$confirm" != "sim" ]]; then
    echo "❌ Operação cancelada"
    exit 0
fi

echo "🗑️  Iniciando limpeza..."

# Função para remover testes em packages
clean_package_tests() {
    echo "📁 Limpando testes em packages..."
    
    find packages -name "__tests__" -type d | while read -r dir; do
        if [[ -d "$dir" ]]; then
            echo "  🗑️  Removendo: $dir"
            rm -rf "$dir"
        fi
    done
    
    find packages -name "*.test.ts" -o -name "*.spec.ts" | while read -r file; do
        if [[ -f "$file" ]]; then
            echo "  🗑️  Removendo: $file"
            rm "$file"
        fi
    done
}

# Função para remover testes em apps
clean_app_tests() {
    echo "📁 Limpando testes em apps..."
    
    find apps -name "tests" -type d | while read -r dir; do
        if [[ -d "$dir" ]]; then
            echo "  🗑️  Removendo: $dir"
            rm -rf "$dir"
        fi
    done
    
    find apps -name "__tests__" -type d | while read -r dir; do
        if [[ -d "$dir" ]]; then
            echo "  🗑️  Removendo: $dir"
            rm -rf "$dir"
        fi
    done
}

# Função para remover configurações duplicadas
clean_test_configs() {
    echo "⚙️  Removendo configurações duplicadas..."
    
    find packages apps -name "vitest.config.ts" | while read -r file; do
        if [[ -f "$file" ]]; then
            echo "  🗑️  Removendo: $file"
            rm "$file"
        fi
    done
    
    find packages apps -name "playwright.config.ts" | while read -r file; do
        if [[ -f "$file" ]]; then
            echo "  🗑️  Removendo: $file"
            rm "$file"
        fi
    done
}

# Função para remover diretórios de teste específicos
clean_specific_test_dirs() {
    echo "📂 Removendo diretórios específicos..."
    
    # Remover test-isolated se existe
    if [[ -d "test-isolated" ]]; then
        echo "  🗑️  Removendo: test-isolated/"
        rm -rf "test-isolated"
    fi
    
    # Remover tests/ na raiz se existe
    if [[ -d "tests" ]]; then
        echo "  🗑️  Removendo: tests/"
        rm -rf "tests"
    fi
    
    # Limpar tools/testing antigo
    if [[ -d "tools/testing" ]]; then
        echo "  🗑️  Removendo: tools/testing/"
        rm -rf "tools/testing"
    fi
    
    # Limpar tools/tests antigo
    if [[ -d "tools/tests" && "$PWD/tools/tests" != "$PWD/tools/tests-consolidated" ]]; then
        echo "  🗑️  Removendo: tools/tests/"
        rm -rf "tools/tests"
    fi
}

# Função para atualizar package.json removendo scripts de teste antigos
clean_package_json_scripts() {
    echo "📄 Limpando scripts de teste em package.json..."
    
    find packages apps -name "package.json" | while read -r file; do
        if [[ -f "$file" ]]; then
            # Fazer backup
            cp "$file" "$file.backup"
            
            # Remover scripts de teste específicos (mantém apenas scripts essenciais)
            jq 'del(.scripts.test, .scripts["test:unit"], .scripts["test:integration"], .scripts["test:e2e"], .scripts["test:watch"], .scripts["test:coverage"])' "$file.backup" > "$file"
            
            echo "  ✏️  Atualizado: $file"
        fi
    done
}

# Função principal
main() {
    echo "🚀 Executando limpeza completa..."
    
    # Verificar se estrutura consolidada existe
    if [[ ! -d "tools/tests-consolidated" ]]; then
        echo "❌ Erro: Estrutura consolidada não encontrada!"
        echo "Execute a migração primeiro"
        exit 1
    fi
    
    # Executar limpeza
    clean_package_tests
    clean_app_tests
    clean_test_configs
    clean_specific_test_dirs
    clean_package_json_scripts
    
    echo ""
    echo "✅ Limpeza concluída!"
    echo ""
    echo "📋 Resumo:"
    echo "• Testes removidos de packages/ e apps/"
    echo "• Configurações duplicadas removidas"
    echo "• Diretórios antigos de teste removidos"
    echo "• Scripts de package.json atualizados"
    echo ""
    echo "🎯 Agora todos os testes estão em tools/tests-consolidated/"
    echo "🔄 Execute 'cd tools/tests-consolidated && bun run test' para validar"
}

# Verificar se está na raiz do projeto
if [[ ! -f "package.json" || ! -d "tools" ]]; then
    echo "❌ Erro: Execute este script na raiz do projeto NeonPro"
    exit 1
fi

# Executar
main "$@"