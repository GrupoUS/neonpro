# 🚀 GUIA: Executar Migrações do Accounts Payable no Supabase Online

## ✅ Status da Configuração
- **✅ Projeto Online Conectado**: https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt
- **✅ Chaves de API Atualizadas**: .env.local configurado corretamente
- **✅ Conexão Testada**: Supabase online funcionando
- **⚠️ Pendente**: Executar migrações SQL no dashboard

## 📋 Passos para Executar as Migrações

### 1. Acessar o SQL Editor
1. Abra: https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt/sql
2. Faça login se necessário

### 2. Executar Migration 1 - Schema do Accounts Payable
1. No SQL Editor, cole o conteúdo do arquivo:
   `supabase/migrations/20250721120000_create_accounts_payable_schema.sql`
2. Clique em "Run" para executar
3. Aguarde a conclusão (pode levar alguns segundos)

### 3. Executar Migration 2 - Dados de Teste
1. No SQL Editor, cole o conteúdo do arquivo:
   `supabase/migrations/20250721120001_insert_ap_test_data.sql`
2. Clique em "Run" para executar
3. Aguarde a conclusão

### 4. Verificar as Tabelas Criadas
Após executar as migrações, as seguintes tabelas devem estar disponíveis:

**Tabelas Principais:**
- ✅ `vendors` - Fornecedores/prestadores de serviços
- ✅ `accounts_payable` - Contas a pagar
- ✅ `expense_categories` - Categorias de despesas
- ✅ `payment_schedules` - Cronogramas de pagamento
- ✅ `ap_payments` - Registros de pagamentos
- ✅ `ap_documents` - Documentos anexados
- ✅ `ap_audit_log` - Log de auditoria

**Funções:**
- ✅ `generate_ap_number()` - Geração automática de números AP
- ✅ `generate_payment_number()` - Geração automática de números de pagamento

### 5. Testar a Conexão
Após executar as migrações, execute:
```bash
node scripts/test-supabase-online.js
```

Deve mostrar que as tabelas do AP estão acessíveis.

## 🔗 Links Úteis
- **Dashboard Principal**: https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt
- **SQL Editor**: https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt/sql
- **Editor de Tabelas**: https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt/editor

## 📁 Localização dos Arquivos de Migração
- **Schema**: `supabase/migrations/20250721120000_create_accounts_payable_schema.sql`
- **Dados**: `supabase/migrations/20250721120001_insert_ap_test_data.sql`

## ⚙️ Após Executar as Migrações
1. **Testar Conexão**: `node scripts/test-supabase-online.js`
2. **Iniciar Desenvolvimento**: O sistema do NeonPro deve funcionar normalmente
3. **Verificar Funcionalidades**: Testar páginas de Accounts Payable no dashboard

---

**🎯 Objetivo:** Ter todas as tabelas do sistema de Accounts Payable funcionando no Supabase online para garantir disponibilidade contínua, independentemente do status do Docker local.
