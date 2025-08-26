# NeonPro Test Suite

Este diretório contém a suite de testes completa do NeonPro, seguindo os padrões VIBECODE V1.0 com
cobertura mínima de 80%.

## 📋 Estrutura de Testes

```
__tests__/
├── components/          # Testes de componentes React
│   └── ui/
│       └── error-boundary.test.tsx
├── contexts/           # Testes de contextos React
│   └── auth-context.test.tsx
├── hooks/              # Testes de hooks customizados
│   └── use-error-handling.test.tsx
├── e2e/               # Testes End-to-End
│   └── auth-flow.spec.ts
├── api/               # Testes de API routes
└── lib/               # Testes de utilitários
```

## 🚀 Comandos de Teste

### Testes Unitários (Jest + Testing Library)

```bash
# Executar todos os testes unitários
pnpm test

# Executar testes em modo watch
pnpm test:watch

# Executar testes com cobertura
pnpm test:coverage

# Executar testes específicos
pnpm test auth-context
```

### Testes E2E (Playwright)

```bash
# Executar todos os testes E2E
pnpm test:e2e

# Executar com interface visual
pnpm test:e2e:ui

# Executar em modo debug
pnpm test:e2e:debug

# Executar todos os tipos de teste
pnpm test:all
```

### Verificação de Tipos

```bash
# Verificar tipos TypeScript
pnpm type-check
```

## 📊 Metas de Cobertura (VIBECODE V1.0)

- **Cobertura Global**: ≥80%
- **Componentes Críticos**: ≥90%
  - `auth-context.tsx`
  - `error-boundary.tsx`
- **Branches**: ≥80%
- **Functions**: ≥80%
- **Lines**: ≥80%
- **Statements**: ≥80%

## 🎯 Categorias de Teste

### 1. Testes Unitários

- **Componentes React**: Rendering, props, interações
- **Hooks**: Estado, efeitos, callbacks
- **Utilitários**: Funções puras, helpers
- **Contextos**: State management, providers

### 2. Testes de Integração

- **API Routes**: Request/response cycles
- **Database Operations**: CRUD operations
- **Authentication Flow**: Login/logout/signup
- **Form Submissions**: Validation and processing

### 3. Testes E2E

- **User Journeys**: Complete user workflows
- **Authentication**: Login, signup, OAuth
- **Error Handling**: Error boundaries, error states
- **Performance**: Core Web Vitals, load times
- **Accessibility**: Keyboard navigation, screen readers

## 🔧 Configuração de Teste

### Jest Configuration

- **Ambiente**: jsdom para componentes React
- **Setup**: `jest.setup.js` para configurações globais
- **Coverage**: Reports em HTML, JSON e LCOV
- **Transformers**: TypeScript support via ts-jest

### Playwright Configuration

- **Browsers**: Chrome, Firefox, Safari
- **Mobile**: Chrome Mobile, Safari Mobile
- **Screenshots**: On failure
- **Videos**: Retain on failure
- **Traces**: On retry

## 📝 Padrões de Teste

### Estrutura de Teste Unitário

```typescript
describe("ComponentName", () => {
  beforeEach(() => {
    // Setup comum
  });

  it("should render correctly", () => {
    // Teste de rendering básico
  });

  it("should handle user interactions", () => {
    // Teste de interações
  });

  it("should handle error states", () => {
    // Teste de estados de erro
  });
});
```

### Estrutura de Teste E2E

```typescript
test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup da página
  });

  test("should complete user journey", async ({ page }) => {
    // Teste do fluxo completo
  });
});
```

## 🛡️ Mocking Strategy

### Supabase

```typescript
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    // ... outros métodos
  },
};

jest.mock("@/app/utils/supabase/client", () => ({
  createClient: () => mockSupabase,
}));
```

### Next.js Router

```typescript
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    // ... outros métodos
  }),
}));
```

## 🎨 Teste de Componentes UI

### Error Boundaries

- Renderização de children sem erro
- Exibição de UI de erro quando ocorre erro
- Funcionamento do botão de retry
- Callback onError executado
- Detalhes técnicos quando habilitado

### Auth Context

- Estados de loading, user, session
- Funções de signIn, signUp, signOut
- Tratamento de erros de autenticação
- Listeners de mudança de estado
- Cleanup de subscriptions

### Form Components

- Validação com Zod schemas
- Estados de loading e erro
- Submissão de formulários
- Feedback visual para usuário

## 🚨 Testes Críticos

### Autenticação

- ✅ Login com email/senha
- ✅ Cadastro de novos usuários
- ✅ OAuth com Google
- ✅ Logout e limpeza de sessão
- ✅ Persistência de estado
- ✅ Redirecionamentos corretos

### Error Handling

- ✅ Captura de erros JavaScript
- ✅ Exibição de UI de erro
- ✅ Recovery de erros
- ✅ Logging de erros críticos

### Performance

- ✅ Carregamento de página ≤3s
- ✅ Core Web Vitals dentro dos limites
- ✅ Medição de tempo de API

## 📈 Relatórios

### Coverage Report

Gerado em `coverage/lcov-report/index.html`

### E2E Report

Gerado em `playwright-report/index.html`

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Run Tests
  run: |
    pnpm test:coverage
    pnpm test:e2e
```

## 🔍 Debugging

### Jest Tests

```bash
# Debug specific test
pnpm test --testNamePattern="should render correctly" --verbose

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Tests

```bash
# Debug mode with browser visible
pnpm test:e2e:debug

# Run with headed browser
pnpm test:e2e --headed
```

## 🎯 Próximos Passos

1. **Expandir Cobertura**: Adicionar testes para todos os componentes
2. **Visual Regression**: Implementar testes de regressão visual
3. **Performance Tests**: Adicionar testes de performance automatizados
4. **API Testing**: Expandir testes de API routes
5. **Mobile Testing**: Adicionar mais cenários mobile

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [VIBECODE Testing Standards](../docs/testing-standards.md)
