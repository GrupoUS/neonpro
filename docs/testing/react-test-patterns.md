# Padrões de Teste para Componentes React

## Visão Geral

Este documento define os padrões e melhores práticas para testes de componentes React no projeto NeonPro, seguindo as diretrizes de healthcare e acessibilidade.

## Estrutura de Testes

### 1. Organização de Arquivos

```
packages/
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── Button.stories.tsx
│   │   │   └── PatientCard/
│   │   │       ├── PatientCard.tsx
│   │   │       ├── PatientCard.test.tsx
│   │   │       └── PatientCard.integration.test.tsx
│   └── __tests__/
│       ├── setup.ts
│       ├── utils/
│       └── fixtures/
```

### 2. Convenções de Nomenclatura

- **Unit Tests**: `ComponentName.test.tsx`
- **Integration Tests**: `ComponentName.integration.test.tsx`
- **E2E Tests**: `ComponentName.e2e.test.ts`
- **Test Utilities**: `test-utils.tsx`
- **Fixtures**: `fixtures/ComponentName.fixtures.ts`

## Padrões de Teste por Tipo

### Unit Tests - Componentes Básicos

```typescript
// Button.test.tsx
import { fireEvent, render, screen, } from '@testing-library/react'
import { vi, } from 'vitest'
import { Button, } from './Button'

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>,)
    expect(screen.getByRole('button', { name: /click me/i, },),).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>,)

    fireEvent.click(screen.getByRole('button',),)
    expect(handleClick,).toHaveBeenCalledTimes(1,)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>,)
    expect(screen.getByRole('button',),).toBeDisabled()
  })

  it('should have correct accessibility attributes', () => {
    render(<Button aria-label="Save patient data">Save</Button>,)
    expect(screen.getByRole('button',),).toHaveAttribute('aria-label', 'Save patient data',)
  })
})
```

### Unit Tests - Componentes Healthcare

```typescript
// PatientCard.test.tsx
import { render, screen, } from '@testing-library/react'
import { mockPatient, } from '../../../__tests__/fixtures/patient.fixtures'
import { PatientCard, } from './PatientCard'

describe('PatientCard Component', () => {
  it('should display patient information correctly', () => {
    render(<PatientCard patient={mockPatient} />,)

    expect(screen.getByText(mockPatient.name,),).toBeInTheDocument()
    expect(screen.getByText(mockPatient.cpf,),).toBeInTheDocument()
    expect(screen.getByText(/idade: \d+/i,),).toBeInTheDocument()
  })

  it('should mask sensitive information when privacy mode is enabled', () => {
    render(<PatientCard patient={mockPatient} privacyMode />,)

    expect(screen.getByText('***.***.***-**',),).toBeInTheDocument()
    expect(screen.queryByText(mockPatient.cpf,),).not.toBeInTheDocument()
  })

  it('should meet WCAG accessibility standards', () => {
    render(<PatientCard patient={mockPatient} />,)

    const card = screen.getByRole('article',)
    expect(card,).toHaveAttribute('aria-label', expect.stringContaining(mockPatient.name,),)
  })

  it('should handle emergency status correctly', () => {
    const emergencyPatient = { ...mockPatient, status: 'emergency', }
    render(<PatientCard patient={emergencyPatient} />,)

    expect(screen.getByRole('alert',),).toBeInTheDocument()
    expect(screen.getByText(/emergência/i,),).toBeInTheDocument()
  })
})
```

### Integration Tests - Componentes com Estado

```typescript
// PatientForm.integration.test.tsx
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, } from 'vitest'
import { mockSupabaseClient, } from '../../../__tests__/mocks/supabase.mock'
import { PatientForm, } from './PatientForm'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
}),)

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, },
      mutations: { retry: false, },
    },
  },)

  return ({ children, }: { children: React.ReactNode },) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('PatientForm Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  },)

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ data: { id: '123', }, error: null, },),
    },)

    render(<PatientForm />, { wrapper: createWrapper(), },)

    await user.type(screen.getByLabelText(/nome completo/i,), 'João Silva',)
    await user.type(screen.getByLabelText(/cpf/i,), '123.456.789-00',)
    await user.type(screen.getByLabelText(/email/i,), 'joao@email.com',)

    await user.click(screen.getByRole('button', { name: /salvar/i, },),)

    await waitFor(() => {
      expect(mockSupabaseClient.from,).toHaveBeenCalledWith('patients',)
    },)
  })

  it('should display validation errors for invalid CPF', async () => {
    const user = userEvent.setup()
    render(<PatientForm />, { wrapper: createWrapper(), },)

    await user.type(screen.getByLabelText(/cpf/i,), '123.456.789-99',)
    await user.click(screen.getByRole('button', { name: /salvar/i, },),)

    await waitFor(() => {
      expect(screen.getByText(/cpf inválido/i,),).toBeInTheDocument()
    },)
  })
})
```

