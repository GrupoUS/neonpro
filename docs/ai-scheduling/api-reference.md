# AI Scheduling System API Reference

## Overview

This document provides comprehensive API reference documentation for the AI-Powered Appointment Scheduling System. All APIs are type-safe and built with tRPC for end-to-end type safety.

## Base URLs

- **Development**: `http://localhost:3001/api`
- **Production**: `https://api.neonpro.com.br/api`

## Authentication

All API requests require authentication using JWT tokens:

```typescript
const token = localStorage.getItem('authToken');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
};
```

## Core Services

### AI Appointment Scheduling Service

#### No-Show Prediction

```typescript
POST /ai-scheduling/predict-no-show
```

Predicts the probability of no-show for a specific appointment.

**Request Body:**
```typescript
interface NoShowPredictionRequest {
  patientId: string;
  professionalId: string;
  clinicId: string;
  appointmentType: string;
  scheduledHour: number;
  dayOfWeek: number;
  daysInAdvance: number;
  previousNoShowRate: number;
  age: number;
  gender: 'M' | 'F' | 'Other';
  distanceFromClinic: number;
  socioeconomicIndicator: number;
  seasonalFactor: number;
  weatherImpact: number;
  appointmentHistoryCount: number;
  consecutiveCancellations: number;
  paymentMethod: string;
  insuranceType: string;
  reminderPreference: string[];
  previousRemindersSent: number;
  timeSinceLastAppointment: number;
  appointmentTimePreference: string;
  transportationMethod: string;
  employmentStatus: string;
  stressLevel: string;
  healthCondition: string;
  treatmentComplexity: string;
  hasFamilySupport: boolean;
  financialConstraint: boolean;
  technologyAccess: string;
  languagePreference: string;
  culturalBackground: string;
}
```

**Response:**
```typescript
interface NoShowPredictionResponse {
  probability: number; // 0-1
  confidence: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  recommendations: string[];
  predictionTimestamp: Date;
  modelVersion: string;
  features: NoShowPredictionFeatures;
}
```

**Example:**
```typescript
const response = await fetch('/api/ai-scheduling/predict-no-show', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    patientId: 'patient-123',
    professionalId: 'prof-456',
    clinicId: 'clinic-789',
    appointmentType: 'consultation',
    scheduledHour: 14,
    dayOfWeek: 1,
    // ... other features
  }),
});

const prediction = await response.json();
console.log('No-show probability:', prediction.probability);
console.log('Risk level:', prediction.riskLevel);
```

#### Scheduling Optimization

```typescript
POST /ai-scheduling/optimize-scheduling
```

Optimizes resource allocation for scheduling based on constraints and objectives.

**Request Body:**
```typescript
interface SchedulingOptimizationRequest {
  clinicId: string;
  date: string;
  availableProfessionals: string[];
  availableRooms: string[];
  serviceTypes: string[];
  timeSlots: Array<{
    start: string;
    end: string;
  }>;
  constraints: {
    maxAppointmentsPerProfessional: number;
    minBreakBetweenAppointments: number;
    roomSetupTime: number;
    maxParallelProcedures: number;
    requiredStaffPerProcedure: number;
    lunchBreak?: {
      start: string;
      end: string;
    };
  };
  objectives: {
    maximizeUtilization: boolean;
    minimizeWaitTime: boolean;
    balanceWorkload: boolean;
    prioritizeHighValue: boolean;
    accommodateEmergency: boolean;
  };
  existingAppointments?: Array<{
    id: string;
    professionalId: string;
    roomId: string;
    startTime: string;
    endTime: string;
    type: string;
  }>;
  highValueAppointments?: Array<{
    id: string;
    type: string;
    duration: number;
    revenue: number;
    urgency: string;
    requiredResources: string[];
  }>;
}
```

