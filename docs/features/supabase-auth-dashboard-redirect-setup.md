# Configuração de Dashboard e Redirecionamento do Login - Vercel e Supabase Auth

## 📋 Resumo Executivo

Este guia documenta a configuração correta do dashboard e redirecionamento do login no Vercel com Supabase Auth para o projeto NeonPro, garantindo que os usuários sejam direcionados corretamente após autenticação.

## 🔍 Análise Atual do Projeto

### Estado Atual
- **Projeto Supabase**: NeonPro Brasil (ID: `ownkoxryswokcdanrdgj`)
- **URL Supabase**: `https://ownkoxryswokcdanrdgj.supabase.co`
- **Região**: sa-east-1 (São Paulo)
- **Framework**: TanStack Router + Vite + React 19
- **Hosting**: Vercel (região gru1)

### Configurações Atuais
- Vercel configurado para região `gru1` (São Paulo)
- Dashboard implementado em `/dashboard`
- Cliente Supabase configurado com persistência de sessão
- Rewrite rule para SPA funcionando

## 🎯 Configurações Necessárias

### 1. Configurações do Supabase Dashboard

#### URL Configuration (Authentication > Settings > URL Configuration)

```yaml
Site URL (SITE_URL):
  production: "https://neonpro.vercel.app"
  staging: "https://neonpro-staging.vercel.app" 
  development: "http://localhost:5173"

Additional Redirect URLs:
  # Produção
  - "https://neonpro.vercel.app/dashboard"
  - "https://neonpro.vercel.app/auth/callback"
  - "https://neonpro.vercel.app/auth/confirm"
  
  # Staging/Preview
  - "https://neonpro-staging.vercel.app/dashboard"
  - "https://neonpro-staging.vercel.app/auth/callback"
  - "https://neonpro-staging.vercel.app/auth/confirm"
  
  # Desenvolvimento
  - "http://localhost:5173/dashboard"
  - "http://localhost:5173/auth/callback"
  - "http://localhost:5173/auth/confirm"
```

#### ⚠️ Pontos Críticos para URLs
1. **URLs devem ser EXATAS** - incluindo trailing slashes quando necessário
2. **HTTPS obrigatório** para produção
3. **Verificar protocolo** (http vs https)
4. **Case sensitive** - maiúsculas/minúsculas importam

### 2. Implementação de Auth Callback Route

#### Criar `/auth/callback` Route
```typescript
// apps/web/src/routes/auth/callback.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { useEffect } from 'react'

function AuthCallbackComponent() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          window.location.href = '/login?error=auth_callback_failed'
          return
        }

        if (data.session) {
          console.log('Auth callback successful, redirecting to dashboard')
          window.location.href = '/dashboard'
        } else {
          console.log('No session found, redirecting to login')
          window.location.href = '/login'
        }
      } catch (error) {
        console.error('Auth callback exception:', error)
        window.location.href = '/login?error=auth_exception'
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Processando autenticação...</p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackComponent,
})
```

#### Criar `/auth/confirm` Route (para confirmação de email)
```typescript
// apps/web/src/routes/auth/confirm.tsx
import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { useEffect, useState } from 'react'

function AuthConfirmComponent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error || !data.session) {
          setStatus('error')
          setTimeout(() => {
            window.location.href = '/login?message=confirmation_failed'
          }, 3000)
          return
        }

        setStatus('success')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } catch (error) {
        console.error('Email confirmation error:', error)
        setStatus('error')
        setTimeout(() => {
          window.location.href = '/login?error=confirmation_exception'
        }, 3000)
      }
    }

    handleEmailConfirmation()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Confirmando email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-green-600">Email confirmado com sucesso! Redirecionando...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm text-red-600">Erro na confirmação. Redirecionando...</p>
          </>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/auth/confirm')({
  component: AuthConfirmComponent,
})
```

### 3. Configuração do Cliente Supabase

