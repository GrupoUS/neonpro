#!/bin/bash

# Script de migração para consolidar testes
# Seguindo princípios KISS e YAGNI

set -e

echo "🧪 Iniciando migração de testes para estrutura consolidada..."

# Diretórios
CONSOLIDATED_DIR="tools/tests-consolidated"
UNIT_DIR="$CONSOLIDATED_DIR/unit"
INTEGRATION_DIR="$CONSOLIDATED_DIR/integration"
E2E_DIR="$CONSOLIDATED_DIR/e2e"
FIXTURES_DIR="$CONSOLIDATED_DIR/fixtures"

# Criar backup dos testes existentes
echo "📦 Criando backup dos testes existentes..."
mkdir -p backup/tests-old-$(date +%Y%m%d_%H%M%S)

# Função para mover testes unitários
migrate_unit_tests() {
    echo "🔄 Migrando testes unitários..."
    
    # Encontrar todos os arquivos de teste unitário
    find packages apps -name "*.test.ts" -o -name "*.spec.ts" | grep -E "(unit|spec)" | while read -r file; do
        if [[ -f "$file" ]]; then
            # Extrair nome do pacote/app
            package_name=$(echo "$file" | cut -d'/' -f2)
            
            # Criar nome único para evitar conflitos
            new_name="${package_name}-$(basename "$file")"
            
            echo "  📄 Movendo: $file -> $UNIT_DIR/$new_name"
            cp "$file" "$UNIT_DIR/$new_name"
        fi
    done
}

# Função para mover testes de integração
migrate_integration_tests() {
    echo "🔄 Migrando testes de integração..."
    
    find packages apps -name "*.test.ts" -o -name "*.spec.ts" | grep -E "(integration|contract)" | while read -r file; do
        if [[ -f "$file" ]]; then
            package_name=$(echo "$file" | cut -d'/' -f2)
            new_name="${package_name}-$(basename "$file")"
            
            echo "  📄 Movendo: $file -> $INTEGRATION_DIR/$new_name"
            cp "$file" "$INTEGRATION_DIR/$new_name"
        fi
    done
}

# Função para mover testes E2E
migrate_e2e_tests() {
    echo "🔄 Migrando testes E2E..."
    
    find apps tools -name "*.spec.ts" | grep -E "(e2e|playwright)" | while read -r file; do
        if [[ -f "$file" ]]; then
            package_name=$(echo "$file" | cut -d'/' -f2)
            new_name="${package_name}-$(basename "$file")"
            
            echo "  📄 Movendo: $file -> $E2E_DIR/$new_name"
            cp "$file" "$E2E_DIR/$new_name"
        fi
    done
}

# Função para consolidar fixtures
migrate_fixtures() {
    echo "🔄 Consolidando fixtures e mocks..."
    
    # Procurar por arquivos de setup e mocks
    find packages apps -name "setup.ts" -o -name "*.mock.ts" -o -name "fixtures.ts" | while read -r file; do
        if [[ -f "$file" ]]; then
            package_name=$(echo "$file" | cut -d'/' -f2)
            new_name="${package_name}-$(basename "$file")"
            
            echo "  📄 Movendo: $file -> $FIXTURES_DIR/$new_name"
            cp "$file" "$FIXTURES_DIR/$new_name"
        fi
    done
}

# Função para limpar configurações duplicadas
cleanup_old_configs() {
    echo "🧹 Limpando configurações duplicadas..."
    
    # Backup das configurações antes de remover
    find packages apps -name "vitest.config.ts" -o -name "playwright.config.ts" | while read -r file; do
        if [[ -f "$file" ]]; then
            echo "  📦 Backup: $file"
            cp "$file" "backup/tests-old-$(date +%Y%m%d_%H%M%S)/"
        fi
    done
    
    echo "ℹ️  Configurações antigas salvas em backup/"
    echo "ℹ️  Remova manualmente após validar a migração"
}

# Função para atualizar imports
update_imports() {
    echo "🔧 Atualizando imports nos testes migrados..."
    
    # Atualizar imports relativos para usar aliases
    find "$UNIT_DIR" "$INTEGRATION_DIR" "$E2E_DIR" -name "*.ts" -o -name "*.tsx" | while read -r file; do
        if [[ -f "$file" ]]; then
            # Substituir imports relativos por aliases
            sed -i.bak \
                -e 's|from ["\x27]\.\.\/\.\.\/|from "@/|g' \
                -e 's|from ["\x27]\.\.\/\.\.\/\.\.\/|from "@/|g' \
                -e 's|from ["\x27]\.\.\/\.\.\/\.\.\/\.\.\/|from "@/|g' \
                -e 's|from ["\x27]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/|from "@/|g' \
                "$file"
            
            # Remover backup se a operação foi bem-sucedida
            [[ -f "$file.bak" ]] && rm "$file.bak"
        fi
    done
}

# Executar migração
main() {
    echo "🚀 Iniciando processo de migração..."
    
    # Verificar se o diretório consolidado existe
    if [[ ! -d "$CONSOLIDATED_DIR" ]]; then
        echo "❌ Erro: Diretório $CONSOLIDATED_DIR não encontrado"
        echo "Execute primeiro a criação da estrutura consolidada"
        exit 1
    fi
    
    # Executar migrações
    migrate_unit_tests
    migrate_integration_tests
    migrate_e2e_tests
    migrate_fixtures
    
    # Atualizar imports
    update_imports
    
    # Limpar configurações
    cleanup_old_configs
    
    echo "✅ Migração concluída!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. cd tools/tests-consolidated"
    echo "2. bun install"
    echo "3. bun run validate"
    echo "4. Verificar se todos os testes passam"
    echo "5. Remover testes antigos após validação"
    echo ""
    echo "🎯 Estrutura consolidada criada seguindo KISS e YAGNI"
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi