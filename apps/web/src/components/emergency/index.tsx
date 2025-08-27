/**
 * Emergency System Components - Main Exports
 * Phase 3.4: Mobile Emergency Interface Implementation
 * 
 * Complete emergency interface system for Brazilian healthcare
 * with SAMU 192 integration, critical data access, and compliance
 */

// Core emergency components
export {
  EmergencyPatientCard,
  sampleEmergencyPatient,
  type EmergencyPatientCardProps
} from './EmergencyPatientCard';

export {
  CriticalAllergiesPanel,
  sampleCriticalAllergies,
  type CriticalAllergiesPanelProps
} from './CriticalAllergiesPanel';

export {
  EmergencyMedicationsList,
  sampleEmergencyMedications,
  type EmergencyMedicationsListProps
} from './EmergencyMedicationsList';

export {
  SAMUDialButton,
  sampleSAMUScenarios,
  type SAMUDialButtonProps
} from './SAMUDialButton';

export {
  CriticalAlertOverlay,
  sampleCriticalAlerts,
  type CriticalAlertOverlayProps
} from './CriticalAlertOverlay';

// Re-export emergency types for convenience
export type {
  // Core emergency types
  EmergencyAccessLevel,
  EmergencySeverity,
  EmergencyType,
  AlertType,
  ContrastMode,
  PerformanceMode,
  ScreenReaderMode,
  
  // Patient data types
  CriticalAllergy,
  EmergencyMedication,
  LifeCriticalCondition,
  EmergencyContact,
  DoctorContact,
  EmergencyPatientData,
  
  // Location and services
  GPSCoordinates,
  HospitalInfo,
  SAMUEmergencyCall,
  EmergencyEscalation,
  
  // Alert system
  CriticalAlert,
  EmergencyProtocol,
  EmergencyStep,
  
  // Accessibility and performance
  EmergencyAccessibilityConfig,
  VoiceCommand,
  EmergencyCacheConfig,
  CachedEmergencyData,
  
  // Compliance and audit
  EmergencyAuditLog,
  EmergencyIncident,
  BrazilianEmergencyServices,
  CFMCompliance,
  ANVISAMedicationInfo,
  LGPDEmergencyConsent,
  
  // Context and API
  EmergencyContextValue,
  EmergencyAPIResponse,
  EmergencyPatientResponse,
  SAMUCallResponse
} from '@/types/emergency';

// Emergency system utilities and constants
export const EMERGENCY_CONSTANTS = {
  // Brazilian emergency numbers
  SAMU: '192',
  BOMBEIROS: '193',
  POLICIA_MILITAR: '190',
  
  // Response time targets (milliseconds)
  CRITICAL_DATA_ACCESS_TIME: 100,
  EMERGENCY_ALERT_TIME: 200,
  SAMU_CONNECTION_TIME: 2000,
  
  // Touch target sizes (pixels)
  TOUCH_TARGET_EMERGENCY: 64,
  TOUCH_TARGET_STANDARD: 56,
  TOUCH_TARGET_MINIMUM: 44,
  
  // Accessibility contrast ratios
  CONTRAST_EMERGENCY: 21, // 21:1
  CONTRAST_HIGH: 7,       // 7:1
  CONTRAST_STANDARD: 4.5, // 4.5:1
  
  // Cache limits
  MAX_CACHED_PATIENTS: 200,
  CACHE_RETENTION_DAYS: 7,
  MAX_OFFLINE_ALERTS: 50,
  
  // Auto-escalation defaults (minutes)
  ESCALATION_CRITICAL: 2,
  ESCALATION_SEVERE: 5,
  ESCALATION_MODERATE: 15,
  
  // Audio alert patterns (milliseconds)
  VIBRATION_CRITICAL: [500, 200, 500, 200, 1000, 500, 500],
  VIBRATION_SEVERE: [300, 100, 300, 100, 300],
  VIBRATION_MODERATE: [200, 100, 200]
} as const;

// Emergency severity color mappings for TweakCN theme
export const EMERGENCY_COLORS = {
  life_threatening: {
    bg: 'bg-red-600 dark:bg-red-700',
    border: 'border-red-300 dark:border-red-800',
    text: 'text-red-900 dark:text-red-100',
    accent: 'bg-red-100 dark:bg-red-950'
  },
  severe: {
    bg: 'bg-orange-500 dark:bg-orange-600',
    border: 'border-orange-300 dark:border-orange-800',
    text: 'text-orange-900 dark:text-orange-100',
    accent: 'bg-orange-100 dark:bg-orange-950'
  },
  moderate: {
    bg: 'bg-yellow-500 dark:bg-yellow-600',
    border: 'border-yellow-300 dark:border-yellow-800',
    text: 'text-yellow-900 dark:text-yellow-100',
    accent: 'bg-yellow-100 dark:bg-yellow-950'
  },
  informational: {
    bg: 'bg-blue-500 dark:bg-blue-600',
    border: 'border-blue-300 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    accent: 'bg-blue-100 dark:bg-blue-950'
  }
} as const;

