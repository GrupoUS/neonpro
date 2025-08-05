# NeonPro - Frontend Specification
## Especificação Técnica da Interface

### Visão Geral
O frontend do NeonPro é construído com **Next.js 15** e **TypeScript** em uma arquitetura **Turborepo monorepo**, otimizada para performance, manutenibilidade e experiência do desenvolvedor. A aplicação segue padrões modernos de React com foco em acessibilidade e conformidade regulatória.

### Arquitetura de Componentes

#### Estrutura de Packages
```
packages/
├── ui/                                # Componentes compartilhados
│   ├── components/                    # Componentes React
│   │   ├── primitives/               # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── form.tsx
│   │   ├── composite/                # Componentes compostos
│   │   │   ├── data-table.tsx
│   │   │   ├── patient-card.tsx
│   │   │   ├── appointment-form.tsx
│   │   │   └── dashboard-stats.tsx
│   │   └── layout/                   # Componentes de layout
│   │       ├── header.tsx
│   │       ├── sidebar.tsx
│   │       ├── footer.tsx
│   │       └── page-container.tsx
│   ├── hooks/                        # Hooks customizados
│   │   ├── use-local-storage.ts
│   │   ├── use-debounce.ts
│   │   ├── use-pagination.ts
│   │   └── use-tenant-context.ts
│   ├── styles/                       # Estilos e temas
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── themes/
│   │       ├── light.css
│   │       └── dark.css
│   └── lib/                         # Utilitários UI
│       ├── utils.ts                 # Classe utility functions
│       ├── variants.ts              # Component variants
│       └── animations.ts            # Framer Motion configs
```

#### Component Architecture Patterns

##### Base Component Pattern
```typescript
// packages/ui/components/primitives/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { cn } from '@neonpro/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

##### Composite Component Pattern
```typescript
// packages/ui/components/composite/patient-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../primitives/card'
import { Badge } from '../primitives/badge'
import { Button } from '../primitives/button'
import { Avatar, AvatarFallback, AvatarImage } from '../primitives/avatar'
import type { Patient } from '@neonpro/types'
import { formatDate, getInitials } from '@neonpro/utils'

interface PatientCardProps {
  patient: Patient
  onEdit?: (patient: Patient) => void
  onView?: (patient: Patient) => void
  className?: string
}