**Response:**
```typescript
interface SchedulingOptimizationResponse {
  optimizedSchedule: Array<{
    appointmentId?: string;
    professionalId: string;
    roomId: string;
    startTime: string;
    endTime: string;
    type: string;
    priorityScore: number;
    conflicts: string[];
  }>;
  utilizationMetrics: {
    overallUtilization: number;
    professionalUtilization: Record<string, number>;
    roomUtilization: Record<string, number>;
    timeSlotUtilization: Record<string, number>;
  };
  recommendations: string[];
  conflictResolutions: Array<{
    type: string;
    description: string;
    resolution: string;
    impact: string;
  }>;
  optimizationScore: number;
  processingTime: number;
}
```

#### Performance Analytics

```typescript
GET /ai-scheduling/performance-analytics?startDate=2024-01-01&endDate=2024-12-31&clinicId=clinic-123
```

Retrieves comprehensive performance analytics for the scheduling system.

**Query Parameters:**
- `startDate` (string): Start date for analysis period
- `endDate` (string): End date for analysis period
- `clinicId` (string): Clinic identifier
- `granularity` (optional, string): 'daily' | 'weekly' | 'monthly' (default: 'monthly')

**Response:**
```typescript
interface PerformanceAnalyticsResponse {
  period: {
    startDate: string;
    endDate: string;
    clinicId: string;
  };
  utilization: {
    overallUtilization: number;
    professionalUtilization: number;
    roomUtilization: number;
    equipmentUtilization: number;
  };
  efficiency: {
    onTimePerformance: number;
    averageWaitTime: number;
    schedulingEfficiency: number;
    resourceAllocation: number;
  };
  quality: {
    patientSatisfaction: number;
    professionalSatisfaction: number;
    appointmentQuality: number;
    complianceScore: number;
  };
  financial: {
    totalRevenue: number;
    averageRevenuePerAppointment: number;
    revenueGrowth: number;
    costEfficiency: number;
  };
  predictions: {
    noShowTrend: number;
    utilizationProjection: number;
    revenueProjection: number;
    confidence: number;
  };
  recommendations: string[];
}
```

### Real-Time Availability Service

#### Calculate Professional Availability

```typescript
GET /availability/professional/{professionalId}?date=2024-12-16
```

Calculates real-time availability for a specific professional.

**Path Parameters:**
- `professionalId` (string): Professional identifier

**Query Parameters:**
- `date` (string): Date for availability calculation (YYYY-MM-DD format)
- `includeBreaks` (optional, boolean): Include break times (default: true)
- `includeConflicts` (optional, boolean): Include conflict information (default: true)

**Response:**
```typescript
interface ProfessionalAvailabilityResponse {
  professionalId: string;
  date: string;
  availableSlots: Array<{
    startTime: string;
    endTime: string;
    available: boolean;
    reason?: string;
    confidence?: number;
  }>;
  utilization: {
    totalAvailableTime: number;
    occupiedTime: number;
    utilizationRate: number;
    breakTime: number;
    efficiency: number;
  };
  breaks: Array<{
    start: string;
    end: string;
    type: string;
  }>;
  conflicts: Array<{
    type: string;
    startTime: string;
    endTime: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  businessStatus: 'open' | 'closed' | 'holiday' | 'maintenance';
  calculatedAt: Date;
}
```

#### Detect Conflicts

```typescript
POST /availability/detect-conflicts
```

Detects scheduling conflicts for a proposed appointment.

**Request Body:**
```typescript
interface ConflictDetectionRequest {
  appointment: {
    id?: string;
    professionalId: string;
    startTime: Date;
    endTime: Date;
    roomId: string;
    requiredEquipment?: string[];
    appointmentType: string;
  };
  excludeAppointmentId?: string;
  checkRoomConflicts: boolean;
  checkEquipmentConflicts: boolean;
  checkProfessionalConflicts: boolean;
}
```

**Response:**
```typescript
interface ConflictDetectionResponse {
  hasConflicts: boolean;
  conflicts: Array<{
    type: 'professional_conflict' | 'room_conflict' | 'equipment_conflict' | 'exact_match';
    severity: 'low' | 'medium' | 'high' | 'critical';
    conflictingAppointmentId?: string;
    conflictingResourceId?: string;
    overlapMinutes: number;
    description: string;
    resolution: string;
  }>;
  alternativeSlots: Array<{
    startTime: Date;
    endTime: Date;
    confidence: number;
    reason: string;
  }>;
  conflictScore: number;
}
```

