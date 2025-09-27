#!/bin/bash

echo "🔍 Testando integração OxLint com IDE..."
echo "============================================"

# Teste 1: Verificar se OxLint está disponível
echo "1️⃣ Verificando disponibilidade do OxLint..."
if npx oxlint --version >/dev/null 2>&1; then
    echo "✅ OxLint disponível via npx"
    OXLINT_VERSION=$(npx oxlint --version 2>/dev/null)
    echo "   Versão: $OXLINT_VERSION"
else
    echo "❌ OxLint não disponível"
    exit 1
fi

# Teste 2: Verificar configuração
echo ""
echo "2️⃣ Verificando configuração..."
if [ -f ".oxlintrc.json" ]; then
    echo "✅ Arquivo .oxlintrc.json encontrado"
else
    echo "❌ Arquivo .oxlintrc.json não encontrado"
fi

# Teste 3: Testar execução em arquivo específico
echo ""
echo "3️⃣ Testando execução em arquivo específico..."
TEST_FILE="packages/ui/src/components/ui/pagination.tsx"
if [ -f "$TEST_FILE" ]; then
    echo "   Executando OxLint em: $TEST_FILE"
    OUTPUT=$(./scripts/oxlint-ide.sh "$TEST_FILE" 2>&1)
    if echo "$OUTPUT" | grep -q "diagnostics"; then
        echo "✅ OxLint executou com sucesso (formato JSON)"
        ERROR_COUNT=$(echo "$OUTPUT" | grep -o '"severity":"error"' | wc -l)
        WARNING_COUNT=$(echo "$OUTPUT" | grep -o '"severity":"warning"' | wc -l)
        echo "   Erros encontrados: $ERROR_COUNT"
        echo "   Warnings encontrados: $WARNING_COUNT"
    else
        echo "❌ OxLint não retornou formato JSON válido"
        echo "   Output: $OUTPUT"
    fi
else
    echo "❌ Arquivo de teste não encontrado: $TEST_FILE"
fi

# Teste 4: Verificar configurações de IDE
echo ""
echo "4️⃣ Verificando configurações de IDE..."
if [ -f ".qoder/settings.json" ]; then
    echo "✅ Configuração Qoder encontrada"
fi
if [ -f ".vscode/settings.json" ]; then
    echo "✅ Configuração VSCode encontrada"
fi

# Teste 5: Sugestões para resolução
echo ""
echo "🔧 Para resolver problemas com Problems panel:"
echo "   1. Reinicie a IDE completamente"
echo "   2. Verifique se há extensão OxLint disponível"
echo "   3. Configure Language Server manualmente"
echo "   4. Use o terminal integrado: pnpm lint:watch"
echo "   5. Verifique Output panel para logs"

echo ""
echo "✅ Teste concluído!"