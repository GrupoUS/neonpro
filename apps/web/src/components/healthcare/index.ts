// Healthcare-specific Components Export

// Scheduling and Appointments
export { TreatmentScheduler } from './treatment-scheduler'
export type { 
  TreatmentSchedulerProps,
  TreatmentTimeSlot,
  SchedulerState
} from './treatment-scheduler'

// Patient Records Management
export { PatientRecordsViewer } from './patient-records-viewer'
export type { 
  PatientRecordsViewerProps,
  RecordTab
} from './patient-records-viewer'

// LGPD Compliance
export { LGPDConsentManager } from './lgpd-consent-manager'
export type { 
  LGPDConsentManagerProps,
  ConsentPurpose,
  ConsentFormState
} from './lgpd-consent-manager'

// Dashboard and Analytics
export { HealthcareDashboard } from './healthcare-dashboard'
export type { 
  HealthcareDashboardProps,
  DashboardWidgets,
  TimeFilter
} from './healthcare-dashboard'

// Emergency Management
export { EmergencyAlertSystem } from './emergency-alert-system'
export type { 
  EmergencyAlertSystemProps,
  AlertFormState,
  EmergencyContact
} from './emergency-alert-system'

// Re-export types from core types
export type {
  // Patient and Medical Records
  PatientData,
  BrazilianPersonalInfo,
  BrazilianAddress,
  EmergencyContact,
  MedicalHistory,
  
  // Treatments and Sessions
  AestheticTreatment,
  TreatmentSession,
  TreatmentProgress,
  
  // LGPD and Compliance
  LGPDConsent,
  LGPDConsentRecord,
  LGPDDataAccess,
  LGPDDataTypes,
  
  // Emergency System
  EmergencyAlert,
  EmergencyResponse,
  EmergencyType,
  EmergencySeverity,
  
  // Healthcare Contexts
  HealthcareContext,
  HealthcareValidationLevel,
  
  // Dashboard and Analytics
  HealthcareDashboardMetrics,
  TreatmentPopularity,
  SessionMetrics,
  
  // Validation and Forms
  HealthcareFormValidator,
  FormFieldError,
  FormValidationResult,
  HealthcareFormFieldConfig
} from '@/types/healthcare'

// Healthcare Component Composition
export const HealthcareComponents = {
  // Core Healthcare Workflows
  Scheduler: TreatmentScheduler,
  PatientRecords: PatientRecordsViewer,
  ConsentManager: LGPDConsentManager,
  Dashboard: HealthcareDashboard,
  EmergencySystem: EmergencyAlertSystem,
  
  // Common Patterns
  useEmergencyAlerts: () => {
    // Hook for emergency alert management
    const [alerts, setAlerts] = React.useState<EmergencyAlert[]>([])
    return { alerts, setAlerts }
  },
  
  usePatientRecords: (patientId?: string) => {
    // Hook for patient record management
    const [records, setRecords] = React.useState<PatientData | null>(null)
    return { records, setRecords }
  },
  
  useLGPDCompliance: () => {
    // Hook for LGPD compliance tracking
    const [consentRecords, setConsentRecords] = React.useState<LGPDConsentRecord[]>([])
    return { consentRecords, setConsentRecords }
  },
  
  useTreatmentScheduler: () => {
    // Hook for treatment scheduling
    const [sessions, setSessions] = React.useState<TreatmentSession[]>([])
    return { sessions, setSessions }
  }
}

// Default export for convenience
export default HealthcareComponents

// Version info for package management
export const HEALTHCARE_COMPONENTS_VERSION = '2.0.0'

// Component status and health check
export const HealthcareComponentStatus = {
  TreatmentScheduler: 'stable',
  PatientRecordsViewer: 'stable',
  LGPDConsentManager: 'stable',
  HealthcareDashboard: 'stable',
  EmergencyAlertSystem: 'stable',
  
  // Compliance information
  WCAG_Compliant: true,
  LGPD_Compliant: true,
  Healthcare_Standards: ['ANS 41', 'LGPD', 'HIPAA-Local'],
  
  // Browser compatibility
  Browser_Support: ['Chrome 90+', 'Firefox 88+', 'Safari 14+', 'Edge 90+'],
  
  // Mobile optimization
  Mobile_Optimized: true,
  Touch_Friendly: true,
  Responsive_Design: true
}