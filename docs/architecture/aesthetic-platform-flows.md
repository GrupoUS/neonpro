---
title: "NeonPro Platform Flows"
last_updated: 2025-09-10
form: reference
tags: [platform-flows, user-journeys, aesthetic-clinics, workflows]
related:
  - ./architecture.md
  - ./tech-stack.md
  - ../AGENTS.md
---

# NeonPro Platform Flows

## Overview

This document defines the **core user flows and platform interactions** for NeonPro, an AI-first aesthetic clinic management platform. It focuses exclusively on workflow sequences, user journeys, and platform-specific interaction patterns.

**Scope**: Platform flows, user journeys, and workflow sequences
**Target Audience**: Developers implementing user flows and business logic
**Focus**: Brazilian aesthetic clinics (botox, fillers, facial harmonization, laser treatments)
**Compliance Context**: LGPD, ANVISA, CFM requirements integrated into flows

> **Note**: For system architecture see [architecture.md](./architecture.md), for technology details see [tech-stack.md](./tech-stack.md)

## Prerequisites

- Understanding of Brazilian aesthetic clinic operations
- Knowledge of LGPD data protection workflow requirements
- Familiarity with CFM professional oversight standards
- Basic understanding of the current tech stack (TanStack Router + Vite + Hono)

## Core Platform Flow Overview

```mermaid
sequenceDiagram
    participant U as User (Patient/Professional)
    participant W as Web Application (TanStack Router)
    participant API as Hono API
    participant DB as Supabase Database
    participant AI as AI Services
    participant N as Notification System

    U->>W: Access platform
    W->>API: Authentication request
    API->>DB: Validate credentials
    DB->>API: User data + permissions
    API->>W: Authentication response
    W->>U: Dashboard interface

    U->>W: Request appointment
    W->>API: Appointment data
    API->>AI: Risk analysis + availability
    AI->>API: Recommendations + predictions
    API->>DB: Store appointment
    DB->>N: Trigger notifications
    N->>U: Confirmation + reminders
```

## Core Platform Flows

### 1. User Authentication & Authorization Flow

**Purpose**: Secure access control for patients, professionals, and administrators

```mermaid
flowchart TD
    A[User Access] --> B{User Type}
    B -->|Patient| C[Patient Login]
    B -->|Professional| D[Professional Login]
    B -->|Admin| E[Admin Login]

    C --> F[CPF + Password]
    D --> G[CFM License + Password]
    E --> H[Admin Credentials]

    F --> I[LGPD Consent Check]
    G --> J[CFM License Validation]
    H --> K[Admin Permissions]

    I --> L[Patient Dashboard]
    J --> M[Professional Dashboard]
    K --> N[Admin Dashboard]

    style I fill:#e3f2fd
    style J fill:#fff3e0
    style K fill:#e8f5e8
```

**Flow Steps**:

1. **User Type Detection** - System identifies user role (patient/professional/admin)
2. **Credential Validation** - Role-specific authentication (CPF, CFM license, admin credentials)
3. **Compliance Checks** - LGPD consent verification, CFM license validation
4. **Session Creation** - Generate secure session with appropriate permissions
5. **Dashboard Routing** - Navigate to role-specific dashboard interface

### 2. Patient Registration & Onboarding Flow

**Purpose**: Comprehensive patient onboarding with LGPD compliance and medical history collection

```mermaid
sequenceDiagram
    participant P as Patient
    participant W as Web App
    participant L as LGPD Engine
    participant DB as Database
    participant N as Notification System

    P->>W: Start registration
    W->>L: Check LGPD requirements
    L->>W: Present consent forms
    W->>P: LGPD consent interface
    P->>W: Provide consent + basic info
    W->>DB: Store consent + create profile
    DB->>W: Patient ID created
    W->>P: Medical history form
    P->>W: Complete medical history
    W->>DB: Store medical data
    DB->>N: Trigger welcome sequence
    N->>P: Welcome email + next steps
```

**Flow Steps**:

1. **Registration Initiation** - Patient starts registration process
2. **LGPD Compliance Check** - System presents required consent forms
3. **Consent Collection** - Patient provides granular consent for data processing
4. **Basic Information** - Collect personal details (CPF, contact info, address)
5. **Medical History** - Gather allergies, medications, previous treatments
6. **Profile Creation** - Generate patient profile with unique ID
7. **Welcome Sequence** - Send confirmation and onboarding materials

