#!/bin/bash

# 🚀 NEONPRO - Deploy Manual para Vercel
# Script para configurar e executar deploy quando automático falha

echo "🚀 NEONPRO - Deploy Manual para Vercel"
echo "======================================"

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "🔍 Verificando configurações..."

# Verificar se .env.local existe
if [ ! -f ".env.local" ]; then
    echo "❌ Erro: .env.local não encontrado"
    echo "💡 Execute primeiro as correções das fases anteriores"
    exit 1
fi

# Verificar se build funciona
echo "🔨 Testando build local..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erro: Build local falhou"
    echo "💡 Corrija os erros de build antes de fazer deploy"
    exit 1
fi

echo "✅ Build local bem-sucedido"

# Login no Vercel (se necessário)
echo "🔐 Verificando login no Vercel..."
vercel whoami || vercel login

# Configurar projeto
echo "⚙️ Configurando projeto no Vercel..."
vercel --confirm

# Configurar variáveis de ambiente
echo "🔑 Configurando variáveis de ambiente..."
echo "⚠️  IMPORTANTE: Configure manualmente no Vercel Dashboard:"
echo "   https://vercel.com/dashboard"
echo "   Settings → Environment Variables"
echo ""
echo "📋 Variáveis obrigatórias:"
echo "   - OPENAI_API_KEY"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - DATABASE_URL"
echo "   - NODE_ENV=production"
echo ""

# Deploy para produção
echo "🚀 Executando deploy para produção..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy executado com sucesso!"
    echo "🌐 Acesse: https://neonpro.vercel.app"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Configurar variáveis de ambiente no Vercel Dashboard"
    echo "2. Testar funcionalidades principais"
    echo "3. Verificar APIs e integrações"
    echo ""
else
    echo "❌ Erro durante o deploy"
    echo "💡 Verifique os logs acima para detalhes"
    exit 1
fi

echo "🎯 Deploy manual concluído!"