## Padrões de Mock e Fixtures

### 1. Fixtures de Dados

```typescript
// fixtures/patient.fixtures.ts
export const mockPatient = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'João Silva Santos',
  cpf: '123.456.789-00',
  email: 'joao.silva@email.com',
  phone: '(11) 99999-9999',
  birthDate: '1990-01-15',
  gender: 'M' as const,
  address: {
    street: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
  },
  medicalRecord: '2024001',
  status: 'active' as const,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
}

export const mockPatients = [
  mockPatient,
  {
    ...mockPatient,
    id: '456e7890-e89b-12d3-a456-426614174001',
    name: 'Maria Oliveira',
    cpf: '987.654.321-00',
    status: 'emergency' as const,
  },
]
```

### 2. Mocks de Serviços

```typescript
// mocks/supabase.mock.ts
import { vi, } from 'vitest'

export const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  })),
  auth: {
    getUser: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
}
```

### 3. Custom Render com Providers

```typescript
// test-utils.tsx
import { ThemeProvider, } from '@/components/theme-provider'
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query'
import { render, RenderOptions, } from '@testing-library/react'
import { BrowserRouter, } from 'react-router-dom'

const AllTheProviders = ({ children, }: { children: React.ReactNode },) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, },
      mutations: { retry: false, },
    },
  },)

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options, },)

export * from '@testing-library/react'
export { customRender as render, }
```

## Testes de Acessibilidade

### 1. Testes Básicos de A11y

```typescript
import { render, } from '@testing-library/react'
import { axe, toHaveNoViolations, } from 'jest-axe'
import { PatientCard, } from './PatientCard'

expect.extend(toHaveNoViolations,)

describe('PatientCard Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container, } = render(<PatientCard patient={mockPatient} />,)
    const results = await axe(container,)
    expect(results,).toHaveNoViolations()
  })

  it('should support keyboard navigation', () => {
    render(<PatientCard patient={mockPatient} />,)
    const card = screen.getByRole('article',)

    card.focus()
    expect(card,).toHaveFocus()
  })

  it('should have proper ARIA labels for screen readers', () => {
    render(<PatientCard patient={mockPatient} />,)

    expect(screen.getByRole('article',),).toHaveAttribute(
      'aria-label',
      `Paciente ${mockPatient.name}, CPF ${mockPatient.cpf}`,
    )
  })
})
```

### 2. Testes de Contraste e Cores

```typescript
describe('Visual Accessibility', () => {
  it('should maintain color contrast ratios', () => {
    render(<Button variant="primary">Primary Button</Button>,)
    const button = screen.getByRole('button',)

    const styles = window.getComputedStyle(button,)
    // Verificar se o contraste atende WCAG AA (4.5:1)
    expect(getContrastRatio(styles.color, styles.backgroundColor,),).toBeGreaterThan(4.5,)
  })

  it('should be usable without color alone', () => {
    render(<StatusBadge status="error" />,)

    // Deve ter ícone ou texto além da cor
    expect(screen.getByRole('img', { name: /erro/i, },),).toBeInTheDocument()
  })
})
```

## Testes de Performance

### 1. Testes de Renderização

```typescript
import { render, screen, } from '@testing-library/react'
import { performance, } from 'perf_hooks'

describe('PatientList Performance', () => {
  it('should render large patient lists efficiently', () => {
    const largePatientList = Array.from({ length: 1000, }, (_, i,) => ({
      ...mockPatient,
      id: `patient-${i}`,
      name: `Patient ${i}`,
    }),)

    const startTime = performance.now()
    render(<PatientList patients={largePatientList} />,)
    const endTime = performance.now()

    expect(endTime - startTime,).toBeLessThan(100,) // < 100ms
  })

  it('should implement virtual scrolling for large lists', () => {
    const largeList = Array.from({ length: 10000, }, (_, i,) => mockPatient,)
    render(<VirtualizedPatientList patients={largeList} />,)

    // Apenas os itens visíveis devem estar no DOM
    expect(screen.getAllByRole('article',),).toHaveLength(10,) // viewport size
  })
})
```