### 3. Professional Dashboard & Workflow Management

**Purpose**: Comprehensive professional interface for managing patients, appointments, and treatments

```mermaid
flowchart LR
    A[Professional Login] --> B[Dashboard Overview]
    B --> C[Today's Schedule]
    B --> D[Patient Management]
    B --> E[Treatment Planning]
    B --> F[Compliance Monitoring]

    C --> G[Appointment Details]
    C --> H[Patient Preparation]
    C --> I[Treatment Notes]

    D --> J[Patient Search]
    D --> K[Medical History]
    D --> L[Treatment History]

    E --> M[Procedure Selection]
    E --> N[Risk Assessment]
    E --> O[Treatment Plan]

    F --> P[CFM Compliance]
    F --> Q[ANVISA Requirements]
    F --> R[LGPD Monitoring]

    style A fill:#e3f2fd
    style F fill:#fff3e0
```

**Flow Steps**:

1. **Dashboard Overview** - Display key metrics (appointments, revenue, compliance status)
2. **Schedule Management** - View today's appointments, available slots, blocked times
3. **Patient Management** - Search patients, access medical/treatment history
4. **Treatment Planning** - Select procedures, assess risks, create treatment plans
5. **Compliance Monitoring** - Track CFM license status, ANVISA requirements, LGPD tasks

### 4. Appointment Scheduling Flow

**Purpose**: Intelligent appointment scheduling with anti-no-show prediction and optimization

```mermaid
sequenceDiagram
    participant P as Patient
    participant W as Web App
    participant AI as AI Engine
    participant S as Scheduling Service
    participant DB as Database
    participant N as Notification System

    P->>W: Request appointment
    W->>AI: Analyze patient history + preferences
    AI->>S: Get available slots + risk assessment
    S->>DB: Query professional availability
    DB->>S: Available time slots
    S->>AI: Slots + professional data
    AI->>W: Optimized recommendations
    W->>P: Present best options
    P->>W: Select preferred slot
    W->>S: Create appointment
    S->>DB: Store appointment data
    DB->>AI: Update prediction models
    AI->>N: Generate reminder schedule
    N->>P: Confirmation + preparation instructions
```

**Flow Steps**:

1. **Request Analysis** - Patient submits appointment request with procedure type and preferences
2. **History Review** - AI analyzes patient history, previous no-shows, and risk factors
3. **Availability Check** - System queries professional schedules and resource availability
4. **AI Optimization** - Generate recommendations based on multiple optimization factors
5. **Presentation** - Display best options to patient with estimated duration and preparation
6. **Selection & Booking** - Patient selects slot, system creates appointment record
7. **Prediction Update** - Update AI models with new booking data for future optimization

### 5. Anti-No-Show Engine Flow

**Purpose**: Predictive analytics to prevent appointment cancellations with multi-channel communication

```mermaid
flowchart LR
    A[New Appointment] --> B[Risk Analysis + Patient History]
    B --> C{Risk Level}
    C -->|High Risk 70%+| D[Proactive Multi-Channel Outreach]
    C -->|Medium Risk 30-70%| E[Standard Reminder Sequence]
    C -->|Low Risk <30%| F[Basic Confirmation]

    D --> G[Email + SMS + Phone Call]
    E --> H[Email + SMS]
    F --> I[Email Confirmation]

    G --> J[Monitor Response]
    H --> J
    I --> J

    J --> K{Response Analysis}
    K -->|No Response| L[Escalate Communication]
    K -->|Positive Response| M[Confirm Appointment]
    K -->|Cancellation Request| N[Reschedule Flow]

    L --> O[Professional Intervention]
    M --> P[Update Prediction Model]
    N --> Q[Alternative Slot Offering]

    O --> P
    Q --> P
    P --> R[Adjust Future Predictions]
```

**Flow Steps**:

