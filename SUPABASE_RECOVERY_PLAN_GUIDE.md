# 🗄️ Guia Supabase - Recovery Plan Tables

## 📋 Visão Geral

Este guia contém as instruções para aplicar as migrations do sistema de Recovery Plan no Supabase cloud.

## 🔑 Pré-requisitos

1. **Acesso ao Dashboard**: https://supabase.com/dashboard/project/ownkoxryswokcdanrdgj
2. **Senha do Database**: Configurada no dashboard do Supabase
3. **Supabase CLI**: Versão v2.45.5+ recomendada

## 🚀 Comandos para Aplicar Migrations

### 1. Conectar ao Projeto

```bash
cd /home/vibecode/neonpro

# Conectar ao projeto (será solicitada a senha)
supabase link --project-ref ownkoxryswokcdanrdgj
```

### 2. Verificar Status das Migrations

```bash
# Listar migrations pendentes
supabase migration list

# Verificar diferenças
supabase db diff
```

### 3. Aplicar Migrations

```bash
# Aplicar todas as migrations pendentes
supabase db push

# OU aplicar migration específica
supabase migration up
```

### 4. Verificar Aplicação

```bash
# Verificar status do banco
supabase db status

# Testar conexão
supabase projects list
```

## 📊 Migration Criada

**Arquivo**: `20250924123645_create_recovery_plan_tables.sql`

**Tabelas Criadas**:

- `recovery_plans` - Tabela principal dos planos
- `recovery_phases` - Fases da recuperação
- `recovery_instructions` - Instruções detalhadas
- `warning_signs` - Sinais de alerta
- `risk_factors` - Fatores de risco
- `follow_up_appointments` - Consultas de acompanhamento

**Recursos Implementados**:

- ✅ Row Level Security (RLS)
- ✅ Policies de acesso por clínica
- ✅ Indexes de performance
- ✅ Triggers de updated_at
- ✅ Enum types para type safety
- ✅ Constraints de validação

## 🔧 Troubleshooting

### Erro de Autenticação

```bash
# Reset da senha no dashboard
https://supabase.com/dashboard/project/ownkoxryswokcdanrdgj/settings/database

# Usar token de acesso alternativo
export SUPABASE_ACCESS_TOKEN="your_token_here"
supabase auth login
```

### Verificar Configuração

```bash
# Verificar config local
cat supabase/config.toml

# Testar conexão com debug
supabase db push --debug
```

### Migration Conflicts

```bash
# Verificar estado atual
supabase migration list --remote

# Resolver conflitos manualmente via Dashboard > SQL Editor
```

## 📝 Estrutura das Tabelas

### recovery_plans

```sql
- id (UUID, PK)
- patient_id (UUID, NOT NULL)
- appointment_id (UUID)
- procedure_id (UUID)
- recovery_period_days (INTEGER)
- care_level (ENUM: low, medium, high, intensive)
- activity_restrictions (TEXT[])
- care_instructions (TEXT[])
- emergency_contacts (TEXT[])
- clinic_id (UUID, NOT NULL)
- created_at/updated_at (TIMESTAMPTZ)
```

### recovery_phases

```sql
- id (UUID, PK)
- recovery_plan_id (UUID, FK)
- phase_type (ENUM: immediate, early, intermediate, late, maintenance)
- phase_number (INTEGER)
- duration_days (INTEGER)
- start_date/end_date (TIMESTAMPTZ)
- instructions, restrictions, warnings (TEXT[])
- key_activities, milestones, warning_signs (TEXT[])
```

## 🔗 Links Úteis

- **Dashboard**: https://supabase.com/dashboard/project/ownkoxryswokcdanrdgj
- **Database Settings**: https://supabase.com/dashboard/project/ownkoxryswokcdanrdgj/settings/database
- **SQL Editor**: https://supabase.com/dashboard/project/ownkoxryswokcdanrdgj/sql
- **CLI Docs**: https://supabase.com/docs/guides/cli

## ⚡ Comandos Rápidos

```bash
# Setup completo
supabase link --project-ref ownkoxryswokcdanrdgj
supabase db push

# Verificação
supabase migration list
supabase db status

# Rollback se necessário
supabase migration down
```

## 🎯 Próximos Passos

1. Aplicar migrations com `supabase db push`
2. Verificar tabelas no Dashboard
3. Testar endpoints tRPC
4. Executar testes de integração
5. Deploy das alterações de código
