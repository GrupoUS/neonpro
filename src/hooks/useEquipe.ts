'use client'

import { useState, useCallback } from 'react'

// Healthcare Professional Interface
interface HealthcareProfessional {
  id: string
  personalInfo: {
    name: string
    cpf: string
    rg: string
    birthDate: string
    gender: 'male' | 'female' | 'other'
    maritalStatus: string
    nationality: string
    email: string
    phone: string
    address: {
      street: string
      number: string
      complement?: string
      neighborhood: string
      city: string
      state: string
      zipCode: string
    }
    emergencyContact: {
      name: string
      relationship: string
      phone: string
    }
  }
  
  professional: {
    role: 'medico' | 'enfermeiro' | 'esteticista' | 'recepcionista' | 'administrador' | 'fisioterapeuta' | 'nutricionista'
    employeeId: string
    hireDate: string
    contractType: 'clt' | 'pj' | 'prestador' | 'socio'
    workLoad: number // hours per week
    salary?: number
    commission?: number
    department: string
    supervisor?: string
    status: 'active' | 'inactive' | 'vacation' | 'medical_leave' | 'suspended'
  }
  
  // Medical Licenses & Certifications
  licenses: {
    crm?: {
      number: string
      state: string
      specialty: string[]
      issueDate: string
      expiryDate: string
      status: 'active' | 'suspended' | 'expired'
    }
    coren?: {
      number: string
      state: string
      category: 'enfermeiro' | 'tecnico' | 'auxiliar'
      issueDate: string
      expiryDate: string
      status: 'active' | 'suspended' | 'expired'
    }
    cfm?: {
      number: string
      issueDate: string
      expiryDate: string
      status: 'active' | 'suspended' | 'expired'
    }
    other?: Array<{
      type: string
      number: string
      issuer: string
      issueDate: string
      expiryDate: string
      status: 'active' | 'expired'
    }>
  }
  
  // Qualifications & Education
  education: {
    degree: string
    institution: string
    graduationYear: number
    specializations: Array<{
      name: string
      institution: string
      year: number
      hours: number
      certificate: string
    }>
    continuingEducation: Array<{
      name: string
      institution: string
      date: string
      hours: number
      category: 'workshop' | 'course' | 'conference' | 'seminar'
    }>
  }
  
  // Skills & Competencies
  skills: {
    procedures: string[]
    equipment: string[]
    certifications: string[]
    languages: Array<{
      language: string
      level: 'basic' | 'intermediate' | 'advanced' | 'native'
    }>
  }
  
  // Schedule & Availability
  schedule: {
    workingDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[]
    workingHours: {
      start: string
      end: string
      break?: {
        start: string
        end: string
      }
    }
    availability: {
      [key: string]: {
        available: boolean
        timeSlots: string[]
        notes?: string
      }
    }
    vacationDays: Array<{
      startDate: string
      endDate: string
      approved: boolean
      type: 'vacation' | 'medical' | 'personal'
    }>
  }
  
  // Performance Metrics
  metrics: {
    patientsAttended: number
    proceduresPerformed: number
    revenueGenerated: number
    satisfactionScore: number
    punctualityScore: number
    efficiency: number
    complaintCount: number
    commendationCount: number
    attendanceRate: number
  }
  
  // Performance History
  performance: {
    monthly: Array<{
      month: string
      patientsAttended: number
      revenue: number
      satisfaction: number
      goals: {
        patients: number
        revenue: number
        satisfaction: number
      }
      achieved: {
        patients: boolean
        revenue: boolean
        satisfaction: boolean
      }
    }>
    reviews: Array<{
      id: string
      reviewDate: string
      reviewer: string
      period: string
      scores: {
        technical: number
        communication: number
        teamwork: number
        punctuality: number
        overall: number
      }
      feedback: string
      goals: string[]
      developmentPlan: string[]
    }>
  }
  
  // Access & Permissions
  systemAccess: {
    username: string
    role: string
    permissions: string[]
    lastLogin: string
    accountStatus: 'active' | 'inactive' | 'locked'
    passwordLastChanged: string
  }
  
  // Compliance & Documentation
  compliance: {
    backgroundCheck: {
      completed: boolean
      date: string
      result: 'approved' | 'pending' | 'rejected'
    }
    healthCertificate: {
      issued: boolean
      issueDate: string
      expiryDate: string
      restrictions?: string[]
    }
    trainingRecords: Array<{
      training: string
      date: string
      instructor: string
      hours: number
      score?: number
      certificate: string
    }>
  }
  
  createdAt: string
  updatedAt: string
  createdBy: string
}

// Team Structure Interface
interface TeamStructure {
  departments: Array<{
    id: string
    name: string
    head: string
    members: string[]
    responsibilities: string[]
  }>
  hierarchy: Array<{
    level: number
    positions: string[]
    reportsTo?: number
  }>
}

// Shift Management Interface
interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  days: string[]
  assignedProfessionals: string[]
  requiredRoles: Array<{
    role: string
    count: number
  }>
  status: 'active' | 'inactive'
}