1. **Risk Assessment** - Analyze patient history, previous no-shows, and behavioral patterns
2. **Risk Categorization** - Classify appointments as high, medium, or low risk
3. **Communication Strategy** - Deploy appropriate reminder sequence based on risk level
4. **Response Monitoring** - Track patient engagement with reminders and confirmations
5. **Intervention Escalation** - Escalate to professional intervention for high-risk cases
6. **Model Learning** - Update prediction algorithms based on actual outcomes

### 6. Patient Management Flow

**Purpose**: Comprehensive patient lifecycle management with medical history and treatment tracking

```mermaid
flowchart TD
    A[Patient Search/Selection] --> B[Patient Profile]
    B --> C[Medical History]
    B --> D[Treatment History]
    B --> E[Appointment History]
    B --> F[Communication Log]

    C --> G[Allergies & Conditions]
    C --> H[Current Medications]
    C --> I[Previous Procedures]

    D --> J[Treatment Plans]
    D --> K[Progress Photos]
    D --> L[Treatment Notes]

    E --> M[Past Appointments]
    E --> N[Upcoming Appointments]
    E --> O[Cancelled/No-Shows]

    F --> P[Email History]
    F --> Q[SMS History]
    F --> R[Phone Call Logs]

    style A fill:#e3f2fd
    style G fill:#fff3e0
    style J fill:#e8f5e8
```

**Flow Steps**:

1. **Patient Search** - Search and select patient from database using CPF, name, or phone
2. **Profile Access** - Load comprehensive patient profile with all related data
3. **Medical History Review** - Access allergies, conditions, medications, and previous procedures
4. **Treatment History** - Review treatment plans, progress photos, and professional notes
5. **Appointment History** - View past, upcoming, and cancelled appointments with patterns
6. **Communication Log** - Access complete communication history across all channels

### 7. Professional Authentication Flow with CFM Integration

**Purpose**: CFM license validation for aesthetic procedures with real-time verification

```mermaid
sequenceDiagram
    participant P as Professional
    participant A as Auth System
    participant CFM as CFM API
    participant DB as Database
    participant N as Notification System

    P->>A: Login with CFM credentials
    A->>CFM: Validate CFM + aesthetic specialization
    CFM->>A: Return license status + specializations

    alt License Valid & Current
        A->>DB: Store/update professional data
        A->>P: Grant access to procedures
        A->>N: Log successful authentication
    else License Issues
        A->>P: Restrict access + show requirements
        A->>N: Alert admin of license issues
        A->>DB: Log compliance violation
    end

    Note over A,N: Periodic license revalidation
    A->>CFM: Daily license status check
    CFM->>A: Updated license information
    A->>DB: Update professional status
```

**Flow Steps**:

1. **Credential Submission** - Professional submits CFM license number and password
2. **CFM Validation** - System validates license with CFM database in real-time
3. **Specialization Check** - Verify aesthetic procedure specializations and certifications
4. **Access Control** - Grant or restrict access based on license status and specializations
5. **Compliance Logging** - Record authentication events for audit and compliance
6. **Session Management** - Create secure session with appropriate procedure permissions
7. **Periodic Revalidation** - Daily automated checks to ensure continued license validity

### 8. LGPD Compliance Flow

**Purpose**: Automated consent management and data protection with comprehensive audit trail

```mermaid
sequenceDiagram
    participant P as Patient
    participant W as Web App
    participant L as LGPD Engine
    participant A as Audit System
    participant DB as Database

    P->>W: Access platform/provide data
    W->>L: Check LGPD requirements
    L->>DB: Query existing consents

    alt Consent Required
        L->>W: Present consent forms
        W->>P: LGPD consent interface
        P->>W: Provide/update consent
        W->>L: Process consent
        L->>DB: Store consent with timestamp
        L->>A: Log consent event
    else Consent Valid
        L->>W: Proceed with data processing
        W->>P: Continue normal flow
    end

    L->>A: Log all data processing activities
    A->>DB: Store audit trail
```

**Flow Steps**:

1. **Consent Check** - Verify existing consents for specific data processing activities
2. **Consent Collection** - Present granular consent forms for missing permissions
3. **Consent Storage** - Store consent with timestamp, IP address, and legal basis
4. **Data Processing** - Proceed with authorized data processing activities
5. **Audit Logging** - Record all data processing activities for compliance audit
6. **Request Handling** - Process patient data access, rectification, and deletion requests
7. **Compliance Monitoring** - Continuous monitoring of consent validity and data retention

