/**
 * Aesthetic Treatment Coordination Component
 * 
 * Sistema de coordenação de tratamentos estéticos para clínicas brasileiras
 * Protocolos de atendimento profissional, notificação de equipe e conformidade regulatória
 * 
 * @component AestheticTreatmentCoordination
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui'
import { Button } from '@neonpro/ui'
import { Alert, AlertDescription } from '@neonpro/ui'
import { Badge } from '@neonpro/ui'
import { Progress } from '@neonpro/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@neonpro/ui'
import { AccessibilityProvider } from '@neonpro/ui'
import { ScreenReaderAnnouncer } from '@neonpro/ui'
import { HealthcareFormGroup } from '@/components/ui/healthcare-form-group'
import { AccessibilityInput } from '@/components/ui/accessibility-input'
import { MobileHealthcareButton } from '@/components/ui/mobile-healthcare-button'

import {
  EmergencyAlert,
  EmergencyProtocol,
  EmergencyStep,
  AestheticTreatmentAlert,
  AestheticTreatmentProtocol,
  ClinicalWorkflowComponentProps,
  StaffRole
} from './types'

import { HealthcareContext } from '@/types/healthcare'

/**
 * Contact configuration interface for emergency and support numbers
 * Follows healthcare compliance and security best practices
 */
interface ContactConfiguration {
  /** Specialist contact number for medical emergencies */
  specialist?: string
  /** Technical support number for equipment issues */
  technical?: string
  /** Clinic main contact number */
  clinic?: string
  /** Emergency services number (default: 192 for SAMU in Brazil) */
  emergency?: string
}

interface AestheticTreatmentCoordinationProps extends ClinicalWorkflowComponentProps {
  activeAlerts?: AestheticTreatmentAlert[]
  treatmentProtocols?: AestheticTreatmentProtocol[]
  onCreateAlert?: (alert: Omit<AestheticTreatmentAlert, 'id' | 'reportedAt'>) => Promise<void>
  onUpdateAlert?: (alertId: string, alert: Partial<AestheticTreatmentAlert>) => Promise<void>
  onActivateProtocol?: (protocolId: string, alertId: string) => Promise<void>
  onContactSupport?: (type: 'specialist' | 'technical' | 'clinic', location: string) => void
  /** Optional contact configuration to override environment defaults */
  contactConfig?: ContactConfiguration
}

const TREATMENT_TYPES = [
  { value: 'consultation_request', label: 'Solicitação de Consulta', severity: 'medium', color: 'blue' },
  { value: 'adverse_reaction', label: 'Reação Adversa Leve', severity: 'high', color: 'orange' },
  { value: 'equipment_support', label: 'Suporte de Equipamento', severity: 'medium', color: 'green' },
  { value: 'client_support', label: 'Suporte ao Cliente', severity: 'medium', color: 'purple' }
]

const TREATMENT_PRIORITY = [
  { value: 'low', label: 'Baixa', color: 'blue', responseTime: 30 },
  { value: 'medium', label: 'Média', color: 'green', responseTime: 15 },
  { value: 'high', label: 'Alta', color: 'orange', responseTime: 5 },
  { value: 'critical', label: 'VIP', color: 'purple', responseTime: 2 }
]

const STAFF_ROLES: StaffRole[] = [
  'medico', 'enfermeiro', 'tecnico_enfermagem', 'esteticista', 'coordenador_clinico', 'recepcao', 'administrativo'
]

/**
 * Brazilian phone number validation regex
 * Supports both mobile and landline formats with proper area codes
 * Format: +55 XX XXXXX-XXXX or +55 XX XXXX-XXXX
 */
const BRAZILIAN_PHONE_REGEX = /^\+55\s?(\d{2})\s?(\d{4,5})-(\d{4})$/

/**
 * Validates Brazilian phone numbers for healthcare compliance
 * @param phoneNumber Phone number to validate
 * @returns True if valid Brazilian phone number
 */
const validateBrazilianPhone = (phoneNumber: string): boolean => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return false
  }
  
  // Remove spaces and check basic format
  const cleanNumber = phoneNumber.replace(/\s/g, '')
  return BRAZILIAN_PHONE_REGEX.test(cleanNumber)
}

/**
 * Gets contact configuration from environment variables with fallbacks
 * Prioritizes props over environment variables for flexibility
 * @param contactConfig Optional contact configuration from props
 * @returns Contact configuration with validated phone numbers
 */
