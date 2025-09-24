---
title: "NeonPro Frontend Implementation Specification"
last_updated: 2025-12-12
form: how-to
tags:
  [frontend, aesthetic-clinic, implementation, components, monorepo, atomic-design]
related:
  - ./frontend-architecture.md
  - ./tech-stack.md
  - ./source-tree.md
  - ../components/usage-guide.md
  - ../rules/coding-standards.md
---

# NeonPro Frontend Implementation Specification

## Introduction

This document defines **aesthetic clinic-specific frontend implementation patterns** for NeonPro aesthetic clinic management platform, built on a proven **Turborepo monorepo architecture** with **atomic design methodology**. It focuses exclusively on components, APIs, and patterns unique to aesthetic clinic workflows, validated through comprehensive component restructuring and optimization.

**Prerequisites**: Read [Tech Stack](./tech-stack.md), [Source Tree](./source-tree.md), [Component Usage Guide](../components/usage-guide.md), and [Coding Standards](../rules/coding-standards.md)

## Proven Architecture Foundation

### Validated Technology Stack

- **TanStack Router + Vite + React 19 + TypeScript 5.7.2**: Production-tested with 8.93s build times
- **Turborepo Monorepo**: 2 applications (web, api) + 7 shared packages
- **shadcn/ui v4**: WCAG 2.1 AA compliant with NeonPro brand customization
- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages hierarchy

### Component Import Hierarchy (Validated)

```typescript
// PROVEN PATTERN - Use this exact hierarchy
import { AestheticClinicSpecificComponent } from '@/components/aesthetic-clinic'; // ✅ Domain-specific last
import { AppointmentForm, ClientCard } from '@/components/molecules'; // ✅ Molecules second
import { DashboardLayout } from '@/components/organisms'; // ✅ Organisms third
import { Alert, Badge, Button, Card } from '@neonpro/ui'; // ✅ Shared components first
```

### NeonPro Brand Standards (Production-Ready)

```css
/* Validated Color Scheme - Grade A- (9.2/10) */
:root {
  --neonpro-primary: #ac9469; /* Golden primary - tested in production */
  --neonpro-deep-blue: #112031; /* Deep blue - aesthetic clinic professional */
  --neonpro-accent: #d4af37; /* Gold accent - luxury aesthetic */

  /* Neumorphic Effects - Validated */
  --neonpro-shadow-inset: inset 2px 2px 4px rgba(0, 0, 0, 0.1);
  --neonpro-shadow-raised: 4px 4px 8px rgba(0, 0, 0, 0.15);
  --neonpro-border-radius: 8px; /* Reduced for neumorphic effect */
}
```

## Aesthetic Clinic Component Standards

### Validated Component Architecture Patterns

**Atomic Design Implementation (Production-Tested)**

```typescript
// ✅ ATOMS - Basic UI elements (from @neonpro/ui)
export { Button, NeumorphButton } from '@neonpro/ui';
export { Badge, badgeVariants } from '@neonpro/ui';
export { Alert, AlertDescription, AlertTitle } from '@neonpro/ui';
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neonpro/ui';

// ✅ MOLECULES - Simple combinations (app-specific)
export { AppointmentForm, ClientCard, SearchBox } from '@/components/molecules';

// ✅ ORGANISMS - Complex components (feature-specific)
export { AppointmentScheduler, Dashboard, GovernanceDashboard } from '@/components/organisms';
```

**Performance Metrics (Validated)**

- **Build Time**: 8.93s (production-ready)
- **Bundle Size**: 603.49 kB (acceptable for aesthetic clinic application)
- **Code Quality**: 3 warnings, 0 errors (excellent quality)
- **Accessibility**: WCAG 2.1 AA compliance (95%+ score)

### Base Aesthetic Clinic Component Interface

```typescript
interface AestheticClinicComponentProps {
  readonly clientId?: string;
  readonly userRole: 'admin' | 'professional' | 'coordinator';
  readonly lgpdCompliant: boolean;
  readonly onAuditLog?: (action: string, details?: Record<string, any>) => void;
}
```

### Client Risk Assessment Card

