# 🔐 Sistema de Autenticação NeonPro

## Visão Geral

Implementação completa de sistema de autenticação para plataforma de saúde NeonPro, utilizando Better Auth integrado com infraestrutura Supabase existente.

## 🏗️ Arquitetura

### Tecnologias Utilizadas
- **Better Auth**: Framework de autenticação TypeScript
- **Supabase**: Database e infraestrutura backend
- **TanStack Router**: Roteamento frontend
- **React Hook Form**: Validação de formulários
- **JWT**: Tokens de sessão

### Estrutura de Arquivos
```
apps/web/src/
├── lib/auth/
│   ├── client.ts          # Better Auth client config
│   ├── server.ts          # Better Auth server config
│   └── guards.tsx         # Route protection guards
├── components/auth/
│   └── LoginComponent.tsx # UI de login
└── routes/
    ├── auth/login.tsx     # Rota de login
    └── dashboard.tsx      # Rota protegida
```

## 🔧 Configuração

### 1. Dependências
```bash
pnpm add better-auth
```

### 2. Variáveis de Ambiente
Copie `.env.example` para `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/neonpro"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
BETTER_AUTH_SECRET="your-32-character-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Integração com API
```typescript
// apps/api/src/index.ts
import { authApp } from './routes/auth'

app.route('/api/auth', authApp)
```

## 🚀 Funcionalidades

### Autenticação
- ✅ Login com email/senha
- ✅ OAuth com Google
- ✅ Verificação de email
- ✅ Reset de senha
- ✅ Gestão de sessões

### Autorização
- ✅ Proteção de rotas
- ✅ Controle baseado em roles
- ✅ Controle baseado em permissões
- ✅ Acesso por clínica

### Compliance Healthcare
- ✅ LGPD: Consentimento e auditoria
- ✅ ANVISA: Validação profissional
- ✅ CFM: Autorização médica

## 💻 Uso

### Login Component
```tsx
import { LoginComponent } from '@/components/auth/LoginComponent'

function LoginPage() {
  return <LoginComponent />
}
```

### Proteção de Rotas
```tsx
import { useAuthGuard } from '@/lib/auth/guards'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => useAuthGuard({ requireAuth: true }),
  component: DashboardPage
})
```

### Guards de Autorização
```tsx
import { RoleGuard, PermissionGuard } from '@/lib/auth/guards'

// Por role
<RoleGuard allowedRoles={['admin', 'doctor']}>
  <AdminPanel />
</RoleGuard>

// Por permissão
<PermissionGuard requiredPermissions="patient_write">
  <PatientForm />
</PermissionGuard>
```

### Hooks de Sessão
```tsx
import { useSession, signOut } from '@/lib/auth/client'

function UserProfile() {
  const { data: session } = useSession()
  
  return (
    <div>
      <p>Bem-vindo, {session?.user?.name}</p>
      <button onClick={() => signOut()}>Sair</button>
    </div>
  )
}
```

## 🏥 Campos Healthcare

### User Model
```typescript
interface User {
  id: string
  email: string
  name: string
  role: string                    // 'admin' | 'doctor' | 'nurse' | 'user'
  clinicId: string               // Clínica associada
  permissions: string[]          // Permissões específicas
  healthcareProvider?: string    // Registro profissional
  lgpdConsent: boolean          // Consentimento LGPD
  lgpdConsentDate?: Date        // Data do consentimento
}
```

### Roles Disponíveis
- `admin`: Administrador do sistema
- `doctor`: Médico com acesso completo
- `nurse`: Enfermeiro com acesso limitado
- `receptionist`: Recepcionista
- `user`: Usuário básico

### Permissões Disponíveis
- `patient_read`: Visualizar pacientes
- `patient_write`: Editar pacientes
- `appointment_read`: Visualizar agendamentos
- `appointment_write`: Editar agendamentos
- `report_read`: Visualizar relatórios
- `admin_access`: Acesso administrativo

## 🔒 Segurança

### Sessões
- Duração: 7 dias
- Renovação automática: 24 horas
- Cookie httpOnly e secure
- Cache de 5 minutos

### Auditoria
- Log de autenticação
- Tracking de sessões
- Compliance LGPD
- Metadados de acesso

### Rate Limiting
- 100 requests por minuto
- Proteção contra força bruta
- Bloqueio temporário

## 🧪 Testes

### Implementar Testes
```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e
```

### Casos de Teste
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas
- [ ] Proteção de rotas não autenticadas
- [ ] Autorização por role
- [ ] Autorização por permissão
- [ ] OAuth com Google
- [ ] Reset de senha
- [ ] Verificação de email

## 📋 Próximos Passos

### Implementação Imediata
1. Configurar variáveis de ambiente
2. Instalar dependências
3. Configurar Google OAuth
4. Implementar email service
5. Testes de integração

### Melhorias Futuras
1. **Multi-factor Authentication (2FA)**
2. **Single Sign-On (SSO)**
3. **Biometric Authentication**
4. **Advanced Role Management**
5. **Compliance Dashboard**

## 🆘 Troubleshooting

### Problemas Comuns

**Erro: "BETTER_AUTH_SECRET not found"**
```bash
# Gerar secret
openssl rand -base64 32
```

**Erro: "Database connection failed"**
- Verificar DATABASE_URL
- Confirmar Supabase credentials
- Validar conectividade

**Erro: "Google OAuth failed"**
- Verificar GOOGLE_CLIENT_ID/SECRET
- Configurar redirect URLs no Google Console
- Validar domínios autorizados

### Logs de Debug
```bash
DEBUG=neonpro:auth pnpm dev
```

## 📚 Referências

- [Better Auth Documentation](https://better-auth.com)
- [TanStack Router Auth Guide](https://tanstack.com/router/latest/docs/framework/react/guide/authentication)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [LGPD Compliance Guide](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

---

**Versão**: 1.0.0  
**Última Atualização**: 26/09/2025  
**Autor**: NeonPro Platform Team