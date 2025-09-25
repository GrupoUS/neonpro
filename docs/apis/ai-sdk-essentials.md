---
title: "AI SDK Essentials - Healthcare Implementation with AG-UI & CopilotKit"
last_updated: 2025-09-24
form: reference
tags: [ai-sdk, vercel, ag-ui, copilotkit, healthcare, streaming]
related:
  - ./AGENTS.md
  - ./ai-agent-essentials.md
---

# AI SDK Essentials — Healthcare Implementation with AG-UI & CopilotKit

## Overview

This guide covers implementing AI services for healthcare applications using the Vercel AI SDK, AG-UI Protocol, and CopilotKit. The implementation focuses on healthcare compliance, real-time communication, and clinical decision support.

## Architecture Integration

### Core Components
- **Vercel AI SDK**: Streaming AI responses with tool calling
- **AG-UI Protocol**: Event-based communication for real-time updates
- **CopilotKit**: React hooks for state synchronization and actions
- **Healthcare Compliance**: LGPD, ANVISA, and clinical security features

## Quick Setup

### Install Dependencies

```bash
pnpm add ai @ai-sdk/openai @ai-sdk/anthropic @copilotkit/react zod
# For AG-UI protocol support
pnpm add @ag-ui-protocol/client
# For healthcare validation
pnpm add @neonpro/types @neonpro/shared
```

### Environment Configuration

```bash
# AI Provider Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Healthcare Compliance
LGPD_AUDIT_LOG_URL=https://audit.neonpro.com/api
ANVISA_COMPLIANCE_URL=https://compliance.neonpro.com/api

# Application Configuration
NEXT_PUBLIC_APP_URL=https://app.neonpro.com
WEBSOCKET_URL=wss://api.neonpro.com/ai/ws
```

## Server Implementation (Hono)

### Enhanced AI Server with Healthcare Features