## Treatment & Procedure Flows

### 9. Treatment Planning Flow

**Purpose**: Comprehensive treatment planning with risk assessment and patient education

```mermaid
flowchart TD
    A[Patient Consultation] --> B[Medical Assessment]
    B --> C[Treatment Options]
    C --> D[Risk Analysis]
    D --> E[Patient Education]
    E --> F[Consent Process]
    F --> G[Treatment Plan]
    G --> H[Scheduling]

    style A fill:#e3f2fd
    style D fill:#fff3e0
    style F fill:#e8f5e8
```

**Flow Steps**:

1. **Initial Consultation** - Professional evaluates patient goals and medical history
2. **Medical Assessment** - Review contraindications, allergies, and risk factors
3. **Treatment Options** - Present suitable procedures with expected outcomes
4. **Risk Analysis** - AI-powered risk assessment based on patient profile
5. **Patient Education** - Provide detailed information about procedures and aftercare
6. **Informed Consent** - Obtain specific consent for each planned procedure
7. **Treatment Plan Creation** - Document comprehensive treatment plan with timeline
8. **Appointment Scheduling** - Schedule treatment sessions with appropriate intervals

### 10. Procedure Execution Flow

**Purpose**: Step-by-step procedure execution with safety protocols and documentation

```mermaid
sequenceDiagram
    participant P as Professional
    participant S as System
    participant PT as Patient
    participant D as Documentation
    participant C as Compliance

    P->>S: Start procedure session
    S->>C: Verify compliance requirements
    C->>S: Compliance status confirmed
    S->>P: Display procedure checklist
    P->>PT: Pre-procedure verification
    PT->>P: Consent confirmation
    P->>S: Begin procedure documentation
    S->>D: Create procedure record
    P->>S: Document each step
    S->>D: Real-time documentation
    P->>S: Complete procedure
    S->>D: Finalize documentation
    D->>C: Compliance verification
    C->>S: Generate completion certificate
```

**Flow Steps**:

1. **Session Initiation** - Professional starts procedure session with patient verification
2. **Compliance Check** - System verifies all regulatory requirements are met
3. **Pre-procedure Protocol** - Execute safety checklist and final consent verification
4. **Real-time Documentation** - Document each procedure step with timestamps
5. **Progress Monitoring** - Track procedure progress and any complications
6. **Completion Protocol** - Finalize documentation and generate compliance certificates
7. **Post-procedure Instructions** - Provide aftercare instructions and follow-up scheduling

## Compliance & Monitoring Flows

### 11. Real-time Compliance Monitoring Flow

**Purpose**: Continuous monitoring of regulatory compliance across all platform activities

```mermaid
flowchart TD
    A[Platform Activity] --> B[Compliance Engine]
    B --> C{Compliance Check}
    C -->|LGPD| D[Data Protection Validation]
    C -->|CFM| E[Professional License Check]
    C -->|ANVISA| F[Device/Procedure Validation]

    D --> G[Audit Log]
    E --> G
    F --> G

    G --> H{Violation Detected?}
    H -->|Yes| I[Alert Generation]
    H -->|No| J[Continue Operation]

    I --> K[Notification System]
    K --> L[Professional Alert]
    K --> M[Admin Dashboard]
    K --> N[Compliance Report]

    style C fill:#fff3e0
    style H fill:#ffebee
    style I fill:#e8f5e8
```

**Flow Steps**:

1. **Activity Monitoring** - Real-time monitoring of all platform activities and data processing
2. **Multi-layer Compliance Check** - Simultaneous validation against LGPD, CFM, and ANVISA requirements
3. **Audit Trail Creation** - Comprehensive logging of all compliance checks and results
4. **Violation Detection** - Automated detection of potential compliance violations
5. **Alert Generation** - Immediate alerts for compliance issues with severity classification
6. **Stakeholder Notification** - Notify relevant professionals, administrators, and compliance officers
7. **Corrective Action Tracking** - Monitor resolution of compliance issues and preventive measures

## Treatment & Procedure Flows

### 12. Photo Management & Consent Flows

**Purpose**: Comprehensive before/after photo management with LGPD compliance and consent tracking

