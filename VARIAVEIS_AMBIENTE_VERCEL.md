# 🔑 LISTA COMPLETA DE VARIÁVEIS DE AMBIENTE - VERCEL

**Projeto**: NEONPRO  
**Data**: 2025-06-19  
**Status**: Configuração Obrigatória para Deploy  

## 📋 CONFIGURAÇÃO NO VERCEL DASHBOARD

**Localização**: https://vercel.com/dashboard → neonpro → Settings → Environment Variables  
**Aplicar para**: Production, Preview, Development  

---

## 🚨 VARIÁVEIS OBRIGATÓRIAS (CRÍTICAS)

### **🔧 CORE CONFIGURATION**
```bash
# Ambiente de produção
NODE_ENV=production

# Desabilitar telemetria do Next.js
NEXT_TELEMETRY_DISABLED=1
```

### **🤖 AI SERVICES (OBRIGATÓRIAS)**
```bash
# OpenAI API para funcionalidades de IA
OPENAI_API_KEY=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
# Descrição: Chave da API OpenAI para recomendações de tratamentos
# Propósito: Funcionalidades de IA do dashboard

# Anthropic API (Claude) para IA avançada
ANTHROPIC_API_KEY=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
# Descrição: Chave da API Anthropic para processamento avançado
# Propósito: Análises complexas e recomendações personalizadas
```

### **🗄️ DATABASE (OBRIGATÓRIAS - ATUALIZAR COM VALORES REAIS)**
```bash
# URL principal do Supabase (PÚBLICO)
NEXT_PUBLIC_SUPABASE_URL=https://your_project_id.supabase.co
# Descrição: URL pública do projeto Supabase
# Propósito: Conexão client-side com banco de dados
# ⚠️ ATUALIZAR: Substituir por URL real do projeto

# Chave anônima do Supabase (PÚBLICO)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
# Descrição: Chave pública para acesso anônimo
# Propósito: Autenticação e queries públicas
# ⚠️ ATUALIZAR: Substituir por chave real do projeto

# Chave de serviço do Supabase (PRIVADO)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
# Descrição: Chave privada com privilégios administrativos
# Propósito: Operações server-side e admin
# ⚠️ ATUALIZAR: Substituir por chave real do projeto

# URL de conexão direta com PostgreSQL
DATABASE_URL=postgresql://postgres:password@db.your_project_id.supabase.co:5432/postgres
# Descrição: String de conexão direta com banco PostgreSQL
# Propósito: Queries diretas e migrações
# ⚠️ ATUALIZAR: Substituir por URL real do banco
```

### **🌐 APPLICATION URLS (OBRIGATÓRIAS)**
```bash
# URL principal da aplicação
NEXT_PUBLIC_APP_URL=https://neonpro.vercel.app
# Descrição: URL base da aplicação em produção
# Propósito: Redirects, callbacks, links absolutos

# URL base da API
NEXT_PUBLIC_API_URL=https://neonpro.vercel.app/api
# Descrição: URL base para chamadas de API
# Propósito: Requests client-side para APIs
```

---

## 🔍 VARIÁVEIS OPCIONAIS (RECOMENDADAS)

### **🔍 SEARCH SERVICES**
```bash
# Tavily API para pesquisas avançadas
TAVILY_API_KEY=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
# Descrição: API de pesquisa e análise de conteúdo
# Propósito: Funcionalidades de busca avançada
# Status: OPCIONAL - Remove funcionalidades de pesquisa se ausente

# Exa API para análise de dados
EXA_API_KEY=fae6582d-4562-45be-8ce9-f6c0c3518c66
# Descrição: API para análise e processamento de dados
# Propósito: Analytics e insights avançados
# Status: OPCIONAL - Analytics limitados se ausente
```

