#!/bin/bash

# Script para testar configuração do Bun
# Valida se tudo está funcionando corretamente

set -e

echo "🧪 Testando configuração consolidada com Bun..."

# Verificar se Bun está instalado
if ! command -v bun &> /dev/null; then
    echo "❌ Bun não está instalado"
    echo "Execute: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun encontrado: $(bun --version)"

# Verificar se estamos no diretório correto
if [[ ! -f "package.json" ]]; then
    echo "❌ Execute este script em tools/tests-consolidated/"
    exit 1
fi

echo "📦 Instalando dependências com Bun..."
bun install

echo "🔧 Testando validação..."
bun run validate

echo "🧪 Executando teste rápido..."
bun run test:unit --run

echo "🎨 Testando formatação..."
bun run format:check

echo "🔍 Testando linting..."
bun run lint

echo ""
echo "✅ Configuração do Bun funcionando perfeitamente!"
echo ""
echo "📋 Comandos disponíveis:"
echo "• bun run test              # Todos os testes"
echo "• bun run test:unit         # Testes unitários"
echo "• bun run test:integration  # Testes de integração"
echo "• bun run test:e2e         # Testes E2E"
echo "• bun run test:watch       # Watch mode"
echo "• bun run test:coverage    # Cobertura"
echo "• bun run validate         # Validação completa"
echo "• bun run ci               # Pipeline CI"
echo ""
echo "🚀 Estrutura consolidada pronta para uso!"