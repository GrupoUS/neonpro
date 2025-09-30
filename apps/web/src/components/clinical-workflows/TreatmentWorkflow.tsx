/**
 * Treatment Workflow Component
 * 
 * Fluxo de trabalho para procedimentos estéticos em clínicas brasileiras
 * Com planejamento de tratamento, acompanhamento de progresso e conformidade ANVISA
 * 
 * @component TreatmentWorkflow
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
  TreatmentSession,
  TreatmentProgress,
  TreatmentMeasurements,
  ClinicalTask,
  ANVISAReport,
  MedicalMaterial,
  ClinicalWorkflowComponentProps
} from './types'

import { AestheticTreatment, PatientData, HealthcareContext } from '@/types/healthcare'

interface TreatmentWorkflowProps extends ClinicalWorkflowComponentProps {
  patientId: string
  treatment?: AestheticTreatment
  sessions?: TreatmentSession[]
  progress?: TreatmentProgress[]
  tasks?: ClinicalTask[]
  onSessionCreate?: (session: Omit<TreatmentSession, 'id'>) => Promise<void>
  onSessionUpdate?: (sessionId: string, session: Partial<TreatmentSession>) => Promise<void>
  onProgressCreate?: (progress: Omit<TreatmentProgress, 'id'>) => Promise<void>
  onTaskCreate?: (task: Omit<ClinicalTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onTaskUpdate?: (taskId: string, task: Partial<ClinicalTask>) => Promise<void>
  onANVISAReport?: (report: Omit<ANVISAReport, 'id' | 'reportedAt'>) => Promise<void>
  onEmergencyAlert?: (alert: any) => void
}

// Treatment workflow steps
const TREATMENT_STEPS = [
  { id: 'assessment', title: 'Avaliação Inicial', duration: 30 },
  { id: 'planning', title: 'Planejamento', duration: 20 },
  { id: 'preparation', title: 'Preparação', duration: 15 },
  { id: 'procedure', title: 'Procedimento', duration: 60 },
  { id: 'recovery', title: 'Recuperação', duration: 30 },
  { id: 'follow_up', title: 'Acompanhamento', duration: 15 }
]

export const TreatmentWorkflow: React.FC<TreatmentWorkflowProps> = ({
  patientId,
  staffId,
  healthcareContext,
  className,
  treatment,
  sessions = [],
  progress = [],
  tasks = [],
  onSessionCreate,
  onSessionUpdate,
  onProgressCreate,
  onTaskCreate,
  onTaskUpdate,
  onANVISAReport,
  onEmergencyAlert
}) => {
  const [activeTab, setActiveTab] = useState('planning')
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  // Form states
  const [newSession, setNewSession] = useState({
    scheduledDate: '',
    duration: 60,
    professionalId: staffId,
    roomNumber: '',
    notes: ''
  })

  const [treatmentPlan, setTreatmentPlan] = useState({
    totalSessions: 1,
    intervalWeeks: 2,
    expectedResults: '',
    contraindications: [] as string[],
    aftercareInstructions: [] as string[]
  })

  const [anvisaReport, setAnvisaReport] = useState({
    procedureType: '',
    materialsUsed: [] as MedicalMaterial[],
    complications: '',
    patientOutcome: '',
    followUpRequired: false,
    followUpDate: ''
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

  const handleSessionCreate = useCallback(async () => {
    try {
      setIsSubmitting(true)

      const sessionData: Omit<TreatmentSession, 'id'> = {
        treatmentId: treatment?.id || '',
        patientId,
        scheduledDate: newSession.scheduledDate,
        duration: newSession.duration,
        status: 'scheduled',
        professionalId: newSession.professionalId,
        roomNumber: newSession.roomNumber,
        notes: newSession.notes
      }

      if (onSessionCreate) {
        await onSessionCreate(sessionData)
      }

      // Reset form
      setNewSession({
        scheduledDate: '',
        duration: 60,
        professionalId: staffId,
        roomNumber: '',
        notes: ''
      })

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Sessão de tratamento agendada com sucesso')
    } catch (error) {
      console.error('Error creating session:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [newSession, patientId, treatment?.id, onSessionCreate])

  const handleProgressUpdate = useCallback(async (sessionId: string, status: string, notes: string) => {
    try {
      setIsSubmitting(true)

      const progressData: Omit<TreatmentProgress, 'id'> = {
        treatmentSessionId: sessionId,
        patientId,
        professionalId: staffId,
        status: status as any,
        progressPercentage: status === 'completed' ? 100 : 50,
        notes
      }

      if (onProgressCreate) {
        await onProgressCreate(progressData)
      }

      // Update session status
      if (onSessionUpdate) {
        await onSessionUpdate(sessionId, { status: status as any })
      }

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Progresso do tratamento atualizado com sucesso')
    } catch (error) {
      console.error('Error updating progress:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [patientId, staffId, onProgressCreate, onSessionUpdate])

  const handleTaskCreate = useCallback(async (taskData: Omit<ClinicalTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsSubmitting(true)

      if (onTaskCreate) {
        await onTaskCreate(taskData)
      }

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Tarefa criada com sucesso')
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [onTaskCreate])

  const handleANVISASubmit = useCallback(async () => {
    try {
      setIsSubmitting(true)

      const reportData: Omit<ANVISAReport, 'id' | 'reportedAt'> = {
        treatmentSessionId: sessions.find(s => s.status === 'completed')?.id || '',
        patientId,
        professionalId: staffId,
        procedureType: anvisaReport.procedureType,
        materialsUsed: anvisaReport.materialsUsed,
        complications: anvisaReport.complications,
        patientOutcome: anvisaReport.patientOutcome,
        followUpRequired: anvisaReport.followUpRequired,
        followUpDate: anvisaReport.followUpDate,
        reportedBy: staffId
      }

      if (onANVISAReport) {
        await onANVISAReport(reportData)
      }

      // Reset form
      setAnvisaReport({
        procedureType: '',
        materialsUsed: [],
        complications: '',
        patientOutcome: '',
        followUpRequired: false,
        followUpDate: ''
      })

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Relatório ANVISA enviado com sucesso')
    } catch (error) {
      console.error('Error submitting ANVISA report:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [anvisaReport, patientId, staffId, sessions, onANVISAReport])

  const handleEmergency = useCallback(() => {
    if (onEmergencyAlert) {
      onEmergencyAlert({
        id: `emergency-${Date.now()}`,
        type: 'medical_emergency',
        severity: 'high',
        patientId,
        location: 'Sala de Tratamento',
        description: 'Emergência durante procedimento estético',
        reportedBy: staffId,
        reportedAt: new Date().toISOString(),
        status: 'active',
        responseTeam: []
      })
    }
  }, [onEmergencyAlert, patientId, staffId])

  const addMaterial = useCallback(() => {
    setAnvisaReport(prev => ({
      ...prev,
      materialsUsed: [...prev.materialsUsed, {
        id: '',
        name: '',
        batchNumber: '',
        expirationDate: '',
        quantity: 1,
        manufacturer: ''
      }]
    }))
  }, [])

  const updateMaterial = useCallback((index: number, field: string, value: any) => {
    setAnvisaReport(prev => ({
      ...prev,
      materialsUsed: prev.materialsUsed.map((material, i) => 
        i === index ? { ...material, [field]: value } : material
      )
    }))
  }, [])

  const removeMaterial = useCallback((index: number) => {
    setAnvisaReport(prev => ({
      ...prev,
      materialsUsed: prev.materialsUsed.filter((_, i) => i !== index)
    }))
  }, [])

  const getNextSessionDate = () => {
    const lastSession = sessions.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())[0]
    if (!lastSession) return new Date().toISOString().slice(0, 16)
    
    const nextDate = new Date(lastSession.scheduledDate)
    nextDate.setDate(nextDate.getDate() + (treatmentPlan.intervalWeeks * 7))
    return nextDate.toISOString().slice(0, 16)
  }

  const completedSessions = sessions.filter(s => s.status === 'completed').length
  const totalSessions = Math.max(sessions.length, treatmentPlan.totalSessions)
  const progressPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0

  return (
    <AccessibilityProvider>
      <div className={`max-w-7xl mx-auto p-4 ${className}`}>
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Fluxo de Tratamento Estético
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Planejamento e acompanhamento de procedimentos com conformidade ANVISA
                </p>
                {treatment && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{treatment.category}</Badge>
                    <Badge variant="outline">{treatment.duration}min</Badge>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isOffline ? "destructive" : "secondary"}>
                  {isOffline ? 'Offline' : 'Online'}
                </Badge>
                <MobileHealthcareButton
                  variant="emergency"
                  size="lg"
                  onClick={handleEmergency}
                  aria-label="Acionar emergência"
                >
                  Emergência
                </MobileHealthcareButton>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    Progresso Geral do Tratamento
                  </span>
                  <span className="text-sm text-gray-600">
                    {completedSessions} de {totalSessions} sessões ({Math.round(progressPercentage)}%)
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              {/* Treatment Steps */}
              <div className="grid grid-cols-6 gap-2">
                {TREATMENT_STEPS.map((step, index) => (
                  <div
                    key={step.id}
                    className={`text-center p-2 rounded-lg border ${
                      index <= currentStep ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-xs font-medium">{step.title}</div>
                    <div className="text-xs text-gray-600">{step.duration}min</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="planning">Planejamento</TabsTrigger>
            <TabsTrigger value="sessions">Sessões</TabsTrigger>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
            <TabsTrigger value="anvisa">Relatório ANVISA</TabsTrigger>
          </TabsList>

          <TabsContent value="planning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plano de Tratamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <HealthcareFormGroup label="Total de Sessões" context={healthcareContext}>
                    <AccessibilityInput
                      type="number"
                      min="1"
                      max="20"
                      value={treatmentPlan.totalSessions}
                      onChange={(e) => setTreatmentPlan(prev => ({ ...prev, totalSessions: parseInt(e.target.value) || 1 }))}
                    />
                  </HealthcareFormGroup>
                  <HealthcareFormGroup label="Intervalo entre Sessões (semanas)" context={healthcareContext}>
                    <AccessibilityInput
                      type="number"
                      min="1"
                      max="12"
                      value={treatmentPlan.intervalWeeks}
                      onChange={(e) => setTreatmentPlan(prev => ({ ...prev, intervalWeeks: parseInt(e.target.value) || 2 }))}
                    />
                  </HealthcareFormGroup>
                </div>

                <HealthcareFormGroup label="Resultados Esperados" context={healthcareContext}>
                  <textarea
                    value={treatmentPlan.expectedResults}
                    onChange={(e) => setTreatmentPlan(prev => ({ ...prev, expectedResults: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Descreva os resultados esperados do tratamento..."
                  />
                </HealthcareFormGroup>

                <HealthcareFormGroup label="Contraindicações" context={healthcareContext}>
                  <textarea
                    value={treatmentPlan.contraindications.join('\n')}
                    onChange={(e) => setTreatmentPlan(prev => ({ 
                      ...prev, 
                      contraindications: e.target.value.split('\n').filter(item => item.trim()) 
                    }))}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Liste as contraindicações, uma por linha..."
                  />
                </HealthcareFormGroup>

                <HealthcareFormGroup label="Instruções de Pós-Tratamento" context={healthcareContext}>
                  <textarea
                    value={treatmentPlan.aftercareInstructions.join('\n')}
                    onChange={(e) => setTreatmentPlan(prev => ({ 
                      ...prev, 
                      aftercareInstructions: e.target.value.split('\n').filter(item => item.trim()) 
                    }))}
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    placeholder="Liste as instruções de cuidados pós-tratamento, uma por linha..."
                  />
                </HealthcareFormGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agendar Nova Sessão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <HealthcareFormGroup label="Data e Hora" context={healthcareContext}>
                    <AccessibilityInput
                      type="datetime-local"
                      value={newSession.scheduledDate || getNextSessionDate()}
                      onChange={(e) => setNewSession(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    />
                  </HealthcareFormGroup>
                  <HealthcareFormGroup label="Duração (minutos)" context={healthcareContext}>
                    <AccessibilityInput
                      type="number"
                      min="15"
                      max="240"
                      value={newSession.duration}
                      onChange={(e) => setNewSession(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    />
                  </HealthcareFormGroup>
                  <HealthcareFormGroup label="Sala" context={healthcareContext}>
                    <AccessibilityInput
                      value={newSession.roomNumber}
                      onChange={(e) => setNewSession(prev => ({ ...prev, roomNumber: e.target.value }))}
                      placeholder="Número da sala"
                    />
                  </HealthcareFormGroup>
                </div>

                <HealthcareFormGroup label="Observações" context={healthcareContext}>
                  <textarea
                    value={newSession.notes}
                    onChange={(e) => setNewSession(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Observações sobre a sessão..."
                  />
                </HealthcareFormGroup>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSessionCreate}
                    disabled={isSubmitting || !newSession.scheduledDate}
                    loading={isSubmitting}
                  >
                    Agendar Sessão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sessões Agendadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map(session => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onUpdateProgress={handleProgressUpdate}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progresso do Tratamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progress.map(item => (
                    <ProgressCard key={item.id} progress={item} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tarefas do Tratamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={onTaskUpdate}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anvisa" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório ANVISA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <HealthcareFormGroup label="Tipo de Procedimento" context={healthcareContext}>
                  <AccessibilityInput
                    value={anvisaReport.procedureType}
                    onChange={(e) => setAnvisaReport(prev => ({ ...prev, procedureType: e.target.value }))}
                    placeholder="Descrição do procedimento realizado"
                  />
                </HealthcareFormGroup>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Materiais Utilizados</h4>
                    <Button variant="outline" onClick={addMaterial}>
                      Adicionar Material
                    </Button>
                  </div>
                  
                  {anvisaReport.materialsUsed.map((material, index) => (
                    <div key={index} className="grid grid-cols-6 gap-2 items-end">
                      <HealthcareFormGroup label="Nome" context={healthcareContext}>
                        <AccessibilityInput
                          value={material.name}
                          onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                        />
                      </HealthcareFormGroup>
                      <HealthcareFormGroup label="Lote" context={healthcareContext}>
                        <AccessibilityInput
                          value={material.batchNumber}
                          onChange={(e) => updateMaterial(index, 'batchNumber', e.target.value)}
                        />
                      </HealthcareFormGroup>
                      <HealthcareFormGroup label="Validade" context={healthcareContext}>
                        <AccessibilityInput
                          type="date"
                          value={material.expirationDate}
                          onChange={(e) => updateMaterial(index, 'expirationDate', e.target.value)}
                        />
                      </HealthcareFormGroup>
                      <HealthcareFormGroup label="Qtd" context={healthcareContext}>
                        <AccessibilityInput
                          type="number"
                          value={material.quantity}
                          onChange={(e) => updateMaterial(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </HealthcareFormGroup>
                      <HealthcareFormGroup label="Fabricante" context={healthcareContext}>
                        <AccessibilityInput
                          value={material.manufacturer}
                          onChange={(e) => updateMaterial(index, 'manufacturer', e.target.value)}
                        />
                      </HealthcareFormGroup>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMaterial(index)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>

                <HealthcareFormGroup label="Complicações" context={healthcareContext}>
                  <textarea
                    value={anvisaReport.complications}
                    onChange={(e) => setAnvisaReport(prev => ({ ...prev, complications: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Descreva quaisquer complicações ocorridas..."
                  />
                </HealthcareFormGroup>

                <HealthcareFormGroup label="Resultado do Paciente" context={healthcareContext}>
                  <textarea
                    value={anvisaReport.patientOutcome}
                    onChange={(e) => setAnvisaReport(prev => ({ ...prev, patientOutcome: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Descreva o resultado obtido com o tratamento..."
                  />
                </HealthcareFormGroup>

                <div className="grid grid-cols-2 gap-4">
                  <HealthcareFormGroup label="Requer Acompanhamento" context={healthcareContext}>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={anvisaReport.followUpRequired}
                        onChange={(e) => setAnvisaReport(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                      />
                      Sim
                    </label>
                  </HealthcareFormGroup>
                  {anvisaReport.followUpRequired && (
                    <HealthcareFormGroup label="Data do Acompanhamento" context={healthcareContext}>
                      <AccessibilityInput
                        type="date"
                        value={anvisaReport.followUpDate}
                        onChange={(e) => setAnvisaReport(prev => ({ ...prev, followUpDate: e.target.value }))}
                      />
                    </HealthcareFormGroup>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleANVISASubmit}
                    disabled={isSubmitting || !anvisaReport.procedureType}
                    loading={isSubmitting}
                  >
                    Enviar Relatório ANVISA
                  </Button>
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
const SessionCard: React.FC<{
  session: TreatmentSession
  onUpdateProgress: (sessionId: string, status: string, notes: string) => void
  disabled: boolean
}> = ({ session, onUpdateProgress, disabled }) => {
  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'blue',
      in_progress: 'yellow',
      completed: 'green',
      cancelled: 'red',
      no_show: 'gray'
    }
    return colors[status] || 'gray'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Agendada',
      in_progress: 'Em Andamento',
      completed: 'Concluída',
      cancelled: 'Cancelada',
      no_show: 'Não Compareceu'
    }
    return labels[status] || status
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    await onUpdateProgress(session.id, newStatus, notes)
    setIsUpdating(false)
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(session.status) as any}>
            {getStatusLabel(session.status)}
          </Badge>
          <span className="text-sm text-gray-600">
            {new Date(session.scheduledDate).toLocaleString('pt-BR')}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          {session.duration}min
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
        <span>Sala {session.roomNumber || 'Não definida'}</span>
        <span>Profissional {session.professionalId}</span>
      </div>
      {session.notes && (
        <p className="text-sm text-gray-700 mb-2">{session.notes}</p>
      )}
      {session.status !== 'completed' && session.status !== 'cancelled' && (
        <div className="flex items-center gap-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicionar notas..."
            className="flex-1 p-2 border rounded-md text-sm"
            rows={2}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate(session.status === 'scheduled' ? 'in_progress' : 'completed')}
            disabled={isUpdating || disabled}
          >
            {isUpdating ? 'Atualizando...' : session.status === 'scheduled' ? 'Iniciar' : 'Concluir'}
          </Button>
        </div>
      )}
    </div>
  )
}

const ProgressCard: React.FC<{ progress: TreatmentProgress }> = ({ progress }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      not_started: 'gray',
      in_progress: 'blue',
      completed: 'green',
      complications: 'red',
      cancelled: 'yellow'
    }
    return colors[status] || 'gray'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      not_started: 'Não Iniciado',
      in_progress: 'Em Progresso',
      completed: 'Concluído',
      complications: 'Complicações',
      cancelled: 'Cancelado'
    }
    return labels[status] || status
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <Badge variant={getStatusColor(progress.status) as any}>
          {getStatusLabel(progress.status)}
        </Badge>
        <span className="text-sm text-gray-600">
          {progress.progressPercentage}% concluído
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress.progressPercentage}%` }}
        />
      </div>
      {progress.notes && (
        <p className="text-sm text-gray-700">{progress.notes}</p>
      )}
    </div>
  )
}

const TaskCard: React.FC<{
  task: ClinicalTask
  onUpdate?: (taskId: string, task: Partial<ClinicalTask>) => Promise<void>
  disabled: boolean
}> = ({ task, onUpdate, disabled }) => {
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'gray',
      medium: 'blue',
      high: 'yellow',
      urgent: 'red'
    }
    return colors[priority] || 'gray'
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      urgent: 'Urgente'
    }
    return labels[priority] || priority
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={getPriorityColor(task.priority) as any}>
            {getPriorityLabel(task.priority)}
          </Badge>
          <Badge variant="secondary">{task.category}</Badge>
        </div>
        <span className="text-sm text-gray-600">
          {new Date(task.dueDate).toLocaleDateString('pt-BR')}
        </span>
      </div>
      <h4 className="font-medium mb-2">{task.title}</h4>
      <p className="text-sm text-gray-700 mb-2">{task.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Atribuído a: {task.assignedTo}
        </span>
        <Badge variant={task.status === 'completed' ? 'green' : 'outline'}>
          {task.status}
        </Badge>
      </div>
    </div>
  )
}

export default TreatmentWorkflow