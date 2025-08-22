/**
 * Team Coordination Types - Brazilian Healthcare Compliance
 * 
 * This file contains comprehensive TypeScript interfaces for team coordination
 * in Brazilian healthcare settings, including CFM licensing, CLT compliance,
 * LGPD privacy requirements, and ANVISA regulations.
 */

// ========== CORE ENUMS ==========

export type ProfessionalRole = 
  | 'medico'           // Medical Doctor (CFM required)
  | 'enfermeiro'       // Registered Nurse
  | 'tecnico'          // Healthcare Technician
  | 'administrativo'   // Administrative Staff
  | 'especialista'     // Medical Specialist
  | 'residente'        // Medical Resident
  | 'estagiario';      // Healthcare Intern

export type LicenseStatus = 
  | 'active'           // Active and valid
  | 'expired'          // Expired - needs renewal
  | 'suspended'        // Suspended by regulatory body
  | 'pending_renewal'  // Renewal in progress
  | 'revoked';         // Permanently revoked

export type AvailabilityStatus = 
  | 'available'        // Available for assignments
  | 'busy'            // Currently engaged
  | 'emergency'       // Emergency response mode
  | 'break'           // On break (CLT compliance)
  | 'off_duty'        // Off duty/shift ended
  | 'on_call';        // On-call status

export type ShiftType = 
  | 'regular'         // Regular daytime shift
  | 'emergency'       // Emergency coverage
  | 'on_call'         // On-call availability
  | 'night'           // Night shift (CLT differential)
  | 'weekend'         // Weekend shift
  | 'holiday';        // Holiday shift (CLT premium)

export type PerformanceMetricType = 
  | 'patient_satisfaction'
  | 'procedure_success_rate'
  | 'response_time'
  | 'safety_incidents'
  | 'cme_completion'
  | 'team_collaboration'
  | 'emergency_response';

export type EquipmentStatus = 
  | 'available'
  | 'in_use'
  | 'maintenance'
  | 'reserved'
  | 'out_of_service';

export type CommunicationPriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'
  | 'emergency';

// ========== CFM & LICENSING INTERFACES ==========

export interface CFMLicense {
  cfmNumber: string;                    // CFM registration number
  state: string;                        // Brazilian state (e.g., 'SP', 'RJ')
  issueDate: Date;                      // License issue date
  expiryDate: Date;                     // License expiry date
  status: LicenseStatus;                // Current license status
  lastRenewalDate: Date | null;         // Last renewal date
  disciplinaryActions: string[];        // Any disciplinary actions
  telemedicineAuthorized: boolean;      // Authorized for telemedicine
}

export interface RQERegistration {
  rqeNumber: string;                    // RQE specialist registration
  specialty: string;                    // Medical specialty
  certifyingBody: string;               // Certifying organization
  issueDate: Date;                      // Registration date
  expiryDate: Date | null;              // Expiry if applicable
  status: LicenseStatus;                // Registration status
}

export interface CMECredit {
  id: string;
  title: string;                        // Course/activity title
  provider: string;                     // Education provider
  hours: number;                        // Credit hours earned
  completionDate: Date;                 // Completion date
  certificateNumber: string;            // Certificate number
  category: string;                     // CME category
  anvisaApproved: boolean;              // ANVISA approval status
}

// ========== STAFF & PROFESSIONAL INTERFACES ==========

export interface HealthcareProfessional {
  id: string;
  cpf: string;                          // Brazilian CPF (masked for privacy)
  fullName: string;                     // Full professional name
  displayName: string;                  // Display name for team
  email: string;                        // Professional email
  phone: string;                        // Contact phone
  role: ProfessionalRole;               // Primary role
  department: string;                   // Department/unit
  
  // CFM & Licensing
  cfmLicense: CFMLicense | null;        // CFM license (doctors only)
  rqeRegistrations: RQERegistration[];  // Specialty registrations
  professionalLicenses: string[];      // Other professional licenses
  
  // Specializations & Skills
  specializations: string[];            // Medical specializations
  competencies: string[];               // Technical competencies
  languages: string[];                  // Languages spoken
  
  // Education & Training
  cmeCredits: CMECredit[];              // CME credits
  cmeRequiredHours: number;             // Required annual CME hours
  cmeCompletedHours: number;            // Completed CME hours (current year)
  educationLevel: string;               // Education level
  
  // Current Status
  availabilityStatus: AvailabilityStatus;
  currentLocation: string | null;       // Current location in facility
  shiftStartTime: Date | null;          // Current shift start
  shiftEndTime: Date | null;            // Current shift end
  
  // Performance & Metrics
  performanceMetrics: PerformanceMetric[];
  patientSatisfactionScore: number;     // 0-10 scale
  safetyIncidents: number;              // Safety incident count (YTD)
  
