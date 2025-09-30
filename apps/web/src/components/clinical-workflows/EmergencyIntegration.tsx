/**
 * Emergency Integration Component
 * 
 * Sistema de integração de emergência para clínicas estéticas brasileiras
 * Protocolos de resposta rápida, notificação de equipe e conformidade regulatória
 * 
 * @component EmergencyIntegration
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
  ClinicalWorkflowComponentProps,
  StaffRole
} from './types'

import { HealthcareContext } from '@/types/healthcare'

interface EmergencyIntegrationProps extends ClinicalWorkflowComponentProps {
  activeAlerts?: EmergencyAlert[]
  emergencyProtocols?: EmergencyProtocol[]
  onCreateAlert?: (alert: Omit<EmergencyAlert, 'id' | 'reportedAt'>) => Promise<void>
  onUpdateAlert?: (alertId: string, alert: Partial<EmergencyAlert>) => Promise<void>
  onActivateProtocol?: (protocolId: string, alertId: string) => Promise<void>
  onEmergencyCall?: (type: 'samu' | 'bombeiros' | 'polícia', location: string) => void
}

const EMERGENCY_TYPES = [
  { value: 'medical_emergency', label: 'Emergência Médica', severity: 'critical', color: 'red' },
  { value: 'severe_reaction', label: 'Reação Adversa Grave', severity: 'high', color: 'orange' },
  { value: 'equipment_failure', label: 'Falha de Equipamento', severity: 'medium', color: 'yellow' },
  { value: 'security_incident', label: 'Incidente de Segurança', severity: 'high', color: 'red' }
]

const EMERGENCY_SEVERITY = [
  { value: 'low', label: 'Baixa', color: 'blue', responseTime: 30 },
  { value: 'medium', label: 'Média', color: 'yellow', responseTime: 15 },
  { value: 'high', label: 'Alta', color: 'orange', responseTime: 5 },
  { value: 'critical', label: 'Crítica', color: 'red', responseTime: 2 }
]

const STAFF_ROLES: StaffRole[] = [
  'medico', 'enfermeiro', 'tecnico_enfermagem', 'esteticista', 'coordenador_clinico', 'recepcao', 'administrativo'
]

const DEFAULT_PROTOCOLS: EmergencyProtocol[] = [
  {
    id: 'cardiac_arrest',
    name: 'Parada Cardiorrespiratória',
    description: 'Protocolo de atendimento a parada cardiorrespiratória',
    triggers: ['parada cardíaca', 'ausência de pulso', 'inconsciência'],
    steps: [
      {
        order: 1,
        title: 'Verificar Responsividade',
        description: 'Verificar se a pessoa está consciente e respirando',
        assignedRole: 'medico',
        estimatedDuration: 1,
        critical: true
      },
      {
        order: 2,
        title: 'Chamar Ajuda',
        description: 'Acionar equipe de emergência e SAMU (192)',
        assignedRole: 'recepcao',
        estimatedDuration: 2,
        critical: true
      },
      {
        order: 3,
        title: 'Iniciar RCP',
        description: 'Iniciar reanimação cardiopulmonar',
        assignedRole: 'medico',
        estimatedDuration: 5,
        critical: true
      },
      {
        order: 4,
        title: 'Preparar DEA',
        description: 'Preparar desfibrilador externo automático',
        assignedRole: 'enfermeiro',
        estimatedDuration: 3,
        critical: true
      }
    ],
    requiredRoles: ['medico', 'enfermeiro', 'recepcao'],
    estimatedResponseTime: 2,
    lastUpdated: new Date().toISOString(),
    version: '1.0'
  },
  {
    id: 'anaphylactic_shock',
    name: 'Choque Anafilático',
    description: 'Protocolo de atendimento a reações alérgicas graves',
    triggers: ['dificuldade respiratória', 'inchaço', 'urticária', 'hipotensão'],
    steps: [
      {
        order: 1,
        title: 'Avaliar Sinais Vitais',
        description: 'Verificar pressão arterial, frequência cardíaca e respiratória',
        assignedRole: 'enfermeiro',
        estimatedDuration: 2,
        critical: true
      },
      {
        order: 2,
        title: 'Administrar Adrenalina',
        description: 'Administrar adrenalina intramuscular',
        assignedRole: 'medico',
        estimatedDuration: 3,
        critical: true
      },
      {
        order: 3,
        title: 'Posicionar Paciente',
        description: 'Posicionar paciente com pernas elevadas',
        assignedRole: 'tecnico_enfermagem',
        estimatedDuration: 1,
        critical: false
      },
      {
        order: 4,
        title: 'Monitorar',
        description: 'Monitorar sinais vitais e preparar para intubação',
        assignedRole: 'medico',
        estimatedDuration: 10,
        critical: true
      }
    ],
    requiredRoles: ['medico', 'enfermeiro', 'tecnico_enfermagem'],
    estimatedResponseTime: 5,
    lastUpdated: new Date().toISOString(),
    version: '1.0'
  },
  {
    id: 'severe_bleeding',
    name: 'Hemorragia Grave',
    description: 'Protocolo de controle de hemorragias graves',
    triggers: ['sangramento excessivo', 'ferida profunda', 'trauma'],
    steps: [
      {
        order: 1,
        title: 'Aplicar Pressão Direta',
        description: 'Aplicar pressão direta no local do sangramento',
        assignedRole: 'enfermeiro',
        estimatedDuration: 2,
        critical: true
      },
      {
        order: 2,
        title: 'Elevar Membro',
        description: 'Elevar membro afetado acima do nível do coração',
        assignedRole: 'tecnico_enfermagem',
        estimatedDuration: 1,
        critical: false
      },
      {
        order: 3,
        title: 'Verificar Sinais Vitais',
        description: 'Monitorar pressão arterial e frequência cardíaca',
        assignedRole: 'enfermeiro',
        estimatedDuration: 3,
        critical: true
      },
      {
        order: 4,
        title: 'Preparar Fluidos',
        description: 'Preparar administração de fluidos intravenosos',
        assignedRole: 'medico',
        estimatedDuration: 5,
        critical: true
      }
    ],
    requiredRoles: ['medico', 'enfermeiro', 'tecnico_enfermagem'],
    estimatedResponseTime: 5,
    lastUpdated: new Date().toISOString(),
    version: '1.0'
  }
]

export const EmergencyIntegration: React.FC<EmergencyIntegrationProps> = ({
  patientId,
  staffId,
  healthcareContext,
  className,
  activeAlerts = [],
  emergencyProtocols = DEFAULT_PROTOCOLS,
  onCreateAlert,
  onUpdateAlert,
  onActivateProtocol,
  onEmergencyCall
}) => {
  const [activeTab, setActiveTab] = useState('alerts')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdownTime, setCountdownTime] = useState(0)

  // Form states
  const [newAlert, setNewAlert] = useState({
    type: 'medical_emergency' as const,
    severity: 'high' as const,
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

  // Countdown timer for critical emergencies
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

      const alertData: Omit<EmergencyAlert, 'id' | 'reportedAt'> = {
        type: newAlert.type,
        severity: newAlert.severity,
        patientId,
        location: newAlert.location,
        description: newAlert.description,
        reportedBy: staffId,
        status: 'active',
        responseTeam: []
      }

      if (onCreateAlert) {
        const createdAlert = await onCreateAlert(alertData)
        setSelectedAlert(createdAlert as EmergencyAlert)
        
        // Start countdown for critical emergencies
        if (newAlert.severity === 'critical') {
          const severityInfo = EMERGENCY_SEVERITY.find(s => s.value === 'critical')
          if (severityInfo) {
            setCountdownTime(severityInfo.responseTime * 60) // Convert to seconds
            setIsCountingDown(true)
          }
        }
      }

      // Reset form
      setNewAlert({
        type: 'medical_emergency',
        severity: 'high',
        location: '',
        description: ''
      })

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Alerta de emergência criado com sucesso')
      
      // Switch to alerts tab
      setActiveTab('alerts')
    } catch (error) {
      console.error('Error creating emergency alert:', error)
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
      ScreenReaderAnnouncer.announce('Status do alerta atualizado com sucesso')
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
      ScreenReaderAnnouncer.announce('Protocolo de emergência ativado com sucesso')
    } catch (error) {
      console.error('Error activating protocol:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [onActivateProtocol])

  const handleEmergencyCall = useCallback((type: 'samu' | 'bombeiros' | 'polícia') => {
    if (onEmergencyCall) {
      const location = newAlert.location || 'Clínica Estética'
      onEmergencyCall(type, location)
    }
    
    // Make actual phone call in mobile environment
    const phoneNumber = type === 'samu' ? '192' : type === 'bombeiros' ? '193' : '190'
    window.open(`tel:${phoneNumber}`, '_self')
  }, [onEmergencyCall, newAlert.location])

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getEmergencyTypeColor = (type: string) => {
    return EMERGENCY_TYPES.find(t => t.value === type)?.color || 'gray'
  }

  const getEmergencyTypeLabel = (type: string) => {
    return EMERGENCY_TYPES.find(t => t.value === type)?.label || type
  }

  const getSeverityColor = (severity: string) => {
    return EMERGENCY_SEVERITY.find(s => s.value === severity)?.color || 'gray'
  }

  const getSeverityLabel = (severity: string) => {
    return EMERGENCY_SEVERITY.find(s => s.value === severity)?.label || severity
  }

  const activeCriticalAlerts = activeAlerts.filter(alert => 
    alert.status === 'active' && alert.severity === 'critical'
  )

  return (
    <AccessibilityProvider>
      <div className={`max-w-6xl mx-auto p-4 ${className}`}>
        {/* Emergency Header */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-red-800">
                  Sistema de Emergência
                </CardTitle>
                <p className="text-red-700 mt-2">
                  Protocolos de resposta rápida para clínicas estéticas brasileiras
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isOffline ? "destructive" : "secondary"}>
                  {isOffline ? 'Offline' : 'Online'}
                </Badge>
                {activeCriticalAlerts.length > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    {activeCriticalAlerts.length} Emergência(s) Crítica(s)
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Critical Emergency Countdown */}
        {isCountingDown && (
          <Card className="mb-6 border-red-500 bg-red-100">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-800 mb-2">
                  {formatCountdown(countdownTime)}
                </div>
                <div className="text-lg text-red-700 font-semibold">
                  Tempo crítico restante para resposta
                </div>
                <div className="text-sm text-red-600 mt-2">
                  Resposta deve ser iniciada imediatamente
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ações Rápidas de Emergência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MobileHealthcareButton
                variant="emergency"
                size="lg"
                onClick={() => handleEmergencyCall('samu')}
                className="w-full"
              >
                🚑 SAMU (192)
              </MobileHealthcareButton>
              <MobileHealthcareButton
                variant="emergency"
                size="lg"
                onClick={() => handleEmergencyCall('bombeiros')}
                className="w-full"
              >
                🚒 Bombeiros (193)
              </MobileHealthcareButton>
              <MobileHealthcareButton
                variant="emergency"
                size="lg"
                onClick={() => handleEmergencyCall('polícia')}
                className="w-full"
              >
                👮 Polícia (190)
              </MobileHealthcareButton>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts">Alertas Ativos</TabsTrigger>
            <TabsTrigger value="new">Novo Alerta</TabsTrigger>
            <TabsTrigger value="protocols">Protocolos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertas de Emergência Ativos</CardTitle>
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
                      protocols={emergencyProtocols}
                      disabled={isSubmitting}
                    />
                  ))}
                  {activeAlerts.filter(alert => alert.status === 'active').length === 0 && (
                    <div className="text-center py-8 text-gray-600">
                      Nenhum alerta de emergência ativo no momento
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedAlert && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes do Alerta</CardTitle>
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
                <CardTitle>Criar Novo Alerta de Emergência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <HealthcareFormGroup label="Tipo de Emergência" context={healthcareContext}>
                    <select
                      value={newAlert.type}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {EMERGENCY_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </HealthcareFormGroup>
                  <HealthcareFormGroup label="Severidade" context={healthcareContext}>
                    <select
                      value={newAlert.severity}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, severity: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {EMERGENCY_SEVERITY.map(severity => (
                        <option key={severity.value} value={severity.value}>
                          {severity.label}
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
                    placeholder="Descreva detalhadamente a situação de emergência..."
                  />
                </HealthcareFormGroup>

                <div className="flex justify-end">
                  <Button
                    onClick={handleCreateAlert}
                    disabled={isSubmitting || !newAlert.location || !newAlert.description}
                    loading={isSubmitting}
                    variant="destructive"
                  >
                    Acionar Emergência
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="protocols" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyProtocols.map(protocol => (
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
                <CardTitle>Histórico de Emergências</CardTitle>
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
                      protocols={emergencyProtocols}
                      disabled={isSubmitting}
                      readonly
                    />
                  ))}
                  {activeAlerts.filter(alert => alert.status !== 'active').length === 0 && (
                    <div className="text-center py-8 text-gray-600">
                      Nenhum histórico de emergências disponível
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
  alert: EmergencyAlert
  isSelected?: boolean
  onClick?: () => void
  onUpdateStatus: (alertId: string, status: string) => void
  onActivateProtocol: (protocolId: string, alertId: string) => void
  protocols: EmergencyProtocol[]
  disabled: boolean
  readonly?: boolean
}> = ({ alert, isSelected, onClick, onUpdateStatus, onActivateProtocol, protocols, disabled, readonly }) => {
  const typeInfo = EMERGENCY_TYPES.find(t => t.value === alert.type)
  const severityInfo = EMERGENCY_SEVERITY.find(s => s.value === alert.severity)
  
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'red',
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
      false_alarm: 'Falso Alarme'
    }
    return labels[status] || status
  }

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 
        alert.severity === 'critical' ? 'border-red-500 bg-red-50' : 
        'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={typeInfo?.color as any || 'secondary'}>
            {typeInfo?.label || alert.type}
          </Badge>
          <Badge variant={severityInfo?.color as any || 'secondary'}>
            {severityInfo?.label || alert.severity}
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
          Reportado por: {alert.reportedBy}
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

const AlertDetail: React.FC<{ alert: EmergencyAlert }> = ({ alert }) => {
  const typeInfo = EMERGENCY_TYPES.find(t => t.value === alert.type)
  const severityInfo = EMERGENCY_SEVERITY.find(s => s.value === alert.severity)
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold">Informações do Alerta</h4>
          <p><strong>Tipo:</strong> {typeInfo?.label || alert.type}</p>
          <p><strong>Severidade:</strong> {severityInfo?.label || alert.severity}</p>
          <p><strong>Status:</strong> {alert.status}</p>
          <p><strong>Local:</strong> {alert.location}</p>
        </div>
        <div>
          <h4 className="font-semibold">Informações de Resposta</h4>
          <p><strong>Reportado por:</strong> {alert.reportedBy}</p>
          <p><strong>Data/Hora:</strong> {new Date(alert.reportedAt).toLocaleString('pt-BR')}</p>
          <p><strong>Equipe de Resposta:</strong> {alert.responseTeam.join(', ') || 'Não definida'}</p>
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
  protocol: EmergencyProtocol
  onActivate: (protocolId: string) => void
  disabled: boolean
}> = ({ protocol, onActivate, disabled }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <Card className={`h-full ${isExpanded ? 'border-blue-500' : ''}`}>
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
                  <div key={step.order} className="border-l-4 border-blue-500 pl-4 py-2">
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
                          <Badge variant="destructive" className="text-xs">
                            Crítico
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
                  Tempo estimado: {protocol.estimatedResponseTime}min
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
                variant="destructive"
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

export default EmergencyIntegration