#### Resource Optimization

```typescript
POST /availability/optimize-resources
```

Optimizes resource allocation across professionals, rooms, and equipment.

**Request Body:**
```typescript
interface ResourceOptimizationRequest {
  clinicId: string;
  date: string;
  demand: Array<{
    type: string;
    duration: number;
    count: number;
    requiredEquipment: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>;
  constraints: {
    maxParallelAppointments: number;
    minStaffPerProcedure: number;
    equipmentMaintenance: Array<{
      equipmentId: string;
      unavailablePeriod: {
        start: Date;
        end: Date;
      };
    }>;
  };
  objectives: {
    maximizeThroughput: boolean;
    minimizeWaitTime: boolean;
    balanceWorkload: boolean;
    prioritizeHighValue: boolean;
  };
}
```

**Response:**
```typescript
interface ResourceOptimizationResponse {
  clinicId: string;
  date: string;
  allocation: Array<{
    timeSlot: {
      start: string;
      end: string;
    };
    appointments: Array<{
      type: string;
      professionalId: string;
      roomId: string;
      equipment: string[];
      efficiency: number;
    }>;
    utilization: number;
  }>;
  utilization: {
    overallEfficiency: number;
    professionalUtilization: Record<string, number>;
    roomUtilization: Record<string, number>;
    equipmentUtilization: Record<string, number>;
  };
  recommendations: string[];
  optimizationScore: number;
}
```

### Automated Reminder Service

#### Generate Reminders

```typescript
POST /reminders/generate
```

Generates personalized reminders for appointments based on behavioral analysis.

**Request Body:**
```typescript
interface ReminderGenerationRequest {
  appointmentId: string;
  includeScheduling: boolean;
  includeFollowUp: boolean;
  customization: {
    tone: 'formal' | 'friendly' | 'urgent';
    language: string;
    includeInstructions: boolean;
    includePreparation: boolean;
  };
}
```

**Response:**
```typescript
interface ReminderGenerationResponse {
  appointmentId: string;
  reminders: Array<{
    id: string;
    type: 'scheduling' | 'preparation' | 'follow_up';
    channel: 'whatsapp' | 'email' | 'sms';
    timing: number; // Hours before appointment
    content: {
      subject?: string;
      message: string;
      instructions?: string[];
      preparation?: string[];
    };
    scheduledFor: Date;
    priority: 'low' | 'medium' | 'high';
    personalized: boolean;
  }>;
  personalizationScore: number;
  optimalTiming: {
    bestChannel: string;
    bestTiming: number;
    confidence: number;
  };
}
```

#### Send Reminders

```typescript
POST /reminders/send
```

Sends reminders through specified channels with LGPD compliance validation.

**Request Body:**
```typescript
interface ReminderSendRequest {
  reminderIds: string[];
  sendImmediately: boolean;
  tracking: {
    enableDeliveryTracking: boolean;
    enableReadTracking: boolean;
    enableResponseTracking: boolean;
  };
}
```

**Response:**
```typescript
interface ReminderSendResponse {
  sentReminders: Array<{
    reminderId: string;
    channel: string;
    status: 'sent' | 'delivered' | 'failed' | 'pending';
    sentAt: Date;
    messageId?: string;
    error?: string;
  }>;
  summary: {
    totalSent: number;
    successful: number;
    failed: number;
    pending: number;
  };
  compliance: {
    lgpdCompliant: boolean;
    consentValidated: boolean;
    dataEncrypted: boolean;
  };
}
```

#### Reminder Analytics

```typescript
GET /reminders/analytics?startDate=2024-01-01&endDate=2024-12-31&clinicId=clinic-123
```

Retrieves analytics on reminder effectiveness and patient engagement.

**Query Parameters:**
- `startDate` (string): Start date for analysis
- `endDate` (string): End date for analysis
- `clinicId` (string): Clinic identifier
- `channel` (optional, string): Filter by communication channel
- `type` (optional, string): Filter by reminder type

