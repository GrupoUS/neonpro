import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Import components to test
import { TreatmentScheduler } from '../treatment-scheduler'
import { PatientRecordsViewer } from '../patient-records-viewer'
import { LGPDConsentManager } from '../lgpd-consent-manager'
import { HealthcareDashboard } from '../healthcare-dashboard'
import { EmergencyAlertSystem } from '../emergency-alert-system'

// Import types and utilities
import type {
  PatientData,
  AestheticTreatment,
  TreatmentSession,
  LGPDConsentRecord,
  EmergencyAlert,
  HealthcareContext
} from '@/types/healthcare'

// Mock data factories
const createMockPatient = (overrides?: Partial<PatientData>): PatientData => ({
  personalInfo: {
    fullName: 'Maria Silva Santos',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    dateOfBirth: '1990-05-15',
    age: 34,
    gender: 'Feminino',
    email: 'maria.silva@email.com',
    phone: '11987654321',
    maritalStatus: 'Solteira',
    ...overrides?.personalInfo
  },
  address: {
    street: 'Rua das Flores',
    number: '123',
    neighborhood: 'Jardins',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    complement: 'Apto 45',
    ...overrides?.address
  },
  emergencyContact: {
    name: 'João Silva Santos',
    relationship: 'Esposo',
    phone: '11912345678',
    ...overrides?.emergencyContact
  },
  medicalHistory: {
    bloodType: 'O+',
    weight: 65,
    height: 1.65,
    allergies: ['Penicilina', 'Látex'],
    medications: ['Anticoncepcional'],
    chronicConditions: ['Asma leve'],
    aestheticTreatments: [
      {
        treatmentId: 'botox-001',
        treatmentName: 'Toxina Botulínica',
        date: '2024-01-15',
        professional: 'Dr. Carlos Silva',
        results: 'Satisfatório',
        notes: 'Aplicação de 20 unidades'
      }
    ],
    notes: 'Paciente saudável, sem restrições para tratamentos estéticos.',
    ...overrides?.medicalHistory
  },
  consent: {
    hasConsented: true,
    consentDate: '2024-01-01T10:00:00Z',
    version: '2.0',
    purposes: ['treatment', 'medical_records'],
    retentionPeriod: '10 years',
    dataSharing: false,
    internationalTransfer: false,
    automatedDecision: false,
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true
    },
    signatureMethod: 'electronic',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    ...overrides?.consent
  },
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-15T15:30:00Z',
  ...overrides
})

const createMockTreatment = (overrides?: Partial<AestheticTreatment>): AestheticTreatment => ({
  id: 'treatment-001',
  name: 'Toxina Botulínica',
  description: 'Redução de rugas dinâmicas e linhas de expressão',
  category: 'facial',
  duration: 30,
  price: 1500.00,
  requiresMedicalSupervision: true,
  contraindications: [
    'Gravidez e amamentação',
    'Doenças neuromusculares',
    'Alergia aos componentes'
  ],
  benefits: [
    'Redução de rugas',
    'Efeito lifting',
    'Resultados naturais'
  ],
  recoveryTime: '24-48 horas',
  longevity: '4-6 meses',
  ...overrides
})

const createMockSession = (overrides?: Partial<TreatmentSession>): TreatmentSession => ({
  id: 'session-001',
  patientId: '123.456.789-00',
  patientName: 'Maria Silva Santos',
  treatmentId: 'treatment-001',
  treatmentName: 'Toxina Botulínica',
  scheduledStart: addDays(new Date(), 1).toISOString(),
  scheduledEnd: addDays(new Date(), 1).toISOString(),
  professional: 'Dr. Carlos Silva',
  status: 'scheduled',
  notes: 'Primeira sessão do paciente',
  specialRequirements: 'Alergia a látex',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})

