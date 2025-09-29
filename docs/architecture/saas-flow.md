---
title: "NeonPro Application Flows"
last_updated: 2025-09-29
form: explanation
tags: [flows, user-journeys, system-interactions, aesthetic-clinics]
related:
  - ./architecture.md
  - ./frontend-architecture.md
  - ./tech-stack.md
  - ./prd.md
---

# NeonPro Application Flows

## Overview

This document describes the core user journeys and system interactions in NeonPro, a mobile-first SaaS platform for Brazilian aesthetic clinics. It focuses on WHAT happens in each flow and WHY, providing a reference for understanding how users interact with the system and how components work together.

**For technical implementation details**, see [architecture.md](./architecture.md) and [frontend-architecture.md](./frontend-architecture.md).

## System Architecture Context

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant API as tRPC API
    participant DB as Supabase
    participant AI as AI Services
    participant N as Notifications

    U->>W: Access platform
    W->>API: Authentication
    API->>DB: Validate credentials
    DB->>API: User data + permissions
    API->>W: Auth response
    W->>U: Dashboard

    U->>W: Request appointment
    W->>API: Appointment data
    API->>AI: Risk analysis
    AI->>API: Predictions
    API->>DB: Store appointment
    DB->>N: Trigger notifications
    N->>U: Confirmation
```

## Authentication & Authorization

### User Authentication Flow

**Purpose**: Multi-role access control for patients, professionals, and administrators

```mermaid
flowchart TD
    A[User Access] --> B{User Type}
    B -->|Patient| C[Patient Login]
    B -->|Professional| D[Professional Login]
    B -->|Admin| E[Admin Login]

    C --> F[Phone/Email + Password]
    D --> G[License + Password]
    E --> H[Admin Credentials]

    F --> I[LGPD Consent Check]
    G --> J[License Verification]
    H --> K[Admin Permissions]

    I --> L[Patient Dashboard]
    J --> M[Professional Dashboard]
    K --> N[Admin Dashboard]
```

**Flow Steps**:

1. User type detection (patient/professional/admin)
2. Role-specific credential validation
3. LGPD consent verification for patients
4. Session creation with appropriate permissions
5. Dashboard routing based on role

### Professional License Validation

**Purpose**: Council-specific license verification (CFM, COREN, CFF, CNEP)

```mermaid
sequenceDiagram
    participant P as Professional
    participant A as Auth System
    participant DB as Database
    participant N as Notifications

    P->>A: Login with license
    A->>DB: Validate license status
    DB->>A: License status + permissions

    alt License Valid
        A->>DB: Update professional data
        A->>P: Grant access
        A->>N: Log authentication
    else License Issues
        A->>P: Restrict access
        A->>N: Alert admin
    end

    Note over A,N: Weekly status check
    A->>DB: Check license validity
    DB->>A: Updated status
    A->>DB: Update permissions
```

**Flow Steps**:

1. Professional submits license number and password
2. System validates license status with council database
3. Verify aesthetic procedure authorizations
4. Grant or restrict access based on license status
5. Create session with appropriate permissions
6. Weekly automated license status checks

## Patient Management

### Patient Registration & Onboarding

**Purpose**: LGPD-compliant patient onboarding with treatment history

```mermaid
sequenceDiagram
    participant P as Patient
    participant W as Web App
    participant L as LGPD Engine
    participant DB as Database
    participant N as Notifications

    P->>W: Start registration
    W->>L: Check LGPD requirements
    L->>W: Present consent forms
    W->>P: Consent interface
    P->>W: Provide consent + info
    W->>DB: Store consent + profile
    DB->>W: Patient ID created
    W->>P: Treatment history form
    P->>W: Complete history
    W->>DB: Store treatment data
    DB->>N: Trigger welcome
    N->>P: WhatsApp confirmation
```

**Flow Steps**:

1. Patient initiates registration
2. System presents LGPD consent forms
3. Patient provides consent for data processing
4. Collect personal details (name, contact, address)
5. Gather treatment history, preferences, goals
6. Generate patient profile with unique ID
7. Send WhatsApp confirmation with next steps

### Patient Lifecycle Management

**Purpose**: Complete patient lifecycle with treatment history tracking

```mermaid
flowchart TD
    A[Patient Search] --> B[Patient Profile]
    B --> C[Treatment History]
    B --> D[Appointment History]
    B --> E[Communication Log]

    C --> F[Skin Type & Concerns]
    C --> G[Treatment Goals]
    C --> H[Previous Procedures]

    D --> I[Past Appointments]
    D --> J[Upcoming Appointments]
    D --> K[Cancelled/No-Shows]

    E --> L[WhatsApp History]
    E --> M[Email History]
    E --> N[Call Logs]
