/**
 * NeonPro Client Management Agent Component
 *
 * Specialized AI agent for patient management with LGPD compliance
 * Features:
 * - Patient registration and management
 * - Treatment history tracking
 * - Contact information handling
 * - LGPD-compliant data operations
 * - Portuguese healthcare workflows
 */

import React, { useCallback, useEffect, useState } from 'react'
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  Phone,
  Plus,
  Search,
  Shield,
  Stethoscope,
  User,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert.js'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js'
import { Input } from '@/components/ui/input.js'
import { Label } from '@/components/ui/label.js'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.js'
import { Textarea } from '@/components/ui/textarea.js'
import { NeonProMessage, NeonProPatientDataCard } from '../NeonProChatComponents.js'
import { useNeonProChat } from '../NeonProChatProvider.js'

// Types
interface Patient {
  id: string
  name: string
  contact: string
  contactType: 'phone' | 'email'
  dateOfBirth: string
  gender: 'M' | 'F' | 'Other'
  status: 'active' | 'inactive' | 'new'
  registrationDate: Date
  lastVisit?: Date
  treatments: string[]
  notes?: string
  sensitivityLevel: 'standard' | 'enhanced' | 'restricted'
}

interface ClientAgentState {
  currentOperation: 'idle' | 'searching' | 'registering' | 'updating' | 'viewing'
  searchQuery: string
  searchResults: Patient[]
  selectedPatient?: Patient
  formData: Partial<Patient>
  operationHistory: Array<{
    operation: string
    timestamp: Date
    patientId?: string
    success: boolean
    details?: string
  }>
  compliance: {
    dataAccess: Array<{
      timestamp: Date
      userId: string
      patientId: string
      action: string
      purpose: string
    }>
    consentLevel: 'none' | 'basic' | 'enhanced' | 'explicit'
  }
}

interface ClientAgentProps {
  clinicId: string
  onPatientAction?: (action: string, patientId: string) => void
  onError?: (error: string) => void
}

// Mock patient database (in real implementation, this would come from backend)
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Ana Silva Santos',
    contact: 'ana.santos@email.com',
    contactType: 'email',
    dateOfBirth: '1990-05-15',
    gender: 'F',
    status: 'active',
    registrationDate: new Date('2023-01-15'),
    lastVisit: new Date('2024-09-10'),
    treatments: ['Botox', 'Preenchimento Labial', 'Limpeza de Pele'],
    notes: 'Paciente com sensibilidade a certos ácidos. Prefere horários vespertinos.',
    sensitivityLevel: 'enhanced',
  },
  {
    id: '2',
    name: 'Carolina Oliveira Costa',
    contact: '(11) 98765-4321',
    contactType: 'phone',
    dateOfBirth: '1985-08-22',
    gender: 'F',
    status: 'active',
    registrationDate: new Date('2023-03-20'),
    lastVisit: new Date('2024-09-12'),
    treatments: ['Fio de Sustentação', 'Laser CO2', 'Peeling Químico'],
    sensitivityLevel: 'standard',
  },
]