const getContactConfiguration = (contactConfig?: ContactConfiguration): ContactConfiguration => {
  // Environment variable mapping with secure defaults
  const envConfig: ContactConfiguration = {
    specialist: process.env.NEXT_PUBLIC_CONTACT_SPECIALIST,
    technical: process.env.NEXT_PUBLIC_CONTACT_TECHNICAL,
    clinic: process.env.NEXT_PUBLIC_CONTACT_CLINIC,
    emergency: process.env.NEXT_PUBLIC_CONTACT_EMERGENCY || '+55192' // SAMU Brazil
  }

  // Merge props with environment, giving priority to props
  const finalConfig = { ...envConfig, ...contactConfig }
  
  // Validate and filter out invalid phone numbers
  const validatedConfig: ContactConfiguration = {}
  Object.entries(finalConfig).forEach(([key, value]) => {
    if (value && validateBrazilianPhone(value)) {
      validatedConfig[key as keyof ContactConfiguration] = value
    }
  })

  return validatedConfig
}

/**
 * Formats phone number for tel: URI
 * Ensures proper formatting for mobile dialing
 * @param phoneNumber Phone number to format
 * @returns Formatted phone number for tel: URI
 */
const formatPhoneForTel = (phoneNumber: string): string => {
  if (!phoneNumber) return ''
  
  // Remove any non-digit characters except +
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '')
  
  // Ensure it starts with +
  if (!cleanNumber.startsWith('+')) {
    return `+${cleanNumber}`
  }
  
  return cleanNumber
}

const DEFAULT_PROTOCOLS: AestheticTreatmentProtocol[] = [
  {
    id: 'consultation_coordination',
    name: 'Coordenação de Consulta',
    description: 'Protocolo de coordenação para consultas estéticas',
    triggers: ['solicitação de consulta', 'avaliação de tratamento', 'dúvida de cliente'],
    steps: [
      {
        order: 1,
        title: 'Verificar Disponibilidade',
        description: 'Verificar disponibilidade do especialista e sala',
        assignedRole: 'recepcao',
        estimatedDuration: 2,
        critical: true
      },
      {
        order: 2,
        title: 'Preparar Ambiente',
        description: 'Preparar sala de consulta e materiais necessários',
        assignedRole: 'esteticista',
        estimatedDuration: 5,
        critical: true
      },
      {
        order: 3,
        title: 'Receber Cliente',
        description: 'Receber cliente e explicar procedimento',
        assignedRole: 'coordenador_clinico',
        estimatedDuration: 3,
        critical: true
      },
      {
        order: 4,
        title: 'Iniciar Consulta',
        description: 'Iniciar consulta estética especializada',
        assignedRole: 'medico',
        estimatedDuration: 15,
        critical: true
      }
    ],
    requiredRoles: ['medico', 'coordenador_clinico', 'recepcao'],
    estimatedDuration: 25,
    category: 'consultation',
    complexityLevel: 'basic',
    requiredMaterials: ['ficha de anamnese', 'formulario de consentimento', 'canetas', 'luvas'],
    requiredEquipment: ['mesa de exame', 'cadeira clínica', 'iluminação adequada'],
    contraindications: [],
    requiresFollowUp: true,
    sessionInterval: 7,
    lastUpdated: new Date().toISOString(),
    version: '1.0',
    technicalResponsible: 'coordenador_clinico',
    complianceStandards: {
      anvisa: true,
      lgpd: true,
      cfm: true
    },
    requiredDocumentation: ['termo de consentimento', 'avaliação inicial', 'plano de tratamento']
  },
  {
    id: 'mild_reaction_care',
    name: 'Cuidado de Reação Leve',
    description: 'Protocolo de atendimento a reações leves em tratamentos estéticos',
    triggers: ['vermelhidão leve', 'desconforto', 'irritação menor', 'inchaço leve'],
    steps: [
      {
        order: 1,
        title: 'Avaliar Sintomas',
        description: 'Avaliar grau e extensão da reação',
        assignedRole: 'enfermeiro',
        estimatedDuration: 3,
        critical: true
      },
      {
        order: 2,
        title: 'Aplicar Cuidado Imediato',
        description: 'Aplicar produtos calmantes ou compressas',
        assignedRole: 'enfermeiro',
        estimatedDuration: 5,
        critical: true
      },
      {
        order: 3,
        title: 'Monitorar Cliente',
        description: 'Monitorar resposta ao tratamento aplicado',
        assignedRole: 'tecnico_enfermagem',
        estimatedDuration: 10,
        critical: false
      },
      {
        order: 4,
        title: 'Documentar Observações',
        description: 'Registrar todas as observações e tratamentos realizados',
        assignedRole: 'enfermeiro',
        estimatedDuration: 5,
        critical: true
      }
    ],
    requiredRoles: ['enfermeiro', 'tecnico_enfermagem'],
    estimatedDuration: 23,
    category: 'post_treatment_care',
    complexityLevel: 'intermediate',
    requiredMaterials: ['produtos calmantes', 'compressas geladas', 'cremes hipoalergênicos'],
    requiredEquipment: ['equipamentos de monitoramento', 'material de primeiros socorros'],
    contraindications: ['reações alérgicas graves', 'problemas respiratórios'],
    requiresFollowUp: true,
    sessionInterval: 1,
    lastUpdated: new Date().toISOString(),
    version: '1.0',
    technicalResponsible: 'enfermeiro',
    complianceStandards: {
      anvisa: true,
      lgpd: true,
      cfm: true
    },
    requiredDocumentation: ['relatório de reação', 'tratamento aplicado', 'orientações pós-tratamento']
  },
  {
    id: 'equipment_assistance',
    name: 'Suporte Técnico',
    description: 'Protocolo de assistência técnica para equipamentos estéticos',
    triggers: ['falha de equipamento', 'manutenção necessária', 'ajuste técnico'],
    steps: [
      {
        order: 1,
        title: 'Identificar Problema',
        description: 'Identificar natureza do problema com equipamento',
        assignedRole: 'esteticista',
        estimatedDuration: 2,
        critical: true
      },
      {
        order: 2,
        title: 'Tentar Solução Básica',
        description: 'Tentar solução técnica básica ou reinicialização',
        assignedRole: 'esteticista',
        estimatedDuration: 3,
        critical: false
      },
      {
        order: 3,
        title: 'Contactar Suporte',
        description: 'Contactar suporte técnico especializado',
        assignedRole: 'coordenador_clinico',
        estimatedDuration: 5,
        critical: true
      },
      {
        order: 4,
        title: 'Agendar Manutenção',
        description: 'Agendar manutenção preventiva ou corretiva',
        assignedRole: 'administrativo',
        estimatedDuration: 8,
        critical: true
      }
    ],
    requiredRoles: ['esteticista', 'coordenador_clinico', 'administrativo'],
    estimatedDuration: 18,
    category: 'equipment_maintenance',
    complexityLevel: 'basic',
    requiredMaterials: ['ferramentas de manutenção', 'equipamentos de proteção'],
    requiredEquipment: ['equipamento estético específico', 'ferramentas de diagnóstico'],
    contraindications: ['manutenção durante tratamento ativo'],
    requiresFollowUp: true,
    sessionInterval: 30,
    lastUpdated: new Date().toISOString(),
    version: '1.0',
    technicalResponsible: 'coordenador_clinico',
    complianceStandards: {
      anvisa: true,
      lgpd: true,
      cfm: true
    },
    requiredDocumentation: ['relatório de manutenção', 'ordem de serviço', 'laudo técnico']
  }
]