**Response:**
```typescript
interface ReminderAnalyticsResponse {
  period: {
    startDate: string;
    endDate: string;
    clinicId: string;
  };
  effectiveness: {
    deliveryRate: number;
    openRate: number;
    responseRate: number;
    conversionRate: number;
  };
  channelPerformance: Record<string, {
    sent: number;
    delivered: number;
    opened: number;
    responded: number;
    conversionRate: number;
  }>;
  timingAnalysis: {
    optimalTiming: number;
    bestPerformingHours: number[];
    worstPerformingHours: number[];
  };
  patientEngagement: {
    highlyEngaged: number;
    moderatelyEngaged: number;
    poorlyEngaged: number;
    unengaged: number;
  };
  recommendations: string[];
}
```

### LGPD Compliance Service

#### Validate Appointment Consent

```typescript
GET /lgpd/consent/validate?appointmentId=appointment-123
```

Validates LGPD consent for a specific appointment.

**Query Parameters:**
- `appointmentId` (string): Appointment identifier

**Response:**
```typescript
interface ConsentValidationResponse {
  isValid: boolean;
  consentRecords: Array<{
    id: string;
    consentType: string;
    givenAt: Date;
    expiresAt?: Date;
    isValid: boolean;
    documentHash: string;
  }>;
  validationTimestamp: Date;
  riskFactors: string[];
  recommendations: string[];
  complianceScore: number;
}
```

#### Process Data Access Request

```typescript
POST /lgpd/data-access-request
```

Processes LGPD data subject access requests.

**Request Body:**
```typescript
interface DataAccessRequest {
  patientId: string;
  requestType: 'access' | 'deletion' | 'correction' | 'portability';
  scope: string[];
  identityVerification: {
    method: string;
    verified: boolean;
    verificationToken?: string;
  };
  requestedAt: Date;
  ipAddress: string;
  userAgent: string;
  reason: string;
}
```

**Response:**
```typescript
interface DataAccessResponse {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  patientId: string;
  requestType: string;
  dataPackage?: {
    appointments: any[];
    consents: any[];
    communications: any[];
    exportedAt: Date;
    format: string;
  };
  processingTime: number;
  complianceScore: number;
  retentionSchedule?: {
    deletionDate: Date;
    anonymizationApplied: string[];
  };
}
```

#### Generate Compliance Report

```typescript
GET /lgpd/compliance-report?startDate=2024-01-01&endDate=2024-12-31&clinicId=clinic-123
```

Generates comprehensive LGPD compliance report.

**Query Parameters:**
- `startDate` (string): Report start date
- `endDate` (string): Report end date
- `clinicId` (string): Clinic identifier
- `format` (optional, string): 'json' | 'pdf' | 'csv' (default: 'json')

**Response:**
```typescript
interface ComplianceReportResponse {
  reportPeriod: {
    startDate: string;
    endDate: string;
    clinicId: string;
    generatedAt: Date;
  };
  consentMetrics: {
    totalRecords: number;
    validConsents: number;
    expiredConsents: number;
    revokedConsents: number;
    consentRate: number;
  };
  incidentMetrics: {
    totalIncidents: number;
    resolvedIncidents: number;
    criticalIncidents: number;
    averageResolutionTime: number;
  };
  dataRetentionMetrics: {
    recordsProcessed: number;
    recordsAnonymized: number;
    recordsDeleted: number;
    retentionCompliance: number;
  };
  complianceScore: number;
  riskFactors: string[];
  immediateActions: string[];
  recommendations: string[];
  annexes: Array<{
    type: string;
    title: string;
    content: any;
  }>;
}
```

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('wss://api.neonpro.com.br/ws/availability');