#### Melhorar configuração do cliente para redirects
```typescript
// apps/web/src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://ownkoxryswokcdanrdgj.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93bmtveHJ5c3dva2NkYW5yZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDM2MDksImV4cCI6MjA2ODg3OTYwOX0.XFIAUxbnw2dQho1FEU7QBddw1gI7gD3V-ixY98e4t1E';

// Get the base URL for redirects
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback for SSR
  if (process.env.NODE_ENV === 'production') {
    return 'https://neonpro.vercel.app';
  }
  
  return 'http://localhost:5173';
};

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined'
        ? globalThis.localStorage
        : undefined,
      persistSession: true,
      autoRefreshToken: true,
      // Configuração de redirecionamento
      redirectTo: `${getBaseUrl()}/auth/callback`,
    },
  },
);

// Helper para login com redirecionamento customizado
export const signInWithProvider = async (
  provider: 'google' | 'github',
  redirectTo?: string
) => {
  const baseUrl = getBaseUrl();
  const finalRedirectTo = redirectTo ? `${baseUrl}${redirectTo}` : `${baseUrl}/dashboard`;
  
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(finalRedirectTo)}`,
    },
  });
};

// Helper para login com email/password
export const signInWithEmail = async (
  email: string,
  password: string,
  redirectTo?: string
) => {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
};

