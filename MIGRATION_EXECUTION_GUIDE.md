# NeonPro - Guia de Execução de Migrações SQL

## 📋 Visão Geral

Este guia fornece instruções detalhadas para executar as migrações SQL do NeonPro no Supabase de forma segura e organizada.

## 🔧 Pré-requisitos

1. **Acesso ao Supabase Dashboard** ou Supabase CLI configurado
2. **Permissões de administrador** no projeto Supabase
3. **Backup** do banco de dados atual (recomendado)

## 📊 Ordem de Execução das Migrações

### Fase 1: Migrações Base (OBRIGATÓRIAS)
Estas migrações devem ser executadas na ordem exata devido às dependências:

```
1. 00-system-settings.sql      ← Criado automaticamente (dependência)
2. 01-setup-profiles.sql       ← Base do sistema de usuários
3. 02-setup-appointments.sql   ← Core system (clinics, patients, professionals)
4. 03-patient-profiles.sql     ← Portal de pacientes 
5. 03-appointment-procedures.sql ← Procedures para appointments
```

### Fase 2: Migrações Avançadas (ORDEM FLEXÍVEL)
Estas podem ser executadas em qualquer ordem após a Fase 1:

```
6. 04-appointments-system.sql
7. 04-conflict-prevention-schema.sql
8. 04-setup-realtime-availability.sql  
9. 04-stock-alerts-schema.sql
10. 05-advanced-conflict-procedures.sql
11. 05-conflict-override-procedures.sql
12. 06-notifications-system.sql
13. 07-billing-system.sql
14. 08-billing-analytics-functions.sql
```

## 🚀 Métodos de Execução

### Método 1: Supabase Dashboard (RECOMENDADO)

1. **Acesse o Supabase Dashboard**
   - Vá para https://supabase.com/dashboard
   - Selecione seu projeto NeonPro

2. **Navegue para SQL Editor**
   - Clique em "SQL Editor" na barra lateral
   - Clique em "New Query"

3. **Execute as migrações uma por vez**
   - Copie o conteúdo do primeiro script (00-system-settings.sql)
   - Cole no editor SQL
   - Clique em "RUN" e aguarde a conclusão
   - Repita para cada script na ordem

### Método 2: Supabase CLI

```bash
# 1. Instale o Supabase CLI se não tiver
npm install -g supabase

# 2. Faça login no Supabase
supabase login

# 3. Link com seu projeto
supabase link --project-ref YOUR_PROJECT_REF

# 4. Execute as migrações
supabase db reset  # Para aplicar todas as migrações locais

# OU execute scripts individuais
psql "postgresql://..." -f scripts/00-system-settings.sql
psql "postgresql://..." -f scripts/01-setup-profiles.sql
# ... continue para todos os scripts
```

### Método 3: Conexão Direta com PostgreSQL

```bash
# Use a string de conexão do Supabase
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
     -f scripts/00-system-settings.sql
```

## ✅ Verificações Pós-Migração

### 1. Verificar Tabelas Criadas
```sql
-- Execute no SQL Editor do Supabase
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### 2. Verificar RLS (Row Level Security)
```sql
-- Verificar se RLS está habilitado nas tabelas críticas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
    AND rowsecurity = true
ORDER BY tablename;
```

### 3. Verificar Funções Criadas
```sql
-- Listar funções personalizadas
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name NOT LIKE 'pg_%'
ORDER BY routine_name;
```

### 4. Verificar Políticas RLS
```sql
-- Verificar políticas de segurança
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 🔧 Resolução de Problemas

### Erro: "relation does not exist"
- **Causa**: Dependência não executada
- **Solução**: Execute as migrações na ordem correta

### Erro: "permission denied"
- **Causa**: Usuário sem permissões adequadas
- **Solução**: Use usuário com role de superuser ou service_role

### Erro: "already exists"
- **Causa**: Migração já foi executada
- **Solução**: Use `IF NOT EXISTS` ou pule esta migração

## 📝 Log de Migração

Cada migração executada será registrada na tabela `migration_log`:

```sql
-- Consultar log de migrações
SELECT * FROM migration_log ORDER BY executed_at;
```

## 🔄 Rollback (Se Necessário)

Em caso de erro, você pode fazer rollback:

```sql
-- 1. Identificar as tabelas criadas pela migração problemática
-- 2. Fazer backup dos dados se necessário
-- 3. Remover tabelas/objetos na ordem inversa da criação

-- Exemplo de rollback (CUIDADO!)
DROP TABLE IF EXISTS appointment_history CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
-- ... etc
```

## ⚠️ Avisos Importantes

1. **SEMPRE faça backup** antes de executar migrações em produção
2. **Teste primeiro** em um ambiente de desenvolvimento
3. **Execute uma migração por vez** para facilitar debugging
4. **Monitore logs** durante a execução
5. **Verifique integridade** após cada migração

## 📞 Suporte

Se encontrar problemas:
1. Consulte os logs de erro do Supabase
2. Verifique a tabela `migration_log`
3. Consulte a documentação do Supabase
4. Entre em contato com a equipe de desenvolvimento

---

**Data de Criação**: 2025-01-21  
**Versão**: 1.0  
**Autor**: Claude Code Assistant  
**Projeto**: NeonPro Healthcare Management System