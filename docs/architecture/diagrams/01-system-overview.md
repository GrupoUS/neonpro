# 🏥 NeonPro Healthcare Platform - System Overview

## 📊 C4 Level 1: System Context Diagram

```mermaid
C4Context
  title NeonPro Healthcare Platform - System Context

  Person(patient, "Patient", "Healthcare service recipient")
  Person(provider, "Healthcare Provider", "Licensed medical professional (CRM, CRF, etc.)")
  Person(admin, "Clinic Administrator", "Manages clinic operations and staff")
  Person(manager, "Clinic Manager", "Oversees daily clinic operations")

  System(neonpro, "NeonPro Healthcare Platform", "Complete healthcare management system for multi-professional aesthetic clinics")

  System_Ext(anvisa, "ANVISA Systems", "Brazilian health surveillance agency APIs")
  System_Ext(crm_apis, "CRM/CRF APIs", "Professional license validation systems")
  System_Ext(sus, "SUS Integration", "Brazilian public health system")
  System_Ext(payment, "Payment Gateway", "Healthcare payment processing")
  System_Ext(sms, "SMS Provider", "Patient notifications and alerts")
  System_Ext(email, "Email Service", "Communication and reporting")

  Rel(patient, neonpro, "Books appointments, views treatments", "HTTPS/Web")
  Rel(provider, neonpro, "Manages patients, records treatments", "HTTPS/Web")
  Rel(admin, neonpro, "Configures clinic settings, manages users", "HTTPS/Web")
  Rel(manager, neonpro, "Reviews reports, manages operations", "HTTPS/Web")

  Rel(neonpro, anvisa, "Compliance reporting", "HTTPS/APIs")
  Rel(neonpro, crm_apis, "License validation", "HTTPS/APIs")
  Rel(neonpro, sus, "Patient data synchronization", "HTTPS/APIs")
  Rel(neonpro, payment, "Process payments", "HTTPS/APIs")
  Rel(neonpro, sms, "Send notifications", "HTTPS/APIs")
  Rel(neonpro, email, "Send reports and communications", "HTTPS/APIs")

  UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="2")
```

## 🏗️ C4 Level 2: Container Diagram

```mermaid
C4Container
  title NeonPro Healthcare Platform - Container Diagram

  Person(users, "Healthcare Users", "Patients, Providers, Administrators")
  
  Container_Boundary(neonpro, "NeonPro Healthcare Platform") {
    Container(web_app, "Web Application", "Next.js 15 + React 19", "Healthcare management interface with LGPD compliance")
    Container(api, "Healthcare API", "Hono.dev + Edge Functions", "RESTful APIs with Brazilian healthcare compliance")
    Container(database, "Healthcare Database", "PostgreSQL + Supabase", "Patient data with RLS and audit trails")
    Container(auth, "Authentication Service", "JWT + Professional Licenses", "Multi-role auth with Brazilian license validation")
    Container(audit, "Audit System", "LGPD Compliance Engine", "Complete audit trails for regulatory compliance")
  }

  System_Ext(vercel, "Vercel Platform", "Deployment and hosting infrastructure")
  System_Ext(supabase_service, "Supabase Services", "Database, Auth, Real-time, Edge Functions")
  System_Ext(external_apis, "External Healthcare APIs", "ANVISA, CRM/CRF, SUS integration")

  Rel(users, web_app, "Uses", "HTTPS")
  Rel(web_app, api, "Makes API calls", "HTTPS/JSON")
  Rel(api, database, "Reads from and writes to", "PostgreSQL Protocol")
  Rel(api, auth, "Validates tokens and licenses", "Internal API")
  Rel(api, audit, "Logs all operations", "Internal API")
  Rel(audit, database, "Stores audit logs", "PostgreSQL Protocol")

  Rel(web_app, vercel, "Deployed on", "HTTPS")
  Rel(api, vercel, "Deployed on", "Edge Functions")
  Rel(database, supabase_service, "Hosted on", "Cloud Infrastructure")
  Rel(api, external_apis, "Integrates with", "HTTPS/APIs")

  UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

## 🔄 High-Level Data Flow

```mermaid
flowchart TB
    subgraph "Client Layer"
        A[Patient Portal] 
        B[Provider Dashboard]
        C[Admin Console]
    end
    
    subgraph "Application Layer"
        D[Next.js Frontend]
        E[React 19 Components]
        F[shadcn/ui + Brazilian UI]
    end
    
    subgraph "API Layer"
        G[Hono.dev Edge Functions]
        H[Healthcare Middleware]
        I[Authentication & Authorization]
        J[LGPD Compliance Layer]
    end
    
    subgraph "Data Layer"
        K[Supabase PostgreSQL]
        L[Row Level Security RLS]
        M[Audit Trail System]
        N[Encrypted Patient Data]
    end
    
    subgraph "External Integrations"
        O[ANVISA APIs]
        P[CRM/CRF Validation]
        Q[SUS Integration]
        R[Payment Gateways]
    end

    A --> D
    B --> D  
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
    M --> N
    
    G --> O
    I --> P
    J --> Q
    G --> R

    style A fill:#e1f5fe
    style B fill:#e1f5fe
    style C fill:#e1f5fe
    style G fill:#f3e5f5
    style K fill:#e8f5e8
    style O fill:#fff3e0
    style P fill:#fff3e0
