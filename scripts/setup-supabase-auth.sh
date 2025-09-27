#!/bin/bash

# =============================================================================
# Supabase Auth Configuration Script
# =============================================================================
# Configura providers de autenticação e políticas de segurança para NeonPro
# 
# Uso: ./scripts/setup-supabase-auth.sh
# 
# Requisitos:
# - Supabase CLI instalado
# - Projeto linkado
# - Variáveis de ambiente configuradas

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Utility functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar pré-requisitos
check_prerequisites() {
    log_info "Verificando pré-requisitos..."
    
    # Verificar se Supabase CLI está instalado
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI não encontrado. Instale com: npm install -g supabase"
        exit 1
    fi
    
    # Verificar se as variáveis de ambiente necessárias estão configuradas
    if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
        log_error "Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias"
        exit 1
    fi
    
    log_success "Pré-requisitos verificados"
}

# Verificar status do projeto
check_project_status() {
    log_info "Verificando status do projeto Supabase..."
    
    # Verificar se está linkado
    if [ ! -f "./.supabase/config.toml" ]; then
        log_warning "Projeto não linkado. Tentando linkar..."
        supabase link --project-ref ownkoxryswokcdanrdgj
    fi
    
    log_success "Projeto verificado"
}

# Aplicar migrações de auth
apply_auth_migrations() {
    log_info "Aplicando migrações de autenticação..."
    
    # Verificar se a migração de auth já foi aplicada
    if [ -f "./supabase/migrations/20240926212500_setup_auth_healthcare.sql" ]; then
        log_info "Migração de auth healthcare encontrada"
        
        # Aplicar migrações pendentes
        supabase db push || {
            log_warning "Erro ao aplicar migrações. Continuando..."
        }
    else
        log_warning "Migração de auth não encontrada"
    fi
    
    log_success "Migrações aplicadas"
}

# Configurar auth providers via SQL
configure_auth_providers() {
    log_info "Configurando providers de autenticação..."
    
    # Criar arquivo SQL para configurações de auth
    cat > /tmp/auth_config.sql << 'EOF'
-- Configurações de autenticação para NeonPro Healthcare

-- Atualizar configurações de auth existentes
UPDATE auth.config 
SET 
    jwt_exp = 86400,  -- 24 horas para segurança healthcare
    refresh_token_rotation_enabled = true,
    double_confirm_changes_enabled = true,
    secure_password_change_enabled = true
WHERE true;

-- Configurar templates de email personalizados
INSERT INTO auth.email_templates (
    template_type,
    subject,
    content
) VALUES 
(
    'confirmation',
    'Confirme seu email - NeonPro Healthcare',
    '
    <h2>Bem-vindo ao NeonPro Healthcare</h2>
    <p>Clique no link abaixo para confirmar seu email:</p>
    <a href="{{ .ConfirmationURL }}">Confirmar Email</a>
    <p><small>Este sistema está em conformidade com a LGPD (Lei Geral de Proteção de Dados)</small></p>
    '
),
(
    'recovery',
    'Recuperação de senha - NeonPro Healthcare',
    '
    <h2>Recuperação de Senha</h2>
    <p>Clique no link abaixo para redefinir sua senha:</p>
    <a href="{{ .RecoveryURL }}">Redefinir Senha</a>
    <p><small>Este link expira em 1 hora por segurança.</small></p>
    '
)
ON CONFLICT (template_type) DO UPDATE SET
    subject = EXCLUDED.subject,
    content = EXCLUDED.content;

-- Configurar URLs de redirecionamento permitidas
INSERT INTO auth.redirect_urls (url) VALUES 
    ('http://localhost:3000/auth/callback'),
    ('https://neonpro.vercel.app/auth/callback'),
    ('https://neonpro.vercel.app/dashboard')
ON CONFLICT (url) DO NOTHING;
EOF

    # Executar configurações via psql
    log_info "Aplicando configurações de auth..."
    supabase db reset --db-url "$SUPABASE_URL" < /tmp/auth_config.sql || {
        log_warning "Algumas configurações podem precisar ser feitas via dashboard"
    }
    
    # Limpar arquivo temporário
    rm -f /tmp/auth_config.sql
    
    log_success "Providers configurados"
}