// Training Program Interface
interface TrainingProgram {
  id: string
  name: string
  description: string
  category: 'safety' | 'technical' | 'compliance' | 'soft_skills'
  duration: number
  mandatory: boolean
  targetRoles: string[]
  prerequisites: string[]
  schedule: {
    startDate: string
    endDate: string
    sessions: Array<{
      date: string
      time: string
      duration: number
      instructor: string
      topic: string
    }>
  }
  enrolled: string[]
  completed: string[]
  certification: boolean
}

// Hook Interface
interface UseEquipeReturn {
  // State
  professionals: HealthcareProfessional[]
  teamStructure: TeamStructure
  shifts: Shift[]
  trainingPrograms: TrainingProgram[]
  currentProfessional: HealthcareProfessional | null
  loading: boolean
  error: string | null
  
  // Professional Actions
  fetchProfessionals: () => Promise<void>
  fetchProfessionalById: (id: string) => Promise<HealthcareProfessional | null>
  createProfessional: (data: Omit<HealthcareProfessional, 'id' | 'createdAt' | 'updatedAt'>) => Promise<HealthcareProfessional>
  updateProfessional: (id: string, updates: Partial<HealthcareProfessional>) => Promise<void>
  deleteProfessional: (id: string) => Promise<void>
  toggleProfessionalStatus: (id: string) => Promise<void>
  
  // License Management
  updateLicense: (professionalId: string, licenseType: string, licenseData: any) => Promise<void>
  validateLicenses: (professionalId: string) => { valid: boolean; expired: string[]; expiringSoon: string[] }
  renewLicense: (professionalId: string, licenseType: string, newExpiryDate: string) => Promise<void>
  
  // Education & Training
  addEducation: (professionalId: string, education: any) => Promise<void>
  addTraining: (professionalId: string, training: any) => Promise<void>
  enrollInTraining: (professionalId: string, trainingId: string) => Promise<void>
  completeTraining: (professionalId: string, trainingId: string, score?: number) => Promise<void>
  
  // Schedule Management
  updateSchedule: (professionalId: string, schedule: Partial<HealthcareProfessional['schedule']>) => Promise<void>
  requestVacation: (professionalId: string, vacation: { startDate: string; endDate: string; type: 'vacation' | 'medical' | 'personal' }) => Promise<void>
  approveVacation: (professionalId: string, vacationId: string) => Promise<void>
  getAvailability: (professionalId: string, date: string) => Promise<{ available: boolean; timeSlots: string[] }>
  
  // Performance Management
  updateMetrics: (professionalId: string, metrics: Partial<HealthcareProfessional['metrics']>) => Promise<void>
  addPerformanceReview: (professionalId: string, review: any) => Promise<void>
  setGoals: (professionalId: string, goals: any) => Promise<void>
  trackGoalProgress: (professionalId: string) => any
  
  // Team Management
  createShift: (shift: Omit<Shift, 'id'>) => Promise<void>
  assignToShift: (shiftId: string, professionalIds: string[]) => Promise<void>
  updateTeamStructure: (structure: Partial<TeamStructure>) => Promise<void>
  
  // Search & Filter
  searchProfessionals: (query: string) => HealthcareProfessional[]
  filterByRole: (role: string) => HealthcareProfessional[]
  filterByDepartment: (department: string) => HealthcareProfessional[]
  filterByStatus: (status: string) => HealthcareProfessional[]
  filterBySkill: (skill: string) => HealthcareProfessional[]
  
  // Analytics
  getTeamMetrics: () => any
  getDepartmentMetrics: (department: string) => any
  getProfessionalMetrics: (professionalId: string) => any
  getPerformanceTrends: (professionalId: string, months: number) => any
  
  // Compliance
  validateCompliance: (professionalId: string) => { compliant: boolean; issues: string[] }
  generateComplianceReport: (departmentId?: string) => any
  trackCertificationExpiry: () => Array<{ professionalId: string; certification: string; expiryDate: string }>
}