export const AestheticTreatmentCoordination: React.FC<AestheticTreatmentCoordinationProps> = ({
  patientId,
  staffId,
  healthcareContext,
  className,
  activeAlerts = [],
  treatmentProtocols = DEFAULT_PROTOCOLS,
  onCreateAlert,
  onUpdateAlert,
  onActivateProtocol,
  onContactSupport,
  contactConfig
}) => {
  const [activeTab, setActiveTab] = useState('alerts')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<AestheticTreatmentAlert | null>(null)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdownTime, setCountdownTime] = useState(0)

  // Form states
  const [newAlert, setNewAlert] = useState({
    type: 'consultation_request' as const,
    priority: 'medium' as const,
    location: '',
    description: ''
  })

  // Monitor offline status for mobile clinical use
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Countdown timer for VIP treatments
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isCountingDown && countdownTime > 0) {
      interval = setInterval(() => {
        setCountdownTime(prev => {
          if (prev <= 1) {
            setIsCountingDown(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isCountingDown, countdownTime])

  const handleCreateAlert = useCallback(async () => {
    if (!newAlert.location || !newAlert.description) return

    try {
      setIsSubmitting(true)

      const alertData: Omit<AestheticTreatmentAlert, 'id' | 'reportedAt'> = {
        type: newAlert.type,
        priority: newAlert.priority,
        patientId,
        location: newAlert.location,
        description: newAlert.description,
        reportedBy: staffId,
        status: 'pending',
        assignedStaff: [staffId],
        urgencyLevel: newAlert.priority === 'critical' ? 'urgent' : 'priority',
        requiresMedicalReview: false,
        patientConsent: true
      }

      if (onCreateAlert) {
        const createdAlert = await onCreateAlert(alertData)
        setSelectedAlert(createdAlert as AestheticTreatmentAlert)
        
        // Start countdown for VIP treatments
        if (newAlert.priority === 'critical') {
          const priorityInfo = TREATMENT_PRIORITY.find(s => s.value === 'critical')
          if (priorityInfo) {
            setCountdownTime(priorityInfo.responseTime * 60) // Convert to seconds
            setIsCountingDown(true)
          }
        }
      }

      // Reset form
      setNewAlert({
        type: 'consultation_request',
        priority: 'medium',
        location: '',
        description: ''
      })

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Solicitação de tratamento criada com sucesso')
      
      // Switch to alerts tab
      setActiveTab('alerts')
    } catch (error) {
      console.error('Error creating treatment alert:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [newAlert, patientId, staffId, onCreateAlert])

  const handleUpdateAlertStatus = useCallback(async (alertId: string, newStatus: string) => {
    try {
      setIsSubmitting(true)

      if (onUpdateAlert) {
        await onUpdateAlert(alertId, { status: newStatus as any })
      }

      // Stop countdown if alert is resolved
      if (newStatus === 'resolved' || newStatus === 'false_alarm') {
        setIsCountingDown(false)
        setCountdownTime(0)
      }

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Status da solicitação atualizado com sucesso')
    } catch (error) {
      console.error('Error updating alert status:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [onUpdateAlert])

  const handleActivateProtocol = useCallback(async (protocolId: string, alertId: string) => {
    try {
      setIsSubmitting(true)

      if (onActivateProtocol) {
        await onActivateProtocol(protocolId, alertId)
      }

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Protocolo de tratamento ativado com sucesso')
    } catch (error) {
      console.error('Error activating protocol:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [onActivateProtocol])

  const handleContactSupport = useCallback((type: 'specialist' | 'technical' | 'clinic') => {
    if (onContactSupport) {
      const location = newAlert.location || 'Clínica Estética'
      onContactSupport(type, location)
    }
    
    // Get contact configuration with validation and fallbacks
    const config = getContactConfiguration(contactConfig)
    const phoneNumber = config[type]
    
    // Make actual phone call in mobile environment for available numbers
    if (phoneNumber && validateBrazilianPhone(phoneNumber)) {
      const formattedPhone = formatPhoneForTel(phoneNumber)
      window.open(`tel:${formattedPhone}`, '_self')
    } else {
      // Log security incident for missing contact configuration
      console.warn(`Missing or invalid contact configuration for ${type}. Please check environment variables.`)
      
      // Fallback to emergency services for critical specialist calls
      if (type === 'specialist' && config.emergency) {
        const emergencyPhone = formatPhoneForTel(config.emergency)
        window.open(`tel:${emergencyPhone}`, '_self')
      }
    }
  }, [onContactSupport, newAlert.location, contactConfig])

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTreatmentTypeColor = (type: string) => {
    return TREATMENT_TYPES.find(t => t.value === type)?.color || 'gray'
  }

  const getTreatmentTypeLabel = (type: string) => {
    return TREATMENT_TYPES.find(t => t.value === type)?.label || type
  }

  const getPriorityColor = (severity: string) => {
    return TREATMENT_PRIORITY.find(s => s.value === severity)?.color || 'gray'
  }

  const getPriorityLabel = (severity: string) => {
    return TREATMENT_PRIORITY.find(s => s.value === severity)?.label || severity
  }

  const activeVIPAlerts = activeAlerts.filter(alert => 
    alert.status === 'pending' && alert.priority === 'critical'
  )

  return (
    <AccessibilityProvider>
      <div className={`max-w-6xl mx-auto p-4 ${className}`}>
        {/* Treatment Header */}
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-purple-800">
                  Sistema de Coordenação Estética
                </CardTitle>
                <p className="text-purple-700 mt-2">
                  Protocolos de atendimento profissional para clínicas estéticas brasileiras
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isOffline ? "destructive" : "secondary"}>
                  {isOffline ? 'Offline' : 'Online'}
                </Badge>
                {activeVIPAlerts.length > 0 && (
                  <Badge variant="default" className="animate-pulse">
                    {activeVIPAlerts.length} Tratamento(s) VIP Ativo(s)
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* VIP Treatment Countdown */}
        {isCountingDown && (
          <Card className="mb-6 border-purple-500 bg-purple-100">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-800 mb-2">
                  {formatCountdown(countdownTime)}
                </div>
                <div className="text-lg text-purple-700 font-semibold">
                  Tempo restante para atendimento VIP
                </div>
                <div className="text-sm text-purple-600 mt-2">
                  Atendimento deve ser iniciado imediatamente
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ações Rápidas de Suporte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MobileHealthcareButton
                variant="treatment"
                size="lg"
                onClick={() => handleContactSupport('specialist')}
                className="w-full"
              >
                👨‍⚕️ Especialista
              </MobileHealthcareButton>
              <MobileHealthcareButton
                variant="treatment"
                size="lg"
                onClick={() => handleContactSupport('technical')}
                className="w-full"
              >
                🔧 Suporte Técnico
              </MobileHealthcareButton>
              <MobileHealthcareButton
                variant="treatment"
                size="lg"
                onClick={() => handleContactSupport('clinic')}
                className="w-full"
              >
                🏥 Clínica
              </MobileHealthcareButton>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts">Solicitações Ativas</TabsTrigger>
            <TabsTrigger value="new">Nova Solicitação</TabsTrigger>
            <TabsTrigger value="protocols">Protocolos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Tratamento Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeAlerts
                    .filter(alert => alert.status === 'active')
                    .map(alert => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      isSelected={selectedAlert?.id === alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      onUpdateStatus={handleUpdateAlertStatus}
                      onActivateProtocol={handleActivateProtocol}
                      protocols={treatmentProtocols}
                      disabled={isSubmitting}
                    />
                  ))}
                  {activeAlerts.filter(alert => alert.status === 'active').length === 0 && (
                    <div className="text-center py-8 text-gray-600">
                      Nenhuma solicitação de tratamento ativa no momento
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedAlert && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Solicitação</CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertDetail alert={selectedAlert} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="new" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Criar Nova Solicitação de Tratamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <HealthcareFormGroup label="Tipo de Solicitação" context={healthcareContext}>
                    <select
                      value={newAlert.type}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {TREATMENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </HealthcareFormGroup>
                  <HealthcareFormGroup label="Prioridade" context={healthcareContext}>
                    <select
                      value={newAlert.severity}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {TREATMENT_PRIORITY.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </HealthcareFormGroup>
                </div>

                <HealthcareFormGroup label="Localização" context={healthcareContext}>
                  <AccessibilityInput
                    value={newAlert.location}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ex: Sala de tratamento, recepção, consultório..."
                  />
                </HealthcareFormGroup>

                <HealthcareFormGroup label="Descrição" context={healthcareContext}>
                  <textarea
                    value={newAlert.description}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    placeholder="Descreva detalhadamente a solicitação de tratamento..."
                  />
                </HealthcareFormGroup>

                <div className="flex justify-end">
                  <Button
                    onClick={handleCreateAlert}
                    disabled={isSubmitting || !newAlert.location || !newAlert.description}
                    loading={isSubmitting}
                    variant="default"
                  >
                    Criar Solicitação
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="protocols" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {treatmentProtocols.map(protocol => (
                <ProtocolCard
                  key={protocol.id}
                  protocol={protocol}
                  onActivate={(protocolId) => {
                    if (selectedAlert) {
                      handleActivateProtocol(protocolId, selectedAlert.id)
                    }
                  }}
                  disabled={isSubmitting || !selectedAlert}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Tratamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeAlerts
                    .filter(alert => alert.status !== 'active')
                    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
                    .map(alert => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onClick={() => setSelectedAlert(alert)}
                      onUpdateStatus={handleUpdateAlertStatus}
                      onActivateProtocol={handleActivateProtocol}
                      protocols={treatmentProtocols}
                      disabled={isSubmitting}
                      readonly
                    />
                  ))}
                  {activeAlerts.filter(alert => alert.status !== 'active').length === 0 && (
                    <div className="text-center py-8 text-gray-600">
                      Nenhum histórico de tratamentos disponível
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AccessibilityProvider>
  )
}

// Sub-components
const AlertCard: React.FC<{
  alert: AestheticTreatmentAlert
  isSelected?: boolean
  onClick?: () => void
  onUpdateStatus: (alertId: string, status: string) => void
  onActivateProtocol: (protocolId: string, alertId: string) => void
  protocols: AestheticTreatmentProtocol[]
  disabled: boolean
  readonly?: boolean
}> = ({ alert, isSelected, onClick, onUpdateStatus, onActivateProtocol, protocols, disabled, readonly }) => {
  const typeInfo = TREATMENT_TYPES.find(t => t.value === alert.type)
  const priorityInfo = TREATMENT_PRIORITY.find(s => s.value === alert.priority)
  
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'purple',
      responding: 'yellow',
      resolved: 'green',
      false_alarm: 'gray'
    }
    return colors[status] || 'gray'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Ativo',
      responding: 'Respondendo',
      resolved: 'Resolvido',
      false_alarm: 'Cancelado'
    }
    return labels[status] || status
  }

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'border-purple-500 bg-purple-50' : 
        alert.priority === 'critical' ? 'border-purple-500 bg-purple-50' : 
        'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={typeInfo?.color as any || 'secondary'}>
            {typeInfo?.label || alert.type}
          </Badge>
          <Badge variant={priorityInfo?.color as any || 'secondary'}>
            {priorityInfo?.label || alert.severity}
          </Badge>
          <Badge variant={getStatusColor(alert.status) as any}>
            {getStatusLabel(alert.status)}
          </Badge>
        </div>
        <span className="text-sm text-gray-600">
          {new Date(alert.reportedAt).toLocaleString('pt-BR')}
        </span>
      </div>
      <h4 className="font-medium mb-1">{alert.location}</h4>
      <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Solicitado por: {alert.reportedBy}
        </span>
        {!readonly && alert.status === 'active' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onUpdateStatus(alert.id, 'responding')
              }}
              disabled={disabled}
            >
              Responder
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onUpdateStatus(alert.id, 'resolved')
              }}
              disabled={disabled}
            >
              Resolver
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

const AlertDetail: React.FC<{ alert: AestheticTreatmentAlert }> = ({ alert }) => {
  const typeInfo = TREATMENT_TYPES.find(t => t.value === alert.type)
  const priorityInfo = TREATMENT_PRIORITY.find(s => s.value === alert.priority)
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold">Informações da Solicitação</h4>
          <p><strong>Tipo:</strong> {typeInfo?.label || alert.type}</p>
          <p><strong>Prioridade:</strong> {priorityInfo?.label || alert.priority}</p>
          <p><strong>Status:</strong> {alert.status}</p>
          <p><strong>Local:</strong> {alert.location}</p>
        </div>
        <div>
          <h4 className="font-semibold">Informações de Atendimento</h4>
          <p><strong>Solicitado por:</strong> {alert.reportedBy}</p>
          <p><strong>Data/Hora:</strong> {new Date(alert.reportedAt).toLocaleString('pt-BR')}</p>
          <p><strong>Equipe de Atendimento:</strong> {alert.assignedStaff.join(', ') || 'Não definida'}</p>
          {alert.resolvedAt && (
            <p><strong>Resolvido em:</strong> {new Date(alert.resolvedAt).toLocaleString('pt-BR')}</p>
          )}
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold">Descrição</h4>
        <p className="text-gray-700">{alert.description}</p>
      </div>
      
      {alert.resolutionNotes && (
        <div>
          <h4 className="font-semibold">Notas de Resolução</h4>
          <p className="text-gray-700">{alert.resolutionNotes}</p>
        </div>
      )}
    </div>
  )
}

const ProtocolCard: React.FC<{
  protocol: AestheticTreatmentProtocol
  onActivate: (protocolId: string) => void
  disabled: boolean
}> = ({ protocol, onActivate, disabled }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <Card className={`h-full ${isExpanded ? 'border-purple-500' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{protocol.name}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Recolher' : 'Expandir'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{protocol.description}</p>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Disparadores:</h4>
          <div className="flex flex-wrap gap-2">
            {protocol.triggers.map(trigger => (
              <Badge key={trigger} variant="outline" className="text-xs">
                {trigger}
              </Badge>
            ))}
          </div>
        </div>
        
        {isExpanded && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Passos do Protocolo:</h4>
              <div className="space-y-2">
                {protocol.steps.map(step => (
                  <div key={step.order} className="border-l-4 border-purple-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{step.order}. {step.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {step.assignedRole}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {step.estimatedDuration}min
                        </span>
                        {step.critical && (
                          <Badge variant="default" className="text-xs">
                            Essencial
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">
                  Tempo estimado: {protocol.estimatedDuration}min
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {protocol.requiredRoles.map(role => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => onActivate(protocol.id)}
                disabled={disabled}
                variant="default"
              >
                Ativar Protocolo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AestheticTreatmentCoordination