```typescript
import { openai, anthropic } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { Hono } from 'hono'
import { z } from 'zod'
import { 
  Patient, 
  Appointment, 
  ClinicalDecision,
  LGPDComplianceService,
  ClinicalValidator 
} from '@neonpro/types'
import { 
  logHealthcareError, 
  auditAIInteraction,
  redactPII 
} from '@neonpro/shared'

const app = new Hono()

// Healthcare-specific tools
const healthcareTools = {
  // Patient management tools
  getPatientInfo: tool({
    description: 'Buscar informações completas do paciente',
    parameters: z.object({
      patientId: z.string().describe('ID do paciente'),
      includeHistory: z.boolean().optional().describe('Incluir histórico médico'),
    }),
    execute: async ({ patientId, includeHistory }) => {
      // LGPD compliance check
      const hasConsent = await checkPatientConsent(patientId, 'read')
      if (!hasConsent) {
        throw new Error('Consentimento do paciente não encontrado')
      }

      const patient = await db.patients.findUnique({
        where: { id: patientId },
        include: includeHistory ? { medicalHistory: true } : undefined
      })

      // Audit access for compliance
      await auditAIInteraction({
        action: 'getPatientInfo',
        patientId,
        metadata: { includeHistory }
      })

      return redactPII(patient) // Automatic PII redaction
    },
  }),

  // Appointment management tools
  bookAppointment: tool({
    description: 'Agendar consulta médica com validação de conflitos',
    parameters: z.object({
      patientId: z.string().describe('ID do paciente'),
      providerId: z.string().describe('ID do médico'),
      dateTime: z.string().describe('Data e hora da consulta'),
      procedure: z.string().describe('Procedimento a ser realizado'),
      duration: z.number().describe('Duração em minutos'),
    }),
    execute: async ({ patientId, providerId, dateTime, procedure, duration }) => {
      // Validate clinical requirements
      const validation = await ClinicalValidator.validateAppointment({
        patientId, providerId, dateTime, procedure
      })

      if (!validation.isValid) {
        throw new Error(`Agendamento inválido: ${validation.errors.join(', ')}`)
      }

      // Check for scheduling conflicts
      const conflicts = await checkAppointmentConflicts(providerId, dateTime, duration)
      if (conflicts.length > 0) {
        throw new Error(`Conflito de agendamento detectado: ${conflicts.map(c => c.reason).join(', ')}`)
      }

      const appointment = await db.appointments.create({
        data: {
          patientId, providerId, 
          dateTime: new Date(dateTime),
          procedure, duration,
          status: 'scheduled'
        }
      })

      // Send real-time update via AG-UI protocol
      await sendAGUIEvent({
        type: 'appointment.created',
        payload: { appointment },
        recipients: [patientId, providerId]
      })

      return appointment
    },
  }),

  // Clinical decision support tools
  clinicalDecisionSupport: tool({
    description: 'Analisar sintomas e fornecer recomendações clínicas',
    parameters: z.object({
      patientId: z.string().describe('ID do paciente'),
      symptoms: z.array(z.string()).describe('Sintomas relatados'),
      vitals: z.object({
        bloodPressure: z.string().optional(),
        heartRate: z.number().optional(),
        temperature: z.number().optional(),
        oxygenSaturation: z.number().optional(),
      }).optional(),
      context: z.string().describe('Contexto clínico adicional'),
    }),
    execute: async ({ patientId, symptoms, vitals, context }) => {
      // Get patient medical history
      const medicalHistory = await getPatientMedicalHistory(patientId)
      
      // Analyze with AI models
      const analysis = await analyzeClinicalData({
        symptoms, vitals, medicalHistory, context
      })

      // Check for urgent conditions
      const urgency = await assessClinicalUrgency(analysis)
      
      if (urgency.level === 'critical') {
        // Send immediate alert via AG-UI
        await sendAGUIEvent({
          type: 'clinical.alert',
          payload: {
            patientId,
            urgency: urgency.level,
            recommendations: urgency.recommendations,
            actionRequired: true
          },
          recipients: ['emergency', patientId, 'treating_physician']
        })
      }

      // Audit clinical decision for compliance
      await auditAIInteraction({
        action: 'clinicalDecisionSupport',
        patientId,
        metadata: { symptoms: symptoms.length, urgency: urgency.level }
      })

      return {
        analysis,
        urgency,
        recommendations: analysis.recommendations,
        confidence: analysis.confidence
      }
    },
  }),
}

app.post('/api/chat', async (c) => {
  const { messages, sessionId, context } = await c.req.json()

  // Validate healthcare context and permissions
  const healthcareContext = await validateHealthcareContext(context)
  
  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
    system: `Você é um assistente de IA especializado em saúde para clínicas estéticas.
    Siga rigorosamente as diretrizes LGPD, ANVISA e boas práticas médicas.
    Seja preciso, objetivo e sempre priorize a segurança do paciente.`,
    tools: healthcareTools,
    onFinish: async ({ text, toolResults }) => {
      // LGPD compliance logging
      await auditAIInteraction({
        sessionId,
        userId: healthcareContext.userId,
        patientId: healthcareContext.patientId,
        query: messages[messages.length - 1].content,
        response: redactPII(text),
        toolsUsed: toolResults?.map(tool => tool.toolName) || [],
      })

      // Send AG-UI event for real-time UI updates
      await sendAGUIEvent({
        type: 'chat.completed',
        payload: {
          sessionId,
          response: text,
          toolResults,
        },
        recipients: [healthcareContext.userId]
      })
    },
  })

  return result.toDataStreamResponse()
})
```

## Client Implementation with CopilotKit & AG-UI

### Enhanced Healthcare Chat Interface

