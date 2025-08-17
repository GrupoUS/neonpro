# NeonPro Patient Portal

A comprehensive patient portal system for NeonPro that provides secure patient access to healthcare services, appointment management, document handling, and communication features.

## Features

### 🔐 Authentication & Security

- Secure session management with JWT tokens
- Device fingerprinting and tracking
- LGPD compliance with audit logging
- Encryption for sensitive data
- Two-factor authentication support

### 📊 Dashboard

- Personalized patient dashboard
- Real-time updates and notifications
- Treatment progress tracking
- Appointment summaries
- Document management overview

### 📅 Appointment Management

- Online appointment booking
- Available time slot discovery
- Appointment rescheduling and cancellation
- Automated reminders
- Waitlist functionality

### 📄 Document Management

- Secure file upload with encryption
- Virus scanning and validation
- Automatic thumbnail generation
- File categorization and tagging
- LGPD-compliant retention policies

### 💬 Communication

- Secure messaging with healthcare providers
- File attachments support
- Message encryption
- Priority-based routing
- Automated response estimates

## Installation

```typescript
import {
  PatientPortal,
  createDefaultPortalConfig,
} from '@neonpro/patient-portal';

// Initialize with default configuration
const config = createDefaultPortalConfig();
const portal = new PatientPortal(
  supabaseClient,
  auditLogger,
  lgpdManager,
  encryptionService,
  notificationService,
  config
);

// Initialize the portal
const result = await portal.initialize();
if (result.success) {
  console.log('Portal initialized successfully!');
}
```

## Usage Examples

### Session Management

```typescript
// Create a new patient session
const sessionResult = await portal.sessionManager.createSession({
  patientId: 'patient-123',
  deviceInfo: {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    deviceType: 'desktop',
  },
  loginMethod: 'password',
});

if (sessionResult.success) {
  const { sessionToken, refreshToken } = sessionResult;
  // Store tokens securely
}
```

### Dashboard Data

```typescript
// Get patient dashboard data
const dashboardData = await portal.dashboard.getDashboardData(
  'patient-123',
  sessionToken
);

console.log('Patient Info:', dashboardData.patientInfo);
console.log('Upcoming Appointments:', dashboardData.upcomingAppointments);
console.log('Treatment Progress:', dashboardData.treatmentProgress);
```

### Appointment Booking

```typescript
// Get available time slots
const slots = await portal.appointments.getAvailableSlots(
  'patient-123',
  sessionToken,
  'service-456',
  new Date('2024-02-01'),
  new Date('2024-02-07')
);

// Book an appointment
const bookingResult = await portal.appointments.bookAppointment(
  {
    patientId: 'patient-123',
    serviceId: 'service-456',
    staffId: 'staff-789',
    preferredDate: new Date('2024-02-05'),
    preferredTime: '14:00',
    notes: 'Follow-up consultation',
    isUrgent: false,
  },
  sessionToken
);
```

### File Upload

```typescript
// Upload patient documents
const uploadResult = await portal.uploads.uploadFiles(
  {
    patientId: 'patient-123',
    files: [file1, file2],
    category: 'medical_records',
    description: 'Lab results from external clinic',
    isPrivate: true,
    tags: ['lab-results', 'external'],
  },
  sessionToken
);

if (uploadResult.success) {
  console.log('Files uploaded:', uploadResult.files);
}
```

### Messaging

```typescript
// Send a message to healthcare provider
const messageResult = await portal.communication.sendMessage(
  {
    patientId: 'patient-123',
    recipientId: 'doctor-456',
    recipientType: 'staff',
    subject: 'Question about medication',
    content: 'I have a question about the dosage...',
    messageType: 'general_inquiry',
    priority: 'normal',
  },
  sessionToken
);
```

## Configuration

### Portal Configuration

```typescript
const config: PatientPortalConfig = {
  session: {
    secretKey: process.env.SESSION_SECRET_KEY,
    tokenExpiration: 24 * 60 * 60 * 1000, // 24 hours
    maxConcurrentSessions: 3,
    deviceTrackingEnabled: true,
  },
  features: {
    appointmentBooking: true,
    documentUpload: true,
    messaging: true,
    treatmentTracking: true,
    billingAccess: false,
    telehealth: true,
  },
  security: {
    twoFactorRequired: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5,
  },
};
```

### Upload Configuration

```typescript
const uploadConfig: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  maxFilesPerUpload: 5,
  virusScanEnabled: true,
  encryptionEnabled: true,
};
```

## Security Features

### Data Encryption

- All sensitive data is encrypted at rest and in transit
- File uploads are encrypted using AES-256
- Messages are end-to-end encrypted

### LGPD Compliance

- Comprehensive audit logging
- Data retention policies
- Patient consent management
- Right to be forgotten implementation

### Session Security

- JWT tokens with short expiration
- Refresh token rotation
- Device fingerprinting
- Concurrent session limits

## Health Monitoring

```typescript
// Check portal health
const healthCheck = await portal.performHealthCheck();
console.log('Portal Status:', healthCheck.status);
console.log('Components:', healthCheck.components);
console.log('Response Time:', healthCheck.responseTime, 'ms');
```

## Error Handling

All portal methods include comprehensive error handling:

```typescript
try {
  const result = await portal.appointments.bookAppointment(request, token);
  if (!result.success) {
    console.error('Booking failed:', result.message);
    if (result.suggestedAlternatives) {
      console.log('Alternative slots:', result.suggestedAlternatives);
    }
  }
} catch (error) {
  console.error('System error:', error.message);
}
```

## Database Schema

The patient portal requires the following database tables:

- `patients` - Patient information
- `patient_sessions` - Session management
- `appointments` - Appointment data
- `services` - Available services
- `staff` - Healthcare providers
- `patient_uploads` - Upload records
- `patient_files` - File metadata
- `messages` - Communication messages
- `conversations` - Message threads
- `notifications` - System notifications

## Environment Variables

```env
SESSION_SECRET_KEY=your-secret-key-here
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
ENCRYPTION_KEY=your-encryption-key
```

## Contributing

1. Follow TypeScript best practices
2. Include comprehensive error handling
3. Add audit logging for all operations
4. Ensure LGPD compliance
5. Write unit tests for new features

## License

Proprietary - NeonPro Healthcare Solutions

---

**Note**: This patient portal system is designed for healthcare environments and includes features specifically for LGPD compliance and Brazilian healthcare regulations.
