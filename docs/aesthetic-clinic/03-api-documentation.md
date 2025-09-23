# Aesthetic Clinic API Documentation

## 📚 API Overview

The aesthetic clinic API provides comprehensive endpoints for managing client profiles, treatments, scheduling, and compliance. Built with tRPC v11 and TypeScript, it offers type-safe operations with full Brazilian healthcare compliance integration.

## 🔗 Base Configuration

### API Structure
```
/api/v1/aesthetic-clinic/
├── clients/           # Client management
├── treatments/        # Treatment catalog
├── sessions/          # Session management
├── appointments/      # Scheduling
├── professionals/     # Professional management
├── compliance/        # Compliance tracking
└── analytics/         # Business intelligence
```

### Authentication & Authorization
```typescript
// Required headers for all requests
{
  'Authorization': 'Bearer ${JWT_TOKEN}',
  'Content-Type': 'application/json',
  'X-Client-IP': '${client_ip}',
  'X-Session-ID': '${session_id}',
  'X-Compliance-Context': 'aesthetic-clinic'
}
```

## 👥 Client Management APIs

### Create Client Profile
**POST** `/api/v1/aesthetic-clinic/clients`

Creates a new aesthetic client profile with LGPD compliance validation.

```typescript
interface CreateAestheticClientInput {
  fullName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  cpf: string;
  rg?: string;
  profession?: string;
  maritalStatus?: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  skinType?: string;
  skinTone?: string;
  medicalConditions?: string[];
  allergies?: string[];
  currentMedications?: string[];
  previousTreatments?: string[];
  aestheticGoals?: string[];
  contraindications?: string[];
  preferredContactMethod: 'whatsapp' | 'email' | 'sms' | 'phone';
  notificationPreferences: {
    appointmentReminders: boolean;
    promotionalMessages: boolean;
    treatmentUpdates: boolean;
    followUpReminders: boolean;
  };
  lgpdConsent: {
    dataProcessing: boolean;
    marketing: boolean;
    communication: boolean;
    consentDate: Date;
    ip: string;
    userAgent: string;
  };
  addresses?: CreateAddressInput[];
}

interface CreateAddressInput {
  addressType: 'residential' | 'commercial' | 'other';
  street: string;
  number?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isPrimary: boolean;
}

// Response
interface AestheticClientProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: Date;
  gender: string;
  phone: string;
  email: string;
  cpf: string;
  rg?: string;
  profession?: string;
  maritalStatus?: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  skinType?: string;
  skinTone?: string;
  medicalConditions: string[];
  allergies: string[];
  currentMedications: string[];
  previousTreatments: string[];
  aestheticGoals: string[];
  contraindications: string[];
  photosUrl?: string[];
  treatmentHistory: string[];
  preferredContactMethod: string;
  notificationPreferences: {
    appointmentReminders: boolean;
    promotionalMessages: boolean;
    treatmentUpdates: boolean;
    followUpReminders: boolean;
  };
  lgpdConsentGiven: boolean;
  lgpdConsentDate: Date;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  addresses: Address[];
}
```

**Example Request:**
```typescript
const response = await fetch('/api/v1/aesthetic-clinic/clients', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${JWT_TOKEN}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fullName: 'Maria Silva',
    dateOfBirth: '1990-05-15',
    gender: 'female',
    phone: '11987654321',
    email: 'maria.silva@email.com',
    cpf: '12345678900',
    profession: 'Engenheira',
    emergencyContact: {
      name: 'João Silva',
      phone: '11987654322'
    },
    skinType: 'normal',
    skinTone: 'claro',
    aestheticGoals: ['redução de rugas', 'melhora na textura'],
    preferredContactMethod: 'whatsapp',
    notificationPreferences: {
      appointmentReminders: true,
      promotionalMessages: false,
      treatmentUpdates: true,
      followUpReminders: true
    },
    lgpdConsent: {
      dataProcessing: true,
      marketing: false,
      communication: true,
      consentDate: new Date().toISOString(),
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0...'
    }
  })
});
```

**Response Codes:**
- `201` - Client profile created successfully
- `400` - Invalid input data or missing required fields
- `409` - CPF or email already registered
- `422` - LGPD consent validation failed

### Get Client Profile
**GET** `/api/v1/aesthetic-clinic/clients/:id`

Retrieves client profile with comprehensive information and compliance status.