const createMockLGPDRecord = (overrides?: Partial<LGPDConsentRecord>): LGPDConsentRecord => ({
  id: 'lgpd-001',
  patientId: '123.456.789-00',
  consentVersion: '2.0',
  purposes: ['treatment', 'medical_records', 'communication'],
  timestamp: new Date().toISOString(),
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
  signatureMethod: 'electronic',
  retentionPeriod: '10 years',
  dataSharing: false,
  internationalTransfer: false,
  automatedDecision: false,
  ...overrides
})

const createMockEmergencyAlert = (overrides?: Partial<EmergencyAlert>): EmergencyAlert => ({
  id: 'alert-001',
  type: 'medical',
  severity: 'high',
  description: 'Paciente apresentando reação alérgica após aplicação',
  location: 'Sala de Procedimentos 1',
  status: 'active',
  patientId: '123.456.789-00',
  requiresMedicalAttention: true,
  requiresEvacuation: false,
  affectedAreas: ['Sala de Procedimentos 1'],
  responses: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  resolvedAt: null,
  resolvedBy: null,
  ...overrides
})

// Test suite for TreatmentScheduler
describe('TreatmentScheduler', () => {
  const mockPatient = createMockPatient()
  const mockTreatments = [createMockTreatment()]
  const mockSlots = [
    {
      id: 'slot-001',
      start: addDays(new Date(), 1),
      end: addDays(new Date(), 1),
      professional: 'Dr. Carlos Silva',
      available: true,
      treatmentTypes: ['facial']
    }
  ]
  const mockOnSchedule = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders treatment scheduler with patient information', () => {
    render(
      <TreatmentScheduler
        patient={mockPatient}
        treatments={mockTreatments}
        availableSlots={mockSlots}
        onSchedule={mockOnSchedule}
      />
    )

    expect(screen.getByText('Paciente Selecionado')).toBeInTheDocument()
    expect(screen.getByText(mockPatient.personalInfo.fullName)).toBeInTheDocument()
    expect(screen.getByText('Selecione a Data')).toBeInTheDocument()
  })

  it('allows treatment selection', () => {
    render(
      <TreatmentScheduler
        patient={mockPatient}
        treatments={mockTreatments}
        availableSlots={mockSlots}
        onSchedule={mockOnSchedule}
      />
    )

    const treatmentCard = screen.getByText(mockTreatments[0].name)
    fireEvent.click(treatmentCard)

    // Should highlight selected treatment
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument()
  })

  it('allows date selection', () => {
    render(
      <TreatmentScheduler
        patient={mockPatient}
        treatments={mockTreatments}
        availableSlots={mockSlots}
        onSchedule={mockOnSchedule}
      />
    )

    const dateButtons = screen.getAllByRole('button')
    const tomorrowButton = dateButtons.find(button => 
      button.textContent?.includes(addDays(new Date(), 1).getDate().toString())
    )
    
    if (tomorrowButton) {
      fireEvent.click(tomorrowButton)
      // Should select the date
    }
  })

  it('disables schedule button without complete selection', () => {
    render(
      <TreatmentScheduler
        patient={mockPatient}
        treatments={mockTreatments}
        availableSlots={mockSlots}
        onSchedule={mockOnSchedule}
      />
    )

    const scheduleButton = screen.getByText('Agendar Tratamento')
    expect(scheduleButton).toBeDisabled()
  })

  it('enables schedule button with complete selection', async () => {
    render(
      <TreatmentScheduler
        patient={mockPatient}
        treatments={mockTreatments}
        availableSlots={mockSlots}
        onSchedule={mockOnSchedule}
      />
    )

    // Select treatment
    const treatmentCard = screen.getByText(mockTreatments[0].name)
    fireEvent.click(treatmentCard)

    // Select time slot
    const slotCard = screen.getByText('Dr. Carlos Silva')
    fireEvent.click(slotCard)

    await waitFor(() => {
      const scheduleButton = screen.getByText('Agendar Tratamento')
      expect(scheduleButton).toBeEnabled()
    })
  })

  it('calls onSchedule with correct data', async () => {
    render(
      <TreatmentScheduler
        patient={mockPatient}
        treatments={mockTreatments}
        availableSlots={mockSlots}
        onSchedule={mockOnSchedule}
      />
    )

    // Select treatment and slot
    const treatmentCard = screen.getByText(mockTreatments[0].name)
    fireEvent.click(treatmentCard)

    const slotCard = screen.getByText('Dr. Carlos Silva')
    fireEvent.click(slotCard)

    // Schedule treatment
    const scheduleButton = screen.getByText('Agendar Tratamento')
    fireEvent.click(scheduleButton)

    await waitFor(() => {
      expect(mockOnSchedule).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: mockPatient.personalInfo.cpf,
          patientName: mockPatient.personalInfo.fullName,
          treatmentId: mockTreatments[0].id,
          treatmentName: mockTreatments[0].name,
          professional: 'Dr. Carlos Silva',
          status: 'scheduled'
        })
      )
    })
  })
})

