#!/bin/bash

# Script de limpeza imediata
set -e

echo "🧹 Executando limpeza completa de testes antigos..."

# 1. Remover diretórios __tests__ em packages
echo "📁 Removendo diretórios __tests__ em packages..."
find packages -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null || true

# 2. Remover diretórios tests em packages
echo "📁 Removendo diretórios tests em packages..."
find packages -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true

# 3. Remover arquivos de teste individuais
echo "📄 Removendo arquivos .test.ts e .spec.ts em packages..."
find packages -name "*.test.ts" -type f -delete 2>/dev/null || true
find packages -name "*.spec.ts" -type f -delete 2>/dev/null || true

# 4. Remover configurações vitest duplicadas
echo "⚙️ Removendo configurações vitest duplicadas..."
find packages -name "vitest.config.ts" -type f -delete 2>/dev/null || true

# 5. Remover diretórios de teste em apps
echo "📁 Removendo diretórios de teste em apps..."
find apps -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null || true
find apps -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true

# 6. Remover diretórios antigos na raiz
echo "📂 Removendo diretórios antigos na raiz..."
[ -d "test-isolated" ] && rm -rf "test-isolated"
[ -d "tests" ] && rm -rf "tests"

# 7. Limpar tools antigos (exceto tests-consolidated)
echo "🔧 Limpando tools antigos..."
[ -d "tools/testing" ] && rm -rf "tools/testing"
[ -d "tools/tests" ] && rm -rf "tools/tests"
[ -d "tools/testing-toolkit" ] && rm -rf "tools/testing-toolkit"

# 8. Limpar configurações playwright duplicadas
echo "🎭 Removendo configurações playwright duplicadas..."
find apps -name "playwright.config.ts" -type f -delete 2>/dev/null || true
find packages -name "playwright.config.ts" -type f -delete 2>/dev/null || true

echo ""
echo "✅ Limpeza completa finalizada!"
echo ""
echo "📋 Resumo do que foi removido:"
echo "• Diretórios __tests__ e tests em packages/"
echo "• Arquivos .test.ts e .spec.ts em packages/"
echo "• Configurações vitest.config.ts duplicadas"
echo "• Diretórios de teste em apps/"
echo "• Diretórios test-isolated/ e tests/ na raiz"
echo "• Tools antigos (testing, tests, testing-toolkit)"
echo "• Configurações playwright duplicadas"
echo ""
echo "🎯 Estrutura consolidada em tools/tests-consolidated/ mantida!"
echo ""
echo "🚀 Próximo passo: cd tools/tests-consolidated && bun run validate"