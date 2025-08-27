/**
 * Emergency System Type Definitions
 * Phase 3.4: Mobile Emergency Interface Implementation
 * Brazilian Healthcare Emergency Services Integration
 */

// =============================================================================
// CORE EMERGENCY TYPES
// =============================================================================

export type EmergencyAccessLevel = 'emergency' | 'icu' | 'ambulance' | 'hospital' | 'clinic';
export type EmergencySeverity = 'life_threatening' | 'severe' | 'moderate' | 'informational';
export type EmergencyType = 'cardiac' | 'respiratory' | 'trauma' | 'allergic_reaction' | 'neurological' | 'poisoning' | 'other';
export type AlertType = 'allergy' | 'medication' | 'procedure' | 'protocol' | 'system';
export type ContrastMode = 'normal' | 'high' | 'emergency_maximum';
export type PerformanceMode = 'normal' | 'emergency_optimized';
export type ScreenReaderMode = 'portuguese' | 'emergency_mode';

// =============================================================================
// PATIENT EMERGENCY DATA
// =============================================================================

export interface CriticalAllergy {
  id: string;
  allergen: string;
  severity: 'fatal' | 'severe' | 'moderate';
  reaction: string;
  treatment: string;
  lastUpdated: Date;
  verified: boolean;
  source: 'patient' | 'family' | 'medical_record' | 'emergency';
}

export interface EmergencyMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: Date;
  endDate?: Date;
  critical: boolean;
  interactions: string[];
  contraindications: string[];
  emergencyNotes?: string;
}

export interface LifeCriticalCondition {
  id: string;
  condition: string;
  severity: 'critical' | 'severe' | 'moderate';
  onsetDate: Date;
  status: 'active' | 'managed' | 'resolved';
  treatment: string;
  emergencyProtocol?: string;
  lastUpdated: Date;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  address?: string;
  priority: 1 | 2 | 3; // 1 = primary, 2 = secondary, 3 = tertiary
  availableHours?: string;
  notes?: string;
  lastContacted?: Date;
}

export interface DoctorContact {
  id: string;
  name: string;
  crm: string; // CFM registration number
  specialty: string;
  phone: string;
  emergencyPhone?: string;
  hospital?: string;
  available24h: boolean;
}

// =============================================================================
// EMERGENCY PATIENT DATA INTERFACE
// =============================================================================

export interface EmergencyPatientData {
  patientId: string;
  name: string;
  age: number;
  bloodType?: string;
  criticalInfo: {
    allergies: CriticalAllergy[];
    medications: EmergencyMedication[];
    medicalConditions: LifeCriticalCondition[];
    emergencyContacts: EmergencyContact[];
    lastUpdate: Date;
  };
  accessLevel: EmergencyAccessLevel;
  emergencyNotes?: string;
  dnr?: boolean; // Do Not Resuscitate
  organDonor?: boolean;
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    coverage: string;
  };
}

// =============================================================================
// GPS AND LOCATION SERVICES
// =============================================================================

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  address?: string;
  cep?: string; // Brazilian postal code
  city?: string;
  state?: string;
}

export interface HospitalInfo {
  id: string;
  name: string;
  address: string;
  coordinates: GPSCoordinates;
  phone: string;
  emergencyPhone: string;
  capabilities: string[];
  availableBeds?: number;
  estimatedTime?: number; // minutes
  cnes: string; // Brazilian hospital registration
}

// =============================================================================
// SAMU INTEGRATION
// =============================================================================

export interface SAMUEmergencyCall {
  id: string;
  patientId: string;
  location: GPSCoordinates;
  emergencyType: EmergencyType;
  severity: EmergencySeverity;
  criticalInfo: string; // Pre-formatted for SAMU operators
  responsibleDoctor?: DoctorContact;
  callerInfo: {
    name: string;
    phone: string;
    relationship: string;
  };
  timestamp: Date;
  estimatedArrivalTime?: number;
  samuUnit?: string;
  status: 'calling' | 'dispatched' | 'en_route' | 'arrived' | 'cancelled';
}

