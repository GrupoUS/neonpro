/**
 * Mobile Clinical Interface Component
 * 
 * Interface clínica otimizada para tablets e dispositivos móveis
 * Desenvolvida para uso em ambiente clínico com acesso rápido a funções essenciais
 * 
 * @component MobileClinicalInterface
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui'
import { Button } from '@neonpro/ui'
import { Alert, AlertDescription } from '@neonpro/ui'
import { Badge } from '@neonpro/ui'
import { AccessibilityProvider } from '@neonpro/ui'
import { ScreenReaderAnnouncer } from '@neonpro/ui'
import { HealthcareFormGroup } from '@/components/ui/healthcare-form-group'
import { AccessibilityInput } from '@/components/ui/accessibility-input'
import { MobileHealthcareButton } from '@/components/ui/mobile-healthcare-button'

import {
  MobileClinicalSession,
  ClinicalActivity,
  DeviceInfo,
  MobileClinicalProps,
  ClinicalWorkflowComponentProps
} from './types'

import { HealthcareContext, PatientData } from '@/types/healthcare'

interface MobileClinicalInterfaceProps extends ClinicalWorkflowComponentProps {
  session: MobileClinicalSession
  patientData?: PatientData
  offlineCapable: boolean
  onSyncComplete?: (success: boolean) => void
  onEmergency?: (alert: any) => void
  onActivityLog?: (activity: Omit<ClinicalActivity, 'id' | 'timestamp'>) => void
  onSessionUpdate?: (session: Partial<MobileClinicalSession>) => void
}

const QUICK_ACTIONS = [
  { id: 'vitals', label: 'Sinais Vitais', icon: '❤️', color: 'red' },
  { id: 'medication', label: 'Medicação', icon: '💊', color: 'blue' },
  { id: 'notes', label: 'Anotações', icon: '📝', color: 'green' },
  { id: 'photos', label: 'Fotos', icon: '📸', color: 'purple' },
  { id: 'emergency', label: 'Emergência', icon: '🚨', color: 'red' },
  { id: 'consultation', label: 'Consulta', icon: '👥', color: 'orange' }
]

const VITAL_SIGNS = [
  { id: 'blood_pressure', label: 'Pressão Arterial', unit: 'mmHg', icon: '🩸' },
  { id: 'heart_rate', label: 'Frequência Cardíaca', unit: 'bpm', icon: '❤️' },
  { id: 'temperature', label: 'Temperatura', unit: '°C', icon: '🌡️' },
  { id: 'oxygen_saturation', label: 'Saturação O₂', unit: '%', icon: '💨' },
  { id: 'respiratory_rate', label: 'Frequência Respiratória', unit: 'irpm', icon: '🫁' },
  { id: 'pain_level', label: 'Nível de Dor', unit: '0-10', icon: '😣' }
]

export const MobileClinicalInterface: React.FC<MobileClinicalInterfaceProps> = ({
  patientId,
  staffId,
  healthcareContext,
  className,
  session,
  patientData,
  offlineCapable,
  onSyncComplete,
  onEmergency,
  onActivityLog,
  onSessionUpdate
}) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [vitalsData, setVitalsData] = useState<Record<string, string>>({})
  const [quickNote, setQuickNote] = useState('')
  const [showEmergency, setShowEmergency] = useState(false)

  // Monitor device and connectivity
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(session.deviceInfo)
  const [isOnline, setIsOnline] = useState(session.deviceInfo.isOnline)

  // Mock recent activities
  const [recentActivities, setRecentActivities] = useState<ClinicalActivity[]>([])

  useEffect(() => {
    // Update device info
    const updateDeviceInfo = () => {
      setDeviceInfo(prev => ({
        ...prev,
        isOnline: navigator.onLine
      }))
      setIsOnline(navigator.onLine)
    }

    // Monitor online/offline status
    window.addEventListener('online', updateDeviceInfo)
    window.addEventListener('offline', updateDeviceInfo)

    // Monitor screen orientation for tablets
    const handleOrientationChange = () => {
      setDeviceInfo(prev => ({
        ...prev,
        screenResolution: `${window.screen.width}x${window.screen.height}`
      }))
    }

    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)

    // Auto-sync when coming back online
    const handleOnline = async () => {
      if (session.syncStatus === 'pending' && !isSyncing) {
        await handleSync()
      }
    }

    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('online', updateDeviceInfo)
      window.removeEventListener('offline', updateDeviceInfo)
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('online', handleOnline)
    }
  }, [session.syncStatus, isSyncing])

  const handleActivityLog = useCallback((activity: Omit<ClinicalActivity, 'id' | 'timestamp'>) => {
    const newActivity: ClinicalActivity = {
      ...activity,
      id: `activity-${Date.now()}`,
      timestamp: new Date().toISOString()
    }

    setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]) // Keep last 10 activities

    if (onActivityLog) {
      onActivityLog(activity)
    }

    // Announce for screen readers
    ScreenReaderAnnouncer.announce(`Atividade registrada: ${activity.type}`)
  }, [onActivityLog])

  const handleSync = useCallback(async () => {
    if (isSyncing) return

    try {
      setIsSyncing(true)

      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000))

      const success = Math.random() > 0.1 // 90% success rate

      if (onSessionUpdate) {
        await onSessionUpdate({
          syncStatus: success ? 'synced' : 'failed'
        })
      }

      if (onSyncComplete) {
        await onSyncComplete(success)
      }

      handleActivityLog({
        type: 'sync',
        data: { success, timestamp: new Date().toISOString() },
        synced: true
      })

      // Announce for screen readers
      ScreenReaderAnnouncer.announce(success ? 'Sincronização concluída com sucesso' : 'Falha na sincronização')
    } catch (error) {
      console.error('Error syncing:', error)
      
      if (onSessionUpdate) {
        await onSessionUpdate({
          syncStatus: 'failed'
        })
      }
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing, onSyncComplete, onSessionUpdate, handleActivityLog])

  const handleVitalSignsSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true)

      const vitalsRecord = {
        timestamp: new Date().toISOString(),
        staffId,
        patientId,
        vitals: vitalsData
      }

      handleActivityLog({
        type: 'vitals',
        data: vitalsRecord,
        synced: false
      })

      // Reset form
      setVitalsData({})
      setSelectedAction(null)

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Sinais vitais registrados com sucesso')
    } catch (error) {
      console.error('Error recording vital signs:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [vitalsData, staffId, patientId, handleActivityLog])

  const handleQuickNoteSubmit = useCallback(async () => {
    if (!quickNote.trim()) return

    try {
      setIsSubmitting(true)

      const noteRecord = {
        timestamp: new Date().toISOString(),
        staffId,
        patientId,
        content: quickNote,
        type: 'quick_note'
      }

      handleActivityLog({
        type: 'notes',
        data: noteRecord,
        synced: false
      })

      // Reset form
      setQuickNote('')
      setSelectedAction(null)

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Anotação rápida salva com sucesso')
    } catch (error) {
      console.error('Error saving quick note:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [quickNote, staffId, patientId, handleActivityLog])

  const handleEmergency = useCallback(() => {
    if (onEmergency) {
      onEmergency({
        id: `emergency-${Date.now()}`,
        type: 'medical_emergency',
        severity: 'high',
        patientId,
        location: 'Atendimento Móvel',
        description: 'Emergência durante atendimento clínico móvel',
        reportedBy: staffId,
        reportedAt: new Date().toISOString(),
        status: 'active',
        responseTeam: []
      })
    }

    handleActivityLog({
      type: 'emergency',
      data: { 
        action: 'emergency_called', 
        timestamp: new Date().toISOString() 
      },
      synced: true
    })

    setShowEmergency(false)
    setSelectedAction(null)
  }, [onEmergency, staffId, patientId, handleActivityLog])

  const handleCameraCapture = useCallback(() => {
    // Check if camera is available
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // Camera accessed successfully
          stream.getTracks().forEach(track => track.stop())
          
          handleActivityLog({
            type: 'photos',
            data: { 
              action: 'camera_accessed', 
              timestamp: new Date().toISOString() 
            },
            synced: false
          })

          // In a real implementation, this would open the camera interface
          alert('Função de câmera seria ativada aqui')
        })
        .catch(err => {
          console.error('Error accessing camera:', err)
          alert('Não foi possível acessar a câmera')
        })
    } else {
      alert('Câmera não disponível neste dispositivo')
    }
  }, [handleActivityLog])

  const getBatteryLevel = () => {
    if ('getBattery' in navigator) {
      return (navigator as any).getBattery().then((battery: any) => {
        return Math.round(battery.level * 100)
      })
    }
    return Promise.resolve(null)
  }

  const formatUptime = (startTime: string) => {
    const start = new Date(startTime)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${diffHours}h ${diffMinutes}m`
  }

  const renderActionContent = () => {
    switch (selectedAction) {
      case 'vitals':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>❤️</span>
                Registrar Sinais Vitais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {VITAL_SIGNS.map(vital => (
                <HealthcareFormGroup 
                  key={vital.id} 
                  label={`${vital.icon} ${vital.label} (${vital.unit})`} 
                  context={healthcareContext}
                >
                  <AccessibilityInput
                    type="text"
                    value={vitalsData[vital.id] || ''}
                    onChange={(e) => setVitalsData(prev => ({ ...prev, [vital.id]: e.target.value }))}
                    placeholder={`Digite ${vital.label.toLowerCase()}`}
                    inputMode={vital.id === 'pain_level' ? 'numeric' : 'decimal'}
                  />
                </HealthcareFormGroup>
              ))}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedAction(null)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleVitalSignsSubmit}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  Salvar Sinais Vitais
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 'notes':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📝</span>
                Anotação Rápida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <HealthcareFormGroup label="Anotação" context={healthcareContext}>
                <textarea
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  placeholder="Digite suas observações sobre o paciente..."
                />
              </HealthcareFormGroup>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedAction(null)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleQuickNoteSubmit}
                  disabled={isSubmitting || !quickNote.trim()}
                  loading={isSubmitting}
                >
                  Salvar Anotação
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 'photos':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📸</span>
                Capturar Foto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Use a câmera do dispositivo para documentar o progresso do tratamento,
                condições da pele ou procedimentos realizados.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleCameraCapture}
                  disabled={isSubmitting}
                >
                  📷 Abrir Câmera
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Simulate gallery access
                    handleActivityLog({
                      type: 'photos',
                      data: { 
                        action: 'gallery_accessed', 
                        timestamp: new Date().toISOString() 
                      },
                      synced: false
                    })
                    alert('Galeria seria aberta aqui')
                  }}
                  disabled={isSubmitting}
                >
                      🖼️ Galerias
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setSelectedAction(null)}
                className="w-full"
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        )

      case 'emergency':
        return (
          <Card className="border-red-500 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <span>🚨</span>
                EMERGÊNCIA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  Você está prestes a acionar um alerta de emergência. 
                  Esta ação notificará toda a equipe médica e, se necessário, 
                  os serviços de emergência externos.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 gap-2">
                <MobileHealthcareButton
                  variant="emergency"
                  size="lg"
                  onClick={handleEmergency}
                  className="w-full"
                >
                  🚑 ACIONAR EMERGÊNCIA
                </MobileHealthcareButton>
                
                <Button
                  variant="outline"
                  onClick={() => setSelectedAction(null)}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">
                Selecione uma ação para começar
              </p>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <AccessibilityProvider>
      <div className={`max-w-6xl mx-auto p-4 ${className}`}>
        {/* Status Bar */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant={isOnline ? "secondary" : "destructive"}>
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
                <Badge variant={session.syncStatus === 'synced' ? 'secondary' : 'outline'}>
                  {session.syncStatus === 'synced' ? 'Sincronizado' : 'Pendente sincronizar'}
                </Badge>
                <span className="text-sm text-gray-600">
                  {deviceInfo.deviceType} • {deviceInfo.screenResolution}
                </span>
                <span className="text-sm text-gray-600">
                  Tempo de uso: {formatUptime(session.startTime)}
                </span>
              </div>
              
              {!isOnline && offlineCapable && (
                <Button
                  variant="outline"
                  onClick={handleSync}
                  disabled={isSyncing}
                  loading={isSyncing}
                  size="sm"
                >
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Patient Info */}
        {patientData && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">{patientData.personalInfo.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {patientData.personalInfo.dateOfBirth} • {patientData.personalInfo.gender}
                  </p>
                </div>
                <div>
                  <p className="text-sm">{patientData.personalInfo.phone}</p>
                  <p className="text-sm text-gray-600">{patientData.personalInfo.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {QUICK_ACTIONS.map(action => (
                <MobileHealthcareButton
                  key={action.id}
                  variant={action.id === 'emergency' ? 'emergency' : 'default'}
                  size="lg"
                  onClick={() => setSelectedAction(action.id)}
                  className={`h-24 flex flex-col items-center justify-center text-center ${
                    selectedAction === action.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  <span className="text-2xl mb-1">{action.icon}</span>
                  <span className="text-sm font-medium">{action.label}</span>
                </MobileHealthcareButton>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Content */}
        {selectedAction && (
          <div className="mb-4">
            {renderActionContent()}
          </div>
        )}

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                    <span className="text-sm text-gray-700">
                      {new Date(activity.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <Badge variant={activity.synced ? 'secondary' : 'outline'} className="text-xs">
                    {activity.synced ? 'Sincronizado' : 'Pendente'}
                  </Badge>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-center text-gray-600 py-4">
                  Nenhuma atividade registrada nesta sessão
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Button (Always visible) */}
        <div className="fixed bottom-4 right-4 z-50">
          <MobileHealthcareButton
            variant="emergency"
            size="lg"
            onClick={() => setSelectedAction('emergency')}
            className="w-16 h-16 rounded-full shadow-lg"
            aria-label="Emergência"
          >
            🚨
          </MobileHealthcareButton>
        </div>
      </div>
    </AccessibilityProvider>
  )
}

export default MobileClinicalInterface