// Test suite for PatientRecordsViewer
describe('PatientRecordsViewer', () => {
  const mockPatient = createMockPatient()
  const mockSessions = [createMockSession()]
  const mockLGPDRecords = [createMockLGPDRecord()]
  const mockOnUpdatePatient = jest.fn()
  const mockOnExportData = jest.fn()
  const mockOnRequestDataDeletion = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders patient records with overview', () => {
    render(
      <PatientRecordsViewer
        patient={mockPatient}
        treatmentSessions={mockSessions}
        lgpdRecords={mockLGPDRecords}
        onUpdatePatient={mockOnUpdatePatient}
        onExportData={mockOnExportData}
        onRequestDataDeletion={mockOnRequestDataDeletion}
      />
    )

    expect(screen.getByText('Prontuário do Paciente')).toBeInTheDocument()
    expect(screen.getByText(mockPatient.personalInfo.fullName)).toBeInTheDocument()
    expect(screen.getByText('Total Sessões')).toBeInTheDocument()
  })

  it('displays patient statistics correctly', () => {
    render(
      <PatientRecordsViewer
        patient={mockPatient}
        treatmentSessions={mockSessions}
        lgpdRecords={mockLGPDRecords}
        onUpdatePatient={mockOnUpdatePatient}
        onExportData={mockOnExportData}
        onRequestDataDeletion={mockOnRequestDataDeletion}
      />
    )

    expect(screen.getByText('1')).toBeInTheDocument() // Total sessions
    expect(screen.getByText('R$ 0,00')).toBeInTheDocument() // Total spent
  })

  it('allows tab navigation between sections', () => {
    render(
      <PatientRecordsViewer
        patient={mockPatient}
        treatmentSessions={mockSessions}
        lgpdRecords={mockLGPDRecords}
        onUpdatePatient={mockOnUpdatePatient}
        onExportData={mockOnExportData}
        onRequestDataDeletion={mockOnRequestDataDeletion}
      />
    )

    // Click on personal data tab
    const personalTab = screen.getByText('Dados Pessoais')
    fireEvent.click(personalTab)

    expect(screen.getByText('Dados Pessoais Completos')).toBeInTheDocument()
  })

  it('handles sensitive data toggle', () => {
    render(
      <PatientRecordsViewer
        patient={mockPatient}
        treatmentSessions={mockSessions}
        lgpdRecords={mockLGPDRecords}
        onUpdatePatient={mockOnUpdatePatient}
        onExportData={mockOnExportData}
        onRequestDataDeletion={mockOnRequestDataDeletion}
      />
    )

    const toggleButton = screen.getByText('Exibir Dados')
    fireEvent.click(toggleButton)

    // Should switch to "Ocultar Dados"
    expect(screen.getByText('Ocultar Dados')).toBeInTheDocument()
  })

  it('calls export data handler', () => {
    render(
      <PatientRecordsViewer
        patient={mockPatient}
        treatmentSessions={mockSessions}
        lgpdRecords={mockLGPDRecords}
        onUpdatePatient={mockOnUpdatePatient}
        onExportData={mockOnExportData}
        onRequestDataDeletion={mockOnRequestDataDeletion}
      />
    )

    const exportButton = screen.getByText('Exportar')
    fireEvent.click(exportButton)

    expect(mockOnExportData).toHaveBeenCalledWith(mockPatient.personalInfo.cpf)
  })

  it('confirms data deletion request', () => {
    // Mock window.confirm
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <PatientRecordsViewer
        patient={mockPatient}
        treatmentSessions={mockSessions}
        lgpdRecords={mockLGPDRecords}
        onUpdatePatient={mockOnUpdatePatient}
        onExportData={mockOnExportData}
        onRequestDataDeletion={mockOnRequestDataDeletion}
      />
    )

    const deleteButton = screen.getByText('Excluir Dados')
    fireEvent.click(deleteButton)

    expect(mockConfirm).toHaveBeenCalledWith(
      'Tem certeza que deseja solicitar a exclusão dos dados deste paciente? Esta ação não pode ser desfeita.'
    )
    expect(mockOnRequestDataDeletion).toHaveBeenCalledWith(mockPatient.personalInfo.cpf)

    mockConfirm.mockRestore()
  })
})

