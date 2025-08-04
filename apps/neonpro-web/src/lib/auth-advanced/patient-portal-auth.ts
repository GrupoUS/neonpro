/**
 * Patient Portal Authentication - Temporary
 */
export function authenticatePatient(email: string, cpf: string) {
  return { success: true, token: 'temp-token' };
}

export function validatePatientSession(token: string) {
  return { valid: true, patient_id: 'temp-id' };
}