```typescript
interface GetClientResponse extends AestheticClientProfile {
  treatmentPlans: TreatmentPlan[];
  upcomingAppointments: Appointment[];
  sessionHistory: Session[];
  complianceStatus: ComplianceStatus;
  analytics: ClientAnalytics;
}

interface ComplianceStatus {
  lgpdCompliant: boolean;
  anvisaValidated: boolean;
  dataRetentionStatus: 'active' | 'archived' | 'deleted';
  lastComplianceCheck: Date;
  nextComplianceReview: Date;
}

interface ClientAnalytics {
  totalSessions: number;
  totalSpent: number;
  favoriteTreatments: string[];
  averageSatisfaction: number;
  retentionRate: number;
  lastVisitDate: Date;
  predictedNextVisit: Date;
}
```

### Update Client Profile
**PATCH** `/api/v1/aesthetic-clinic/clients/:id`

Updates client information with audit trail and compliance validation.

```typescript
interface UpdateAestheticClientInput extends Partial<CreateAestheticClientInput> {
  id: string;
  updateReason: string;
  complianceJustification?: string;
}
```

## 💉 Treatment Management APIs

### Treatment Catalog
**GET** `/api/v1/aesthetic-clinic/treatments`

Retrieves all available treatments with ANVISA compliance information.

```typescript
interface TreatmentCatalogResponse {
  treatments: AestheticTreatment[];
  categories: string[];
  filters: TreatmentFilters;
  totalCount: number;
}

interface AestheticTreatment {
  id: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  basePrice: number;
  anvisaRegistration?: string;
  anvisaProductName?: string;
  anvisaManufacturer?: string;
  anvisaLotNumber?: string;
  anvisaExpirationDate?: Date;
  anvisaRiskLevel?: 'I' | 'II' | 'III' | 'IV';
  requiredProfessionalType: string;
  minimumAge: number;
  maximumAge?: number;
  pregnancyContraindicated: boolean;
  breastfeedingContraindicated: boolean;
  requiredSessions: number;
  sessionIntervalDays: number;
  recoveryTimeDays: number;
  contraindications: string[];
  sideEffects: string[];
  preCareInstructions: string[];
  postCareInstructions: string[];
  resultsDurationDays?: number;
  photoRequired: boolean;
  consultationRequired: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TreatmentFilters {
  category?: string;
  priceRange?: { min: number; max: number };
  duration?: { min: number; max: number };
  professionalType?: string;
  anvisaCompliant?: boolean;
  active?: boolean;
}
```

### Create Treatment Plan
**POST** `/api/v1/aesthetic-clinic/treatment-plans`

Creates a comprehensive treatment plan for a client.

```typescript
interface CreateTreatmentPlanInput {
  clientId: string;
  professionalId: string;
  name: string;
  description: string;
  goals: string[];
  treatments: PlanTreatment[];
  totalEstimatedSessions: number;
  estimatedTotalCost: number;
  startDate?: Date;
  estimatedCompletionDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  aiRecommendations?: AIRecommendations;
}

interface PlanTreatment {
  treatmentId: string;
  sessions: number;
  intervalDays: number;
  notes?: string;
}

interface AIRecommendations {
  recommended: boolean;
  confidenceScore: number;
  alternatives: string[];
  reasoning: string;
  expectedResults: string[];
  riskFactors: string[];
}
```

## 📅 Scheduling APIs

### AI-Optimized Appointment Scheduling
**POST** `/api/v1/aesthetic-clinic/appointments/optimize`

Creates AI-optimized appointment schedule based on multiple constraints.

```typescript
interface OptimizeScheduleInput {
  clientId: string;
  treatmentId: string;
  preferredDates: DateRange[];
  professionalIds?: string[];
  constraints: SchedulingConstraints;
  preferences: SchedulingPreferences;
}

interface DateRange {
  start: Date;
  end: Date;
}

interface SchedulingConstraints {
  timeWindows: TimeWindow[];
  professionalAvailability: boolean;
  roomAvailability: boolean;
  equipmentRequirements: string[];
  minimumDuration: number;
  maximumDuration: number;
  avoidProfessionalConflicts: boolean;
  considerNoShowRisk: boolean;
}

interface TimeWindow {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

interface SchedulingPreferences {
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening';
  preferredProfessional?: string;
  preferredRoom?: string;
  allowSameDay: boolean;
  allowWeekend: boolean;
  reminderTiming: number; // hours before appointment
}

interface OptimizationResult {
  success: boolean;
  recommendations: AppointmentRecommendation[];
  selectedRecommendation?: AppointmentRecommendation;
  optimizationMetrics: OptimizationMetrics;
}

interface AppointmentRecommendation {
  professionalId: string;
  professionalName: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  roomId: string;
  confidenceScore: number;
  reasons: string[];
  noShowRisk: number;
  complianceScore: number;
}

interface OptimizationMetrics {
  professionalUtilization: number;
  roomUtilization: number;
  clientSatisfactionScore: number;
  complianceScore: number;
  revenueOptimization: number;
  totalScore: number;
}
```

