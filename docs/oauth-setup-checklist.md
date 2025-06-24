# 📋 Checklist de Configuração OAuth - NeonPro

## 🔧 Configurações do Supabase

### 1. Authentication > Settings (URL Configuration)

**Site URL:**
```
https://neonpro.vercel.app
```

**Redirect URLs (adicionar todas):**
```
https://neonpro.vercel.app/auth/callback
https://neonpro.vercel.app/auth/popup-callback
https://neonpro.vercel.app/dashboard
https://neonpro.vercel.app/login
http://localhost:3000/auth/callback
http://localhost:3000/auth/popup-callback
http://localhost:3000/dashboard
http://localhost:3000/login
https://neonpro-*.vercel.app/auth/callback
https://neonpro-*.vercel.app/auth/popup-callback
```

### 2. Authentication > Providers > Google

- **Client ID**: [Inserir Client ID do Google]
- **Client Secret**: [Inserir Client Secret do Google]
- **Enabled**: ✅ Ativado

## 🔐 Configurações do Google Cloud Console

### 1. APIs & Services > OAuth consent screen

**Authorized domains:**
```
gfkskrkbnawkuppazkpt.supabase.co
```

**Scopes (não sensíveis):**
- ✅ email
- ✅ profile
- ✅ openid

### 2. APIs & Services > Credentials

**OAuth 2.0 Client ID (Web application)**

**Authorized JavaScript origins:**
```
https://neonpro.vercel.app
http://localhost:3000
https://gfkskrkbnawkuppazkpt.supabase.co
```

**Authorized redirect URIs:**
```
https://neonpro.vercel.app/auth/callback
https://neonpro.vercel.app/auth/popup-callback
http://localhost:3000/auth/callback
http://localhost:3000/auth/popup-callback
https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback
```

## 🔑 Variáveis de Ambiente

### Desenvolvimento (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://gfkskrkbnawkuppazkpt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Sua chave anônima]
SUPABASE_SERVICE_ROLE_KEY=[Sua chave de serviço]
NEXT_PUBLIC_SITE_URL=https://neonpro.vercel.app
```

### Produção (Vercel Dashboard)
- Adicionar as mesmas variáveis acima no painel da Vercel
- Em Settings > Environment Variables
- Aplicar para Production, Preview e Development

## ✅ Verificação Final

1. **Teste Local**:
   - Execute `npm run dev`
   - Acesse http://localhost:3000/login
   - Clique em "Entrar com Google"
   - Verifique redirecionamento para /dashboard

2. **Teste Produção**:
   - Deploy para Vercel
   - Acesse https://neonpro.vercel.app/login
   - Repita o processo de login
   - Confirme redirecionamento sem erro 404

## 🚨 Troubleshooting

### Erro 404 após login
- ✅ Dashboard page criada em `app/dashboard/page.tsx`
- ✅ Middleware configurado para proteger rotas
- ✅ URLs de redirect incluem /dashboard

### Erro "URI não permitida"
- Verificar se TODAS as URLs estão idênticas no Supabase e Google
- Atenção a HTTP vs HTTPS
- Verificar barras finais nas URLs

### Sessão não persistindo
- Verificar cookies do Supabase (sb-*)
- Confirmar variáveis de ambiente corretas
- Verificar se exchangeCodeForSession está funcionando

## 📝 Notas Importantes

- As credenciais do Google (Client ID e Secret) devem ser configuradas APENAS no Supabase
- Não é necessário adicionar as credenciais Google no .env do Next.js
- O projeto usa Supabase Auth diretamente (não NextAuth.js)
- Cookies HttpOnly são usados para máxima segurança