```

## 🏥 Healthcare-Specific Architecture

```mermaid
flowchart LR
    subgraph "Healthcare Roles"
        HR1[Emergency Physician]
        HR2[Healthcare Provider]
        HR3[Clinic Manager]
        HR4[Patient]
    end
    
    subgraph "Professional Licenses"
        PL1[CRM - Medicine]
        PL2[CRF - Pharmacy] 
        PL3[CREFITO - Physiotherapy]
        PL4[CRN - Nutrition]
        PL5[COREN - Nursing]
        PL6[CRO - Dentistry]
    end
    
    subgraph "Compliance Layers"
        CL1[LGPD Data Protection]
        CL2[ANVISA Health Surveillance]
        CL3[CFM Medical Ethics]
        CL4[Emergency Access Controls]
    end
    
    subgraph "Security Features"
        SF1[Field-Level Encryption]
        SF2[Audit Trail Logging]
        SF3[Emergency Bypass System]
        SF4[Professional License Validation]
        SF5[Clinic Isolation clinic_id]
    end

    HR1 --> PL1
    HR2 --> PL2
    HR2 --> PL3
    HR2 --> PL4
    HR2 --> PL5
    HR2 --> PL6
    
    HR1 --> SF3
    HR1 --> CL4
    HR2 --> SF4
    HR3 --> SF5
    
    CL1 --> SF1
    CL1 --> SF2
    CL2 --> SF4
    CL3 --> SF2

    style HR1 fill:#ffcdd2
    style CL1 fill:#c8e6c9
    style CL2 fill:#c8e6c9
    style CL3 fill:#c8e6c9
    style SF3 fill:#ffccbc
```

## 📱 Technology Stack Overview

```mermaid
flowchart TB
    subgraph "Frontend Stack"
        FS1[Next.js 15.1.0]
        FS2[React 19.1.1]
        FS3[TypeScript 5.0]
        FS4[Tailwind CSS 3.4.15]
        FS5[shadcn/ui + Radix UI]
        FS6[brazilian-healthcare-ui]
    end
    
    subgraph "Backend Stack"
        BS1[Hono.dev 4.5.8]
        BS2[Vercel Edge Functions]
        BS3[TypeScript Strict Mode]
        BS4[JWT with 'jose' library]
        BS5[Healthcare Middleware Stack]
    end
    
    subgraph "Database & Services"
        DS1[Supabase PostgreSQL]
        DS2[Prisma 5.18.0 ORM]
        DS3[Row Level Security RLS]
        DS4[Real-time Subscriptions]
        DS5[Edge Functions]
    end
    
    subgraph "Development Tools"
        DT1[Turborepo 1.13.4]
        DT2[pnpm 8.15.6]
        DT3[Oxlint + dprint]
        DT4[Vitest + Playwright]
        DT5[GitHub Actions CI/CD]
    end
    
    subgraph "AI & Analytics"
        AI1[Vercel AI SDK 5.0.23]
        AI2[OpenAI + Anthropic]
        AI3[Vercel Analytics]
        AI4[Sentry Error Tracking]
    end
    
    subgraph "Compliance & Security"
        CS1[LGPD Data Protection]
        CS2[Brazilian Healthcare APIs]
        CS3[Professional License Validation]
        CS4[Audit Trail System]
        CS5[Field-Level Encryption]
    end

    FS1 --> BS1
    BS1 --> DS1
    DS1 --> CS1
    
    FS2 --> FS5
    BS2 --> BS5
    DS2 --> DS3
    
    DT1 --> DT3
    AI1 --> AI2
    CS2 --> CS3

    style FS1 fill:#61dafb
    style BS1 fill:#ff6b6b
    style DS1 fill:#3ecf8e
    style CS1 fill:#ffd93d
    style AI1 fill:#6c5ce7
```

---

## 📋 Architecture Principles

### 🎯 Core Design Principles
- **Healthcare First**: All components designed for medical data handling
- **LGPD Compliance**: Privacy by design with comprehensive audit trails
- **Multi-Tenant**: Clinic-based isolation with `clinic_id` everywhere
- **Professional Standards**: Brazilian healthcare regulatory compliance
- **Emergency Access**: Critical patient access with proper oversight

### 🔒 Security Architecture
- **Zero Trust**: Every request validated and logged
- **Role-Based Access**: Healthcare professional license requirements
- **Field-Level Encryption**: Sensitive patient data encrypted at rest
- **Audit Everything**: Complete trails for regulatory compliance
- **Emergency Procedures**: Licensed physician emergency access

### ⚡ Performance Architecture  
- **Edge-First**: Vercel Edge Functions for global performance
- **Real-Time**: Supabase real-time for critical notifications
- **Caching**: Multi-layer caching with healthcare data sensitivity
- **Monitoring**: Comprehensive observability with Sentry + Vercel Analytics

### 🏥 Healthcare Compliance
- **ANVISA Ready**: Medical device software classification compliance
- **CRM/CFM Integration**: Professional license validation and oversight
- **SUS Compatible**: Brazilian public health system integration ready
- **Emergency Standards**: Medical emergency access protocols