// Helper para signup com redirecionamento
export const signUpWithEmail = async (
  email: string,
  password: string,
  redirectTo?: string
) => {
  const baseUrl = getBaseUrl();
  const finalRedirectTo = redirectTo ? `${baseUrl}${redirectTo}` : `${baseUrl}/dashboard`;
  
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/confirm?next=${encodeURIComponent(finalRedirectTo)}`,
    },
  });
};
```

### 4. Configuração de Environment Variables

#### Variáveis necessárias no Vercel
```bash
# Produção
NEXT_PUBLIC_SUPABASE_URL=https://ownkoxryswokcdanrdgj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://neonpro.vercel.app

# Para preview deployments
NEXT_PUBLIC_VERCEL_URL=auto-populated-by-vercel
```

### 5. Atualizar Dashboard para Handle OAuth

#### Melhorar o dashboard para handle OAuth callbacks
```typescript
// apps/web/src/routes/dashboard.tsx - atualizar useEffect
useEffect(() => {
  const handleOAuthCallback = async () => {
    // Check for next parameter in URL
    const searchParams = new URLSearchParams(window.location.search);
    const nextUrl = searchParams.get('next');
    
    // Check if we have OAuth tokens in the URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');

    if (accessToken) {
      console.log('OAuth callback detected, cleaning up URL...');
      
      // Clean up the URL
      const cleanUrl = nextUrl || '/dashboard';
      window.history.replaceState({}, document.title, cleanUrl);

      // Verify the session is established
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('OAuth session established successfully');
      }
    }
  };

  handleOAuthCallback();
}, []);
```

## 🔧 Configuração Passo a Passo

### Passo 1: Configurar URLs no Supabase
1. Acesse o dashboard do Supabase
2. Vá para Authentication > Settings > URL Configuration
3. Configure o `Site URL` para sua URL de produção
4. Adicione todas as URLs de redirecionamento na lista "Additional Redirect URLs"

### Passo 2: Criar Routes de Auth
1. Crie `/auth/callback.tsx` (código acima)
2. Crie `/auth/confirm.tsx` (código acima)
3. Atualize o cliente Supabase com helpers de redirecionamento

### Passo 3: Configurar Environment Variables
1. No Vercel Dashboard, adicione as variáveis de ambiente
2. Configure `NEXT_PUBLIC_SITE_URL` para sua URL de produção
3. Redeploy para aplicar as mudanças

### Passo 4: Testar Redirecionamentos
1. Teste login com email/password
2. Teste OAuth providers (se configurados)
3. Teste confirmação de email
4. Teste em diferentes ambientes (dev, staging, prod)

## ⚠️ Troubleshooting Comum

### URLs não funcionam
- Verificar se URLs são exatamente iguais (case sensitive)
- Verificar protocolo (http vs https)
- Verificar trailing slashes
- Verificar se URL está na lista de URLs permitidas

### Redirecionamento para localhost em produção
- Verificar se `SITE_URL` está configurado corretamente
- Verificar se `NEXT_PUBLIC_SITE_URL` está definido
- Verificar se não há hard-coded localhost URLs

### Session não persiste
- Verificar se localStorage está habilitado
- Verificar configuração de cookies
- Verificar se autoRefreshToken está true

## 📱 URLs de Teste

### Desenvolvimento
- Site URL: `http://localhost:5173`
- Dashboard: `http://localhost:5173/dashboard`
- Auth Callback: `http://localhost:5173/auth/callback`
- Auth Confirm: `http://localhost:5173/auth/confirm`

### Produção
- Site URL: `https://neonpro.vercel.app`
- Dashboard: `https://neonpro.vercel.app/dashboard`
- Auth Callback: `https://neonpro.vercel.app/auth/callback`
- Auth Confirm: `https://neonpro.vercel.app/auth/confirm`

## 🎯 Próximos Passos

1. Implementar as rotas de auth callback
2. Configurar URLs no dashboard do Supabase
3. Testar fluxo completo de autenticação
4. Implementar tratamento de erros robusto
5. Configurar providers OAuth (Google, GitHub) se necessário

---

**Status**: ✅ Configuração Documentada
**Última Atualização**: 2025-09-11
**Responsável**: Configuração de Auth e Redirecionamentos## ✅ Resumo Executivo - Configuração Completa

### 🎯 O Que Foi Implementado

1. **✅ Rotas de Autenticação Criadas**
   - `/auth/callback` - Handle OAuth callbacks
   - `/auth/confirm` - Handle email confirmations

2. **✅ Cliente Supabase Melhorado**
   - Helpers para login, signup, logout
   - Redirecionamento automático configurado
   - Detecção de ambiente (dev/prod)

3. **✅ Hook de Autenticação**
   - `useAuth()` para gerenciar estado de auth
   - Listening para mudanças de estado
   - Loading states e controle de sessão

4. **✅ Dashboard Protegido**
   - Redirecionamento automático se não autenticado
   - Cleanup de OAuth URLs
   - Botão de logout funcional

5. **✅ Documentação Completa**
   - Guia de configuração detalhado
   - Checklist para dashboard Supabase
   - Troubleshooting de problemas comuns

### 🔧 Próximas Ações Necessárias

1. **🎯 OBRIGATÓRIO: Configurar URLs no Supabase Dashboard**
   - Acesse: https://supabase.com/dashboard/project/ownkoxryswokcdanrdgj
   - Configure Site URL e Additional Redirect URLs
   - Siga o checklist em `docs/features/supabase-dashboard-config-checklist.md`

2. **🧪 Testar Fluxo Completo**
   - Teste signup com email
   - Teste login com email/password
   - Teste redirecionamentos
   - Teste logout

3. **🚀 Deploy e Validação**
   - Deploy para Vercel
   - Teste em produção
   - Verificar se redirecionamentos funcionam

### 📱 URLs Para Configurar no Supabase

**Development:**
```
Site URL: http://localhost:5173
Redirects: 
- http://localhost:5173/dashboard
- http://localhost:5173/auth/callback
- http://localhost:5173/auth/confirm
```

**Production:**
```
Site URL: https://neonpro.vercel.app
Redirects:
- https://neonpro.vercel.app/dashboard
- https://neonpro.vercel.app/auth/callback
- https://neonpro.vercel.app/auth/confirm
```

### 🎉 Status

**✅ Código Implementado**: Todas as rotas, hooks e helpers criados
**⏳ Configuração Pendente**: URLs do Supabase Dashboard precisam ser configuradas
**🎯 Próximo Passo**: Seguir checklist de configuração do Supabase

---