import { Patient, HealthcareProfessional } from './healthcare.js'

export const isPatient = (user: Patient | HealthcareProfessional): user is Patient => {
  return 'cpf' in user && 'consent' in user
}

export const isProfessional = (user: Patient | HealthcareProfessional): user is HealthcareProfessional => {
  return 'crm' in user || 'coren' in user
}

export const hasConsent = (patient: Partial<Patient>): patient is Patient => {
  return !!patient.consent?.given
}