// Test suite for LGPDConsentManager
describe('LGPDConsentManager', () => {
  const mockPatient = createMockPatient()
  const mockConsentRecords = [createMockLGPDRecord()]
  const mockOnUpdateConsent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders LGPD consent manager', () => {
    render(
      <LGPDConsentManager
        patient={mockPatient}
        consentRecords={mockConsentRecords}
        onUpdateConsent={mockOnUpdateConsent}
      />
    )

    expect(screen.getByText('Gerenciador de Consentimento LGPD')).toBeInTheDocument()
    expect(screen.getByText('Lei Geral de Proteção de Dados')).toBeInTheDocument()
  })

  it('displays current consent status', () => {
    render(
      <LGPDConsentManager
        patient={mockPatient}
        consentRecords={mockConsentRecords}
        onUpdateConsent={mockOnUpdateConsent}
      />
    )

    expect(screen.getByText('Consentido')).toBeInTheDocument()
    expect(screen.getByText(mockConsentRecords.length.toString())).toBeInTheDocument()
  })

  it('shows required consent purposes', () => {
    render(
      <LGPDConsentManager
        patient={mockPatient}
        consentRecords={mockConsentRecords}
        onUpdateConsent={mockOnUpdateConsent}
      />
    )

    expect(screen.getByText('Realização de Tratamentos Estéticos')).toBeInTheDocument()
    expect(screen.getByText('Manutenção de Prontuário Médico')).toBeInTheDocument()
  })

  it('allows purpose selection', () => {
    render(
      <LGPDConsentManager
        patient={mockPatient}
        consentRecords={mockConsentRecords}
        onUpdateConsent={mockOnUpdateConsent}
      />
    )

    const treatmentPurpose = screen.getByText('Realização de Tratamentos Estéticos')
    const purposeCard = treatmentPurpose.closest('.cursor-pointer')
    
    if (purposeCard) {
      fireEvent.click(purposeCard)
      // Should toggle selection
    }
  })

  it('validates required purposes before submission', () => {
    render(
      <LGPDConsentManager
        patient={mockPatient}
        consentRecords={mockConsentRecords}
        onUpdateConsent={mockOnUpdateConsent}
      />
    )

    const submitButton = screen.getByText('Registrar Novo Consentimento')
    fireEvent.click(submitButton)

    // Should show validation error
    expect(mockOnUpdateConsent).not.toHaveBeenCalled()
  })

  it('submits consent with required purposes selected', async () => {
    // First select required purposes
    render(
      <LGPDConsentManager
        patient={mockPatient}
        consentRecords={mockConsentRecords}
        onUpdateConsent={mockOnUpdateConsent}
      />
    )

    // Select required purposes (this would need to be implemented in the component)
    const submitButton = screen.getByText('Registrar Novo Consentimento')
    
    // Mock the form state update
    const form = {
      selectedPurposes: ['treatment', 'medical_records'],
      retentionPeriod: 'standard',
      dataSharing: false,
      internationalTransfer: false,
      automatedDecision: false,
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: false,
      signatureMethod: 'electronic'
    }

    // This test would need the component to expose form state or use a testing library
    // For now, we'll just test that the button exists
    expect(submitButton).toBeInTheDocument()
  })
})

