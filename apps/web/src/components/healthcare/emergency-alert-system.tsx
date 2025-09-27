import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { cn } from '@/lib/utils.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Alert, AlertDescription } from '@/components/ui/alert.js'
import { AccessibilityButton } from '@/components/ui/accessibility-button'
import { HealthcareFormGroup } from '@/components/ui/healthcare-form-group'
import { AccessibilityInput } from '@/components/ui/accessibility-input'

import type { 
  PatientData, 
  HealthcareContext,
  EmergencyAlert,
  EmergencyResponse 
} from '@/types/healthcare'

interface EmergencyAlertSystemProps {
  patients: PatientData[]
  activeAlerts: EmergencyAlert[]
  onCreateAlert: (alert: Omit<EmergencyAlert, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateAlert: (alertId: string, response: EmergencyResponse) => void
  onResolveAlert: (alertId: string) => void
  onContactEmergency: (type: 'ambulance' | 'fire' | 'police') => void
  className?: string
  healthcareContext?: HealthcareContext
}

interface AlertFormState {
  type: EmergencyAlert['type']
  severity: EmergencyAlert['severity']
  patientId?: string
  description: string
  location: string
  requiresMedicalAttention: boolean
  requiresEvacuation: boolean
  affectedAreas: string[]
  estimatedDuration: string
  additionalNotes: string
}

interface EmergencyContact {
  name: string
  role: string
  phone: string
  available: boolean
  isOnCall: boolean
}

const emergencyContacts: EmergencyContact[] = [
  {
    name: 'Dr. Carlos Silva',
    role: 'Médico Responsável',
    phone: '(11) 99999-1111',
    available: true,
    isOnCall: true
  },
  {
    name: 'Dra. Ana Santos',
    role: 'Dermatologista',
    phone: '(11) 99999-2222',
    available: false,
    isOnCall: false
  },
  {
    name: 'Dr. Roberto Costa',
    role: 'Cirurgião Plástico',
    phone: '(11) 99999-3333',
    available: true,
    isOnCall: false
  },
  {
    name: 'Enfermeira Maria Oliveira',
    role: 'Enfermagem Chefe',
    phone: '(11) 99999-4444',
    available: true,
    isOnCall: true
  }
]

const emergencyProtocols = {
  medical: {
    title: 'Emergência Médica',
    description: 'Reação adversiva, desmaio, dor intensa, ou outra condição médica urgente',
    steps: [
      'Avaliar a segurança do local',
      'Verificar sinais vitais do paciente',
      'Contactar médico responsável imediatamente',
      'Preparar kit de primeiros socorros',
      'Documentar todos os procedimentos realizados'
    ],
    color: 'red'
  },
  facility: {
    title: 'Emergência da Instalação',
    description: 'Incêndio, vazamento, falta de energia, ou outro problema estrutural',
    steps: [
      'Acionar alarme de emergência',
      'Iniciar evacuação orderly',
      'Verificar contagem de pacientes',
      'Contactar serviços de emergência',
      'Aguardar autoridades competentes'
    ],
    color: 'orange'
  },
  security: {
    title: 'Emergência de Segurança',
    description: 'Ameaça, intrusão, ou outra situação de risco à segurança',
    steps: [
      'Manter a calma e não confrontar',
      'Contactar segurança ou polícia',
      'Trancar portas se seguro para fazê-lo',
      'Mover pacientes para área segura',
      'Aguardar instruções das autoridades'
    ],
    color: 'purple'
  }
}

export const EmergencyAlertSystem: React.FC<EmergencyAlertSystemProps> = ({
  patients,
  activeAlerts,
  onCreateAlert,
  onUpdateAlert,
  onResolveAlert,
  onContactEmergency,
  className,
  healthcareContext = 'emergency'
}) => {
  const [showAlertForm, setShowAlertForm] = React.useState(false)
  const [selectedAlert, setSelectedAlert] = React.useState<EmergencyAlert | null>(null)
  const [isEvacuationMode, setIsEvacuationMode] = React.useState(false)
  
  const [alertForm, setAlertForm] = React.useState<AlertFormState>({
    type: 'medical',
    severity: 'high',
    description: '',
    location: 'Clínica Principal',
    requiresMedicalAttention: false,
    requiresEvacuation: false,
    affectedAreas: [],
    estimatedDuration: '',
    additionalNotes: ''
  })

  const [responseLog, setResponseLog] = React.useState<string[]>([])

  const addToResponseLog = React.useCallback((action: string) => {
    const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm:ss')
    setResponseLog(prev => [...prev, `[${timestamp}] ${action}`])
  }, [])

  const handleCreateAlert = () => {
    if (!alertForm.description.trim()) {
      alert('É necessário fornecer uma descrição da emergência.')
      return
    }

    const newAlert: Omit<EmergencyAlert, 'id' | 'createdAt' | 'updatedAt'> = {
      ...alertForm,
      status: 'active',
      responses: [],
      resolvedAt: null,
      resolvedBy: null
    }

    onCreateAlert(newAlert)
    addToResponseLog(`Novo alerta criado: ${alertForm.type} - ${alertForm.severity}`)
    
    // Reset form
    setAlertForm({
      type: 'medical',
      severity: 'high',
      description: '',
      location: 'Clínica Principal',
      requiresMedicalAttention: false,
      requiresEvacuation: false,
      affectedAreas: [],
      estimatedDuration: '',
      additionalNotes: ''
    })
    setShowAlertForm(false)

    // Auto-enable evacuation mode if required
    if (alertForm.requiresEvacuation) {
      setIsEvacuationMode(true)
      addToResponseLog('Modo de evacuação ativado automaticamente')
    }
  }

  const handleUpdateAlert = (response: EmergencyResponse) => {
    if (selectedAlert) {
      onUpdateAlert(selectedAlert.id, response)
      addToResponseLog(`Resposta registrada para alerta ${selectedAlert.id}: ${response.action}`)
    }
  }

  const handleResolveAlert = () => {
    if (selectedAlert) {
      onResolveAlert(selectedAlert.id)
      addToResponseLog(`Alerta ${selectedAlert.id} resolvido`)
      setSelectedAlert(null)
      
      // Disable evacuation mode if no more evacuation alerts
      const hasEvacuationAlerts = activeAlerts.some(alert => 
        alert.id !== selectedAlert.id && alert.requiresEvacuation
      )
      if (!hasEvacuationAlerts) {
        setIsEvacuationMode(false)
        addToResponseLog('Modo de evacuação desativado')
      }
    }
  }

  const handleContactEmergency = (type: 'ambulance' | 'fire' | 'police') => {
    onContactEmergency(type)
    addToResponseLog(`Serviço de emergência contatado: ${type}`)
  }

  const handleAreaToggle = (area: string) => {
    setAlertForm(prev => ({
      ...prev,
      affectedAreas: prev.affectedAreas.includes(area)
        ? prev.affectedAreas.filter(a => a !== area)
        : [...prev.affectedAreas, area]
    }))
  }

  const availableAreas = [
    'Recepção',
    'Sala de Espera',
    'Consultório 1',
    'Consultório 2',
    'Sala de Procedimentos',
    'Recuperação',
    'Estoque',
    'Banheiros'
  ]

  const sortedAlerts = activeAlerts.sort((a, b) => {
    const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })

  const getSeverityColor = (severity: EmergencyAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-900 text-white font-bold border-2 border-red-700 shadow-lg'
      case 'high': return 'bg-red-700 text-white font-semibold border-2 border-red-600 shadow-md'
      case 'medium': return 'bg-orange-700 text-white font-medium border-2 border-orange-600'
      case 'low': return 'bg-yellow-600 text-gray-900 font-medium border-2 border-yellow-500'
      default: return 'bg-gray-700 text-white font-medium'
    }
  }