ws.onopen = () => {
  console.log('Connected to availability updates');
  
  // Subscribe to availability updates
  ws.send(JSON.stringify({
    action: 'subscribe',
    payload: {
      clientId: 'client-123',
      professionalIds: ['prof-456', 'prof-789'],
      clinicId: 'clinic-789',
      dateRange: {
        start: '2024-12-16',
        end: '2024-12-20'
      },
      filters: {
        availableOnly: true
      }
    }
  }));
};
```

### Message Format

#### Availability Update

```typescript
interface AvailabilityUpdateMessage {
  type: 'availability_update';
  payload: {
    professionalId: string;
    date: string;
    availableSlots: Array<{
      startTime: string;
      endTime: string;
      available: boolean;
      reason?: string;
    }>;
    timestamp: Date;
    changeType: 'added' | 'removed' | 'modified';
  };
}
```

#### Conflict Alert

```typescript
interface ConflictAlertMessage {
  type: 'conflict_alert';
  payload: {
    appointmentId: string;
    conflicts: Array<{
      type: string;
      severity: string;
      description: string;
    }>;
    timestamp: Date;
    requiresAction: boolean;
  };
}
```

#### System Status

```typescript
interface SystemStatusMessage {
  type: 'system_status';
  payload: {
    status: 'healthy' | 'degraded' | 'down';
    services: Record<string, 'healthy' | 'degraded' | 'down'>;
    message?: string;
    timestamp: Date;
  };
}
```

## Error Handling

All API responses follow a consistent error format:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
    requestId: string;
  };
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required or token invalid |
| `FORBIDDEN` | 403 | Insufficient permissions for requested resource |
| `NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `CONFLICT` | 409 | Resource conflict or scheduling conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Error Handling Example

```typescript
try {
  const response = await fetch('/api/availability/professional/prof-123?date=2024-12-16', {
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json();
    
    switch (error.error.code) {
      case 'UNAUTHORIZED':
        // Redirect to login
        break;
      case 'FORBIDDEN':
        // Show permission error
        break;
      case 'NOT_FOUND':
        // Show not found message
        break;
      case 'VALIDATION_ERROR':
        // Show validation errors
        break;
      default:
        // Show generic error
        break;
    }
  }
  
  const data = await response.json();
  // Process successful response
} catch (error) {
  // Handle network errors
  console.error('Network error:', error);
}
```

## Rate Limiting

API endpoints are rate-limited to ensure system stability:

- **Default Rate**: 100 requests per minute per IP
- **WebSocket Connections**: 10 concurrent connections per client
- **File Upload**: 10 MB maximum file size
- **Batch Operations**: 50 items maximum per batch

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Versioning

The API uses semantic versioning. Include the API version in requests:

```typescript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'API-Version': 'v1',
};
```

Current version: **v1.0.0**

## Testing Endpoints

### Health Check

```typescript
GET /health
```

Returns system health status:

```typescript
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    database: 'healthy' | 'degraded' | 'down';
    redis: 'healthy' | 'degraded' | 'down';
    websocket: 'healthy' | 'degraded' | 'down';
    ai_services: 'healthy' | 'degraded' | 'down';
  };
  timestamp: Date;
  version: string;
}
```

### API Test

```typescript
POST /test/api
```

Test endpoint for validating API connectivity and authentication:

```typescript
interface TestResponse {
  success: true;
  message: 'API connection successful';
  timestamp: Date;
  user: {
    id: string;
    email: string;
    permissions: string[];
  };
}
```

## Webhooks

### Appointment Created

```typescript
interface AppointmentCreatedWebhook {
  event: 'appointment.created';
  data: {
    appointmentId: string;
    patientId: string;
    professionalId: string;
    clinicId: string;
    scheduledFor: Date;
    status: string;
    createdAt: Date;
  };
  timestamp: Date;
}
```

### Appointment Cancelled

```typescript
interface AppointmentCancelledWebhook {
  event: 'appointment.cancelled';
  data: {
    appointmentId: string;
    patientId: string;
    reason: string;
    cancelledBy: string;
    cancelledAt: Date;
  };
  timestamp: Date;
}
```

### Compliance Alert

```typescript
interface ComplianceAlertWebhook {
  event: 'compliance.alert';
  data: {
    alertType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedResources: string[];
    requiredAction: string;
  };
  timestamp: Date;
}
```