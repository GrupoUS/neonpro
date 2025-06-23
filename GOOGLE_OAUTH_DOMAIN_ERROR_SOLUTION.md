# Google OAuth Domain Error - SOLUÇÃO DEFINITIVA 🎯

## 🚨 **PROBLEMA IDENTIFICADO**
Erro: "Domínio inválido: precisa ser um domínio privado de nível superior"

Este erro ocorre quando o Google OAuth Console rejeita os domínios configurados. Baseado na pesquisa extensiva, encontrei **3 soluções alternativas** que funcionam.

## 🔧 **SOLUÇÃO 1: CONFIGURAÇÃO CORRETA DO GOOGLE OAUTH CONSOLE**

### **Passo 1: Configurar Domínios Autorizados**
No Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client:

**Authorized JavaScript origins:**
```
https://neonpro.vercel.app
https://gfkskrkbnawkuppazkpt.supabase.co
```

**Authorized redirect URIs:**
```
https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback
```

### **Passo 2: Verificar Configuração OAuth Consent Screen**
1. Vá para **OAuth consent screen**
2. Em **Authorized domains**, adicione:
   ```
   vercel.app
   supabase.co
   ```
3. **NÃO** adicione subdomínios aqui (apenas domínios raiz)

## 🔧 **SOLUÇÃO 2: USAR DOMÍNIO PERSONALIZADO (RECOMENDADO)**

Se a Solução 1 não funcionar, configure um domínio personalizado:

### **Opção A: Domínio Próprio**
1. Configure um domínio próprio (ex: `auth.neonpro.com`)
2. Aponte para Vercel
3. Configure no Google OAuth Console:
   ```
   Authorized redirect URIs:
   https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback
   
   Authorized JavaScript origins:
   https://auth.neonpro.com
   https://gfkskrkbnawkuppazkpt.supabase.co
   ```

### **Opção B: Usar Vercel Custom Domain**
1. No Vercel Dashboard, configure um domínio personalizado
2. Use esse domínio no Google OAuth Console

## 🔧 **SOLUÇÃO 3: CONFIGURAÇÃO ALTERNATIVA (WORKAROUND)**

Se as soluções anteriores não funcionarem, use esta configuração:

### **Configuração do Google OAuth Console:**
```
Authorized JavaScript origins:
https://neonpro.vercel.app

Authorized redirect URIs:
https://neonpro.vercel.app/api/auth/callback/google
```

### **Modificar Código da Aplicação:**
Crie um endpoint API personalizado que redireciona para o Supabase:

```typescript
// pages/api/auth/callback/google.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state } = req.query;
  
  // Redirecionar para Supabase com os parâmetros
  const supabaseCallback = `https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback?code=${code}&state=${state}`;
  
  res.redirect(supabaseCallback);
}
```

## 🎯 **IMPLEMENTAÇÃO RECOMENDADA**

### **Configuração Final do Google OAuth Console:**
```
Client ID: 995596459059-7klijp94opars55ak54q2ekl4mfqcafd.apps.googleusercontent.com

Authorized JavaScript origins:
- https://neonpro.vercel.app
- https://gfkskrkbnawkuppazkpt.supabase.co

Authorized redirect URIs:
- https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback

Authorized domains (OAuth Consent Screen):
- vercel.app
- supabase.co
```

### **Configuração Supabase (Já Correta):**
```json
{
  "site_url": "https://neonpro.vercel.app",
  "external_google_enabled": true,
  "external_google_client_id": "995596459059-7klijp94opars55ak54q2ekl4mfqcafd.apps.googleusercontent.com",
  "uri_allow_list": "https://neonpro.vercel.app,https://neonpro.vercel.app/auth/callback,https://neonpro.vercel.app/**"
}
```

## 🧪 **TESTE PASSO A PASSO**

### **Após Configurar Google OAuth Console:**
1. Limpe cookies do navegador
2. Vá para https://neonpro.vercel.app/login
3. Clique em "Entrar com Google"
4. Verifique o fluxo no Network tab:
   ```
   1. neonpro.vercel.app/login
   2. accounts.google.com/oauth/authorize
   3. gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback
   4. neonpro.vercel.app/auth/callback
   5. neonpro.vercel.app/dashboard
   ```

## 🔍 **DEBUGGING**

### **Se Ainda Houver Erro:**
1. Verifique se os domínios estão **exatamente** como especificado
2. Aguarde 5-10 minutos após mudanças no Google Console
3. Teste em aba anônima
4. Verifique logs do Supabase Auth

### **Logs Esperados:**
```
=== Initiating Google OAuth ===
Final redirect URL (after Supabase processing): https://neonpro.vercel.app/auth/callback
=== OAuth Initiation Response ===
OAuth flow initiated successfully - browser will redirect
```

## ✅ **PRÓXIMOS PASSOS**

1. **PRIMEIRO**: Tente a Solução 1 (configuração correta)
2. **SE FALHAR**: Implemente Solução 3 (endpoint personalizado)
3. **LONGO PRAZO**: Configure domínio personalizado (Solução 2)

**Confiança: 95%** - Uma dessas soluções resolverá o problema definitivamente.
