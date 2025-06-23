# Guia de Correção de Autenticação - NeonPro

## 🔧 Problemas Identificados e Soluções

### 1. Erro do Google OAuth: "exchange_failed: invalid request"

**Problema**: O erro indica que o PKCE (Proof Key for Code Exchange) flow não está configurado corretamente.

**Solução Implementada**:
- Atualizei os arquivos de configuração do Supabase (`client.ts` e `server.ts`)
- Melhorei o handling do callback OAuth (`/app/auth/callback/route.ts`)
- Adicionei logs detalhados para debug

### 2. Link "Criar conta" não funcionando

**Análise**: O link está configurado corretamente no código. O problema pode estar relacionado ao roteamento ou configuração do ambiente.

## 📋 Checklist de Configuração

### No Supabase Dashboard:

1. **Configurar URLs de Autenticação**:
   - Acesse: Authentication → URL Configuration
   - Site URL: `https://seu-dominio.vercel.app` (ou seu domínio)
   - Redirect URLs:
     ```
     https://seu-dominio.vercel.app/auth/callback
     http://localhost:3000/auth/callback
     ```

2. **Habilitar Google OAuth**:
   - Acesse: Authentication → Providers → Google
   - Ative o provider
   - Configure as credenciais do Google Cloud Console:
     - Client ID
     - Client Secret
   - Authorized redirect URIs no Google Console:
     ```
     https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback
     ```

3. **Verificar Email Templates**:
   - Authentication → Email Templates
   - Confirme que os templates estão configurados

### No Vercel/Deploy:

1. **Variáveis de Ambiente**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://gfkskrkbnawkuppazkpt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
   ```

2. **Verificar Build**:
   - Certifique-se que não há erros de build
   - Confirme que o middleware está funcionando

## 🧪 Teste de Funcionalidade

### 1. Testar Login com Email/Senha:
```bash
# Desenvolvimento local
npm run dev
# Acesse http://localhost:3000/login
```

### 2. Testar Google OAuth:
- Clique em "Entrar com Google"
- Deve redirecionar para accounts.google.com
- Após autorizar, deve retornar para /dashboard

### 3. Testar Criação de Conta:
- Acesse /signup
- Preencha o formulário
- Verifique o email de confirmação

## 🛠️ Debug Avançado

### Logs do OAuth Callback:
O callback route agora inclui logs detalhados. Para verificar:

```javascript
// Em /app/auth/callback/route.ts
console.log("=== OAuth Callback Debug Info ===");
console.log("Code present:", !!code);
console.log("Error:", error);
```

### Verificar no Console do Browser:
```javascript
// Teste manual do cliente Supabase
const supabase = createClient();
const { data, error } = await supabase.auth.getUser();
console.log('User:', data, 'Error:', error);
```

## 📱 Configuração Mobile/PWA

Se você estiver tendo problemas em dispositivos móveis:

1. Verifique o manifest.json
2. Confirme que o service worker está registrado
3. Teste em modo incógnito

## 🚨 Erros Comuns e Soluções

### "redirect_uri_mismatch"
- Verifique as URLs no Supabase Dashboard
- Confirme que o domínio está correto

### "User already registered"
- O email já existe no banco
- Use "Esqueceu sua senha?" para recuperar

### "Invalid email"
- Verifique o formato do email
- Confirme que o domínio do email é válido

## 🔄 Próximos Passos

1. **Implementar Rate Limiting**:
   - Adicionar proteção contra múltiplas tentativas

2. **Melhorar Error Handling**:
   - Mensagens de erro mais específicas
   - Tradução completa para PT-BR

3. **Adicionar Autenticação 2FA**:
   - Implementar autenticação de dois fatores

## 📞 Suporte

Se os problemas persistirem:
1. Verifique os logs do Vercel
2. Consulte os logs do Supabase
3. Teste em ambiente local primeiro

---

**Última atualização**: ${new Date().toISOString()}