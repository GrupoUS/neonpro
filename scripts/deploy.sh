#!/bin/bash

# NeonPro Healthcare - Deploy Script
# Executa verificações e deploy para Vercel

set -e

echo "🏥 NeonPro Healthcare - Deploy Script"
echo "===================================="

# 1. Verificações pré-deploy
echo "🔍 Executando verificações pré-deploy..."

# Build local
echo "📦 Testando build local..."
npm run build

# Linting
echo "🔍 Verificando código..."
npm run lint

# Type checking
echo "📝 Verificando tipos..."
cd apps/neonpro-web && npm run type-check && cd ../..

echo "✅ Todas as verificações passaram!"

# 2. Deploy
echo "🚀 Iniciando deploy..."

if command -v vercel &> /dev/null; then
    echo "📤 Fazendo deploy via Vercel CLI..."
    vercel --prod
else
    echo "⚠️ Vercel CLI não encontrada."
    echo "📋 Push para main branch para deploy automático ou:"
    echo "   npm install -g vercel"
    echo "   vercel login"
    echo "   vercel --prod"
fi

echo "✅ Deploy concluído!"
echo "📊 Acesse: https://vercel.com/dashboard para monitorar"