### Create Appointment
**POST** `/api/v1/aesthetic-clinic/appointments`

Creates a new appointment with comprehensive validation.

```typescript
interface CreateAppointmentInput {
  clientId: string;
  professionalId: string;
  treatmentId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  appointmentType: 'consultation' | 'treatment' | 'follow_up' | 'assessment' | 'emergency';
  price: number;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded' | 'cancelled';
  paymentMethod?: string;
  insuranceCaptured: boolean;
  insuranceAuthorizationNumber?: string;
  roomNumber?: string;
  equipmentRequired?: string[];
  specialRequirements?: string[];
  notes?: string;
  aiOptimized: boolean;
  noShowPredictionScore?: number;
}
```

### No-Show Prediction
**GET** `/api/v1/aesthetic-clinic/appointments/:id/no-show-risk`

Provides AI-powered no-show risk assessment for appointments.

```typescript
interface NoShowRiskAssessment {
  appointmentId: string;
  riskScore: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  contributingFactors: RiskFactor[];
  recommendations: string[];
  mitigationStrategies: string[];
  historicalAccuracy: number;
}

interface RiskFactor {
  factor: string;
  impact: number; // 0-1
  description: string;
  dataPoints: number;
}
```

## 👨‍⚕️ Professional Management APIs

### Professional Registration
**POST** `/api/v1/aesthetic-clinic/professionals`

Registers a new healthcare professional with CFM validation.

```typescript
interface CreateProfessionalInput {
  userId: string;
  professionalType: string;
  cfmCrmNumber: string;
  cfmCrmState: string;
  cfmCrmSpecialty?: string;
  professionalLicense?: string;
  licenseExpirationDate?: Date;
  anvisaCertificationNumber?: string;
  anvisaCertificationExpiration?: Date;
  specializations: string[];
  experienceYears: number;
  treatmentsSpecialized: string[];
  bio?: string;
  consultationDurationMinutes: number;
  baseConsultationPrice: number;
  availabilitySchedule: AvailabilitySchedule;
  maxDailySessions: number;
  maxWeeklySessions: number;
  requiresSupervision: boolean;
  supervisorId?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  profilePhotoUrl?: string;
}

interface AvailabilitySchedule {
  monday: WorkDaySchedule;
  tuesday: WorkDaySchedule;
  wednesday: WorkDaySchedule;
  thursday: WorkDaySchedule;
  friday: WorkDaySchedule;
  saturday: WorkDaySchedule;
  sunday: WorkDaySchedule;
}

interface WorkDaySchedule {
  available: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  maxAppointments: number;
}
```

### Professional Availability
**GET** `/api/v1/aesthetic-clinic/professionals/:id/availability`

Retrieves professional availability for scheduling.

```typescript
interface ProfessionalAvailability {
  professionalId: string;
  weeklySchedule: WeeklyAvailability[];
  availableSlots: AvailableSlot[];
  vacationPeriods: DateRange[];
  restrictedPeriods: DateRange[];
  sessionStatistics: SessionStatistics;
}

interface WeeklyAvailability {
  dayOfWeek: number;
  available: boolean;
  workHours: {
    start: string;
    end: string;
  };
  breakHours?: {
    start: string;
    end: string;
  };
  maxSessions: number;
  bookedSessions: number;
}

interface AvailableSlot {
  start: Date;
  end: Date;
  duration: number;
  available: boolean;
  reason?: string;
}

interface SessionStatistics {
  totalSessions: number;
  averageSessionDuration: number;
  utilizationRate: number;
  cancellationRate: number;
  noShowRate: number;
  clientSatisfaction: number;
}
```

## 🛡️ Compliance APIs

### LGPD Data Subject Request
**POST** `/api/v1/aesthetic-clinic/compliance/lgpd-request`

Handles LGPD data subject rights requests.