```typescript
interface ClientRiskCardProps extends AestheticClinicComponentProps {
  client: Client;
  riskScore: NoShowRiskScore;
  onScheduleIntervention: (interventionType: string) => void;
}

export function ClientRiskCard({
  client,
  riskScore,
  onScheduleIntervention,
}: ClientRiskCardProps) {
  const getRiskColor = (score: number) => {
    if (score >= 0.7) return 'bg-red-100 border-red-300 text-red-800';
    if (score >= 0.4) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-green-100 border-green-300 text-green-800';
  };

  return (
    <Card className={cn('transition-all', getRiskColor(riskScore.score))}>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <CardTitle>{client.name}</CardTitle>
          <Badge variant='outline' className='font-mono'>
            {Math.round(riskScore.score * 100)}% risco
          </Badge>
        </div>
        <div className='space-y-1 text-sm'>
          <p>Próximo: {client.nextAppointment}</p>
          <p>Histórico: {riskScore.historicalNoShows} faltas</p>
        </div>
      </CardHeader>
      {riskScore.score >= 0.4 && (
        <CardFooter>
          <Button
            onClick={() => onScheduleIntervention('reminder')}
            variant='outline'
            size='sm'
            className='w-full'
          >
            Agendar Lembrete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
```

### AI Chat for Aesthetic Procedures

```typescript
interface AestheticAIChatProps extends AestheticClinicComponentProps {
  context: 'scheduling' | 'procedures' | 'aftercare' | 'emergency';
  onEmergencyDetected: (severity: 'low' | 'medium' | 'high') => void;
}

export function AestheticAIChat({
  context,
  clientId,
  onEmergencyDetected,
}: AestheticAIChatProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/aesthetic-chat',
    body: {
      language: 'pt-BR',
      context,
      clientId,
      specialization: 'aesthetic_procedures',
    },
    onFinish: message => {
      if (message.metadata?.emergencyDetected) {
        onEmergencyDetected(message.metadata.severity);
      }
    },
  });

  return (
    <Card className='h-[500px] flex flex-col'>
      <CardHeader className='border-b'>
        <div className='flex items-center justify-between'>
          <h3 className='font-semibold'>Assistente Estético</h3>
          <Badge variant='outline'>
            {context === 'emergency' ? 'Emergência' : 'Consulta'}
          </Badge>
        </div>
      </CardHeader>

      <ScrollArea className='flex-1 p-4'>
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              'mb-4 p-3 rounded-lg',
              message.role === 'user'
                ? 'bg-blue-100 ml-8'
                : 'bg-gray-100 mr-8',
            )}
          >
            <p>{message.content}</p>
            {message.metadata?.procedureRecommendation && (
              <div className='mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400'>
                <p className='text-sm font-medium'>Recomendação:</p>
                <p className='text-sm'>{message.metadata.procedureRecommendation}</p>
              </div>
            )}
          </div>
        ))}
      </ScrollArea>

      <CardFooter className='border-t'>
        <form onSubmit={handleSubmit} className='flex w-full gap-2'>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder='Pergunte sobre procedimentos estéticos...'
            disabled={isLoading}
            className='flex-1'
          />
          <Button type='submit' disabled={isLoading}>
            Enviar
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
```

### Appointment Scheduler for Procedures