  const getTypeColor = (type: EmergencyAlert['type']) => {
    switch (type) {
      case 'medical': return 'border-red-700 bg-red-100 hover:bg-red-200'
      case 'facility': return 'border-orange-700 bg-orange-100 hover:bg-orange-200'
      case 'security': return 'border-purple-700 bg-purple-100 hover:bg-purple-200'
      default: return 'border-gray-700 bg-gray-100 hover:bg-gray-200'
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Evacuation Mode Banner - Enhanced WCAG 2.1 AA+ Compliance */}
      {isEvacuationMode && (
        <Alert variant="evacuation" className="border-4 animate-pulse">
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🚨</span>
              <div>
                <span className="font-bold text-xl block">
                  MODO DE EVACUAÇÃO ATIVO
                </span>
                <span className="font-medium">
                  Siga as instruções da equipe e mantenha a calma.
                </span>
              </div>
            </div>
            <AccessibilityButton
              variant="outline"
              size="lg"
              onClick={() => setIsEvacuationMode(false)}
              healthcareContext="emergency"
              aria-label="Desativar modo de evacuação"
              className="border-2 border-orange-800 text-orange-900 bg-orange-50 hover:bg-orange-100 font-semibold"
            >
              Desativar
            </AccessibilityButton>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            🚨 Sistema de Emergência
            <Badge variant={activeAlerts.length > 0 ? 'destructive' : 'secondary'}>
              {activeAlerts.length} Alertas Ativos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <AccessibilityButton
              onClick={() => setShowAlertForm(true)}
              healthcareContext="emergency"
              className="flex-1"
            >
              Novo Alerta de Emergência
            </AccessibilityButton>
            <AccessibilityButton
              variant="outline"
              onClick={() => handleContactEmergency('ambulance')}
              healthcareContext="emergency"
            >
              🚑 Ambulância
            </AccessibilityButton>
            <AccessibilityButton
              variant="outline"
              onClick={() => handleContactEmergency('fire')}
              healthcareContext="emergency"
            >
              🚒 Bombeiros
            </AccessibilityButton>
            <AccessibilityButton
              variant="outline"
              onClick={() => handleContactEmergency('police')}
              healthcareContext="emergency"
            >
              🚔 Polícia
            </AccessibilityButton>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alertas Ativos</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedAlerts.map(alert => (
              <Card
                key={alert.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] min-h-[120px]',
                  getTypeColor(alert.type),
                  alert.severity === 'critical' && 'ring-2 ring-red-500 animate-pulse'
                )}
                onClick={() => setSelectedAlert(alert)}
                role="button"
                tabIndex={0}
                aria-label={`Ver detalhes do alerta ${emergencyProtocols[alert.type].title} - ${alert.severity}`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedAlert(alert)
                  }
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2 font-bold">
                        <span className="text-xl" aria-hidden="true">
                          {alert.type === 'medical' && '🏥'}
                          {alert.type === 'facility' && '🏢'}
                          {alert.type === 'security' && '🛡️'}
                        </span>
                        <span className="sr-only">
                          {alert.type === 'medical' && 'Emergência médica: '}
                          {alert.type === 'facility' && 'Emergência de instalação: '}
                          {alert.type === 'security' && 'Emergência de segurança: '}
                        </span>
                        {emergencyProtocols[alert.type].title}
                      </CardTitle>
                      <p className="text-sm font-medium mt-1">
                        {format(parseISO(alert.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge 
                        className={getSeverityColor(alert.severity)}
                        aria-label={`Severidade: ${alert.severity}`}
                      >
                        {alert.severity === 'critical' && 'Crítico'}
                        {alert.severity === 'high' && 'Alto'}
                        {alert.severity === 'medium' && 'Médio'}
                        {alert.severity === 'low' && 'Baixo'}
                      </Badge>
                      <Badge 
                        variant={alert.status === 'active' ? 'destructive' : 'secondary'}
                        aria-label={`Status: ${alert.status}`}
                      >
                        {alert.status === 'active' ? 'Ativo' : 'Resolvido'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3 font-medium">{alert.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Local:</span>
                      <span>{alert.location}</span>
                    </div>
                    {alert.patientId && (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Paciente:</span>
                        <span>{
                          patients.find(p => p.personalInfo.cpf === alert.patientId)?.personalInfo.fullName || 'Desconhecido'
                        }</span>
                      </div>
                    )}
                    {alert.affectedAreas.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Áreas Afetadas:</span>
                        <span>{alert.affectedAreas.join(', ')}</span>
                      </div>
                    )}
                    {alert.requiresEvacuation && (
                      <div className="text-red-900 font-bold bg-red-100 p-2 rounded border border-red-300">
                        🚨 Requer evacuação imediata
                      </div>
                    )}
                  </div>

                  {alert.responses.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-current">
                      <p className="text-sm font-medium mb-1">
                        Respostas ({alert.responses.length})
                      </p>
                      <div className="text-sm">
                        {alert.responses.slice(-2).map((response, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{response.action}</span>
                            <span className="text-muted-foreground">
                              {format(parseISO(response.timestamp), 'HH:mm')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  Detalhes do Alerta - {selectedAlert.id}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Criado em: {format(parseISO(selectedAlert.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAlert(null)}
                >
                  Fechar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleResolveAlert}
                >
                  Resolver Alerta
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Alert Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Informações do Alerta</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Tipo:</strong> {emergencyProtocols[selectedAlert.type].title}</div>
                  <div><strong>Severidade:</strong> 
                    <Badge className={`ml-2 ${getSeverityColor(selectedAlert.severity)}`}>
                      {selectedAlert.severity}
                    </Badge>
                  </div>
                  <div><strong>Status:</strong> 
                    <Badge variant={selectedAlert.status === 'active' ? 'destructive' : 'secondary'} className="ml-2">
                      {selectedAlert.status}
                    </Badge>
                  </div>
                  <div><strong>Local:</strong> {selectedAlert.location}</div>
                  {selectedAlert.patientId && (
                    <div><strong>Paciente:</strong> {
                      patients.find(p => p.personalInfo.cpf === selectedAlert.patientId)?.personalInfo.fullName || 'Desconhecido'
                    }</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Protocolo Recomendado</h4>
                <div className="space-y-1 text-sm">
                  {emergencyProtocols[selectedAlert.type].steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-medium">{index + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-medium mb-2">Descrição</h4>
              <p className="text-sm">{selectedAlert.description}</p>
            </div>

            {/* Emergency Contacts */}
            <div>
              <h4 className="font-medium mb-2">Contatos de Emergência</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {emergencyContacts.map(contact => (
                  <Card key={contact.phone} className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.role}</p>
                        <p className="text-xs font-mono">{contact.phone}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={contact.available ? 'default' : 'secondary'} className="text-xs">
                          {contact.available ? 'Disponível' : 'Indisponível'}
                        </Badge>
                        {contact.isOnCall && (
                          <Badge variant="outline" className="text-xs">Plantão</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Response Log */}
            <div>
              <h4 className="font-medium mb-2">Registro de Respostas</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto text-sm font-mono">
                {selectedAlert.responses.length > 0 ? (
                  selectedAlert.responses.map((response, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <div className="flex justify-between">
                        <span>{response.action}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(response.timestamp), 'HH:mm:ss')}
                        </span>
                      </div>
                      {response.notes && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {response.notes}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Por: {response.responderName} ({response.responderRole})
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhuma resposta registrada ainda.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Response Actions */}
            <div>
              <h4 className="font-medium mb-2">Ações Rápidas</h4>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateAlert({
                    action: 'Médico notificado',
                    responderName: 'Sistema',
                    responderRole: 'Automático',
                    timestamp: new Date().toISOString(),
                    notes: 'Médico responsável contatado via telefone'
                  })}
                >
                  👨‍⚕️ Notificar Médico
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateAlert({
                    action: 'Equipe reunida',
                    responderName: 'Sistema',
                    responderRole: 'Automático',
                    timestamp: new Date().toISOString(),
                    notes: 'Equipe de emergência reunida no local'
                  })}
                >
                  👥 Reunir Equipe
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleContactEmergency('ambulance')}
                >
                  🚑 Chamar Ambulância
                </Button>
                {selectedAlert.requiresEvacuation && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsEvacuationMode(true)}
                  >
                    🚨 Iniciar Evacuação
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Alert Form */}
      {showAlertForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Criar Novo Alerta</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAlertForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HealthcareFormGroup label="Tipo de Emergência" healthcareContext="emergency">
                <div className="space-y-2">
                  {Object.entries(emergencyProtocols).map(([type, protocol]) => (
                    <Card
                      key={type}
                      className={cn(
                        'cursor-pointer transition-all',
                        alertForm.type === type && 'ring-2 ring-blue-500'
                      )}
                      onClick={() => setAlertForm(prev => ({ ...prev, type: type as EmergencyAlert['type'] }))}
                    >
                      <CardContent className="p-3">
                        <h4 className="font-medium">{protocol.title}</h4>
                        <p className="text-xs text-muted-foreground">{protocol.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </HealthcareFormGroup>

              <HealthcareFormGroup label="Severidade" healthcareContext="emergency">
                <div className="space-y-2">
                  {(['critical', 'high', 'medium', 'low'] as const).map(severity => (
                    <Card
                      key={severity}
                      className={cn(
                        'cursor-pointer transition-all',
                        alertForm.severity === severity && 'ring-2 ring-blue-500'
                      )}
                      onClick={() => setAlertForm(prev => ({ ...prev, severity }))}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-3 h-3 rounded-full', getSeverityColor(severity))} />
                          <span className="font-medium capitalize">{severity}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </HealthcareFormGroup>
            </div>

            <AccessibilityInput
              label="Descrição da Emergência"
              placeholder="Descreva detalhadamente o que está acontecendo..."
              value={alertForm.description}
              onChange={(e) => setAlertForm(prev => ({ ...prev, description: e.target.value }))}
              healthcareContext="emergency"
              multiline
              rows={3}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AccessibilityInput
                label="Local"
                placeholder="Onde está ocorrendo a emergência?"
                value={alertForm.location}
                onChange={(e) => setAlertForm(prev => ({ ...prev, location: e.target.value }))}
                healthcareContext="emergency"
              />

              <AccessibilityInput
                label="Duração Estimada"
                placeholder="Ex: 30 minutos, 1 hora, etc."
                value={alertForm.estimatedDuration}
                onChange={(e) => setAlertForm(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                healthcareContext="emergency"
              />
            </div>

            <HealthcareFormGroup label="Áreas Afetadas" healthcareContext="emergency">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableAreas.map(area => (
                  <Button
                    key={area}
                    variant={alertForm.affectedAreas.includes(area) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAreaToggle(area)}
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </HealthcareFormGroup>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={alertForm.requiresMedicalAttention}
                    onChange={(e) => setAlertForm(prev => ({ ...prev, requiresMedicalAttention: e.target.checked }))}
                  />
                  <span className="text-sm">Requer atenção médica imediata</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={alertForm.requiresEvacuation}
                    onChange={(e) => setAlertForm(prev => ({ ...prev, requiresEvacuation: e.target.checked }))}
                  />
                  <span className="text-sm">Requer evacuação do local</span>
                </label>
              </div>

              {alertForm.requiresMedicalAttention && (
                <AccessibilityInput
                  label="Paciente Envolvido (opcional)"
                  placeholder="Selecione o paciente se aplicável"
                  healthcareContext="emergency"
                  select
                >
                  <option value="">Selecione um paciente</option>
                  {patients.map(patient => (
                    <option key={patient.personalInfo.cpf} value={patient.personalInfo.cpf}>
                      {patient.personalInfo.fullName}
                    </option>
                  ))}
                </AccessibilityInput>
              )}
            </div>

            <AccessibilityInput
              label="Observações Adicionais"
              placeholder="Informações complementares importantes..."
              value={alertForm.additionalNotes}
              onChange={(e) => setAlertForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
              healthcareContext="emergency"
              multiline
              rows={3}
            />

            <div className="flex gap-3">
              <AccessibilityButton
                onClick={handleCreateAlert}
                healthcareContext="emergency"
                className="flex-1"
              >
                Criar Alerta de Emergência
              </AccessibilityButton>
              <Button
                variant="outline"
                onClick={() => setShowAlertForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Response Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log do Sistema de Emergência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-40 overflow-y-auto text-sm font-mono">
            {responseLog.length > 0 ? (
              responseLog.map((entry, index) => (
                <div key={index} className="text-muted-foreground">
                  {entry}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhuma atividade registrada nesta sessão.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

EmergencyAlertSystem.displayName = 'EmergencyAlertSystem'