# 🚨 GUIA DEFINITIVO: CORRIGIR ERRO "no_code" NO GOOGLE OAUTH

**Última atualização**: 2025-01-22
**Status**: Solução validada através de deep research

## 🎯 PROBLEMA IDENTIFICADO

O erro `no_code` ocorre quando o Google não retorna o parâmetro `code` na URL de callback após a autenticação. Isso é **SEMPRE** causado por configuração incorreta de URLs.

## ✅ CHECKLIST DE CORREÇÃO (SIGA NA ORDEM)

### 1️⃣ **Google Cloud Console Configuration**

Acesse: https://console.cloud.google.com/apis/credentials

#### **OAuth 2.0 Client ID Settings:**

```
Authorized JavaScript origins:
✅ https://seu-projeto-neonpro.vercel.app
✅ https://www.seu-projeto-neonpro.vercel.app (se usar www)
✅ http://localhost:3000
✅ http://127.0.0.1:3000

Authorized redirect URIs (COPIE EXATAMENTE):
✅ https://seu-projeto-neonpro.vercel.app/auth/callback
✅ https://www.seu-projeto-neonpro.vercel.app/auth/callback
✅ http://localhost:3000/auth/callback
✅ http://127.0.0.1:3000/auth/callback
✅ https://gfkskrkbnawkuppazkpt.supabase.co/auth/v1/callback
```

**⚠️ IMPORTANTE**:

- As URLs devem ser EXATAMENTE iguais (protocolo, domínio, porta, path)
- Inclua versões com e sem www se aplicável
- Salve e aguarde 5 minutos para propagar

### 2️⃣ **Supabase Dashboard Configuration**

Acesse: https://supabase.com/dashboard/project/gfkskrkbnawkuppazkpt/auth/url-configuration

#### **Authentication → URL Configuration:**

```
Site URL:
✅ https://seu-projeto-neonpro.vercel.app

Redirect URLs (use wildcards):
✅ https://seu-projeto-neonpro.vercel.app/**
✅ https://www.seu-projeto-neonpro.vercel.app/**
✅ http://localhost:3000/**
✅ http://127.0.0.1:3000/**
✅ https://*.vercel.app/**
```

#### **Authentication → Providers → Google:**

```
Enabled: ✅ ON
Client ID: [seu-google-client-id]
Client Secret: [seu-google-client-secret]
```

### 3️⃣ **Vercel Environment Variables**

No dashboard do Vercel: https://vercel.com/dashboard

```env
NEXT_PUBLIC_SUPABASE_URL=https://gfkskrkbnawkuppazkpt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Configuração:**

- ✅ Production
- ✅ Preview
- ✅ Development

### 4️⃣ **Testar Login Localmente Primeiro**

```bash
# No terminal do projeto
cd @saas-projects/neonpro
pnpm run dev

# Abra http://localhost:3000/login
# Teste o login com Google
# Verifique os logs do console
```

### 5️⃣ **Deploy e Teste em Produção**

```bash
# Fazer deploy
git add .
git commit -m "fix: Google OAuth callback with detailed error handling"
git push

# No Vercel, aguarde o deploy completar
# Teste em: https://seu-projeto-neonpro.vercel.app/login
```

## 🔍 TROUBLESHOOTING

### Se ainda receber erro "no_code":

1. **Verifique os logs do browser (F12 → Console)**

   - Procure por mensagens de erro específicas
   - Veja a URL completa do callback

2. **Verifique os logs do Vercel**

   ```bash
   vercel logs --follow
   ```

3. **Debug URLs**

   - Copie a URL exata do erro
   - Compare com as URLs configuradas no Google Console
   - Verifique diferenças de protocolo (http vs https)

4. **Teste com curl**
   ```bash
   # Teste se o callback está acessível
   curl -I https://seu-projeto-neonpro.vercel.app/auth/callback
   ```

### Erros Comuns e Soluções:

| Erro                    | Causa                    | Solução                               |
| ----------------------- | ------------------------ | ------------------------------------- |
| `redirect_uri_mismatch` | URLs não correspondem    | Verifique Google Console vs aplicação |
| `no_code`               | Google não enviou código | Configurar redirect URIs corretamente |
| `invalid_grant`         | Código expirado          | Tentar login novamente                |
| `access_denied`         | Usuário cancelou         | Normal - usuário negou permissão      |

## 📝 NOTAS IMPORTANTES

1. **Tempo de Propagação**: Mudanças no Google Console podem levar até 5 minutos
2. **Cache do Browser**: Use aba anônima para testar
3. **Múltiplos Ambientes**: Configure URLs para todos os ambientes (dev, staging, prod)
4. **HTTPS Obrigatório**: Em produção, sempre use HTTPS

## 🚀 VALIDAÇÃO FINAL

Após implementar todas as correções:

1. ✅ Login funciona localmente
2. ✅ Login funciona em produção
3. ✅ Nenhum erro no console
4. ✅ Usuário é redirecionado para /dashboard após login
5. ✅ Session é criada corretamente

## 📞 SUPORTE

Se o problema persistir após seguir todos os passos:

1. Verifique a documentação oficial:

   - [Supabase Google Auth](https://supabase.com/docs/guides/auth/social-login/auth-google)
   - [Google OAuth Setup](https://console.cloud.google.com/apis/credentials)

2. Colete estas informações para debug:
   - Screenshot do erro
   - URL completa do callback com erro
   - Logs do console do browser
   - Logs do servidor (Vercel)

---

**Última verificação**: O callback route foi atualizado com tratamento robusto de erros e logs detalhados para facilitar o debug.