```typescript
interface LGPDRequestInput {
  clientId: string;
  requestType: 'access' | 'deletion' | 'correction' | 'portability';
  requestData?: {
    fields?: string[];
    timeRange?: {
      start: Date;
      end: Date;
    };
    format?: 'json' | 'pdf' | 'csv';
  };
  justification: string;
  requestorInfo: {
    name: string;
    relationship: 'self' | 'legal_representative' | 'authorized_agent';
    document: string;
    contact: string;
  };
}

interface LGPDRequestResponse {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  estimatedCompletion: Date;
  complianceOfficer: string;
  dataPackage?: DataPackage;
  auditTrail: AuditTrailEntry[];
}

interface DataPackage {
  downloadUrl: string;
  format: string;
  size: number;
  encryptionKey: string;
  expiration: Date;
  checksum: string;
}
```

### ANVISA Compliance Check
**GET** `/api/v1/aesthetic-clinic/compliance/anvisa-validation/:treatmentId`

Validates ANVISA compliance for treatments and medical devices.

```typescript
interface ANVISAValidationResponse {
  treatmentId: string;
  treatmentName: string;
  anvisaRegistration?: string;
  validationStatus: 'valid' | 'expired' | 'invalid' | 'pending';
  validationDate: Date;
  nextValidationDate: Date;
  riskLevel: 'I' | 'II' | 'III' | 'IV';
  complianceScore: number;
  issues: ComplianceIssue[];
  recommendations: string[];
  regulatoryActions: RegulatoryAction[];
}

interface ComplianceIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  code: string;
  resolutionRequired: boolean;
  dueDate?: Date;
}

interface RegulatoryAction {
  action: string;
  deadline: Date;
  responsible: string;
  status: 'pending' | 'completed' | 'overdue';
}
```

### Compliance Dashboard
**GET** `/api/v1/aesthetic-clinic/compliance/dashboard`

Provides comprehensive compliance overview.

```typescript
interface ComplianceDashboard {
  overview: ComplianceOverview;
  lgpd: LGPDStatus;
  anvisa: ANVISAStatus;
  cfm: CFMStatus;
  audit: AuditStatus;
  alerts: ComplianceAlert[];
  upcomingDeadlines: ComplianceDeadline[];
}

interface ComplianceOverview {
  overallScore: number;
  compliantItems: number;
  nonCompliantItems: number;
  pendingReviews: number;
  criticalIssues: number;
  lastAuditDate: Date;
  nextAuditDate: Date;
}

interface LGPDStatus {
  consentsValid: number;
  consentsExpired: number;
  dataSubjectRequests: {
    pending: number;
    completed: number;
    overdue: number;
  };
  dataRetention: {
    active: number;
    archived: number;
    pendingDeletion: number;
  };
}

interface ANVISAStatus {
  treatmentsValidated: number;
  treatmentsExpired: number;
  treatmentsPending: number;
  devicesTracked: number;
  lotExpirations: {
    thisMonth: number;
    nextMonth: number;
  };
}

interface CFMStatus {
  professionalsValid: number;
  professionalsExpired: number;
  licensesPending: number;
  supervisionRequired: number;
}

interface AuditStatus {
  auditsCompleted: number;
  auditsPending: number;
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface ComplianceAlert {
  id: string;
  type: 'lgpd' | 'anvisa' | 'cfm' | 'audit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionRequired: boolean;
  dueDate?: Date;
  assignedTo: string;
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved';
}

interface ComplianceDeadline {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  type: 'validation' | 'renewal' | 'audit' | 'report';
  responsible: string;
  status: 'on_track' | 'at_risk' | 'overdue';
}
```

## 📊 Analytics APIs

### Client Analytics
**GET** `/api/v1/aesthetic-clinic/analytics/clients`

Provides comprehensive client analytics and insights.

