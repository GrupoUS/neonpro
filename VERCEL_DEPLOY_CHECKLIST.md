# ✅ VERCEL DEPLOYMENT CHECKLIST - NEONPRO HEALTHCARE

## 🔐 STEP 1: AUTHENTICATION (MANUAL)
- [ ] Execute: `vercel login` em um terminal
- [ ] Complete o login no navegador
- [ ] Verifique com: `vercel whoami`

## 🚀 STEP 2: INITIAL DEPLOYMENT
```bash
cd C:\Users\Mauri\OneDrive\GRUPOUS\VSCODE\neonpro
vercel
```

**Configurações esperadas durante o setup:**
- **Link to existing project:** No (primeira vez)
- **Project name:** neonpro-healthcare
- **Directory:** apps/neonpro-web
- **Framework:** Next.js (auto-detect)
- **Build Command:** prisma generate && next build
- **Output Directory:** .next
- **Development Command:** next dev

## 🔧 STEP 3: ENVIRONMENT VARIABLES
Adicionar no **Vercel Dashboard → Project → Settings → Environment Variables:**

### **Database & Supabase**
```env
DATABASE_URL=postgresql://postgres.ownkoxryswokcdanrdgj:Drwolf00$$@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL=postgresql://postgres.ownkoxryswokcdanrdgj:Drwolf00$$@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

NEXT_PUBLIC_SUPABASE_URL=https://ownkoxryswokcdanrdgj.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDM2MDksImV4cCI6MjA2ODg3OTYwOX0.XFIAUxbnw2dQho1FEU7QBddw1gI7gD3V-ixY98e4t1E

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMwMzYwOSwiZXhwIjoyMDY4ODc5NjA5fQ.FN_lcEIVq0xJ7W2YfIwXoprS9x7WqCRl2Q3Cn-wYfTs
```

### **Authentication (Clerk)**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZmFpci1kYW5lLTk1LmNsZXJrLmFjY291bnRzLmRldiQ

CLERK_SECRET_KEY=sk_test_lj93jhP4QVIuD01pn2YffWBuuEq6Cp8zlxbaUnbvI9
```

### **Environment & Security**
```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
SKIP_ENV_VALIDATION=true
HEALTHCARE_MODE=true
LGPD_COMPLIANCE=true
ANVISA_COMPLIANCE=true
PRISMA_GENERATE_SKIP_AUTOINSTALL=true
NEXTAUTH_SECRET=generate-secure-32-char-string
NEXTAUTH_URL=https://your-vercel-app-url.vercel.app
```

## 🎯 STEP 4: PRODUCTION DEPLOYMENT
```bash
vercel --prod
```

## 🧪 STEP 5: TESTING
```bash
# Health check
curl https://your-app.vercel.app/api/health

# Readiness check  
curl https://your-app.vercel.app/api/ready

# API test
curl https://your-app.vercel.app/api/prisma/patients
```

## 📊 STEP 6: MONITORING
- [ ] Verificar Vercel Analytics
- [ ] Monitorar logs em Functions
- [ ] Testar performance dos endpoints
- [ ] Verificar métricas de database no Supabase

## 🚨 TROUBLESHOOTING COMUM

### **Build Error: Prisma Client Not Found**
- Verifique se `PRISMA_GENERATE_SKIP_AUTOINSTALL=true` está setado
- Confirme build command: `prisma generate && next build`

### **Database Connection Error**
- Verificar DATABASE_URL e DIRECT_URL
- Confirmar que Supabase project não está pausado
- Testar conexão com pooler URL

### **API Routes 404**
- Verificar estrutura de arquivos em `src/app/api/`
- Confirmar que as rotas estão em `route.ts` files

### **RLS Policy Errors**
- Verificar se RLS policies estão deployadas
- Confirmar service role key permissions
- Testar queries no Supabase SQL Editor

## ✅ SUCCESS CRITERIA

Deployment bem-sucedido quando:
- [ ] **Health check:** `/api/health` retorna status 200
- [ ] **Database:** Conexão estabelecida e queries funcionando
- [ ] **Authentication:** Clerk login funcional
- [ ] **APIs:** Endpoints de pacientes acessíveis
- [ ] **Security:** RLS policies bloqueando acesso não autorizado
- [ ] **Performance:** Response times < 500ms
- [ ] **Compliance:** LGPD e ANVISA features operacionais

---

**🎉 Quando todos os critérios estiverem atendidos, seu NeonPro Healthcare estará live no Vercel!**