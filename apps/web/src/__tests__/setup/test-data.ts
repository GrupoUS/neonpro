/**
 * Test Data Factory
 *
 * Centralized test data generation for consistent and realistic test scenarios
 */

// Test data interfaces
export interface MockUser {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  cpf: string
  address: string
  city: string
  state: string
  zipCode: string
  createdAt: string
  updatedAt: string
}

export interface MockProfessional {
  id: string
  name: string
  email: string
  phone: string
  specialty: string
  crm: string
  anvisaRegistration: string
  rating: number
  experience: number
  bio: string
  photo?: string
  available: boolean
}

export interface MockProcedure {
  id: string
  name: string
  description: string
  category: string
  duration: number
  price: number
  anvisaRequired: boolean
  anvisaRegistration?: string
  contraindications: string[]
  benefits: string[]
  recoveryTime: number
  sessionsRecommended: number
}

export interface MockTreatmentPackage {
  id: string
  name: string
  description: string
  sessions: number
  totalPrice: number
  discountPercentage: number
  duration: number
  category: string
  procedures: string[]
  includes: string[]
  validFor: number // days
  createdAt: string
  updatedAt: string
}

export interface MockAppointment {
  id: string
  patientId: string
  professionalId: string
  procedureId: string
  packageId?: string
  date: string
  time: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  price: number
  paid: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface MockPhotoAssessment {
  id: string
  patientId: string
  type: 'facial_analysis' | 'body_analysis' | 'progress_tracking'
  photos: string[]
  analysis: {
    skinType: string
    concerns: string[]
    recommendations: string[]
    score: number
  }
  createdAt: string
  updatedAt: string
}

// Test data factory functions
export function createMockUser(type: 'patient' | 'professional' = 'patient'): MockUser {
  const names = {
    patient: ['Maria Silva Santos', 'João Pereira Oliveira', 'Ana Costa Souza'],
    professional: [
      'Dr. Carlos Roberto Silva',
      'Dra. Maria Fernanda Costa',
      'Dr. Pedro Henrique Santos',
    ],
  }

  const emails = {
    patient: ['maria.silva@email.com', 'joao.pereira@email.com', 'ana.costa@email.com'],
    professional: ['dr.carlos@clinica.com', 'dra.maria@clinica.com', 'dr.pedro@clinica.com'],
  }

  const selectedName = names[type][Math.floor(Math.random() * names[type].length)]
  const selectedEmail = emails[type][Math.floor(Math.random() * emails[type].length)]

  return {
    id: `${type}-${Math.random().toString(36).substr(2, 9)}`,
    name: selectedName,
    email: selectedEmail,
    phone: '+55119' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
    dateOfBirth: generateRandomDate(1950, 2000),
    cpf: generateRandomCPF(),
    address: generateRandomAddress(),
    city: generateRandomCity(),
    state: generateRandomState(),
    zipCode: generateRandomCEP(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function createMockProfessional(specialty: string): MockProfessional {
  const specialties = {
    dermatologist: 'Dermatologia',
    plastic_surgeon: 'Cirurgia Plástica',
    aesthetic_nurse: 'Enfermagem Estética',
  }

  const names = {
    dermatologist: 'Dr. Carlos Roberto Silva',
    plastic_surgeon: 'Dra. Maria Fernanda Costa',
    aesthetic_nurse: 'Dra. Ana Paula Santos',
  }

  const crms = {
    dermatologist: '123456',
    plastic_surgeon: '789012',
    aesthetic_nurse: '345678',
  }

  return {
    id: `prof-${Math.random().toString(36).substr(2, 9)}`,
    name: names[specialty as keyof typeof names],
    email: `${specialty}@clinica.com`,
    phone: '+55119' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'),
    specialty: specialties[specialty as keyof typeof specialties],
    crm: crms[specialty as keyof typeof crms],
    anvisaRegistration: `ANVISA${Math.floor(Math.random() * 10000000000)}`,
    rating: Math.round((4 + Math.random()) * 10) / 10,
    experience: Math.floor(Math.random() * 20) + 5,
    bio: generateProfessionalBio(specialty),
    photo: `https://example.com/photos/${specialty}.jpg`,
    available: Math.random() > 0.2,
  }
}

export function createMockProcedure(type: string): MockProcedure {
  const procedures = {
    botox: {
      name: 'Toxina Botulínica',
      description: 'Redução de rugas de expressão e linhas finas',
      category: 'facial',
      duration: 30,
      price: 1200,
      anvisaRequired: true,
      anvisaRegistration: '1234567890123',
      contraindications: ['Gravidez', 'Aleitamento', 'Doenças neuromusculares'],
      benefits: ['Redução de rugas', 'Aparência mais jovem', 'Resultados naturais'],
      recoveryTime: 1,
      sessionsRecommended: 1,
    },
    hyaluronic_acid: {
      name: 'Ácido Hialurônico',
      description: 'Preenchimento facial e volume labial',
      category: 'facial',
      duration: 45,
      price: 1500,
      anvisaRequired: true,
      anvisaRegistration: '2345678901234',
      contraindications: ['Alergia ao produto', 'Infecções ativas', 'Gravidez'],
      benefits: ['Volume facial', 'Hidratação', 'Contorno facial'],
      recoveryTime: 2,
      sessionsRecommended: 1,
    },
    chemical_peeling: {
      name: 'Peeling Químico',
      description: 'Renovação celular e tratamento de manchas',
      category: 'facial',
      duration: 60,
      price: 800,
      anvisaRequired: false,
      contraindications: ['Peles sensíveis', 'Rosácea', 'Exposição solar recente'],
      benefits: ['Pele uniforme', 'Redução de manchas', 'Textura melhorada'],
      recoveryTime: 3,
      sessionsRecommended: 4,
    },
    laser_hair_removal: {
      name: 'Depilação a Laser',
      description: 'Remoção definitiva de pelos',
      category: 'corporal',
      duration: 90,
      price: 200,
      anvisaRequired: true,
      anvisaRegistration: '3456789012345',
      contraindications: ['Pele bronzeada', 'Certos medicamentos', 'Histórico de queloides'],
      benefits: ['Remoção permanente', 'Pele lisa', 'Economia de tempo'],
      recoveryTime: 1,
      sessionsRecommended: 8,
    },
  }

  const procedure = procedures[type as keyof typeof procedures]

  return {
    id: `procedure-${Math.random().toString(36).substr(2, 9)}`,
    ...procedure,
  }
}

export function createMockTreatmentPackage(type: string): MockTreatmentPackage {
  const packages = {
    botox_package: {
      name: 'Pacote de Toxina Botulínica',
      description: '3 sessões de toxina botulínica com desconto especial',
      sessions: 3,
      totalPrice: 3600,
      discountPercentage: 0,
      duration: 30,
      category: 'facial',
      procedures: ['botox'],
      includes: ['Avaliação prévia', 'Anestésico local', 'Acompanhamento pós-procedimento'],
      validFor: 365,
    },
    facial_package: {
      name: 'Pacote de Tratamento Facial',
      description: 'Pacote completo para rejuvenescimento facial',
      sessions: 4,
      totalPrice: 4800,
      discountPercentage: 15,
      duration: 120,
      category: 'facial',
      procedures: ['botox', 'hyaluronic_acid', 'chemical_peeling'],
      includes: ['Limpeza de pele', 'Hidratação', 'Protetor solar'],
      validFor: 180,
    },
    anti_aging_package: {
      name: 'Pacote Anti-Idade Premium',
      description: 'Tratamento completo anti-envelhecimento',
      sessions: 6,
      totalPrice: 8400,
      discountPercentage: 20,
      duration: 180,
      category: 'facial',
      procedures: ['botox', 'hyaluronic_acid', 'chemical_peeling', 'laser_hair_removal'],
      includes: ['Todos os procedimentos', 'Produtos pós-tratamento', 'Manutenção mensal'],
      validFor: 365,
    },
  }

  const packageData = packages[type as keyof typeof packages]

  return {
    id: `package-${Math.random().toString(36).substr(2, 9)}`,
    ...packageData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function createMockAppointment(
  type: 'consultation' | 'treatment' | 'follow_up',
): MockAppointment {
  const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'] as const

  return {
    id: `appointment-${Math.random().toString(36).substr(2, 9)}`,
    patientId: 'patient-123',
    professionalId: 'prof-123',
    procedureId: 'procedure-123',
    packageId: type === 'treatment' ? 'package-123' : undefined,
    date: generateRandomDate(2024, 2025),
    time: generateRandomTime(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    price: type === 'consultation' ? 200 : type === 'treatment' ? 1200 : 150,
    paid: Math.random() > 0.3,
    notes: type === 'consultation'
      ? 'Avaliação inicial'
      : type === 'treatment'
      ? 'Sessão de tratamento'
      : 'Acompanhamento pós-tratamento',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function createMockPhotoAssessment(
  type: 'facial_analysis' | 'body_analysis' | 'progress_tracking',
): MockPhotoAssessment {
  const skinTypes = ['Normal', 'Seca', 'Oleosa', 'Mista', 'Sensível']
  const concerns = [
    'Rugas finas',
    'Linhas de expressão',
    'Manchas',
    'Poros dilatados',
    'Flacidez',
    'Vermelhidão',
    'Acne',
    'Textura irregular',
  ]

  const recommendations = [
    'Hidratação diária',
    'Protetor solar SPF 50+',
    'Ácido retinoico',
    'Vitamina C',
    'Peeling suave',
    'Toxina botulínica',
    'Preenchimento',
  ]

  return {
    id: `assessment-${Math.random().toString(36).substr(2, 9)}`,
    patientId: 'patient-123',
    type,
    photos: [
      'https://example.com/photos/frontal.jpg',
      'https://example.com/photos/perfil.jpg',
      'https://example.com/photos/45graus.jpg',
    ],
    analysis: {
      skinType: skinTypes[Math.floor(Math.random() * skinTypes.length)],
      concerns: concerns.sort(() => Math.random() - 0.5).slice(0, 3),
      recommendations: recommendations.sort(() => Math.random() - 0.5).slice(0, 4),
      score: Math.floor(Math.random() * 40) + 60, // 60-100
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// Test Data Manager class
export class TestDataManager {
  private testData: {
    users: MockUser[]
    professionals: MockProfessional[]
    procedures: MockProcedure[]
    packages: MockTreatmentPackage[]
    appointments: MockAppointment[]
    assessments: MockPhotoAssessment[]
  } = {
    users: [],
    professionals: [],
    procedures: [],
    packages: [],
    appointments: [],
    assessments: [],
  }

  async setupTestData(): Promise<void> {
    // Generate test data
    this.testData = {
      users: [
        createMockUser('patient'),
        createMockUser('patient'),
        createMockUser('professional'),
      ],
      professionals: [
        createMockProfessional('dermatologist'),
        createMockProfessional('plastic_surgeon'),
        createMockProfessional('aesthetic_nurse'),
      ],
      procedures: [
        createMockProcedure('botox'),
        createMockProcedure('hyaluronic_acid'),
        createMockProcedure('chemical_peeling'),
        createMockProcedure('laser_hair_removal'),
      ],
      packages: [
        createMockTreatmentPackage('botox_package'),
        createMockTreatmentPackage('facial_package'),
        createMockTreatmentPackage('anti_aging_package'),
      ],
      appointments: [
        createMockAppointment('consultation'),
        createMockAppointment('treatment'),
        createMockAppointment('follow_up'),
      ],
      assessments: [
        createMockPhotoAssessment('facial_analysis'),
        createMockPhotoAssessment('progress_tracking'),
      ],
    }
  }

  async cleanupTestData(): Promise<void> {
    this.testData = {
      users: [],
      professionals: [],
      procedures: [],
      packages: [],
      appointments: [],
      assessments: [],
    }
  }

  getUser(type?: 'patient' | 'professional'): MockUser {
    const users = type
      ? this.testData.users.filter((u) => u.id.includes(type))
      : this.testData.users
    return users[Math.floor(Math.random() * users.length)]
  }

  getProfessional(specialty?: string): MockProfessional {
    const professionals = specialty
      ? this.testData.professionals.filter((p) => p.specialty === specialty)
      : this.testData.professionals
    return professionals[Math.floor(Math.random() * professionals.length)]
  }

  getProcedure(category?: string): MockProcedure {
    const procedures = category
      ? this.testData.procedures.filter((p) => p.category === category)
      : this.testData.procedures
    return procedures[Math.floor(Math.random() * procedures.length)]
  }

  getPackage(category?: string): MockTreatmentPackage {
    const packages = category
      ? this.testData.packages.filter((p) => p.category === category)
      : this.testData.packages
    return packages[Math.floor(Math.random() * packages.length)]
  }

  getAppointment(status?: MockAppointment['status']): MockAppointment {
    const appointments = status
      ? this.testData.appointments.filter((a) => a.status === status)
      : this.testData.appointments
    return appointments[Math.floor(Math.random() * appointments.length)]
  }

  getAssessment(type?: MockPhotoAssessment['type']): MockPhotoAssessment {
    const assessments = type
      ? this.testData.assessments.filter((a) => a.type === type)
      : this.testData.assessments
    return assessments[Math.floor(Math.random() * assessments.length)]
  }

  getAllData() {
    return { ...this.testData }
  }
}

// Helper functions
function generateRandomDate(startYear: number, endYear: number): string {
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear
  const month = Math.floor(Math.random() * 12) + 1
  const day = Math.floor(Math.random() * 28) + 1
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

function generateRandomTime(): string {
  const hour = Math.floor(Math.random() * 12) + 8 // 8-19
  const minute = Math.random() < 0.5 ? '00' : '30'
  return `${hour}:${minute}`
}

function generateRandomCPF(): string {
  const digits = Array(9).fill(null).map(() => Math.floor(Math.random() * 10))

  // Calculate CPF verification digits
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i)
  }
  const digit1 = 11 - (sum % 11)
  digits.push(digit1 > 9 ? 0 : digit1)

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i)
  }
  const digit2 = 11 - (sum % 11)
  digits.push(digit2 > 9 ? 0 : digit2)

  return `${digits.slice(0, 3).join('')}.${digits.slice(3, 6).join('')}.${
    digits.slice(6, 9).join('')
  }-${digits.slice(9).join('')}`
}

function generateRandomAddress(): string {
  const streets = ['Rua das Flores', 'Avenida Paulista', 'Rua Augusta', 'Rua Oscar Freire']
  const numbers = Array(1000).fill(null).map((_, i) => i + 1)
  return `${streets[Math.floor(Math.random() * streets.length)]}, ${
    numbers[Math.floor(Math.random() * numbers.length)]
  }`
}

function generateRandomCity(): string {
  const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre', 'Curitiba']
  return cities[Math.floor(Math.random() * cities.length)]
}

function generateRandomState(): string {
  const states = ['SP', 'RJ', 'MG', 'RS', 'PR']
  return states[Math.floor(Math.random() * states.length)]
}

function generateRandomCEP(): string {
  const digits = Array(8).fill(null).map(() => Math.floor(Math.random() * 10))
  return `${digits.slice(0, 5).join('')}-${digits.slice(5).join('')}`
}

function generateProfessionalBio(specialty: string): string {
  const bios = {
    dermatologist:
      'Médico dermatologista com 15 anos de experiência em tratamentos estéticos faciais e corporais. Especialista em toxina botulínica e preenchimentos.',
    plastic_surgeon:
      'Cirurgião plástico especializado em procedimentos estéticos e reconstrutivos. Membro da Sociedade Brasileira de Cirurgia Plástica.',
    aesthetic_nurse:
      'Enfermeira estética com foco em procedimentos minimamente invasivos e acompanhamento pós-operatório.',
  }

  return bios[specialty as keyof typeof bios]
    || 'Profissional da área estética com ampla experiência.'
}

// Export test data utilities
export const TestData = {
  createMockUser,
  createMockProfessional,
  createMockProcedure,
  createMockTreatmentPackage,
  createMockAppointment,
  createMockPhotoAssessment,
  TestDataManager,
}
