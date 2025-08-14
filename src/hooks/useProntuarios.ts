'use client'

import { useState, useCallback } from 'react'

// FHIR R4 Patient Interface
interface FHIRPatient {
  resourceType: "Patient"
  id: string
  identifier: Array<{
    use?: "usual" | "official" | "temp" | "secondary"
    type?: {
      coding: Array<{
        system: string
        code: string
        display: string
      }>
    }
    system: string // CPF, RG, CNS
    value: string
  }>
  active: boolean
  name: Array<{
    use?: "usual" | "official" | "maiden" | "nickname"
    family: string
    given: string[]
    prefix?: string[]
    suffix?: string[]
  }>
  telecom?: Array<{
    system: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other"
    value: string
    use?: "home" | "work" | "temp" | "old" | "mobile"
  }>
  gender?: "male" | "female" | "other" | "unknown"
  birthDate?: string
  deceased?: boolean | string
  address?: Array<{
    use?: "home" | "work" | "temp" | "old" | "billing"
    type?: "postal" | "physical" | "both"
    line?: string[]
    city?: string
    district?: string
    state?: string
    postalCode?: string
    country?: string
  }>
  maritalStatus?: {
    coding: Array<{
      system: string
      code: string
      display: string
    }>
  }
  contact?: Array<{
    relationship?: Array<{
      coding: Array<{
        system: string
        code: string
        display: string
      }>
    }>
    name?: {
      family: string
      given: string[]
    }
    telecom?: Array<{
      system: "phone" | "email"
      value: string
    }>
    address?: {
      line: string[]
      city: string
      state: string
      postalCode: string
    }
  }>
}

// Medical Record Interface
interface MedicalRecord {
  id: string
  patient: FHIRPatient
  consultations: Consultation[]
  procedures: MedicalProcedure[]
  prescriptions: Prescription[]
  allergies: Allergy[]
  vitalSigns: VitalSigns[]
  createdAt: string
  updatedAt: string
  lastAccessed: string
  accessedBy: string
  lgpdConsent: {
    granted: boolean
    grantedAt: string
    purpose: string[]
    retentionPeriod: number
  }
}

interface Consultation {
  id: string
  date: string
  type: 'inicial' | 'retorno' | 'urgencia' | 'seguimento'
  chief_complaint: string
  history_present_illness: string
  physical_examination: {
    general: string
    skin: string
    cardiovascular: string
    respiratory: string
    neurological: string
    musculoskeletal: string
  }
  assessment: string
  plan: string
  physician: {
    id: string
    name: string
    crm: string
    specialty: string
  }
  icd10_codes: string[]
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

interface MedicalProcedure {
  id: string
  date: string
  code: string
  name: string
  description: string
  category: 'estetica' | 'clinica' | 'cirurgica' | 'preventiva'
  performer: {
    id: string
    name: string
    role: string
    license: string
  }
  anesthesia?: {
    type: string
    agent: string
    dosage: string
  }
  complications?: string[]
  outcome: 'successful' | 'complications' | 'failed'
  followUp: {
    required: boolean
    scheduledDate?: string
    instructions: string
  }
  anvisaCompliance: {
    authorized: boolean
    registrationNumber?: string
    batchNumbers: string[]
  }
}

interface Prescription {
  id: string
  date: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  prescriber: {
    name: string
    crm: string
    specialty: string
  }
  status: 'active' | 'completed' | 'discontinued'
}

interface Allergy {
  id: string
  allergen: string
  type: 'drug' | 'food' | 'environmental' | 'other'
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening'
  reaction: string[]
  notes?: string
  verifiedDate: string
}

interface VitalSigns {
  id: string
  date: string
  bloodPressure?: {
    systolic: number
    diastolic: number
  }
  heartRate?: number
  temperature?: number
  weight?: number
  height?: number
  bmi?: number
  oxygenSaturation?: number
  painScale?: number
  notes?: string
}

// Hook Interface
interface UseProntuariosReturn {
  // State
  records: MedicalRecord[]
  currentRecord: MedicalRecord | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchRecords: () => Promise<void>
  fetchRecordById: (id: string) => Promise<MedicalRecord | null>
  createRecord: (patientData: Partial<FHIRPatient>) => Promise<MedicalRecord>
  updateRecord: (id: string, updates: Partial<MedicalRecord>) => Promise<void>
  deleteRecord: (id: string) => Promise<void>
  