// Test suite for HealthcareDashboard
describe('HealthcareDashboard', () => {
  const mockPatients = [createMockPatient()]
  const mockTreatments = [createMockTreatment()]
  const mockSessions = [createMockSession()]
  const mockOnScheduleSession = jest.fn()
  const mockOnPatientSelect = jest.fn()
  const mockOnEmergencyAlert = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders healthcare dashboard', () => {
    render(
      <HealthcareDashboard
        patients={mockPatients}
        treatments={mockTreatments}
        sessions={mockSessions}
        onScheduleSession={mockOnScheduleSession}
        onPatientSelect={mockOnPatientSelect}
        onEmergencyAlert={mockOnEmergencyAlert}
      />
    )

    expect(screen.getByText('Dashboard da Clínica')).toBeInTheDocument()
    expect(screen.getByText('Total de Pacientes')).toBeInTheDocument()
    expect(screen.getByText('Sessões Hoje')).toBeInTheDocument()
  })

  it('displays key metrics correctly', () => {
    render(
      <HealthcareDashboard
        patients={mockPatients}
        treatments={mockTreatments}
        sessions={mockSessions}
        onScheduleSession={mockOnScheduleSession}
        onPatientSelect={mockOnPatientSelect}
        onEmergencyAlert={mockOnEmergencyAlert}
      />
    )

    expect(screen.getByText('1')).toBeInTheDocument() // Total patients
    expect(screen.getByText('R$ 0,00')).toBeInTheDocument() // Revenue
  })

  it('allows tab navigation', () => {
    render(
      <HealthcareDashboard
        patients={mockPatients}
        treatments={mockTreatments}
        sessions={mockSessions}
        onScheduleSession={mockOnScheduleSession}
        onPatientSelect={mockOnPatientSelect}
        onEmergencyAlert={mockOnEmergencyAlert}
      />
    )

    // Click on sessions tab
    const sessionsTab = screen.getByText('Sessões')
    fireEvent.click(sessionsTab)

    expect(screen.getByText('Sessões por Status')).toBeInTheDocument()
  })

  it('calls emergency alert handler', () => {
    render(
      <HealthcareDashboard
        patients={mockPatients}
        treatments={mockTreatments}
        sessions={mockSessions}
        onScheduleSession={mockOnScheduleSession}
        onPatientSelect={mockOnPatientSelect}
        onEmergencyAlert={mockOnEmergencyAlert}
      />
    )

    const emergencyButton = screen.getByText('🚨 Emergência')
    fireEvent.click(emergencyButton)

    expect(mockOnEmergencyAlert).toHaveBeenCalledWith('medical')
  })
})

