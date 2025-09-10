---
title: "NeonPro Frontend Implementation Specification"
last_updated: 2025-09-10
form: how-to
tags: [frontend, healthcare, implementation, components]
related:
  - ./frontend-architecture.md
  - ./tech-stack.md
  - ./source-tree.md
  - ../rules/coding-standards.md
---

# NeonPro Frontend Implementation Specification

## Introduction

This document defines **healthcare-specific frontend implementation patterns** for NeonPro aesthetic clinic management platform. It focuses exclusively on components, APIs, and patterns unique to aesthetic healthcare workflows.

**Prerequisites**: Read [Tech Stack](./tech-stack.md), [Source Tree](./source-tree.md), and [Coding Standards](../rules/coding-standards.md)

## Healthcare Component Standards

### Base Healthcare Component Interface

```typescript
interface HealthcareComponentProps {
  readonly patientId?: string
  readonly userRole: 'admin' | 'professional' | 'coordinator'
  readonly lgpdCompliant: boolean
  readonly onAuditLog?: (action: string, details?: Record<string, any>) => void
}
```

### Patient Risk Assessment Card

```typescript
interface PatientRiskCardProps extends HealthcareComponentProps {
  patient: Patient
  riskScore: NoShowRiskScore
  onScheduleIntervention: (interventionType: string) => void
}

export function PatientRiskCard({ 
  patient, 
  riskScore, 
  onScheduleIntervention 
}: PatientRiskCardProps) {
  const getRiskColor = (score: number) => {
    if (score >= 0.7) return 'bg-red-100 border-red-300 text-red-800'
    if (score >= 0.4) return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    return 'bg-green-100 border-green-300 text-green-800'
  }

  return (
    <Card className={cn('transition-all', getRiskColor(riskScore.score))}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{patient.name}</CardTitle>
          <Badge variant="outline" className="font-mono">
            {Math.round(riskScore.score * 100)}% risco
          </Badge>
        </div>
        <div className="space-y-1 text-sm">
          <p>Próximo: {patient.nextAppointment}</p>
          <p>Histórico: {riskScore.historicalNoShows} faltas</p>
        </div>
      </CardHeader>
      {riskScore.score >= 0.4 && (
        <CardFooter>
          <Button 
            onClick={() => onScheduleIntervention('reminder')}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Agendar Lembrete
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
```

### AI Chat for Aesthetic Procedures

```typescript
interface AestheticAIChatProps extends HealthcareComponentProps {
  context: 'scheduling' | 'procedures' | 'aftercare' | 'emergency'
  onEmergencyDetected: (severity: 'low' | 'medium' | 'high') => void
}

export function AestheticAIChat({ 
  context, 
  patientId, 
  onEmergencyDetected 
}: AestheticAIChatProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/aesthetic-chat',
    body: {
      language: 'pt-BR',
      context,
      patientId,
      specialization: 'aesthetic_procedures'
    },
    onFinish: (message) => {
      if (message.metadata?.emergencyDetected) {
        onEmergencyDetected(message.metadata.severity)
      }
    }
  })

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Assistente Estético</h3>
          <Badge variant="outline">
            {context === 'emergency' ? 'Emergência' : 'Consulta'}
          </Badge>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <div key={message.id} className={cn(
            'mb-4 p-3 rounded-lg',
            message.role === 'user' 
              ? 'bg-blue-100 ml-8' 
              : 'bg-gray-100 mr-8'
          )}>
            <p>{message.content}</p>
            {message.metadata?.procedureRecommendation && (
              <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-sm font-medium">Recomendação:</p>
                <p className="text-sm">{message.metadata.procedureRecommendation}</p>
              </div>
            )}
          </div>
        ))}
      </ScrollArea>

      <CardFooter className="border-t">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Pergunte sobre procedimentos estéticos..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            Enviar
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
```

### Appointment Scheduler for Procedures

