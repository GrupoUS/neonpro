# Configuração Supabase CLI - Pós Migração

## 📋 Status da Migração

✅ **Estrutura migrada com sucesso para:**
- `infrastructure/database/config/config.toml`
- `infrastructure/database/migrations/` (101 arquivos)
- `infrastructure/functions/` (3 Edge Functions)

## 🛠️ Configuração do Supabase CLI

### 1. Instalação do Supabase CLI

```bash
# Windows (via npm)
npm install -g supabase

# ou via scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Configuração para Nova Estrutura

O Supabase CLI precisa ser configurado para usar a nova estrutura. Crie um link simbólico:

```bash
# PowerShell (como administrador)
New-Item -ItemType SymbolicLink -Path "E:\neonpro\supabase" -Target "E:\neonpro\infrastructure\database\config"
```

### 3. Comandos Essenciais

```bash
# Verificar status
supabase status

# Iniciar ambiente local
supabase start

# Parar ambiente local
supabase stop

# Aplicar migrations
supabase db push

# Reset database
supabase db reset

# Deploy functions
supabase functions deploy
```

### 4. Configuração de Environment Variables

Certifique-se de que as seguintes variáveis estão configuradas:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Estrutura de Paths Atualizada

```
infrastructure/
├── database/
│   ├── config/
│   │   ├── config.toml       # Configuração principal
│   │   └── .gitignore
│   └── migrations/           # 101 migrations consolidadas
└── functions/                # 3 Edge Functions
    ├── stock-alerts-processor/
    ├── stock-reports-generator/
    └── subscription-billing-processor/
```

## ⚠️ Comandos Atualizados

Todos os scripts foram atualizados para usar os novos paths:
- ✅ `scripts/verify-oauth-config.js`
- ✅ `infrastructure/scripts/verify-oauth-config.js`
- ✅ `scripts/apply-migration.js`
- ✅ `infrastructure/scripts/apply-migration.js`
- ✅ `turbo/generators/config.ts`
- ✅ `scripts/compliance-validator.js`

## 🔄 Próximos Passos

1. Instalar Supabase CLI
2. Criar link simbólico para compatibilidade
3. Testar comandos básicos
4. Verificar deploy das Edge Functions
5. Validar migrations