export interface EmergencyEscalation {
  id: string;
  patientId: string;
  triggerEvent: string;
  escalationLevel: 1 | 2 | 3 | 4; // 1=doctor, 2=clinic, 3=hospital, 4=SAMU
  contacts: DoctorContact[];
  timestamp: Date;
  status: 'pending' | 'contacted' | 'responded' | 'escalated' | 'resolved';
  responseTime?: number; // seconds
}

// =============================================================================
// CRITICAL ALERTS SYSTEM
// =============================================================================

export interface CriticalAlert {
  id: string;
  patientId: string;
  severity: EmergencySeverity;
  type: AlertType;
  title: string;
  message: string;
  actionRequired: boolean;
  acknowledgmentRequired: boolean;
  emergencyProtocol?: EmergencyProtocol;
  autoEscalate?: number; // minutes before auto-escalation
  timestamp: Date;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved?: boolean;
  resolvedAt?: Date;
  escalated?: boolean;
}

export interface EmergencyProtocol {
  id: string;
  name: string;
  condition: string;
  steps: EmergencyStep[];
  timeLimit?: number; // minutes
  requiredPersonnel: string[];
  equipment: string[];
  medications?: string[];
  contraindications: string[];
  lastUpdated: Date;
  source: 'cfm' | 'samu' | 'hospital' | 'international';
}

export interface EmergencyStep {
  stepNumber: number;
  instruction: string;
  timeLimit?: number; // seconds
  critical: boolean;
  verification?: string;
  alternatives?: string[];
  images?: string[];
  videos?: string[];
}

// =============================================================================
// EMERGENCY ACCESSIBILITY
// =============================================================================

export interface EmergencyAccessibilityConfig {
  contrastMode: ContrastMode;
  voiceCommands: boolean;
  screenReader: ScreenReaderMode;
  oneHandedMode: boolean;
  performanceMode: PerformanceMode;
  offlineMode: boolean;
  fontSize: 'normal' | 'large' | 'extra_large';
  soundAlerts: boolean;
  vibrationAlerts: boolean;
  emergencyShortcuts: boolean;
  autoReadAlerts: boolean;
}

export interface VoiceCommand {
  phrase: string;
  action: string;
  parameters?: Record<string, any>;
  requiredPermission?: EmergencyAccessLevel;
  confirmation?: boolean;
}

// =============================================================================
// PERFORMANCE AND CACHING
// =============================================================================

export interface EmergencyCacheConfig {
  maxPatients: number;
  maxAge: number; // milliseconds
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  syncInterval: number; // milliseconds
  offlineMode: boolean;
}

export interface CachedEmergencyData {
  patientId: string;
  data: EmergencyPatientData;
  cachedAt: Date;
  lastSync: Date;
  syncStatus: 'synced' | 'pending' | 'error' | 'offline';
  priority: 'high' | 'medium' | 'low';
  accessCount: number;
}

// =============================================================================
// AUDIT TRAIL AND COMPLIANCE
// =============================================================================

export interface EmergencyAuditLog {
  id: string;
  patientId: string;
  userId: string;
  action: string;
  details: string;
  severity: EmergencySeverity;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: GPSCoordinates;
  compliance: {
    lgpd: boolean;
    cfm: boolean;
    hipaa?: boolean;
  };
}

export interface EmergencyIncident {
  id: string;
  patientId: string;
  type: EmergencyType;
  severity: EmergencySeverity;
  startTime: Date;
  endTime?: Date;
  location: GPSCoordinates;
  personnel: string[];
  actions: string[];
  outcome: string;
  samuInvolved: boolean;
  hospitalTransfer?: string;
  auditLogs: EmergencyAuditLog[];
  compliance: {
    reportedToCFM: boolean;
    reportedToANVISA: boolean;
    lgpdCompliant: boolean;
  };
}

// =============================================================================
// COMPONENT PROPS INTERFACES
// =============================================================================