// Mock Data
const mockProfessionals: HealthcareProfessional[] = [
  {
    id: 'prof-001',
    personalInfo: {
      name: 'Dra. Maria Santos Silva',
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      birthDate: '1985-03-15',
      gender: 'female',
      maritalStatus: 'casada',
      nationality: 'brasileira',
      email: 'maria.santos@neonpro.com',
      phone: '+55 11 99999-1234',
      address: {
        street: 'Rua Augusta',
        number: '1000',
        complement: 'Apto 45',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01305-100'
      },
      emergencyContact: {
        name: 'João Santos Silva',
        relationship: 'cônjuge',
        phone: '+55 11 98888-5678'
      }
    },
    professional: {
      role: 'medico',
      employeeId: 'NP-001',
      hireDate: '2022-01-15',
      contractType: 'clt',
      workLoad: 40,
      salary: 25000,
      commission: 15,
      department: 'Dermatologia',
      status: 'active'
    },
    licenses: {
      crm: {
        number: '123456',
        state: 'SP',
        specialty: ['Dermatologia', 'Medicina Estética'],
        issueDate: '2010-06-15',
        expiryDate: '2025-06-15',
        status: 'active'
      },
      cfm: {
        number: '654321',
        issueDate: '2010-06-15',
        expiryDate: '2025-06-15',
        status: 'active'
      }
    },
    education: {
      degree: 'Medicina',
      institution: 'USP - Universidade de São Paulo',
      graduationYear: 2009,
      specializations: [
        {
          name: 'Dermatologia',
          institution: 'Hospital das Clínicas - USP',
          year: 2012,
          hours: 2880,
          certificate: 'CERT-DERM-001'
        },
        {
          name: 'Medicina Estética',
          institution: 'SBAGE',
          year: 2015,
          hours: 360,
          certificate: 'CERT-ESTET-001'
        }
      ],
      continuingEducation: [
        {
          name: 'Workshop Aplicação de Toxina Botulínica',
          institution: 'SBME',
          date: '2024-11-15',
          hours: 16,
          category: 'workshop'
        }
      ]
    },
    skills: {
      procedures: [
        'Aplicação de Botox',
        'Preenchimento com Ácido Hialurônico',
        'Laser CO2 Fracionado',
        'Peeling Químico',
        'Microagulhamento'
      ],
      equipment: [
        'Laser CO2',
        'Ultrassom Microfocado',
        'Radiofrequência',
        'Luz Pulsada'
      ],
      certifications: [
        'ANVISA - Medicina Estética',
        'SBAGE - Membro Titular',
        'SBD - Membro Especialista'
      ],
      languages: [
        { language: 'Português', level: 'native' },
        { language: 'Inglês', level: 'advanced' },
        { language: 'Espanhol', level: 'intermediate' }
      ]
    },
    schedule: {
      workingDays: ['tuesday', 'wednesday', 'thursday', 'friday'],
      workingHours: {
        start: '08:00',
        end: '18:00',
        break: {
          start: '12:00',
          end: '13:00'
        }
      },
      availability: {
        '2025-01-14': {
          available: true,
          timeSlots: ['09:00', '10:00', '14:00', '15:00', '16:00']
        }
      },
      vacationDays: [
        {
          startDate: '2025-02-20',
          endDate: '2025-03-05',
          approved: true,
          type: 'vacation'
        }
      ]
    },
    metrics: {
      patientsAttended: 1250,
      proceduresPerformed: 890,
      revenueGenerated: 485000,
      satisfactionScore: 4.9,
      punctualityScore: 98,
      efficiency: 94,
      complaintCount: 2,
      commendationCount: 45,
      attendanceRate: 97
    },
    performance: {
      monthly: [
        {
          month: '2025-01',
          patientsAttended: 125,
          revenue: 52000,
          satisfaction: 4.8,
          goals: {
            patients: 120,
            revenue: 50000,
            satisfaction: 4.5
          },
          achieved: {
            patients: true,
            revenue: true,
            satisfaction: true
          }
        }
      ],
      reviews: [
        {
          id: 'review-001',
          reviewDate: '2024-12-15',
          reviewer: 'Dr. João Diretor',
          period: '2024-H2',
          scores: {
            technical: 9.5,
            communication: 9.8,
            teamwork: 9.2,
            punctuality: 9.9,
            overall: 9.6
          },
          feedback: 'Excelente performance. Médica dedicada e competente.',
          goals: [
            'Aumentar produtividade em 10%',
            'Participar de 2 congressos'
          ],
          developmentPlan: [
            'Curso avançado de laser',
            'Mentoria em gestão de tempo'
          ]
        }
      ]
    },
    systemAccess: {
      username: 'maria.santos',
      role: 'physician',
      permissions: [
        'patients:read',
        'patients:write',
        'procedures:execute',
        'prescriptions:write',
        'reports:generate'
      ],
      lastLogin: '2025-01-14T08:30:00.000Z',
      accountStatus: 'active',
      passwordLastChanged: '2024-12-01T00:00:00.000Z'
    },
    compliance: {
      backgroundCheck: {
        completed: true,
        date: '2022-01-10',
        result: 'approved'
      },
      healthCertificate: {
        issued: true,
        issueDate: '2024-08-15',
        expiryDate: '2025-08-15'
      },
      trainingRecords: [
        {
          training: 'Segurança e Higiene Hospitalar',
          date: '2024-03-15',
          instructor: 'Ana Costa',
          hours: 8,
          score: 95,
          certificate: 'CERT-SEG-001'
        }
      ]
    },
    createdAt: '2022-01-15T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
    createdBy: 'admin'
  },
  {
    id: 'prof-002',
    personalInfo: {
      name: 'Carlos Oliveira Fernandes',
      cpf: '987.654.321-00',
      rg: '98.765.432-1',
      birthDate: '1990-07-22',
      gender: 'male',
      maritalStatus: 'solteiro',
      nationality: 'brasileira',
      email: 'carlos.oliveira@neonpro.com',
      phone: '+55 11 98888-4321',
      address: {
        street: 'Avenida Paulista',
        number: '2000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-200'
      },
      emergencyContact: {
        name: 'Ana Oliveira',
        relationship: 'mãe',
        phone: '+55 11 97777-1234'
      }
    },
    professional: {
      role: 'enfermeiro',
      employeeId: 'NP-002',
      hireDate: '2022-03-01',
      contractType: 'clt',
      workLoad: 40,
      salary: 8500,
      department: 'Procedimentos',
      status: 'active'
    },
    licenses: {
      coren: {
        number: '456789',
        state: 'SP',
        category: 'enfermeiro',
        issueDate: '2015-12-10',
        expiryDate: '2025-12-10',
        status: 'active'
      }
    },
    education: {
      degree: 'Enfermagem',
      institution: 'UNIFESP',
      graduationYear: 2014,
      specializations: [
        {
          name: 'Enfermagem Estética',
          institution: 'SOBENE',
          year: 2018,
          hours: 360,
          certificate: 'CERT-ENF-EST-001'
        }
      ],
      continuingEducation: [
        {
          name: 'Atualização em Procedimentos Injetáveis',
          institution: 'SOBENE',
          date: '2024-09-20',
          hours: 12,
          category: 'course'
        }
      ]
    },
    skills: {
      procedures: [
        'Aplicação de Medicamentos',
        'Curativos Especializados',
        'Procedimentos Estéticos Básicos',
        'Coleta de Material'
      ],
      equipment: [
        'Equipamentos de Curativo',
        'Sistema de Infusão',
        'Monitor de Sinais Vitais'
      ],
      certifications: [
        'COREN - Registro Ativo',
        'SOBENE - Membro'
      ],
      languages: [
        { language: 'Português', level: 'native' },
        { language: 'Inglês', level: 'intermediate' }
      ]
    },
    schedule: {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHours: {
        start: '07:00',
        end: '15:00'
      },
      availability: {
        '2025-01-14': {
          available: true,
          timeSlots: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00']
        }
      },
      vacationDays: []
    },
    metrics: {
      patientsAttended: 890,
      proceduresPerformed: 1250,
      revenueGenerated: 125000,
      satisfactionScore: 4.7,
      punctualityScore: 95,
      efficiency: 88,
      complaintCount: 1,
      commendationCount: 23,
      attendanceRate: 98
    },
    performance: {
      monthly: [
        {
          month: '2025-01',
          patientsAttended: 89,
          revenue: 12500,
          satisfaction: 4.6,
          goals: {
            patients: 85,
            revenue: 12000,
            satisfaction: 4.5
          },
          achieved: {
            patients: true,
            revenue: true,
            satisfaction: true
          }
        }
      ],
      reviews: []
    },
    systemAccess: {
      username: 'carlos.oliveira',
      role: 'nurse',
      permissions: [
        'patients:read',
        'procedures:assist',
        'inventory:update',
        'schedule:manage'
      ],
      lastLogin: '2025-01-14T07:15:00.000Z',
      accountStatus: 'active',
      passwordLastChanged: '2024-11-15T00:00:00.000Z'
    },
    compliance: {
      backgroundCheck: {
        completed: true,
        date: '2022-02-25',
        result: 'approved'
      },
      healthCertificate: {
        issued: true,
        issueDate: '2024-09-10',
        expiryDate: '2025-09-10'
      },
      trainingRecords: [
        {
          training: 'Procedimentos de Emergência',
          date: '2024-05-20',
          instructor: 'Dr. Pedro Silva',
          hours: 12,
          score: 88,
          certificate: 'CERT-EMER-001'
        }
      ]
    },
    createdAt: '2022-03-01T00:00:00.000Z',
    updatedAt: '2025-01-08T00:00:00.000Z',
    createdBy: 'admin'
  }
]