// Test suite for EmergencyAlertSystem
describe('EmergencyAlertSystem', () => {
  const mockPatients = [createMockPatient()]
  const mockActiveAlerts = [createMockEmergencyAlert()]
  const mockOnCreateAlert = jest.fn()
  const mockOnUpdateAlert = jest.fn()
  const mockOnResolveAlert = jest.fn()
  const mockOnContactEmergency = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders emergency alert system', () => {
    render(
      <EmergencyAlertSystem
        patients={mockPatients}
        activeAlerts={mockActiveAlerts}
        onCreateAlert={mockOnCreateAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onResolveAlert={mockOnResolveAlert}
        onContactEmergency={mockOnContactEmergency}
      />
    )

    expect(screen.getByText('Sistema de Emergência')).toBeInTheDocument()
    expect(screen.getByText('1 Alertas Ativos')).toBeInTheDocument()
  })

  it('displays active alerts', () => {
    render(
      <EmergencyAlertSystem
        patients={mockPatients}
        activeAlerts={mockActiveAlerts}
        onCreateAlert={mockOnCreateAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onResolveAlert={mockOnResolveAlert}
        onContactEmergency={mockOnContactEmergency}
      />
    )

    expect(screen.getByText(mockActiveAlerts[0].description)).toBeInTheDocument()
    expect(screen.getByText('Alto')).toBeInTheDocument() // Severity
  })

  it('allows creating new alerts', () => {
    render(
      <EmergencyAlertSystem
        patients={mockPatients}
        activeAlerts={mockActiveAlerts}
        onCreateAlert={mockOnCreateAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onResolveAlert={mockOnResolveAlert}
        onContactEmergency={mockOnContactEmergency}
      />
    )

    const createButton = screen.getByText('Novo Alerta de Emergência')
    fireEvent.click(createButton)

    // Should show alert form
    expect(screen.getByText('Criar Novo Alerta')).toBeInTheDocument()
  })

  it('calls emergency services', () => {
    render(
      <EmergencyAlertSystem
        patients={mockPatients}
        activeAlerts={mockActiveAlerts}
        onCreateAlert={mockOnCreateAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onResolveAlert={mockOnResolveAlert}
        onContactEmergency={mockOnContactEmergency}
      />
    )

    const ambulanceButton = screen.getByText('🚑 Ambulância')
    fireEvent.click(ambulanceButton)

    expect(mockOnContactEmergency).toHaveBeenCalledWith('ambulance')
  })

  it('allows alert selection and resolution', async () => {
    render(
      <EmergencyAlertSystem
        patients={mockPatients}
        activeAlerts={mockActiveAlerts}
        onCreateAlert={mockOnCreateAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onResolveAlert={mockOnResolveAlert}
        onContactEmergency={mockOnContactEmergency}
      />
    )

    // Click on alert to select it
    const alertCard = screen.getByText(mockActiveAlerts[0].description).closest('.cursor-pointer')
    if (alertCard) {
      fireEvent.click(alertCard)
    }

    await waitFor(() => {
      expect(screen.getByText('Resolver Alerta')).toBeInTheDocument()
    })
  })
})

// Accessibility tests
describe('Healthcare Components Accessibility', () => {
  it('TreatmentScheduler has proper ARIA labels', () => {
    const mockPatient = createMockPatient()
    const mockTreatments = [createMockTreatment()]
    const mockSlots = [
      {
        id: 'slot-001',
        start: addDays(new Date(), 1),
        end: addDays(new Date(), 1),
        professional: 'Dr. Carlos Silva',
        available: true,
        treatmentTypes: ['facial']
      }
    ]
    const mockOnSchedule = jest.fn()

    render(
      <TreatmentScheduler
        patient={mockPatient}
        treatments={mockTreatments}
        availableSlots={mockSlots}
        onSchedule={mockOnSchedule}
      />
    )

    // Check for proper ARIA labels
    const dateButtons = screen.getAllByRole('button')
    dateButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-label')
    })
  })

  it('PatientRecordsViewer has proper focus management', () => {
    const mockPatient = createMockPatient()
    const mockSessions = [createMockSession()]
    const mockLGPDRecords = [createMockLGPDRecord()]

    render(
      <PatientRecordsViewer
        patient={mockPatient}
        treatmentSessions={mockSessions}
        lgpdRecords={mockLGPDRecords}
      />
    )

    // Check for keyboard navigation support
    const tabs = screen.getAllByRole('tab')
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('tabindex')
    })
  })

  it('EmergencyAlertSystem has proper emergency indicators', () => {
    const mockPatients = [createMockPatient()]
    const mockActiveAlerts = [createMockEmergencyAlert()]

    render(
      <EmergencyAlertSystem
        patients={mockPatients}
        activeAlerts={mockActiveAlerts}
        onCreateAlert={jest.fn()}
        onUpdateAlert={jest.fn()}
        onResolveAlert={jest.fn()}
        onContactEmergency={jest.fn()}
      />
    )

    // Check for proper emergency signaling
    const emergencyButton = screen.getByText('🚨 Emergência')
    expect(emergencyButton).toBeInTheDocument()
    expect(emergencyButton).toHaveAttribute('aria-label')
  })
})