### **🔐 EXTERNAL SERVICES**
```bash
# Google API para serviços Google
GOOGLE_API_KEY=AIzaSyB-lsKyf_xYMX4bAERrOTgDBTgcQ9cf7OI
# Descrição: Chave para APIs do Google (Maps, etc.)
# Propósito: Integração com serviços Google
# Status: OPCIONAL - Funcionalidades Google desabilitadas se ausente

# GitHub Token para integrações
GITHUB_TOKEN=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
# Descrição: Token de acesso pessoal do GitHub
# Propósito: Integrações com repositórios e CI/CD
# Status: OPCIONAL - Funcionalidades GitHub desabilitadas se ausente

# Figma API para design
FIGMA_API_KEY=figd_your_actual_token_here
# Descrição: Token de acesso à API do Figma
# Propósito: Integração com designs e protótipos
# Status: OPCIONAL - Funcionalidades de design desabilitadas se ausente
```

### **💳 PAYMENT SERVICES**
```bash
# Stripe - Chave pública (PÚBLICO)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
# Descrição: Chave pública do Stripe para frontend
# Propósito: Processamento de pagamentos client-side
# Status: OPCIONAL - Pagamentos desabilitados se ausente

# Stripe - Chave secreta (PRIVADO)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
# Descrição: Chave secreta do Stripe para backend
# Propósito: Processamento seguro de pagamentos
# Status: OPCIONAL - Pagamentos desabilitados se ausente

# Stripe - Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
# Descrição: Secret para validação de webhooks do Stripe
# Propósito: Segurança em callbacks de pagamento
# Status: OPCIONAL - Webhooks desabilitados se ausente
```

### **🔒 SECURITY**
```bash
# JWT Secret para autenticação
JWT_SECRET=your_jwt_secret_here_generate_a_secure_random_string
# Descrição: Chave secreta para assinatura de tokens JWT
# Propósito: Segurança de autenticação e sessões
# Status: OPCIONAL - Fallback para Supabase auth se ausente
# ⚠️ GERAR: String aleatória segura de 32+ caracteres
```

---

## 📊 PRIORIZAÇÃO DE CONFIGURAÇÃO

### **🚨 PRIORIDADE CRÍTICA (DEPLOY FALHARÁ SEM ESTAS)**
1. `NODE_ENV=production`
2. `NEXT_TELEMETRY_DISABLED=1`
3. `OPENAI_API_KEY` (para funcionalidades de IA)
4. `NEXT_PUBLIC_APP_URL`
5. `NEXT_PUBLIC_API_URL`

### **⚠️ PRIORIDADE ALTA (FUNCIONALIDADES LIMITADAS SEM ESTAS)**
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `DATABASE_URL`
5. `ANTHROPIC_API_KEY`

### **💡 PRIORIDADE MÉDIA (FUNCIONALIDADES OPCIONAIS)**
1. `TAVILY_API_KEY`
2. `EXA_API_KEY`
3. `GOOGLE_API_KEY`
4. `JWT_SECRET`

### **🔧 PRIORIDADE BAIXA (INTEGRAÇÕES ESPECÍFICAS)**
1. `GITHUB_TOKEN`
2. `FIGMA_API_KEY`
3. `STRIPE_*` (todas as variáveis Stripe)

---

## 🎯 INSTRUÇÕES DE CONFIGURAÇÃO

### **1. Acessar Vercel Dashboard**
```
1. Ir para https://vercel.com/dashboard
2. Selecionar projeto "neonpro"
3. Ir para Settings → Environment Variables
```

### **2. Adicionar Variáveis**
```
1. Clicar "Add New"
2. Inserir Name e Value
3. Selecionar Environments: Production, Preview, Development
4. Clicar "Save"
```

### **3. Ordem de Configuração Recomendada**
```
1. Configurar CRÍTICAS primeiro
2. Configurar ALTAS em seguida
3. Configurar MÉDIAS se necessário
4. Configurar BAIXAS por último
```

### **4. Validação**
```
1. Após configurar, fazer redeploy
2. Verificar logs de build
3. Testar funcionalidades
4. Confirmar que não há erros de variáveis ausentes
```

---

## ⚠️ NOTAS IMPORTANTES

- **Supabase**: URLs e chaves devem ser atualizadas com valores reais do projeto
- **Segurança**: Nunca expor chaves privadas em código client-side
- **Ambiente**: Usar valores diferentes para Development/Preview/Production
- **Backup**: Manter backup seguro de todas as chaves
- **Rotação**: Rotacionar chaves periodicamente por segurança

**Status**: ✅ Lista completa fornecida - Pronto para configuração no Vercel