```typescript
'use client'

import { useChat, useCopilotAction } from '@copilotkit/react'
import { useCoAgent } from '@copilotkit/react'
import { AGUIClient } from '@ag-ui-protocol/client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Patient, Appointment } from '@neonpro/types'

interface HealthcareAssistantState {
  patient: Patient | null
  appointments: Appointment[]
  clinicalNotes: any[]
  loading: boolean
  error: string | null
}

export function HealthcareAssistant() {
  const [state, setState] = useState<HealthcareAssistantState>({
    patient: null,
    appointments: [],
    clinicalNotes: [],
    loading: false,
    error: null,
  })

  // AG-UI client for real-time updates
  const [aguiClient] = useState(() => new AGUIClient({
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
    protocols: ['ag-ui-v1'],
    reconnect: {
      maxRetries: 5,
      delay: 1000,
    },
  }))

  // Chat interface with healthcare context
  const { messages, input, setInput, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    headers: {
      'X-Healthcare-Context': JSON.stringify({
        patientId: state.patient?.id,
        clinicId: 'clinic_123',
        role: 'doctor',
        urgency: 'normal',
      }),
    },
    onError: (error) => {
      console.error('Healthcare chat error:', error)
      setState(prev => ({ ...prev, error: error.message }))
      toast.error('Erro na comunicação com assistente médico.')
    },
    onFinish: (message) => {
      // Handle LGPD compliance notifications
      if (message.content.includes('informação confidencial')) {
        toast.warning('Informação de saúde confidencial detectada.')
      }
    },
  })

  // CopilotKit actions for healthcare operations
  const bookAppointment = useCopilotAction({
    name: 'book-appointment',
    description: 'Agendar consulta médica',
    parameters: [
      {
        name: 'patientId',
        type: 'string',
        description: 'ID do paciente',
        required: true,
      },
      {
        name: 'providerId',
        type: 'string',
        description: 'ID do médico',
        required: true,
      },
      {
        name: 'dateTime',
        type: 'string',
        description: 'Data e hora (YYYY-MM-DD HH:mm)',
        required: true,
      },
      {
        name: 'procedure',
        type: 'string',
        description: 'Procedimento a ser realizado',
        required: true,
      },
    ],
    handler: async ({ patientId, providerId, dateTime, procedure }) => {
      setState(prev => ({ ...prev, loading: true }))
      
      try {
        const appointment = await bookMedicalAppointment({
          patientId, providerId, dateTime, procedure
        })
        
        setState(prev => ({
          ...prev,
          appointments: [...prev.appointments, appointment],
          loading: false,
        }))
        
        toast.success('Consulta agendada com sucesso!')
        return appointment
      } catch (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }))
        toast.error('Erro ao agendar consulta.')
        throw error
      }
    },
  })

  // Co-agent for synchronized state management
  const { state: coAgentState, setState: setCoAgentState } = useCoAgent({
    name: 'healthcare-assistant',
    initialState: {
      patient: state.patient,
      appointments: state.appointments,
      clinicalNotes: state.clinicalNotes,
    },
    onStateChange: (newState) => {
      setState(prev => ({ ...prev, ...newState }))
    },
  })

  // AG-UI event listeners for real-time updates
  useEffect(() => {
    const connectAGUI = async () => {
      await aguiClient.connect()

      // Listen for appointment updates
      aguiClient.on('appointment.update', (payload) => {
        setState(prev => ({
          ...prev,
          appointments: prev.appointments.map(apt => 
            apt.id === payload.appointment.id ? payload.appointment : apt
          )
        }))
        toast.info('Agendamento atualizado')
      })

      // Listen for clinical alerts
      aguiClient.on('clinical.alert', (payload) => {
        if (payload.urgency === 'critical') {
          toast.error(`Alerta clínico crítico: ${payload.message}`)
        } else {
          toast.warning(`Alerta clínico: ${payload.message}`)
        }
      })

      // Listen for patient data updates
      aguiClient.on('patient.data', (payload) => {
        setState(prev => ({ ...prev, patient: payload.patient }))
      })
    }

    connectAGUI()

    return () => {
      aguiClient.disconnect()
    }
  }, [aguiClient])

  // Error handling for healthcare-specific errors
  useEffect(() => {
    if (error) {
      if (error.message.includes('CONSENT_REQUIRED')) {
        toast.error('Consentimento do paciente necessário para esta operação.')
      } else if (error.message.includes('PII_DETECTED')) {
        toast.error('Informação confidencial detectada. Use dados anonimizados.')
      } else if (error.message.includes('CLINICAL_RISK')) {
        toast.error('Risco clínico identificado. Consulte um médico.')
      } else {
        toast.error('Erro: ' + error.message)
      }
    }
  }, [error])

  const handleSubmitWithHealthcareContext = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Add healthcare context to the message
    const enhancedMessage = {
      ...input,
      context: {
        patientId: state.patient?.id,
        clinicId: 'clinic_123',
        role: 'doctor',
        urgency: 'normal',
      },
    }

    await handleSubmit(enhancedMessage)
  }

  return (
    <div className="healthcare-assistant">
      {/* Real-time status indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${aguiClient.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-600">
          {aguiClient.isConnected ? 'Conectado em tempo real' : 'Desconectado'}
        </span>
      </div>

      {/* Patient info card */}
      {state.patient && (
        <PatientCard patient={state.patient} />
      )}

      {/* Chat interface */}
      <div className="chat-interface">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <div className={`message-${message.role}`}>
              <strong>{message.role === 'assistant' ? 'Assistente' : 'Você'}:</strong>
              {message.content}
            </div>
            {/* Display tool results */}
            {message.toolResults && (
              <div className="tool-results">
                {message.toolResults.map((result, index) => (
                  <div key={index} className="tool-result">
                    <strong>Tool:</strong> {result.toolName}
                    <pre>{JSON.stringify(result.result, null, 2)}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Healthcare input with context */}
        <form onSubmit={handleSubmitWithHealthcareContext}>
          <div className="input-group">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem para o assistente médico..."
              disabled={isLoading || state.loading}
              className="healthcare-input"
            />
            <button
              type="submit"
              disabled={isLoading || state.loading}
              className="healthcare-button"
            >
              {isLoading || state.loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <button
          onClick={() => bookAppointment.execute({
            patientId: state.patient?.id,
            providerId: 'doctor_123',
            dateTime: new Date().toISOString(),
            procedure: 'Consulta inicial'
          })}
          disabled={state.loading}
          className="action-button"
        >
          Agendar Consulta
        </button>
      </div>

      {/* Error display */}
      {state.error && (
        <div className="error-message">
          <p>Erro: {state.error}</p>
          <button onClick={() => setState(prev => ({ ...prev, error: null }))}>
            Fechar
          </button>
        </div>
      )}
    </div>
  )
}
```

