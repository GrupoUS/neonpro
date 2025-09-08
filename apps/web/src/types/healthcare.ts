// Patient-related types
export interface Patient {
  id: string
  name: string
  email?: string
  phone: string
  cpf: string
  birthDate: string
  address?: PatientAddress
  clinicId: string
  isActive: boolean
  lgpdConsent: ConsentStatus
  createdAt: string
  updatedAt: string
}

export interface PatientAddress {
  street: string
  city: string
  state: string
  zipCode: string
  complement?: string
}

export interface ConsentStatus {
  dataProcessing: boolean
  marketing: boolean
  research: boolean
  lastUpdated: string
}

// Appointment-related types
export interface Appointment {
  id: string
  patientId: string
  patient?: Patient
  professionalId: string
  professional?: Professional
  serviceId: string
  service?: Service
  scheduledAt: string
  duration: number
  status:
    | 'scheduled'
    | 'confirmed'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'no_show'
  notes?: string
  clinicId: string
  createdAt: string
  updatedAt: string
}

// Professional-related types
export interface Professional {
  id: string
  name: string
  email: string
  phone: string
  specialties: string[]
  clinicId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Service-related types
export interface Service {
  id: string
  name: string
  description?: string
  duration: number
  price: number
  category: string
  clinicId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
