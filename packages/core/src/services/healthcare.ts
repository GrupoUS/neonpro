export interface AestheticProcedure {
  id: string;
  name: string;
  procedureType: 'facial' | 'body' | 'laser';
  category: string;
  baseDuration: number;
  basePrice: number;
  recoveryPeriodDays: number;
  sessionsRequired: number;
}

export interface AestheticAppointment {
  id: string;
  patientId: string;
  professionalId: string;
  procedureDetails: AestheticProcedure;
  startTime: Date;
  endTime: Date;
  sessionNumber: number;
  totalSessions: number;
  recoveryBuffer: number;
  postProcedureInstructions: string[];
  assistantRequired: boolean;
}

export function validateAestheticProcedure(_procedure: AestheticProcedure) {
  return true; // Minimal stub
}

export function scheduleAestheticAppointment(_appointment: AestheticAppointment) {
  return { success: true }; // Minimal stub
}

export function getSchedulingPreferences() {
  return {}; // Minimal stub
}

export function generateFinancialReport() {
  return { report: 'generated' }; // Minimal stub
}

export function updateInventoryLevels() {
  return { updated: true }; // Minimal stub
}

export function sendPatientNotification() {
  return { sent: true }; // Minimal stub
}

export function createTreatmentPlan() {
  return { plan: 'created' }; // Minimal stub
}

export function coordinateMultiProfessionalTeam() {
  return { coordinated: true }; // Minimal stub
}

// For type-safety test stubs
export function someFunction(_id: string) {
  return { result: 'ok' }; // Minimal stub
}

export function validateProcedure(_procedure: unknown) {
  return true; // Minimal stub
}

export function someSchedulingFunction() {
  return {}; // Minimal stub
}
