# 🚀 Guia de Deploy em Produção - NeonPro

## 🎯 Problema Identificado
Erro 404 em produção após login OAuth, mesmo com correções funcionando localmente.

## 📋 Checklist de Configuração para Produção

### 1. ✅ Variáveis de Ambiente no Vercel
Acesse: **Vercel Dashboard > neonpro > Settings > Environment Variables**

Adicione as seguintes variáveis:
```
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-chave-anonima]
```

**⚠️ IMPORTANTE**: Use exatamente os mesmos valores do `.env.local` local.

### 2. 🔧 Configuração do Supabase Dashboard
Acesse: **Supabase Dashboard > Authentication > URL Configuration**

#### Site URL:
```
https://neonpro.vercel.app
```

#### Redirect URLs (adicionar TODAS):
```
https://neonpro.vercel.app/auth/callback
https://neonpro.vercel.app/auth/popup-callback
https://neonpro.vercel.app/auth/auth-code-error
http://localhost:3000/auth/callback
http://localhost:3000/auth/popup-callback
http://localhost:3000/auth/auth-code-error
```

### 3. 🔐 Google Console OAuth Configuration
Acesse: **Google Cloud Console > APIs & Services > Credentials**

#### Authorized redirect URIs (adicionar):
```
https://[seu-projeto].supabase.co/auth/v1/callback
https://neonpro.vercel.app/auth/popup-callback
https://neonpro.vercel.app/auth/callback
```

### 4. 🔄 Redeploy no Vercel
Após configurar as variáveis:
1. Vá para **Vercel Dashboard > neonpro > Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**
4. Aguarde o build completar

## 🧪 Teste de Produção

### Passo a Passo:
1. Acesse: `https://neonpro.vercel.app/login`
2. Clique em "Entrar com Google"
3. Complete a autenticação no popup
4. Verifique se redireciona para `/dashboard`

### 🔍 Debug em Produção:
1. Abra DevTools (F12)
2. Vá para aba **Console**
3. Procure por logs:
   ```
   === Initiating Google OAuth (Popup) ===
   === Popup Callback Received ===
   ✅ OAuth code exchange successful
   ```

## 🚨 Troubleshooting

### Erro 404 Persistente:
1. **Verificar Build**: Confirme se o deploy foi bem-sucedido
2. **Verificar URLs**: Todas as URLs devem usar HTTPS em produção
3. **Verificar Variáveis**: Confirme se as variáveis estão corretas no Vercel
4. **Limpar Cache**: Force refresh (Ctrl+Shift+R) no navegador

### Erro "URI não permitida":
1. Verifique se TODAS as URLs estão configuradas no Supabase
2. Confirme se as URLs do Google Console estão corretas
3. Aguarde alguns minutos para propagação das configurações

### Popup não abre:
1. Verifique se o bloqueador de popup está desabilitado
2. Teste em modo incógnito
3. Verifique console para erros JavaScript

## 📊 Monitoramento

### Logs do Vercel:
1. Acesse **Vercel Dashboard > neonpro > Functions**
2. Clique em `/auth/popup-callback`
3. Verifique logs de execução

### Logs do Supabase:
1. Acesse **Supabase Dashboard > Logs**
2. Filtre por "auth"
3. Procure por erros de OAuth

## ✅ Validação Final

Após seguir todos os passos:
- [ ] Variáveis configuradas no Vercel
- [ ] URLs configuradas no Supabase
- [ ] URLs configuradas no Google Console
- [ ] Redeploy realizado
- [ ] Teste de login funcionando
- [ ] Redirecionamento para dashboard OK
- [ ] Logs sem erros

## 🎯 Próximos Passos

Se o problema persistir:
1. Verificar logs específicos do Vercel
2. Testar com diferentes navegadores
3. Verificar se há problemas de DNS/CDN
4. Considerar usar callback tradicional em vez de popup

---

**Status**: 🔄 Aguardando configuração em produção  
**Última atualização**: 2025-01-07