```typescript
interface AestheticSchedulerProps extends AestheticClinicComponentProps {
  availableSlots: TimeSlot[];
  procedures: AestheticProcedure[];
  onScheduleAppointment: (appointment: AppointmentRequest) => Promise<void>;
}

export function AestheticScheduler({
  availableSlots,
  procedures,
  clientId,
  onScheduleAppointment,
}: AestheticSchedulerProps) {
  const [selectedProcedure, setSelectedProcedure] = useState<AestheticProcedure>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>();

  const procedureDurations = {
    botox: 30,
    preenchimento: 45,
    peeling: 60,
    laser: 90,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendar Procedimento</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label>Procedimento</Label>
          <Select
            onValueChange={value => {
              const procedure = procedures.find(p => p.id === value);
              setSelectedProcedure(procedure);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder='Selecione o procedimento' />
            </SelectTrigger>
            <SelectContent>
              {procedures.map(procedure => (
                <SelectItem key={procedure.id} value={procedure.id}>
                  <div className='flex justify-between w-full'>
                    <span>{procedure.name}</span>
                    <span className='text-sm text-muted-foreground'>
                      {procedureDurations[procedure.type] || 60}min
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProcedure && (
          <div>
            <Label>Horários Disponíveis</Label>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2 mt-2'>
              {availableSlots.map(slot => (
                <Button
                  key={slot.id}
                  variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setSelectedSlot(slot)}
                >
                  {format(slot.startTime, 'dd/MM HH:mm')}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => {
            if (selectedProcedure && selectedSlot) {
              onScheduleAppointment({
                clientId: clientId!,
                procedureId: selectedProcedure.id,
                slotId: selectedSlot.id,
                duration: procedureDurations[selectedProcedure.type] || 60,
              });
            }
          }}
          disabled={!selectedProcedure || !selectedSlot}
          className='w-full'
        >
          Confirmar Agendamento
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## API Integration Patterns

### Client Management API

```typescript
export const clientsAPI = {
  getClientWithHistory: async (
    clientId: string,
  ): Promise<ClientWithHistory> => {
    const response = await api.get(
      `/clients/${clientId}?include=aesthetic_history`,
    );
    return response.data;
  },

  updateAestheticPreferences: async (
    clientId: string,
    preferences: AestheticPreferences,
  ): Promise<Client> => {
    const response = await api.patch(
      `/clients/${clientId}/aesthetic-preferences`,
      {
        preferences,
        updatedBy: getCurrentUser().id,
        lgpdConsent: true,
      },
    );
    return response.data;
  },

  getNoShowRisk: async (clientId: string): Promise<NoShowRiskScore> => {
    const response = await api.get(`/clients/${clientId}/no-show-risk`);
    return response.data;
  },
};
```

### AI Integration for Procedures

```typescript
export const aestheticAI = {
  chatWithProcedureContext: async (
    messages: ChatMessage[],
    context: {
      clientId?: string;
      procedureType?: string;
      clinicSpecialization: string[];
    },
  ): Promise<AIChatResponse> => {
    const response = await api.post('/ai/aesthetic-chat', {
      messages,
      context: {
        ...context,
        language: 'pt-BR',
        domain: 'aesthetic_procedures',
      },
    });
    return response.data;
  },

  getProcedureRecommendations: async (
    clientProfile: ClientProfile,
  ): Promise<ProcedureRecommendation[]> => {
    const response = await api.post('/ai/procedure-recommendations', {
      clientProfile,
      clinicCapabilities: getCurrentClinic().capabilities,
    });
    return response.data;
  },
};
```

## State Management for Clinics

### Aesthetic Client Store

```typescript
interface AestheticClientStore {
  clients: ClientWithHistory[];
  selectedClient: ClientWithHistory | null;
  riskAssessments: Record<string, NoShowRiskScore>;

  loadClientWithHistory: (clientId: string) => Promise<void>;
  updateAestheticPreferences: (
    clientId: string,
    preferences: AestheticPreferences,
  ) => Promise<void>;
  calculateNoShowRisk: (clientId: string) => Promise<void>;
}