  // Employment & CLT Compliance
  employmentStartDate: Date;            // Employment start date
  contractType: 'clt' | 'pj' | 'temporary' | 'resident';
  weeklyHoursLimit: number;             // CLT weekly hour limit
  currentWeekHours: number;             // Current week hours worked
  overtimeHours: number;                // Overtime hours (current period)
  
  // Emergency & Contact
  emergencyContact: EmergencyContact;   // Emergency contact information
  medicalAlerts: string[];              // Medical alerts/restrictions
  
  // LGPD Compliance
  consentGiven: boolean;                // LGPD consent for data processing
  consentDate: Date | null;             // Date consent was given
  dataRetentionDate: Date;              // Data retention expiry
  
  // System Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  isActive: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface PerformanceMetric {
  id: string;
  type: PerformanceMetricType;
  value: number;
  unit: string;                         // e.g., '%', 'minutes', 'count'
  period: string;                       // e.g., 'monthly', 'quarterly'
  target: number;                       // Target value
  benchmarkValue: number | null;        // Benchmark comparison
  date: Date;                           // Metric date
  notes?: string;                       // Additional notes
}

// ========== SCHEDULING INTERFACES ==========

export interface Schedule {
  id: string;
  professionalId: string;
  startTime: Date;
  endTime: Date;
  shiftType: ShiftType;
  department: string;
  location: string;                     // Specific location/room
  
  // CLT Compliance
  breakScheduled: boolean;              // 1-hour lunch break scheduled
  shortBreaksCount: number;             // 15-min breaks (every 4 hours)
  isOvertimeShift: boolean;             // Overtime classification
  overtimeApprovalId: string | null;    // Overtime approval reference
  
  // Assignments
  assignedPatients: string[];           // Patient IDs assigned
  assignedEquipment: string[];          // Equipment IDs assigned
  assignedRooms: string[];              // Room IDs assigned
  
  // Special Considerations
  isEmergencyShift: boolean;            // Emergency coverage
  isHolidayShift: boolean;              // Holiday shift (premium pay)
  isNightShift: boolean;                // Night differential
  
  // Status & Updates
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  actualStartTime: Date | null;         // Actual start time
  actualEndTime: Date | null;           // Actual end time
  noShowReason: string | null;          // No-show reason if applicable
  
  // Notes & Communications
  notes: string;                        // Shift notes
  handoffNotes: string;                 // Handoff instructions
  emergencyProtocols: string[];         // Emergency procedures
  
  // System Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;                    // User who created schedule
}

export interface ScheduleConflict {
  id: string;
  type: 'double_booking' | 'clt_violation' | 'equipment_conflict' | 'room_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSchedules: string[];          // Schedule IDs affected
  suggestedResolution: string;
  resolutionRequired: boolean;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  createdAt: Date;
}

// ========== RESOURCE MANAGEMENT INTERFACES ==========

export interface MedicalEquipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  manufacturer: string;
  purchaseDate: Date;
  warrantyExpiry: Date | null;
  
  // ANVISA Compliance
  anvisaRegistration: string | null;    // ANVISA registration number
  regulatoryClass: string;              // Medical device class
  lastInspectionDate: Date | null;      // Last regulatory inspection
  nextInspectionDate: Date | null;      // Next required inspection
  
  // Operational Status
  status: EquipmentStatus;
  currentLocation: string;              // Current location
  assignedTo: string | null;            // Currently assigned professional
  reservations: EquipmentReservation[]; // Future reservations
  
  // Maintenance
  lastMaintenanceDate: Date | null;     // Last maintenance
  nextMaintenanceDate: Date | null;     // Next scheduled maintenance
  maintenanceNotes: string;             // Maintenance history
  calibrationDate: Date | null;         // Last calibration
  nextCalibrationDate: Date | null;     // Next calibration due
  
  // Usage & Performance
  totalUsageHours: number;              // Total usage time
  utilizationRate: number;              // Utilization percentage
  failureCount: number;                 // Failure incident count
  lastFailureDate: Date | null;         // Last failure date
  
  // Safety & Training
  requiredTraining: string[];           // Required training to operate
  safetyAlerts: string[];               // Safety alerts/warnings
  operatingInstructions: string;        // Operating instructions
  
  // System Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface EquipmentReservation {
  id: string;
  equipmentId: string;
  professionalId: string;
  patientId: string | null;             // Associated patient if applicable
  startTime: Date;
  endTime: Date;
  purpose: string;                      // Reservation purpose
  priority: 'routine' | 'urgent' | 'emergency';
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes: string;
  createdAt: Date;
  createdBy: string;
}

export interface FacilityRoom {
  id: string;
  name: string;
  type: 'consultation' | 'procedure' | 'surgery' | 'recovery' | 'emergency';
  floor: string;
  capacity: number;                     // Maximum occupancy
  equipmentIds: string[];               // Fixed equipment in room
  