```typescript
interface ClientAnalytics {
  demographics: ClientDemographics;
  behavior: ClientBehavior;
  satisfaction: ClientSatisfaction;
  retention: ClientRetention;
  predictions: ClientPredictions;
}

interface ClientDemographics {
  totalClients: number;
  newClientsThisMonth: number;
  ageDistribution: {
    '18-25': number;
    '26-35': number;
    '36-45': number;
    '46-55': number;
    '56+': number;
  };
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  geographicDistribution: {
    state: string;
    count: number;
    percentage: number;
  }[];
}

interface ClientBehavior {
  averageSessionsPerClient: number;
  averageSpendingPerClient: number;
  mostPopularTreatments: {
    treatmentName: string;
    count: number;
    revenue: number;
  }[];
  bookingPatterns: {
    dayOfWeek: number;
    count: number;
  }[];
  timeOfDayPreferences: {
    hour: number;
    count: number;
  }[];
}

interface ClientSatisfaction {
  averageSatisfactionScore: number;
  satisfactionDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  feedbackThemes: {
    theme: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    count: number;
  }[];
  complaints: {
    category: string;
    count: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
}

interface ClientRetention {
  retentionRate: number;
  churnRate: number;
  averageClientLifetime: number;
  repeatClientRate: number;
  retentionByTreatment: {
    treatmentName: string;
    retentionRate: number;
  }[];
}

interface ClientPredictions {
  predictedChurnRisk: number;
  predictedNextVisit: Date;
  upsellOpportunities: {
    clientId: string;
    recommendedTreatment: string;
    confidence: number;
  }[];
  loyaltyTiers: {
    tier: string;
    count: number;
    criteria: string;
  }[];
}
```

### Performance Analytics
**GET** `/api/v1/aesthetic-clinic/analytics/performance`

Provides clinic performance analytics and KPIs.

```typescript
interface PerformanceAnalytics {
  operational: OperationalMetrics;
  financial: FinancialMetrics;
  clinical: ClinicalMetrics;
  efficiency: EfficiencyMetrics;
  trends: PerformanceTrends;
}

interface OperationalMetrics {
  totalAppointments: number;
  appointmentUtilization: number;
  averageWaitTime: number;
  cancellationRate: number;
  noShowRate: number;
  professionalUtilization: number;
  roomUtilization: number;
}

interface FinancialMetrics {
  totalRevenue: number;
  averageRevenuePerSession: number;
  treatmentRevenueBreakdown: {
    category: string;
    revenue: number;
    percentage: number;
  }[];
  paymentMethodDistribution: {
    method: string;
    count: number;
    amount: number;
  }[];
  insuranceClaims: {
    approved: number;
    pending: number;
    rejected: number;
  };
}

interface ClinicalMetrics {
  treatmentSuccessRate: number;
  complicationRate: number;
  clientImprovementScores: {
    treatment: string;
    improvement: number;
  }[];
  followUpCompliance: number;
  adverseEvents: {
    type: string;
    count: number;
    severity: number;
  }[];
}

interface EfficiencyMetrics {
  averageSessionDuration: number;
  professionalEfficiency: {
    professionalId: string;
    efficiency: number;
  }[];
  resourceUtilization: number;
  schedulingEfficiency: number;
}

interface PerformanceTrends {
  revenueTrend: {
    period: string;
    revenue: number;
    growth: number;
  }[];
  clientAcquisitionTrend: {
    period: string;
    newClients: number;
    growth: number;
  }[];
  satisfactionTrend: {
    period: string;
    satisfaction: number;
  }[];
}
```

## 🔄 Webhook Events

### Appointment Events
```typescript
interface AppointmentWebhook {
  event: 'appointment.created' | 'appointment.updated' | 'appointment.cancelled' | 'appointment.completed';
  data: AppointmentWebhookData;
  timestamp: Date;
}

interface AppointmentWebhookData {
  appointmentId: string;
  clientId: string;
  professionalId: string;
  status: string;
  scheduledStart: Date;
  treatmentName: string;
}
```

### Compliance Events
```typescript
interface ComplianceWebhook {
  event: 'compliance.issue' | 'compliance.resolved' | 'compliance.deadline' | 'compliance.audit';
  data: ComplianceWebhookData;
  timestamp: Date;
}

interface ComplianceWebhookData {
  issueId?: string;
  type: string;
  severity: string;
  description: string;
  responsible: string;
}
```

## 🚫 Error Handling

### Standard Error Responses
```typescript
interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  requestId: string;
}

// Common error codes
ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  COMPLIANCE_VIOLATION: 'COMPLIANCE_VIOLATION',
  LGPD_VIOLATION: 'LGPD_VIOLATION',
  ANVISA_VIOLATION: 'ANVISA_VIOLATION',
  CFM_VIOLATION: 'CFM_VIOLATION',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};
```

### Error Response Example
```json
{
  "code": "COMPLIANCE_VIOLATION",
  "message": "LGPD consent is required for this operation",
  "details": {
    "field": "lgpdConsentGiven",
    "required": true,
    "currentValue": false
  },
  "timestamp": "2024-09-23T10:30:00Z",
  "requestId": "req_123456789"
}
```

This comprehensive API documentation provides all necessary information for integrating with the aesthetic clinic system while ensuring full Brazilian healthcare compliance.