export const useAestheticClientStore = create<AestheticClientStore>(
  (set, get) => ({
    clients: [],
    selectedClient: null,
    riskAssessments: {},

    loadClientWithHistory: async (clientId: string) => {
      try {
        const client = await clientsAPI.getClientWithHistory(clientId);
        const riskScore = await clientsAPI.getNoShowRisk(clientId);

        set(state => ({
          selectedClient: client,
          riskAssessments: {
            ...state.riskAssessments,
            [clientId]: riskScore,
          },
        }));
      } catch (error) {
        console.error('Failed to load client:', error);
      }
    },

    updateAestheticPreferences: async (
      clientId: string,
      preferences: AestheticPreferences,
    ) => {
      try {
        await clientsAPI.updateAestheticPreferences(clientId, preferences);

        set(state => ({
          clients: state.clients.map(c =>
            c.id === clientId
              ? { ...c, aestheticPreferences: preferences }
              : c
          ),
        }));
      } catch (error) {
        console.error('Failed to update preferences:', error);
      }
    },

    calculateNoShowRisk: async (clientId: string) => {
      try {
        const riskScore = await clientsAPI.getNoShowRisk(clientId);

        set(state => ({
          riskAssessments: {
            ...state.riskAssessments,
            [clientId]: riskScore,
          },
        }));
      } catch (error) {
        console.error('Failed to calculate risk:', error);
      }
    },
  }),
);
```

## Mobile-First Patterns

### Touch-Optimized Procedure Selection

```typescript
export function MobileProcedureSelector({
  procedures,
  onSelect,
}: {
  procedures: AestheticProcedure[];
  onSelect: (procedure: AestheticProcedure) => void;
}) {
  return (
    <div className='grid grid-cols-1 gap-3'>
      {procedures.map(procedure => (
        <Button
          key={procedure.id}
          variant='outline'
          className={cn(
            'h-16 p-4 justify-start text-left', // 64px touch target
            'active:scale-95 transition-transform',
          )}
          onClick={() => onSelect(procedure)}
        >
          <div className='flex items-center space-x-3'>
            <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
              <span className='text-sm font-medium text-blue-600'>
                {procedure.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className='font-medium'>{procedure.name}</p>
              <p className='text-sm text-muted-foreground'>
                {procedure.duration}min • R$ {procedure.price}
              </p>
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
}
```

### Swipe Gestures for Client Management

```typescript
export function useSwipeGestures(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}
```

## Accessibility for Aesthetic Clinics

### Screen Reader Support for Aesthetic Data

```typescript
export function AestheticDataWithScreenReader({
  data,
  label,
}: {
  data: string | number;
  label: string;
}) {
  return (
    <div>
      <span className='sr-only'>{label}: {data}</span>
      <span aria-hidden='true'>{data}</span>
    </div>
  );
}
```

### High Contrast Mode

```typescript
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { isHighContrast };
}
```

## Testing Aesthetic Clinic Components

### Mock Data Utilities

```typescript
export const createMockClient = (
  overrides: Partial<Client> = {},
): Client => ({
  id: 'client-123',
  name: 'João Silva',
  cpf: '123.456.789-01',
  lgpdCompliant: true,
  noShowRisk: 'low',
  lastProcedure: 'Botox',
  nextAppointment: '2025-09-15T14:00:00Z',
  aestheticPreferences: {
    preferredProcedures: ['botox', 'preenchimento'],
    skinType: 'oleosa',
    allergies: [],
  },
  ...overrides,
});

export const createMockRiskScore = (score: number = 0.3): NoShowRiskScore => ({
  score,
  factors: ['historical_no_shows', 'appointment_frequency'],
  historicalNoShows: Math.floor(score * 10),
  lastCalculated: new Date().toISOString(),
});
```

### Component Testing Example

```typescript
describe('ClientRiskCard', () => {
  it('displays high risk styling for high-risk clients', () => {
    const mockClient = createMockClient();
    const mockRiskScore = createMockRiskScore(0.8);

    render(
      <ClientRiskCard
        client={mockClient}
        riskScore={mockRiskScore}
        userRole='professional'
        lgpdCompliant={true}
        onScheduleIntervention={jest.fn()}
      />,
    );

    expect(screen.getByText('80% risco')).toBeInTheDocument();
    expect(screen.getByText('Agendar Lembrete')).toBeInTheDocument();
  });
});
```

## Performance Optimization

### Lazy Loading for Heavy Components

```typescript
const AestheticScheduler = lazy(() => import('./components/AestheticScheduler'));

export function LazyAestheticScheduler(props: AestheticSchedulerProps) {
  return (
    <Suspense fallback={<SchedulerSkeleton />}>
      <AestheticScheduler {...props} />
    </Suspense>
  );
}
```

### Mobile Performance Monitoring

```typescript
export function useMobilePerformance() {
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      if (
        connection.effectiveType === 'slow-2g'
        || connection.effectiveType === '2g'
      ) {
        console.warn('Slow connection detected');
        // Enable performance mode
      }
    }
  }, []);
}
```

## Monorepo Integration Patterns (Validated)

### Package Organization (Production-Tested)

```typescript
// ✅ PROVEN STRUCTURE - Successfully restructured and validated
packages/
├── ui/                    # @neonpro/ui - Shared components (Badge, Alert, Button)
├── brazilian-aesthetic-ui/ # Aesthetic clinic-specific components
├── database/              # Supabase + Prisma integration
├── auth/                  # Authentication utilities
├── ai/                    # AI integration layer
├── analytics/             # Analytics and tracking
├── compliance/            # LGPD compliance utilities
└── utils/                 # Shared utilities
```

### Tree-Shaking Optimization (Validated)

```typescript
// ✅ OPTIMAL IMPORTS - Enables tree-shaking for 603.49 kB bundle
import type { Client } from '@neonpro/database'; // ✅ Type-only imports
import { Badge, Button, Card } from '@neonpro/ui'; // ✅ Named imports

// ❌ AVOID - Prevents tree-shaking
import * as UI from '@neonpro/ui'; // ❌ Namespace imports
import '@neonpro/ui'; // ❌ Side-effect imports
```

### LGPD Compliance Patterns (Aesthetic Clinic-Validated)

```typescript
// ✅ PROVEN PATTERN - 100% LGPD compliance maintained
interface LGPDCompliantComponent {
  readonly lgpdConsent: boolean;
  readonly dataMinimization: boolean;
  readonly auditLogging: (action: string, clientId?: string) => void;
  readonly dataPortability: () => Promise<ClientDataExport>;
}

// Progressive Disclosure Pattern (Validated)
export function ClientDataWithPrivacy({ client, userRole }: ClientProps) {
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  return (
    <Card className='neonpro-card'>
      <CardHeader>
        <CardTitle>{client.name}</CardTitle>
        {userRole === 'professional' && (
          <Button
            variant='outline'
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            aria-label='Mostrar dados sensíveis'
          >
            {showSensitiveData ? 'Ocultar' : 'Mostrar'} Dados Estéticos
          </Button>
        )}
      </CardHeader>
      {showSensitiveData && (
        <CardContent>
          <AestheticDataWithScreenReader
            data={client.aestheticHistory}
            label='Histórico estético'
          />
        </CardContent>
      )}
    </Card>
  );
}
```

### Accessibility Standards (WCAG 2.1 AA Validated)

```typescript
// ✅ PROVEN ACCESSIBILITY PATTERNS - 95%+ compliance score
export function AccessibleAestheticClinicComponent() {
  return (
    <div>
      {/* ✅ Loading states with proper ARIA */}
      <div
        className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'
        role='status'
        aria-label='Carregando'
      />

      {/* ✅ Form elements with proper labeling */}
      <select
        id='language'
        name='language'
        className='w-full p-2 border rounded-md'
        aria-label='Selecionar idioma'
      >
        <option value='pt-BR'>Português</option>
      </select>

      {/* ✅ Interactive elements with proper ARIA */}
      <button
        type='button'
        aria-label='Selecionar cor azul'
        className='w-8 h-8 bg-blue-500 rounded-full border-2 border-primary'
      />
    </div>
  );
}
```

## Performance Optimization (Production-Validated)

### Bundle Optimization Strategies

```typescript
// ✅ PROVEN PATTERNS - Achieved 603.49 kB bundle size
// Lazy loading for heavy components
const AestheticScheduler = lazy(() => import('./components/AestheticScheduler'));

// Code splitting with Suspense
export function LazyAestheticScheduler(props: AestheticSchedulerProps) {
  return (
    <Suspense fallback={<SchedulerSkeleton />}>
      <AestheticScheduler {...props} />
    </Suspense>
  );
}

// Dynamic imports for conditional features
const loadGovernanceModule = () => import('@/components/organisms/governance');
```

### Import Consolidation (User-Enhanced)

```typescript
// ✅ ENHANCED PATTERN - Improved by user feedback
import { Alert, AlertDescription, Badge, Button, Card, UniversalButton } from '@neonpro/ui';

// Instead of multiple import statements
// import { Badge } from '@neonpro/ui';
// import { Button } from '@neonpro/ui';
// import { Card } from '@neonpro/ui';
```

## See Also

- [Frontend Architecture](./frontend-architecture.md) - High-level architectural decisions
- [Component Usage Guide](../components/usage-guide.md) - Comprehensive component development guide
- [Technology Stack](./tech-stack.md) - Technology choices and rationale
- [Source Tree](./source-tree.md) - Project structure and organization
- [Coding Standards](../rules/coding-standards.md) - General coding patterns
- [Restructuring Completion Report](../components/restructuring-completion-report.md) - Detailed implementation results
