#!/bin/bash

# 🚀 NEONPRO TURBOREPO MIGRATION SCRIPT
# Automatiza a migração do código atual para a nova estrutura Turborepo

set -e

echo "🚀 Iniciando migração Turborepo - NeonPro Healthcare..."

# Verificar se estamos no diretório correto
if [ ! -f "turbo.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto (onde está o turbo.json)"
    exit 1
fi

# Criar estrutura de diretórios
echo "📁 Criando estrutura de diretórios..."
mkdir -p apps/neonpro-web/src
mkdir -p apps/neonpro-web/public

# Migrar código principal
echo "📦 Migrando código principal..."

# App directory (Next.js 14)
if [ -d "app" ]; then
    echo "  ↪ Movendo app/ -> apps/neonpro-web/src/app/"
    mv app/ apps/neonpro-web/src/app/
fi

# Components
if [ -d "components" ]; then
    echo "  ↪ Movendo components/ -> apps/neonpro-web/src/components/"
    mv components/ apps/neonpro-web/src/components/
fi

# Lib
if [ -d "lib" ]; then
    echo "  ↪ Movendo lib/ -> apps/neonpro-web/src/lib/"
    mv lib/ apps/neonpro-web/src/lib/
fi

# Utils (mantendo referência mas movendo para package)
if [ -d "utils" ]; then
    echo "  ↪ Mesclando utils/ -> packages/utils/src/"
    cp -r utils/* packages/utils/src/ 2>/dev/null || true
    rm -rf utils/
fi

# Hooks
if [ -d "hooks" ]; then
    echo "  ↪ Movendo hooks/ -> apps/neonpro-web/src/hooks/"
    mv hooks/ apps/neonpro-web/src/hooks/
fi

# Contexts
if [ -d "contexts" ]; then
    echo "  ↪ Movendo contexts/ -> apps/neonpro-web/src/contexts/"
    mv contexts/ apps/neonpro-web/src/contexts/
fi

# Types (mantendo referência mas movendo para package)
if [ -d "types" ]; then
    echo "  ↪ Mesclando types/ -> packages/types/src/"
    cp -r types/* packages/types/src/ 2>/dev/null || true
    rm -rf types/
fi

# Styles
if [ -d "styles" ]; then
    echo "  ↪ Movendo styles/ -> apps/neonpro-web/src/styles/"
    mv styles/ apps/neonpro-web/src/styles/
fi

# Public assets
if [ -d "public" ]; then
    echo "  ↪ Movendo public/ -> apps/neonpro-web/public/"
    cp -r public/* apps/neonpro-web/public/ 2>/dev/null || true
fi

# Arquivos de configuração específicos do app
echo "📄 Movendo arquivos de configuração..."

# Tailwind
if [ -f "tailwind.config.ts" ]; then
    echo "  ↪ Movendo tailwind.config.ts"
    mv tailwind.config.ts apps/neonpro-web/
fi

# PostCSS
if [ -f "postcss.config.js" ]; then
    echo "  ↪ Movendo postcss.config.js"
    mv postcss.config.js apps/neonpro-web/
fi

# Jest
if [ -f "jest.config.js" ]; then
    echo "  ↪ Movendo jest.config.js"
    mv jest.config.js apps/neonpro-web/
fi

if [ -f "jest.setup.js" ]; then
    echo "  ↪ Movendo jest.setup.js"
    mv jest.setup.js apps/neonpro-web/
fi

# Cypress
if [ -f "cypress.config.ts" ]; then
    echo "  ↪ Movendo cypress.config.ts"
    mv cypress.config.ts apps/neonpro-web/
fi

if [ -d "cypress" ]; then
    echo "  ↪ Movendo cypress/"
    mv cypress/ apps/neonpro-web/
fi

# Playwright
if [ -f "playwright.config.ts" ]; then
    echo "  ↪ Movendo playwright.config.ts"
    mv playwright.config.ts apps/neonpro-web/
fi

# Environment files
echo "🔐 Copiando arquivos de ambiente..."
for env_file in .env.local .env.production .env.example; do
    if [ -f "$env_file" ]; then
        echo "  ↪ Copiando $env_file"
        cp "$env_file" "apps/neonpro-web/"
    fi
done

echo "🔧 Instalando dependências..."
pnpm install

echo "🏗️ Building packages..."
pnpm run build

echo "✅ Migração concluída com sucesso!"
echo ""
echo "🎯 Próximos passos:"
echo "1. Atualizar imports nos arquivos migrados:"
echo "   - @neonpro/ui para componentes"
echo "   - @neonpro/utils para utilitários"
echo "   - @neonpro/types para tipos"
echo ""
echo "2. Testar o build:"
echo "   pnpm run build"
echo ""
echo "3. Testar desenvolvimento:"
echo "   pnpm run dev"
echo ""
echo "4. Configurar Vercel:"
echo "   - Root Directory: apps/neonpro-web"
echo "   - Build Command: cd ../.. && pnpm turbo build --filter=@neonpro/web"
echo ""
echo "🚀 Turborepo configurado com sucesso! Performance target: 80% redução tempo build"