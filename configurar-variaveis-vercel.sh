#!/bin/bash

# 🔧 NEONPRO - Script para Configuração de Variáveis de Ambiente no Vercel
# Automatiza a configuração de todas as variáveis necessárias

echo "🔧 NEONPRO - Configuração de Variáveis de Ambiente no Vercel"
echo "============================================================"

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "🔐 Fazendo login no Vercel..."
vercel login

echo "🔗 Conectando ao projeto..."
vercel link --yes

echo "🔑 Configurando variáveis de ambiente..."

# === VARIÁVEIS CRÍTICAS ===
echo "📋 Configurando variáveis CRÍTICAS..."

vercel env add NODE_ENV production --environment production
vercel env add NEXT_TELEMETRY_DISABLED 1 --environment production,preview,development

# AI Services
vercel env add OPENAI_API_KEY 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 --environment production,preview,development
vercel env add ANTHROPIC_API_KEY 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 --environment production,preview,development

# Application URLs
vercel env add NEXT_PUBLIC_APP_URL https://neonpro.vercel.app --environment production
vercel env add NEXT_PUBLIC_API_URL https://neonpro.vercel.app/api --environment production

# === VARIÁVEIS DE ALTA PRIORIDADE ===
echo "📋 Configurando variáveis de ALTA prioridade..."

# Database (ATUALIZAR COM VALORES REAIS)
echo "⚠️  IMPORTANTE: Atualize as variáveis do Supabase com valores reais!"
vercel env add NEXT_PUBLIC_SUPABASE_URL https://your_project_id.supabase.co --environment production,preview,development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY your_supabase_anon_key_here --environment production,preview,development
vercel env add SUPABASE_SERVICE_ROLE_KEY your_supabase_service_role_key_here --environment production,preview,development
vercel env add DATABASE_URL postgresql://postgres:password@db.your_project_id.supabase.co:5432/postgres --environment production,preview,development

# === VARIÁVEIS OPCIONAIS ===
echo "📋 Configurando variáveis OPCIONAIS..."

# Search Services
vercel env add TAVILY_API_KEY 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 --environment production,preview,development
vercel env add EXA_API_KEY fae6582d-4562-45be-8ce9-f6c0c3518c66 --environment production,preview,development

# External Services
vercel env add GOOGLE_API_KEY AIzaSyB-lsKyf_xYMX4bAERrOTgDBTgcQ9cf7OI --environment production,preview,development
vercel env add GITHUB_TOKEN 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 --environment production,preview,development

# Payment (Stripe) - Usar valores de teste
vercel env add STRIPE_PUBLISHABLE_KEY pk_test_your_stripe_publishable_key_here --environment production,preview,development
vercel env add STRIPE_SECRET_KEY sk_test_your_stripe_secret_key_here --environment production,preview,development
vercel env add STRIPE_WEBHOOK_SECRET whsec_your_stripe_webhook_secret_here --environment production,preview,development

# Security
vercel env add JWT_SECRET $(openssl rand -base64 32) --environment production,preview,development

echo ""
echo "✅ Configuração de variáveis concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Atualizar variáveis do Supabase com valores reais"
echo "2. Executar redeploy: vercel --prod"
echo "3. Monitorar logs de build"
echo "4. Validar site em https://neonpro.vercel.app"
echo ""
echo "⚠️  IMPORTANTE:"
echo "- Atualize NEXT_PUBLIC_SUPABASE_URL com URL real do projeto"
echo "- Atualize NEXT_PUBLIC_SUPABASE_ANON_KEY com chave real"
echo "- Atualize SUPABASE_SERVICE_ROLE_KEY com chave real"
echo "- Atualize DATABASE_URL com string de conexão real"
echo ""

# Executar redeploy
read -p "🚀 Executar redeploy agora? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Executando redeploy..."
    vercel --prod
    echo "✅ Redeploy executado!"
    echo "🌐 Acesse: https://neonpro.vercel.app"
else
    echo "⏸️  Redeploy adiado. Execute 'vercel --prod' quando estiver pronto."
fi

echo "🎯 Configuração finalizada!"