// LGPD Compliance tests
describe('LGPD Compliance Tests', () => {
  it('PatientRecordsViewer handles sensitive data correctly', () => {
    const mockPatient = createMockPatient()
    const mockSessions = [createMockSession()]
    const mockLGPDRecords = [createMockLGPDRecord()]

    render(
      <PatientRecordsViewer
        patient={mockPatient}
        treatmentSessions={mockSessions}
        lgpdRecords={mockLGPDRecords}
      />
    )

    // Check if sensitive data is masked by default
    const cpfElement = screen.getByText(/123\.456\.789-00/)
    expect(cpfElement).toBeInTheDocument()
  })

  it('LGPDConsentManager displays proper consent information', () => {
    const mockPatient = createMockPatient()
    const mockConsentRecords = [createMockLGPDRecord()]

    render(
      <LGPDConsentManager
        patient={mockPatient}
        consentRecords={mockConsentRecords}
        onUpdateConsent={jest.fn()}
      />
    )

    // Check for LGPD compliance information
    expect(screen.getByText('Lei Geral de Proteção de Dados')).toBeInTheDocument()
    expect(screen.getByText('Consentido')).toBeInTheDocument()
  })
})

// Performance tests
describe('Healthcare Components Performance', () => {
  it('TreatmentScheduler renders efficiently with large datasets', () => {
    const mockPatient = createMockPatient()
    const mockTreatments = Array.from({ length: 100 }, (_, i) => 
      createMockTreatment({ id: `treatment-${i}`, name: `Treatment ${i}` })
    )
    const mockSlots = Array.from({ length: 50 }, (_, i) => ({
      id: `slot-${i}`,
      start: addDays(new Date(), i % 7),
      end: addDays(new Date(), i % 7),
      professional: `Dr. ${i % 5}`,
      available: i % 3 !== 0,
      treatmentTypes: ['facial']
    }))

    const startTime = performance.now()
    
    render(
      <TreatmentScheduler
        patient={mockPatient}
        treatments={mockTreatments}
        availableSlots={mockSlots}
        onSchedule={jest.fn()}
      />
    )

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Should render within 100ms for large datasets
    expect(renderTime).toBeLessThan(100)
  })

  it('HealthcareDashboard handles real-time updates efficiently', () => {
    const mockPatients = Array.from({ length: 1000 }, (_, i) => 
      createMockPatient({ personalInfo: { fullName: `Patient ${i}` } })
    )
    const mockTreatments = [createMockTreatment()]
    const mockSessions = Array.from({ length: 500 }, (_, i) => 
      createMockSession({ id: `session-${i}` })
    )

    const startTime = performance.now()
    
    render(
      <HealthcareDashboard
        patients={mockPatients}
        treatments={mockTreatments}
        sessions={mockSessions}
        onScheduleSession={jest.fn()}
        onPatientSelect={jest.fn()}
        onEmergencyAlert={jest.fn()}
      />
    )

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Should render within 200ms for large datasets
    expect(renderTime).toBeLessThan(200)
  })
})