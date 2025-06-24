# 🚀 QUICK OAUTH SETUP - NeonPro

## ⚡ Configuração Rápida em 5 Minutos

### 1️⃣ Supabase - Variáveis de Ambiente
1. Acesse: https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt
2. Vá em **Settings > API**
3. Copie e cole no arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=[Project URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon public]
SUPABASE_SERVICE_ROLE_KEY=[service_role]
```

### 2️⃣ Supabase - URLs de Redirecionamento
1. Vá em **Authentication > URL Configuration**
2. **Site URL**: `https://neonpro.vercel.app`
3. **Redirect URLs** (adicione TODAS):
```
https://neonpro.vercel.app/**
http://localhost:3000/**
https://neonpro-*.vercel.app/**
```

### 3️⃣ Supabase - Ativar Google
1. Vá em **Authentication > Providers > Google**
2. Ative o provider
3. Cole o Client ID e Secret (do passo 4)
4. **IMPORTANTE**: Copie a Callback URL mostrada

### 4️⃣ Google Cloud Console
1. Acesse: https://console.cloud.google.com
2. **OAuth consent screen**:
   - Adicione domínio: `gfkskrkbnawkuppazkpt.supabase.co`
3. **Credentials > Create > OAuth 2.0 Client ID**:
   - Type: Web application
   - **Authorized JavaScript origins**:
     ```
     https://neonpro.vercel.app
     https://gfkskrkbnawkuppazkpt.supabase.co
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     [Cole a Callback URL do Supabase aqui]
     http://localhost:3000/auth/callback
     ```
4. Copie Client ID e Secret → Cole no Supabase (passo 3)

### 5️⃣ Testar Localmente
```bash
npm run dev
# Acesse http://localhost:3000/login
# Clique em "Login com Google"
# Deve redirecionar para /dashboard
```

### 6️⃣ Deploy no Vercel
1. No Vercel Dashboard > Settings > Environment Variables
2. Adicione as mesmas 3 variáveis do `.env.local`
3. Faça redeploy

## ✅ Checklist Final
- [ ] Variáveis no .env.local
- [ ] URLs no Supabase com /**
- [ ] Google Provider ativo no Supabase
- [ ] Google Console configurado
- [ ] Teste local funcionando
- [ ] Variáveis no Vercel
- [ ] Teste produção funcionando

## 🆘 Problemas Comuns
- **404 após login**: Dashboard já foi criada ✅
- **"Invalid redirect"**: Verifique wildcards /**
- **Sessão não persiste**: Verifique variáveis de ambiente

---
📧 Suporte: Check `/docs/oauth-setup-checklist.md` para detalhes completos