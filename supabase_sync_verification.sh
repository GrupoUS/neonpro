#!/bin/bash
# Script de Verificação Final - Sincronização NeonPro & Supabase
# Execute: bash supabase_sync_verification.sh

echo "🚀 VERIFICAÇÃO FINAL DE SINCRONIZAÇÃO NEONPRO & SUPABASE"
echo "=========================================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto NeonPro"
    exit 1
fi

echo "📁 Diretório do projeto: $(pwd)"
echo ""

# Verificar conexão com Supabase
echo "🔗 Verificando conexão com Supabase..."
if supabase projects list > /dev/null 2>&1; then
    echo "✅ Conexão com Supabase ativa"
    echo "📋 Projeto atual:"
    supabase projects list | grep "●"
else
    echo "❌ Erro: Não foi possível conectar ao Supabase"
    echo "Execute: supabase login"
    exit 1
fi
echo ""

# Verificar status das migrations
echo "📊 Status das migrations locais vs remotas:"
echo "-------------------------------------------"
supabase migration list
echo ""

# Verificar arquivos de migrations criados
echo "📂 Migrations implementadas localmente:"
echo "-------------------------------------"
ls -la supabase/migrations/2025012* 2>/dev/null | grep -E "(scheduled|service|appointment|professional)" || echo "❌ Nenhuma migration encontrada"
echo ""

# Verificar scripts de configuração criados
echo "🔧 Scripts de configuração disponíveis:"
echo "--------------------------------------"
if [ -f "update_rls_policies.sql" ]; then
    echo "✅ update_rls_policies.sql - $(wc -l < update_rls_policies.sql) linhas"
else
    echo "❌ update_rls_policies.sql não encontrado"
fi

if [ -f "integration_test.sql" ]; then
    echo "✅ integration_test.sql - $(wc -l < integration_test.sql) linhas"
else
    echo "❌ integration_test.sql não encontrado"
fi

if [ -f "combined_schema_migration.sql" ]; then
    echo "✅ combined_schema_migration.sql - $(wc -l < combined_schema_migration.sql) linhas"
else
    echo "❌ combined_schema_migration.sql não encontrado"
fi

if [ -f "verify_tables.sql" ]; then
    echo "✅ verify_tables.sql - $(wc -l < verify_tables.sql) linhas"
else
    echo "❌ verify_tables.sql não encontrado"
fi
echo ""

# Verificar documentação criada
echo "📚 Documentação gerada:"
echo "----------------------"
if [ -f "docs/supabase-sync-guide.md" ]; then
    echo "✅ docs/supabase-sync-guide.md - Guia completo de sincronização"
else
    echo "❌ docs/supabase-sync-guide.md não encontrado"
fi

if [ -f "docs/database-schema/migrations-implementation-report.md" ]; then
    echo "✅ docs/database-schema/migrations-implementation-report.md - Relatório de implementação"
else
    echo "❌ Relatório de implementação não encontrado"
fi
echo ""

# Verificar estrutura das migrations
echo "🔍 Análise das migrations implementadas:"
echo "---------------------------------------"
migration_count=0
for file in supabase/migrations/2025012*.sql; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        lines=$(wc -l < "$file")
        echo "✅ $filename - $lines linhas"
        migration_count=$((migration_count + 1))
    fi
done

if [ $migration_count -eq 0 ]; then
    echo "❌ Nenhuma migration implementada encontrada"
else
    echo ""
    echo "📈 Total: $migration_count migrations implementadas"
fi
echo ""

# Status final
echo "🎯 STATUS FINAL DE SINCRONIZAÇÃO"
echo "================================"

# Contar migrations sincronizadas
synced_count=$(supabase migration list 2>/dev/null | grep -c "20250126")
if [ $synced_count -ge 5 ]; then
    echo "✅ SINCRONIZAÇÃO COMPLETA"
    echo "   📊 $synced_count/5 migrations aplicadas no Supabase remoto"
    echo ""
    echo "🚀 Próximos passos:"
    echo "   1. Execute 'update_rls_policies.sql' no Dashboard do Supabase"
    echo "   2. Execute 'integration_test.sql' para validar tudo está funcionando" 
    echo "   3. Integre com o frontend React"
    echo ""
    echo "🎉 NEONPRO HEALTHCARE ESTÁ PRONTO PARA O PRÓXIMO NÍVEL!"
else
    echo "⚠️  SINCRONIZAÇÃO PARCIAL"
    echo "   📊 $synced_count/5 migrations aplicadas"
    echo ""
    echo "🔧 Para completar:"
    echo "   1. Execute: supabase db push --include-all"
    echo "   2. Execute os scripts de configuração restantes"
fi
echo ""

# Informações do sistema
echo "ℹ️  Informações do sistema:"
echo "  📅 Data: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  🖥️  User: $(whoami)"
echo "  📂 Workspace: $(basename $(pwd))"
echo "  🔗 Supabase CLI: $(supabase --version 2>/dev/null || echo 'não encontrado')"
echo ""

echo "✅ Verificação concluída!"
echo "📖 Consulte docs/supabase-sync-guide.md para detalhes completos"