  // Availability
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  currentOccupancy: number;             // Current occupancy count
  reservations: RoomReservation[];      // Room reservations
  
  // Features & Capabilities
  features: string[];                   // Room features (e.g., 'oxygen', 'monitors')
  accessibilityFeatures: string[];     // Accessibility features
  sanitationStatus: 'clean' | 'cleaning' | 'contaminated';
  lastCleaningTime: Date | null;        // Last cleaning timestamp
  
  // System Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface RoomReservation {
  id: string;
  roomId: string;
  professionalId: string;
  patientId: string | null;
  procedure: string | null;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  priority: 'routine' | 'urgent' | 'emergency';
  notes: string;
  setupRequirements: string[];          // Special setup requirements
  createdAt: Date;
  createdBy: string;
}

// ========== COMMUNICATION INTERFACES ==========

export interface TeamMessage {
  id: string;
  senderId: string;                     // Sender professional ID
  recipientIds: string[];               // Recipient professional IDs
  channelId: string | null;             // Channel ID if group message
  subject: string;
  content: string;
  priority: CommunicationPriority;
  messageType: 'text' | 'voice' | 'file' | 'handoff' | 'alert';
  
  // Patient Context
  patientId: string | null;             // Related patient if applicable
  treatmentId: string | null;           // Related treatment if applicable
  
  // File Attachments
  attachments: MessageAttachment[];     // File attachments
  
  // Status & Tracking
  status: 'sent' | 'delivered' | 'read' | 'archived';
  readBy: Record<string, Date>;         // Read receipts by recipient
  isEmergency: boolean;                 // Emergency flag
  requiresAcknowledgment: boolean;      // Requires acknowledgment
  acknowledgedBy: string[];             // Professional IDs who acknowledged
  
  // LGPD Compliance
  retentionDate: Date;                  // Data retention date
  containsPersonalData: boolean;        // Contains patient data flag
  
  // System Metadata
  createdAt: Date;
  updatedAt: Date;
  editedAt: Date | null;                // Last edit timestamp
  isDeleted: boolean;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;                     // Size in bytes
  downloadUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  isEncrypted: boolean;                 // Encryption status
  accessLevel: 'public' | 'team' | 'restricted';
}

export interface PatientHandoff {
  id: string;
  patientId: string;
  fromProfessionalId: string;           // Transferring professional
  toProfessionalId: string;             // Receiving professional
  handoffType: 'shift_change' | 'transfer' | 'emergency' | 'procedure';
  
  // Medical Information
  currentCondition: string;             // Current patient condition
  vitalSigns: Record<string, any>;      // Latest vital signs
  activeMedications: string[];          // Current medications
  allergies: string[];                  // Known allergies
  recentProcedures: string[];           // Recent procedures
  
  // Care Instructions
  careInstructions: string;             // Detailed care instructions
  specialRequirements: string[];        // Special care requirements
  riskFactors: string[];                // Risk factors to monitor
  followUpRequired: string[];           // Required follow-ups
  
  // Status & Completion
  status: 'pending' | 'acknowledged' | 'completed';
  acknowledgedAt: Date | null;          // Acknowledgment timestamp
  completedAt: Date | null;             // Completion timestamp
  notes: string;                        // Additional notes
  
  // System Metadata
  createdAt: Date;
  updatedAt: Date;
  priority: CommunicationPriority;
}

// ========== PERFORMANCE & ANALYTICS INTERFACES ==========

export interface TeamPerformanceMetrics {
  teamId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  startDate: Date;
  endDate: Date;
  
  // Overall Metrics
  patientSatisfactionAverage: number;   // Average patient satisfaction
  responseTimeAverage: number;          // Average response time (minutes)
  procedureSuccessRate: number;         // Success rate percentage
  safetyIncidentCount: number;          // Safety incidents
  
  // Productivity Metrics
  patientsServed: number;               // Total patients served
  proceduresCompleted: number;          // Procedures completed
  utilizationRate: number;              // Resource utilization rate
  overtimeHours: number;                // Total overtime hours
  
  // Communication Metrics
  messagesExchanged: number;            // Team messages exchanged
  handoffsCompleted: number;            // Patient handoffs completed
  emergencyResponseTime: number;        // Average emergency response time
  
  // Compliance Metrics
  cltComplianceRate: number;            // CLT compliance percentage
  cmeCompletionRate: number;            // CME completion rate
  licenseComplianceRate: number;        // License compliance rate
  
  // Individual Contributions
  professionalMetrics: Record<string, ProfessionalPerformanceSnapshot>;
  