  // Medical Actions
  addConsultation: (recordId: string, consultation: Omit<Consultation, 'id'>) => Promise<void>
  updateConsultation: (recordId: string, consultationId: string, updates: Partial<Consultation>) => Promise<void>
  addProcedure: (recordId: string, procedure: Omit<MedicalProcedure, 'id'>) => Promise<void>
  addPrescription: (recordId: string, prescription: Omit<Prescription, 'id'>) => Promise<void>
  addAllergy: (recordId: string, allergy: Omit<Allergy, 'id'>) => Promise<void>
  addVitalSigns: (recordId: string, vitalSigns: Omit<VitalSigns, 'id'>) => Promise<void>
  
  // LGPD Compliance
  grantLGPDConsent: (recordId: string, purpose: string[], retentionPeriod: number) => Promise<void>
  revokeLGPDConsent: (recordId: string) => Promise<void>
  generateLGPDReport: (recordId: string) => Promise<any>
  
  // Search & Filter
  searchRecords: (query: string) => MedicalRecord[]
  filterByDateRange: (startDate: string, endDate: string) => MedicalRecord[]
  filterByPhysician: (physicianId: string) => MedicalRecord[]
  
  // Validation
  validateFHIRCompliance: (record: MedicalRecord) => { valid: boolean; errors: string[] }
  validateCFMCompliance: (record: MedicalRecord) => { valid: boolean; errors: string[] }
}

// Mock Data
const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'record-001',
    patient: {
      resourceType: "Patient",
      id: 'patient-001',
      identifier: [
        {
          use: "official",
          system: "CPF",
          value: "123.456.789-00"
        },
        {
          use: "secondary", 
          system: "RG",
          value: "12.345.678-9"
        }
      ],
      active: true,
      name: [
        {
          use: "official",
          family: "Silva",
          given: ["João", "Carlos"]
        }
      ],
      telecom: [
        {
          system: "phone",
          value: "+55 11 99999-9999",
          use: "mobile"
        },
        {
          system: "email", 
          value: "joao.silva@email.com",
          use: "home"
        }
      ],
      gender: "male",
      birthDate: "1985-03-15",
      address: [
        {
          use: "home",
          type: "physical",
          line: ["Rua das Flores, 123"],
          city: "São Paulo",
          state: "SP",
          postalCode: "01234-567",
          country: "BR"
        }
      ]
    },
    consultations: [
      {
        id: 'consult-001',
        date: '2025-01-14',
        type: 'inicial',
        chief_complaint: 'Paciente procura tratamento para rugas de expressão',
        history_present_illness: 'Paciente refere aparecimento de rugas na testa nos últimos 2 anos',
        physical_examination: {
          general: 'Paciente em bom estado geral',
          skin: 'Pele saudável com sinais de envelhecimento na região frontal',
          cardiovascular: 'Normal',
          respiratory: 'Normal', 
          neurological: 'Normal',
          musculoskeletal: 'Normal'
        },
        assessment: 'Rugas dinâmicas frontais, candidato a toxina botulínica',
        plan: 'Aplicação de toxina botulínica tipo A na região frontal',
        physician: {
          id: 'doc-001',
          name: 'Dra. Maria Santos',
          crm: 'CRM-SP 123456',
          specialty: 'Dermatologia'
        },
        icd10_codes: ['L70.9'],
        status: 'completed'
      }
    ],
    procedures: [],
    prescriptions: [],
    allergies: [],
    vitalSigns: [
      {
        id: 'vital-001',
        date: '2025-01-14',
        bloodPressure: {
          systolic: 120,
          diastolic: 80
        },
        heartRate: 72,
        weight: 75,
        height: 175,
        bmi: 24.5,
        notes: 'Sinais vitais normais'
      }
    ],
    createdAt: '2025-01-14T09:00:00.000Z',
    updatedAt: '2025-01-14T10:30:00.000Z',
    lastAccessed: '2025-01-14T10:30:00.000Z',
    accessedBy: 'Dra. Maria Santos',
    lgpdConsent: {
      granted: true,
      grantedAt: '2025-01-14T09:00:00.000Z',
      purpose: ['treatment', 'quality_improvement'],
      retentionPeriod: 20
    }
  }
]

