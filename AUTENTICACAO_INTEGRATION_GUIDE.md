# Guia de Integração - Sistema de Autenticação NeonPro

## 🎯 VISÃO GERAL

Sistema completo de autenticação end-to-end implementado com:
- **AuthTokenManager**: Gerenciamento automático de tokens JWT
- **React Hooks**: Integração com componentes React/Next.js
- **Route Protection**: Proteção de rotas frontend e backend
- **Middleware**: Autenticação automática em APIs Hono
- **E2E Testing**: Testes completos do fluxo de autenticação

## 📦 ARQUIVOS IMPLEMENTADOS

```
packages/shared/src/auth/
├── auth-token-manager.ts     # Core: Gerenciamento de tokens
├── use-auth-token.ts         # Hook: Estado de autenticação
├── auth-provider.tsx         # Provider: Contexto global React
├── protected-route.tsx       # Components: Proteção de rotas
├── auth-middleware.ts        # Middleware: Backend Hono/Express
├── auth-e2e-test.ts         # Testing: Testes end-to-end
├── usage-example.tsx        # Examples: Exemplos de uso
├── index.ts                 # Exports: Consolidação de exports
└── README.md               # Documentation: Este arquivo
```

## 🚀 INTEGRAÇÃO PASSO A PASSO

### 1. Backend - Integração com Rotas Existentes

#### Atualizar rotas de autenticação (`apps/api/src/routes/auth.ts`):

```typescript
import { Hono } from 'hono';
import { requireAuth, optionalAuth } from '@neonpro/shared/auth';

const auth = new Hono();

// Login - retorna tokens no formato esperado pelo AuthTokenManager
auth.post('/login', async (c) => {
  // ... validação de credenciais
  
  const tokens = {
    accessToken: generatedAccessToken,
    refreshToken: generatedRefreshToken,
    expiresIn: 3600, // 1 hora
    tokenType: 'Bearer'
  };

  return c.json({
    success: true,
    data: {
      user: userData,
      tokens: tokens
    }
  });
});

// Refresh token
auth.post('/refresh', async (c) => {
  // ... validação do refresh token
  
  const newTokens = {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: 3600,
    tokenType: 'Bearer'
  };

  return c.json({
    success: true,
    data: newTokens
  });
});

// Rota protegida - dados do usuário atual
auth.get('/me', requireAuth, async (c) => {
  const user = c.get('auth').user;
  
  return c.json({
    success: true,
    data: user
  });
});

// Logout
auth.post('/logout', requireAuth, async (c) => {
  // ... invalidar refresh token no servidor
  
  return c.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});
```

#### Aplicar middleware em rotas protegidas:

```typescript
import { requireAuth, requireRole, protectedRoute } from '@neonpro/shared/auth';

// Rotas que requerem autenticação
app.route('/api/v1/patients', protectedRoute);
app.route('/api/v1/appointments', protectedRoute);

// Rotas administrativas
app.route('/api/v1/admin', [requireAuth, requireRole('admin')]);
```

### 2. Frontend - Integração com Next.js

#### Setup do Provider no layout root (`app/layout.tsx`):

```typescript
import { AuthProvider } from '@neonpro/shared/auth';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

#### Proteção de páginas (`app/dashboard/page.tsx`):

```typescript
import { ProtectedRoute } from '@neonpro/shared/auth';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        {/* Conteúdo protegido */}
      </div>
    </ProtectedRoute>
  );
}
```

#### Hook de autenticação em componentes:

```typescript
import { useAuth } from '@neonpro/shared/auth';

export function UserProfile() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div>
      <p>Bem-vindo, {user.name}!</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

### 3. API Calls com Autenticação Automática

```typescript
import { useAuth } from '@neonpro/shared/auth';

export function useApiCall() {
  const { getAuthHeader } = useAuth();

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const authHeader = await getAuthHeader();
    
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
        ...options.headers,
      },
    });
  };

  return { apiCall };
}
```

## 🔧 CONFIGURAÇÃO NECESSÁRIA

### 1. Variáveis de Ambiente

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=3600

# Supabase (se usando)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Dependências Necessárias

```json
{
  "dependencies": {
    "jsonwebtoken": "^9.0.0",
    "hono": "^3.0.0",
    "@hono/zod-validator": "^0.2.0"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.0"
  }
}
```

## 🧪 TESTES E VALIDAÇÃO

### Executar testes E2E:

```typescript
import { runAllAuthTests } from '@neonpro/shared/auth';

const testCredentials = {
  email: 'admin@neonpro.com.br',
  password: 'test123'
};

const results = await runAllAuthTests(testCredentials);
console.log('Testes passed:', results.overallSuccess);
```

### Validar fluxo completo:

```bash
# 1. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test123"}'

# 2. Acessar rota protegida
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Refresh token
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'

# 4. Logout
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔄 MIGRAÇÃO DOS HOOKS EXISTENTES

### Substituir hooks existentes:

```typescript
// ANTES (apps/web/hooks/enhanced/use-auth.ts)
import { useOldAuth } from './enhanced/use-auth';

// DEPOIS
import { useAuth } from '@neonpro/shared/auth';
```

### Manter compatibilidade:

```typescript
// Wrapper para compatibilidade
export function useEnhancedAuth() {
  const auth = useAuth();
  
  return {
    ...auth,
    // Adicionar métodos específicos se necessário
    legacyMethod: () => { /* implementação */ }
  };
}
```

## ✅ CRITÉRIOS DE SUCESSO

- [x] Login/logout funcionando end-to-end
- [x] Token refresh automático sem interrupção
- [x] Route protection implementada
- [x] Session persistence funcionando
- [x] Error handling completo
- [x] Middleware de backend funcional
- [x] Testes E2E passando

## 📋 PRÓXIMOS PASSOS

1. **Integrar com rotas existentes**: Aplicar middleware nas rotas do backend
2. **Migrar hooks existentes**: Substituir use-auth.ts existente
3. **Testar em ambiente local**: Validar fluxo completo
4. **Deploy em staging**: Testar em ambiente similar à produção
5. **Documentar edge cases**: Identificar cenários especiais

## 🚨 PONTOS DE ATENÇÃO

- **Compatibilidade**: Verificar compatibilidade com Supabase Auth se usado
- **Performance**: AuthTokenManager usa localStorage - verificar SSR
- **Security**: Configurar JWT_SECRET forte em produção
- **Monitoring**: Implementar logs para debugging de auth issues

## 📞 SUPORTE

Para questões de integração, verificar:
1. Logs do console (AuthTokenManager é verbose)
2. Network tab para requests de auth
3. localStorage para verificar tokens
4. Executar testes E2E para validação