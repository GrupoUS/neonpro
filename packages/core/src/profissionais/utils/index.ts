// Professionals utilities
import { ProfessionalSpecialty } from '../types'

export const specialtyLabels: Record<ProfessionalSpecialty, string> = {
  [ProfessionalSpecialty.DERMATOLOGIST]: 'Dermatologista',
  [ProfessionalSpecialty.PLASTIC_SURGEON]: 'Cirurgião Plástico',
  [ProfessionalSpecialty.AESTHETIC_PHYSICIAN]: 'Médico Esteta',
  [ProfessionalSpecialty.BEAUTY_THERAPIST]: 'Terapeuta Estético',
  [ProfessionalSpecialty.NURSE_AESTHETICIAN]: 'Enfermeiro Esteta',
  [ProfessionalSpecialty.MAKEUP_ARTIST]: 'Maquiador'
}

export const getProfessionalCredentials = (specialty: ProfessionalSpecialty): string => {
  const credentials = {
    [ProfessionalSpecialty.DERMATOLOGIST]: 'CRM',
    [ProfessionalSpecialty.PLASTIC_SURGEON]: 'CRM',
    [ProfessionalSpecialty.AESTHETIC_PHYSICIAN]: 'CRM',
    [ProfessionalSpecialty.BEAUTY_THERAPIST]: 'COREN/ANVISA',
    [ProfessionalSpecialty.NURSE_AESTHETICIAN]: 'COREN',
    [ProfessionalSpecialty.MAKEUP_ARTIST]: 'Certificação Profissional'
  }
  
  return credentials[specialty] || 'Registro Profissional'
}