export interface EmergencyPatientCardProps {
  patientData: EmergencyPatientData;
  accessLevel: EmergencyAccessLevel;
  onEmergencyCall?: (patientId: string) => void;
  onViewDetails?: (patientId: string) => void;
  className?: string;
  compact?: boolean;
  showActions?: boolean;
  emergencyMode?: boolean;
}

export interface CriticalAllergiesPanelProps {
  allergies: CriticalAllergy[];
  onAllergyClick?: (allergy: CriticalAllergy) => void;
  className?: string;
  maxItems?: number;
  showAll?: boolean;
  emergencyMode?: boolean;
}

export interface EmergencyMedicationsListProps {
  medications: EmergencyMedication[];
  onMedicationClick?: (medication: EmergencyMedication) => void;
  onInteractionWarning?: (interactions: string[]) => void;
  className?: string;
  showInteractions?: boolean;
  emergencyMode?: boolean;
}

export interface SAMUDialButtonProps {
  patientData: EmergencyPatientData;
  emergencyType?: EmergencyType;
  location?: GPSCoordinates;
  onCallInitiated?: (callData: SAMUEmergencyCall) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'emergency';
  disabled?: boolean;
}

export interface CriticalAlertOverlayProps {
  alert: CriticalAlert;
  onAcknowledge: (alertId: string) => void;
  onEscalate: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  emergencyMode?: boolean;
  autoAcknowledge?: number; // seconds
}

// =============================================================================
// EMERGENCY CONTEXT AND HOOKS
// =============================================================================

export interface EmergencyContextValue {
  emergencyMode: boolean;
  accessLevel: EmergencyAccessLevel;
  currentPatient?: EmergencyPatientData;
  activeAlerts: CriticalAlert[];
  accessibility: EmergencyAccessibilityConfig;
  cacheStatus: 'online' | 'offline' | 'syncing' | 'error';
  setEmergencyMode: (enabled: boolean) => void;
  setAccessLevel: (level: EmergencyAccessLevel) => void;
  loadPatient: (patientId: string) => Promise<EmergencyPatientData | null>;
  createAlert: (alert: Omit<CriticalAlert, 'id' | 'timestamp'>) => void;
  acknowledgeAlert: (alertId: string) => void;
  updateAccessibility: (config: Partial<EmergencyAccessibilityConfig>) => void;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface EmergencyAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  responseTime: number; // milliseconds
  cached?: boolean;
  source?: 'database' | 'cache' | 'offline';
}

export interface EmergencyPatientResponse extends EmergencyAPIResponse<EmergencyPatientData> {
  cacheStatus: 'fresh' | 'stale' | 'offline';
  lastSync: Date;
}

export interface SAMUCallResponse extends EmergencyAPIResponse<SAMUEmergencyCall> {
  callId: string;
  estimatedResponse: number; // minutes
  samuUnit?: string;
}

// =============================================================================
// BRAZILIAN HEALTHCARE SPECIFIC TYPES
// =============================================================================

export interface BrazilianEmergencyServices {
  samu: {
    number: '192';
    available24h: true;
    coverage: 'national';
  };
  bombeiros: {
    number: '193';
    available24h: true;
    coverage: 'national';
  };
  policiaMillitar: {
    number: '190';
    available24h: true;
    coverage: 'national';
  };
}

export interface CFMCompliance {
  doctorCRM: string;
  specialtyCode: string;
  validUntil: Date;
  emergencyPermissions: string[];
  responsibilities: string[];
}

export interface ANVISAMedicationInfo {
  registrationNumber: string;
  controlled: boolean;
  controlClass?: 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5';
  prescriptionRequired: boolean;
  emergencyUse: boolean;
  contraindications: string[];
  interactions: string[];
}

export interface LGPDEmergencyConsent {
  patientId: string;
  emergencyConsent: boolean;
  consentDate: Date;
  consentType: 'explicit' | 'vital_interest' | 'legitimate_interest';
  dataCategories: string[];
  emergencyContacts: string[];
  validUntil?: Date;
}