// Brazilian healthcare specialties (CFM)
export const BRAZILIAN_MEDICAL_SPECIALTIES = [
  'Cardiologia',
  'Neurologia',
  'Oncologia',
  'Pediatria',
  'Geriatria',
  'Medicina de Emergência',
  'Medicina Intensiva',
  'Anestesiologia',
  'Cirurgia Geral',
  'Ortopedia',
  'Dermatologia',
  'Ginecologia e Obstetrícia',
  'Psiquiatria',
  'Oftalmologia',
  'Otorrinolaringologia'
] as const;

// ANVISA controlled substance classifications
export const ANVISA_CONTROLLED_CLASSES = {
  A1: 'Psicotrópicos - Lista A1 (Entorpecentes)',
  A2: 'Psicotrópicos - Lista A2 (Entorpecentes)',
  A3: 'Psicotrópicos - Lista A3 (Psicotrópicos)',
  B1: 'Psicotrópicos - Lista B1 (Psicotrópicos)',
  B2: 'Psicotrópicos - Lista B2 (Psicotrópicos anorexígenos)',
  C1: 'Outras Substâncias Sujeitas a Controle - Lista C1',
  C2: 'Outras Substâncias Sujeitas a Controle - Lista C2',
  C3: 'Outras Substâncias Sujeitas a Controle - Lista C3',
  C4: 'Outras Substâncias Sujeitas a Controle - Lista C4 (Anti-retrovirais)',
  C5: 'Outras Substâncias Sujeitas a Controle - Lista C5 (Anabolizantes)'
} as const;

// Emergency protocol templates
export const EMERGENCY_PROTOCOL_TEMPLATES = {
  anaphylaxis: {
    name: 'Protocolo de Choque Anafilático',
    timeLimit: 5,
    critical: true,
    steps: [
      'Suspender medicação causadora',
      'Aplicar Epinefrina IM',
      'Estabelecer via aérea',
      'Acesso venoso',
      'Corticoide EV',
      'Anti-histamínico EV'
    ]
  },
  cardiac_arrest: {
    name: 'Protocolo de Parada Cardiorrespiratória',
    timeLimit: 2,
    critical: true,
    steps: [
      'Verificar responsividade',
      'Iniciar RCP (30:2)',
      'Desfibrilar se indicado',
      'Epinefrina 1mg EV',
      'Continuar RCP',
      'Investigar causa reversível'
    ]
  },
  respiratory_failure: {
    name: 'Protocolo de Insuficiência Respiratória',
    timeLimit: 3,
    critical: true,
    steps: [
      'Avaliação ABCDE',
      'Oxigenoterapia',
      'Via aérea definitiva se necessário',
      'Ventilação assistida',
      'Investigar causa',
      'Suporte específico'
    ]
  }
} as const;

// Quick access emergency data for development
export const DEVELOPMENT_EMERGENCY_DATA = {
  // Test patient data
  testPatient: {
    id: 'TEST-001',
    name: 'Paciente Teste',
    age: 45,
    bloodType: 'A+',
    criticalAllergies: ['Penicilina', 'Contraste'],
    criticalMedications: ['Varfarina', 'Metformina'],
    emergencyContacts: [
      { name: 'João Silva', phone: '(11) 99999-9999', relationship: 'Cônjuge' }
    ]
  },
  
  // Test GPS location (São Paulo)
  testLocation: {
    latitude: -23.5505,
    longitude: -46.6333,
    accuracy: 10,
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    cep: '01310-100'
  },
  
  // Sample SAMU call data
  sampleSAMUCall: {
    emergencyType: 'cardiac' as EmergencyType,
    location: 'Clínica NeonPro - Av. Paulista, 1000',
    criticalInfo: 'Paciente 67 anos, FA, uso de Varfarina, possível IAM'
  }
} as const;

/**
 * Emergency System Component Guidelines
 * 
 * Performance Requirements:
 * - Critical data access: <100ms
 * - Emergency alerts: <200ms display time
 * - Touch targets: minimum 56px (emergency: 64px)
 * - Contrast ratio: minimum 7:1 (emergency: 21:1)
 * 
 * Accessibility Requirements:
 * - WCAG 2.1 AAA+ compliance
 * - Portuguese screen reader optimization
 * - One-handed emergency operation
 * - Audio/vibration alerts for critical situations
 * - Emergency high contrast mode
 * 
 * Brazilian Compliance:
 * - LGPD compliant emergency data handling
 * - CFM medical license validation
 * - ANVISA controlled substance tracking
 * - Complete audit trail for emergencies
 * 
 * Mobile Optimization:
 * - One-thumb operation for all critical functions
 * - Offline emergency mode with cached data
 * - Brazilian network condition optimization
 * - Emergency battery saving mode
 * 
 * Integration Points:
 * - TweakCN NEONPRO theme system
 * - Supabase real-time subscriptions
 * - Brazilian emergency services (SAMU 192)
 * - Hospital network notifications
 */