```typescript
interface AestheticSchedulerProps extends HealthcareComponentProps {
  availableSlots: TimeSlot[]
  procedures: AestheticProcedure[]
  onScheduleAppointment: (appointment: AppointmentRequest) => Promise<void>
}

export function AestheticScheduler({ 
  availableSlots, 
  procedures, 
  patientId,
  onScheduleAppointment 
}: AestheticSchedulerProps) {
  const [selectedProcedure, setSelectedProcedure] = useState<AestheticProcedure>()
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>()

  const procedureDurations = {
    'botox': 30,
    'preenchimento': 45,
    'peeling': 60,
    'laser': 90
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendar Procedimento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Procedimento</Label>
          <Select onValueChange={(value) => {
            const procedure = procedures.find(p => p.id === value)
            setSelectedProcedure(procedure)
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o procedimento" />
            </SelectTrigger>
            <SelectContent>
              {procedures.map((procedure) => (
                <SelectItem key={procedure.id} value={procedure.id}>
                  <div className="flex justify-between w-full">
                    <span>{procedure.name}</span>
                    <span className="text-sm text-muted-foreground">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                  size="sm"
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
                patientId: patientId!,
                procedureId: selectedProcedure.id,
                slotId: selectedSlot.id,
                duration: procedureDurations[selectedProcedure.type] || 60
              })
            }
          }}
          disabled={!selectedProcedure || !selectedSlot}
          className="w-full"
        >
          Confirmar Agendamento
        </Button>
      </CardFooter>
    </Card>
  )
}
```

## API Integration Patterns

### Patient Management API

```typescript
export const patientsAPI = {
  getPatientWithHistory: async (patientId: string): Promise<PatientWithHistory> => {
    const response = await api.get(`/patients/${patientId}?include=aesthetic_history`)
    return response.data
  },

  updateAestheticPreferences: async (
    patientId: string, 
    preferences: AestheticPreferences
  ): Promise<Patient> => {
    const response = await api.patch(`/patients/${patientId}/aesthetic-preferences`, {
      preferences,
      updatedBy: getCurrentUser().id,
      lgpdConsent: true
    })
    return response.data
  },

  getNoShowRisk: async (patientId: string): Promise<NoShowRiskScore> => {
    const response = await api.get(`/patients/${patientId}/no-show-risk`)
    return response.data
  }
}
```

### AI Integration for Procedures

```typescript
export const aestheticAI = {
  chatWithProcedureContext: async (
    messages: ChatMessage[],
    context: {
      patientId?: string
      procedureType?: string
      clinicSpecialization: string[]
    }
  ): Promise<AIChatResponse> => {
    const response = await api.post('/ai/aesthetic-chat', {
      messages,
      context: {
        ...context,
        language: 'pt-BR',
        domain: 'aesthetic_procedures'
      }
    })
    return response.data
  },

  getProcedureRecommendations: async (
    patientProfile: PatientProfile
  ): Promise<ProcedureRecommendation[]> => {
    const response = await api.post('/ai/procedure-recommendations', {
      patientProfile,
      clinicCapabilities: getCurrentClinic().capabilities
    })
    return response.data
  }
}
```

## State Management for Clinics

### Aesthetic Patient Store

```typescript
interface AestheticPatientStore {
  patients: PatientWithHistory[]
  selectedPatient: PatientWithHistory | null
  riskAssessments: Record<string, NoShowRiskScore>
  
  loadPatientWithHistory: (patientId: string) => Promise<void>
  updateAestheticPreferences: (patientId: string, preferences: AestheticPreferences) => Promise<void>
  calculateNoShowRisk: (patientId: string) => Promise<void>
}

export const useAestheticPatientStore = create<AestheticPatientStore>((set, get) => ({
  patients: [],
  selectedPatient: null,
  riskAssessments: {},

  loadPatientWithHistory: async (patientId: string) => {
    try {
      const patient = await patientsAPI.getPatientWithHistory(patientId)
      const riskScore = await patientsAPI.getNoShowRisk(patientId)
      
      set(state => ({
        selectedPatient: patient,
        riskAssessments: {
          ...state.riskAssessments,
          [patientId]: riskScore
        }
      }))
    } catch (error) {
      console.error('Failed to load patient:', error)
    }
  },

  updateAestheticPreferences: async (patientId: string, preferences: AestheticPreferences) => {
    try {
      await patientsAPI.updateAestheticPreferences(patientId, preferences)
      
      set(state => ({
        patients: state.patients.map(p => 
          p.id === patientId ? { ...p, aestheticPreferences: preferences } : p
        )
      }))
    } catch (error) {
      console.error('Failed to update preferences:', error)
    }
  },

  calculateNoShowRisk: async (patientId: string) => {
    try {
      const riskScore = await patientsAPI.getNoShowRisk(patientId)
      
      set(state => ({
        riskAssessments: {
          ...state.riskAssessments,
          [patientId]: riskScore
        }
      }))
    } catch (error) {
      console.error('Failed to calculate risk:', error)
    }
  }
}))
```