// Custom Hook
export const useProntuarios = (): UseProntuariosReturn => {
  const [records, setRecords] = useState<MedicalRecord[]>(mockMedicalRecords)
  const [currentRecord, setCurrentRecord] = useState<MedicalRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRecords(mockMedicalRecords)
    } catch (err) {
      setError('Erro ao carregar prontuários')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRecordById = useCallback(async (id: string): Promise<MedicalRecord | null> => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      const record = mockMedicalRecords.find(r => r.id === id) || null
      setCurrentRecord(record)
      return record
    } catch (err) {
      setError('Erro ao carregar prontuário')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const createRecord = useCallback(async (patientData: Partial<FHIRPatient>): Promise<MedicalRecord> => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newRecord: MedicalRecord = {
        id: `record-${Date.now()}`,
        patient: {
          resourceType: "Patient",
          id: `patient-${Date.now()}`,
          active: true,
          identifier: patientData.identifier || [],
          name: patientData.name || [],
          ...patientData
        },
        consultations: [],
        procedures: [],
        prescriptions: [],
        allergies: [],
        vitalSigns: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        accessedBy: 'Current User',
        lgpdConsent: {
          granted: false,
          grantedAt: '',
          purpose: [],
          retentionPeriod: 0
        }
      }
      
      setRecords(prev => [...prev, newRecord])
      return newRecord
    } catch (err) {
      setError('Erro ao criar prontuário')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateRecord = useCallback(async (id: string, updates: Partial<MedicalRecord>) => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setRecords(prev => prev.map(record => 
        record.id === id 
          ? { ...record, ...updates, updatedAt: new Date().toISOString() }
          : record
      ))
    } catch (err) {
      setError('Erro ao atualizar prontuário')
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteRecord = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setRecords(prev => prev.filter(record => record.id !== id))
    } catch (err) {
      setError('Erro ao deletar prontuário')
    } finally {
      setLoading(false)
    }
  }, [])

  const addConsultation = useCallback(async (recordId: string, consultation: Omit<Consultation, 'id'>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newConsultation: Consultation = {
        ...consultation,
        id: `consult-${Date.now()}`
      }
      
      setRecords(prev => prev.map(record => 
        record.id === recordId
          ? { 
              ...record, 
              consultations: [...record.consultations, newConsultation],
              updatedAt: new Date().toISOString()
            }
          : record
      ))
    } catch (err) {
      setError('Erro ao adicionar consulta')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateConsultation = useCallback(async (recordId: string, consultationId: string, updates: Partial<Consultation>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setRecords(prev => prev.map(record => 
        record.id === recordId
          ? { 
              ...record, 
              consultations: record.consultations.map(consult => 
                consult.id === consultationId ? { ...consult, ...updates } : consult
              ),
              updatedAt: new Date().toISOString()
            }
          : record
      ))
    } catch (err) {
      setError('Erro ao atualizar consulta')
    } finally {
      setLoading(false)
    }
  }, [])

  const addProcedure = useCallback(async (recordId: string, procedure: Omit<MedicalProcedure, 'id'>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newProcedure: MedicalProcedure = {
        ...procedure,
        id: `proc-${Date.now()}`
      }
      
      setRecords(prev => prev.map(record => 
        record.id === recordId
          ? { 
              ...record, 
              procedures: [...record.procedures, newProcedure],
              updatedAt: new Date().toISOString()
            }
          : record
      ))
    } catch (err) {
      setError('Erro ao adicionar procedimento')
    } finally {
      setLoading(false)
    }
  }, [])

  const addPrescription = useCallback(async (recordId: string, prescription: Omit<Prescription, 'id'>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newPrescription: Prescription = {
        ...prescription,
        id: `presc-${Date.now()}`
      }
      
      setRecords(prev => prev.map(record => 
        record.id === recordId
          ? { 
              ...record, 
              prescriptions: [...record.prescriptions, newPrescription],
              updatedAt: new Date().toISOString()
            }
          : record
      ))
    } catch (err) {
      setError('Erro ao adicionar prescrição')
    } finally {
      setLoading(false)
    }
  }, [])

  const addAllergy = useCallback(async (recordId: string, allergy: Omit<Allergy, 'id'>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newAllergy: Allergy = {
        ...allergy,
        id: `allergy-${Date.now()}`
      }
      
      setRecords(prev => prev.map(record => 
        record.id === recordId
          ? { 
              ...record, 
              allergies: [...record.allergies, newAllergy],
              updatedAt: new Date().toISOString()
            }
          : record
      ))
    } catch (err) {
      setError('Erro ao adicionar alergia')
    } finally {
      setLoading(false)
    }
  }, [])

  const addVitalSigns = useCallback(async (recordId: string, vitalSigns: Omit<VitalSigns, 'id'>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newVitalSigns: VitalSigns = {
        ...vitalSigns,
        id: `vital-${Date.now()}`
      }
      
      setRecords(prev => prev.map(record => 
        record.id === recordId
          ? { 
              ...record, 
              vitalSigns: [...record.vitalSigns, newVitalSigns],
              updatedAt: new Date().toISOString()
            }
          : record
      ))
    } catch (err) {
      setError('Erro ao adicionar sinais vitais')
    } finally {
      setLoading(false)
    }
  }, [])

  const grantLGPDConsent = useCallback(async (recordId: string, purpose: string[], retentionPeriod: number) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setRecords(prev => prev.map(record => 
        record.id === recordId
          ? { 
              ...record, 
              lgpdConsent: {
                granted: true,
                grantedAt: new Date().toISOString(),
                purpose,
                retentionPeriod
              },
              updatedAt: new Date().toISOString()
            }
          : record
      ))
    } catch (err) {
      setError('Erro ao conceder consentimento LGPD')
    } finally {
      setLoading(false)
    }
  }, [])

  const revokeLGPDConsent = useCallback(async (recordId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setRecords(prev => prev.map(record => 
        record.id === recordId
          ? { 
              ...record, 
              lgpdConsent: {
                granted: false,
                grantedAt: '',
                purpose: [],
                retentionPeriod: 0
              },
              updatedAt: new Date().toISOString()
            }
          : record
      ))
    } catch (err) {
      setError('Erro ao revogar consentimento LGPD')
    } finally {
      setLoading(false)
    }
  }, [])

  const generateLGPDReport = useCallback(async (recordId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const record = records.find(r => r.id === recordId)
      if (!record) throw new Error('Prontuário não encontrado')
      
      return {
        recordId,
        patientName: record.patient.name[0]?.given.join(' ') + ' ' + record.patient.name[0]?.family,
        dataCollected: [
          'Dados pessoais',
          'Histórico médico',
          'Dados de contato',
          'Informações de tratamento'
        ],
        purpose: record.lgpdConsent.purpose,
        retentionPeriod: record.lgpdConsent.retentionPeriod,
        generatedAt: new Date().toISOString()
      }
    } catch (err) {
      setError('Erro ao gerar relatório LGPD')
      return null
    } finally {
      setLoading(false)
    }
  }, [records])

  const searchRecords = useCallback((query: string): MedicalRecord[] => {
    return records.filter(record => {
      const patientName = record.patient.name[0]?.given.join(' ') + ' ' + record.patient.name[0]?.family
      const cpf = record.patient.identifier.find(id => id.system === 'CPF')?.value || ''
      
      return patientName.toLowerCase().includes(query.toLowerCase()) ||
             cpf.includes(query)
    })
  }, [records])

  const filterByDateRange = useCallback((startDate: string, endDate: string): MedicalRecord[] => {
    return records.filter(record => {
      const recordDate = new Date(record.createdAt)
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      return recordDate >= start && recordDate <= end
    })
  }, [records])

  const filterByPhysician = useCallback((physicianId: string): MedicalRecord[] => {
    return records.filter(record => 
      record.consultations.some(consult => consult.physician.id === physicianId)
    )
  }, [records])

  const validateFHIRCompliance = useCallback((record: MedicalRecord): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    // Validate required FHIR fields
    if (!record.patient.resourceType || record.patient.resourceType !== "Patient") {
      errors.push('resourceType deve ser "Patient"')
    }
    
    if (!record.patient.id) {
      errors.push('ID do paciente é obrigatório')
    }
    
    if (!record.patient.identifier || record.patient.identifier.length === 0) {
      errors.push('Pelo menos um identificador é obrigatório')
    }
    
    if (!record.patient.name || record.patient.name.length === 0) {
      errors.push('Nome do paciente é obrigatório')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }, [])

  const validateCFMCompliance = useCallback((record: MedicalRecord): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    // Validate CFM requirements
    record.consultations.forEach((consult, index) => {
      if (!consult.physician.crm) {
        errors.push(`Consulta ${index + 1}: CRM do médico é obrigatório`)
      }
      
      if (!consult.chief_complaint) {
        errors.push(`Consulta ${index + 1}: Queixa principal é obrigatória`)
      }
      
      if (!consult.assessment) {
        errors.push(`Consulta ${index + 1}: Avaliação médica é obrigatória`)
      }
      
      if (!consult.plan) {
        errors.push(`Consulta ${index + 1}: Plano de tratamento é obrigatório`)
      }
    })
    
    return {
      valid: errors.length === 0,
      errors
    }
  }, [])

  return {
    // State
    records,
    currentRecord,
    loading,
    error,
    
    // Actions
    fetchRecords,
    fetchRecordById,
    createRecord,
    updateRecord,
    deleteRecord,
    
    // Medical Actions
    addConsultation,
    updateConsultation,
    addProcedure,
    addPrescription,
    addAllergy,
    addVitalSigns,
    
    // LGPD Compliance
    grantLGPDConsent,
    revokeLGPDConsent,
    generateLGPDReport,
    
    // Search & Filter
    searchRecords,
    filterByDateRange,
    filterByPhysician,
    
    // Validation
    validateFHIRCompliance,
    validateCFMCompliance
  }
}