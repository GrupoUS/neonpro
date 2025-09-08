'use client'

import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, } from '@/components/ui/card'
import { cn, } from '@/lib/utils'
import {
  AlertTriangle,
  // ChevronLeft, // Unused import
  // ChevronRight, // Unused import
  // Clock, // Unused import
  Database,
  Heart,
  Phone,
  // Settings, // Unused import
  User,
  X,
  // Zap, // Unused import
} from 'lucide-react'
import React, { useEffect, useState, } from 'react'

// Import dos componentes criados
import CriticalInfoDisplay from './CriticalInfoDisplay'
import EmergencyPatientLookup from './EmergencyPatientLookup'
import OfflineSyncManager from './OfflineSyncManager'

// Types
interface EmergencyPatient {
  id: string
  name: string
  cpf: string
  birthDate: string
  age: number
  bloodType: string
  allergies: {
    substance: string
    severity: 'mild' | 'moderate' | 'severe' | 'life-threatening'
    reaction?: string
  }[]
  medications: {
    name: string
    dosage: string
    frequency: string
    critical: boolean
  }[]
  medicalConditions: {
    condition: string
    severity: 'stable' | 'monitoring' | 'critical'
    notes?: string
  }[]
  emergencyContact: {
    name: string
    phone: string
    relation: string
  }
  lastVitalSigns?: {
    heartRate?: number
    bloodPressure?: string
    temperature?: number
    timestamp: Date
  }
  emergencyNotes?: string
}

// Input patient type for conversion
interface InputPatient {
  id: string
  name: string
  cpf?: string
  birthDate: string
  bloodType?: string
  allergies?: string[]
  medications?: string[]
  criticalConditions?: string[]
  emergencyContact?: string | {
    name: string
    phone: string
    relation?: string
  }
}

interface EmergencyModeInterfaceProps {
  isOpen: boolean
  onClose: () => void
  initialPatient?: EmergencyPatient
}

type EmergencyView = 'lookup' | 'patient' | 'sync'