const mockTeamStructure: TeamStructure = {
  departments: [
    {
      id: 'dept-001',
      name: 'Dermatologia',
      head: 'prof-001',
      members: ['prof-001'],
      responsibilities: [
        'Diagnóstico dermatológico',
        'Procedimentos estéticos',
        'Tratamentos clínicos'
      ]
    },
    {
      id: 'dept-002',
      name: 'Procedimentos',
      head: 'prof-002',
      members: ['prof-002'],
      responsibilities: [
        'Assistência em procedimentos',
        'Cuidados pós-procedimento',
        'Gestão de materiais'
      ]
    }
  ],
  hierarchy: [
    { level: 1, positions: ['Diretor Médico'] },
    { level: 2, positions: ['Coordenador', 'Médico Sênior'], reportsTo: 1 },
    { level: 3, positions: ['Médico', 'Enfermeiro'], reportsTo: 2 },
    { level: 4, positions: ['Técnico', 'Auxiliar'], reportsTo: 3 }
  ]
}

const mockShifts: Shift[] = [
  {
    id: 'shift-001',
    name: 'Manhã',
    startTime: '07:00',
    endTime: '15:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    assignedProfessionals: ['prof-002'],
    requiredRoles: [
      { role: 'enfermeiro', count: 1 },
      { role: 'recepcionista', count: 1 }
    ],
    status: 'active'
  },
  {
    id: 'shift-002',
    name: 'Tarde',
    startTime: '13:00',
    endTime: '21:00',
    days: ['tuesday', 'wednesday', 'thursday', 'friday'],
    assignedProfessionals: ['prof-001'],
    requiredRoles: [
      { role: 'medico', count: 1 },
      { role: 'enfermeiro', count: 1 }
    ],
    status: 'active'
  }
]

