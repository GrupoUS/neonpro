# 🚀 NEONPRO - Configuração de Variáveis de Ambiente para Produção

## ⚠️ CONFIGURAÇÕES CRÍTICAS PARA VERCEL

### **🔧 VARIÁVEIS DE SISTEMA (Obrigatórias)**
```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_APP_URL=https://neonpro.vercel.app
NEXT_PUBLIC_API_URL=https://neonpro.vercel.app/api
```

### **🤖 AI SERVICES (Funcionais)**
```bash
# OpenAI - Chave válida
OPENAI_API_KEY=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

# Anthropic Claude - Chave válida
ANTHROPIC_API_KEY=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

# Google AI - Chave válida
GOOGLE_API_KEY=AIzaSyB-lsKyf_xYMX4bAERrOTgDBTgcQ9cf7OI
```

### **📦 DATABASE - SUPABASE (CRÍTICO - ATUALIZAR)**
```bash
# ⚠️ ATENÇÃO: Substituir por valores reais do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[SEU_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUA_ANON_KEY_REAL]
SUPABASE_SERVICE_ROLE_KEY=[SUA_SERVICE_ROLE_KEY_REAL]
DATABASE_URL=postgresql://postgres:[SUA_PASSWORD]@db.[SEU_PROJECT_ID].supabase.co:5432/postgres
```

### **🔍 SEARCH SERVICES (Funcionais)**
```bash
TAVILY_API_KEY=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
EXA_API_KEY=fae6582d-4562-45be-8ce9-f6c0c3518c66
```

### **🔐 SECURITY & AUTH (GERAR NOVOS)**
```bash
# ⚠️ GERAR NOVO JWT SECRET PARA PRODUÇÃO
JWT_SECRET=[GERAR_NOVO_SECRET_256_BITS]
RATE_LIMIT_REQUESTS_PER_MINUTE=60

# Configurações de segurança adicionais
ALLOWED_ORIGINS=https://neonpro.vercel.app
CORS_CREDENTIALS=true
```

### **🎨 EXTERNAL SERVICES (Opcionais)**
```bash
GITHUB_TOKEN=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
FIGMA_API_KEY=figd_your_actual_token_here
```

### **💳 PAYMENT - STRIPE (Configurar se necessário)**
```bash
STRIPE_PUBLISHABLE_KEY=pk_live_[SUA_CHAVE_LIVE]
STRIPE_SECRET_KEY=sk_live_[SUA_CHAVE_LIVE]
STRIPE_WEBHOOK_SECRET=whsec_[SEU_WEBHOOK_SECRET]
```

### **📊 MONITORING & OBSERVABILITY**
```bash
# OpenTelemetry (Opcional - pode manter desabilitado inicialmente)
JAEGER_ENDPOINT=https://your-jaeger-instance.com/api/traces
OTEL_SERVICE_NAME=neonpro-production
OTEL_SERVICE_VERSION=1.0.0
PERFORMANCE_MONITORING_ENABLED=true
METRICS_COLLECTION_ENABLED=true
```

## 🎯 CONFIGURAÇÕES ESPECÍFICAS DO VERCEL

### **1. Environment Variables Settings**
- **Environment**: Production
- **Git Branch**: main
- **Automatically expose System Environment Variables**: ✅ Enabled

### **2. Build & Development Settings**
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install --legacy-peer-deps` ⚠️ **IMPORTANTE**
- **Development Command**: `npm run dev`

### **3. Functions Configuration**
- **Node.js Version**: 20.x (via engines in package.json)
- **Serverless Function Timeout**: 30s (para APIs AI)
- **Memory**: 1024 MB (padrão)
- **Region**: Washington, D.C. (iad1) - configurado no vercel.json

### **4. Domain Configuration**
- **Production Domain**: neonpro.vercel.app (automático)
- **Custom Domain**: [configurar se necessário]
- **SSL**: Automático via Vercel

## ⚠️ AÇÕES OBRIGATÓRIAS ANTES DO DEPLOY

### **🔴 CRÍTICO - Supabase Setup**
1. **Criar projeto Supabase** (se não existir)
2. **Obter URLs e chaves reais**:
   - Project URL: `https://[project-id].supabase.co`
   - Anon Key: Da seção API Settings
   - Service Role Key: Da seção API Settings
3. **Configurar Database URL** com credenciais reais
4. **Configurar RLS policies** para segurança

### **🟡 IMPORTANTE - Security**
1. **Gerar JWT Secret novo** (256 bits):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. **Configurar CORS** para domínio de produção
3. **Revisar rate limiting** para produção

### **🟢 OPCIONAL - Monitoring**
1. **Configurar Sentry** para error tracking
2. **Setup Analytics** (Google Analytics, etc.)
3. **Configurar alertas** de performance

## 🚨 PROBLEMAS POTENCIAIS E SOLUÇÕES

### **1. Database Connection Issues**
- **Problema**: Supabase connection timeout
- **Solução**: Verificar DATABASE_URL e configurar connection pooling
- **Prevenção**: Testar conexão antes do deploy

### **2. API Timeout Issues**
- **Problema**: APIs AI excedem 10s (limite padrão)
- **Solução**: Configurado 30s timeout no vercel.json
- **Monitoramento**: Verificar logs de performance

### **3. CORS Issues**
- **Problema**: Frontend não consegue acessar APIs
- **Solução**: Configurado CORS específico no vercel.json
- **Verificação**: Testar chamadas API do frontend

### **4. Environment Variables**
- **Problema**: Variáveis não carregam corretamente
- **Solução**: Verificar nomes exatos e valores
- **Debug**: Usar console.log para verificar carregamento

## ✅ CHECKLIST DE VALIDAÇÃO PÓS-DEPLOY

- [ ] **Build Success**: Logs sem erros críticos
- [ ] **APIs Funcionando**: Testar `/api/health`
- [ ] **Database Connected**: Verificar conexão Supabase
- [ ] **AI Services**: Testar endpoints AI
- [ ] **Authentication**: Verificar login/logout
- [ ] **Security Headers**: Verificar com security scanner
- [ ] **Performance**: Verificar Core Web Vitals
- [ ] **Error Monitoring**: Configurar alertas

---

## 🎯 RESUMO EXECUTIVO

### **✅ Configurações Prontas**
- vercel.json otimizado
- package.json com engines
- Headers de segurança
- Timeout para APIs AI

### **⚠️ Ações Necessárias**
1. **Configurar Supabase** com valores reais
2. **Gerar JWT Secret** novo para produção
3. **Configurar variáveis** no Vercel Dashboard
4. **Testar deploy** em ambiente staging primeiro

### **🎯 Resultado Esperado**
**Deploy 100% funcional com todas as APIs operacionais**