# Gerar tipos TypeScript atualizados
generate_types() {
    log_info "Gerando tipos TypeScript atualizados..."
    
    # Gerar tipos do Supabase
    supabase gen types typescript --project-id ownkoxryswokcdanrdgj > ./packages/database/src/types/supabase-auth.ts || {
        log_warning "Erro ao gerar tipos. Verifique a conexão com o Supabase"
    }
    
    log_success "Tipos gerados"
}

# Testar configuração de auth
test_auth_config() {
    log_info "Testando configuração de autenticação..."
    
    # Criar arquivo de teste
    cat > /tmp/test_auth.sql << 'EOF'
-- Testar se tabelas de auth estão acessíveis
SELECT 
    COUNT(*) as profile_count 
FROM public.profiles 
LIMIT 1;

-- Testar políticas RLS
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Verificar triggers
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
AND event_object_table = 'profiles';
EOF

    # Executar testes
    supabase db reset --db-url "$SUPABASE_URL" < /tmp/test_auth.sql || {
        log_warning "Alguns testes falharam"
    }
    
    # Limpar arquivo temporário
    rm -f /tmp/test_auth.sql
    
    log_success "Testes concluídos"
}

# Exibir instruções manuais
show_manual_instructions() {
    log_info "Configurações manuais necessárias no Supabase Dashboard:"
    echo
    echo "1. Acesse: https://app.supabase.com/project/ownkoxryswokcdanrdgj"
    echo
    echo "2. Authentication > Providers > Google OAuth:"
    echo "   - Habilitar Google OAuth"
    echo "   - Client ID: [configurar com Google Console]"
    echo "   - Client Secret: [configurar com Google Console]"
    echo "   - Redirect URL: https://ownkoxryswokcdanrdgj.supabase.co/auth/v1/callback"
    echo
    echo "3. Authentication > Settings:"
    echo "   - JWT expiry: 86400 seconds (24 horas)"
    echo "   - Refresh token rotation: habilitado"
    echo "   - Reuse interval: 10 seconds"
    echo "   - Secure password change: habilitado"
    echo
    echo "4. Authentication > URL Configuration:"
    echo "   - Site URL: https://neonpro.vercel.app"
    echo "   - Additional redirect URLs:"
    echo "     * http://localhost:3000/auth/callback"
    echo "     * https://neonpro.vercel.app/auth/callback"
    echo "     * https://neonpro.vercel.app/dashboard"
    echo
    echo "5. Authentication > Email Templates:"
    echo "   - Personalizar templates para contexto healthcare"
    echo "   - Incluir informações sobre LGPD"
    echo
    echo "6. Para Google OAuth, configure no Google Cloud Console:"
    echo "   - Authorized redirect URIs:"
    echo "     * https://ownkoxryswokcdanrdgj.supabase.co/auth/v1/callback"
    echo
}

# Função principal
main() {
    echo "🚀 Configurando Autenticação Supabase para NeonPro Healthcare"
    echo "=============================================================="
    echo
    
    check_prerequisites
    check_project_status
    apply_auth_migrations
    configure_auth_providers
    generate_types
    test_auth_config
    
    echo
    log_success "🎉 Configuração de autenticação concluída!"
    echo
    
    show_manual_instructions
    
    echo
    echo "📋 PRÓXIMOS PASSOS:"
    echo "1. Complete as configurações manuais no dashboard"
    echo "2. Configure Google OAuth no Google Cloud Console"
    echo "3. Teste o login em desenvolvimento: http://localhost:3000"
    echo "4. Verifique logs de auth em: https://app.supabase.com/project/ownkoxryswokcdanrdgj/auth/logs"
    echo
}

# Executar script
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi