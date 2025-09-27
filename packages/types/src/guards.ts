import { Patient, Professional } from './index.js'

export const isPatient = (user: Patient | Professional): user is Patient => {
  return 'email' in user && 'medicalHistory' in user
}

export const isProfessional = (user: Patient | Professional): user is Professional => {
  return 'specialty' in user && 'licenseNumber' in user
}

export const hasConsent = (patient: Partial<Patient>): patient is Patient => {
  return !!patient.consentGiven
}
