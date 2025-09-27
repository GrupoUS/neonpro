#!/bin/bash

# Teste de configuração Supabase Auth simples
# Verifica se as APIs estão funcionando sem depender do CLI

set -e

echo "🔍 Verificando configuração Supabase Auth..."

# Carregar variáveis de ambiente
if [ -f .env.local ]; then
    set -a
    source .env.local
    set +a
    echo "✅ Variáveis de ambiente carregadas"
else
    echo "❌ Arquivo .env.local não encontrado"
    exit 1
fi

# Verificar se as variáveis necessárias estão definidas
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Variáveis VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidas"
    exit 1
fi

echo "✅ Supabase URL: $VITE_SUPABASE_URL"
echo "✅ Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."

# Testar conectividade com a API Supabase
echo "🔗 Testando conectividade com Supabase..."

# Teste básico de API
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    "$VITE_SUPABASE_URL/rest/v1/" || echo "000")

if [ "$response" = "200" ]; then
    echo "✅ Conectividade com Supabase: OK"
else
    echo "❌ Falha na conectividade com Supabase. Status: $response"
fi

# Verificar configuração de auth
echo "🔐 Verificando configuração de autenticação..."

auth_response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    "$VITE_SUPABASE_URL/auth/v1/settings" || echo "000")

if [ "$auth_response" = "200" ]; then
    echo "✅ Configuração de autenticação: OK"
else
    echo "❌ Falha na configuração de autenticação. Status: $auth_response"
fi

echo ""
echo "🎯 Status da configuração Supabase:"
echo "   📡 API: $([ "$response" = "200" ] && echo "✅ Funcionando" || echo "❌ Com problemas")"
echo "   🔐 Auth: $([ "$auth_response" = "200" ] && echo "✅ Funcionando" || echo "❌ Com problemas")"
echo ""

if [ "$response" = "200" ] && [ "$auth_response" = "200" ]; then
    echo "🎉 Configuração Supabase Auth está funcionando corretamente!"
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. Configurar providers OAuth no dashboard Supabase"
    echo "   2. Configurar URLs de callback"
    echo "   3. Testar fluxo de autenticação"
    exit 0
else
    echo "⚠️  Configuração Supabase precisa de ajustes"
    exit 1
fi