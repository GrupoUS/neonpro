#!/bin/bash

# Script de Deploy Vercel com Limpeza de Cache
# Uso: ./deploy-vercel.sh

echo "🚀 Iniciando deploy limpo no Vercel..."

# 1. Limpar diretórios de build locais
echo "🧹 Limpando diretórios de build..."
rm -rf .next
rm -rf node_modules
rm -rf .vercel

# 2. Instalar dependências com flags corretas
echo "📦 Instalando dependências..."
npm install --legacy-peer-deps --force

# 3. Garantir que as dependências de polyfill estão instaladas
echo "🔧 Verificando polyfills..."
npm install process buffer util url querystring-es3 --save

# 4. Build local para verificar
echo "🏗️ Fazendo build local..."
npm run build

# 5. Deploy com Vercel CLI forçando nova build
echo "🌐 Fazendo deploy no Vercel..."
vercel --prod --force

echo "✅ Deploy concluído!"