## Padrões de Teste para Hooks

### 1. Custom Hooks

```typescript
// usePatientData.test.ts
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query'
import { renderHook, waitFor, } from '@testing-library/react'
import { mockSupabaseClient, } from '../mocks/supabase.mock'
import { usePatientData, } from './usePatientData'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, }, },
  },)

  return ({ children, }: { children: React.ReactNode },) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('usePatientData Hook', () => {
  it('should fetch patient data successfully', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockPatient,], error: null, },),
    },)

    const { result, } = renderHook(() => usePatientData('123',), {
      wrapper: createWrapper(),
    },)

    await waitFor(() => {
      expect(result.current.isSuccess,).toBe(true,)
    },)

    expect(result.current.data,).toEqual(mockPatient,)
  })

  it('should handle errors gracefully', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found', }, },),
    },)

    const { result, } = renderHook(() => usePatientData('invalid-id',), {
      wrapper: createWrapper(),
    },)

    await waitFor(() => {
      expect(result.current.isError,).toBe(true,)
    },)
  })
})
```

## Padrões de Teste para Formulários

### 1. Validação de Formulários

```typescript
describe('Form Validation', () => {
  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<PatientForm />,)

    await user.click(screen.getByRole('button', { name: /salvar/i, },),)

    expect(screen.getByText(/nome é obrigatório/i,),).toBeInTheDocument()
    expect(screen.getByText(/cpf é obrigatório/i,),).toBeInTheDocument()
  })

  it('should validate CPF format', async () => {
    const user = userEvent.setup()
    render(<PatientForm />,)

    await user.type(screen.getByLabelText(/cpf/i,), '123',)
    await user.tab() // trigger blur

    expect(screen.getByText(/formato de cpf inválido/i,),).toBeInTheDocument()
  })

  it('should validate email format', async () => {
    const user = userEvent.setup()
    render(<PatientForm />,)

    await user.type(screen.getByLabelText(/email/i,), 'invalid-email',)
    await user.tab()

    expect(screen.getByText(/formato de email inválido/i,),).toBeInTheDocument()
  })
})
```

## Configuração de Testes

### 1. Setup Global

```typescript
// setup.ts
import '@testing-library/jest-dom'
import { vi, } from 'vitest'

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query,) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
},)
```

### 2. Configuração Vitest

```typescript
// vitest.config.ts
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, } from 'vitest/config'

export default defineConfig({
  plugins: [react(),],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts',],
    coverage: {
      reporter: ['text', 'json', 'html',],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src',),
    },
  },
},)
```

## Métricas de Qualidade

### 1. Cobertura de Testes

- **Mínimo**: 80% de cobertura geral
- **Componentes críticos**: 95% de cobertura
- **Utilitários**: 90% de cobertura

### 2. Performance

- **Renderização**: < 100ms para componentes simples
- **Interação**: < 50ms para resposta a eventos
- **Carregamento**: < 200ms para componentes com dados

### 3. Acessibilidade

- **WCAG AA**: Conformidade obrigatória
- **Contraste**: Mínimo 4.5:1
- **Navegação**: Suporte completo ao teclado

## Checklist de Testes

### Para cada componente:

- [ ] Renderização básica
- [ ] Props obrigatórias e opcionais
- [ ] Estados (loading, error, success)
- [ ] Interações do usuário
- [ ] Acessibilidade (WCAG AA)
- [ ] Responsividade
- [ ] Performance
- [ ] Casos extremos (edge cases)

### Para formulários:

- [ ] Validação de campos
- [ ] Submissão com dados válidos
- [ ] Tratamento de erros
- [ ] Estados de loading
- [ ] Acessibilidade de formulários

### Para hooks:

- [ ] Estados iniciais
- [ ] Transições de estado
- [ ] Cleanup de efeitos
- [ ] Tratamento de erros
- [ ] Dependências corretas

Este documento deve ser atualizado conforme novos padrões são estabelecidos e melhores práticas são identificadas.
