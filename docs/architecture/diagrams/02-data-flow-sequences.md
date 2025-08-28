# 🔄 NeonPro Healthcare Platform - Data Flow Sequences

## 🔐 Patient Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant F as Frontend (Next.js)
    participant A as API (Hono.dev)
    participant Auth as Auth Service
    participant DB as Database
    participant Audit as Audit System
    
    Note over P,Audit: Standard Patient Login Flow
    
    P->>F: Enter credentials (CPF + password)
    F->>A: POST /auth/login with credentials
    A->>Auth: Validate credentials + clinic context
    Auth->>DB: Query user with clinic_id isolation
    DB->>Auth: Return user data (if exists)
    Auth->>A: Generate JWT with patient role
    A->>Audit: Log authentication event
    Audit->>DB: Store login audit trail
    A->>F: Return JWT + user profile
    F->>P: Redirect to patient dashboard
    
    Note over P,Audit: Subsequent Authenticated Requests
    
    P->>F: Request patient data
    F->>A: GET /patients/me with JWT header
    A->>Auth: Validate JWT + extract clinic_id
    Auth->>A: Return validated user context
    A->>DB: Query patient data with RLS
    DB->>A: Return filtered patient data
    A->>Audit: Log patient data access
    A->>F: Return patient information
    F->>P: Display patient dashboard
```

## 🏥 Healthcare Provider Professional License Validation

```mermaid
sequenceDiagram
    participant HP as Healthcare Provider
    participant F as Frontend
    participant A as API
    participant Auth as Auth Service
    participant LV as License Validator
    participant CRM as CRM/CRF APIs
    participant DB as Database
    participant Audit as Audit System
    
    Note over HP,Audit: Provider Registration with License Validation
    
    HP->>F: Submit registration (CRM license + credentials)
    F->>A: POST /auth/register/provider
    A->>Auth: Validate input + professional data
    Auth->>LV: Validate professional license
    LV->>CRM: Query CRM/CRF for license status
    CRM->>LV: Return license validation result
    LV->>Auth: Return validation status + metadata
    
    alt License Valid
        Auth->>DB: Create provider account with license info
        DB->>Auth: Confirm account creation
        Auth->>A: Generate professional JWT token
        A->>Audit: Log provider registration success
        A->>F: Return success + JWT token
        F->>HP: Registration successful
    else License Invalid/Expired
        Auth->>A: Reject registration with reason
        A->>Audit: Log failed registration attempt
        A->>F: Return error with validation details
        F->>HP: Display license validation error
    end
```

## 🚨 Emergency Access Protocol Flow

```mermaid
sequenceDiagram
    participant EP as Emergency Physician
    participant F as Frontend
    participant A as API
    participant Auth as Auth Service
    participant EA as Emergency Access
    participant DB as Database
    participant Audit as Audit System
    participant Notify as Notification Service
    
    Note over EP,Notify: Emergency Patient Data Access
    
    EP->>F: Request emergency access (patient_id + justification)
    F->>A: POST /emergency/access with emergency token
    A->>Auth: Validate emergency physician license
    Auth->>EA: Check emergency access permissions
    EA->>A: Grant temporary elevated permissions
    A->>DB: Query patient data with emergency override
    DB->>A: Return complete patient medical data
    A->>Audit: Log emergency access with full details
    Audit->>Notify: Trigger emergency access notifications
    Notify->>DB: Notify patient of emergency access
    A->>F: Return patient data with emergency context
    F->>EP: Display patient data with emergency banner
    
    Note over EP,Notify: Emergency Access Audit Trail
    
    EP->>F: Complete emergency treatment documentation
    F->>A: POST /emergency/treatment-log
    A->>DB: Store emergency treatment record
    A->>Audit: Log emergency treatment completion
    Audit->>Notify: Schedule follow-up notifications
    A->>F: Confirm emergency documentation stored
```

## 📋 Patient Appointment Booking Flow

```mermaid
sequenceDiagram
    participant P as Patient
    participant F as Frontend
    participant A as API
    participant Auth as Auth Service
    participant AS as Appointment Service
    participant NS as Notification Service
    participant DB as Database
    participant Audit as Audit System
    
    Note over P,Audit: Complete Appointment Booking Flow
    
    P->>F: Browse available appointment slots
    F->>A: GET /appointments/available?clinic_id&provider_id
    A->>Auth: Validate patient token + clinic access
    Auth->>A: Confirm patient belongs to clinic
    A->>AS: Query available slots with constraints
    AS->>DB: Get provider schedule + existing appointments
    DB->>AS: Return available time slots
    AS->>A: Calculate available appointments
    A->>F: Return available slots with provider info
    F->>P: Display appointment calendar
    
    P->>F: Select appointment slot + confirm
    F->>A: POST /appointments/book with slot details
    A->>Auth: Validate patient + appointment permissions
    Auth->>A: Confirm patient can book with provider
    A->>AS: Process appointment booking
    AS->>DB: Create appointment with LGPD consent
    DB->>AS: Confirm appointment created
    AS->>NS: Schedule appointment notifications
    NS->>DB: Store notification preferences
    AS->>A: Return appointment confirmation
    A->>Audit: Log appointment booking with consent
    A->>F: Return booking confirmation
    F->>P: Display appointment confirmation + calendar