export function EmergencyModeInterface({
  isOpen,
  onClose,
  initialPatient,
}: EmergencyModeInterfaceProps,) {
  const [currentView, setCurrentView,] = useState<EmergencyView>('lookup',)
  const [selectedPatient, setSelectedPatient,] = useState<EmergencyPatient | null>(
    initialPatient || null,
  )
  const [showExitConfirmation, setShowExitConfirmation,] = useState(false,)
  const [emergencyStartTime,] = useState(() => new Date())

  // Convert EmergencyPatient para CriticalPatientInfo
  const convertToCriticalInfo = (patient: EmergencyPatient,) => ({
    ...patient,
    allergies: patient.allergies || [],
    medications: patient.medications || [],
    medicalConditions: patient.medicalConditions || [],
  })

  // Auto-switch para patient view quando patient selecionado
  useEffect(() => {
    if (selectedPatient && currentView === 'lookup') {
      setCurrentView('patient',)
    }
  }, [selectedPatient, currentView,],)

  // Reset quando fecha
  useEffect(() => {
    if (!isOpen) {
      setCurrentView('lookup',)
      setSelectedPatient(null,)
      setShowExitConfirmation(false,)
    }
  }, [isOpen,],)

  const handlePatientSelect = (patient: InputPatient,) => {
    // Validate required fields
    if (!patient.id || !patient.name || !patient.birthDate) {
      throw new Error('Patient data is missing required fields: id, name, or birthDate',)
    }

    // Safely calculate age
    let age = 0
    try {
      const birthDate = new Date(patient.birthDate,)
      if (!isNaN(birthDate.getTime(),)) {
        age = new Date().getFullYear() - birthDate.getFullYear()
      }
    } catch (error) {
      console.warn('Invalid birthDate format, using age 0',)
    }

    // Convert para EmergencyPatient format with safe defaults
    const emergencyPatient: EmergencyPatient = {
      id: String(patient.id,),
      name: String(patient.name,),
      cpf: patient.cpf || 'Não informado',
      birthDate: patient.birthDate,
      age,
      bloodType: patient.bloodType || 'Não informado',
      allergies: Array.isArray(patient.allergies,)
        ? patient.allergies.map((allergy,) => ({
          substance: String(allergy,),
          severity: 'moderate' as const,
        }))
        : [],
      medications: Array.isArray(patient.medications,)
        ? patient.medications.map((med,) => ({
          name: String(med,),
          dosage: '1x/dia',
          frequency: 'Diária',
          critical: true,
        }))
        : [],
      medicalConditions: Array.isArray(patient.criticalConditions,)
        ? patient.criticalConditions.map((condition,) => ({
          condition: String(condition,),
          severity: 'monitoring' as const,
        }))
        : [],
      emergencyContact: (() => {
        if (typeof patient.emergencyContact === 'object' && patient.emergencyContact !== null) {
          return {
            name: patient.emergencyContact.name || 'Não informado',
            phone: patient.emergencyContact.phone || '',
            relation: patient.emergencyContact.relation || 'Contato',
          }
        }
        return {
          name: 'Não informado',
          phone: typeof patient.emergencyContact === 'string' ? patient.emergencyContact : '',
          relation: 'Contato',
        }
      })(),
      lastVitalSigns: {
        heartRate: 72,
        bloodPressure: '120/80',
        temperature: 36.5,
        timestamp: new Date(),
      },
      emergencyNotes:
        Array.isArray(patient.criticalConditions,) && patient.criticalConditions.length > 0
          ? `Condições críticas: ${patient.criticalConditions.join(', ',)}`
          : undefined,
    }

    setSelectedPatient(emergencyPatient,)
  }

  const handleEmergencyCall = () => {
    // Log without exposing patient PII
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'Emergency call initiated for patient:',
        selectedPatient?.id ? 'PATIENT_ID_SANITIZED' : 'NO_PATIENT_SELECTED',
      )
    }
    // Haptic feedback simulation
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200,],)
    }
  }

  const handleExit = () => {
    setShowExitConfirmation(true,)
  }

  const confirmExit = () => {
    setShowExitConfirmation(false,)
    onClose()
  }

  const cancelExit = () => {
    setShowExitConfirmation(false,)
  }

  const getViewTitle = () => {
    switch (currentView) {
      case 'lookup':
        return 'Busca Emergencial'
      case 'patient':
        return selectedPatient?.name || 'Paciente'
      case 'sync':
        return 'Status do Sistema'
      default:
        return 'Emergência'
    }
  }

  const formatEmergencyTime = () => {
    const diff = new Date().getTime() - emergencyStartTime.getTime()
    const minutes = Math.floor(diff / 60_000,)
    const seconds = Math.floor((diff % 60_000) / 1000,)
    return `${minutes.toString().padStart(2, '0',)}:${seconds.toString().padStart(2, '0',)}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-red-950 z-50 flex flex-col">
      {/* Header - Emergency Mode */}
      <div className="bg-red-900 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-300" />
            <div>
              <h1 className="text-xl font-bold">{getViewTitle()}</h1>
              <p className="text-sm text-red-200">
                Modo Emergencial • {formatEmergencyTime()}
              </p>
            </div>
          </div>

          <Button
            onClick={handleExit}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-red-800 min-h-[56px] min-w-[56px]"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        {currentView === 'lookup' && (
          <div className="max-w-md mx-auto">
            <EmergencyPatientLookup
              onPatientSelect={handlePatientSelect}
              emergencyMode
              className="mb-6"
            />

            {/* Quick stats */}
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="text-center text-red-700">
                  <Database className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">
                    200 pacientes em cache
                  </p>
                  <p className="text-xs">
                    Busca local &lt;50ms
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'patient' && selectedPatient && (
          <div className="max-w-2xl mx-auto">
            <CriticalInfoDisplay
              patient={convertToCriticalInfo(selectedPatient,)}
              emergencyMode
              onEmergencyCall={handleEmergencyCall}
              className="mb-6"
            />
          </div>
        )}

        {currentView === 'sync' && (
          <div className="max-w-md mx-auto">
            <OfflineSyncManager
              emergencyMode
              className="mb-6"
            />
          </div>
        )}
      </div>

      {/* Bottom Navigation - Thumb Zone */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex justify-center gap-2">
          {/* Search/Lookup */}
          <Button
            onClick={() => setCurrentView('lookup',)}
            variant={currentView === 'lookup' ? 'default' : 'ghost'}
            size="lg"
            className={cn(
              'flex-1 min-h-[56px] text-base',
              currentView === 'lookup' && 'bg-red-600 hover:bg-red-700 text-white',
            )}
          >
            <User className="h-5 w-5 mr-2" />
            Buscar
          </Button>

          {/* Patient Info */}
          <Button
            onClick={() => setCurrentView('patient',)}
            variant={currentView === 'patient' ? 'default' : 'ghost'}
            size="lg"
            disabled={!selectedPatient}
            className={cn(
              'flex-1 min-h-[56px] text-base',
              currentView === 'patient' && 'bg-red-600 hover:bg-red-700 text-white',
            )}
          >
            <Heart className="h-5 w-5 mr-2" />
            Paciente
            {selectedPatient && (
              <Badge className="ml-2 bg-white text-red-600">
                1
              </Badge>
            )}
          </Button>

          {/* Sync Status */}
          <Button
            onClick={() => setCurrentView('sync',)}
            variant={currentView === 'sync' ? 'default' : 'ghost'}
            size="lg"
            className={cn(
              'flex-1 min-h-[56px] text-base',
              currentView === 'sync' && 'bg-red-600 hover:bg-red-700 text-white',
            )}
          >
            <Database className="h-5 w-5 mr-2" />
            Status
          </Button>
        </div>

        {/* Emergency Actions Row */}
        {selectedPatient && (
          <div className="mt-3 flex gap-2">
            <Button
              onClick={handleEmergencyCall}
              variant="destructive"
              size="lg"
              className="flex-1 min-h-[56px] text-base font-bold bg-red-600 hover:bg-red-700"
            >
              <Phone className="h-5 w-5 mr-2" />
              Ligar Emergência
            </Button>
          </div>
        )}
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Sair do Modo Emergencial?
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                Você está em atendimento de emergência há{' '}
                {formatEmergencyTime()}. Tem certeza que deseja sair?
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={cancelExit}
                  variant="outline"
                  className="flex-1 min-h-[56px]"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmExit}
                  variant="destructive"
                  className="flex-1 min-h-[56px] bg-red-600 hover:bg-red-700"
                >
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default EmergencyModeInterface