// Custom Hook
export const useEquipe = (): UseEquipeReturn => {
  const [professionals, setProfessionals] = useState<HealthcareProfessional[]>(mockProfessionals)
  const [teamStructure, setTeamStructure] = useState<TeamStructure>(mockTeamStructure)
  const [shifts, setShifts] = useState<Shift[]>(mockShifts)
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([])
  const [currentProfessional, setCurrentProfessional] = useState<HealthcareProfessional | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfessionals = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setProfessionals(mockProfessionals)
    } catch (err) {
      setError('Erro ao carregar profissionais')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProfessionalById = useCallback(async (id: string): Promise<HealthcareProfessional | null> => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const professional = mockProfessionals.find(p => p.id === id) || null
      setCurrentProfessional(professional)
      return professional
    } catch (err) {
      setError('Erro ao carregar profissional')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const createProfessional = useCallback(async (data: Omit<HealthcareProfessional, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthcareProfessional> => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newProfessional: HealthcareProfessional = {
        ...data,
        id: `prof-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setProfessionals(prev => [...prev, newProfessional])
      return newProfessional
    } catch (err) {
      setError('Erro ao criar profissional')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfessional = useCallback(async (id: string, updates: Partial<HealthcareProfessional>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setProfessionals(prev => prev.map(prof => 
        prof.id === id 
          ? { ...prof, ...updates, updatedAt: new Date().toISOString() }
          : prof
      ))
    } catch (err) {
      setError('Erro ao atualizar profissional')
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteProfessional = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setProfessionals(prev => prev.filter(prof => prof.id !== id))
    } catch (err) {
      setError('Erro ao deletar profissional')
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleProfessionalStatus = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setProfessionals(prev => prev.map(prof => 
        prof.id === id 
          ? { 
              ...prof, 
              professional: {
                ...prof.professional,
                status: prof.professional.status === 'active' ? 'inactive' : 'active'
              },
              updatedAt: new Date().toISOString()
            }
          : prof
      ))
    } catch (err) {
      setError('Erro ao alterar status do profissional')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateLicense = useCallback(async (professionalId: string, licenseType: string, licenseData: any) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setProfessionals(prev => prev.map(prof => 
        prof.id === professionalId
          ? { 
              ...prof, 
              licenses: {
                ...prof.licenses,
                [licenseType]: licenseData
              },
              updatedAt: new Date().toISOString()
            }
          : prof
      ))
    } catch (err) {
      setError('Erro ao atualizar licença')
    } finally {
      setLoading(false)
    }
  }, [])

  const validateLicenses = useCallback((professionalId: string): { valid: boolean; expired: string[]; expiringSoon: string[] } => {
    const professional = professionals.find(p => p.id === professionalId)
    if (!professional) return { valid: false, expired: [], expiringSoon: [] }

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const expired: string[] = []
    const expiringSoon: string[] = []
    
    // Check CRM
    if (professional.licenses.crm) {
      const expiryDate = new Date(professional.licenses.crm.expiryDate)
      if (expiryDate < now) {
        expired.push('CRM')
      } else if (expiryDate < thirtyDaysFromNow) {
        expiringSoon.push('CRM')
      }
    }
    
    // Check COREN
    if (professional.licenses.coren) {
      const expiryDate = new Date(professional.licenses.coren.expiryDate)
      if (expiryDate < now) {
        expired.push('COREN')
      } else if (expiryDate < thirtyDaysFromNow) {
        expiringSoon.push('COREN')
      }
    }
    
    // Check CFM
    if (professional.licenses.cfm) {
      const expiryDate = new Date(professional.licenses.cfm.expiryDate)
      if (expiryDate < now) {
        expired.push('CFM')
      } else if (expiryDate < thirtyDaysFromNow) {
        expiringSoon.push('CFM')
      }
    }
    
    return {
      valid: expired.length === 0,
      expired,
      expiringSoon
    }
  }, [professionals])

  const renewLicense = useCallback(async (professionalId: string, licenseType: string, newExpiryDate: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setProfessionals(prev => prev.map(prof => 
        prof.id === professionalId
          ? { 
              ...prof, 
              licenses: {
                ...prof.licenses,
                [licenseType]: {
                  ...prof.licenses[licenseType as keyof typeof prof.licenses],
                  expiryDate: newExpiryDate,
                  status: 'active'
                }
              },
              updatedAt: new Date().toISOString()
            }
          : prof
      ))
    } catch (err) {
      setError('Erro ao renovar licença')
    } finally {
      setLoading(false)
    }
  }, [])

  const addEducation = useCallback(async (professionalId: string, education: any) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setProfessionals(prev => prev.map(prof => 
        prof.id === professionalId
          ? { 
              ...prof, 
              education: {
                ...prof.education,
                specializations: [...prof.education.specializations, education]
              },
              updatedAt: new Date().toISOString()
            }
          : prof
      ))
    } catch (err) {
      setError('Erro ao adicionar formação')
    } finally {
      setLoading(false)
    }
  }, [])

  const addTraining = useCallback(async (professionalId: string, training: any) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setProfessionals(prev => prev.map(prof => 
        prof.id === professionalId
          ? { 
              ...prof, 
              compliance: {
                ...prof.compliance,
                trainingRecords: [...prof.compliance.trainingRecords, training]
              },
              updatedAt: new Date().toISOString()
            }
          : prof
      ))
    } catch (err) {
      setError('Erro ao adicionar treinamento')
    } finally {
      setLoading(false)
    }
  }, [])

  const enrollInTraining = useCallback(async (professionalId: string, trainingId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setTrainingPrograms(prev => prev.map(training => 
        training.id === trainingId
          ? { 
              ...training, 
              enrolled: [...training.enrolled, professionalId]
            }
          : training
      ))
    } catch (err) {
      setError('Erro ao inscrever em treinamento')
    } finally {
      setLoading(false)
    }
  }, [])

  const completeTraining = useCallback(async (professionalId: string, trainingId: string, score?: number) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setTrainingPrograms(prev => prev.map(training => 
        training.id === trainingId
          ? { 
              ...training, 
              completed: [...training.completed, professionalId]
            }
          : training
      ))
    } catch (err) {
      setError('Erro ao completar treinamento')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateSchedule = useCallback(async (professionalId: string, schedule: Partial<HealthcareProfessional['schedule']>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setProfessionals(prev => prev.map(prof => 
        prof.id === professionalId
          ? { 
              ...prof, 
              schedule: { ...prof.schedule, ...schedule },
              updatedAt: new Date().toISOString()
            }
          : prof
      ))
    } catch (err) {
      setError('Erro ao atualizar agenda')
    } finally {
      setLoading(false)
    }
  }, [])

  const requestVacation = useCallback(async (professionalId: string, vacation: { startDate: string; endDate: string; type: 'vacation' | 'medical' | 'personal' }) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const vacationRequest = {
        ...vacation,
        approved: false
      }
      
      setProfessionals(prev => prev.map(prof => 
        prof.id === professionalId
          ? { 
              ...prof, 
              schedule: {
                ...prof.schedule,
                vacationDays: [...prof.schedule.vacationDays, vacationRequest]
              },
              updatedAt: new Date().toISOString()
            }
          : prof
      ))
    } catch (err) {
      setError('Erro ao solicitar férias')
    } finally {
      setLoading(false)
    }
  }, [])

  const approveVacation = useCallback(async (professionalId: string, vacationId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setProfessionals(prev => prev.map(prof => 
        prof.id === professionalId
          ? { 
              ...prof, 
              schedule: {
                ...prof.schedule,
                vacationDays: prof.schedule.vacationDays.map((vacation, index) => 
                  index.toString() === vacationId 
                    ? { ...vacation, approved: true }
                    : vacation
                )
              },
              updatedAt: new Date().toISOString()
            }
          : prof
      ))
    } catch (err) {
      setError('Erro ao aprovar férias')
    } finally {
      setLoading(false)
    }
  }, [])

  const getAvailability = useCallback(async (professionalId: string, date: string): Promise<{ available: boolean; timeSlots: string[] }> => {
    setLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const professional = professionals.find(p => p.id === professionalId)
      if (!professional) return { available: false, timeSlots: [] }
      
      const dayAvailability = professional.schedule.availability[date]
      if (!dayAvailability) return { available: false, timeSlots: [] }
      
      return dayAvailability
    } catch (err) {
      return { available: false, timeSlots: [] }
    } finally {
      setLoading(false)
    }
  }, [professionals])

  const updateMetrics = useCallback(async (professionalId: string, metrics: Partial<HealthcareProfessional['metrics']>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setProfessionals(prev => prev.map(prof => 
        prof.id === professionalId
          ? { 
              ...prof, 
              metrics: { ...prof.metrics, ...metrics },
              updatedAt: new Date().toISOString()
            }
          : prof
      ))
    } catch (err) {
      setError('Erro ao atualizar métricas')
    } finally {
      setLoading(false)
    }
  }, [])

  const addPerformanceReview = useCallback(async (professionalId: string, review: any) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setProfessionals(prev => prev.map(prof => 
        prof.id === professionalId
          ? { 
              ...prof, 
              performance: {
                ...prof.performance,
                reviews: [...prof.performance.reviews, { ...review, id: `review-${Date.now()}` }]
              },
              updatedAt: new Date().toISOString()
            }
          : prof
      ))
    } catch (err) {
      setError('Erro ao adicionar avaliação de performance')
    } finally {
      setLoading(false)
    }
  }, [])

  const setGoals = useCallback(async (professionalId: string, goals: any) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const currentMonth = new Date().toISOString().slice(0, 7)
      
      setProfessionals(prev => prev.map(prof => 
        prof.id === professionalId
          ? { 
              ...prof, 
              performance: {
                ...prof.performance,
                monthly: prof.performance.monthly.map(month => 
                  month.month === currentMonth
                    ? { ...month, goals }
                    : month
                )
              },
              updatedAt: new Date().toISOString()
            }
          : prof
      ))
    } catch (err) {
      setError('Erro ao definir metas')
    } finally {
      setLoading(false)
    }
  }, [])

  const trackGoalProgress = useCallback((professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId)
    if (!professional) return null

    const currentMonth = professional.performance.monthly[professional.performance.monthly.length - 1]
    if (!currentMonth) return null

    return {
      month: currentMonth.month,
      goals: currentMonth.goals,
      achieved: currentMonth.achieved,
      progress: {
        patients: (currentMonth.patientsAttended / currentMonth.goals.patients) * 100,
        revenue: (currentMonth.revenue / currentMonth.goals.revenue) * 100,
        satisfaction: (currentMonth.satisfaction / currentMonth.goals.satisfaction) * 100
      }
    }
  }, [professionals])

  const createShift = useCallback(async (shift: Omit<Shift, 'id'>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newShift: Shift = {
        ...shift,
        id: `shift-${Date.now()}`
      }
      
      setShifts(prev => [...prev, newShift])
    } catch (err) {
      setError('Erro ao criar turno')
    } finally {
      setLoading(false)
    }
  }, [])

  const assignToShift = useCallback(async (shiftId: string, professionalIds: string[]) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setShifts(prev => prev.map(shift => 
        shift.id === shiftId
          ? { ...shift, assignedProfessionals: professionalIds }
          : shift
      ))
    } catch (err) {
      setError('Erro ao atribuir ao turno')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTeamStructure = useCallback(async (structure: Partial<TeamStructure>) => {
    setLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setTeamStructure(prev => ({ ...prev, ...structure }))
    } catch (err) {
      setError('Erro ao atualizar estrutura da equipe')
    } finally {
      setLoading(false)
    }
  }, [])

  const searchProfessionals = useCallback((query: string): HealthcareProfessional[] => {
    return professionals.filter(prof => 
      prof.personalInfo.name.toLowerCase().includes(query.toLowerCase()) ||
      prof.personalInfo.email.toLowerCase().includes(query.toLowerCase()) ||
      prof.professional.employeeId.toLowerCase().includes(query.toLowerCase())
    )
  }, [professionals])

  const filterByRole = useCallback((role: string): HealthcareProfessional[] => {
    return professionals.filter(prof => prof.professional.role === role)
  }, [professionals])

  const filterByDepartment = useCallback((department: string): HealthcareProfessional[] => {
    return professionals.filter(prof => prof.professional.department === department)
  }, [professionals])

  const filterByStatus = useCallback((status: string): HealthcareProfessional[] => {
    return professionals.filter(prof => prof.professional.status === status)
  }, [professionals])

  const filterBySkill = useCallback((skill: string): HealthcareProfessional[] => {
    return professionals.filter(prof => 
      prof.skills.procedures.some(proc => proc.toLowerCase().includes(skill.toLowerCase())) ||
      prof.skills.equipment.some(eq => eq.toLowerCase().includes(skill.toLowerCase()))
    )
  }, [professionals])

  const getTeamMetrics = useCallback(() => {
    const totalProfessionals = professionals.length
    const activeProfessionals = professionals.filter(p => p.professional.status === 'active').length
    const totalRevenue = professionals.reduce((acc, prof) => acc + prof.metrics.revenueGenerated, 0)
    const avgSatisfaction = professionals.reduce((acc, prof) => acc + prof.metrics.satisfactionScore, 0) / professionals.length
    
    const roleDistribution = professionals.reduce((acc, prof) => {
      acc[prof.professional.role] = (acc[prof.professional.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalProfessionals,
      activeProfessionals,
      totalRevenue,
      averageSatisfaction: avgSatisfaction,
      roleDistribution,
      utilizationRate: (activeProfessionals / totalProfessionals) * 100
    }
  }, [professionals])

  const getDepartmentMetrics = useCallback((department: string) => {
    const deptProfessionals = professionals.filter(p => p.professional.department === department)
    
    const totalRevenue = deptProfessionals.reduce((acc, prof) => acc + prof.metrics.revenueGenerated, 0)
    const avgSatisfaction = deptProfessionals.reduce((acc, prof) => acc + prof.metrics.satisfactionScore, 0) / deptProfessionals.length
    const totalPatients = deptProfessionals.reduce((acc, prof) => acc + prof.metrics.patientsAttended, 0)
    
    return {
      professionalCount: deptProfessionals.length,
      totalRevenue,
      averageSatisfaction: avgSatisfaction,
      totalPatients,
      avgRevenuePerProfessional: totalRevenue / deptProfessionals.length
    }
  }, [professionals])

  const getProfessionalMetrics = useCallback((professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId)
    if (!professional) return null

    return {
      ...professional.metrics,
      revenuePerPatient: professional.metrics.revenueGenerated / professional.metrics.patientsAttended,
      procedureEfficiency: professional.metrics.proceduresPerformed / professional.metrics.patientsAttended,
      overallScore: (professional.metrics.satisfactionScore + professional.metrics.efficiency) / 2
    }
  }, [professionals])

  const getPerformanceTrends = useCallback((professionalId: string, months: number) => {
    const professional = professionals.find(p => p.id === professionalId)
    if (!professional) return null

    const recentMonths = professional.performance.monthly.slice(-months)
    
    const trends = {
      patients: recentMonths.map(m => m.patientsAttended),
      revenue: recentMonths.map(m => m.revenue),
      satisfaction: recentMonths.map(m => m.satisfaction),
      goalAchievement: recentMonths.map(m => {
        const achieved = Object.values(m.achieved).filter(Boolean).length
        return (achieved / 3) * 100
      })
    }
    
    return trends
  }, [professionals])

  const validateCompliance = useCallback((professionalId: string): { compliant: boolean; issues: string[] } => {
    const professional = professionals.find(p => p.id === professionalId)
    if (!professional) return { compliant: false, issues: ['Profissional não encontrado'] }

    const issues: string[] = []
    
    // Check licenses
    const licenseValidation = validateLicenses(professionalId)
    if (licenseValidation.expired.length > 0) {
      issues.push(`Licenças vencidas: ${licenseValidation.expired.join(', ')}`)
    }
    
    // Check health certificate
    if (!professional.compliance.healthCertificate.issued) {
      issues.push('Certificado de saúde não emitido')
    } else {
      const expiryDate = new Date(professional.compliance.healthCertificate.expiryDate)
      if (expiryDate < new Date()) {
        issues.push('Certificado de saúde vencido')
      }
    }
    
    // Check background check
    if (!professional.compliance.backgroundCheck.completed || 
        professional.compliance.backgroundCheck.result !== 'approved') {
      issues.push('Verificação de antecedentes pendente ou não aprovada')
    }
    
    return {
      compliant: issues.length === 0,
      issues
    }
  }, [professionals, validateLicenses])

  const generateComplianceReport = useCallback((departmentId?: string) => {
    let professionalsToCheck = professionals
    
    if (departmentId) {
      const department = teamStructure.departments.find(d => d.id === departmentId)
      if (department) {
        professionalsToCheck = professionals.filter(p => department.members.includes(p.id))
      }
    }
    
    const complianceResults = professionalsToCheck.map(prof => ({
      professionalId: prof.id,
      name: prof.personalInfo.name,
      department: prof.professional.department,
      compliance: validateCompliance(prof.id)
    }))
    
    const summary = {
      total: complianceResults.length,
      compliant: complianceResults.filter(r => r.compliance.compliant).length,
      nonCompliant: complianceResults.filter(r => !r.compliance.compliant).length,
      complianceRate: (complianceResults.filter(r => r.compliance.compliant).length / complianceResults.length) * 100
    }
    
    return {
      summary,
      details: complianceResults,
      generatedAt: new Date().toISOString()
    }
  }, [professionals, teamStructure, validateCompliance])

  const trackCertificationExpiry = useCallback(() => {
    const expiringCertifications: Array<{ professionalId: string; certification: string; expiryDate: string }> = []
    
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    
    professionals.forEach(prof => {
      // Check CRM
      if (prof.licenses.crm && new Date(prof.licenses.crm.expiryDate) <= thirtyDaysFromNow) {
        expiringCertifications.push({
          professionalId: prof.id,
          certification: 'CRM',
          expiryDate: prof.licenses.crm.expiryDate
        })
      }
      
      // Check COREN
      if (prof.licenses.coren && new Date(prof.licenses.coren.expiryDate) <= thirtyDaysFromNow) {
        expiringCertifications.push({
          professionalId: prof.id,
          certification: 'COREN',
          expiryDate: prof.licenses.coren.expiryDate
        })
      }
      
      // Check CFM
      if (prof.licenses.cfm && new Date(prof.licenses.cfm.expiryDate) <= thirtyDaysFromNow) {
        expiringCertifications.push({
          professionalId: prof.id,
          certification: 'CFM',
          expiryDate: prof.licenses.cfm.expiryDate
        })
      }
      
      // Check Health Certificate
      if (prof.compliance.healthCertificate.issued && 
          new Date(prof.compliance.healthCertificate.expiryDate) <= thirtyDaysFromNow) {
        expiringCertifications.push({
          professionalId: prof.id,
          certification: 'Certificado de Saúde',
          expiryDate: prof.compliance.healthCertificate.expiryDate
        })
      }
    })
    
    return expiringCertifications
  }, [professionals])

  return {
    // State
    professionals,
    teamStructure,
    shifts,
    trainingPrograms,
    currentProfessional,
    loading,
    error,
    
    // Professional Actions
    fetchProfessionals,
    fetchProfessionalById,
    createProfessional,
    updateProfessional,
    deleteProfessional,
    toggleProfessionalStatus,
    
    // License Management
    updateLicense,
    validateLicenses,
    renewLicense,
    
    // Education & Training
    addEducation,
    addTraining,
    enrollInTraining,
    completeTraining,
    
    // Schedule Management
    updateSchedule,
    requestVacation,
    approveVacation,
    getAvailability,
    
    // Performance Management
    updateMetrics,
    addPerformanceReview,
    setGoals,
    trackGoalProgress,
    
    // Team Management
    createShift,
    assignToShift,
    updateTeamStructure,
    
    // Search & Filter
    searchProfessionals,
    filterByRole,
    filterByDepartment,
    filterByStatus,
    filterBySkill,
    
    // Analytics
    getTeamMetrics,
    getDepartmentMetrics,
    getProfessionalMetrics,
    getPerformanceTrends,
    
    // Compliance
    validateCompliance,
    generateComplianceReport,
    trackCertificationExpiry
  }
}