```

## 🔍 LGPD Data Access & Audit Flow

```mermaid
sequenceDiagram
    participant U as User (Any Role)
    participant F as Frontend
    participant A as API
    participant Auth as Auth Service
    participant LGPD as LGPD Middleware
    participant DB as Database
    participant Audit as Audit System
    participant Encrypt as Encryption Service
    
    Note over U,Encrypt: LGPD-Compliant Patient Data Access
    
    U->>F: Request patient sensitive data
    F->>A: GET /patients/{id}/medical-history with JWT
    A->>Auth: Validate token + extract user context
    Auth->>LGPD: Check LGPD consent for data access
    LGPD->>DB: Verify patient consent status
    DB->>LGPD: Return current consent permissions
    
    alt Consent Valid
        LGPD->>A: Proceed with data access
        A->>DB: Query encrypted patient data with RLS
        DB->>Encrypt: Decrypt sensitive fields
        Encrypt->>DB: Return decrypted patient data
        DB->>A: Return patient medical history
        A->>Audit: Log sensitive data access with details
        Audit->>DB: Store complete audit trail
        A->>F: Return patient data (filtered by role)
        F->>U: Display medical history
    else Consent Expired/Invalid
        LGPD->>A: Block data access + return consent URL
        A->>Audit: Log blocked access attempt
        A->>F: Return consent required error
        F->>U: Redirect to consent management
    end
```

## 🔄 Real-Time Patient Status Updates

```mermaid
sequenceDiagram
    participant HP as Healthcare Provider
    participant F as Frontend
    participant A as API
    participant RT as Real-Time Service
    participant DB as Database
    participant Audit as Audit System
    participant P as Patient App
    
    Note over HP,P: Real-Time Treatment Status Updates
    
    HP->>F: Update patient treatment status
    F->>A: PUT /treatments/{id}/status
    A->>DB: Update treatment record
    DB->>RT: Trigger real-time event
    RT->>A: Broadcast treatment status change
    A->>Audit: Log treatment status change
    
    par Real-Time Notifications
        RT->>F: Update provider dashboard
        F->>HP: Show treatment status updated
    and
        RT->>P: Notify patient of status change
        P->>P: Display treatment progress update
    and
        RT->>A: Trigger automated workflows
        A->>DB: Update related appointment statuses
    end
    
    Note over HP,P: Multi-Channel Notification Delivery
    
    A->>RT: Process notification delivery
    RT->>DB: Check patient notification preferences
    DB->>RT: Return preferred channels (SMS, Email, Push)
    
    par Notification Channels
        RT->>RT: Send SMS notification
        RT->>RT: Send email notification  
        RT->>P: Send push notification
    end
    
    RT->>Audit: Log all notification deliveries
    Audit->>DB: Store notification audit trail
```

---

## 🔐 Security & Compliance Data Flows

### 🛡️ Security Middleware Stack Processing Order

1. **Request ID Generation** - Unique identifier for request tracking
2. **Rate Limiting** - Healthcare-specific endpoint protection
3. **Authentication** - JWT validation with professional licenses
4. **Authorization** - Role-based access with clinic isolation
5. **LGPD Compliance** - Consent validation for patient data
6. **Input Validation** - Brazilian healthcare data format validation
7. **Audit Logging** - Complete request/response logging
8. **Response Security** - Headers and data sanitization

### 📊 Audit Trail Data Structure

```json
{
  "audit_id": "uuid",
  "timestamp": "2025-08-28T22:15:00Z",
  "user_id": "uuid",
  "clinic_id": "uuid",
  "action": "patient_data_access",
  "resource": "/patients/123/medical-history",
  "method": "GET",
  "ip_address": "client_ip",
  "user_agent": "browser_info",
  "professional_license": {
    "type": "CRM",
    "number": "12345-SP",
    "validated_at": "timestamp"
  },
  "lgpd_consent": {
    "patient_id": "uuid",
    "consent_version": "v1.2",
    "granted_at": "timestamp"
  },
  "emergency_context": {
    "is_emergency": false,
    "justification": null
  },
  "data_accessed": ["medical_history", "current_treatments"],
  "processing_time_ms": 245,
  "response_status": 200
}
```

### 🏥 Healthcare Role Permissions Matrix

| Role                | Patient Data     | Medical Records  | Emergency Access | License Required  |
| ------------------- | ---------------- | ---------------- | ---------------- | ----------------- |
| Patient             | Own Only         | Own Only         | No               | No                |
| Healthcare Provider | Clinic Patients  | Clinic Patients  | No               | Yes (CRM/CRF/etc) |
| Emergency Physician | All (with audit) | All (with audit) | Yes              | Yes (CRM)         |
| Clinic Manager      | Clinic Overview  | Summary Only     | No               | Optional          |
| Admin               | Configuration    | No               | No               | No                |