export function PatientCard({ 
  patient, 
  onEdit, 
  onView, 
  className 
}: PatientCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={patient.avatar_url} alt={patient.name} />
          <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
        </Avatar>
        <div className="ml-3 flex-1">
          <CardTitle className="text-base">{patient.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{patient.email}</p>
        </div>
        <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
          {patient.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Última consulta: {formatDate(patient.last_appointment)}
          </span>
          <div className="flex gap-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={() => onView(patient)}>
                Ver
              </Button>
            )}
            {onEdit && (
              <Button variant="default" size="sm" onClick={() => onEdit(patient)}>
                Editar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Gerenciamento de Estado

#### Zustand Store Pattern
```typescript
// apps/neonpro-web/lib/stores/patients-store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Patient, CreatePatientData } from '@neonpro/types'

interface PatientsState {
  patients: Patient[]
  selectedPatient: Patient | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setPatients: (patients: Patient[]) => void
  addPatient: (patient: Patient) => void
  updatePatient: (id: string, updates: Partial<Patient>) => void
  removePatient: (id: string) => void
  selectPatient: (patient: Patient | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const usePatientsStore = create<PatientsState>()(
  devtools(
    persist(
      (set, get) => ({
        patients: [],
        selectedPatient: null,
        isLoading: false,
        error: null,
        
        setPatients: (patients) => set({ patients }),
        
        addPatient: (patient) => set((state) => ({
          patients: [patient, ...state.patients]
        })),
        
        updatePatient: (id, updates) => set((state) => ({
          patients: state.patients.map(p => 
            p.id === id ? { ...p, ...updates } : p
          )
        })),
        
        removePatient: (id) => set((state) => ({
          patients: state.patients.filter(p => p.id !== id)
        })),
        
        selectPatient: (patient) => set({ selectedPatient: patient }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error })
      }),
      {
        name: 'patients-storage',
        partialize: (state) => ({ 
          selectedPatient: state.selectedPatient 
        })
      }
    ),
    { name: 'patients-store' }
  )
)
```

#### TanStack Query Integration
```typescript
// apps/neonpro-web/lib/hooks/use-patients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePatientsStore } from '@/lib/stores/patients-store'
import { patientsApi } from '@neonpro/utils/api'
import type { Patient, CreatePatientData } from '@neonpro/types'

export function usePatients() {
  const { setPatients, setLoading, setError } = usePatientsStore()
  
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      setLoading(true)
      try {
        const patients = await patientsApi.getAll()
        setPatients(patients)
        setError(null)
        return patients
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error')
        throw error
      } finally {
        setLoading(false)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  const { addPatient } = usePatientsStore()
  
  return useMutation({
    mutationFn: (data: CreatePatientData) => patientsApi.create(data),
    onSuccess: (newPatient) => {
      addPatient(newPatient)
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    }
  })
}
```

### Estratégia de Imports

#### Package Imports
```typescript
// Imports de packages internos com @neonpro/* namespace
import { Button, Card, Input } from '@neonpro/ui'
import { cn, formatDate, validateEmail } from '@neonpro/utils'
import type { Patient, Appointment, User } from '@neonpro/types'
import { patientSchema } from '@neonpro/utils/validators'

// Imports da aplicação com @ alias
import { PatientForm } from '@/components/patients'
import { usePatients } from '@/lib/hooks'
import { usePatientsStore } from '@/lib/stores'

// Imports externos
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
```

#### Barrel Exports Pattern
```typescript
// packages/ui/index.ts
export * from './components/primitives'
export * from './components/composite'
export * from './components/layout'
export * from './hooks'

// packages/utils/index.ts
export * from './validators'
export * from './api'
export * from './helpers'
export * from './formatters'

// packages/types/index.ts
export * from './database'
export * from './api'
export * from './domain'
export * from './forms'
```

### Workflow de Desenvolvimento

#### Hot Reload e Caching
```bash
# Desenvolvimento com hot reload otimizado
pnpm turbo dev --filter=@neonpro/web

# Desenvolvimento de um package específico
pnpm turbo dev --filter=@neonpro/ui

# Desenvolvimento paralelo (app + packages)
pnpm turbo dev --parallel
```

#### File Watching Strategy
```json
// turbo.json - Task dependencies para development
{
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    }
  }
}
```

### Estratégia de Build

#### Build Paralelo e Otimização
```bash
# Build otimizado com cache
pnpm turbo build --filter=@neonpro/web

# Build de todos os packages em paralelo
pnpm turbo build

# Build com análise de bundle
pnpm turbo build --filter=@neonpro/web -- --analyze

# Build de produção com otimizações máximas
NODE_ENV=production pnpm turbo build
```

#### Bundle Optimization
```typescript
// next.config.js - Otimizações de bundle
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      '@neonpro/ui',
      '@neonpro/utils',
      'lucide-react',
      '@radix-ui/react-icons'
    ]
  },
  
  webpack: (config) => {
    // Tree shaking otimizado
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false
    }
    
    return config
  }
}

module.exports = nextConfig
```

### Performance e Otimização

#### Code Splitting Strategy
```typescript
// Lazy loading de componentes pesados
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@neonpro/ui'

const PatientChart = lazy(() => import('@/components/charts/patient-chart'))
const AppointmentCalendar = lazy(() => import('@/components/calendar'))

export function Dashboard() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<LoadingSpinner />}>
        <PatientChart />
      </Suspense>
      
      <Suspense fallback={<div>Carregando calendário...</div>}>
        <AppointmentCalendar />
      </Suspense>
    </div>
  )
}
```

#### Image Optimization
```typescript
// Otimização automática de imagens
import Image from 'next/image'

export function PatientAvatar({ patient }: { patient: Patient }) {
  return (
    <Image
      src={patient.avatar_url}
      alt={`Avatar de ${patient.name}`}
      width={40}
      height={40}
      className="rounded-full"
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  )
}
```

### Acessibilidade e UX

#### WCAG 2.1 AA Compliance
```typescript
// Componente acessível com ARIA
export function SearchPatients() {
  const [query, setQuery] = useState('')
  const searchId = useId()
  
  return (
    <div className="space-y-2">
      <label 
        htmlFor={searchId}
        className="text-sm font-medium"
      >
        Buscar pacientes
      </label>
      <Input
        id={searchId}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Digite o nome do paciente..."
        aria-describedby={`${searchId}-description`}
      />
      <p 
        id={`${searchId}-description`}
        className="text-xs text-muted-foreground"
      >
        Use pelo menos 2 caracteres para buscar
      </p>
    </div>
  )
}
```

#### Keyboard Navigation
```typescript
// Navegação por teclado otimizada
export function DataTable({ data }: { data: Patient[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, data.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        event.preventDefault()
        // Handle selection
        break
    }
  }
  
  return (
    <div
      role="grid"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Tabela de pacientes"
    >
      {/* Table implementation */}
    </div>
  )
}
```

### Validação e Formulários

#### React Hook Form + Zod Integration
```typescript
// Form validation com Zod e React Hook Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patientSchema } from '@neonpro/utils/validators'
import type { CreatePatientData } from '@neonpro/types'

export function PatientForm() {
  const form = useForm<CreatePatientData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      cpf: '',
      birthDate: undefined,
      lgpdConsent: false
    }
  })
  
  const onSubmit = async (data: CreatePatientData) => {
    try {
      await createPatient(data)
      toast.success('Paciente criado com sucesso!')
      form.reset()
    } catch (error) {
      toast.error('Erro ao criar paciente')
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Outros campos */}
      </form>
    </Form>
  )
}
```

### Conformidade Regulatória

#### LGPD Compliance Components
```typescript
// Componente de consentimento LGPD
export function LGPDConsent() {
  const [consent, setConsent] = useState(false)
  
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="font-semibold">Proteção de Dados Pessoais</h3>
      <p className="text-sm text-muted-foreground">
        De acordo com a Lei Geral de Proteção de Dados (LGPD), precisamos 
        do seu consentimento para processar seus dados pessoais.
      </p>
      
      <div className="flex items-start space-x-2">
        <Checkbox
          id="lgpd-consent"
          checked={consent}
          onCheckedChange={setConsent}
        />
        <label 
          htmlFor="lgpd-consent"
          className="text-sm leading-relaxed"
        >
          Concordo com o processamento dos meus dados pessoais conforme 
          descrito na <Link href="/privacy" className="underline">
            Política de Privacidade
          </Link>.
        </label>
      </div>
    </div>
  )
}
```

### Testing Strategy

#### Component Testing
```typescript
// __tests__/components/patient-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { PatientCard } from '@neonpro/ui'
import type { Patient } from '@neonpro/types'

const mockPatient: Patient = {
  id: '1',
  name: 'João Silva',
  email: 'joao@example.com',
  status: 'active',
  last_appointment: '2024-01-15'
}

describe('PatientCard', () => {
  it('renders patient information correctly', () => {
    render(<PatientCard patient={mockPatient} />)
    
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('joao@example.com')).toBeInTheDocument()
  })
  
  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn()
    render(<PatientCard patient={mockPatient} onEdit={onEdit} />)
    
    fireEvent.click(screen.getByText('Editar'))
    expect(onEdit).toHaveBeenCalledWith(mockPatient)
  })
})
```

### Próximos Passos

1. **Component Library Enhancement**: Expansão dos componentes base
2. **Performance Monitoring**: Implementação de métricas detalhadas  
3. **Accessibility Audit**: Auditoria completa de acessibilidade
4. **Mobile Optimization**: Otimização para dispositivos móveis
5. **Design System Documentation**: Documentação visual dos componentes---

## Architecture Consistency Validation ✅

**Last Updated**: 2025-08-05

### Technology Stack Alignment
- **Turborepo Patterns**: Consistent monorepo structure across both documents
- **Next.js 14+**: App Router and Server Components as specified in architecture
- **TypeScript**: Strict mode compliance maintained in both specifications
- **Supabase**: RLS and real-time features aligned with database architecture
- **Tailwind CSS**: Design system consistency with component architecture

### Modern SaaS Patterns Integration
- **Feature Flags**: Compatible with existing component structure
- **Observability**: Structured logging integrated with healthcare compliance
- **Multi-layer Caching**: Aligns with performance optimization strategies
- **Error Boundaries**: Integrates with existing error handling patterns
- **Offline-First PWA**: Compatible with service worker implementation

### Healthcare Compliance Consistency
- **LGPD**: Data privacy controls consistent across architecture and frontend
- **ANVISA**: Regulatory compliance maintained in audit logging and UI patterns
- **CFM**: Medical professional workflows supported in both specifications

### Performance & Quality Standards
- **Core Web Vitals**: Optimization strategies aligned between documents
- **Bundle Size**: Component splitting strategy maintains architecture goals
- **Testing Coverage**: Testing patterns support architectural requirements
- **Accessibility**: WCAG compliance maintained across all layers

**Validation Status**: ✅ All specifications are consistent and mutually supportive

---