## Healthcare-Specific Features

### LGPD Compliance Integration

```typescript
// Enhanced compliance with automatic PII detection
const LGPDCompliance = {
  redactPII: (text: string): string => {
    const piiPatterns = [
      /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, // CPF
      /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, // CNPJ
      /\b\d{11}\b/g, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
    ]
    
    return piiPatterns.reduce((redacted, pattern) => 
      redacted.replace(pattern, '[REDACTED]')
    , text)
  },

  auditInteraction: async (interaction: AIInteraction) => {
    await fetch('/api/compliance/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({
        ...interaction,
        timestamp: new Date().toISOString(),
        ipAddress: await getClientIP(),
        userAgent: navigator.userAgent,
      }),
    })
  },

  checkConsent: async (patientId: string, action: string): Promise<boolean> => {
    const response = await fetch(`/api/patients/${patientId}/consent/${action}`)
    const data = await response.json()
    return data.hasConsent
  },
}
```

### Clinical Decision Support Tools

```typescript
// Enhanced clinical tools with validation
const clinicalTools = {
  assessSymptoms: tool({
    description: 'Avaliar sintomas e fornecer recomendações',
    parameters: z.object({
      patientId: z.string(),
      symptoms: z.array(z.string()),
      severity: z.enum(['mild', 'moderate', 'severe', 'critical']),
      duration: z.string(),
      additionalContext: z.string().optional(),
    }),
    execute: async ({ patientId, symptoms, severity, duration, additionalContext }) => {
      // Get patient history
      const history = await getPatientMedicalHistory(patientId)
      
      // AI-powered symptom analysis
      const analysis = await analyzeSymptoms({
        symptoms,
        severity,
        duration,
        medicalHistory: history,
        context: additionalContext
      })

      // Check for urgent conditions
      const urgency = await assessClinicalUrgency(analysis)
      
      // Generate recommendations
      const recommendations = await generateRecommendations({
        analysis,
        urgency,
        patientHistory: history
      })

      return {
        analysis,
        urgency,
        recommendations,
        confidence: analysis.confidence,
        requiresImmediateAttention: urgency.level === 'critical'
      }
    },
  }),

  prescribeMedication: tool({
    description: 'Prescrever medicação com validações clínicas',
    parameters: z.object({
      patientId: z.string(),
      medication: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string(),
      indications: z.string(),
      contraindications: z.array(z.string()).optional(),
    }),
    execute: async ({ patientId, medication, dosage, frequency, duration, indications, contraindications }) => {
      // Validate prescription against patient history
      const validation = await validatePrescription({
        patientId,
        medication,
        dosage,
        contraindications: contraindications || []
      })

      if (!validation.isValid) {
        throw new Error(`Prescrição inválida: ${validation.errors.join(', ')}`)
      }

      // Check for allergies
      const allergies = await checkPatientAllergies(patientId, medication)
      if (allgies.hasAllergy) {
        throw new Error(`Paciente tem alergia a ${medication}: ${allergies.reaction}`)
      }

      // Create prescription
      const prescription = await createPrescription({
        patientId,
        medication,
        dosage,
        frequency,
        duration,
        indications,
        prescribingPhysician: getCurrentUserId()
      })

      // Send notification via AG-UI
      await sendAGUIEvent({
        type: 'prescription.created',
        payload: { prescription },
        recipients: [patientId, 'pharmacy', 'treating_physician']
      })

      return prescription
    },
  }),
}
```

## Performance Optimization

### Streaming with Healthcare Context