```mermaid
sequenceDiagram
    participant P as Professional
    participant C as Client
    participant S as System
    participant PM as Photo Manager
    participant L as LGPD Engine
    participant A as Audit System

    P->>C: Request photo consent for treatment
    C->>S: Review and sign photo consent forms
    S->>L: Validate LGPD compliance
    L->>S: Consent validation confirmed
    S->>PM: Create photo session record
    
    P->>PM: Capture before photos
    PM->>S: Upload with metadata and consent
    S->>A: Log photo capture event
    A->>S: Audit trail created
    
    P->>S: Perform aesthetic procedure
    S->>A: Log procedure details
    
    P->>PM: Capture after photos
    PM->>S: Upload with treatment correlation
    S->>A: Log complete treatment documentation
    A->>S: Generate compliance certificate
```

**Flow Steps**:

1. **Consent Collection** - Granular consent for treatment, marketing, portfolio, and educational use
2. **Photo Session Management** - Structured photo capture with standardized protocols
3. **Metadata Association** - Automatic correlation with treatment records and professional details
4. **Security Processing** - Automated watermarking, encryption, and access controls
5. **Retention Management** - Scheduled cleanup based on consent expiration and retention policies
6. **Compliance Monitoring** - Real-time monitoring of photo access and usage

### 13. Multi-Council Professional Validation Flows

**Purpose**: CFM, COREN, CFF, CNEP integration flows for aesthetic professional validation

```mermaid
flowchart TD
    A[Professional Registration] --> B{Council Type}
    B -->|CFM| C[Medical Doctor Validation]
    B -->|COREN| D[Nursing Validation]
    B -->|CFF| E[Pharmacy/Biochemistry Validation]
    B -->|CNEP| F[Aesthetic Professional Validation]
    
    C --> G[CFM Portal Integration]
    D --> H[COREN Registry Check]
    E --> I[CFF License Verification]
    F --> J[CNEP Certification Validation]
    
    G --> K[Real-time License Status]
    H --> K
    I --> K
    J --> K
    
    K --> L{License Valid?}
    L -->|Yes| M[Specialty Verification]
    L -->|No| N[Access Restricted]
    
    M --> O[Procedure Authorization Matrix]
    O --> P[Access Level Assignment]
    P --> Q[Professional Dashboard]
    
    N --> R[Compliance Alert]
    R --> S[Administrator Notification]

    style B fill:#e3f2fd
    style L fill:#fff3e0
    style P fill:#e8f5e8
```

**Flow Steps**:

1. **Council Type Detection** - Automatic identification of professional council type
2. **Real-time License Validation** - Direct integration with council APIs for current status
3. **Specialty Certification Verification** - Validation of aesthetic procedure specializations
4. **Scope of Practice Assessment** - Determination of authorized procedures based on license
5. **Dynamic Access Control** - Real-time permission updates based on license status
6. **Compliance Monitoring** - Continuous monitoring of license validity and renewals

### 14. Aesthetic Equipment Integration Flows

**Purpose**: Device management and compliance workflows for aesthetic equipment

```mermaid
sequenceDiagram
    participant E as Equipment
    participant S as System
    participant T as Technician
    participant P as Professional
    participant A as Audit System
    participant C as Compliance Engine

    E->>S: Equipment status and calibration data
    S->>C: Validate ANVISA compliance
    C->>S: Compliance status confirmed
    S->>A: Log equipment check
    A->>S: Audit trail created
    
    P->>S: Request equipment for procedure
    S->>E: Verify availability and readiness
    E->>S: Equipment readiness confirmation
    S->>P: Grant equipment access
    
    T->>E: Perform pre-procedure safety check
    E->>S: Safety check results
    S->>C: Validate safety parameters
    C->>S: Safety verification complete
    S->>P: Authorize procedure start
    
    P->>E: Use equipment for treatment
    E->>S: Real-time usage data
    S->>A: Log procedure execution
    A->>S: Update maintenance schedule
    C->>S: Monitor compliance during use
```

**Flow Steps**:

1. **Equipment Registration** - ANVISA compliance verification and device classification
2. **Calibration Management** - Scheduled maintenance and calibration tracking
3. **Safety Protocol Validation** - Pre-procedure safety checks and parameter verification
4. **Usage Monitoring** - Real-time tracking of equipment utilization and performance
5. **Maintenance Scheduling** - Automated maintenance scheduling based on usage patterns
6. **Compliance Reporting** - Generation of ANVISA compliance reports and documentation

### 15. Client Marketing & Communication Flows

**Purpose**: Consent-based marketing and communication flows for aesthetic clinic clients

```mermaid
flowchart TD
    A[Client Profile] --> B{Marketing Consent}
    B -->|Consent Given| C[Marketing Campaign Creation]
    B -->|No Consent| D[Basic Communications Only]
    
    C --> E[Content Personalization]
    E --> F[Channel Selection]
    F --> G[Message Scheduling]
    
    G --> H{Communication Type}
    H -->|Educational| I[Treatment Information]
    H -->|Promotional| J[Special Offers]
    H -->|Follow-up| K[Post-treatment Care]
    
    I --> L[Multi-channel Delivery]
    J --> L
    K --> L
    
    L --> M[Engagement Tracking]
    M --> N{Response Analysis}
    N -->|Positive| O[Conversion Tracking]
    N -->|Negative| P[Optimization]
    
    O --> Q[ROI Reporting]
    P --> R[Strategy Adjustment]
    
    D --> S[Transactional Communications]
    S --> T[Appointment Reminders]
    S --> U[Treatment Follow-ups]

    style B fill:#e3f2fd
    style H fill:#fff3e0
    style N fill:#e8f5e8
```

**Flow Steps**:

1. **Consent Management** - Granular marketing consent tracking and preference management
2. **Content Personalization** - AI-driven content customization based on treatment history
3. **Channel Optimization** - Multi-channel communication (email, SMS, WhatsApp, push)
4. **Campaign Management** - Automated campaign scheduling and execution
5. **Engagement Analytics** - Real-time tracking of client engagement and response
6. **Compliance Monitoring** - LGPD compliance monitoring for marketing communications

## Summary

This document provides a comprehensive overview of the core platform flows for NeonPro, focusing exclusively on user journeys, workflow sequences, and business process flows specific to Brazilian aesthetic clinics.

### Key Platform Flows Covered

1. **User Authentication & Authorization** - Multi-role access control with multi-council integration
2. **Patient Registration & Onboarding** - LGPD-compliant patient lifecycle management
3. **Professional Dashboard & Workflow** - Comprehensive professional interface flows
4. **Appointment Scheduling** - AI-powered scheduling with optimization
5. **Anti-No-Show Engine** - Predictive analytics for appointment retention
6. **Patient Management** - Complete patient lifecycle workflows
7. **Professional Authentication** - Multi-council license validation flows
8. **LGPD Compliance** - Automated consent and data protection workflows
9. **Treatment Planning** - Comprehensive treatment planning workflows
10. **Procedure Execution** - Step-by-step procedure documentation flows
11. **Real-time Compliance Monitoring** - Continuous regulatory compliance tracking
12. **Photo Management & Consent** - Before/after photo workflows with LGPD compliance
13. **Multi-Council Professional Validation** - CFM, COREN, CFF, CNEP integration flows
14. **Aesthetic Equipment Integration** - Device management and compliance workflows
15. **Client Marketing & Communication** - Consent-based marketing and communication flows

### Flow Integration Points

All flows are designed to work seamlessly together, with proper handoffs between:

- Patient-facing interfaces and professional dashboards
- Scheduling systems and compliance monitoring
- Authentication flows and session management
- Treatment planning and execution workflows
- Compliance monitoring and audit trail generation

### Next Steps

For implementation details, refer to:

- [System Architecture](./architecture.md) - Technical architecture and patterns
- [Technology Stack](./tech-stack.md) - Technology choices and implementation
- [Frontend Architecture](./frontend-architecture.md) - UI/UX implementation details
- [Source Tree](./source-tree.md) - Code organization and structure

---

**Focus**: Platform flows and user journeys for Brazilian aesthetic clinics\
**Compliance**: LGPD, ANVISA, CFM requirements integrated into workflows\
**Target**: Developers implementing business logic and user experience flows\
**Version**: 4.0.0 - Optimized for platform flows only
