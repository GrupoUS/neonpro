# ⚙️ Configurações Obrigatórias no Dashboard do Supabase

## 🎯 Configurações Críticas

### 1. URL Configuration (Authentication > Settings > URL Configuration)

**📍 Site URL (SITE_URL)**
```
Desenvolvimento: http://localhost:5173
Produção: https://neonpro.vercel.app
```

**📍 Additional Redirect URLs**
```
# Desenvolvimento
http://localhost:5173/dashboard
http://localhost:5173/auth/callback
http://localhost:5173/auth/confirm

# Produção
https://neonpro.vercel.app/dashboard
https://neonpro.vercel.app/auth/callback
https://neonpro.vercel.app/auth/confirm

# Preview deployments (opcional)
https://neonpro-*.vercel.app/dashboard
https://neonpro-*.vercel.app/auth/callback
https://neonpro-*.vercel.app/auth/confirm
```

### 2. Email Templates (Authentication > Email Templates)

**📧 Confirm Signup Template**
```html
<h2>Confirme seu email</h2>
<p>Clique no link abaixo para confirmar sua conta:</p>
<p><a href="{{ .RedirectTo }}">Confirmar Email</a></p>
```

**🔑 Reset Password Template**
```html
<h2>Redefinir senha</h2>
<p>Clique no link abaixo para redefinir sua senha:</p>
<p><a href="{{ .RedirectTo }}">Redefinir Senha</a></p>
```

**⚠️ IMPORTANTE:** Use `{{ .RedirectTo }}` ao invés de `{{ .SiteURL }}` nos templates!

### 3. Provider Configuration (se usar OAuth)

**🔍 Google OAuth (Authentication > Providers > Google)**
```yaml
Enabled: true
Client ID: [seu-google-client-id]
Client Secret: [seu-google-client-secret]
Authorized JavaScript origins: 
  - http://localhost:5173
  - https://neonpro.vercel.app
Authorized redirect URIs:
  - http://localhost:5173/auth/callback
  - https://neonpro.vercel.app/auth/callback
```

## 🛠️ Passos de Configuração

### Passo 1: Acessar Dashboard Supabase
1. Vá para https://supabase.com/dashboard
2. Selecione o projeto "NeonPro Brasil"
3. Navegue para Authentication > Settings

### Passo 2: Configurar URLs
1. Em "URL Configuration":
   - Defina Site URL: `https://neonpro.vercel.app`
   - Adicione todas as Additional Redirect URLs listadas acima
2. Clique em "Save"

### Passo 3: Configurar Email Templates
1. Vá para Authentication > Email Templates
2. Edite "Confirm signup" e "Reset password"
3. Use `{{ .RedirectTo }}` nos links dos templates
4. Salve as alterações

### Passo 4: Configurar Providers (opcional)
1. Vá para Authentication > Providers
2. Configure Google OAuth se necessário
3. Adicione as URLs autorizadas corretas

## 🧪 Como Testar

### Teste Local (http://localhost:5173)
```bash
# 1. Start development server
cd apps/web
npm run dev

# 2. Teste signup com email
# 3. Verifique se email de confirmação redireciona para localhost
# 4. Teste login e verificar redirecionamento para /dashboard
```

### Teste Produção (https://neonpro.vercel.app)
```bash
# 1. Deploy para Vercel
# 2. Teste mesmo fluxo em produção
# 3. Verificar se redirecionamentos funcionam corretamente
```

## ❌ Problemas Comuns

### 🔴 "Invalid redirect URL"
- **Causa**: URL não está na lista de Additional Redirect URLs
- **Solução**: Adicionar URL exata na configuração do Supabase

### 🔴 Redirect para localhost em produção
- **Causa**: Site URL ainda está como localhost
- **Solução**: Alterar Site URL para URL de produção

### 🔴 Email templates com URLs erradas
- **Causa**: Templates usando `{{ .SiteURL }}` ao invés de `{{ .RedirectTo }}`
- **Solução**: Atualizar templates para usar `{{ .RedirectTo }}`

### 🔴 OAuth providers não funcionam
- **Causa**: URLs não autorizadas no provider (Google, etc.)
- **Solução**: Adicionar URLs corretas na configuração do provider

## 📋 Checklist Final

- [ ] Site URL configurado para produção
- [ ] Additional Redirect URLs adicionadas (dev + prod)
- [ ] Email templates atualizados com `{{ .RedirectTo }}`
- [ ] OAuth providers configurados (se aplicável)
- [ ] Testado fluxo completo em desenvolvimento
- [ ] Testado fluxo completo em produção
- [ ] Rotas `/auth/callback` e `/auth/confirm` criadas
- [ ] Hook `useAuth` implementado
- [ ] Dashboard protegido com redirecionamento

---

**⚡ Quick Links:**
- [Supabase Dashboard](https://supabase.com/dashboard/project/ownkoxryswokcdanrdgj)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Documentação de Auth](../features/supabase-auth-dashboard-redirect-setup.md)