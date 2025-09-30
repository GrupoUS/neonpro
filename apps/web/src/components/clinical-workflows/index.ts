/**
 * Clinical Workflow Components Index
 * 
 * Exportação de todos os componentes de fluxo de trabalho clínico
 * para clínicas estéticas brasileiras
 * 
 * @module ClinicalWorkflows
 */

// Main Components
export { PatientIntakeFlow } from './PatientIntakeFlow'
export { ClinicalDocumentation } from './ClinicalDocumentation'
export { TreatmentWorkflow } from './TreatmentWorkflow'
export { StaffCoordination } from './StaffCoordination'
export { EmergencyIntegration } from './EmergencyIntegration'
export { MobileClinicalInterface } from './MobileClinicalInterface'

// Type definitions
export * from './types'

// Default exports for easy importing
export default {
  PatientIntakeFlow: require('./PatientIntakeFlow').default,
  ClinicalDocumentation: require('./ClinicalDocumentation').default,
  TreatmentWorkflow: require('./TreatmentWorkflow').default,
  StaffCoordination: require('./StaffCoordination').default,
  EmergencyIntegration: require('./EmergencyIntegration').default,
  MobileClinicalInterface: require('./MobileClinicalInterface').default
}

// Component metadata
export const CLINICAL_WORKFLOW_COMPONENTS = {
  PatientIntakeFlow: {
    name: 'PatientIntakeFlow',
    description: 'Fluxo de cadastro de pacientes com conformidade LGPD',
    category: 'patient-management',
    features: ['lgpd-compliance', 'mobile-first', 'accessibility', 'multi-step-form'],
    dependencies: ['@neonpro/ui', '@/types/healthcare']
  },
  ClinicalDocumentation: {
    name: 'ClinicalDocumentation',
    description: 'Sistema de documentação clínica com conformidade ANVISA',
    category: 'clinical-records',
    features: ['anvisa-compliance', 'file-attachments', 'real-time-collaboration', 'progress-tracking'],
    dependencies: ['@neonpro/ui', '@/types/healthcare']
  },
  TreatmentWorkflow: {
    name: 'TreatmentWorkflow',
    description: 'Fluxo de trabalho para procedimentos estéticos',
    category: 'treatment-management',
    features: ['treatment-planning', 'progress-tracking', 'anvisa-reporting', 'session-management'],
    dependencies: ['@neonpro/ui', '@/types/healthcare']
  },
  StaffCoordination: {
    name: 'StaffCoordination',
    description: 'Sistema de coordenação de equipe em tempo real',
    category: 'team-management',
    features: ['real-time-communication', 'task-assignment', 'staff-availability', 'dashboard'],
    dependencies: ['@neonpro/ui', '@/types/healthcare']
  },
  EmergencyIntegration: {
    name: 'EmergencyIntegration',
    description: 'Sistema de integração de emergência com protocolos brasileiros',
    category: 'emergency-response',
    features: ['emergency-protocols', 'quick-response', 'team-notification', 'emergency-calls'],
    dependencies: ['@neonpro/ui', '@/types/healthcare']
  },
  MobileClinicalInterface: {
    name: 'MobileClinicalInterface',
    description: 'Interface clínica otimizada para tablets e dispositivos móveis',
    category: 'mobile-interface',
    features: ['offline-capability', 'quick-actions', 'vital-signs', 'camera-integration'],
    dependencies: ['@neonpro/ui', '@/types/healthcare']
  }
}