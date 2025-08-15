# 📋 INSTRUÇÕES PARA OBTER SENHA DO BANCO SUPABASE

## 🔐 Como obter a senha do banco PostgreSQL:

1. **Acesse o Supabase Dashboard:**
   - URL: https://supabase.com/dashboard
   - Faça login em sua conta

2. **Navegue para o projeto NeonPro:**
   - ID do Projeto: `ownkoxryswokcdanrdgj`
   - Nome: "NeonPro Brasil"

3. **Obter credenciais do banco:**
   - Vá em: **Settings > Database** (ou **Configurações > Banco de Dados**)
   - Procure por: **Connection Info** ou **Informações de Conexão**
   - Copie a **senha do usuário postgres**

4. **Configurar no .env.local:**
   ```bash
   # Substitua "your_database_password_here" pela senha real
   SUPABASE_DB_PASSWORD=sua_senha_aqui
   ```

## 🧪 Testar a conexão:

Depois de configurar a senha:

```bash
cd E:\neonpro
node test-prisma-supabase.js
```

## 🔧 URLs de conexão atuais:

- **DATABASE_URL (pooler):** `postgresql://postgres.ownkoxryswokcdanrdgj:$SUPABASE_DB_PASSWORD@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require`
- **DIRECT_URL (direto):** `postgresql://postgres.ownkoxryswokcdanrdgj:$SUPABASE_DB_PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require`

## 📊 Status atual:

✅ **Prisma Client:** Gerado com sucesso  
✅ **Dependencies:** Instaladas  
⏳ **Pending:** Configurar senha do banco  
⏳ **Pending:** Testar conexão Prisma → Supabase