```

**Flow Steps**:

1. Search patient by name, phone, or email
2. Load comprehensive patient profile
3. Access treatment history (skin type, concerns, goals, procedures)
4. Review appointment history with patterns
5. Access complete communication history

## Professional Workflows

### Professional Dashboard

**Purpose**: Centralized interface for managing appointments, patients, and analytics

```mermaid
flowchart LR
    A[Professional Login] --> B[Dashboard]
    B --> C[Today's Schedule]
    B --> D[Patient Management]
    B --> E[Treatment Planning]
    B --> F[Analytics]

    C --> G[Appointments]
    D --> H[Patient Search]
    E --> I[Treatment Plans]
    F --> J[Revenue Metrics]
```

**Flow Steps**:

1. Display key metrics (appointments, revenue, satisfaction)
2. View today's schedule with available slots
3. Search patients and access treatment history
4. Plan treatments and consultations
5. Track revenue and appointment analytics

## Appointment Management

### Appointment Scheduling

**Purpose**: AI-powered scheduling with no-show prediction and WhatsApp integration

```mermaid
sequenceDiagram
    participant P as Patient
    participant W as Web App
    participant AI as AI Engine
    participant S as Scheduling
    participant DB as Database
    participant WP as WhatsApp

    P->>W: Request appointment
    W->>AI: Analyze history
    AI->>S: Get slots + risk
    S->>DB: Query availability
    DB->>S: Available slots
    S->>AI: Slots + data
    AI->>W: Recommendations
    W->>P: Present options
    P->>W: Select slot
    W->>S: Create appointment
    S->>DB: Store data
    DB->>AI: Update models
    AI->>WP: Schedule reminders
    WP->>P: Confirmation
```

**Flow Steps**:

1. Patient submits appointment request with procedure preferences
2. AI analyzes patient history and no-show risk factors
3. System queries professional schedules and resource availability
4. AI generates optimized recommendations
5. Display best options with duration and preparation
6. Patient selects slot, system creates appointment
7. WhatsApp confirmation with preparation instructions

### Anti-No-Show Engine

**Purpose**: AI-powered prediction and intervention to reduce appointment cancellations

```mermaid
flowchart LR
    A[New Appointment] --> B[Risk Analysis]
    B --> C{Risk Level}
    C -->|High 70%+| D[Proactive Outreach]
    C -->|Medium 30-70%| E[Standard Sequence]
    C -->|Low <30%| F[Basic Confirmation]

    D --> G[WhatsApp + SMS + Call]
    E --> H[WhatsApp + SMS]
    F --> I[WhatsApp Only]

    G --> J[Monitor Response]
    H --> J
    I --> J

    J --> K{Response}
    K -->|No Response| L[Escalate]
    K -->|Positive| M[Confirm]
    K -->|Cancel| N[Reschedule]

    L --> O[Professional Intervention]
    M --> P[Update Model]
    N --> Q[Offer Alternatives]

    O --> P
    Q --> P
    P --> R[Adjust Predictions]
```

**Flow Steps**:

1. Analyze patient history and behavioral patterns
2. Classify appointments as high, medium, or low risk
3. Deploy appropriate WhatsApp reminder sequence
4. Track patient engagement with reminders
5. Escalate to professional intervention for high-risk cases
6. Update prediction algorithms based on outcomes

## Compliance & Data Protection

### LGPD Compliance Flow

**Purpose**: Patient data protection and consent management

```mermaid
sequenceDiagram
    participant P as Patient
    participant W as Web App
    participant L as LGPD Engine
    participant A as Audit
    participant DB as Database

    P->>W: Access platform
    W->>L: Check requirements
    L->>DB: Query consents

    alt Consent Required
        L->>W: Present forms
        W->>P: Consent interface
        P->>W: Provide consent
        W->>L: Process consent
        L->>DB: Store with timestamp
        L->>A: Log event
    else Consent Valid
        L->>W: Proceed
        W->>P: Continue
    end

    L->>A: Log activities
    A->>DB: Store audit trail
```

**Flow Steps**:

1. Verify existing consents for patient data processing
2. Present consent forms for treatment and marketing
3. Store consent with timestamp and legal basis
4. Proceed with authorized data processing
5. Record all data processing for compliance audit
6. Process patient data access and deletion requests

### Real-time Compliance Monitoring

**Purpose**: Continuous monitoring of regulatory compliance (LGPD, CFM, ANVISA)

```mermaid
flowchart TD
    A[Platform Activity] --> B[Compliance Engine]
    B --> C{Check Type}
    C -->|LGPD| D[Data Protection]
    C -->|CFM| E[License Check]
    C -->|ANVISA| F[Device Validation]

    D --> G[Audit Log]
    E --> G
    F --> G

    G --> H{Violation?}
    H -->|Yes| I[Alert]
    H -->|No| J[Continue]

    I --> K[Notifications]
    K --> L[Professional Alert]
    K --> M[Admin Dashboard]
    K --> N[Compliance Report]
```

**Flow Steps**:

1. Real-time monitoring of all platform activities
2. Multi-layer validation (LGPD, CFM, ANVISA)
3. Comprehensive audit trail creation
4. Automated violation detection
5. Immediate alerts with severity classification
6. Stakeholder notification and corrective action tracking

## Treatment Workflows

### Treatment Planning

**Purpose**: Structured treatment planning with patient consultation

```mermaid
flowchart TD
    A[Patient Consultation] --> B[Assessment]
    B --> C[Treatment Options]
    C --> D[Goal Alignment]
    D --> E[Patient Education]
    E --> F[Consent]
    F --> G[Treatment Plan]
    G --> H[Scheduling]
```

**Flow Steps**:

1. Professional evaluates patient goals and concerns
2. Review skin type, concerns, and suitable procedures
3. Present aesthetic procedures with expected outcomes
4. Ensure patient expectations match realistic outcomes
5. Provide detailed procedure and aftercare information
6. Obtain informed consent for planned procedures
7. Document treatment plan with timeline and costs
8. Schedule treatment sessions with appropriate intervals

### Procedure Execution

**Purpose**: Structured procedure execution with safety protocols

```mermaid
sequenceDiagram
    participant P as Professional
    participant S as System
    participant PT as Patient
    participant D as Documentation
    participant C as Compliance

    P->>S: Start session
    S->>C: Verify compliance
    C->>S: Status confirmed
    S->>P: Display checklist
    P->>PT: Pre-procedure check
    PT->>P: Consent confirmed
    P->>S: Begin documentation
    S->>D: Create record
    P->>S: Document steps
    S->>D: Real-time updates
    P->>S: Complete procedure
    S->>D: Finalize
    D->>C: Verify compliance
    C->>S: Generate certificate
```

**Flow Steps**:

1. Professional starts procedure session with patient verification
2. System verifies all regulatory requirements
3. Execute safety checklist and consent verification
4. Document each procedure step with timestamps
5. Track procedure progress and complications
6. Finalize documentation and generate certificates
7. Provide aftercare instructions and schedule follow-up

### Photo Management & Consent

**Purpose**: Before/after photo management with LGPD compliance

```mermaid
sequenceDiagram
    participant P as Professional
    participant PT as Patient
    participant S as System
    participant PM as Photo Manager
    participant L as LGPD
    participant A as Audit

    P->>PT: Request consent
    PT->>S: Sign consent
    S->>L: Validate compliance
    L->>S: Confirmed
    S->>PM: Create session

    P->>PM: Capture before
    PM->>S: Upload with metadata
    S->>A: Log event
    A->>S: Trail created

    P->>S: Perform procedure
    S->>A: Log details

    P->>PM: Capture after
    PM->>S: Upload with correlation
    S->>A: Log documentation
    A->>S: Generate certificate
```

**Flow Steps**:

1. Granular consent for treatment, marketing, portfolio, educational use
2. Structured photo capture with standardized protocols
3. Automatic correlation with treatment records
4. Automated watermarking, encryption, access controls
5. Scheduled cleanup based on consent expiration
6. Real-time monitoring of photo access and usage

### Multi-Council Professional Validation

**Purpose**: Council-specific validation (CFM, COREN, CFF, CNEP)

```mermaid
flowchart TD
    A[Registration] --> B{Council}
    B -->|CFM| C[Medical]
    B -->|COREN| D[Nursing]
    B -->|CFF| E[Pharmacy]
    B -->|CNEP| F[Aesthetic]

    C --> G[CFM Portal]
    D --> H[COREN Registry]
    E --> I[CFF License]
    F --> J[CNEP Certification]

    G --> K[License Status]
    H --> K
    I --> K
    J --> K

    K --> L{Valid?}
    L -->|Yes| M[Specialty Check]
    L -->|No| N[Restrict Access]

    M --> O[Authorization Matrix]
    O --> P[Access Level]
    P --> Q[Dashboard]

    N --> R[Alert]
    R --> S[Admin Notification]
```

**Flow Steps**:

1. Automatic identification of professional council type
2. Real-time license validation via council APIs
3. Validation of aesthetic procedure specializations
4. Determination of authorized procedures
5. Real-time permission updates based on license status
6. Continuous monitoring of license validity

### Equipment Integration

**Purpose**: ANVISA-compliant device management

```mermaid
sequenceDiagram
    participant E as Equipment
    participant S as System
    participant T as Technician
    participant P as Professional
    participant A as Audit
    participant C as Compliance

    E->>S: Status + calibration
    S->>C: Validate ANVISA
    C->>S: Confirmed
    S->>A: Log check
    A->>S: Trail created

    P->>S: Request equipment
    S->>E: Verify availability
    E->>S: Readiness confirmed
    S->>P: Grant access

    T->>E: Safety check
    E->>S: Check results
    S->>C: Validate safety
    C->>S: Verified
    S->>P: Authorize start

    P->>E: Use equipment
    E->>S: Usage data
    S->>A: Log execution
    A->>S: Update schedule
    C->>S: Monitor compliance
```

**Flow Steps**:

1. ANVISA compliance verification and device classification
2. Scheduled maintenance and calibration tracking
3. Pre-procedure safety checks and parameter verification
4. Real-time tracking of equipment utilization
5. Automated maintenance scheduling based on usage
6. Generation of ANVISA compliance reports

## Patient Communication

### Marketing & Communication

**Purpose**: Consent-based marketing and multi-channel communication

```mermaid
flowchart TD
    A[Patient Profile] --> B{Consent}
    B -->|Given| C[Campaign Creation]
    B -->|No| D[Basic Only]

    C --> E[Personalization]
    E --> F[Channel Selection]
    F --> G[Scheduling]

    G --> H{Type}
    H -->|Educational| I[Treatment Info]
    H -->|Promotional| J[Offers]
    H -->|Follow-up| K[Post-care]

    I --> L[Multi-channel]
    J --> L
    K --> L

    L --> M[Engagement Tracking]
    M --> N{Response}
    N -->|Positive| O[Conversion]
    N -->|Negative| P[Optimization]

    O --> Q[ROI Reporting]
    P --> R[Adjustment]

    D --> S[Transactional]
    S --> T[Reminders]
    S --> U[Follow-ups]
```

**Flow Steps**:

1. Granular marketing consent tracking and preference management
2. AI-driven content customization based on treatment history
3. Multi-channel communication (email, SMS, WhatsApp, push)
4. Automated campaign scheduling and execution
5. Real-time tracking of patient engagement and response
6. LGPD compliance monitoring for marketing communications

## Summary

This document describes the core user journeys and system interactions in NeonPro, focusing on how users interact with the system and how components work together.

### Key Flows

**Authentication & Authorization**

- Multi-role access control (patients, professionals, admins)
- Council-specific license validation (CFM, COREN, CFF, CNEP)
- LGPD-compliant consent management

**Patient Management**

- LGPD-compliant onboarding with treatment history
- Complete patient lifecycle tracking
- Multi-channel communication

**Appointment Management**

- AI-powered scheduling with no-show prediction
- WhatsApp-first communication strategy
- Real-time availability optimization

**Treatment Workflows**

- Structured treatment planning with patient consultation
- Procedure execution with safety protocols
- Before/after photo management with LGPD compliance

**Compliance & Monitoring**

- Real-time compliance monitoring (LGPD, CFM, ANVISA)
- Comprehensive audit trail generation
- Automated violation detection and alerting

### Integration Points

All flows integrate with:

- WhatsApp Business API for patient communication
- AI-powered risk assessment and optimization
- Real-time schedule synchronization
- LGPD-compliant data handling
- Multi-council professional validation

**For technical implementation details**, see:

- [System Architecture](./architecture.md) - Architecture overview and design patterns
- [Frontend Architecture](./frontend-architecture.md) - UI/UX implementation patterns
- [Technology Stack](./tech-stack.md) - Technology decisions and rationale
- [Source Tree](./source-tree.md) - Code organization and structure