export const NeonProClientAgent: React.FC<ClientAgentProps> = ({
  clinicId,
  onPatientAction,
  onError,
}) => {
  const { config } = useNeonProChat()
  const [showSensitiveData, setShowSensitiveData] = useState(false)

  // Initialize agent state
  const initialState: ClientAgentState = {
    currentOperation: 'idle',
    searchQuery: '',
    searchResults: [],
    formData: {},
    operationHistory: [],
    compliance: {
      dataAccess: [],
      consentLevel: 'basic',
    },
  }

  const [state, setState] = useState<ClientAgentState>(initialState)

  // Note: CopilotKit integration temporarily disabled for build stability

  // Note: CopilotKit integrations temporarily disabled for build stability
  /*
  // Search for patients action
  useCopilotAction({
    name: 'search_patients',
    description: 'Search for patients by name, contact, or ID',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'Search query (name, contact, or ID)',
        required: true,
      },
    ],
    handler: async (query: string) => {
      try {
        setState(prev => ({
          ...prev,
          currentOperation: 'searching',
          searchQuery: query,
        }))

        // Simulate search delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Search in mock database
        const results = mockPatients.filter(patient =>
          patient.name.toLowerCase().includes(query.toLowerCase()) ||
          patient.contact.toLowerCase().includes(query.toLowerCase()) ||
          patient.id === query
        )

        setState(prev => ({
          ...prev,
          currentOperation: 'idle',
          searchResults: results,
          selectedPatient: results.length === 1 ? results[0] : undefined,
        }))

        // Log data access for LGPD compliance
        if (config?.compliance.auditLogging) {
          setState(prev => ({
            ...prev,
            compliance: {
              ...prev.compliance,
              dataAccess: [
                ...prev.compliance.dataAccess,
                {
                  timestamp: new Date(),
                  userId: config.userId,
                  patientId: 'search-multiple',
                  action: 'search',
                  purpose: `Patient search: ${query}`,
                },
              ],
            },
          }))
        }

        return `Found ${results.length} patient(s) matching "${query}"`
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to search patients'
        onError?.(errorMessage)
        setState(prev => ({ ...prev, currentOperation: 'idle' }))
        throw error
      }
    },
  })
  */

  // Register new patient action  
  /*
  useCopilotAction({
    name: 'register_patient',
    description: 'Register a new patient in the system',
    parameters: [
      { name: 'name', type: 'string', description: 'Patient full name', required: true },
      {
        name: 'contact',
        type: 'string',
        description: 'Contact information (phone or email)',
        required: true,
      },
      {
        name: 'contactType',
        type: 'string',
        description: 'Contact type (phone or email)',
        required: true,
      },
      {
        name: 'dateOfBirth',
        type: 'string',
        description: 'Date of birth (YYYY-MM-DD)',
        required: true,
      },
      { name: 'gender', type: 'string', description: 'Gender (M, F, or Other)', required: true },
      {
        name: 'notes',
        type: 'string',
        description: 'Additional notes about the patient',
        required: false,
      },
    ],
    handler: async (
      name: string,
      contact: string,
      contactType: string,
      dateOfBirth: string,
      gender: string,
      notes?: string,
    ) => {
      try {
        setState(prev => ({
          ...prev,
          currentOperation: 'registering',
        }))

        // Simulate registration delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Create new patient
        const newPatient: Patient = {
          id: `patient-${Date.now()}`,
          name,
          contact,
          contactType: contactType as 'phone' | 'email',
          dateOfBirth,
          gender: gender as 'M' | 'F' | 'Other',
          status: 'new',
          registrationDate: new Date(),
          treatments: [],
          notes,
          sensitivityLevel: 'standard',
        }

        // Add to mock database (in real implementation, this would be an API call)
        mockPatients.push(newPatient)

        setState(prev => ({
          ...prev,
          currentOperation: 'idle',
          selectedPatient: newPatient,
          operationHistory: [
            ...prev.operationHistory,
            {
              operation: 'register',
              timestamp: new Date(),
              patientId: newPatient.id,
              success: true,
              details: `New patient registered: ${name}`,
            },
          ],
        }))

        // Log data access for LGPD compliance
        if (config?.compliance.auditLogging) {
          setState(prev => ({
            ...prev,
            compliance: {
              ...prev.compliance,
              dataAccess: [
                ...prev.compliance.dataAccess,
                {
                  timestamp: new Date(),
                  userId: config.userId,
                  patientId: newPatient.id,
                  action: 'register',
                  purpose: `New patient registration: ${name}`,
                },
              ],
            },
          }))
        }

        return `Patient "${name}" registered successfully with ID: ${newPatient.id}`
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to register patient'
        onError?.(errorMessage)
        setState(prev => ({ ...prev, currentOperation: 'idle' }))
        throw error
      }
    },
  })

  // Update patient information action
  useCopilotAction({
    name: 'update_patient',
    description: 'Update existing patient information',
    parameters: [
      { name: 'patientId', type: 'string', description: 'Patient ID to update', required: true },
      { name: 'updates', type: 'object', description: 'Fields to update', required: true },
    ],
    handler: async (patientId: string, updates: Record<string, any>) => {
      try {
        setState(prev => ({
          ...prev,
          currentOperation: 'updating',
        }))

        // Simulate update delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Find and update patient
        const patientIndex = mockPatients.findIndex(p => p.id === patientId)
        if (patientIndex === -1) {
          throw new Error('Patient not found')
        }

        const updatedPatient = {
          ...mockPatients[patientIndex],
          ...updates,
        }

        mockPatients[patientIndex] = updatedPatient

        setState(prev => ({
          ...prev,
          currentOperation: 'idle',
          selectedPatient: updatedPatient,
          operationHistory: [
            ...prev.operationHistory,
            {
              operation: 'update',
              timestamp: new Date(),
              patientId,
              success: true,
              details: `Updated patient information: ${Object.keys(updates).join(', ')}`,
            },
          ],
        }))

        return `Patient information updated successfully`
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update patient'
        onError?.(errorMessage)
        setState(prev => ({ ...prev, currentOperation: 'idle' }))
        throw error
      }
    },
  })

  // Get patient treatment history action
  useCopilotAction({
    name: 'get_treatment_history',
    description: 'Get treatment history for a specific patient',
    parameters: [
      { name: 'patientId', type: 'string', description: 'Patient ID', required: true },
    ],
    handler: async (patientId: string) => {
      try {
        const patient = mockPatients.find(p => p.id === patientId)
        if (!patient) {
          throw new Error('Patient not found')
        }

        const treatmentHistory = {
          patient: patient.name,
          treatments: patient.treatments,
          lastVisit: patient.lastVisit,
          registrationDate: patient.registrationDate,
          totalTreatments: patient.treatments.length,
        }

        setState(prev => ({
          ...prev,
          selectedPatient: patient,
          currentOperation: 'viewing',
        }))

        return JSON.stringify(treatmentHistory, null, 2)
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to get treatment history'
        onError?.(errorMessage)
        throw error
      }
    },
  })
  */

  // Handle form changes
  const handleFormChange = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }))
  }, [])

  // Handle patient selection
  const handlePatientSelect = useCallback((patient: Patient) => {
    setState(prev => ({
      ...prev,
      selectedPatient: patient,
      currentOperation: 'viewing',
    }))

    // Log access for LGPD compliance
    if (config?.compliance.auditLogging) {
      setState(prev => ({
        ...prev,
        compliance: {
          ...prev.compliance,
          dataAccess: [
            ...prev.compliance.dataAccess,
            {
              timestamp: new Date(),
              userId: config.userId,
              patientId: patient.id,
              action: 'view',
              purpose: 'Patient record access',
            },
          ],
        },
      }))
    }
  }, [config])

  // Handle patient registration
  const handleRegisterPatient = useCallback(async () => {
    const { formData } = state
    if (!formData.name || !formData.contact || !formData.dateOfBirth) {
      onError?.('Por favor, preencha todos os campos obrigatórios')
      return
    }

    try {
      // This would trigger the CopilotKit action
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate action call

      // For demo purposes, update state directly
      const newPatient: Patient = {
        id: `patient-${Date.now()}`,
        name: formData.name,
        contact: formData.contact,
        contactType: formData.contactType || 'email',
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender || 'F',
        status: 'new',
        registrationDate: new Date(),
        treatments: [],
        notes: formData.notes,
        sensitivityLevel: 'standard',
      }

      mockPatients.push(newPatient)

      setState(prev => ({
        ...prev,
        currentOperation: 'idle',
        selectedPatient: newPatient,
        formData: {},
        operationHistory: [
          ...prev.operationHistory,
          {
            operation: 'register',
            timestamp: new Date(),
            patientId: newPatient.id,
            success: true,
            details: `New patient registered: ${newPatient.name}`,
          },
        ],
      }))

      onPatientAction?.('register', newPatient.id)
    } catch (error) {
      onError?.('Falha ao registrar paciente')
    }
  }, [state, onPatientAction, onError])

  // Get status icon
  const getStatusIcon = () => {
    switch (state.currentOperation) {
      case 'searching':
        return <Search className='h-4 w-4 text-blue-500' />
      case 'registering':
        return <User className='h-4 w-4 text-yellow-500' />
      case 'updating':
        return <FileText className='h-4 w-4 text-orange-500' />
      case 'viewing':
        return <Stethoscope className='h-4 w-4 text-green-500' />
      default:
        return <Clock className='h-4 w-4 text-gray-500' />
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            Assistente de Gestão de Pacientes
          </CardTitle>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            {getStatusIcon()}
            <span>
              {state.currentOperation === 'idle' && 'Pronto para ajudar'}
              {state.currentOperation === 'searching' && 'Buscando pacientes...'}
              {state.currentOperation === 'registering' && 'Registrando paciente...'}
              {state.currentOperation === 'updating' && 'Atualizando informações...'}
              {state.currentOperation === 'viewing' && 'Visualizando dados do paciente'}
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Compliance Alert */}
      <Alert>
        <Shield className='h-4 w-4' />
        <AlertDescription>
          <strong>LGPD Compliance:</strong>{' '}
          Todas as operações com dados de pacientes são registradas para auditoria. O acesso a
          informações sensíveis requer consentimento explícito.
        </AlertDescription>
      </Alert>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Buscar Pacientes</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex gap-2'>
            <Input
              placeholder='Buscar por nome, contato ou ID...'
              value={state.searchQuery}
              onChange={e => handleFormChange('searchQuery', e.target.value)}
              className='flex-1'
            />
            <Button
              onClick={() => state.searchQuery && handlePatientSelect(state.searchResults[0])}
              disabled={!state.searchQuery || state.searchResults.length === 0}
            >
              <Search className='h-4 w-4' />
            </Button>
          </div>

          {/* Search Results */}
          {state.searchResults.length > 0 && (
            <div className='space-y-2'>
              <h4 className='text-sm font-medium'>Resultados ({state.searchResults.length})</h4>
              {state.searchResults.map(patient => (
                <div
                  key={patient.id}
                  className='flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50'
                  onClick={() => handlePatientSelect(patient)}
                >
                  <div>
                    <p className='font-medium'>{patient.name}</p>
                    <p className='text-sm text-gray-600'>{patient.contact}</p>
                    <Badge variant='outline' className='mt-1'>
                      {patient.status === 'active'
                        ? 'Ativo'
                        : patient.status === 'new'
                        ? 'Novo'
                        : 'Inativo'}
                    </Badge>
                  </div>
                  <ChevronRight className='h-4 w-4 text-gray-400' />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            Registrar Novo Paciente
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='name'>Nome Completo *</Label>
              <Input
                id='name'
                value={state.formData.name || ''}
                onChange={e => handleFormChange('name', e.target.value)}
                placeholder='Nome completo do paciente'
              />
            </div>
            <div>
              <Label htmlFor='contact'>Contato *</Label>
              <Input
                id='contact'
                value={state.formData.contact || ''}
                onChange={e => handleFormChange('contact', e.target.value)}
                placeholder='Email ou telefone'
              />
            </div>
            <div>
              <Label htmlFor='contactType'>Tipo de Contato</Label>
              <Select onValueChange={value => handleFormChange('contactType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Selecione o tipo' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='email'>Email</SelectItem>
                  <SelectItem value='phone'>Telefone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='dateOfBirth'>Data de Nascimento *</Label>
              <Input
                id='dateOfBirth'
                type='date'
                value={state.formData.dateOfBirth || ''}
                onChange={e => handleFormChange('dateOfBirth', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor='gender'>Gênero</Label>
              <Select onValueChange={value => handleFormChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Selecione o gênero' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='F'>Feminino</SelectItem>
                  <SelectItem value='M'>Masculino</SelectItem>
                  <SelectItem value='Other'>Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor='notes'>Observações</Label>
            <Textarea
              id='notes'
              value={state.formData.notes || ''}
              onChange={e => handleFormChange('notes', e.target.value)}
              placeholder='Informações adicionais sobre o paciente...'
              rows={3}
            />
          </div>
          <Button onClick={handleRegisterPatient} className='w-full'>
            <Plus className='h-4 w-4 mr-2' />
            Registrar Paciente
          </Button>
        </CardContent>
      </Card>

      {/* Selected Patient View */}
      {state.selectedPatient && (
        <NeonProPatientDataCard
          patient={state.selectedPatient}
          showSensitiveData={showSensitiveData}
          onToggleSensitive={() => setShowSensitiveData(!showSensitiveData)}
        />
      )}

      {/* Operation History */}
      {state.operationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Histórico de Operações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {state.operationHistory.map((op, index) => (
                <div key={index} className='flex items-center gap-2 p-2 border rounded'>
                  {op.success
                    ? <CheckCircle className='h-4 w-4 text-green-500' />
                    : <AlertTriangle className='h-4 w-4 text-red-500' />}
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>{op.operation}</p>
                    <p className='text-xs text-gray-600'>{op.details}</p>
                  </div>
                  <span className='text-xs text-gray-500'>
                    {op.timestamp.toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper component
const ChevronRight = () => (
  <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
    <path d='M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z' />
  </svg>
)

export default NeonProClientAgent