  // Trends & Analysis
  trends: PerformanceTrend[];           // Performance trends
  alerts: PerformanceAlert[];           // Performance alerts
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfessionalPerformanceSnapshot {
  professionalId: string;
  patientSatisfaction: number;
  proceduresCompleted: number;
  responseTimeAverage: number;
  safetyIncidents: number;
  overtimeHours: number;
  cmeProgress: number;                  // CME completion percentage
  teamCollaborationScore: number;       // Team collaboration rating
}

export interface PerformanceTrend {
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  changePercentage: number;
  significance: 'low' | 'medium' | 'high';
  description: string;
}

export interface PerformanceAlert {
  id: string;
  type: 'performance_decline' | 'compliance_issue' | 'safety_concern' | 'workload_excess';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedProfessionals: string[];
  recommendedActions: string[];
  dueDate: Date | null;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  resolvedAt: Date | null;
}

// ========== DASHBOARD & UI INTERFACES ==========

export interface TeamDashboardConfig {
  userId: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilters;
  preferences: DashboardPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gridSize: 'small' | 'medium' | 'large';
  autoRefresh: boolean;
  refreshInterval: number;              // Seconds
}

export interface DashboardWidget {
  id: string;
  type: 'staff_overview' | 'schedule_grid' | 'performance_chart' | 'alerts' | 'communication' | 'resources';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;          // Widget-specific configuration
  isVisible: boolean;
  permissions: string[];                // Required permissions to view
}

export interface DashboardFilters {
  departments: string[];
  roles: ProfessionalRole[];
  dateRange: { start: Date; end: Date };
  shiftTypes: ShiftType[];
  showInactiveStaff: boolean;
}

export interface DashboardPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'pt-BR' | 'en-US';
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
  emergencyAlerts: boolean;
  scheduleChanges: boolean;
  performanceAlerts: boolean;
  complianceReminders: boolean;
  messageNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigationOnly: boolean;
  colorBlindFriendly: boolean;
}

// ========== API REQUEST/RESPONSE INTERFACES ==========

export interface TeamCoordinationAPIResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

export interface CreateProfessionalRequest {
  fullName: string;
  email: string;
  phone: string;
  role: ProfessionalRole;
  department: string;
  cfmNumber?: string;                   // Required for doctors
  specializations: string[];
  contractType: 'clt' | 'pj' | 'temporary' | 'resident';
  emergencyContact: EmergencyContact;
  consentGiven: boolean;
}

export interface UpdateScheduleRequest {
  professionalId: string;
  startTime: Date;
  endTime: Date;
  shiftType: ShiftType;
  department: string;
  location: string;
  assignedPatients?: string[];
  assignedEquipment?: string[];
  assignedRooms?: string[];
  notes?: string;
  emergencyProtocols?: string[];
}

export interface SendMessageRequest {
  recipientIds: string[];
  subject: string;
  content: string;
  priority: CommunicationPriority;
  messageType: 'text' | 'voice' | 'file' | 'handoff' | 'alert';
  patientId?: string;
  treatmentId?: string;
  attachments?: File[];
  requiresAcknowledgment: boolean;
  isEmergency: boolean;
}

// ========== UTILITY TYPES ==========

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  previousData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  lgpdCompliant: boolean;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  services: ServiceStatus[];
  uptime: number;                       // Uptime in seconds
  lastCheck: Date;
  alerts: SystemAlert[];
}

export interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;                 // Response time in ms
  lastCheck: Date;
  errorCount: number;
}

export interface SystemAlert {
  id: string;
  type: 'system' | 'security' | 'compliance' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

// ========== BRAZILIAN HEALTHCARE REGULATORY TYPES ==========

export interface BrazilianHealthcareCompliance {
  cfmCompliant: boolean;                // CFM compliance status
  anvisaCompliant: boolean;             // ANVISA compliance status
  cltCompliant: boolean;                // CLT labor law compliance
  lgpdCompliant: boolean;               // LGPD data protection compliance
  lastAuditDate: Date | null;           // Last compliance audit
  nextAuditDate: Date | null;           // Next scheduled audit
  complianceScore: number;              // Overall compliance score (0-100)
  violations: ComplianceViolation[];    // Active violations
  remedialActions: RemedialAction[];    // Required remedial actions
}

export interface ComplianceViolation {
  id: string;
  type: 'cfm' | 'anvisa' | 'clt' | 'lgpd';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  affectedPersonnel: string[];
  discoveredDate: Date;
  dueDate: Date;
  status: 'open' | 'in_progress' | 'resolved';
  remedialActions: string[];
  assignedTo: string;
  resolutionNotes?: string;
  resolvedDate?: Date;
}

export interface RemedialAction {
  id: string;
  violationId: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedDate?: Date;
  evidence?: string[];                  // Evidence of completion
  notes?: string;
}