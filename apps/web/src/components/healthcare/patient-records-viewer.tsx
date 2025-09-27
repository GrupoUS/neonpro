import * as React from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { cn } from '@/lib/utils.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js'
import { Badge } from '@/components/ui/badge.js'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.js'
import { AccessibilityButton } from '@/components/ui/accessibility-button'
import { HealthcareFormGroup } from '@/components/ui/healthcare-form-group'
import { Alert, AlertDescription } from '@/components/ui/alert.js'

import type { 
  PatientData, 
  TreatmentSession, 
  LGPDConsentRecord,
  HealthcareContext 
} from '@/types/healthcare'

interface PatientRecordsViewerProps {
  patient: PatientData
  treatmentSessions: TreatmentSession[]
  lgpdRecords: LGPDConsentRecord[]
  onUpdatePatient?: (patient: PatientData) => void
  onExportData?: (patientId: string) => void
  onRequestDataDeletion?: (patientId: string) => void
  className?: string
  healthcareContext?: HealthcareContext
}

interface RecordTab {
  id: string
  label: string
  icon?: React.ReactNode
  count?: number
}

export const PatientRecordsViewer: React.FC<PatientRecordsViewerProps> = ({
  patient,
  treatmentSessions,
  lgpdRecords,
  _onUpdatePatient,
  onExportData,
  onRequestDataDeletion,
  className,
  _healthcareContext = 'patient'
}) => {
  const [selectedTab, setSelectedTab] = React.useState('overview')
  const [showSensitiveData, setShowSensitiveData] = React.useState(false)
  const [auditLog, setAuditLog] = React.useState<string[]>([])

  // Add to audit log
  const addToAuditLog = React.useCallback((action: string) => {
    const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm:ss')
    setAuditLog(prev => [...prev, `[${timestamp}] ${action}`])
  }, [])

  // Handle sensitive data toggle
  const handleToggleSensitiveData = () => {
    const newValue = !showSensitiveData
    setShowSensitiveData(newValue)
    addToAuditLog(`Dados sensíveis ${newValue ? 'exibidos' : 'ocultados'}`)
  }

  // Handle data export
  const handleExportData = () => {
    onExportData?.(patient.personalInfo.cpf)
    addToAuditLog('Exportação de dados solicitada')
  }

  // Handle data deletion request
  const handleDataDeletion = () => {
    if (confirm('Tem certeza que deseja solicitar a exclusão dos dados deste paciente? Esta ação não pode ser desfeita.')) {
      onRequestDataDeletion?.(patient.personalInfo.cpf)
      addToAuditLog('Solicitação de exclusão de dados registrada')
    }
  }

  // Calculate patient statistics
  const patientStats = React.useMemo(() => {
    const completedSessions = treatmentSessions.filter(s => s.status === 'completed')
    const totalSpent = completedSessions.reduce((sum, _session) => {
      // This would need price info from treatment catalog
      return sum + 0 // Placeholder
    }, 0)
    
    const lastVisit = completedSessions.length > 0 
      ? completedSessions.sort((a, b) => new Date(b.scheduledStart).getTime() - new Date(a.scheduledStart).getTime())[0]
      : null

    return {
      totalSessions: treatmentSessions.length,
      completedSessions: completedSessions.length,
      totalSpent,
      lastVisit: lastVisit ? format(parseISO(lastVisit.scheduledStart), 'dd/MM/yyyy', { locale: ptBR }) : 'Nunca'
    }
  }, [treatmentSessions])

  // Available tabs
  const tabs: RecordTab[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'personal', label: 'Dados Pessoais', count: 1 },
    { id: 'medical', label: 'Histórico Médico', count: 1 },
    { id: 'treatments', label: 'Tratamentos', count: treatmentSessions.length },
    { id: 'lgpd', label: 'LGPD', count: lgpdRecords.length },
    { id: 'consent', label: 'Consentimentos', count: lgpdRecords.length }
  ]

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`
    }
    return phone
  }

  const formatCPF = (cpf: string) => {
    if (cpf.length === 11) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
    }
    return cpf
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with patient info and actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">Prontuário do Paciente</CardTitle>
              <p className="text-muted-foreground">
                {patient.personalInfo.fullName} • {formatCPF(patient.personalInfo.cpf)}
              </p>
            </div>
            <div className="flex gap-2">
              <AccessibilityButton
                variant="outline"
                size="sm"
                onClick={handleToggleSensitiveData}
                healthcareContext="admin"
              >
                {showSensitiveData ? 'Ocultar Dados' : 'Exibir Dados'}
              </AccessibilityButton>
              <AccessibilityButton
                variant="outline"
                size="sm"
                onClick={handleExportData}
                lgpdAction="data_export"
                healthcareContext="admin"
              >
                Exportar
              </AccessibilityButton>
              <AccessibilityButton
                variant="destructive"
                size="sm"
                onClick={handleDataDeletion}
                lgpdAction="data_deletion"
                healthcareContext="admin"
              >
                Excluir Dados
              </AccessibilityButton>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{patientStats.totalSessions}</div>
              <div className="text-sm text-muted-foreground">Total Sessões</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{patientStats.completedSessions}</div>
              <div className="text-sm text-muted-foreground">Concluídas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                R$ {patientStats.totalSpent.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Investido</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{patientStats.lastVisit}</div>
              <div className="text-sm text-muted-foreground">Última Visita</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="text-xs"
              aria-label={`Ver ${tab.label}`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</label>
                  <p id="email" className={showSensitiveData ? 'text-sm' : 'blur-sm select-none'}>
                    {patient.personalInfo.email}
                  </p>
                </div>
                <div>
                  <label htmlFor="phone" className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p id="phone" className={showSensitiveData ? 'text-sm' : 'blur-sm select-none'}>
                    {formatPhone(patient.personalInfo.phone)}
                  </p>
                </div>
                <div>
                  <label htmlFor="address" className="text-sm font-medium text-muted-foreground">Endereço</label>
                  <p id="address" className={showSensitiveData ? 'text-sm' : 'blur-sm select-none'}>
                    {patient.address.street}, {patient.address.number} - {patient.address.neighborhood}
                  </p>
                  <p className={showSensitiveData ? 'text-sm' : 'blur-sm select-none'}>
                    {patient.address.city} - {patient.address.state}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Médicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label htmlFor="birthdate" className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                  <p id="birthdate" className="text-sm">
                    {format(parseISO(patient.personalInfo.dateOfBirth), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <label htmlFor="gender" className="text-sm font-medium text-muted-foreground">Gênero</label>
                  <p id="gender" className="text-sm">{patient.personalInfo.gender}</p>
                </div>
                <div>
                  <label htmlFor="bloodtype" className="text-sm font-medium text-muted-foreground">Tipo Sanguíneo</label>
                  <p id="bloodtype" className="text-sm">{patient.medicalHistory.bloodType || 'Não informado'}</p>
                </div>
                <div>
                  <label htmlFor="allergies" className="text-sm font-medium text-muted-foreground">Alergias</label>
                  <p id="allergies" className="text-sm">
                    {patient.medicalHistory.allergies.length > 0 
                      ? patient.medicalHistory.allergies.join(', ')
                      : 'Nenhuma registrada'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Personal Data Tab */}
        <TabsContent value="personal" className="space-y-4">
          <HealthcareFormGroup
            label="Dados Pessoais Completos"
            healthcareContext="personal"
          >
            <Alert>
              <AlertDescription>
                Esta seção contém dados sensíveis protegidos pela LGPD. O acesso é registrado para auditoria.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Identificação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label htmlFor="fullname" className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                    <p id="fullname" className="text-sm">{patient.personalInfo.fullName}</p>
                  </div>
                  <div>
                    <label htmlFor="cpf" className="text-sm font-medium text-muted-foreground">CPF</label>
                    <p id="cpf" className={showSensitiveData ? 'text-sm font-mono' : 'blur-sm select-none font-mono'}>
                      {formatCPF(patient.personalInfo.cpf)}
                    </p>
                  </div>
                  <div>
                    <label htmlFor="rg" className="text-sm font-medium text-muted-foreground">RG</label>
                    <p id="rg" className={showSensitiveData ? 'text-sm font-mono' : 'blur-sm select-none font-mono'}>
                      {patient.personalInfo.rg || 'Não informado'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informações Demográficas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label htmlFor="birthdate2" className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                    <p id="birthdate2" className="text-sm">
                      {format(parseISO(patient.personalInfo.dateOfBirth), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <label htmlFor="age" className="text-sm font-medium text-muted-foreground">Idade</label>
                    <p id="age" className="text-sm">{patient.personalInfo.age} anos</p>
                  </div>
                  <div>
                    <label htmlFor="gender2" className="text-sm font-medium text-muted-foreground">Gênero</label>
                    <p id="gender2" className="text-sm">{patient.personalInfo.gender}</p>
                  </div>
                  <div>
                    <label htmlFor="marital" className="text-sm font-medium text-muted-foreground">Estado Civil</label>
                    <p id="marital" className="text-sm">{patient.personalInfo.maritalStatus || 'Não informado'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </HealthcareFormGroup>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical" className="space-y-4">
          <HealthcareFormGroup
            label="Histórico Médico"
            healthcareContext="medical"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informações Médicas Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label htmlFor="bloodtype2" className="text-sm font-medium text-muted-foreground">Tipo Sanguíneo</label>
                    <p id="bloodtype2" className="text-sm">{patient.medicalHistory.bloodType || 'Não informado'}</p>
                  </div>
                  <div>
                    <label htmlFor="weight" className="text-sm font-medium text-muted-foreground">Peso</label>
                    <p id="weight" className="text-sm">{patient.medicalHistory.weight ? `${patient.medicalHistory.weight} kg` : 'Não informado'}</p>
                  </div>
                  <div>
                    <label htmlFor="height" className="text-sm font-medium text-muted-foreground">Altura</label>
                    <p id="height" className="text-sm">{patient.medicalHistory.height ? `${patient.medicalHistory.height} m` : 'Não informado'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Condições de Saúde</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label htmlFor="allergies2" className="text-sm font-medium text-muted-foreground">Alergias</label>
                    <p id="allergies2" className="text-sm">
                      {patient.medicalHistory.allergies.length > 0 
                        ? patient.medicalHistory.allergies.join(', ')
                        : 'Nenhuma registrada'
                      }
                    </p>
                  </div>
                  <div>
                    <label htmlFor="medications" className="text-sm font-medium text-muted-foreground">Medicamentos em Uso</label>
                    <p id="medications" className="text-sm">
                      {patient.medicalHistory.medications.length > 0 
                        ? patient.medicalHistory.medications.join(', ')
                        : 'Nenhum registrado'
                      }
                    </p>
                  </div>
                  <div>
                    <label htmlFor="chronic" className="text-sm font-medium text-muted-foreground">Condições Crônicas</label>
                    <p id="chronic" className="text-sm">
                      {patient.medicalHistory.chronicConditions.length > 0 
                        ? patient.medicalHistory.chronicConditions.join(', ')
                        : 'Nenhuma registrada'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {patient.medicalHistory.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Observações Médicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{patient.medicalHistory.notes}</p>
                </CardContent>
              </Card>
            )}
          </HealthcareFormGroup>
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent value="treatments" className="space-y-4">
          <HealthcareFormGroup
            label="Histórico de Tratamentos"
            healthcareContext="aesthetic"
          >
            {treatmentSessions.length > 0 ? (
              <div className="space-y-3">
                {treatmentSessions
                  .sort((a, b) => new Date(b.scheduledStart).getTime() - new Date(a.scheduledStart).getTime())
                  .map((session) => (
                    <Card key={session.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{session.treatmentName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(session.scheduledStart), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                          <Badge variant={
                            session.status === 'completed' ? 'default' :
                            session.status === 'scheduled' ? 'secondary' :
                            session.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {session.status === 'completed' ? 'Concluído' :
                             session.status === 'scheduled' ? 'Agendado' :
                             session.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Profissional: {session.professional}</p>
                          {session.notes && (
                            <p className="mt-2">Observações: {session.notes}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum tratamento registrado para este paciente.
              </div>
            )}
          </HealthcareFormGroup>
        </TabsContent>

        {/* LGPD Tab */}
        <TabsContent value="lgpd" className="space-y-4">
          <HealthcareFormGroup
            label="Conformidade LGPD"
            healthcareContext="administrative"
          >
            <Alert>
              <AlertDescription>
                Seção de conformidade com a Lei Geral de Proteção de Dados. Todas as operações são registradas para auditoria.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resumo LGPD</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label htmlFor="consent-status" className="text-sm font-medium text-muted-foreground">Status do Consentimento</label>
                    <Badge id="consent-status" variant={patient.consent.hasConsented ? 'default' : 'destructive'}>
                      {patient.consent.hasConsented ? 'Consentido' : 'Pendente'}
                    </Badge>
                  </div>
                  <div>
                    <label htmlFor="consent-date" className="text-sm font-medium text-muted-foreground">Data do Consentimento</label>
                    <p id="consent-date" className="text-sm">
                      {patient.consent.consentDate 
                        ? format(parseISO(patient.consent.consentDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                        : 'Não consentido'
                      }
                    </p>
                  </div>
                  <div>
                    <label htmlFor="consent-version" className="text-sm font-medium text-muted-foreground">Versão do Termo</label>
                    <p id="consent-version" className="text-sm">{patient.consent.version || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Direitos LGPD</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <AccessibilityButton
                      variant="outline"
                      size="sm"
                      onClick={handleExportData}
                      lgpdAction="data_access"
                      className="w-full justify-start"
                    >
                      Acessar Dados
                    </AccessibilityButton>
                    <AccessibilityButton
                      variant="outline"
                      size="sm"
                      onClick={handleExportData}
                      lgpdAction="data_export"
                      className="w-full justify-start"
                    >
                      Exportar Dados
                    </AccessibilityButton>
                    <AccessibilityButton
                      variant="outline"
                      size="sm"
                      onClick={() => {}} // Implementar edição de consentimento
                      lgpdAction="data_consent"
                      className="w-full justify-start"
                    >
                      Gerenciar Consentimento
                    </AccessibilityButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          </HealthcareFormGroup>
        </TabsContent>

        {/* Audit Log */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Registro de Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-40 overflow-y-auto text-sm font-mono">
              {auditLog.length > 0 ? (
                auditLog.map((entry, index) => (
                  <div key={`audit-${index}`} className="text-muted-foreground">
                    {entry}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-center py-4">
                  Nenhuma atividade registrada nesta sessão.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}

PatientRecordsViewer.displayName = 'PatientRecordsViewer'