```typescript
// Optimized streaming with healthcare-specific handling
const { data, isLoading } = useChat({
  api: '/api/chat',
  streamMode: 'stream-data',
  headers: {
    'X-Healthcare-Context': JSON.stringify({
      patientId: currentPatient?.id,
      clinicId: currentClinic?.id,
      role: currentUser?.role,
      urgency: currentUrgency,
    }),
  },
  onFinish: (message) => {
    // Handle healthcare-specific post-processing
    if (message.content.includes('ALERTA')) {
      handleClinicalAlert(message.content)
    }
    
    // Log for compliance
    logHealthcareInteraction({
      sessionId: currentSession.id,
      userId: currentUser.id,
      patientId: currentPatient?.id,
      message: message.content,
      timestamp: new Date(),
    })
  },
  onError: (error) => {
    handleHealthcareError(error)
  },
})
```

### Debounced Input with Healthcare Validation

```typescript
// Enhanced input handling with healthcare validation
const useHealthcareInput = () => {
  const [input, setInput] = useState('')
  const [validation, setValidation] = useState<ValidationResult | null>(null)

  const debouncedInput = useMemo(
    () => debounce((value: string) => {
      setInput(value)
      
      // Validate healthcare-specific input
      if (value.includes('paciente') || value.includes('consulta')) {
        validateHealthcareInput(value).then(setValidation)
      } else {
        setValidation(null)
      }
    }, 300),
    []
  )

  return { input: debouncedInput, setInput: debouncedInput, validation }
}
```

## Security Features

### Advanced Prompt Injection Protection

```typescript
// Healthcare-specific prompt injection detection
const PromptInjectionProtection = {
  detectMaliciousPatterns: (prompt: string): boolean => {
    const maliciousPatterns = [
      /ignore\s+(previous|above)/i,
      /bypass\s+(security|validation)/i,
      /reveal\s+(password|secret|key)/i,
      /admin\s+(access|privileges)/i,
      /medical\s+record\s+(all|every)/i,
      /patient\s+(data|information)\s+(all|every)/i,
    ]

    return maliciousPatterns.some(pattern => pattern.test(prompt))
  },

  sanitizeInput: (input: string): string => {
    // Remove potentially harmful characters
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/[{}]/g, '') // Remove curly braces
      .replace(/\[\]/g, '') // Remove square brackets
      .trim()
  },

  validateHealthcareContext: (context: HealthcareContext): boolean => {
    return !!(
      context.patientId &&
      context.clinicId &&
      context.role &&
      ['patient', 'doctor', 'nurse', 'admin'].includes(context.role)
    )
  },
}
```

## Monitoring and Analytics

### Healthcare-Specific Monitoring

```typescript
// Enhanced monitoring for healthcare AI interactions
const HealthcareMonitoring = {
  trackInteraction: (interaction: HealthcareAIInteraction) => {
    // Send to analytics
    analytics.track('healthcare_ai_interaction', {
      sessionId: interaction.sessionId,
      patientId: interaction.patientId,
      action: interaction.action,
      duration: interaction.duration,
      toolsUsed: interaction.toolsUsed,
      satisfaction: interaction.satisfaction,
    })

    // Send to compliance monitoring
    complianceMonitor.track({
      type: 'AI_INTERACTION',
      patientId: interaction.patientId,
      timestamp: interaction.timestamp,
      details: {
        action: interaction.action,
        toolsUsed: interaction.toolsUsed,
      },
    })
  },

  monitorPerformance: (metrics: PerformanceMetrics) => {
    // Track response times, error rates, etc.
    performanceMonitor.track({
      category: 'healthcare_ai',
      metrics: {
        responseTime: metrics.responseTime,
        errorRate: metrics.errorRate,
        successRate: metrics.successRate,
        userSatisfaction: metrics.userSatisfaction,
      },
    })
  },

  generateHealthReport: (): HealthReport => {
    return {
      totalInteractions: getTotalInteractions(),
      averageResponseTime: getAverageResponseTime(),
      errorRate: getErrorRate(),
      topUsedTools: getTopUsedTools(),
      patientSatisfaction: getPatientSatisfaction(),
      complianceScore: getComplianceScore(),
    }
  },
}
```

## See Also

- [AI Agent API Essentials](./ai-agent-essentials.md)
- [AG-UI Protocol Documentation](https://github.com/ag-ui-protocol/ag-ui)
- [CopilotKit Documentation](https://github.com/CopilotKit/CopilotKit)
- [Healthcare Compliance Guide](../compliance/healthcare-compliance.md)
- [Clinical Decision Support](../clinical/decision-support.md)