## Mobile-First Patterns

### Touch-Optimized Procedure Selection

```typescript
export function MobileProcedureSelector({ 
  procedures, 
  onSelect 
}: {
  procedures: AestheticProcedure[]
  onSelect: (procedure: AestheticProcedure) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {procedures.map((procedure) => (
        <Button
          key={procedure.id}
          variant="outline"
          className={cn(
            'h-16 p-4 justify-start text-left', // 64px touch target
            'active:scale-95 transition-transform'
          )}
          onClick={() => onSelect(procedure)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {procedure.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium">{procedure.name}</p>
              <p className="text-sm text-muted-foreground">
                {procedure.duration}min • R$ {procedure.price}
              </p>
            </div>
          </div>
        </Button>
      ))}
    </div>
  )
}
```

### Swipe Gestures for Patient Management

```typescript
export function useSwipeGestures(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void
) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft()
    if (isRightSwipe && onSwipeRight) onSwipeRight()
  }

  return { onTouchStart, onTouchMove, onTouchEnd }
}
```

## Accessibility for Healthcare

### Screen Reader Support for Medical Data

```typescript
export function MedicalDataWithScreenReader({ 
  data, 
  label 
}: {
  data: string | number
  label: string
}) {
  return (
    <div>
      <span className="sr-only">{label}: {data}</span>
      <span aria-hidden="true">{data}</span>
    </div>
  )
}
```

### High Contrast Mode

```typescript
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setIsHighContrast(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return { isHighContrast }
}
```

## Testing Healthcare Components

### Mock Data Utilities

```typescript
export const createMockPatient = (overrides: Partial<Patient> = {}): Patient => ({
  id: 'patient-123',
  name: 'João Silva',
  cpf: '123.456.789-01',
  lgpdCompliant: true,
  noShowRisk: 'low',
  lastProcedure: 'Botox',
  nextAppointment: '2025-09-15T14:00:00Z',
  aestheticPreferences: {
    preferredProcedures: ['botox', 'preenchimento'],
    skinType: 'oleosa',
    allergies: []
  },
  ...overrides
})

export const createMockRiskScore = (score: number = 0.3): NoShowRiskScore => ({
  score,
  factors: ['historical_no_shows', 'appointment_frequency'],
  historicalNoShows: Math.floor(score * 10),
  lastCalculated: new Date().toISOString()
})
```

### Component Testing Example

```typescript
describe('PatientRiskCard', () => {
  it('displays high risk styling for high-risk patients', () => {
    const mockPatient = createMockPatient()
    const mockRiskScore = createMockRiskScore(0.8)

    render(
      <PatientRiskCard
        patient={mockPatient}
        riskScore={mockRiskScore}
        userRole="professional"
        lgpdCompliant={true}
        onScheduleIntervention={jest.fn()}
      />
    )

    expect(screen.getByText('80% risco')).toBeInTheDocument()
    expect(screen.getByText('Agendar Lembrete')).toBeInTheDocument()
  })
})
```

## Performance Optimization

### Lazy Loading for Heavy Components

```typescript
const AestheticScheduler = lazy(() => import('./components/AestheticScheduler'))

export function LazyAestheticScheduler(props: AestheticSchedulerProps) {
  return (
    <Suspense fallback={<SchedulerSkeleton />}>
      <AestheticScheduler {...props} />
    </Suspense>
  )
}
```

### Mobile Performance Monitoring

```typescript
export function useMobilePerformance() {
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        console.warn('Slow connection detected')
        // Enable performance mode
      }
    }
  }, [])
}
```

## See Also

- [Frontend Architecture](./frontend-architecture.md) - High-level architectural decisions
- [Technology Stack](./tech-stack.md) - Technology choices and rationale  
- [Source Tree](./source-tree.md) - Project structure and organization
- [Coding Standards](../rules/coding-standards.md) - General coding patterns